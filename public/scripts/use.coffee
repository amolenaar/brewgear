
@use = do ->
  loaded = [ 'use' ]
  (mod) ->
    retval = null
    if mod not in loaded
      loaded.push mod
      jQuery.ajax
         url: mod + '.coffee'
         success: (result) ->
           console.log "use: Loading #{mod} module"
           retval = CoffeeScript.run(result)
         error: (jqXHR, textStatus, errorThrown) ->
           console.log "use: Loading of module #{mod} failed: ", textStatus
         async: false
    retval

