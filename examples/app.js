
var houston = require('../lib/server');
var server  = houston({
	path: __dirname,
	verbose: true,
	port: 8000,
	safe: true
})