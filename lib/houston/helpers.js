/**
 * Houston Utils
 * -------------------------
 * @author: Alejandro Morales <vamg008@gmail.com>
 * @license: MIT 2012 <http://ale.mit-license.org>
 * @date: 29/11/12
 */ 'use strict';

module.exports = {
  startsWith: startsWith,
  customObject: CustomObject,
  parser: parser

}

var util = require('util')

/**
 * startsWith(word<string>, thing<string>)
 * ---------------------------------------
 * A method to detect if a string starts with a specific letter.
 * E.g.
 *
 *    startsWith('alejo', 'a') //-> true
 *    startsWith('alejo', 'a|al') //-> true
 *    startsWith('alejo', 'a|al|ale')/ /-> true
 *
 */
function startsWith(word, thing){
  if (~thing.indexOf('|')) {
    var tns = thing.split('|'), tn
    while (tn = tns.shift()){
        if (word.indexOf(tn) === 0) return true
    }
    return false
  }
  return word.indexOf(thing) === 0
}

/**
 * CustomObject(defaults<object>)
 * ------------
 * This add a bunch of functionality to raw objects. E.g.
 *
 *    var co = new CustomObject({a: 1, b: 2})
 *    co['key'] = 'value'
 *    co.get('a') //-> 1
 *    co.has('a') //-> true
 *    co.delete('a')
 *    co.has('a') //-> false
 *    co.set('a', {a: co.b})
 *    co.set('ac', co.a, true) //-> co.ac now is a frezeed object
 * 
 */

function CustomObject(o, freeze){
  if (!(this instanceof CustomObject)) return new CustomObject(o, freeze)
  if (freeze) {
    Object.keys(o).forEach(function (key){
      this.set(key, o[key], true)
    }.bind(this))
  } else util._extend(this, o)
  return this
}
CustomObject.prototype = Object.create({
  get: function (key){
    return this[key] || null
  },
  has: function (key){
    return this[key] !== undefined
  },
  set: function (key, val, froze){ 
    this[key] = val
    if (froze && 'object' === typeof(key)) Object.freeze(this[key])
    return this
  },
  'delete': function (key){
    delete this[key]
    return this
  },
  extend: function (o){
    return util._extend(this, o)
  }
})


/*
 * Parser
 * Parse html file just like the underscore template extension
 * @api: private
 */

function parser(tmpl) {
  return function (vars){
    return tmpl.replace(/<%=([\w\W]+?)%>/g, function (i, match){
      match = match.trim()
      if (vars[match]) return vars[match]
      return i
    })
  }
}
