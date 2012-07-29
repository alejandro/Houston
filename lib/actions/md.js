var ghm = require('github-flavored-markdown')
var fs = require('fs')
var path = require('path')
var cfg = require('../../config')

function render (file, res) {
    // Read the post?
    fs.readFile(path.join(file), 'utf8', function(e,d){
      if (e && e.code == 'ENOENT'){
        res.end('404 NOT_FOUND');
      } else if (e){
        res.end('500, INTERNAL SERVER ERROR');
      } else {
        var post ='<h1> Archivo mal formado</h1>';
        try {
          post = ghm.parse(d || '# POST NOT FOUND');
        } catch(e){}
        res.writeHeader(200,{'Content-type':'text/html'});
        res.write('<!doctype html>')
        res.write('<html>')
        res.write('<head><meta charset="utf8" /><title>' + file +'</title>')
        res.write('<link href="' + cfg.md.css  + '" rel="stylesheet" /></head>')
        res.write('<body>')
        res.write('<header><a href="/"> parent </a></header>')
        res.write('<article class="markdown-body">')
        res.write(post)
        res.write('</article>')
        res.write('<p style="text-align:center"> Rendered by Houston </p>')
        res.end('</body></html>');
        res.end();
      }
    });
} ;
module.exports = render