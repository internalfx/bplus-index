# bplus-index

![npm version](https://img.shields.io/npm/v/bplus-index.svg)
![license](https://img.shields.io/dub/l/vibe-d.svg)

A JavaScript implementation of a B+tree structure.

A B+tree is very useful for fast lookups, ranges and sorting.

[![NPM](https://nodei.co/npm/bplus-index.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/bplus-index/)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

# API

## inject(key, value)

Adds a new value to the index at the given key.

| Argument | Type | Description |
| --- | --- | --- |
| Key | String or Number | The key that the value will be indexed by |
| Value | String or Number | The value stored at the given key |

## eject(key[, value])

Removes a value from the index at the given key. **If value is undefined, eject removes *all* values at the given key.**

| Argument | Type | Description |
| --- | --- | --- |
| Key | String or Number | The key where the value is stored |
| Value | String or Number | The value to be removed |

## get(key)

Retrieves all values stored at given key

| Argument | Type | Description |
| --- | --- | --- |
| Key | String or Number | The key to search for |

## getAll([options])

Gets all values from the index sorted by key.

| Argument | Type | Description |
| --- | --- | --- |
| options | object | see below |

##### options

| name | Type | Description | Default |
| --- | --- | --- | --- |
| sortDescending | Boolean | Sort values by key in descending order | `False` |


## getRange(lowerBound, upperBound[, options])

`getRange` will return all values where that value's key is in the specified range

| Argument | Type | Description |
| --- | --- | --- |
| lowerBound | String or Number | The lower boundary of the range |
| upperBound | String or Number | The upper boundary of the range |
| options | object | see below |

##### options

| name | Type | Description | Default |
| --- | --- | --- | --- |
| lowerInclusive | Boolean | Include values where the key equals `lowerBound` | `True` |
| upperInclusive | Boolean | Include values where the key equals `upperBound` | `False` |
| sortDescending | Boolean | Sort values by key in descending order | `False` |

# Running mocha tests

`npm test`

# Running performance tests

`npm install -g babel`

`babel-node performance.js`
