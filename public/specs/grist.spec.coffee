
use 'scripts/model'
use 'scripts/logic'

makeRecipe = (attrs) ->
    new BrewGear.Model.Recipe
        name: attrs.name or 'test'
        batch: attrs.batch or '000'
        plannedOg: attrs.plannedOg or 0
        plannedFg: attrs.plannedFg or 0
        targetVolume: attrs.targetVolume or 0
        efficiency: attrs.efficiency or 100
        fermentables: attrs.fermentables or {}
        hops: {}

describe 'Modifying the grist', ->

    recipe = makeRecipe
        plannedOg: 1.050
        targetVolume: 20
        efficiency: 0.8
        fermentables: [
            { source:
                name: 'Pilsmout'
                moisture: 0.04
                yield: 0.80
            amount: 1230 }
            { source:
                name: 'Munich'
                moisture: 0.04
                yield: 0.80
            amount: 0 }
        ]
 
    it 'should allow grist to change', ->
        f = recipe.fermentables[0]
        ctx = new BrewGear.Logic.MaltPercentage(recipe, f)
        ctx.amountInPercentage(60)
        expect(f.amount).toBeCloseTo(1940.5, 1)

    it 'should provide a valid result once all fermentables are adjusted correctly', ->
        f = recipe.fermentables[1]
        ctx = new BrewGear.Logic.MaltPercentage recipe, f
        ctx.amountInPercentage(40)
        expect(f.amount).toBeCloseTo(1293.7, 1)
        expect(1940.5 / (1940.5 + 1293.7)).toBeCloseTo(0.60)

# vim:sw=4:et:ai
