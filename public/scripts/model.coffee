# The data model:

use 'scripts/spine/spine'
use 'scripts/spine/local'
use 'scripts/spine/ajax'
use 'scripts/spine/relation'

BrewGear = @BrewGear ?= {}
BrewGear.Model ?= {}


#class Fermentable extends Spine.Model
#    @configure 'Fermentable', 'name', 'color', 'amount' #, moisture, ...
#    #@belongsTo 'recipe', Recipe
#
#    validate: ->
#        unless @name
#              "name is required"

class Recipe extends Spine.Model
    @configure 'Recipe', 'name', 'batch', 'style', 'plannedOg', 'plannedFg', 'fermentables', 'hops', 'efficiency', 'targetVolume'
    #@hasMany 'fermentables', Fermentable
    @extend Spine.Model.Ajax
    @url: '/recipes'

    # Fermentables: source (Fermentable), amount, addDuring [mash, boil, ferm]
    # Hops: name, alpha%, boiltime (int, FWH, CH)

    validate: ->
        unless @name
              "name is required"
#        unless @batch
#              "batch is required"
        # todo: batch# unique

    totalAmount: ->
        _.reduce @.fermentables, ((memo, a) -> memo + a.amount), 0

    totalYield: ->
        og = @recipe.plannedOg
        vol = @recipe.targetVolume
        sg_to_brix(og) * vol * 10


# define GroupBy for elements below:

class Fermentable extends Spine.Model
    @configure 'Fermentable', 'name', 'yield', 'moisture', 'ebc', 'category', 'priming'
    @extend Spine.Model.Ajax
    @url: '/fermentables'

class BeerStyle extends Spine.Model
    @configure 'BeerStyle', 'name', 'description', 'gravity', 'alcohol', 'attenuation',
        'color', 'ibu', 'co2g', 'co2v', 'ph', 'class'
    @extend Spine.Model.Ajax
    @url: '/beerstyles'


#Recipe.hasMany 'fermentables', Fermentable
#Fermentable.belongsTo 'recipe', Recipe
#Recipe.fermentables.model = Fermentable
# Export model:
BrewGear.Model.Recipe = Recipe
BrewGear.Model.Fermentable = Fermentable
BrewGear.Model.BeerStyle = BeerStyle

# vim:sw=4:et:ai
