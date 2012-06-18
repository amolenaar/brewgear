

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
                @log "remove delegated event #{selector}.#{eventName}"
                element.undelegate selector, eventName, method

    delegateEvents: (events) =>
        for key, method of events
            @delegateEvent @el, key, method


class BaseRecipeController extends BaseController

    constructor: ->
        super
        @delegateEvent BrewGear.Model.Recipe, ev, @refresh for ev in ['refresh', 'change']
        @delegateEvent @el, 'click a[data-rel="back"]', 'back'

    back: (event) =>
        event.stopPropagation()
        event.preventDefault()
        window.history.back()
        #false

    refresh: ->

    activate: (options) ->
        $.mobile.changePage @el, options
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
        'form': 'form'
        'input[name="batch"]': 'batch'
        'input[name="name"]': 'name'
        'select[name="style"]': 'style'
        'input[name="plannedOg"]': 'plannedOg'
        'input[name="plannedFg"]': 'plannedFg'

    @events:
        'change input': 'update'
        'blur input': 'update'
        'click button[type="submit"]': 'submit'

    constructor: ->
        super
        @delegateEvent BrewGear.Model.BeerStyle, ev, @renderBeerStyle for ev in ['refresh', 'change']

    activate: ->
        super

    refresh: =>
        if @id
            @model = BrewGear.Model.Recipe.findByAttribute('batch', @id)
        else
            @model = new BrewGear.Model.Recipe()
        @render() if @model

    getStyle: (style) ->
        BrewGear.Model.BeerStyle.findByAttribute('name', style)

    update: =>
        @model.updateAttributes
            id: @batch.val()
            batch: @batch.val()
            name: @name.val()
            style: @getStyle @style.val()
            plannedOg: @plannedOg.val()
            plannedFg: @plannedFg.val()

    submit: (event) =>
        event.preventDefault()
        event.stopPropagation()
        @update()
        window.history.back()
        # Delay a little and go to the details screen
        setTimeout =>
            window.location.hash = "/recipes/#{@id}"
        , 20
        false

    render: =>
        @log 'render recipe'
        @batch.val @model.batch
        @name.val @model.name
        @plannedOg.val @model.plannedOg
        @plannedFg.val @model.plannedFg
        @style.val @model.style.name
        @renderBeerStyle()
        batch = @model.batch
        @fermentablesLink.attr('href', "#/recipes/#{batch}/fermentables")
        @hopsLink.attr('href', "#/recipes/#{batch}/hops")
        @fermentationLink.attr('href', "#/recipes/#{batch}/fermentation")

    renderBeerStyle: =>
        @style.empty()
        BrewGear.Model.BeerStyle.each (style) =>
            @log "updating style option #{style.name}"
            @style.append new Option(style.name, style.name,
                style.name == @model?.style?.name,
                style.name == @model?.style?.name)
        @style.selectmenu 'refresh', true

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
        console.log ' model: ' + @model.fermentables
        for i, fermentable of @model.fermentables
            @list.append @template.tmpl
                name: fermentable.name
                color: fermentable.color
                amount: fermentable.amount
                hash: "#/recipes/#{@model.batch}/fermentables/#{i}"
        @list.listview 'refresh'

# vim:sw=4:et:ai
