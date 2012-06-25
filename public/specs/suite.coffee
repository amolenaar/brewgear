console.log 'Loading suite'


describe 'When starting a test', ->
  it 'should have a working, running environment', ->
    expect($.mobile).toBeDefined()
    expect(BrewGear?.Model).toBeDefined()
    expect(BrewGear?.Controller).toBeDefined()

# And now for the real specs
use 'specs/context.spec'
use 'specs/recipe.spec'
use 'specs/grist.spec'
