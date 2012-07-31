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
            makeReturn(req);
            res.writeHeader(200,{'Content-type':'text/html'});
            res.write('<!doctype html>');
            res.write('<html>');
            res.write('<head><meta charset="utf8" /><title>' + req.file +'</title>');
            res.write('<link href="' + cfg.md.css  + '" rel="stylesheet" /></head>');
            res.write('<body>');
            res.write('<header><a href="'+ makeReturn(req) +'"> parent </a></header>');
            res.write('<article class="markdown-body">');
            res.write(post);
            res.write('</article>');
            res.write('<p style="text-align:center"> Rendered by Houston </p>');
            res.end('</body></html>');
            res.end();
        }
    });
}

module.exports = render;