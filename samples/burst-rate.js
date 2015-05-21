/*global require, console*/

// Sets the device's burst rate
// GoPro.BurstRate = { RATE3_1s: 0, RATE5_1s: 1, RATE10_1s: 2, RATE10_2s: 3};

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        CameraMode = GoPro.CameraMode,
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.setCameraMode(CameraMode.BURST).then(function () {
            camera.setBurstRate(GoPro.BurstRate.RATE5_1s).then(function () {
                camera.status().then(function (status) {
                    console.log(status);
                }).catch(function (error) {
                    console.log(error.message);
                });
            });
        });

    }).catch(function (error) {
        console.log(error.message);
    });

}());
