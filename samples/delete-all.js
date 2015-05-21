/*global require, console, process*/

// Deletes all content from camera - for that reason you can only run this example script including the command line arg:
// node delete-all.js im-not-crazy
// You're smart people, so you obviously know how dangerous this function can be!!

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        if (process.argv[2] === 'im-not-crazy') {
            camera.deleteAll();
        }

    }).catch(function (error) {
        console.log(error.message);
    });

}());