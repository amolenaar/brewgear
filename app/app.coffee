require 'lib/setup'

$ = jQuery

Spine = require 'spine'

Model = require 'model'
Controller = require 'controller'


console.log 'in mainapp', Controller.Recipes, Spine.Route

class Route extends Spine.Route
    @visited = []
    # Simulate page back with a slide reverse
    @reverseEffect = false

    @changePage: (pageName, options={}) ->
        console.log "forwarding to #{pageName}"
        options.changeHash = false
        options.reverse = @reverseEffect
        $.mobile.changePage ($ pageName), options
        @visited.push(window.location.hash)
        @reverseEffect = false

    @back: ->
        # drop current page
        @visited.pop()
        if @visited
            @reverseEffect = true
            window.location.hash = @visited.pop() or ""
            #route = @change()
            #console.log route

theController = null

goTo = (controller) ->
    console.log 'starting controller', controller
    #theController?.release()
    theController = controller
    Route.changePage controller.el
    theController.render()

routes = (routes) ->
    Route.add(key, value) for key, value of routes

routes
    "/recipes/:id/fermentables": (params) ->
        goTo new Controller.Fermentables
            model: Model.Recipe.findByAttribute('batch', params.id)
            el: '#fermentables'
    "/recipes/:id": (params) ->
        goTo new Controller.Recipe
            model: Model.Recipe.findByAttribute('batch', params.id)
            el: '#recipe'
    "/": ->
        goTo new Controller.Recipes
            model: Model.Recipe.all()
            el: '#recipes'



testDataSet = ->
    r = new Model.Recipe
        batch: '1'
        name: 'My Dubble'
        fermentables: [
            new Model.Fermentable
                name: 'Pilsmount'
                color: 3
                amount: 3500
            new Model.Fermentable
                name: 'Cara 120'
                color: 120
                amount: 243
        ]
    r.save()
    r = new Model.Recipe
        batch: '2'
        name: 'My Triple'
    r.save()
    console.log Model.Recipe.all()

$ ->

    console.log 'loading the rest'
    # Init local data:
    testDataSet()
    #BrewGear.Model.Recipe.fetch()

    Route.setup()

    $('a[data-rel="back"]').click (event) ->
        event.stopPropagation()
        event.preventDefault()
        Route.back()


# vim: sw=4:et:ai
