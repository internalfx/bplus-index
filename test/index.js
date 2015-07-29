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

var db = [
  { age: 46,
  name: 'Lamar Goodwin',
  phone: '817-529-2557',
  title: 'Global Usability Coordinator' },
  { age: 13,
  name: 'Elmo Hansen',
  phone: '1-632-301-4062 x8351',
  title: 'Customer Paradigm Assistant' },
  { age: 43,
  name: 'Ashton Oberbrunner',
  phone: '1-292-015-9298 x19171',
  title: 'Legacy Security Planner' },
  { age: 32,
  name: 'Ms. Kiera Hodkiewicz',
  phone: '1-742-905-8677',
  title: 'Legacy Security Planner' },
  { age: 10,
  name: 'Hilda O\'Kon',
  phone: '118.357.9132 x76245',
  title: 'Dynamic Communications Agent' },
  { age: 38,
  name: 'Leland Bahringer',
  phone: '114.754.5482 x7853',
  title: 'Internal Program Officer' },
  { age: 21,
  name: 'Axel Block',
  phone: '816-557-8326 x083',
  title: 'Forward Interactions Liason' },
  { age: 14,
  name: 'Wendy Dare',
  phone: '966.968.5997 x42838',
  title: 'Infrastructure Associate' },
  { age: 23,
  name: 'Miss Fermin Bartell',
  phone: '(003) 694-6712',
  title: 'Product Applications Designer' },
  { age: 68,
  name: 'Marquise Weimann',
  phone: '400.157.6206',
  title: 'Corporate Response Orchestrator' },
  { age: 24,
  name: 'Kaley Jones',
  phone: '1-426-266-8041',
  title: 'District Brand Producer' },
  { age: 51,
  name: 'Dr. Jess Stokes',
  phone: '1-754-630-5989 x8753',
  title: 'Chief Tactics Supervisor' },
  { age: 24,
  name: 'Durward Runolfsson',
  phone: '726.255.5565',
  title: 'Regional Configuration Planner' },
  { age: 64,
  name: 'Clemens Howell Dr.',
  phone: '1-926-168-6208',
  title: 'Global Communications Orchestrator' },
  { age: 22,
  name: 'Catherine Predovic',
  phone: '206-479-6915 x835',
  title: 'Dynamic Accountability Architect' },
  { age: 36,
  name: 'Odie Reichel',
  phone: '(695) 562-6049 x68079',
  title: 'Forward Configuration Representative' },
  { age: 32,
  name: 'Wilfredo Strosin',
  phone: '071.478.7926',
  title: 'Dynamic Web Consultant' },
  { age: 8,
  name: 'Makayla McLaughlin',
  phone: '1-667-221-6294 x87922',
  title: 'Implementation Facilitator' },
  { age: 41,
  name: 'Ardella O\'Conner',
  phone: '1-927-933-8004',
  title: 'Product Operations Supervisor' },
  { age: 8,
  name: 'Magdalen Zulauf Mr.',
  phone: '992-726-6046 x72367',
  title: 'Central Accountability Manager' },
  { age: 62,
  name: 'Santino Kuvalis',
  phone: '(297) 534-9135',
  title: 'Direct Accounts Analyst' },
  { age: 48,
  name: 'Elva Graham',
  phone: '229.798.4078 x4705',
  title: 'International Mobility Facilitator' },
  { age: 16,
  name: 'Lesley Howe',
  phone: '(829) 112-7415 x2891',
  title: 'Internal Response Agent' },
  { age: 49,
  name: 'Antonio Monahan Mr.',
  phone: '(682) 162-2301',
  title: 'Integration Technician' },
  { age: 69,
  name: 'Shana Lubowitz',
  phone: '849-809-2691 x787',
  title: 'Internal Division Liason' },

  { age: 1,
  name: 'Serena Bruen',
  phone: '1-070-021-2968',
  title: 'Senior Detector Agent' },
  { age: 1,
  name: 'Clemmie Powlowski',
  phone: '1-796-310-8197 x253',
  title: 'Senior Detector Agent' },
  { age: 2,
  name: 'Albertha Simonis Ms.',
  phone: '1-421-993-2782 x073',
  title: 'Senior Fax Administrator' },
  { age: 4,
  name: 'Kavon Hammes',
  phone: '(913) 113-1961 x68847',
  title: 'Senior Identity Engineer' },
  { age: 5,
  name: 'Kyle MacGyver',
  phone: '333-464-6778 x7218',
  title: 'Senior Klingon Consultant' }
]

var recCount = 500
var randomDb = []
console.log('Creating database of ' + recCount + ' records.')
console.time('Done!')
for (let i = 0; i < recCount; i++) {
  let rec = {
    age: faker.random.number({max: 70}),
    name: faker.name.findName(),
    phone: faker.phone.phoneNumber(),
    title: faker.name.jobTitle()
  }
  randomDb.push(rec)
}
console.timeEnd('Done!')

describe('BPlusIndex', function () {

  describe('Numeric key indexes', function () {
    var bpindex = new BPlusIndex({debug: false, branchingFactor: 5})

    it(`should have a valid structure after every inject`, function () {
      var errors = []

      for (let rec of db) {
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

    it(`should correctly lookup keys`, function () {
      assert.deepEqual(bpindex.get(13), ['Elmo Hansen'])
      assert.deepEqual(bpindex.get(64), ['Clemens Howell Dr.'])
      assert.sameMembers(bpindex.get(8), ['Makayla McLaughlin', 'Magdalen Zulauf Mr.'])
      assert.deepEqual(bpindex.get(99), [])
    })

    it(`should correctly lookup ranges sorted asc`, function () {
      assert.deepEqual(
        bpindex.getRange(1, 5, {lowerInclusive: true, upperInclusive: false, sortDescending: false}),
        ['Clemmie Powlowski', 'Serena Bruen', 'Albertha Simonis Ms.', 'Kavon Hammes']
      )
      assert.deepEqual(
        bpindex.getRange(1, 5, {lowerInclusive: true, upperInclusive: true, sortDescending: false}),
        ['Clemmie Powlowski', 'Serena Bruen', 'Albertha Simonis Ms.', 'Kavon Hammes', 'Kyle MacGyver']
      )
      assert.deepEqual(
        bpindex.getRange(1, 5, {lowerInclusive: false, upperInclusive: true, sortDescending: false}),
        ['Albertha Simonis Ms.', 'Kavon Hammes', 'Kyle MacGyver']
      )
      assert.deepEqual(
        bpindex.getRange(1, 5, {lowerInclusive: false, upperInclusive: false, sortDescending: false}),
        ['Albertha Simonis Ms.', 'Kavon Hammes']
      )
    })

    it(`should correctly lookup ranges sorted desc`, function () {
      assert.deepEqual(
        bpindex.getRange(1, 5, {lowerInclusive: true, upperInclusive: false, sortDescending: true}),
        ['Kavon Hammes', 'Albertha Simonis Ms.', 'Serena Bruen', 'Clemmie Powlowski']
      )
      assert.deepEqual(
        bpindex.getRange(1, 5, {lowerInclusive: true, upperInclusive: true, sortDescending: true}),
        ['Kyle MacGyver', 'Kavon Hammes', 'Albertha Simonis Ms.', 'Serena Bruen', 'Clemmie Powlowski']
      )
      assert.deepEqual(
        bpindex.getRange(1, 5, {lowerInclusive: false, upperInclusive: true, sortDescending: true}),
        ['Kyle MacGyver', 'Kavon Hammes', 'Albertha Simonis Ms.']
      )
      assert.deepEqual(
        bpindex.getRange(1, 5, {lowerInclusive: false, upperInclusive: false, sortDescending: true}),
        ['Kavon Hammes', 'Albertha Simonis Ms.']
      )
    })

    it(`should correctly return the entire index sorted asc`, function () {
      assert.deepEqual(
        bpindex.getAll(),
        [ 'Clemmie Powlowski',
        'Serena Bruen',
        'Albertha Simonis Ms.',
        'Kavon Hammes',
        'Kyle MacGyver',
        'Magdalen Zulauf Mr.',
        'Makayla McLaughlin',
        'Hilda O\'Kon',
        'Elmo Hansen',
        'Wendy Dare',
        'Lesley Howe',
        'Axel Block',
        'Catherine Predovic',
        'Miss Fermin Bartell',
        'Durward Runolfsson',
        'Kaley Jones',
        'Ms. Kiera Hodkiewicz',
        'Wilfredo Strosin',
        'Odie Reichel',
        'Leland Bahringer',
        'Ardella O\'Conner',
        'Ashton Oberbrunner',
        'Lamar Goodwin',
        'Elva Graham',
        'Antonio Monahan Mr.',
        'Dr. Jess Stokes',
        'Santino Kuvalis',
        'Clemens Howell Dr.',
        'Marquise Weimann',
        'Shana Lubowitz' ]
      )
    })

    it(`should correctly return the entire index sorted desc`, function () {
      assert.deepEqual(
        bpindex.getAll({sortDescending: true}),
        [ 'Shana Lubowitz',
        'Marquise Weimann',
        'Clemens Howell Dr.',
        'Santino Kuvalis',
        'Dr. Jess Stokes',
        'Antonio Monahan Mr.',
        'Elva Graham',
        'Lamar Goodwin',
        'Ashton Oberbrunner',
        'Ardella O\'Conner',
        'Leland Bahringer',
        'Odie Reichel',
        'Wilfredo Strosin',
        'Ms. Kiera Hodkiewicz',
        'Kaley Jones',
        'Durward Runolfsson',
        'Miss Fermin Bartell',
        'Catherine Predovic',
        'Axel Block',
        'Lesley Howe',
        'Wendy Dare',
        'Elmo Hansen',
        'Hilda O\'Kon',
        'Makayla McLaughlin',
        'Magdalen Zulauf Mr.',
        'Kyle MacGyver',
        'Kavon Hammes',
        'Albertha Simonis Ms.',
        'Serena Bruen',
        'Clemmie Powlowski' ]
      )
    })

    it(`should have a valid structure after every eject`, function () {
      var errors = []

      for (let rec of db) {
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

    it(`should be empty after ejecting all previously injected records`, function () {
      assert.lengthOf(bpindex.root.children, 0, 'Errors array is not empty')
      assert.lengthOf(bpindex.root.values, 0, 'Errors array is not empty')
    })
  })

  describe('String key indexes', function () {
    var bpindex = new BPlusIndex({debug: false, branchingFactor: 5})

    it(`should have a valid structure after every inject`, function () {
      var errors = []

      for (let rec of db) {
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

    it(`should correctly lookup keys`, function () {
      assert.deepEqual(bpindex.get('Legacy Security Planner'), ['Ashton Oberbrunner', 'Ms. Kiera Hodkiewicz'])
      assert.deepEqual(bpindex.get('Dynamic Communications Agent'), ['Hilda O\'Kon'])
      assert.deepEqual(bpindex.get('A job nobody has'), [])
    })

    it(`should correctly lookup ranges sorted asc`, function () {
      assert.deepEqual(
        bpindex.getRange('Senior Detector Agent', 'Senior Klingon Consultant', {lowerInclusive: true, upperInclusive: false, sortDescending: false}),
        ['Clemmie Powlowski', 'Serena Bruen', 'Albertha Simonis Ms.', 'Kavon Hammes']
      )
      assert.deepEqual(
        bpindex.getRange('Senior Detector Agent', 'Senior Klingon Consultant', {lowerInclusive: true, upperInclusive: true, sortDescending: false}),
        ['Clemmie Powlowski', 'Serena Bruen', 'Albertha Simonis Ms.', 'Kavon Hammes', 'Kyle MacGyver']
      )
      assert.deepEqual(
        bpindex.getRange('Senior Detector Agent', 'Senior Klingon Consultant', {lowerInclusive: false, upperInclusive: true, sortDescending: false}),
        ['Albertha Simonis Ms.', 'Kavon Hammes', 'Kyle MacGyver']
      )
      assert.deepEqual(
        bpindex.getRange('Senior Detector Agent', 'Senior Klingon Consultant', {lowerInclusive: false, upperInclusive: false, sortDescending: false}),
        ['Albertha Simonis Ms.', 'Kavon Hammes']
      )
    })

    it(`should correctly lookup ranges sorted desc`, function () {
      assert.deepEqual(
        bpindex.getRange('Senior Detector Agent', 'Senior Klingon Consultant', {lowerInclusive: true, upperInclusive: false, sortDescending: true}),
        ['Kavon Hammes', 'Albertha Simonis Ms.', 'Serena Bruen', 'Clemmie Powlowski']
      )
      assert.deepEqual(
        bpindex.getRange('Senior Detector Agent', 'Senior Klingon Consultant', {lowerInclusive: true, upperInclusive: true, sortDescending: true}),
        ['Kyle MacGyver', 'Kavon Hammes', 'Albertha Simonis Ms.', 'Serena Bruen', 'Clemmie Powlowski']
      )
      assert.deepEqual(
        bpindex.getRange('Senior Detector Agent', 'Senior Klingon Consultant', {lowerInclusive: false, upperInclusive: true, sortDescending: true}),
        ['Kyle MacGyver', 'Kavon Hammes', 'Albertha Simonis Ms.']
      )
      assert.deepEqual(
        bpindex.getRange('Senior Detector Agent', 'Senior Klingon Consultant', {lowerInclusive: false, upperInclusive: false, sortDescending: true}),
        ['Kavon Hammes', 'Albertha Simonis Ms.']
      )
    })

    it(`should correctly return the entire index sorted asc`, function () {
      assert.deepEqual(
        bpindex.getAll(),
        [ 'Magdalen Zulauf Mr.',
        'Dr. Jess Stokes',
        'Marquise Weimann',
        'Elmo Hansen',
        'Santino Kuvalis',
        'Kaley Jones',
        'Catherine Predovic',
        'Hilda O\'Kon',
        'Wilfredo Strosin',
        'Odie Reichel',
        'Axel Block',
        'Clemens Howell Dr.',
        'Lamar Goodwin',
        'Makayla McLaughlin',
        'Wendy Dare',
        'Antonio Monahan Mr.',
        'Shana Lubowitz',
        'Leland Bahringer',
        'Lesley Howe',
        'Elva Graham',
        'Ashton Oberbrunner',
        'Ms. Kiera Hodkiewicz',
        'Miss Fermin Bartell',
        'Ardella O\'Conner',
        'Durward Runolfsson',
        'Clemmie Powlowski',
        'Serena Bruen',
        'Albertha Simonis Ms.',
        'Kavon Hammes',
        'Kyle MacGyver' ]
      )
    })

    it(`should correctly return the entire index sorted desc`, function () {
      assert.deepEqual(
        bpindex.getAll({sortDescending: true}),
        [ 'Kyle MacGyver',
        'Kavon Hammes',
        'Albertha Simonis Ms.',
        'Serena Bruen',
        'Clemmie Powlowski',
        'Durward Runolfsson',
        'Ardella O\'Conner',
        'Miss Fermin Bartell',
        'Ms. Kiera Hodkiewicz',
        'Ashton Oberbrunner',
        'Elva Graham',
        'Lesley Howe',
        'Leland Bahringer',
        'Shana Lubowitz',
        'Antonio Monahan Mr.',
        'Wendy Dare',
        'Makayla McLaughlin',
        'Lamar Goodwin',
        'Clemens Howell Dr.',
        'Axel Block',
        'Odie Reichel',
        'Wilfredo Strosin',
        'Hilda O\'Kon',
        'Catherine Predovic',
        'Kaley Jones',
        'Santino Kuvalis',
        'Elmo Hansen',
        'Marquise Weimann',
        'Dr. Jess Stokes',
        'Magdalen Zulauf Mr.' ]
      )
    })

    it(`should have a valid structure after every eject`, function () {
      var errors = []

      for (let rec of db) {
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

    it(`should be empty after ejecting all previously injected records`, function () {
      assert.lengthOf(bpindex.root.children, 0, 'Errors array is not empty')
      assert.lengthOf(bpindex.root.values, 0, 'Errors array is not empty')
    })

  })

})
