
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
           retval = CoffeeScript.run(result)
           LiveJS?.addResource url
         error: (jqXHR, textStatus, errorThrown) ->
           console.log "use: Loading of module #{mod} failed: ", textStatus
         async: false
    retval

