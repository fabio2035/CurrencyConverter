
let urlsToCache = [
'/',
'https://fonts.googleapis.com/css?family=Roboto',
'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css',
'https://free.currencyconverterapi.com/api/v5/countries',
'https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2',
'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0']


self.addEventListener('install', function(event){
	console.log(event.request);
	event.waitUntil(
	caches.open('cconverter-static-v2').then(function(cache){
		return cache.addAll(urlsToCache);
	})
	);
	
});

self.addEventListener('fetch', function(event){
	//console.log(event.request);
	event.respondWith(
		caches.match(event.request).then(function(response){
			if(response) return response;
			return fetch(event.request);
		})
	);
});