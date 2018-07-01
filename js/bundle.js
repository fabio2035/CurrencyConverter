(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const idb = require('idb');
window.onload = registerSW();
	
function registerSW() {
	
	if(!navigator.serviceWorker) return;
	
  // TODO: register service worker
  	navigator.serviceWorker.register('/sw.js').then(function() {
    // Registration was successful
    console.log('ServiceWorker registration successful with scope: ');
	openDatabase();
}).catch(function() {
    // registration failed :(
    	console.log('ServiceWorker registration failed!');
    });
  
};

let dbpromise = '';

function openDatabase(){
	
	console.log('hello from idb module');
	
	dbpromise = idb.open('test-db', 1, function(upgradeDb){
	let store = upgradeDb.createObjectStore('currencies');
})
}
module.exports = { 
	insertDB: function setDB(symbol, rate){
	
	console.log(JSON.stringify(rate));
	
	dbpromise.then(function(db){
		
		if(!db) return;
		
		//get reference for database insertion...
		let tx = db.transaction('currencies', 'readwrite');
		let store = tx.objectStore('currencies');
		
		store.add(rate, symbol);
		return tx.complete;
	});
	},
	readDB: function getDB(symbol, userinput){
	
	return	dbpromise.then(function(db){
		
		if(!db) return;
		
		//get reference for database reading...
		let tx = db.transaction('currencies', 'readonly');
		let store = tx.objectStore('currencies');
		let res = store.get(symbol);
		return store.get(symbol);
	}).then(function(val){
		let result_ = document.getElementById('result');
		console.log(val);
		if(val === 'undefined' ){
		result_.value = 'no offline values!';
		}else{
		result_.value = val*userinput;	
		}
		});
	}
}

},{"idb":3}],2:[function(require,module,exports){
let dbref = require('./IndexController');
window.onload = populateSelect();


let from_ = document.getElementById('select_from');
let to_ = document.getElementById('select_to');

document.getElementById('btn_getcur').addEventListener('click', getCurrencies, false);

function populateSelect(){
	
	let getJSON = function(url, callback){
	
	let xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.onload = function(){
		let status = xhr.status;
		if(status === 200){
			callback(null, xhr.response);
		} else{
			callback(status, xhr.response);
		}
	};
	xhr.send();
};
	
	const urlAdress = "https://free.currencyconverterapi.com/api/v5/countries";
	
	getJSON(urlAdress,
	function(err, data){
		if(err !== null){
			console.log('something went wrong: ' + err);
		} else {
			jsonIterate(data);
		}
	});
	
}

function jsonIterate(myObj){
		
	Object.keys(myObj.results).forEach(function (key){
		let cfx = myObj.results[key].currencyId;
				let option=document.createElement('option');
				option.value = cfx;
				option.text = cfx;
				from_.appendChild(option);
			});
			
	Object.keys(myObj.results).forEach(function (key){
		let cfx = myObj.results[key].currencyId;
				let option=document.createElement('option');
				option.value = cfx;
				option.text = cfx;
				to_.appendChild(option);
			});
			
}


function getCurrencies(){
	
	
	const userinput_ = document.getElementById('user_input').value;
	let result_ = document.getElementById('result');
	
	let getJSON = function(url, callback){
	
	let xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'json';
	xhr.onload = function(){
		let status = xhr.status;
		if(status === 200){
			callback(null, xhr.response);
		} else{
			callback(status, xhr.response);
		}
	};
	xhr.send();
	};
	
	let from_sel = from_.options[from_.selectedIndex].value;
	let to_sel = to_.options[to_.selectedIndex].value;
	const conv = from_sel + '_' + to_sel;
	
	if(navigator.onLine){
	
	const urlAdress = 'https://free.currencyconverterapi.com/api/v5/convert?q=' + conv + '&compact=y';
	console.log(urlAdress);
	getJSON(urlAdress,
	function(err, data){
		if(err !== null){
			console.log('button func error: ' + err);
		} else {
			//show the rate...
			const res = data[conv].val*userinput_;
			result_.value = res;
			//store in database...
			const baserate = res/userinput_;
			dbref.insertDB(conv, baserate);
		}
	});
	} else{
		//Browser is offline get from indexDb
		const res = dbref.readDB(conv, userinput_);
		console.log('Result after db read: ' + res);
		//result_.value = res;	
		}	
}
},{"./IndexController":1}],3:[function(require,module,exports){
'use strict';

(function() {
  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function promisifyRequest(request) {
    return new Promise(function(resolve, reject) {
      request.onsuccess = function() {
        resolve(request.result);
      };

      request.onerror = function() {
        reject(request.error);
      };
    });
  }

  function promisifyRequestCall(obj, method, args) {
    var request;
    var p = new Promise(function(resolve, reject) {
      request = obj[method].apply(obj, args);
      promisifyRequest(request).then(resolve, reject);
    });

    p.request = request;
    return p;
  }

  function promisifyCursorRequestCall(obj, method, args) {
    var p = promisifyRequestCall(obj, method, args);
    return p.then(function(value) {
      if (!value) return;
      return new Cursor(value, p.request);
    });
  }

  function proxyProperties(ProxyClass, targetProp, properties) {
    properties.forEach(function(prop) {
      Object.defineProperty(ProxyClass.prototype, prop, {
        get: function() {
          return this[targetProp][prop];
        },
        set: function(val) {
          this[targetProp][prop] = val;
        }
      });
    });
  }

  function proxyRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function proxyMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return this[targetProp][prop].apply(this[targetProp], arguments);
      };
    });
  }

  function proxyCursorRequestMethods(ProxyClass, targetProp, Constructor, properties) {
    properties.forEach(function(prop) {
      if (!(prop in Constructor.prototype)) return;
      ProxyClass.prototype[prop] = function() {
        return promisifyCursorRequestCall(this[targetProp], prop, arguments);
      };
    });
  }

  function Index(index) {
    this._index = index;
  }

  proxyProperties(Index, '_index', [
    'name',
    'keyPath',
    'multiEntry',
    'unique'
  ]);

  proxyRequestMethods(Index, '_index', IDBIndex, [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(Index, '_index', IDBIndex, [
    'openCursor',
    'openKeyCursor'
  ]);

  function Cursor(cursor, request) {
    this._cursor = cursor;
    this._request = request;
  }

  proxyProperties(Cursor, '_cursor', [
    'direction',
    'key',
    'primaryKey',
    'value'
  ]);

  proxyRequestMethods(Cursor, '_cursor', IDBCursor, [
    'update',
    'delete'
  ]);

  // proxy 'next' methods
  ['advance', 'continue', 'continuePrimaryKey'].forEach(function(methodName) {
    if (!(methodName in IDBCursor.prototype)) return;
    Cursor.prototype[methodName] = function() {
      var cursor = this;
      var args = arguments;
      return Promise.resolve().then(function() {
        cursor._cursor[methodName].apply(cursor._cursor, args);
        return promisifyRequest(cursor._request).then(function(value) {
          if (!value) return;
          return new Cursor(value, cursor._request);
        });
      });
    };
  });

  function ObjectStore(store) {
    this._store = store;
  }

  ObjectStore.prototype.createIndex = function() {
    return new Index(this._store.createIndex.apply(this._store, arguments));
  };

  ObjectStore.prototype.index = function() {
    return new Index(this._store.index.apply(this._store, arguments));
  };

  proxyProperties(ObjectStore, '_store', [
    'name',
    'keyPath',
    'indexNames',
    'autoIncrement'
  ]);

  proxyRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'put',
    'add',
    'delete',
    'clear',
    'get',
    'getAll',
    'getKey',
    'getAllKeys',
    'count'
  ]);

  proxyCursorRequestMethods(ObjectStore, '_store', IDBObjectStore, [
    'openCursor',
    'openKeyCursor'
  ]);

  proxyMethods(ObjectStore, '_store', IDBObjectStore, [
    'deleteIndex'
  ]);

  function Transaction(idbTransaction) {
    this._tx = idbTransaction;
    this.complete = new Promise(function(resolve, reject) {
      idbTransaction.oncomplete = function() {
        resolve();
      };
      idbTransaction.onerror = function() {
        reject(idbTransaction.error);
      };
      idbTransaction.onabort = function() {
        reject(idbTransaction.error);
      };
    });
  }

  Transaction.prototype.objectStore = function() {
    return new ObjectStore(this._tx.objectStore.apply(this._tx, arguments));
  };

  proxyProperties(Transaction, '_tx', [
    'objectStoreNames',
    'mode'
  ]);

  proxyMethods(Transaction, '_tx', IDBTransaction, [
    'abort'
  ]);

  function UpgradeDB(db, oldVersion, transaction) {
    this._db = db;
    this.oldVersion = oldVersion;
    this.transaction = new Transaction(transaction);
  }

  UpgradeDB.prototype.createObjectStore = function() {
    return new ObjectStore(this._db.createObjectStore.apply(this._db, arguments));
  };

  proxyProperties(UpgradeDB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(UpgradeDB, '_db', IDBDatabase, [
    'deleteObjectStore',
    'close'
  ]);

  function DB(db) {
    this._db = db;
  }

  DB.prototype.transaction = function() {
    return new Transaction(this._db.transaction.apply(this._db, arguments));
  };

  proxyProperties(DB, '_db', [
    'name',
    'version',
    'objectStoreNames'
  ]);

  proxyMethods(DB, '_db', IDBDatabase, [
    'close'
  ]);

  // Add cursor iterators
  // TODO: remove this once browsers do the right thing with promises
  ['openCursor', 'openKeyCursor'].forEach(function(funcName) {
    [ObjectStore, Index].forEach(function(Constructor) {
      // Don't create iterateKeyCursor if openKeyCursor doesn't exist.
      if (!(funcName in Constructor.prototype)) return;

      Constructor.prototype[funcName.replace('open', 'iterate')] = function() {
        var args = toArray(arguments);
        var callback = args[args.length - 1];
        var nativeObject = this._store || this._index;
        var request = nativeObject[funcName].apply(nativeObject, args.slice(0, -1));
        request.onsuccess = function() {
          callback(request.result);
        };
      };
    });
  });

  // polyfill getAll
  [Index, ObjectStore].forEach(function(Constructor) {
    if (Constructor.prototype.getAll) return;
    Constructor.prototype.getAll = function(query, count) {
      var instance = this;
      var items = [];

      return new Promise(function(resolve) {
        instance.iterateCursor(query, function(cursor) {
          if (!cursor) {
            resolve(items);
            return;
          }
          items.push(cursor.value);

          if (count !== undefined && items.length == count) {
            resolve(items);
            return;
          }
          cursor.continue();
        });
      });
    };
  });

  var exp = {
    open: function(name, version, upgradeCallback) {
      var p = promisifyRequestCall(indexedDB, 'open', [name, version]);
      var request = p.request;

      if (request) {
        request.onupgradeneeded = function(event) {
          if (upgradeCallback) {
            upgradeCallback(new UpgradeDB(request.result, event.oldVersion, request.transaction));
          }
        };
      }

      return p.then(function(db) {
        return new DB(db);
      });
    },
    delete: function(name) {
      return promisifyRequestCall(indexedDB, 'deleteDatabase', [name]);
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = exp;
    module.exports.default = module.exports;
  }
  else {
    self.idb = exp;
  }
}());

},{}]},{},[2]);
