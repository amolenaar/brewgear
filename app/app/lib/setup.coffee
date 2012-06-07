require('json2ify')
require('es5-shimify')
require('jqueryify')
require('./jquery.tmpl')

# Mind the order:
require('./mobile-config')
require('./jquery.mobile')

require('spine')
require('spine/lib/local')
require('spine/lib/ajax')
require('spine/lib/route')
require('spine/lib/tmpl')
