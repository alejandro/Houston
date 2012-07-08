var qs = require('querystring');
var houston = require('../../lib/server');

var server  = houston({
	path: __dirname + '/public',
	verbose: true,
	port: 8001
})

//
// Not the fanciest method
// But it can have some use cases
//
// In the response chain this is the first method (even before parse the request)
// so it's extremely faster
// server.on('HTTPMETHOD', function (req, res));
// if spdy is enabled req.isSpdy === true;
//
server.on('POST', function (req, res){
	var body = ''
	req.on('data', function(data){
		body += data;
	});
	req.once('end', function () {
		switch (req.url) {
			case '/save':
				var data = qs.parse(body.toString('utf8'));
				// you can perform a redirect to another static file or read from disk
				// replace your stuff and buuya!
				res.end('Saved '+ data.name);
				break;
			default:
				res.statusCode = 501;
				res.end('not implemented');
				break;
		}
	})
});