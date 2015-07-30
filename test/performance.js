'use strict'

/* global describe */
/* global it */

// require('babel/register')

var _ = require('lodash')
var assert = require('chai').assert
var faker = require('faker')
var validate = require('./lib/bpvalidator')
var BPlusIndex = require('../dist/bplus-index')
var Benchmark = require('benchmark')

// var bench = new Benchmark(fn)
var db = []
var dbSize = 5000

console.log('Creating database of ' + dbSize + ' records')
console.time('Done!')
for (let i = 0; i < dbSize; i++) {
  let rec = {
    age: faker.random.number({max: 70}),
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    title: faker.name.jobTitle()
  }
  db.push(rec)
}
console.timeEnd('Done!')

describe('BPlusIndex Performance', () => {

})
