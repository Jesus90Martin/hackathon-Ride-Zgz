/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var server = 'http://www.zaragoza.es';
var api = '/api/recurso/cultura-ocio/evento-zaragoza?debug=s';
var clientId = 'jesusmartin';
var privateKey = '5hfbedjzCkXfFjgzJwY23BFd9YKVSWJ0DVPj9D2d02q7maCGSslKG8IL2phgxUcCV7r9H5';
var markersIncidencias = [];
var markersEvents = [];
var map;
var trafficLayer;
var traffic = false;
var inicio = true;
var infoWindow = null;
var whereAmI = "normalPage";
// HTML DIV REFERENCES
var mainBody, mainMenu, mapPage, wrapper, wrapperMenu, scroller;
//AJAX CALLS VARIABLE
var xhReq = new XMLHttpRequest();
//VARIABLE TO STORE THE CURRENTE GEO-POSITION, IT IS ELSE STORED IN LOCALSTORAGE
var myCurrentPosition;
var myscroll;
var last_click_time, click_time;
// INITIALIZE HTML DIVS REFERENCES
mainBody = document.getElementById("mainBody");
mainMenu = document.getElementById("mainMenu");
wrapper = document.getElementById("wrapper");
wrapperMenu = document.getElementById("wrapperMenu");
scroller = document.getElementById("scroller");
mapPage = document.getElementById("mapPage");
var app = {
    // Application Constructor
    initialize: function () {
        this.bindEvents();





        // STYLE ELEMENT
        var style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = '.cssClass { position:absolute; z-index:2;left:0;top:46px; width:100%;background-color:#D6D6D6; height:100%;}'; //overflow:auto;
        document.getElementsByTagName('head')[0].appendChild(style);

        // ADD NEEDED CLASSES FOR BODY ELEMENTS (MENU|BODY|MAP)
        mainBody.className = 'page';
        mainMenu.className = 'page right';
        mapPage.className = "mapPageStyle left";
        wrapper.className = 'cssClass';

        // LOAD OPTION1.HTML INSIDE MAINBODY
        xhReq.open("GET", "pages/option1.html", false);
        xhReq.send(null);
        document.getElementById("mainBodyContent").innerHTML = xhReq.responseText;

        // LOAD MAP.HTML INSIDE MAPPAGE
        xhReq.open("GET", "pages/map.html", false);
        xhReq.send(null);
        document.getElementById("mapPageContent").innerHTML = xhReq.responseText;

        // LOAD MENU.HTML INSIDE MAINMENU
        xhReq.open("GET", "pages/menu.html", false);
        xhReq.send(null);
        document.getElementById("menuContent").innerHTML = xhReq.responseText;
        var page = 0;
        window.localStorage.setItem("start", page);
//         $.ajaxSetup({
//            async: false
//        });
//        initializeMaps();
//        appEvents();
//        getEvents();
//         $.ajaxSetup({
//            async: true
//        });


    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function () {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('backbutton', this.onBackKeyDown, false);
        window.addEventListener('load', loaded, false);
        document.addEventListener('touchmove', function (e) {
            e.preventDefault();
        }, false);
        //Se ha añadido este codigo para evitar el doble disparo de las funciones al pulsar el menu, convendria encontrar una mejor manera de controlarlo.
        last_click_time = new Date().getTime();
        document.addEventListener('click', function (e) {
            click_time = e['timeStamp'];
            if (click_time && (click_time - last_click_time) < 200) { //si el espacio entre dos clicks es menor que 200ms, no se captura.
                e.stopImmediatePropagation();
                e.preventDefault();
                return false;
            }
            last_click_time = click_time;
        }, true);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
//        app.receivedEvent('deviceready');

        $.ajaxSetup({
            async: false
        });
        positionComputation();
        appEvents();
        getEvents();
        initializeMaps();

        $.ajaxSetup({
            async: true
        });

        new FastClick(document.body);
    },
    onBackKeyDown: function () {

        if (whereAmI == "mapPage") {
            mapPage.className = 'mapPageStyle transition left';
            whereAmI = "normalPage";
        } else if (whereAmI == "mainMenu") {
            mainMenu.className = 'page transition right';
            whereAmI = "normalPage";
        } else if (whereAmI == "normalPage" && inicio == false) {
            menu('1');
        } else {
            navigator.app.exitApp();
        }


    }

};

function loaded() {
    // ISCROLL4
    myScroll = new iScroll('wrapper', {hideScrollbar: true, hScroll: false, bounce: false, useTransition: false});
    myScrollMenu = new iScroll('wrapperMenu', {hideScrollbar: true, hScroll: false, bounce: false});
}


// FUNCTIONS FOR POSITION COMPUTATION
function positionComputation() {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
}

function onSuccess(position) {
    var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    window.localStorage.setItem("myCurrentLat", lat);
    window.localStorage.setItem("myCurrentLong", long);
    window.localStorage.setItem("myCurrentPosition", pos);
    myCurrentPosition = pos;
}

function onError(error) {
    alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}

function getEvents() {
    $.ajaxSetup({
        async: false
    });

    var currentPage = window.localStorage.getItem("start");
    var url = 'http://www.zaragoza.es/buscador/select?';
    var query = '*:*';
    var start = currentPage * 30;
    var rows = 30;
    var facet = 'estilos_smultiple';
    var category = 'Incidencias';

    $.ajax({
        method: 'JSONP',
        url: url,
        dataType: "jsonp",
        data: {
            'json.wrf': 'JSON_CALLBACK_HOME',
            'wt': 'json',
            'start': start,
            'rows': rows,
            'fq': 'temas_smultiple:("Medio Ambiente","Deportes","Aire Libre y Excursiones")',
            'q': query + ' AND -tipocontenido_s:estatico AND category:Actividades AND fechaInicio_dt:[* TO NOW+1DAY] AND fechaFinal_dt:[NOW-1DAY TO *]'

        }
    });

    var page = parseInt(currentPage) + 1;
    window.localStorage.setItem("start", page);
    $.ajaxSetup({
        async: true
    });


}


function JSON_CALLBACK_HOME(respuesta) {
    $.ajaxSetup({
        async: false
    });
    var events = [];
    for (var i = 0; i < respuesta.response.docs.length; i++) {
        var event = new Event();
        var dir = "";
        if (respuesta.response.docs[i].direccionlugar_t !== undefined) {
            dir = respuesta.response.docs[i].direccionlugar_t;
        }

        $("#eventList").append('<div id="event' + i + '" style="height:220px;background:#fff;margin:10px;overflow:hidden;-webkit-animation: mymove 1.5s;animation: mymove 1.5s;" onclick="eventInfo(\'' + respuesta.response.docs[i].id + '\')">' +
                "<div style='width:40%;float:left;height:100%'><div id='imgEvent" + i + "' class='imgEvent' style='background:url(" + respuesta.response.docs[i].imagen_s + ") no-repeat center center;'></div></div>" +
                '<div class="infoEvent">' +
                '<div id="titleEvent" class="titleEvent">' + respuesta.response.docs[i].title + '</div>' +
                '<div id="typeEvent" class="typeEvent"><b></b>' + respuesta.response.docs[i].text[2] + '</div>' +
                '<div style="margin-top:5px">' + dir + '</div>' +
                '<div id="poblacionEvent" class="poblacionEvent"><b>Dirigido a: </b>' + respuesta.response.docs[i].text[1] + '</div>' +
                '</div>' +
                '</div>');

        event.id = respuesta.response.docs[i].id;
        event.title = respuesta.response.docs[i].title;
        event.long = respuesta.response.docs[i].coordenadas_p_1_coordinate;
        event.lat = respuesta.response.docs[i].coordenadas_p_0_coordinate;
        event.text1 = respuesta.response.docs[i].text[2];
        event.text2 = respuesta.response.docs[i].text[1];
        event.dir = dir;
        var position = new google.maps.LatLng(respuesta.response.docs[i].coordenadas_p_0_coordinate, respuesta.response.docs[i].coordenadas_p_1_coordinate);
        var markerInc;


        var icon = 'img/eventoszgz.png';

        var image = new google.maps.MarkerImage(icon, null, null, null, new google.maps.Size(25, 25));

        markerInc = new google.maps.Marker({
            position: position,
            map: map,
            icon: image
        });
        markersEvents[i] = markerInc;
        events[i] = event;
    }

    document.getElementById('event0').style.display = 'none';

    setTimeout(function () {
        myScroll.refresh();
    }, 200);

    for (var i = 0; i < markersEvents.length; i++) {
        var marker = markersEvents[i];
        var event = events[i];

        var content = '<ul style="padding:10px;color:rgba(127,127,127,1)">' +
                '<li style="font-size:16px;text-align:left;border-bottom:1px solid rgba(127,127,127,1);font-weight:400">' + event.title + '</li>' +
                '<li style="font-size:14px;text-align:left;padding-top:10px">' + event.dir + '</li>' +
                '<li style="font-size:12px;text-align:left;padding-top:10px">' + event.text1 + '</li>' +
                '<li style="font-size:12px;text-align:right;padding-top:5px">' + event.text2 + '</li>' +
                '<li style="font-size:14px;text-align:right;padding-top:5px;color:green;"><a href="javascript:startNavigation(' + event.lat + ', ' + event.long + ');">Llévame!</a></li>' +
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

function eventInfo(idEvent) {
    $.ajaxSetup({
        async: false
    });
    whereAmI = "normalPage";
    inicio = false;
    var url = 'http://www.zaragoza.es/buscador/select?';
//    var query = '*:*';
    var start = 0;
    var rows = 2;
    $.ajax({
        method: 'JSONP',
        url: url,
        dataType: "jsonp",
        data: {
            'json.wrf': 'JSON_CALLBACK_EVENT',
            'wt': 'json',
            'start': start,
            'rows': rows,
            'q': 'id:' + idEvent

        }
    });


    $.ajaxSetup({
        async: true
    });

}

function JSON_CALLBACK_EVENT(respuesta) {
    xhReq.open("GET", "pages/infoEvento.html", false);
    xhReq.send(null);
    document.getElementById("mainBodyContent").innerHTML = xhReq.responseText;
    document.getElementById("titleInfo").innerHTML = respuesta.response.docs[0].title;
    document.getElementById("descriptionInfo").innerHTML = respuesta.response.docs[0].descripcion_t;
    document.getElementById("addressInfo").innerHTML = respuesta.response.docs[0].lugar_t;
    if (respuesta.response.docs[0].gratuita_b == true) {
        document.getElementById("enterInfo").innerHTML = "Entrada gratuita";
    } else {
        document.getElementById("enterInfo").innerHTML = respuesta.response.docs[0].entrada_t;
    }
    document.getElementById("buttonGo").innerHTML = '<button class="buttonForm" onclick="startNavigation(' + respuesta.response.docs[0].coordenadas_p_0_coordinate + ', ' + respuesta.response.docs[0].coordenadas_p_1_coordinate + ');">Llévame!</button>';
    setTimeout(function () {
        myScroll.refresh();
    }, 200);
    myScroll.scrollTo(0, 0);
}



function appEvents() {
    var idEvent = 'acto-135665';
    $.ajaxSetup({
        async: false
    });
    var url = 'http://www.zaragoza.es/buscador/select?';
//    var query = '*:*';
    var start = 0;
    var rows = 2;
    $.ajax({
        method: 'JSONP',
        url: url,
        dataType: "jsonp",
        data: {
            'json.wrf': 'JSON_CALLBACK_EVENT_APP',
            'wt': 'json',
            'start': start,
            'rows': rows,
            'q': 'id:' + idEvent

        }
    });


    $.ajaxSetup({
        async: true
    });

}

function JSON_CALLBACK_EVENT_APP(respuesta) {
    var dir = "";
    if (respuesta.response.docs[0].direccionlugar_t !== undefined) {
        dir = respuesta.response.docs[0].direccionlugar_t;
    }
    $("#eventList").append('<div id="event" style="height:220px;background:#fff;margin:10px;overflow:hidden;-webkit-animation: mymove 1.5s;animation: mymove 1.5s;" onclick="eventInfo(\'' + respuesta.response.docs[0].id + '\')">' +
            "<div style='width:40%;float:left;height:100%'><div id='imgEvent' class='imgEvent' style='background:url(" + respuesta.response.docs[0].imagen_s + ") no-repeat center center;'></div></div>" +
            '<div class="infoEvent">' +
            '<div id="titleEvent" class="titleEvent">' + respuesta.response.docs[0].title + '</div>' +
            '<div id="typeEvent" class="typeEvent"><b></b>' + respuesta.response.docs[0].text[2] + '</div>' +
            '<div style="margin-top:5px">' + dir + '</div>' +
            '<div id="poblacionEvent" class="poblacionEvent"><b>Dirigido a: </b>' + respuesta.response.docs[0].text[1] + '</div>' +
            '</div>' +
            '</div>');
}