# The data model:

use 'scripts/spine/spine'
use 'scripts/spine/local'
use 'scripts/spine/ajax'
use 'scripts/spine/relation'

BrewGear = @BrewGear ?= {}
BrewGear.Model ?= {}


class Fermentable extends Spine.Model
    @configure 'Fermentable', 'name', 'color', 'amount' #, moisture, ...
    #@belongsTo 'recipe', Recipe

    validate: ->
        unless @name
              "name is required"

class Recipe extends Spine.Model
    @configure 'Recipe', 'name', 'batch', 'fermentables', 'hops'
    #@hasMany 'fermentables', Fermentable
    @extend Spine.Model.Local

    validate: ->
        unless @name
              "name is required"
        # TODO: batch# unique


class FermentableResource extends Spine.Model
    @configure 'name', 'yield', 'moisture', 'ebc'
    @extend Spine.Model.Ajax
    @url 'fermentables.json'

    save: ->

    update: ->

    destroy: ->

#Recipe.hasMany 'fermentables', Fermentable
#Fermentable.belongsTo 'recipe', Recipe
#Recipe.fermentables.model = Fermentable
# Export model:
BrewGear.Model.Recipe = Recipe
BrewGear.Model.Fermentable = Fermentable
BrewGear.Model.FermentableResource = FermentableResource

FermentableResource.fetch()
# vim:sw=4:et:ai
