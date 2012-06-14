
# application namespace:
BrewGear = @BrewGear = {}

$ = jQuery

use 'scripts/spine/spine'
use 'scripts/spine/route'

use 'scripts/model'
use 'scripts/controller'

# Monkey patch! We're not interested in URL changes, only the hash that changes
Spine.Route.getPath = Spine.Route.getFragment

Route = Spine.Route
#class Route extends Spine.Route
#    #@visited = []
#    # Simulate page back with a slide reverse
#    @reverseEffect = false
#
#    @changePage: (pageName, options={}) ->
##        options.changeHash = false
#        #options.reverse = @reverseEffect
##        $.mobile.changePage ($ pageName), options
#        @visited.push(window.location.hash)
#        @reverseEffect = false

theController = null

goTo = (controller) ->
    theController?.release()
    theController = controller
#    Route.changePage controller.el
    theController.activate()

routes = (routes) ->
    Route.add(key, value) for key, value of routes

routes
    "/recipes/:id/fermentables": (params) ->
        goTo new BrewGear.Controller.Fermentables
            id: params.id
            el: '#fermentables'
    "/recipes/:id": (params) ->
        goTo new BrewGear.Controller.Recipe
            id: params.id
            el: '#recipe'
    "/recipes": (params) ->
        goTo new BrewGear.Controller.Recipe
            el: '#newrecipe'
    "": ->
        goTo new BrewGear.Controller.Recipes
            el: '#recipes'

$ ->

    # Get the right amount of data
    BrewGear.Model.Recipe.fetch()
    BrewGear.Model.FermentableResource.fetch()

    Route.setup()

# vim: sw=4:et:ai
