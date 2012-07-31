var Houston = require('../lib/server')
var assert = require('assert')
var request = require('request')
var http = require('http')
var util = require('util')
var date = +new Date
var succeed = 0
var total = 4;
require('colors')

Houston.extend({
    fixed : date, 
    js : function (req, res){
        res.error(501, 'Invalid file')
    }
})

process.env.PORT = 0xFAB;

var server = Houston.createServer(__dirname + '/fixtures');

util.print('server should be instance of http.Server');
assert.equal(server instanceof http.Server, true)
++succeed;
util.print(' ok!\n'.bold.green);

util.print('server should response with "TEST"');
request('http://localhost:' + process.env.PORT + '/', function(err, res){
    if (err) throw err;
    assert.equal(res.body, '<h1>TEST</h1>');
    ++succeed;
    util.print(' ok!\n'.bold.green);
    util.print('server should response with "invalid file"');
    request('http://localhost:' + process.env.PORT + '/dot.js', function(err, res){
        if (err) throw err;
        assert.equal(res.statusCode, 501, 'Should response with 501')
        assert.equal(!!~res.body.search('Invalid file'), true, 'should response with failed');
        ++succeed;
        util.print(' ok!\n'.bold.green);
        util.print('server should response with content of the file');
        request('http://localhost:' + process.env.PORT + '/file.fixed', function(err, res){
            if (err) throw err;
            // Should return the file content
            assert.equal(res.body, 'file.fixed');
            ++succeed;
            util.print(' ok!\n'.bold.green);
            process.emit('end')
        });
    });
})

process.on('end', function (){
    console.log('Tests: ', total);
    console.log('passed:' ,succeed)
    try { server.close() } catch (e) {}
})
