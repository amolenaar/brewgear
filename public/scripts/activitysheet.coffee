MeetSpine = @MeetSpine
$ = jQuery

Task = MeetSpine.Task

class ActivitySheetController extends Spine.Controller
    @elements:
        '#list': 'list'
        '#template': 'template'

    constructor: ->
        super
        Task.bind 'refresh change', @render

    activate: ->
        $.mobile.showPageLoadingMsg()
        Task.fetch $.mobile.hidePageLoadingMsg()

    reset: ->

    renderOne: (task) -> @list.append (@template.tmpl task)

    render: =>
        @list.empty()
        @renderOne task for task in Task.all()
        @list.listview 'destroy' if @list.jqmData 'listview'
        @list.listview inset: true

MeetSpine.ActivitySheetController = ActivitySheetController