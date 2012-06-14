

use 'scripts/spine/spine'
use 'scripts/model'

BrewGear.Controller ?= {}

class BaseController extends Spine.Controller

    release: =>
        @trigger 'release'
        @unbind()
    
    delegateEvent: (element, key, method) =>
        if typeof(method) is 'function'
            # Always return true from event handlers
            method = do (method) => =>
                method.apply(this, arguments)
                true
        else
            unless @[method]
                throw new Error("#{method} doesn't exist")

            method = do (method) => =>
                @[method].apply(this, arguments)
                true

        match      = key.match(@eventSplitter)
        eventName  = match[1]
        selector   = match[2]

        if selector is ''
            element.bind(eventName, method)
            @bind 'release', =>
                element.unbind eventName, method
        else
            element.delegate(selector, eventName, method)
            @bind 'release', =>
                #@log "remove delegated event #{selector}.#{eventName}"
                element.undelegate selector, eventName, method

    delegateEvents: (events) =>
        for key, method of events
            @delegateEvent @el, key, method


class BaseRecipeController extends BaseController

    constructor: ->
        super
        @delegateEvent BrewGear.Model.Recipe, ev, @refresh for ev in ['refresh', 'change']

    refresh: ->

    activate: ->
        @refresh()


class BrewGear.Controller.Recipes extends BaseRecipeController
    @elements:
        'ul': 'list'
        '#recipe-item': 'template'

    refresh: =>
        @render()

    render: =>
        model = BrewGear.Model.Recipe.all()
        @list.empty()
        @list.append (@template.tmpl recipe) for recipe in model
        @list.listview 'refresh'


class BrewGear.Controller.Recipe extends BaseRecipeController
    @elements:
        '.to-fermentables': 'fermentablesLink'
        '.to-hops': 'hopsLink'
        '.to-fermentation': 'fermentationLink'
        'input[name="batch"]': 'batch'
        'input[name="name"]': 'name'

    @events:
        'change input': 'update'
        'blur input': 'update'

    constructor: ->
        super

    refresh: =>
        @model = BrewGear.Model.Recipe.findByAttribute('batch', @id)
        @render() if @model

    update: =>
        @model.batch = @batch.val()
        @model.name = @name.val()
        @model.save()

    render: =>
        @log 'render recipe'
        @batch.val @model.batch
        @name.val @model.name
        batch = @model.batch
        @fermentablesLink.attr('href', "#/recipes/#{batch}/fermentables")
        @hopsLink.attr('href', "#/recipes/#{batch}/hops")
        @fermentationLink.attr('href', "#/recipes/#{batch}/fermentation")


class BrewGear.Controller.Fermentables extends BaseRecipeController
    @elements:
        'ul': 'list'
        '.template': 'template'
        'h3': 'name'

    constructor: (params) ->
        super

    refresh: =>
        @model = BrewGear.Model.Recipe.findByAttribute('batch', @id)
        @render() if @model

    render: =>
        @name = @model.name
        @list.empty()
        console.log ' model: ' + @model.fermentables().all()
        for i, fermentable of @model.fermentables().all()
            @list.append @template.tmpl
                name: fermentable.name
                color: fermentable.color
                amount: fermentable.amount
                hash: "#/recipes/#{@model.batch}/fermentables/#{i}"
        @list.listview 'refresh'

# vim:sw=4:et:ai
