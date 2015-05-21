/*global require, console*/

//Activate the device and get its status

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    //Change the power boolean to true or false. (Note power() is the same as power(true))

    camera.power(true).then(function () {

        camera.status().then(function (status) {
            console.log(status);
        }).catch(function (error) {
            console.log(error.message);
        });

    }).catch(function (error) {
        console.log(error.message);
    });

}());