
connect = require 'connect'
union = require 'union'
path = require 'path'
fs = require 'fs'
#router = require 'router'
director = require('director')

FERMENTABLES = ''

fs.readFile 'db/fermentables.json', (err, data) ->
  if err then throw err
  FERMENTABLES = data


router = new director.http.Router
    '/fermentables':
        get: ->
            @res.writeHead 200,
                'Content-Type': 'application/json'
            @res.end FERMENTABLES
    '/recipes/:id':
        get: (id) ->
            console.log "get recipe id: #{id}"
        put: (id) ->
            console.log "post recipe id: #{id}"
            console.log @req.body
    '/recipes':
        get: ->
            console.log "get all recipes", arguments
            first = false
            @res.writeHead 200,
                'Content-Type': 'application/json'
            fs.readdir "recipes", (err, files) =>
                @res.write "["
                for f in files
                    if first then @res.write ", "
                    first = true
                    data = fs.readFileSync "recipes/#{f}"
                    @res.write data
                @res.end "]"
        post: ->
            @res.writeHead 200
            console.log "posting data #{@req.body}"
            @res.end

.configure
    strict: false

server = union.createServer
  buffer: false
  before: [
    connect.favicon()
    connect.logger('dev')
    connect.static('public')
    (req, res) ->
      found = router.dispatch req, res
      if !found
        res.emit 'next'
  ]

server.listen 3000


# vim:sw=4:et:ai
