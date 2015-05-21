/*global require, console, process*/

// File system returns a snapshot of the devices internal file structure.
// Note: some ordering/sorting needs to be done to make output more meaningful. At present its the output of a recursive function.

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.requestFileSystem().then(function (fileStructure) {
            console.log(fileStructure);
        });

    }).catch(function (error) {
        console.log(error.message);
    });

}());