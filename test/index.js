/* global describe */
/* global it */

var assert = require('assert')
var BPlusIndex = require('../dist/bplus-index')
var bpindex = new BPlusIndex()

describe('BPlusIndex', function () {
  it('should have a test property', function () {
    assert.equal(bpindex.test, true)
  })
})
