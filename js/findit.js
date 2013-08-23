var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

var BASE_DIR = "/shop-finder";
var BUDAPEST = new google.maps.LatLng(47.500851,19.053125);
//var BASE_URL = "https://maps.googleapis.com/maps/api/distancematrix/json";

var rendererOptions = {
  draggable: true
};

var previousLL;

var xhrList = new XMLHttpRequest();
xhrList.open("GET", BASE_DIR + "/json/shopList.json", false);
xhrList.send();
var s = JSON.parse(xhrList.responseText);

/*
var s = 
{	"shopList" : [
{ "name" : "Mammut Képviselet", "address" : "1026 Budapest II., Lövőház u. 2-6.", "lat" : "47.5083529", "lon" : "19.0266807"},
{ "name" : "Astoria - Telenor üzlet", "address" : "1075 Budapest VII., Károly krt. 3/a.", "lat" : "47.4951862", "lon" : "19.0594802"},
{ "name" : "Telenor Köki Terminál", "address" : "1191 Budapest XIX., Vak Bottyán utca 75/", "lat" : "47.4618375", "lon" : "19.1489296"},
{ "name" : "Telenor Pólus Center", "address" : "1152 Budapest XV., Szentmihályi út 131", "lat" : "47.5498316", "lon" : "19.1383946"},
{ "name" : "Debreceni Képviselet", "address" : "4025 Debrecen, Unió Áruház  Piac u. 1-3.", "lat" : "47.5299739", "lon" : "21.6393571"},
{ "name" : "Győr Képviselet", "address" : "9021 Győr, Baross Gábor utca 11", "lat" : "47.6870991", "lon" : "17.6320051"},
{ "name" : "Pécs Képviselet", "address" : "7622 Pécs, Bajcsy-Zsilinszky En", "lat" : "46.0712989", "lon" : "18.2331874"},
{ "name" : "Szegedi Bemutatóterem", "address" : "6724 Szeged, Londoni krt. 3.", "lat" : "46.2541386", "lon" : "46.2541386"},
{ "name" : "Telenor Törökbálint", "address" : "2045 Törökbálint, Pannon út 1.", "lat" : "47.435794", "lon" : "18.915538"}
]};
*/


function toRad(value) {
    // Converts numeric degrees to radians
    return value * Math.PI / 180;
}

function dist(lat1, lon1, lat2, lon2){
	var R = 6371; // km
	var dLat = toRad(lat2-lat1);
	var dLon = toRad(lon2-lon1);
	var lat1 = toRad(lat1);
	var lat2 = toRad(lat2);

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}

function calcDistance(lalo){
	
/*	var origins = lalo;

	var url = BASE_URL + '?origins=' + origins + '&destinations=' + showroomarray2.join('|') + '&sensor=true';
	console.log("calcDistance Calling");

	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, false);
	xhr.send();
	var response = JSON.parse(xhr.responseText);

	var closest = response.rows[0].elements[0].distance.value;
	var address;	
	for(var i = 0; i < response.rows[0].elements.length; ++i){
      if (closest > response.rows[0].elements[i].distance.value){
			closest = response.rows[0].elements[i].distance.value;
			address = showroomarray2[i];
		}
	}
*/
	var lat1 = lalo.lat();
	var lon1 = lalo.lng();
	var index = 0;
	var close = 1000000;
	var tmp = 0;

	for(var i = 0; i < s.shopList.length; i++){
		tmp = dist(lat1,lon1,s.shopList[i].lat,s.shopList[i].lon);
		if(tmp < close){
			close = tmp;
			index = i;
		}
	}

	return (new google.maps.LatLng(s.shopList[index].lat, s.shopList[index].lon));
}

function init(options){
	directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
	previousLL = new google.maps.LatLng(options.coords.latitude,options.coords.longitude);
	var ll = new google.maps.LatLng(options.coords.latitude,options.coords.longitude);
  	var mapOptions = {
   	zoom:7,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
    	center: ll
  	}
  	map = new google.maps.Map(document.getElementById("map"), mapOptions);
  	directionsDisplay.setMap(map);
  	directionsDisplay.setPanel(document.getElementById("directionsPanel"));

  	google.maps.event.addListener(directionsDisplay, "directions_changed", function() {
   	 reCalc(directionsDisplay.directions);
  	});

	findIt(ll);
}

function findIt(ll) {
	map.setCenter(ll);
 	calcRoute(ll);
}

function calcRoute(ll) {
  var start = ll;
  var end = calcDistance(ll);
  var request = {
      origin:start,
      destination:end,
      travelMode: google.maps.DirectionsTravelMode.DRIVING
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
        map.setCenter(BUDAPEST);
    }
  });
    previousLL = ll;
}

function reCalc(result) {
	var actual = result.routes[0].legs[0].start_location;
	if( !previousLL.equals(actual) ){
		findIt(actual);
	}
}

function errorCallback(error){

  document.write("<h3>Something went wrong. I don't know where are you.</h3>");
  switch(error.code)
    {
    case error.PERMISSION_DENIED:
		console.log("User denied the request for Geolocation.");
         document.write("<br /><br /> User denied the request.");
      break;
    case error.POSITION_UNAVAILABLE:
		console.log("Location information is unavailable.");
        document.write("<br /><br /> Location information unavaible.");
      break;
    case error.TIMEOUT:
		console.log("The request to get user location timed out.");
        document.write("<br /><br /> Request timeout.");
      break;
    case error.UNKNOWN_ERROR:
		console.log("An unknown error occurred.");
        document.write("<br /><br /> Unknow error.");
      break;
    }
}
      
var geoSettings = {
  enableHighAccuracy: true,
  maximumAge        : 30000,
  timeout           : 20000
};

function change(){
	switch(mode.transit){
		case "DRIVE" :
			console.log("DRIVE");
		break;
		case "WALKING" :
			console.log("WALKING");
		break;
		case  "TRANSIT" :
			console.log("TRANSIT");
		break;
		default: 
			console.log("DEF");
		break;
	}
}

if ("geolocation" in navigator) {
	navigator.geolocation.getCurrentPosition(init, errorCallback, geoSettings);
}else{    
	alert("No geolocation available!");
}

