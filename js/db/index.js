const idb = require('idb');

console.log('hello from idb module');

let dbpromise = idb.open('test-db', 1, function(upgradeDb){
	let keyValStore = upgradeDb.createObjectStore('keyval');
	keyValStore.put('wolrd', 'hello');
})