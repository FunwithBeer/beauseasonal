'use strict';

var app = {};
app.apiUrl = 'https://lcboapi.com/products';
app.locationApiUrl = 'https://lcboapi.com/stores';
app.inventoryUrl = 'https://lcboapi.com/inventories';
app.apiKey = 'MDphOGNiOTY1NC1kYjBiLTExZTUtOGMzYi0zNzJlOTg1YmY5YmI6NlZjc0FzREFrUGFNSlB0OWhnWXFBWUFKbDA0OVpPMTJRbDRi';

app.googleMapsApiUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
var idNumber;

app.getBeer = function () {
	$.ajax({
		url: app.apiUrl,
		dataType: 'json',
		method: 'GET',
		data: {
			per_page: 50,
			access_key: app.apiKey,
			q: 'Beau\'s All Natural Brewing',
			where_not: 'is_dead',
			order: 'price_in_cents.asc'
		}
	}).then(function (beerOutput) {
		// console.log(beerOutput);
		app.displayBeer(beerOutput);
		// for (item in data.result) {
		// 	// console.log(data.result[item].producer_name);
		// 	// if ((data.result[item].quantity > 0);
		// 		if ((data.result[item].primary_category === "Beer")
		// 		&& (data.result[item].producer_name === "Beau's All Natural Brewing")) {
		// 	app.allBeerData.push(data.result[item]);
		// 	app.beerProductIDs.push(data.result[item].id);
		// app.appendBeerData();
		// }
		// }
	});
};

app.displayBeer = function (beerInfo) {
	// console.log(beerInfo);
	var beerString = beerInfo.result;
	$.each(beerString, function (i, value) {
		var beerName = $('<h2>').text(value.name);
		if (value.image_url === null) {
			// console.log('null', value);
			var beerImage = $('<img>').attr('src', '/public/images/default_beer.png');
		} else {
			var beerImage = $('<img>').attr('src', value.image_url);
		};
		var packaging = $('<p>').text(value.package);
		var price = $('<p>').text('$' + value.price_in_cents / 100);
		var category = value.secondary_category;
		if (value.style !== null) {
			var style = $('<p>').text(value.style);
		} else {
			$('<p>').text('Delicious!');
		};

		if (value.tasting_note === null) {
			$('<p>').text('Description coming soon!');
		} else {
			var tastingNotes = $('<p>').text(value.tasting_note);
		};
		app.productIDs = value.id;
		var beerDetails = $('<div class="beerDetails">').append(beerName, packaging, price, style, tastingNotes);
		var radioButton = $('<input name="beer" class="radios" type=\'radio\' value="' + value.id + '" id="' + value.id + '">');
		var $userBeerSelection = $('<div class="userSelection">');
		var $label = $('<label>').addClass('labels').attr('for', value.id);
		$label.append(beerImage);
		$userBeerSelection.append(radioButton, $label, beerDetails);
		$('#beerChoice').append($userBeerSelection);
	});
};

app.getStores = function () {
	$.ajax({
		url: app.locationApiUrl,
		dataType: 'jsonp',
		method: 'GET',
		data: {
			per_page: 5,
			access_key: app.apiKey,
			lat: app.lat,
			lon: app.lng,
			order: 'distance_in_meters',
			where_not: 'is_dead',
			// only get stores that stock Beau's
			product_id: app.beerSelected
		}
	}).then(function (storeOutput) {
		console.log(storeOutput);
		$('#storeResults').empty();
		app.displayStores(storeOutput);
	});
};

app.displayStores = function (storeInfo) {
	var storeString = storeInfo.result;
	// console.log(storeString);
	$.each(storeString, function (i, storeData) {
		var storeName = $('<h2>').text(storeData.name);
		var storeId = $('<p>').text(storeData.id);
		// var storeAddress = $('<p>').text(storeData.address_line_1 + storeData.city);
		var storeAddress = $('<p>').text(storeData.address_line_1 + ', ' + storeData.city);
		var storePhone = $('<p>').text(storeData.telephone);
		var lat = storeData.latitude;
		var lng = storeData.longitude;
		var storeDetails = $('<div class="storeDetails">').append(storeName, storeAddress, storePhone);
		$('.storeResultsTitle').text('Store Results');
		$('#storeResults').append(storeDetails);

		// Google map markers
		var marker = new google.maps.Marker({
			map: map,
			position: {
				lat: storeData.latitude,
				lng: storeData.longitude
			},
			animation: google.maps.Animation.DROP
		});
		var infowindow = new google.maps.InfoWindow();
		google.maps.event.addListener(marker, 'click', function () {
			infowindow.setContent(storeData.name);
			infowindow.open(map, this);
		});
		// console.log(storeName);
		// console.log(storeAddress);
		$('#map').show();
		google.maps.event.trigger(document.getElementById('map'), 'resize');
		google.maps.event.addListenerOnce(map, 'idle', function () {
			google.maps.event.trigger(map, 'resize');
			map.setCenter({ lat: app.bandsIn2Lat, lng: app.bandsIn2Long });
		});
	});
};

var map;
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 43.7000, lng: -79.4000 },
		zoom: 12
	});
	$('#map').hide();
}

// get user location based on their current location
app.getCurrentPosition = function () {
	// console.log("entered get current pos")
	navigator.geolocation.getCurrentPosition(function (position) {
		app.lat = position.coords.latitude;
		app.lng = position.coords.longitude;
		app.position = { lat: app.lat, lng: app.lng };
		// console.log(app.position);
		var coordinates = new google.maps.LatLng(app.lat, app.lng);
		var marker = new google.maps.Marker({
			position: coordinates,
			map: map,
			animation: google.maps.Animation.BOUNCE
		});
		var infoWindow = new google.maps.InfoWindow({ map: map });
		infoWindow.setPosition(coordinates);
		infoWindow.setContent('You are here!');
		infoWindow.open(marker.get('map'), marker);
		map.setCenter(coordinates);
	});
};

app.init = function () {
	app.getBeer();
	// app.getInventory();
	app.getCurrentPosition();
	$('#userBeerSelection').on('submit', function (e) {
		e.preventDefault();
		app.beerSelected = $('input[name=beer]:checked').val();

		$('html, body').animate({
			scrollTop: $('#map').offset().top }, 1500);

		console.log(app.beerSelected);
		app.getStores();
	});
};

$(function () {
	app.init();
});