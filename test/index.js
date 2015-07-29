'use strict'

/* global describe */
/* global it */

require('babel/register')

// var _ = require('lodash')
var assert = require('chai').assert
var faker = require('faker')
var validate = require('./bpvalidator.es6')
var BPlusIndex = require('../dist/bplus-index')
// var benchArray = []

var db = []
var recCount = 5000

console.log('Creating database of ' + recCount + ' records.')
console.time('Done!')
for (let i = 0; i < recCount; i++) {
  let rec = {
    age: faker.random.number({max: 100}),
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    title: faker.name.jobTitle()
  }
  if (i === 0) console.log(rec)
  db.push(rec)
}
console.timeEnd('Done!')

describe('BPlusIndex', function () {

  describe('Numeric key tests', function () {
    var bpindex = new BPlusIndex({debug: false, branchingFactor: 3})
    var testCount = 100

    it(`should have a valid structure after every inject (testing ${testCount} times)`, function () {
      var errors = []

      for (let i = 0; i < testCount; i++) {
        let rec = db[i]
        bpindex.inject(rec.age, rec.name)
        errors = validate(bpindex)
        if (errors.length > 0) { break }
      }

      if (errors.length > 0) {
        console.log(errors)
        console.log(JSON.stringify(bpindex.dumpTree(), null, 4))
      }

      assert.lengthOf(errors, 0, 'Errors array is not empty')
    })

    it(`should have a valid structure after every eject (testing ${testCount} times)`, function () {
      var errors = []

      for (let i = 0; i < testCount; i++) {
        let rec = db[i]
        bpindex.eject(rec.age, rec.name)
        errors = validate(bpindex)
        if (errors.length > 0) { break }
      }

      if (errors.length > 0) {
        console.log(errors)
        console.log(JSON.stringify(bpindex.dumpTree(), null, 4))
      }

      assert.lengthOf(errors, 0, 'Errors array is not empty')
    })

    it(`should be empty after equal number of injections and ejections`, function () {
      assert.lengthOf(bpindex.root.children, 0, 'Errors array is not empty')
      assert.lengthOf(bpindex.root.values, 0, 'Errors array is not empty')
    })
  })

  describe('String key tests', function () {
    var bpindex = new BPlusIndex({debug: false, branchingFactor: 9})
    var testCount = 100

    it(`should have a valid structure after every inject (testing ${testCount} times)`, function () {
      var errors = []

      for (let i = 0; i < testCount; i++) {
        let rec = db[i]
        bpindex.inject(rec.title, rec.name)
        errors = validate(bpindex)
        if (errors.length > 0) { break }
      }

      if (errors.length > 0) {
        console.log(errors)
        console.log(JSON.stringify(bpindex.dumpTree(), null, 4))
      }

      assert.lengthOf(errors, 0, 'Errors array is not empty')
    })

    it(`should have a valid structure after every eject (testing ${testCount} times)`, function () {
      var errors = []

      for (let i = 0; i < testCount; i++) {
        let rec = db[i]
        bpindex.eject(rec.title, rec.name)
        errors = validate(bpindex)
        if (errors.length > 0) { break }
      }

      if (errors.length > 0) {
        console.log(errors)
        console.log(JSON.stringify(bpindex.dumpTree(), null, 4))
      }

      assert.lengthOf(errors, 0, 'Errors array is not empty')
    })

    it(`should be empty after equal number of injections and ejections`, function () {
      assert.lengthOf(bpindex.root.children, 0, 'Errors array is not empty')
      assert.lengthOf(bpindex.root.values, 0, 'Errors array is not empty')
    })
  })
})
