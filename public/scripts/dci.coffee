
traitMethods = [ '__super__', 'applyTo', 'revokeFrom' ]

class Trait
    @applyTo: (obj) ->
        throw new Error('applyTo(obj) requires obj') unless obj
        throw new Error('applyTo(obj) should not be applied if a role has already been applied') if obj.__RoleMethods
        applied = []
        for key, value of @ when key not in traitMethods
            throw new Error("key '#{key}' already defined on object") if obj[key]?
            obj[key] = value
            applied.push key
        obj.__RoleMethods = applied
        this

    @revokeFrom: (obj) ->
        return unless obj.__RoleMethods
        for key in obj.__RoleMethods
            delete obj[key]
        delete obj.__RoleMethods
        this


incontext = (self, mapping, func) ->
    try
        for field, role of mapping
            console.log "apply #{role} to #{field}"
            role.applyTo self[field]
        # Execute in context
        func.apply(self)
    finally
        for field, role of mapping
            role.revokeFrom self[field]

@DCI =
    Trait: Trait
    incontext: incontext
