

use 'scripts/spine/spine'
use 'scripts/model'

BrewGear.Controller ?= {}

class BaseController extends Spine.Controller

    constructor: ->
        @_boundEvents = []
        @_delegatedEvents = []
        super

    delegateEvents: (events) =>
        for key, method of events

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
                @el.bind(eventName, method)
                @_boundEvents.push [eventName, method]
            else
                @el.delegate(selector, eventName, method)
                @_delegatedEvents.push [selector, eventName, method]


    unbindEvents: =>
        @el.unbind args[0], args[1] for args in @_boundEvents
        @el.undelegate args[0], args[1], args[2] for args in @_delegatedEvents
    
    deactivate: ->
        @unbindEvents()


class BrewGear.Controller.Recipes extends BaseController
    @elements:
        'ul': 'list'
        '#recipe-item': 'template'

    activate: ->
        BrewGear.Model.Recipe.bind 'refresh change', @render

    deactivate: ->
        super
        BrewGear.Model.Recipe.unbind ev, @render for ev in ['refresh', 'change']

    render: =>
        model = BrewGear.Model.Recipe.all()
        @list.empty()
        @list.append (@template.tmpl recipe) for recipe in model
        @list.listview 'refresh' 


class BrewGear.Controller.Recipe extends BaseController
    @elements:
        '.to-fermentables': 'fermentablesLink'
        '.to-hops': 'hopsLink'
        '.to-fermentation': 'fermentationLink'
        'input[name="batch"]': 'batch'
        'input[name="name"]': 'name'

    @events:
        'change input': 'update'
        'blur input': 'update'

    constructor: (options) ->
        super
        @model = BrewGear.Model.Recipe.findByAttribute('batch', options.id)

    update: =>
        @model.batch = @batch.val()
        @model.name = @name.val()
        @model.save()

    render: =>
        @batch.val @model.batch
        @name.val @model.name
        batch = @model.batch
        @fermentablesLink.attr('href', "#/recipes/#{batch}/fermentables")
        @hopsLink.attr('href', "#/recipes/#{batch}/hops")
        @fermentationLink.attr('href', "#/recipes/#{batch}/fermentation")



class BrewGear.Controller.Fermentables extends BaseController
    @elements:
        'ul': 'list'
        '.template': 'template'
        'h3': 'name'

    constructor: (params) ->
        super
        @model = BrewGear.Model.Recipe.findByAttribute('batch', params.id)

    render: =>
        @name = @model.name
        @list.empty()
        console.log ' model: ' + @model.fermentables()
        for i, fermentable of @model.fermentables()
            @list.append @template.tmpl
                name: fermentable.name
                color: fermentable.color
                amount: fermentable.amount
                hash: "#/recipes/#{@model.batch}/fermentables/#{i}"
        @list.listview 'refresh'

# vim:sw=4:et:ai
