exports = @
MeetSpine = @MeetSpine # creating shortcut so that we do not have to type exports.MeetSpine

# Making these private
validationErrorCssClass = '.field-validation-error'
fadeAwayAfter = 5 * 1000 # 5 Seconds

showError = (element, message) ->

    error = element.parent().children(validationErrorCssClass)
    error.text message
    error.hide().fadeIn 'normal', ->
        exports.setTimeout ->
            error.fadeOut 'normal'
        , fadeAwayAfter

hideError = (element) -> ($ element).parent().children(validationErrorCssClass).fadeOut()

Task = MeetSpine.Task # creating shortcut

class NewTaskController extends Spine.Controller

    @elements: { 'form': 'form' }
    @events: { 'submit form': 'create' }

    constructor: ->
        super

        @hideErrors()

        Task.bind 'error', @showErrors
        Task.bind 'create', -> $.mobile.changePage $ '#activity-sheet'

        fieldsSelector = "input, textarea, select, #{validationErrorCssClass}"
        @form.delegate fieldsSelector, 'vclick', (event) -> hideError event.currentTarget

    create: (event) ->

        event.preventDefault()

        fields = @form.serializeForm()

        if fields.deadlineAt
            # only parse the date if it is valid otherwise let the validation handles it
            deadlineAt = (Date.parse fields.deadlineAt)?.toString MeetSpine.DATE_FORMAT
            fields.deadlineAt = deadlineAt if deadlineAt?

        task = new Task fields
        task.save()

    activate: ->  ($ 'input:first', @form).focus()

    reset: ->
        @form.get(0).reset()
        @hideErrors()

    hideErrors: -> ($ validationErrorCssClass, @form).hide()

    showErrors: (task, errors) =>

        firstError = null

        for error in errors when error.name? and error.name isnt ''
            for message in error.messages when message? and message isnt ''
                fieldsSelector = "input[name=#{error.name}], 
                    textarea[name=#{error.name}], select[name=#{error.name}]"
                currentError = ($ fieldsSelector, @form).first()
                firstError = currentError unless firstError?
                showError currentError, message

        $.mobile.silentScroll firstError.parent().children(validationErrorCssClass).offset().top if firstError?

MeetSpine.NewTaskController = NewTaskController