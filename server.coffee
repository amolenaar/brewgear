
connect = require 'connect'
union = require 'union'
path = require 'path'
fs = require 'fs'
director = require 'director'

FERMENTABLES = ''
BEERSTYLES = ''

fs.readFile 'db/fermentables.json', (err, data) ->
  if err then throw err
  # Sanity check
  JSON.parse data
  FERMENTABLES = data

fs.readFile 'db/beerstyles.json', (err, data) ->
  if err then throw err
  # Sanity check
  JSON.parse data
  BEERSTYLES = data


router = new director.http.Router
    '/fermentables':
        get: ->
            @res.writeHead 200,
                'Content-Type': 'application/json'
            @res.end FERMENTABLES
    '/beerstyles':
        get: ->
            @res.writeHead 200,
                'Content-Type': 'application/json'
            @res.end BEERSTYLES
    '/recipes/:id':
        get: (id) ->
            console.log "get recipe id: #{id}"
            fs.readFile "recipes/#{id}", (err, data) =>
                if err then throw err
                @res.writeHead 200,
                    'Content-Type': 'application/json'
                @res.end data
        put: (id) ->
            console.log "post recipe id: #{id} => #{JSON.stringify @req.body}"
            @res.writeHead 200
            @res.end
    '/recipes':
        get: ->
            @res.writeHead 200,
                'Content-Type': 'application/json'
            fs.readdir "recipes", (err, files) =>
                if err then throw err
                recipes = []
                console.log "have files #{files}"
                readCount = 0
                for f in files
                    fs.readFile "recipes/#{f}", (err, data) =>
                        if err then throw err
                        console.log "recipe #{f}: #{data}"
                        recipes.push JSON.parse(data)
                        readCount += 1
                        if readCount == files.length
                            console.log "Sending out recipes: #{f} #{files[files.length - 1]} #{recipes}"
                            @res.end JSON.stringify recipes
        post: ->
            @res.writeHead 200
            console.log "new recipe => #{JSON.stringify @req.body}"
            @res.end

.configure
    strict: false

server = union.createServer
  buffer: true
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
