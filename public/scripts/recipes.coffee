
use 'scripts/spine/spine'

class BrewGear.Recipes extends Spine.Controller
    events:
      'click #fermentables': click

    constructor: ->
        super

    click: (event) ->
        @log 'tem clicked', event
#        $.mobile.changePage $ '#fermentables'

# vim:sw=4:et:ai
