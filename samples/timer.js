/*global require, console*/

//Set device's timer delay (Note changes Camera Mode to the timer setting also).
//Timer = { HALF_SECOND: 0, ONE_SECOND: 1, TWO_SECOND: 2};

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        CameraMode = GoPro.CameraMode,
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {
        camera.setCameraMode(CameraMode.TIMER).then(function () {
            camera.setPhotoTimer(GoPro.Timer.TWO_SECOND).then(function () {
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