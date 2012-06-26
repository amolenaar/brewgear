

use 'scripts/spine/spine'
use 'scripts/model'
use 'scripts/logic'

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
    # Full featured base controller for handling forms and read-only pages alike.
    # A bunch of events are registered at creation time:
    #
    # activate(): called after construction, activate the controller by displaying it's page
    # back(): called to go back to the previous page
    # submit(): submit the form, for new instance creation
    # refresh(): the recipe model had a refresh/change. Update the screen
    #   (default is calling @render()
    # @isModified: property denoting an input has changed

    constructor: ->
        super
        @delegateEvent BrewGear.Model.Recipe, ev, @refresh for ev in ['refresh', 'change']
        @delegateEvent @el, 'click a[data-rel="back"]', 'back'
        @delegateEvent @el, 'click button[type="submit"]', 'submit'
        @delegateEvent @el, 'change input', 'setModified'
        @delegateEvent @el, 'change select', 'setModified'
        @isModified = false

    setModified: =>
        @isModified = true

    back: (event) =>
        event.stopPropagation()
        event.preventDefault()
        window.history.back()

    submit: ->
        event.preventDefault()
        event.stopPropagation()
        window.history.back()

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
        '#style': 'style'

    constructor: ->
        super
        @delegateEvent BrewGear.Model.BeerStyle, ev, @renderBeerStyle for ev in ['refresh', 'change']
        # Modify existing recipe:
        @modify = true if @id

    activate: ->
        super

    refresh: =>
        if @id
            @model = BrewGear.Model.Recipe.findByAttribute('batch', @id)
        else
            @model = new BrewGear.Model.Recipe()
        @render() if @model

    getStyle: (style) ->
        @log "find style for #{style}"
        BrewGear.Model.BeerStyle.findByAttribute('name', style)

    update: =>
        if @isModified
            form = @form.get(0)
            @model.updateAttributes
                batch: form.batch.value
                name: form.name.value
                style: @getStyle form.style.value
                plannedOg: parseFloat form.plannedOg.value
                plannedFg: parseFloat form.plannedFg.value
                targetVolume: parseFloat form.targetVolume.value
            @log "updated #{@model}"

    back: =>
        super
        @update() if @modify

    submit: (event) =>
        @update()
        super
        # Delay a little and go to the details screen
        setTimeout =>
            window.location.hash = "/recipes/#{@id}"
        , 20
        false

    render: =>
        @log 'render recipe'
        form = @form.get(0)
        form.batch.value = @model.batch or ''
        form.name.value = @model.name or ''
        form.plannedOg.value = @model.plannedOg or ''
        form.plannedFg.value = @model.plannedFg or ''
        form.targetVolume.value = @model.targetVolume or 10
        form.style.value = @model.style?.name or ''
        @renderBeerStyle()
        batch = @model.batch
        @fermentablesLink.attr('href', "#/recipes/#{batch}?fermentables")
        @hopsLink.attr('href', "#/recipes/#{batch}?hops")
        @fermentationLink.attr('href', "#/recipes/#{batch}?fermentation")

    renderBeerStyle: =>
        @style.empty()
        BrewGear.Model.BeerStyle.each (style) =>
            #@log "updating style option #{style.name}"
            @style.append new Option(style.name, style.name,
                style.name == @model?.style?.name,
                style.name == @model?.style?.name)
        @style.selectmenu 'refresh', true

class BrewGear.Controller.Fermentables extends BaseRecipeController
    @elements:
        '.new': 'newFermentableLink'
        'ul': 'list'
        '.template': 'template'
        'h3': 'name'

    refresh: =>
        @model = BrewGear.Model.Recipe.findByAttribute('batch', @id)
        @render() if @model

    render: =>
        @name = @model.name
        @list.empty()
        console.log ' model: ' + @model.fermentables
        for i, fermentable of @model.fermentables
            ctx = new BrewGear.Logic.MaltPercentage @model, fermentable
            @list.append @template.tmpl
                name: fermentable.source.name
                color: fermentable.source.ebc
                amount: Math.round fermentable.amount
                percentage: Math.round ctx.percentage()
                hash: "#/recipes/#{@model.batch}/fermentables/#{i}"
        @newFermentableLink.attr('href', "#/recipes/#{@model.batch}/fermentables")
        @list.listview 'refresh'


class BrewGear.Controller.Fermentable extends BaseRecipeController
    @elements:
        'form': 'form'
        '#source': 'source'

    constructor: ->
        super
        @delegateEvent BrewGear.Model.Fermentable, ev, @renderFermentable for ev in ['refresh', 'change']
        @modify = true if @index?

    refresh: =>
        @recipe = BrewGear.Model.Recipe.findByAttribute('batch', @id)
        @model = @recipe.fermentables[@index] if @index
        @render() if @recipe

    getMalt: (name) =>
        BrewGear.Model.Fermentable.findByAttribute('name', name)

    update: =>
        if @isModified
            form = @form.get(0)
            fermentable =
                source: @getMalt form.source.value
            console.log "new fermentable", fermentable
            ctx = new BrewGear.Logic.MaltPercentage @recipe, fermentable
            ctx.amountInPercentage form.percentage.value
            if @modify
                @recipe.fermentables[@index] = fermentable
            else
                unless @recipe.fermentables
                    @recipe.fermentables = {}
                @recipe.fermentables.push fermentable

            @log "updated #{@model}"

    back: =>
        super
        @update() if @modify

    submit: =>
        @update()
        @recipe.save()
        super

    render: =>
        @renderFermentable()
        form = @form.get(0)
        form.source.value = @model?.source.name or ''
        if @modify
            ctx = new BrewGear.Logic.MaltPercentage @recipe, @model
            form.percentage.value = ctx.percentage()
        else
            form.percentage.value = ''

    renderFermentable: =>
        @source.empty()
        BrewGear.Model.Fermentable.each (fer) =>
            @log "updating fermentable option #{fer.name}"
            @source.append new Option(fer.name, fer.name,
                fer.name == @model?.source.name,
                fer.name == @model?.source.name)
        @source.selectmenu 'refresh', true

# vim:sw=4:et:ai
