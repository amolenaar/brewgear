
@use = do ->
  loaded = [ 'use' ]
  (mod) ->
    retval = null
    LiveJS?.addResource url
    if mod not in loaded
      loaded.push mod
      url = mod + '.coffee'
      jQuery.ajax
         url: url
         success: (result) ->
           console.log "use: Loading #{mod} module"
           retval = CoffeeScript.run(result)
         error: (jqXHR, textStatus, errorThrown) ->
           console.log "use: Loading of module #{mod} failed: ", textStatus
         async: false
    retval

# vim:sw=4:et:ai
