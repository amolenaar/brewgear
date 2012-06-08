Spine = require('spine')

Model = {}


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

# Export model:

module.exports =
    Recipe: Recipe
    Fermentable: Fermentable
    FermentableResource: FermentableResource

# vim:sw=4:et:ai
