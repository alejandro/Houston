var ghm = require('github-flavored-markdown');
var fs = require('fs');
var path = require('path');
var cfg = require('../../config');

function makeReturn (req) {
    var url = [].concat.apply([],req.url.split('/'));
    url.pop();
    return url.join('/');
}

function render (req, res) {
    // Read the post?
    fs.readFile(path.join(req.file), 'utf8', function(e,d){
        if (e && e.code == 'ENOENT'){
            return res.error(404, 'NOT_FOUND');
        } else if (e){
            return res.error(500, 'INTERNAL SERVER ERROR');
        } else {
            var post ='<h1> Can\'t parse this file</h1>';
            try {
                post = ghm.parse(d || ' Can\'t parse this file');
            } catch(e){}
            res.writeHeader(200,{'Content-type':'text/html'});
            var html = 
            '<!doctype html>' +
            '<html>' +
            '<head><meta charset="utf8" /><title>' + req.file +'</title>' +
            '<link href="' + cfg.md.css  + '" rel="stylesheet" /></head>' +
            '<body>' +
                '<header><a href="'+ makeReturn(req) +'"> parent </a></header>' +
                '<article class="markdown-body">' + post +
                '</article>' +
                '<p style="text-align:center"> Rendered by Houston </p>' +
            '</body></html>'; 
            res.end(html);
        }
    });
}

module.exports = render;
