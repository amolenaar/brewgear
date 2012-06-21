loadJasmine = ->
    head = ($ 'head')
    head.append('<script type="text/javascript" src="scripts/jasmine-1.2.0/jasmine.js"></script>')
    head.append('<script type="text/javascript" src="scripts/jasmine-1.2.0/jasmine-html.js"></script>')
    head.append('<script type="text/javascript" src="scripts/js/live.js"></script>')
    head.append('<link rel="stylesheet" type="text/css" href="scripts/jasmine-1.2.0/jasmine.css"/>')

startJasmine = ->
    console.log 'start testing'
    jasmineEnv = jasmine.getEnv()
    jasmineEnv.updateInterval = 1000

    htmlReporter = new jasmine.HtmlReporter()

    jasmineEnv.addReporter(htmlReporter)

    console.log jasmine, jasmineEnv, htmlReporter
    jasmineEnv.specFilter = (spec) ->
        return htmlReporter.specFilter(spec)

    console.log 'execute testing'
    jasmineEnv.execute()
    $.mobile.changePage '#HTMLReporter'

loadSpecs = ->
    use 'specs/suite'

@TestRunner = {}

TestRunner.start = ->
    console.log 'Starting TestRunner'
    loadJasmine()
    loadSpecs()
    startJasmine()

# vim:sw=4:et:ai
