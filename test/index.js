'use strict'

/* global describe */
/* global it */

require('babel/register')

var faker = require('faker')
var assert = require('assert')
var validate = require('./bpvalidator.es6')
var BPlusIndex = require('../dist/bplus-index')
var bpindex = new BPlusIndex({branchingFactor: 10})
var benchArray = []

describe('BPlusIndex', function () {
  it('should have a test property', function () {
    assert.equal(bpindex, true)
  })
})

for (let i = 0; i < 2000000; i++) {
  let key = faker.random.number({max: 999999}) + 1
  let val = faker.name.findName()

  // console.log('=========================== BEFORE INSERT ' + key)
  bpindex.insert(key, val)
  benchArray.push({key: key, val: val})

  // var errors = validate(bpindex)
  // if (errors.length > 0) {
  //   console.log('++++++++++++++++++++ BROKE AFTER ' + i + ' INSERTIONS')
  //   console.log(errors)
  //   break
  // }

}

// console.log(JSON.stringify(bpindex.dumpTree(), null, 4))

for (let i = 0; i < 2; i++) {
  var age = benchArray[faker.random.number({max: benchArray.length - 1})].key

  var result
  console.log(`FIND: ${age}`)
  console.time('find key in array ================================================')
  result = []
  for (let i = 0; i < benchArray.length; i++) {
    if (benchArray[i].key === age) {
      result.push(benchArray[i].val)
    }
  }
  console.log(result)
  console.timeEnd('find key in array ================================================')

  console.time('find key in bpindex ====================================================')
  result = bpindex.get(age)
  console.log(result)
  console.timeEnd('find key in bpindex ====================================================')
}

// console.log(bpindex.root)
