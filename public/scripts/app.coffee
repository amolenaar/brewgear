
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

theController = null

goTo = (controller) ->
    theController?.release()
    theController = controller
    theController.activate()

routes = (routes) ->
    Route.add(key, value) for key, value of routes

routes
    "/recipes/:id/hops/:index": (params) ->
        goTo new BrewGear.Controller.Hop
            id: params.id
            index: params.index
            el: '#hop'
    "/recipes/:id/hops": (params) ->
        goTo new BrewGear.Controller.Hop
            id: params.id
            el: '#newhop'
    "/recipes/:id?hops": (params) ->
        goTo new BrewGear.Controller.Hops
            id: params.id
            el: '#hops'

    "/recipes/:id/fermentables/:index": (params) ->
        console.log "Open fermentable of recipe #{params.id} index #{params.index}"
        goTo new BrewGear.Controller.Fermentable
            id: params.id
            index: params.index
            el: '#fermentable'
    "/recipes/:id/fermentables": (params) ->
        goTo new BrewGear.Controller.Fermentable
            id: params.id
            el: '#fermentable'
    "/recipes/:id?fermentables": (params) ->
        goTo new BrewGear.Controller.Fermentables
            id: params.id
            el: '#fermentables'

    "/recipes/:id": (params) ->
        console.log 'params', params
        goTo new BrewGear.Controller.Recipe
            id: params.id
            el: '#recipe'
    "/recipes": (params) ->
        goTo new BrewGear.Controller.Recipe
            el: '#newrecipe'
    "test": ->
        console.log 'start testing'
        use 'scripts/testrunner'
        TestRunner.start()
    "?spec": ->
        # Jasmine: leave it alone
    "": ->
        goTo new BrewGear.Controller.Recipes
            el: '#recipes'

$ ->

    #$.mobile.showPageLoadingMsg()

    # Get the right amount of data
    BrewGear.Model.Recipe.fetch()
    BrewGear.Model.BeerStyle.fetch()
    BrewGear.Model.Fermentable.fetch()

    Route.setup()

# vim: sw=4:et:ai
