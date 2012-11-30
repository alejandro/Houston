/**
 * Houston Utils
 * -------------------------
 * @author: Alejandro Morales <vamg008@gmail.com>
 * @license: MIT 2012 <http://ale.mit-license.org>
 * @date: 29/11/12
 */ 'use strict';

module.exports = {
  startsWith: startsWith,
  customObject: CustomObject
}

var util = require('util')

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

function CustomObject(defaults){
  util._extend(this, defaults)
  return this
}
CustomObject.prototype = Object.create(null)

CustomObject.prototype.get = function (key){
  return this[key] || null
}

CustomObject.prototype.has = function (key){
  return this[key] !== undefined
}
CustomObject.prototype.set = function (key, val, froze){ 
  this[key] = val
  if (froze && 'object' === typeof(key)) Object.freeze(this[key])
  return this
}
CustomObject.prototype.delete = function (key){
  delete this[key]
  return this
}

// var co = new CustomObject({a:1, b:2})
// console.log(co)
// console.log(co.delete('a'))
// console.log(co)
