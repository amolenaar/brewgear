$ = jQuery

$.fn.serializeForm = ->

    results = {}
    $.each ($ @).serializeArray(), (index, item) -> results[item.name] = item.value
    results