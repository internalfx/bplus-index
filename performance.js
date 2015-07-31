'use strict'

var _ = require('lodash')
var faker = require('faker')
var BPlusIndex = require('./dist/bplus-index')
var Benchmark = require('benchmark')
var colors = require('colors')
var async = require('async')
Benchmark.support.decompilation = false

var compileResult = (results) => {
  var percentage
  var text = `B+Tree ${results[0].toFixed(2)} ops/sec, Rival Method ${results[1].toFixed(2)} ops/sec\n`

  if (results[0] > results[1]) {
    percentage = ((results[0] - results[1]) / results[1]) * 100
    text += colors.green(`B+Tree is ${percentage.toFixed()}% faster`)
  } else {
    percentage = ((results[1] - results[0]) / results[1]) * 100
    text += colors.red(`B+Tree is ${percentage.toFixed()}% slower`)
  }

  return text

}

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

console.log('\n\n')
console.log('***********************')
console.log('Test B+Tree performance')
console.log('***********************')

async.series([
  (done) => {

    console.log('\n\nTesting inject(key, value)\n'.yellow)

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

    suite.on('error', (event) => {
      done(event.target.error)
    })

    suite.on('complete', () => {
      suite.forEach((obj) => {
        results.push(obj.hz)
      })
      console.log(compileResult(results))
      done()
    })

    suite.run()

  },
  (done) => {

    console.log('\n\nTesting get(key)\n'.yellow)

    var suite = new Benchmark.Suite()
    var results = []
    var bindex = new BPlusIndex({debug: false, branchingFactor: 50})
    var aindex = []
    var randKey

    for (let rec of db) {
      bindex.inject(rec.age, rec.name)
    }

    for (let rec of db) {
      aindex.push({key: rec.age, val: rec.name})
    }

    suite.add({
      name: 'tree',
      setup: () => {
        randKey = db[_.random(0, db.length)].age
      },
      fn: () => {
        bindex.get(randKey)
      }
    })

    suite.add({
      name: 'array',
      setup: () => {
        randKey = db[_.random(0, db.length)].age
      },
      fn: function () {
        _.filter(aindex, {key: randKey})
      }
    })

    suite.on('error', (event) => {
      done(event.target.error)
    })

    suite.on('complete', () => {
      suite.forEach((obj) => {
        results.push(obj.hz)
      })
      console.log(compileResult(results))
      done()
    })

    suite.run()

  },
  (done) => {

    console.log('\n\nTesting getAll({sortDescending: false})\n'.yellow)

    var suite = new Benchmark.Suite()
    var results = []
    var bindex = new BPlusIndex({debug: false, branchingFactor: 50})
    var aindex = []

    for (let rec of db) {
      bindex.inject(rec.age, rec.name)
    }

    for (let rec of db) {
      aindex.push({key: rec.age, val: rec.name})
    }

    suite.add({
      name: 'tree',
      setup: () => {
      },
      fn: () => {
        bindex.getAll({sortDescending: false})
      }
    })

    suite.add({
      name: 'array',
      setup: () => {
      },
      fn: function () {
        _.sortByOrder(aindex, ['key'], ['asc'])
      }
    })

    suite.on('error', (event) => {
      done(event.target.error)
    })

    suite.on('complete', () => {
      suite.forEach((obj) => {
        results.push(obj.hz)
      })
      console.log(compileResult(results))
      done()
    })

    suite.run()

  },
  (done) => {

    console.log('\n\nTesting getAll({sortDescending: true})\n'.yellow)

    var suite = new Benchmark.Suite()
    var results = []
    var bindex = new BPlusIndex({debug: false, branchingFactor: 50})
    var aindex = []

    for (let rec of db) {
      bindex.inject(rec.age, rec.name)
    }

    for (let rec of db) {
      aindex.push({key: rec.age, val: rec.name})
    }

    suite.add({
      name: 'tree',
      setup: () => {
      },
      fn: () => {
        bindex.getAll({sortDescending: true})
      }
    })

    suite.add({
      name: 'array',
      setup: () => {
      },
      fn: function () {
        _.sortByOrder(aindex, ['key'], ['desc'])
      }
    })

    suite.on('error', (event) => {
      done(event.target.error)
    })

    suite.on('complete', () => {
      suite.forEach((obj) => {
        results.push(obj.hz)
      })
      console.log(compileResult(results))
      done()
    })

    suite.run()

  }
])
