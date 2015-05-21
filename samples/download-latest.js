/*global require, console*/

//Get the latest file from GoPro

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.requestFileSystem().then(function (fileStructure) {

            var file = fileStructure[fileStructure.length - 1]; //Download latest file

            console.log('Copying file...');
            console.log(file);

            camera.copyFile(file.absolutePath +  file.name, 'copy').then(function (copiedFile) {
                console.log('File copied...');
                console.log(copiedFile);
            }).catch(function (error) {
                console.log(error.message);
                console.log(error.error);
            });
        });

    }).catch(function (error) {
        console.log(error.message);
    });

}());