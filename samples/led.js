/*global require, console*/

//Get the current status of the GoPro

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        LED = GoPro.LED,
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.setLED(LED.FOUR).then(function () {
            camera.status().then(function (status) {
                console.log(status);
            }).catch(function (error) {
                console.log(error.message);
            });
        });

    }).catch(function (error) {
        console.log(error.message);
    });

}());