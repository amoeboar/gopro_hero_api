/*global require, console*/

// Sets the device's loop setting
//LoopVideo = { OFF: 0, MIN_5: 1, MIN_20: 2, MIN_60: 3, MAX: 5 };

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.setLoopVideo(GoPro.LoopVideo.OFF).then(function () {
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