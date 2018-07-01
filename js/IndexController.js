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
