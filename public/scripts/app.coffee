
# application namespace:
BrewGear = @BrewGear = {}

$ = jQuery

use 'scripts/spine/spine'
use 'scripts/spine/route'

use 'scripts/model'
use 'scripts/controller'

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
    theController?.deactivate?()
    theController = controller
    theController.activate?()
    Route.changePage controller.el
    theController.render()

routes = (routes) ->
    Route.add(key, value) for key, value of routes

routes
    "/recipes/:id/fermentables": (params) ->
        goTo new BrewGear.Controller.Fermentables
            model: BrewGear.Model.Recipe.findByAttribute('batch', params.id)
            el: '#fermentables'
    "/recipes/:id": (params) ->
        goTo new BrewGear.Controller.Recipe
            model: BrewGear.Model.Recipe.findByAttribute('batch', params.id)
            el: '#recipe'
    "": ->
        goTo new BrewGear.Controller.Recipes
            el: '#recipes'

$ ->

    # Init local data:
    #testDataSet()
    BrewGear.Model.Recipe.fetch()

    Route.setup()

    $('a[data-rel="back"]').click ->
        event.stopPropagation()
        event.preventDefault()
        Route.back()


# vim: sw=4:et:ai
