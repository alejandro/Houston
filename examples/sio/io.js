var io = require('socket.io');

var options = {
	path: __dirname + '/sio',
	port: 8080
};

var app = require('../lib/server').createServer(options)
  , io = io.listen(app)
  ;

var loop = 0;

io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world', date: new Date() });
  socket.on('my other event', function (data) {
  	if (loop < 50) {
  		socket.emit('news',{hello:'world',  date: new Date() });
  	} 
  	++loop;
    console.log(data);
  });
});