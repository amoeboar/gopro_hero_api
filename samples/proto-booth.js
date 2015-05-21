/*global require, console, setTimeout*/

//Get the latest file from GoPro

(function () {

    'use strict';

    var config = require('../config'),
        GoPro = require('../libs/gopro'),
        CameraMode = GoPro.CameraMode,
        camera = new GoPro(config.password, config.ip, config.port);

    camera.ready().then(function () {

        camera.setCameraMode(CameraMode.PHOTO).then(function () {

            console.log('Taking Photo...');
            camera.capture(1).then(function () {
                camera.capture(0).then(function () {
                    setTimeout(function () {
                        camera.requestFileSystem().then(function (fileStructure) {

                            var file = fileStructure[fileStructure.length - 1]; //Download latest file

                            console.log('Copying file...');
                            console.log(file);

                            camera.copyFile(file.absolutePath + file.name, 'copy').then(function (copiedFile) {
                                console.log('File copied...');
                                console.log(copiedFile);
                            }).catch(function (error) {
                                console.log(error.message);
                                console.log(error.error);
                            });
                        });
                    }, 3000); //Not great... maybe you can find a better solution
                });
            });
        });

    }).catch(function (error) {
        console.log(error.message);
    });

}());