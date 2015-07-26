(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["BPlusTree"] = factory();
	else
		root["BPlusTree"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var Leaf = __webpack_require__(1);
	var utils = __webpack_require__(2);

	var BPlusIndex = (function () {
	  function BPlusIndex() {
	    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, BPlusIndex);

	    this.bf = config.branchingFactor || 3;
	    this.root = new Leaf();
	  }

	  _createClass(BPlusIndex, [{
	    key: 'dumpTree',
	    value: function dumpTree(leaf) {
	      leaf = leaf || this.root;
	      var struct = {
	        id: leaf.id,
	        keys: leaf.keys,

	        // values: leaf.values,
	        children: []
	      };

	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = leaf.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var child = _step.value;

	          struct.children.push(this.dumpTree(child));
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator['return']) {
	            _iterator['return']();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }

	      return struct;
	    }
	  }, {
	    key: 'get',
	    value: function get(key) {
	      var leaf = this._findLeaf(key);
	      // console.log(leaf)
	      return leaf.get(key);
	    }
	  }, {
	    key: 'insert',
	    value: function insert(key, val) {
	      var leaf = this._findLeaf(key);
	      leaf.insertData(key, val);
	      // console.log(JSON.stringify(this.dumpTree(), null, 2))
	      this._splitLeaf(leaf);
	    }

	    // Private Methods
	  }, {
	    key: '_findLeaf',
	    value: function _findLeaf(key, leaf) {
	      leaf = leaf || this.root;
	      if (leaf.children.length === 0) {
	        return leaf;
	      } else {
	        for (var i = 0; i <= leaf.size(); i++) {
	          // console.log(`idx=${i} - key=${key} - leaf.keys=${leaf.keys} - leaf.id=${leaf.id}`)
	          if (key < leaf.keys[i] || i === leaf.size()) {
	            return this._findLeaf(key, leaf.children[i]);
	          }
	        }
	      }
	    }
	  }, {
	    key: '_splitLeaf',
	    value: function _splitLeaf(leaf) {
	      if (leaf.size() >= this.bf) {
	        // console.log(`SPLIT LEAF ${leaf.id}`)
	        var splitPoint = Math.floor(leaf.size() / 2);

	        var parent = leaf.parent;
	        var prev = leaf.prev;
	        var next = leaf.next;
	        var children = leaf.children;
	        var keys = leaf.keys;
	        var values = leaf.values;

	        var leftLeaf = new Leaf();
	        var rightLeaf = new Leaf();

	        if (prev != null) {
	          prev.next = leftLeaf;
	        }
	        if (next != null) {
	          next.prev = rightLeaf;
	        }

	        leftLeaf.parent = parent;
	        leftLeaf.prev = prev;
	        leftLeaf.next = rightLeaf;
	        leftLeaf.children = children.slice(0, splitPoint);
	        leftLeaf.keys = keys.slice(0, splitPoint);
	        leftLeaf.values = values.slice(0, splitPoint);

	        rightLeaf.parent = parent;
	        rightLeaf.prev = leftLeaf;
	        rightLeaf.next = next;
	        rightLeaf.children = children.slice(splitPoint);
	        rightLeaf.keys = keys.slice(splitPoint);
	        rightLeaf.values = values.slice(splitPoint);

	        if (parent === null) {
	          // If we are splitting the root
	          if (leaf.values.length > 0) {
	            parent = this.root = new Leaf();
	            parent.children = [leftLeaf, rightLeaf];
	            parent.keys = [keys[splitPoint]];
	            leftLeaf.parent = parent;
	            rightLeaf.parent = parent;
	            // console.log('SPLIT ROOT VALUES')
	            // console.log(JSON.stringify(this.dumpTree(), null, 2))
	          } else {
	              parent = this.root = new Leaf();
	              parent.children = [leftLeaf, rightLeaf];
	              parent.keys = [keys[splitPoint]];
	              leftLeaf.parent = parent;
	              leftLeaf.children = children.slice(0, splitPoint + 1);
	              var _iteratorNormalCompletion2 = true;
	              var _didIteratorError2 = false;
	              var _iteratorError2 = undefined;

	              try {
	                for (var _iterator2 = leftLeaf.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	                  var child = _step2.value;

	                  child.parent = leftLeaf;
	                }
	              } catch (err) {
	                _didIteratorError2 = true;
	                _iteratorError2 = err;
	              } finally {
	                try {
	                  if (!_iteratorNormalCompletion2 && _iterator2['return']) {
	                    _iterator2['return']();
	                  }
	                } finally {
	                  if (_didIteratorError2) {
	                    throw _iteratorError2;
	                  }
	                }
	              }

	              rightLeaf.parent = parent;
	              rightLeaf.keys = keys.slice(splitPoint + 1);
	              rightLeaf.children = children.slice(splitPoint + 1);
	              var _iteratorNormalCompletion3 = true;

	              // console.log('SPLIT ROOT NODE')
	              // console.log(JSON.stringify(this.dumpTree(), null, 2))
	              var _didIteratorError3 = false;
	              var _iteratorError3 = undefined;

	              try {
	                for (var _iterator3 = rightLeaf.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	                  var child = _step3.value;

	                  child.parent = rightLeaf;
	                }
	              } catch (err) {
	                _didIteratorError3 = true;
	                _iteratorError3 = err;
	              } finally {
	                try {
	                  if (!_iteratorNormalCompletion3 && _iterator3['return']) {
	                    _iterator3['return']();
	                  }
	                } finally {
	                  if (_didIteratorError3) {
	                    throw _iteratorError3;
	                  }
	                }
	              }
	            }
	        } else {
	            var childPos = parent.children.indexOf(leaf);
	            if (leaf.values.length > 0) {

	              utils.replaceAt(parent.keys, leftLeaf.keys[0], childPos - 1);
	              utils.replaceAt(parent.children, leftLeaf, childPos);
	              utils.insertAt(parent.keys, rightLeaf.keys[0], childPos);
	              utils.insertAt(parent.children, rightLeaf, childPos + 1);
	              // console.log('SPLIT BRANCH VALUES')
	              // console.log(JSON.stringify(this.dumpTree(), null, 2))
	              this._splitLeaf(parent);
	            } else {

	              rightLeaf.keys = keys.slice(splitPoint + 1);
	              leftLeaf.children = children.slice(0, splitPoint + 1);
	              var _iteratorNormalCompletion4 = true;
	              var _didIteratorError4 = false;
	              var _iteratorError4 = undefined;

	              try {
	                for (var _iterator4 = leftLeaf.children[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
	                  var child = _step4.value;

	                  child.parent = leftLeaf;
	                }
	              } catch (err) {
	                _didIteratorError4 = true;
	                _iteratorError4 = err;
	              } finally {
	                try {
	                  if (!_iteratorNormalCompletion4 && _iterator4['return']) {
	                    _iterator4['return']();
	                  }
	                } finally {
	                  if (_didIteratorError4) {
	                    throw _iteratorError4;
	                  }
	                }
	              }

	              rightLeaf.children = children.slice(splitPoint + 1);
	              var _iteratorNormalCompletion5 = true;

	              // utils.replaceAt(parent.keys, leftLeaf.keys[0], childPos - 1)
	              var _didIteratorError5 = false;
	              var _iteratorError5 = undefined;

	              try {
	                for (var _iterator5 = rightLeaf.children[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
	                  var child = _step5.value;

	                  child.parent = rightLeaf;
	                }
	              } catch (err) {
	                _didIteratorError5 = true;
	                _iteratorError5 = err;
	              } finally {
	                try {
	                  if (!_iteratorNormalCompletion5 && _iterator5['return']) {
	                    _iterator5['return']();
	                  }
	                } finally {
	                  if (_didIteratorError5) {
	                    throw _iteratorError5;
	                  }
	                }
	              }

	              utils.replaceAt(parent.children, leftLeaf, childPos);
	              utils.insertAt(parent.keys, keys[splitPoint], childPos);
	              utils.insertAt(parent.children, rightLeaf, childPos + 1);
	              // console.log('SPLIT BRANCH NODE')
	              // console.log(JSON.stringify(this.dumpTree(), null, 2))
	              this._splitLeaf(parent);
	            }
	          }
	      }
	    }
	  }]);

	  return BPlusIndex;
	})();

	module.exports = BPlusIndex;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var utils = __webpack_require__(2);

	var Leaf = (function () {
	  function Leaf() {
	    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, Leaf);

	    this.id = Math.random();
	    this.parent = null;
	    this.prev = null;
	    this.next = null;
	    this.children = [];
	    this.keys = [];
	    this.values = [];
	  }

	  _createClass(Leaf, [{
	    key: 'insertData',
	    value: function insertData(key, val) {
	      var location = utils.binarySearch(this.keys, key);
	      if (location.found) {
	        this.values[location.index].push(val);
	      } else {
	        utils.insertAt(this.keys, key, location.index);
	        utils.insertAt(this.values, [val], location.index);
	      }
	    }
	  }, {
	    key: 'get',
	    value: function get(key) {
	      var location = utils.binarySearch(this.keys, key).index;
	      return this.values[location];
	    }
	  }, {
	    key: 'size',
	    value: function size() {
	      return this.keys.length;
	    }
	  }]);

	  return Leaf;
	})();

	module.exports = Leaf;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var utils = {

	  defaultSort: function defaultSort(a, b) {
	    return a < b ? -1 : a > b ? 1 : 0;
	  },

	  sortedInsert: function sortedInsert(key, array) {
	    array.splice(utils.insertionPoint(key, array) + 1, 0, key);
	    return array;
	  },

	  insertAt: function insertAt(array, value, index) {
	    array.splice(index, 0, value);
	    return array;
	  },

	  replaceAt: function replaceAt(array, value, index) {
	    array[index] = value;
	    return array;
	  },

	  insertionPoint: function insertionPoint(array, value, start, end) {
	    start = start || 0;
	    end = end || array.length;
	    var pivot = parseInt(start + (end - start) / 2, 10);
	    if (end - start <= 1 || array[pivot] === value) {
	      return pivot;
	    }
	    if (array[pivot] < value) {
	      return utils.insertionPoint(value, array, pivot, end);
	    } else {
	      return utils.insertionPoint(value, array, start, pivot);
	    }
	  },

	  binarySearch: function binarySearch(array, value) {
	    var userFunc = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

	    var lo = 0;
	    var hi = array.length;
	    var compared;
	    var mid;
	    var func = userFunc || utils.defaultSort;

	    while (lo < hi) {
	      mid = (lo + hi) / 2 | 0;
	      compared = func(value, array[mid]);
	      if (compared === 0) {
	        return {
	          found: true,
	          index: mid
	        };
	      } else if (compared < 0) {
	        hi = mid;
	      } else {
	        lo = mid + 1;
	      }
	    }
	    return {
	      found: false,
	      index: hi
	    };
	  }

	};

	module.exports = utils;

/***/ }
/******/ ])
});
;