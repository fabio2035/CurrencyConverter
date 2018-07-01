

module.exports = function setDB(symbol, rate){
	
	
	console.log(symbol, rate);
	
	this.dbpromise.then(function(db){
		
		if(!db) return;
		
		//get reference for database insertion...
		let tx = db.transaction('currencies', 'readwrite');
		let store = tx.objectStore('currencies');
		
		store.put({
			id: symbol,
			data: rate
		});
		return tx.complete;
	});
	
};


