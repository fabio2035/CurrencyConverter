//let dbref = require('./db');
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

	




	
	

		
