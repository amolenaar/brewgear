
use 'scripts/model'
use 'scripts/logic'

console.log '->', BrewGear.Logic.GristPercentage

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
        plannedOg: 1050
        targetVolume: 20
        efficiency: 0.8,
        fermentables: [
            { source:
                name: 'Pilsmout'
                moisture: 0.04
                yield: 0.80
            amount: 1230,
            percentage: 20 }
            { source:
                name: 'Munich'
                moisture: 0.04
                yield: 0.80
            amount: 0,
            percentage: 30 }
        ]
 
    it 'should allow grist to change', ->
        f = recipe.fermentables[0]
        ctx = new BrewGear.Logic.GristPercentage(recipe, f)
        expect(f.amount).toBe(1230)
        ctx.amountInPercentage(60)
        expect(f.amount).toBe(65)
        expect(recipe.fermentables[1].amount).toBe(3289)
        expect(ctx.percentage()).toBe(1)

    it 'should provide a valid result once all fermentables are adjusted correctly', ->
        f = recipe.fermentables[1]
        ctx = new BrewGear.Logic.GristPercentage recipe, f
        ctx.amountInPercentage(40)
        expect(f.amount).toBe(1342)
        expect(ctx.percentage()).toBe(40)
        ctx2 = new BrewGear.Logic.GristPercentage recipe, recipe.fermentables[0]
        expect(recipe.fermentables[0].amount).toBe(2013)
        expect(ctx2.percentage()).toBe(60)
        expect(2013 / (2013 + 1342)). toBe(0.6)

# vim:sw=4:et:ai
