var ghm = require('marked')
  , fs = require('fs')
  , path = require('path')
  , cfg = require('../../config');

function makeReturn (req) {
    var url = [].concat.apply([],req.url.split('/'));
    url.pop();
    return url.join('/');
}
ghm.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  langPrefix: 'language-',
})

function genHtml(req, post){
    return [
          '<!doctype html>'
        , '<html>'
        , '<head><meta charset="utf8" /><title>' + req.file +'</title>'
        , '<link href="' + cfg.md.css  + '" rel="stylesheet" /></head>'
        , '<body>'
        , '<header><a href="'+ makeReturn(req) +'"> parent </a></header>'
        , '<article class="markdown-body">'
        , post
        , '</article>'
        , '<p style="text-align:center"> Rendered by Houston </p>'
        , '</body></html>'
    ].join('\n')
}

function render (req, res) {
    var post
    fs.readFile(path.join(req.file), 'utf8', function(e,md){
        if (e && e.code == 'ENOENT')
            return res.error(404, 'NOT_FOUND');
        else if (e)
            return res.error(500, 'INTERNAL SERVER ERROR');
        else {
            post ='<h1> Can\'t parse this file</h1>';
            try {
                post = ghm(md || ' Can\'t parse this file');
            } catch(e){}
            res.writeHeader(200,{'Content-type':'text/html'});
            res.end(genHtml(req, post));
        }
    });
}

module.exports = render;
