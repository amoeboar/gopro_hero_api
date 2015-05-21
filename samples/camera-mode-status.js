/*global require, console*/

// Camera mode status changes the devices CameraMode then consoles the camera's status.
// This is how the device was reverse engineered for all it's settings.
// Watch the camera when running this script.

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        CameraMode = GoPro.CameraMode,
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.ready().then(function () {
            camera.setCameraMode(CameraMode.VIDEO).then(function () {
                camera.status().then(function (status) {
                    console.log('CameraMode.VIDEO Status');
                    console.log(status);
                    camera.setCameraMode(CameraMode.PHOTO).then(function () {
                        camera.status().then(function () {
                            console.log('CameraMode.PHOTO Status');
                            console.log(status);
                            camera.setCameraMode(CameraMode.BURST).then(function () {
                                camera.status().then(function () {
                                    console.log('CameraMode.BURST Status');
                                    console.log(status);
                                    camera.setCameraMode(CameraMode.TIMER).then(function () {
                                        camera.status().then(function () {
                                            console.log('CameraMode.TIMER Status');
                                            console.log(status);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    }).catch(function (error) {
        console.log(error.message);
    });

}());