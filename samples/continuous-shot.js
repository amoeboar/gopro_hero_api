/*global require, console*/

//Sets the devices Continuous Shot mode
// ContinuousShot = { SINGLE: 0, THREE_SPS: 3, FIVE_SPS: 5, TEN_SPS: 'a' };

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.setContinuousShot(GoPro.ContinuousShot.FIVE_SPS).then(function () {
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