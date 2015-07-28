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
    var bpindex = new BPlusIndex({debug: true, branchingFactor: 3})

    it('should have a valid structure after every inject (testing 50 times)', function () {
      var errors = []

      for (let i = 0; i < 8; i++) {
        let rec = db[i]
        bpindex.inject(rec.age, rec.name)
        errors = validate(bpindex)
        if (errors.length > 0) { break }
      }

      if (errors.length > 0) {
        console.log(errors)
        console.log(bpindex.dumpTree())
      }

      assert.lengthOf(errors, 0, 'Errors array is not empty')
    })

    it('should have a valid structure after every eject (testing 50 times)', function () {
      var errors = []

      for (let i = 0; i < 8; i++) {
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
  })

  describe('String key tests', function () {
    var bpindex = new BPlusIndex()

    it('should have a valid structure after every inject (testing 50 times)', function () {
      var errors = []

      for (let i = 0; i < 50; i++) {
        let rec = db[i]
        bpindex.inject(rec.title, rec.name)
        errors = validate(bpindex)
        if (errors.length > 0) { break }
      }

      if (errors.length > 0) {
        console.log(errors)
        console.log(bpindex.dumpTree())
      }

      assert.lengthOf(errors, 0, 'Errors array is not empty')
    })

    // it('should have a valid structure after every eject (testing 50 times)', function () {
    //   var errors = []
    //
    //   for (let i = 0; i < 50; i++) {
    //     let rec = db[i]
    //     bpindex.eject(rec.title, rec.name)
    //     errors = validate(bpindex)
    //     if (errors.length > 0) { break }
    //   }
    //
    //   if (errors.length > 0) {
    //     console.log(errors)
    //     console.log(JSON.stringify(bpindex.dumpTree(), null, 4))
    //   }
    //
    //   assert.lengthOf(errors, 0, 'Errors array is not empty')
    // })

    // it('should have a valid structure after ' + recCount + ' key injections', function () {
    //
    //   for (let rec of db) {
    //     bpindex.inject(rec.title, rec.name)
    //   }
    //
    //   let errors = validate(bpindex)
    //
    //   if (errors.length > 0) {
    //     console.log(errors)
    //     console.log(JSON.stringify(bpindex.dumpTree(), null, 4))
    //   }
    //
    //   assert.lengthOf(errors, 0, 'Errors array is not empty')
    // })

  })

})

// console.time('==== Load Array')
// for (let rec of db) {
//   benchArray.push(rec)
// }
// console.timeEnd('==== Load Array')
//
// console.time('==== Load BTree')
// for (let rec of db) {
//   bpindex.inject(rec.age, rec.name)
// }
// console.timeEnd('==== Load BTree')

// var errors = validate(bpindex)
// if (errors.length > 0) {
//   console.log('++++++++++++++++++++ BROKE AFTER ' + i + ' INJECTIONS')
//   console.log(errors)
//   break
// }

// console.log(JSON.stringify(bpindex.dumpTree(), null, 4))

// for (let i = 0; i < 20; i++) {
//   var age = db[faker.random.number({max: benchArray.length - 1})].age
//
//   var result
//   console.log(`FIND: ${age}`)
//   console.time('find key in array')
//   result = []
//   for (let i = 0; i < benchArray.length; i++) {
//     if (benchArray[i].age === age) {
//       result.push(benchArray[i].name)
//     }
//   }
//   console.timeEnd('find key in array')
//
//   console.time('find key in bpindex')
//   result = bpindex.get(age)
//   console.timeEnd('find key in bpindex')
// }
