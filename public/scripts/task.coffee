MeetSpine = @MeetSpine

MeetSpine.DATE_FORMAT = DATE_FORMAT = 'yyyy-MM-dd'

DATE_EXPRESSION = ///^\d{4}[-]\d{2}[-]\d{2}$///

class Task extends Spine.Model
    @configure 'Task', 'name', 'planned', 'notes', 'estimation', 'createdAt', 'deadlineAt', 'completedAt'

    # Default values
    createdAt: Date.today().toString DATE_FORMAT
    planned: true

    validate: ->

        errors = []

        addError = (name, message) ->
            error = { name: name, messages: [] }
            error.messages.push message
            errors.push error

        addError 'name', 'Name cannot be blank.' unless @name

        if @estimation
            estimation = parseInt @estimation, 10
            if (isNaN estimation) or estimation < 1
                addError 'estimation', 'Estimation must be a positive integer.'

        if @deadlineAt
            if DATE_EXPRESSION.test @deadlineAt
                if ((Date.parse @deadlineAt, DATE_FORMAT).compareTo Date.today()) < 0
                    addError 'deadlineAt', 'Deadline cannot be in past date.' 
            else
                addError 'deadlineAt', "Unable to recognize the date format."

        errors if errors.length

Task.extend Spine.Model.Local
MeetSpine.Task = Task