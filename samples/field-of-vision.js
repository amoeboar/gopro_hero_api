/*global require, console*/

//Set device's Field Of Vision
//FieldOfVision = { WIDE: 0, MEDIUM: 1, NARROW: 2 };

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.setFieldOfVision(GoPro.FieldOfVision.WIDE).then(function () {
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