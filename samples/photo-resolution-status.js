/*global require, console*/

// Camera mode status changes the devices Photo resolution then consoles the camera's status.
// This is how the device was reverse engineered for all it's settings.
// Watch the camera when running this script.

// GoPro.PhotoResolution = { WIDE_11MP: 0, MEDIUM_8MP: 1, WIDE_5MP: 2, MEDIUM_5MP: 3 };

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        CameraMode = GoPro.CameraMode,
        PhotoResolution = GoPro.PhotoResolution,
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.setCameraMode(CameraMode.PHOTO).then(function(){
            camera.setPhotoResolution(PhotoResolution.WIDE_11MP).then(function(){
                camera.status().then(function(status){
                    console.log('PhotoResolution.WIDE_11MP Status');
                    console.log(status);

                    camera.setPhotoResolution(PhotoResolution.MEDIUM_8MP).then(function(){
                        camera.status().then(function(status){
                            console.log('PhotoResolution.MEDIUM_8MP Status');
                            console.log(status);

                            camera.setPhotoResolution(PhotoResolution.WIDE_5MP).then(function(){
                                camera.status().then(function(status){
                                    console.log('PhotoResolution.WIDE_5MP Status');
                                    console.log(status);

                                    camera.setPhotoResolution(PhotoResolution.MEDIUM_5MP).then(function(){
                                        camera.status().then(function(status){
                                            console.log('PhotoResolution.MEDIUM_5MP Status');
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