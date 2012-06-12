#flatiron = require 'flatiron'
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
    '/db/fermentables':
        get: ->
            this.res.writeHead 200,
                'Content-Type': 'application/json'
            this.res.end FERMENTABLES


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
