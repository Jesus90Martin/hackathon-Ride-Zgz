// FUNCTION THAT INITIALIZES THE MAP VIEW
function initializeMaps() {
    var mapOptions = {
        center: new google.maps.LatLng(window.localStorage.getItem("myCurrentLat"), window.localStorage.getItem("myCurrentLong")),
        zoom: 14,
        streetViewControl: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoomControl: true,
        rotateControl: true,
        mapTypeControl: true
    };
    var clientHeight = document.getElementById('mapPageContent').clientHeight;
    clientHeight = clientHeight - 46;
    document.getElementById("mapContainer").style.height = clientHeight + "px";
    map = new google.maps.Map(document.getElementById("mapContainer"), mapOptions);
    google.maps.event.addListenerOnce(map, 'tilesloaded', function () {
//    watchID = navigator.geolocation.watchPosition(gotPosition, null, {maximumAge: 5000, timeout: 60000, enableHighAccuracy: true});
    });
//    infoWindow = new google.maps.InfoWindow();
    infoWindow = new InfoBubble({
        shadowStyle: 1,
        padding: 0,
        backgroundColor: 'rgba(229,229,229,0.95)',
        borderRadius: 0,
        arrowSize: 30,
//        borderWidth: 1,
        borderColor: 'rgba(229,229,229,0.95)',
        hideCloseButton: true,
        arrowPosition: 40,
        minWidth: 200,
//        backgroundClassName: 'phoney',
        arrowStyle: 2
    });

    var centerControlDiv = document.createElement('div');
    var centerControl = new CenterControl(centerControlDiv, map);

    centerControlDiv.index = 1;
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(centerControlDiv);


    trafficLayer = new google.maps.TrafficLayer();
    map.data.addGeoJson(geojson);


    map.data.setStyle(function (feature) {
        if (feature.k.TIPO_CARRIL == "2") {
            return {
                strokeColor: 'green',
                strokeWeight: 3
            };

        } else {
            return {
                strokeColor: '#620881',
                strokeWeight: 3
            };
        }
    });

    gotPosition(map);
}



// FUNCTION THAT SETS THE MARKERS CONFIGURATION OF OUR MAP
function gotPosition(map) {
    $.ajaxSetup({
        async: false
    });

    //AQUI SE HAN CREADO DOS MARKERS PROVISIONALES QUE SIMULAN LA POSICION DE UN TALLER Y LA POSICION DE UN EVENTO LANZADO POR LA PROPIA APLICACION, DESDE LA PAGINA CREAR EVENTO

    var mipos = new google.maps.LatLng(window.localStorage.getItem("myCurrentLat"), window.localStorage.getItem("myCurrentLong"));

    var contentQuedada = '<ul style="padding:10px;color:rgba(127,127,127,1)">' +
            '<li style="font-size:16px;text-align:left;border-bottom:1px solid rgba(127,127,127,1);font-weight:400">Ruta en bici por Zaragoza</li>' +
            '<li style="font-size:14px;text-align:left;padding-top:10px;">Campus rio Ebro</li>' +
            '<li style="font-size:12px;text-align:right;padding-top:5px">12-04-2015 a las 10:00</li>' +
            '<li style="font-size:14px;text-align:right;padding-top:5px;color:green;"><a href="javascript:startNavigation(\'41.610563\', \'-0.894650\');">Llévame</a></li>' +
            '</ul>';

    var contentTaller = '<ul style="padding:10px;color:rgba(127,127,127,1)">' +
            '<li style="font-size:16px;text-align:left;border-bottom:1px solid rgba(127,127,127,1);font-weight:400">Ciclos Zaragoza</li>' +
            '<li style="font-size:14px;text-align:left;padding-top:10px;">C/ San Agustin</li>' +
            '<li style="font-size:12px;text-align:right;padding-top:5px">telf: 976 584839</li>' +
            '<li style="font-size:14px;text-align:right;padding-top:5px;color:green;"><a href="javascript:startNavigation(\'41.670563\', \'-0.894650\');">Llévame</a></li>' +
            '</ul>';
    var imageQuedada = new google.maps.MarkerImage('img/eventosapp.png', null, null, null, new google.maps.Size(40, 40));
    var imageHere = new google.maps.MarkerImage('img/riderhere.png', null, null, null, new google.maps.Size(50, 50));
    var imageTaller = new google.maps.MarkerImage('img/talleres.png', null, null, null, new google.maps.Size(30, 30));
    var miMarker = new google.maps.Marker({
        position: mipos,
        map: map,
        icon: imageHere
    });

    var infoWindowQuedada = infoWindow;
    var quedadaMarker = new google.maps.Marker({
        position: new google.maps.LatLng(41.650563, -0.894650),
        map: map,
        icon: imageQuedada
    });


    google.maps.event.addListener(map, 'click', function () {
        infoWindowQuedada.close();
    });
    google.maps.event.addListener(quedadaMarker, 'click', (function (quedadaMarker, contentQuedada, infoWindowQuedada) {
//            alert("cliked");
        return function () {
            infoWindowQuedada.setContent(contentQuedada);
            setTimeout(function () {
                infoWindowQuedada.open(map, quedadaMarker);
            }, 100);
        };
    })(quedadaMarker, contentQuedada, infoWindowQuedada));

    var infoWindowTaller = infoWindow;
    var businessMarker = new google.maps.Marker({
        position: new google.maps.LatLng(41.670563, -0.894650),
        map: map,
        icon: imageTaller
    });


    google.maps.event.addListener(map, 'click', function () {
        infoWindowTaller.close();
    });
    google.maps.event.addListener(businessMarker, 'click', (function (businessMarker, content, infoWindowTaller) {
//            alert("cliked");
        return function () {
            infoWindowTaller.setContent(contentTaller);
            setTimeout(function () {
                infoWindowTaller.open(map, businessMarker);
            }, 100);
        };
    })(businessMarker, contentTaller, infoWindowTaller));

    var markers = [];
    var bizis = [];

    var marker;
    var position;
    var k = 0;
    var url = 'http://www.zaragoza.es/api/recurso/urbanismo-infraestructuras/estacion-bicicleta?srsname=wgs84&rows=130&' + Math.random() * Math.random();

    $.getJSON('http://www.zaragoza.es/api/recurso/urbanismo-infraestructuras/estacion-bicicleta?srsname=wgs84&rows=130&' + Math.random() * Math.random(), function (json) {

        for (var i = 0; i < json.result.length; i++) {
            var bizi = new Bizi();
//            $("#pp").append(json.result[i].geometry.coordinates[0]);
            bizi.id = json.result[i].id;
            bizi.title = json.result[i].title;
            bizi.long = json.result[i].geometry.coordinates[0];
            bizi.lat = json.result[i].geometry.coordinates[1];
            bizi.availableBike = json.result[i].bicisDisponibles;
            bizi.availableAnchorage = json.result[i].anclajesDisponibles;
            bizi.text = json.result[i].description;
            bizi.lastUpdate = json.result[i].lastUpdated;
            bizi.status = json.result[i].estado;

            position = new google.maps.LatLng(json.result[i].geometry.coordinates[1], json.result[i].geometry.coordinates[0]);
            var icon;

            icon = "img/bizirojo.png";

            var image = new google.maps.MarkerImage(icon, null, null, null, new google.maps.Size(25, 25));

            marker = new google.maps.Marker({
                position: position,
                map: map,
                icon: image
            });
            markers[i] = marker;
            bizis[i] = bizi;
        }
    });


    var url = 'http://www.zaragoza.es/buscador/select?';
    var query = '*:*';
    var start = 0;
    var rows = 20;
    var facet = 'estilos_smultiple';
    var category = 'Incidencias';

    $.ajax({
        method: 'JSONP',
        url: url,
        dataType: "jsonp",
        data: {
            'json.wrf': 'JSON_CALLBACK',
            'wt': 'json',
            'start': start || 0,
            'rows': rows || 100,
            'q': query + ' AND -tipocontenido_s:estatico AND category:Incidencias AND fechaInicio_dt:[* TO NOW] AND (fechaFinPublicacion_dt:[NOW TO *] OR (*:* -fechaFinPublicacion_dt:[* TO *]))'

        }
    });

    addMarkers(markers, bizis, map);

    $.ajaxSetup({
        async: true
    });
}

function addMarkers(markers, bizis, map) {
    $.ajaxSetup({
        async: false
    });
    for (var i = 0; i < markers.length; i++) {
        var marker = markers[i];
        var bizi = bizis[i];

        var content = '<ul style="padding:10px;color:rgba(127,127,127,1)">' +
                '<li style="font-size:16px;text-align:left;border-bottom:1px solid rgba(127,127,127,1);font-weight:400">' + bizi.title + '</li>' +
                '<li style="font-size:14px;text-align:left;padding-top:10px;color:green">Bicis disponibles: ' + bizi.availableBike + '</li>' +
                '<li style="font-size:14px;text-align:left;padding-top:10px;color:blue">Anclajes disponibles: ' + bizi.availableAnchorage + '</li>' +
                '<li style="font-size:12px;text-align:right;padding-top:5px">Ultima actualizacion: ' + bizi.lastUpdate;
        +'</li>' +
                '</ul>';


        google.maps.event.addListener(map, 'click', function () {
            infoWindow.close();
        });
        google.maps.event.addListener(marker, 'click', (function (marker, content, infoWindow) {
            return function () {
                infoWindow.setContent(content);
                setTimeout(function () {
                    infoWindow.open(map, marker);
                }, 100);
            };
        })(marker, content, infoWindow));
    }
    $.ajaxSetup({
        async: true
    });
}


function Bizi() {
    this.id;
    this.title;
    this.long;
    this.lat;
    this.availableBike;
    this.availableAnchorage;
    this.text;
    this.status;
    this.lastUpdate;
}

function Incidencia() {
    this.id;
    this.title;
    this.long;
    this.lat;
    this.tramo;
    this.text;
    this.type;
    this.lastUpdate;
}

function Event() {
    this.id;
    this.title;
    this.long;
    this.lat;
    this.text1;
    this.text2;
    this.dir;
}




function CenterControl(controlDiv, map) {

    // Set CSS for the control border
    var controlUI = document.createElement('div');
    controlUI.style.backgroundColor = '#999';
    controlUI.style.border = '2px solid #999';
    controlUI.style.borderRadius = '3px';
    controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
    controlUI.style.cursor = 'pointer';
    controlUI.style.marginBottom = '22px';
    controlUI.style.marginRight = '10px';
    controlUI.style.textAlign = 'center';
    controlUI.title = 'Click to recenter the map';
    controlDiv.appendChild(controlUI);

    // Set CSS for the control interior
    var controlText = document.createElement('div');
    controlText.style.color = '#fff';
    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
    controlText.style.fontSize = '14px';
    controlText.style.lineHeight = '30px';
    controlText.style.paddingLeft = '5px';
    controlText.style.paddingRight = '5px';
    controlText.innerHTML = 'Estado Tráfico';
    controlUI.appendChild(controlText);

    // Setup the click event listeners: simply set the map to
    // Chicago
    google.maps.event.addDomListener(controlUI, 'click', function () {
        if (traffic == true) {
            trafficLayer.setMap(null);
            traffic = false;
        } else {


            trafficLayer.setMap(map);
            traffic = true;
        }
    });

}


function startNavigation(latitude, longitude) {
    launchnavigator.navigate(
            [latitude, longitude],
            null,
            function () {
                window.plugins.toast.showShortBottom("Lanzando navegador");
            },
            function (error) {
                alert("Plugin error: " + error);
            });
}