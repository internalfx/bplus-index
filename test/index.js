'use strict'

/* global describe */
/* global it */

require('babel/register')

var _ = require('lodash')
var faker = require('faker')
var assert = require('assert')
var validate = require('./bpvalidator.es6')
var BPlusIndex = require('../dist/bplus-index')
// var benchArray = []

var db = []
var recCount = 1000

console.log('Creating database of ' + recCount + ' records.')
console.time('Done!')
for (let i = 0; i < recCount; i++) {
  let rec = {
    age: faker.random.number({max: 1000}),
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    title: faker.name.jobTitle()
  }
  if (i === 0) console.log(rec)
  db.push(rec)
}
console.timeEnd('Done!')

describe('BPlusIndex', function () {
  it('should have a valid structure after every insert (testing 100 times)', function () {
    let bpindex = new BPlusIndex()
    var errors = []

    for (let rec of db) {
      bpindex.insert(rec.age, rec.name)
      errors = validate(bpindex)
      if (errors.length > 0) { break }
    }

    if (errors.length > 0) console.log(errors)

    assert.equal(errors.length, 0)
  })

  it('should have a valid structure after 1,000 numeric key inserts', function () {
    let bpindex = new BPlusIndex()

    for (let rec of db) {
      bpindex.insert(rec.age, rec.name)
    }

    let errors = validate(bpindex)

    if (errors.length > 0) console.log(errors)

    assert.equal(errors.length, 0)
  })

  it('should have a valid structure after 1,000 string key inserts', function () {
    let bpindex = new BPlusIndex()

    for (let rec of db) {
      bpindex.insert(rec.title, rec.name)
    }

    let errors = validate(bpindex)

    if (errors.length > 0) console.log(errors)

    assert.equal(errors.length, 0)
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
//   bpindex.insert(rec.age, rec.name)
// }
// console.timeEnd('==== Load BTree')

// var errors = validate(bpindex)
// if (errors.length > 0) {
//   console.log('++++++++++++++++++++ BROKE AFTER ' + i + ' INSERTIONS')
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
