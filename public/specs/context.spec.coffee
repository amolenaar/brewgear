
use 'scripts/dci'

Trait = DCI.Trait
incontext = DCI.incontext


class HiSayer extends Trait

    @sayHi: ->
        "Hi"


class FriendlyContext

    constructor: (@obj) ->

    friendlyGreeting: ->
        incontext @,
            obj: HiSayer
        , ->
            console.log 'in context'
            "obj can say #{@obj.sayHi()}"


describe 'A role can be applied to an object', ->
    class Cls
    obj = new Cls

    it 'should apply the methods from the role', ->
        HiSayer.applyTo obj
        expect(obj.sayHi) .toBeDefined()
        expect(obj.sayHi()) .toBe 'Hi'

    it 'should remove the methods of the role', ->
        HiSayer.revokeFrom obj
        expect(obj.sayHi) .toBeUndefined()

    it 'should not override existing fields', ->
        class Cls2
            sayHi: ->
                'Bye'

        obj = new Cls2
        expect(-> HiSayer.applyTo(obj)).toThrow()
        expect(obj.sayHi()) .toBe 'Bye'
        HiSayer.revokeFrom obj

describe 'A role can be used in a Context', ->
    it 'makes organizing logic simple', ->
        obj = {}
        ctx = new FriendlyContext obj
        expect(ctx.friendlyGreeting()).toBe 'obj can say Hi'
        expect(obj.sayHi).toBeUndefined()
