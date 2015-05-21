/*global require, console*/

// Camera mode status changes the devices Video resolution then consoles the camera's status.
// This is how the device was reverse engineered for all it's settings.
// Watch the camera when running this script.

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        CameraMode = GoPro.CameraMode,
        VideoResolution = GoPro.VideoResolution,
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {
        camera.setCameraMode(CameraMode.VIDEO).then(function () {
            camera.setVideoResolution(VideoResolution.WVGA_120).then(function () {
                camera.status().then(function (status) {
                    console.log('VideoResolution.WVGA_120 Status');
                    console.log(status);
                    camera.setVideoResolution(VideoResolution.HD_720_30).then(function () {
                        camera.status().then(function (status) {
                            console.log('VideoResolution.HD_720_30 Status');
                            console.log(status);

                            camera.setVideoResolution(VideoResolution.HD_720_60).then(function () {
                                camera.status().then(function (status) {
                                    console.log('VideoResolution.HD_720_60 Status');
                                    console.log(status);

                                    camera.setVideoResolution(VideoResolution.HD_960_30).then(function () {
                                        camera.status().then(function (status) {
                                            console.log('VideoResolution.HD_960_30 Status');
                                            console.log(status);

                                            camera.setVideoResolution(VideoResolution.HD_960_60).then(function () {
                                                camera.status().then(function (status) {
                                                    console.log('VideoResolution.HD_960_60 Status');
                                                    console.log(status);

                                                    camera.setVideoResolution(VideoResolution.FHD_1080_30).then(function () {
                                                        camera.status().then(function (status) {
                                                            console.log('VideoResolution.FHD_1080_30 Status');
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
                    });
                });
            });
        });

    }).catch(function (error) {
        console.log(error.message);
    });

}());