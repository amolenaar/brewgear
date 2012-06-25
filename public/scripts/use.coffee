
@use = do ->
  loaded = [ 'use' ]
  (mod) ->
    retval = null
    if mod not in loaded
      loaded.push mod
      url = mod + '.coffee'
      jQuery.ajax
         url: url
         success: (result) ->
           console.log "use: Loading #{mod} module"
           try
               retval = CoffeeScript.run(result)
           catch err
             console.log '** ERROR ** loading script on url', url
             console.log err
             return
           finally
             LiveJS?.addResource url
         error: (jqXHR, textStatus, errorThrown) ->
           console.log "use: Loading of module #{mod} failed: ", textStatus
         async: false
    retval

# vim:sw=4:et:ai
