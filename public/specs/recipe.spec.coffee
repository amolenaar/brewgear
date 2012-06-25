
class RichFermentable
    # is a context
    constructor: (@recipe, @fermentable) ->
        @
describe 'A recipe', ->
    recipe = new BrewGear.Model.Recipe
        name: 'MyRecipe'
        batch: '001'
        style:
            name: 'Bitter'
        plannedOg: 1050
        plannedFG: 1010
        fermentables: [
            { source:
               name: 'Pilsmout'
            amount: 1230 }
            { source:
                name: 'Munich'
            amount: 344 }
        ]
        targetVolume: 20

    it 'should calculate a total amount', ->
        expect(recipe.totalAmount()).toBe(1230+344)

# vim:sw=4:et:ai
