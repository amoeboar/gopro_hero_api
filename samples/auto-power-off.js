/*global require, console*/

//Sets the device's AutoPowerOff state
//AutoPowerOff = { NEVER: 0, SECONDS_60: 1, SECONDS_120: 2, SECONDS_300: 3 }

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.setAutoPowerOff(GoPro.AutoPowerOff.NEVER).then(function () {
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