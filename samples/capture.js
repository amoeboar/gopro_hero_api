/*global require, console*/

//Begin capture on device... pretty simple!!

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.capture(true);

    }).catch(function (error) {
        console.log(error.message);
    });

}());