/*global require, console*/

// Sets the black and white balance of camera. (Note Protune must be deactivated for the settings to take effect)
// WhiteBlack = { AUTO: 0, WB_3000K: 1, WB_5500K: 2, WB_6500K: 3, CAMRAW: 4 };

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.setWhiteBlack(GoPro.WhiteBlack.WB_5500K).then(function () {
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

