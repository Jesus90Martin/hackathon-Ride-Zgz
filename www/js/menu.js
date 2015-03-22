


// FUNCTION THAT MANAGES THE MAIN MENU
function menu(optionRequested) {
    $.ajaxSetup({
        async: false
    });

    if (optionRequested == "map") {
        if (whereAmI == "normalPage") { // && option=="1"
            mapPage.className = 'mapPageStyle transition center';
            whereAmI = "mapPage";
        } else if (whereAmI == "mapPage") {
            mapPage.className = 'mapPageStyle transition left';
            whereAmI = "normalPage";
        }
    }
    else if (optionRequested == "menu") {
        if (whereAmI == "normalPage") {
            mainMenu.className = 'page transition center';
            whereAmI = "mainMenu";
        } else if (whereAmI == "mainMenu") {
            mainMenu.className = 'page transition right';
            whereAmI = "normalPage";
        }

    } else {
        // AJAX REQUEST
        xhReq.open("GET", "pages/option" + optionRequested + ".html", false);
        xhReq.send(null);
        document.getElementById("mainBodyContent").innerHTML = xhReq.responseText;

        mainMenu.className = 'page transition right';
        whereAmI = "normalPage";
        inicio = false;

        if (optionRequested == "1") {
            inicio = true;
            var page = 0;
            window.localStorage.setItem("start", page);
            appEvents()
            getEvents();

        }
        setTimeout(function () {
            myScroll.refresh();
        }, 200);
        myScroll.scrollTo(0, 0);

    }
    $.ajaxSetup({
        async: true
    });
}

function JSON_CALLBACK(respuesta) {
    $.ajaxSetup({
        async: false
    });
    var incidencias = [];
    for (var i = 0; i < respuesta.response.docs.length; i++) {
        var incidencia = new Incidencia();

        incidencia.id = respuesta.response.docs[i].id;
        incidencia.title = respuesta.response.docs[i].title;
        incidencia.long = respuesta.response.docs[i].coordenadas_p_1_coordinate;
        incidencia.lat = respuesta.response.docs[i].coordenadas_p_0_coordinate;
        incidencia.tramo = respuesta.response.docs[i].tramo_t;
        incidencia.text = respuesta.response.docs[i].texto_t;
        incidencia.type = respuesta.response.docs[i].text[2];
        incidencia.lastUpdate = respuesta.response.docs[i].last_modified;
        var position = new google.maps.LatLng(respuesta.response.docs[i].coordenadas_p_0_coordinate, respuesta.response.docs[i].coordenadas_p_1_coordinate);
        var markerInc;

        var image = new google.maps.MarkerImage('img/incidencias.png', null, null, null, new google.maps.Size(40, 40));
        markerInc = new google.maps.Marker({
            position: position,
            map: map,
            icon: image
        });
        markersIncidencias[i] = markerInc;
        incidencias[i] = incidencia;
    }



    for (var i = 0; i < markersIncidencias.length; i++) {
        var marker = markersIncidencias[i];
        var incidencia = incidencias[i];

        var content = '<ul style="padding:10px;color:rgba(127,127,127,1)">' +
                '<li style="font-size:16px;text-align:left;border-bottom:1px solid rgba(127,127,127,1);font-weight:400"> ' + incidencia.type + '</li>' +
                '<li style="font-size:14px;text-align:left;padding-top:10px">' + incidencia.tramo + '</li>' +
                '<li style="font-size:12px;text-align:left;padding-top:10px"> ' + incidencia.text + '</li>' +
                '<li style="font-size:12px;text-align:right;padding-top:5px">Ultima actualizacion: ' + incidencia.lastUpdate;
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

function sendEvent() {

    var title = document.getElementById('title').value;
    var description = document.getElementById('description').value;
    var distance = document.getElementById('distance').value;
    var easy = document.getElementById('easy').value;
    var place = document.getElementById('place').value;
    var date = document.getElementById('date').value;
    var hour = document.getElementById('hour').value;
    var latitude = document.getElementById('latitude').value;
    var longitude = document.getElementById('longitude').value;

    alert(title + description + distance + easy + place + date + hour + latitude + longitude);

//    var jsonToSend={ "title": "texto de prueba", "novisible": "S", "web": "http://www.google.com", "description": "descripcion", "poblacion": [ { "id": 2 } ], "temas": [ { "id": 37 } ], "subEvent": [ { "lugar": { "id": "rec-916" }, "fechaInicio": "2015-12-31T00:00:00Z", "fechaFinal": "2015-12-31T00:00:00Z", "horaInicio": "09:00", "horaFinal": "10:00" } ] }
//
//
//    var bodyPeticion = $("textarea#bodyPeticion").val();
//    $.ajax({
//        contentType: 'application/json',
//        data: jsonToSend,
//        dataType: 'json',
//        success: function (data) {
//            console.log(data);
//        },
//        error: function (data) {
//            console.log(data);
//        },
//        headers: {
//            clientId: clientId,
//            "HmacSHA1": CryptoJS.HmacSHA1(clientId + "POST" + api + bodyPeticion, privateKey, {
//                asBytes: true
//            }),
//            Accept: "application/json",
//            "Content-Type": "application/json;charset=UTF-8"
//        },
//        processData: false,
//        type: 'POST',
//        url: server + api
//    });
}
