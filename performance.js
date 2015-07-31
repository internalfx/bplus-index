'use strict'

/* global describe */
/* global it */

// require('babel/register')

var _ = require('lodash')
var faker = require('faker')
var BPlusIndex = require('./dist/bplus-index')
var Benchmark = require('benchmark')
Benchmark.support.decompilation = false;

// var bench = new Benchmark(fn)
var db = []
var dbSize = 50000

console.log('Creating database of ' + dbSize + ' records')
console.time('Done!')
for (let i = 0; i < dbSize; i++) {
  let rec = {
    age: faker.random.number({max: 90}),
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    title: faker.name.jobTitle()
  }
  db.push(rec)
}
console.timeEnd('Done!')

var compileResult = (results) => {
  var percentage
  var text = `B+Tree ${results[0].toFixed(2)} ops/sec, Rival Method ${results[1].toFixed(2)} ops/sec\n`

  if (results[0] > results[1]) {
    percentage = ((results[0] - results[1]) / results[1]) * 100
    text += `B+Tree is ${percentage.toFixed()}% faster`
  } else {
    percentage = ((results[1] - results[0]) / results[1]) * 100
    text += `B+Tree is ${percentage.toFixed()}% slower`
  }

  return text

}

var suite = new Benchmark.Suite()
var results = []
var bindex
var aindex

suite.add({
  name: 'tree',
  setup: () => {
    bindex = new BPlusIndex({debug: false, branchingFactor: 50})
  },
  fn: () => {
    for (let rec of db) {
      bindex.inject(rec.age, rec.name)
    }
  }
})

suite.add({
  name: 'array',
  setup: () => {
    aindex = []
  },
  fn: function () {
    for (let rec of db) {
      aindex.push({key: rec.age, val: rec.name})
    }
  }
})

// suite.on('cycle', (event) => {
//   console.log(String(event.target))
// })

suite.on('error', (event) => {
  console.log(event.target.error)
})

suite.on('complete', () => {
  suite.forEach((obj) => {
    results.push(obj.hz)
  })
  console.log(results)
  console.log(compileResult(results))
  done()
})

suite.run()
