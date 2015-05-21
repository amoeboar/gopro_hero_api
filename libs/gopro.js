/*global require*/
/*jslint node: true, nomen:true*/


function GoProException(message, error) {
    'use strict';

    this.message = message;
    this.error = error;
}

GoProException.prototype = new Error();

(function (GoProException) {

    'use strict';

    var when = require('when'),
        request = require('request'),
        $ = require('cheerio'),
        http = require('http'),
        fs = require('fs');

    /**
     * GoPro constructor
     * @param password
     * @param ip
     * @param port
     */
    function GoPro(password, ip, port) {

        //Setup camera
        ip = (ip !== undefined) ? ip : '10.5.5.9';
        port = (port !== undefined) ? ':' + port : ':8080';

        this.apiUrl = 'http://' + ip;
        this.webUrl = this.apiUrl + port;
        this.password = password;
        this.request = request;
    }

    /**
     * deviceCall
     * Performs a structured query to the gopro device in the format:  http://[ip]/[camera/bacpac]/<app>?t=[password]&p=<command>
     * @param device
     * @param method
     * @param parameter
     */
    GoPro.prototype.deviceCall = function (device, method, parameter) {
        var dfd = when.defer();

        //console.log(this.apiUrl + '/' + device + '/' + method + '?t=' + this.password + ((parameter !== undefined) ? '&p=%0' + parameter : ''));

        this.request(
            this.apiUrl + '/' + device + '/' + method + '?t=' + this.password + ((parameter !== undefined) ? '&p=%0' + parameter : ''),
            function (error, res) {
                if (error) {
                    return dfd.reject(new GoProException('Call to GoPro device failed.', error));
                }
                return dfd.resolve(res);
            }
        );

        return dfd.promise;
    };

    /**
     * Status
     * Returns an object of 56 variables which indicate various settings on the GoPro device.
     * Note this was reverse engineered using a GoPro Hero 3 Silver addition - these values may vary or be invalid based on which version of the go-pro you're using.
     * @return status object
     */
    GoPro.prototype.status = function () {
        var dfd = when.defer(),
            statusBuffer,
            status,
            that = this;

        //Direct call to return Buffer
        http.get(this.apiUrl + '/camera/sx?t=' + that.password, function (resp) {

            resp.on('data', function (chunk) {
                statusBuffer = chunk; //Buffer
            });

            resp.on('end', function () {
                if (statusBuffer[0]) {
                    status = {
                        power: 'off'
                    };
                } else {

                    status = {
                        power: 'on',
                        cameraMode: GoPro.CameraMode.getProp(statusBuffer[1]),
                        v3: statusBuffer[2],
                        v4: statusBuffer[3],
                        v5: statusBuffer[4],
                        v6: statusBuffer[5],
                        photoTimer: GoPro.Timer.getProp(statusBuffer[5]),
                        autoPowerOff: GoPro.AutoPowerOff.getProp(statusBuffer[6]),
                        v7: statusBuffer[6],
                        fieldOfVision: GoPro.FieldOfVision.getProp(statusBuffer[7]),
                        v9: statusBuffer[8],
                        photoResolution: GoPro.PhotoResolution.getProp(statusBuffer[8]),
                        videoResolution: GoPro.VideoResolution.getProp(statusBuffer[9]),
                        v11: statusBuffer[10],
                        v12: statusBuffer[11],
                        v13: statusBuffer[12],
                        v14: statusBuffer[13],
                        v15: statusBuffer[14],
                        v16: statusBuffer[15],
                        volume: GoPro.Volume.getProp(statusBuffer[16]),
                        led: GoPro.LED.getProp(statusBuffer[17]),
                        videoMode: (statusBuffer[18] === 17) ? 'NTSC' : (statusBuffer[18] === 49) ? 'PAL' : 'Unknown',
                        battery: statusBuffer[19],
                        v21: statusBuffer[20],
                        v22: statusBuffer[21],
                        v23: statusBuffer[22],
                        v24: statusBuffer[23],
                        photosTaken: statusBuffer[24],
                        v26: statusBuffer[25],
                        videoRemaining: statusBuffer[26],
                        v28: statusBuffer[27],
                        videosTaken: statusBuffer[28],
                        v30: statusBuffer[29],
                        v31: statusBuffer[30],
                        v32: statusBuffer[31],
                        burstRate: GoPro.BurstRate.getProp(statusBuffer[32]),
                        v33: statusBuffer[32],
                        v34: statusBuffer[33],
                        whiteBlack: GoPro.WhiteBlack.getProp(statusBuffer[34]),
                        v36: statusBuffer[35],
                        v37: statusBuffer[36],
                        loopVideo: GoPro.LoopVideo.getProp(statusBuffer[37]),
                        v39: statusBuffer[38],
                        v40: statusBuffer[39],
                        v41: statusBuffer[40],
                        v42: statusBuffer[41],
                        v43: statusBuffer[42],
                        v44: statusBuffer[43],
                        v45: statusBuffer[44],
                        v46: statusBuffer[45],
                        v47: statusBuffer[46],
                        v48: statusBuffer[47],
                        v49: statusBuffer[48],
                        v50: statusBuffer[49],
                        v51: statusBuffer[50],
                        v52: statusBuffer[51],
                        v53: statusBuffer[52],
                        v54: statusBuffer[53],
                        v55: statusBuffer[54],
                        v56: statusBuffer[55]
                    };
                }
                return dfd.resolve(status);
            });
        });

        return dfd.promise;
    };

    /**
     * Ready
     * Resolves deferred object when the device's status is available.
     */
    GoPro.prototype.ready = function () {
        var that = this,
            dfd = when.defer(),
            timer;

        timer = setTimeout(function () {
            return dfd.reject(new GoProException('Cannot connect to GoPro device'));
        }, 5000);

        that.status().then(function () {
            clearTimeout(timer);
            return dfd.resolve();
        });

        return dfd.promise;
    };

    /**
     * Power
     * Activates or deactivates the camera (Note the "bacpac" is technically a separate device and can be active without the camera needing to be).
     */
    GoPro.prototype.power = function (io) {

        // Turn on camera : http://10.5.5.9/bacpac/PW?t=[password]&p=%01
        // Turn off camera : http://10.5.5.9/bacpac/PW?t=[password]&p=%00

        var dfd = when.defer(),
            that = this,
            power = 'on',
            timer;


        timer = setTimeout(function () {
            var message = (io === true) ? 'Cannot deactivate GoPro device' : 'Cannot activate GoPro device';
            return dfd.reject(new GoProException(message));
        }, 20000);

        if (io === undefined || io) {
            io = 1;
            power = 'on';
        } else {
            io = 0;
            power = 'off';
        }

        this.deviceCall('bacpac', 'PW', io).then(function () {
            function defPoll() {
                that.status().then(function (a) {
                    if (a.power === power) {
                        clearTimeout(timer);
                        return dfd.resolve();
                    }

                    defPoll();

                });
            }

            defPoll();
        });

        return dfd.promise;
    };

// Camera Mode
// Sets the mode of the camera
// VIDEO: http://10.5.5.9/bacpac/CM?t=[password]&p=%00, 
// PHOTO: http://10.5.5.9/bacpac/CM?t=[password]&p=%01, 
// BURST: http://10.5.5.9/bacpac/CM?t=[password]&p=%02, 
// TIMER: http://10.5.5.9/bacpac/CM?t=[password]&p=%03
    GoPro.prototype.setCameraMode = function (mode) {
        if (GoPro.CameraMode.inEnum(mode)) {
            return this.deviceCall('camera', 'CM', mode);
        }
    };

// Default Camera Mode
// Sets the default mode of the camera
// VIDEO: http://10.5.5.9/bacpac/DM?t=[password]&p=%00, 
// PHOTO: http://10.5.5.9/bacpac/DM?t=[password]&p=%01, 
// BURST: http://10.5.5.9/bacpac/DM?t=[password]&p=%02, 
// TIMER: http://10.5.5.9/bacpac/DM?t=[password]&p=%03
    GoPro.prototype.setDefaultCameraMode = function (mode) {
        if (GoPro.CameraMode.inEnum(mode)) {
            return this.deviceCall('camera', 'DM', mode);
        }
    };

// Video Resolution
// WVGA-120 : http://10.5.5.9/camera/VR?t=[password]&p=%01
// 720-30 : http://10.5.5.9/camera/VR?t=[password]&p=%02
// 720-60 : http://10.5.5.9/camera/VR?t=[password]&p=%03
// 960-30 : http://10.5.5.9/camera/VR?t=[password]&p=%04
// 960-60 : http://10.5.5.9/camera/VR?t=[password]&p=%05
// 1080-30 : http://10.5.5.9/camera/VR?t=[password]&p=%06
    GoPro.prototype.setVideoResolution = function (resolution) {
        if (GoPro.VideoResolution.inEnum(resolution)) {
            return this.deviceCall('camera', 'VR', resolution);
        }
    };

// FOV
// wide : http://10.5.5.9/camera/FV?t=[password]&p=%00
// medium : http://10.5.5.9/camera/FV?t=[password]&p=%01
// narrow : http://10.5.5.9/camera/FV?t=[password]&p=%02
    GoPro.prototype.setFieldOfVision = function (fov) {
        if (GoPro.FieldOfVision.inEnum(fov)) {
            return this.deviceCall('camera', 'FV', fov);
        }
    };

// Photo Resolution
// 11mp wide : http://10.5.5.9/camera/PR?t=[password]&p=%00
// 8mp medium : http://10.5.5.9/camera/PR?t=[password]&p=%01
// 5mp wide : http://10.5.5.9/camera/PR?t=[password]&p=%02
// 5mp medium : http://10.5.5.9/camera/PR?t=[password]&p=%03
    GoPro.prototype.setPhotoResolution = function (resolution) {
        if (GoPro.PhotoResolution.inEnum(resolution)) {
            return this.deviceCall('camera', 'PR', resolution);
        }
    };

// Timer
// 0,5sec : http://10.5.5.9/camera/TI?t=[password]&p=%00
// 1sec : http://10.5.5.9/camera/TI?t=[password]&p=%01
// 2sec : http://10.5.5.9/camera/TI?t=[password]&p=%02
// 5sec : http://10.5.5.9/camera/TI?t=[password]&p=%03
// 10sec : http://10.5.5.9/camera/TI?t=[password]&p=%04
// 30sec : http://10.5.5.9/camera/TI?t=[password]&p=%05
// 60sec : http://10.5.5.9/camera/TI?t=[password]&p=%06
    GoPro.prototype.setPhotoTimer = function (timer) {
        if (GoPro.Timer.inEnum(timer)) {
            return this.deviceCall('camera', 'TI', timer);
        }
    };

// Volume
// 0% : http://10.5.5.9/camera/BS?t=[password]&p=%00
// 70% : http://10.5.5.9/camera/BS?t=[password]&p=%01
// 100% : http://10.5.5.9/camera/BS?t=[password]&p=%02
    GoPro.prototype.setVolume = function (volume) {
        if (GoPro.Volume.inEnum(volume)) {
            return this.deviceCall('camera', 'BS', volume);
        }
    };

// LED
// OFF : http://10.5.5.9/camera/BS?t=[password]&p=%00
// TWO : http://10.5.5.9/camera/BS?t=[password]&p=%01
// FOUR : http://10.5.5.9/camera/BS?t=[password]&p=%02
    GoPro.prototype.setLED = function (led) {
        if (GoPro.LED.inEnum(led)) {
            return this.deviceCall('camera', 'LB', led);
        }
    };

// Preview 
// On : http://10.5.5.9/camera/PV?t=[password]&p=%02
// Off : http://10.5.5.9/camera/PV?t=[password]&p=%01
    GoPro.prototype.preview = function (preview) {
        return this.deviceCall('bacpac', 'PV', ((preview === undefined || preview) ? 2 : 1));
    };

// Orientation 
// Head up : http://10.5.5.9/camera/UP?t=[password]&p=%00
// Head down : http://10.5.5.9/camera/UP?t=[password]&p=%01
    GoPro.prototype.orientUp = function (orient) {
        return this.deviceCall('bacpac', 'UP', ((orient === undefined || orient) ? 0 : 1));
    };

// Localisation 
// On : http://10.5.5.9/camera/LL?t=[password]&p=%01
// Off : http://10.5.5.9/camera/LL?t=[password]&p=%00
    GoPro.prototype.locate = function (active) {
        return this.deviceCall('camera', 'LL', ((active === undefined || active) ? 1 : 0));
    };

// Protune 
// On : http://10.5.5.9/camera/PT?t=[password]&p=%01
// Off : http://10.5.5.9/camera/PT?t=[password]&p=%00
    GoPro.prototype.protune = function (active) {
        return this.deviceCall('camera', 'PT', ((active === undefined || active) ? 1 : 0));
    };

// Spot Meter 
// On : http://10.5.5.9/camera/EX?t=[password]&p=%01
// Off : http://10.5.5.9/camera/EX?t=[password]&p=%00
    GoPro.prototype.spotMeter = function (active) {
        return this.deviceCall('camera', 'EX', ((active === undefined || active) ? 1 : 0));
    };

// One Button
// On : http://10.5.5.9/camera/OB?t=[password]&p=%01
// Off : http://10.5.5.9/camera/OB?t=[password]&p=%00
    GoPro.prototype.oneButton = function (active) {
        return this.deviceCall('camera', 'OB', ((active === undefined || active) ? 1 : 0));
    };

// Capture
// Start capture : http://10.5.5.9/bacpac/SH?t=[password]&p=%01
// Stop capture : http://10.5.5.9/bacpac/SH?t=[password]&p=%00
    GoPro.prototype.capture = function (active) {
        return this.deviceCall('camera', 'SH', ((active === undefined || active) ? 1 : 0));
    };

// OnScreen Display:
// On : http://10.5.5.9/camera/OS?t=[password]&p=%01
// Off : http://10.5.5.9/camera/OS?t=[password]&p=%00
    GoPro.prototype.onScreen = function (active) {
        return this.deviceCall('camera', 'OS', ((active === undefined || active) ? 1 : 0));
    };

// Video Mode:
// PAL : http://10.5.5.9/camera/VM?t=[password]&p=%01
// NTSC : http://10.5.5.9/camera/VM?t=[password]&p=%00
    GoPro.prototype.setVideoMode = function (mode) {
        if (GoPro.VideoMode.inEnum(mode)) {
            return this.deviceCall('camera', 'VM', mode);
        }
    };

// Auto Power Off:
// NEVER : http://10.5.5.9/camera/AO?t=[password]&p=%01
// SECONDS_60 : http://10.5.5.9/camera/AO?t=[password]&p=%01
// SECONDS_120 : http://10.5.5.9/camera/AO?t=[password]&p=%02
// SECONDS_300 : http://10.5.5.9/camera/AO?t=[password]&p=%03
    GoPro.prototype.setAutoPowerOff = function (mode) {
        if (GoPro.AutoPowerOff.inEnum(mode)) {
            return this.deviceCall('camera', 'AO', mode);
        }
    };

// White Black Balance
// AUTO : http://10.5.5.9/camera/WB?t=[password]&p=%01
// WB_3000K : http://10.5.5.9/camera/WB?t=[password]&p=%01
// WB_5500K : http://10.5.5.9/camera/WB?t=[password]&p=%02
// WB_6500K : http://10.5.5.9/camera/WB?t=[password]&p=%03
// CAMRAW : http://10.5.5.9/camera/WB?t=[password]&p=%04
    GoPro.prototype.setWhiteBlack = function (mode) {
        if (GoPro.WhiteBlack.inEnum(mode)) {
            return this.deviceCall('camera', 'WB', mode);
        }
    };

// Loop Video:
// OFF : http://10.5.5.9/camera/LO?t=[password]&p=%01
// MIN_5 : http://10.5.5.9/camera/LO?t=[password]&p=%01
// MIN_20 : http://10.5.5.9/camera/LO?t=[password]&p=%02
// MIN_60 : http://10.5.5.9/camera/LO?t=[password]&p=%03
// MIN_60 : http://10.5.5.9/camera/LO?t=[password]&p=%03
    GoPro.prototype.setLoopVideo = function (mode) {
        if (GoPro.LoopVideo.inEnum(mode)) {
            return this.deviceCall('camera', 'LO', mode);
        }
    };

// Continuous Shot
// SINGLE : http://10.5.5.9/camera/CS?t=[password]&p=%01
// THREE_SPS : http://10.5.5.9/camera/CS?t=[password]&p=%01
// FIVE_SPS : http://10.5.5.9/camera/CS?t=[password]&p=%02
// TEN_SPS : http://10.5.5.9/camera/CS?t=[password]&p=%03
    GoPro.prototype.setContinuousShot = function (mode) {
        if (GoPro.ContinuousShot.inEnum(mode)) {
            return this.deviceCall('camera', 'CS', mode);
        }
    };

// Burst Rate
// BR_3_1s : http://10.5.5.9/camera/BU?t=[password]&p=%01
// BR_10_1s : http://10.5.5.9/camera/BU?t=[password]&p=%02
// BR_10_2s : http://10.5.5.9/camera/BU?t=[password]&p=%03
// BR_30_1s : http://10.5.5.9/camera/BU?t=[password]&p=%04
// BR_30_2s : http://10.5.5.9/camera/BU?t=[password]&p=%05
// BR_30_3s : http://10.5.5.9/camera/BU?t=[password]&p=%06
    GoPro.prototype.setBurstRate = function (mode) {
        if (GoPro.BurstRate.inEnum(mode)) {
            return this.deviceCall('camera', 'BU', mode);
        }
    };

// Delete Last
// Deletes the last file recorded on the devices (video or image)
    GoPro.prototype.deleteLast = function () {
        return this.deviceCall('camera', 'DL');
    };

// Delete All
// Technically formats the camera
    GoPro.prototype.deleteAll = function () {
        return this.deviceCall('camera', 'DA');
    };

// List specified directory
    GoPro.prototype.listDirectory = function (path) {
        var dfd = when.defer(),
            files = [],
            that = this;

        this.request(this.webUrl + (path || ''),
            function (e, res, body) {
                if (e || res.statusCode !== 200) {
                    return dfd.reject(e.stack || e || res.statusCode);
                }
                $.load(body)('#dirlist table tbody tr').each(function () {
                    var name = $(this).find('a.link').attr('href'),
                        size = $(this).find('span.size').text();
                    files.push({
                        name: name,
                        isDirectory: name[name.length - 1] === '/',
                        path: path,
                        absolutePath: that.webUrl + path,
                        created: new Date($(this).find('span.date').text()),
                        fileSize: size !== '-' ? size : null
                    });
                });
                return dfd.resolve(files);
            });
        return dfd.promise;
    };

// Recursively list directory from specified directory
    GoPro.prototype.requestFileSystem = function (root) {
        var dfd = when.defer(),
            that = this,
            files = [],
            recursions = 1;

        root = (root !== undefined) ? root : '';

        function recurse(dir) {

            that.listDirectory(dir).then(function (paths) {
                when.map(paths, function (path) {
                    if (path.isDirectory) {
                        dir = (dir.charAt(dir.length - 1) !== '/') ? dir + '/' : dir;
                        recurse(dir + path.name);
                        recursions += 1;
                    }
                    files.push(path);
                }).then(function () {
                    recursions -= 1;
                    if (!recursions) {
                        return dfd.resolve(files); //Sort files
                    }
                });
            });
        }

        recurse(root);

        return dfd.promise;
    };

// Downloads file from camera to 'toPath' location 
    GoPro.prototype.copyFile = function (fromPath, toPath) {

        var dfd = when.defer();

        when.resolve(this.request(fromPath)).then(function (src) {

            var out, name;

            name = Math.floor(Math.random() * new Date().getTime()) + "." + (fromPath.split('.').pop());
            toPath = toPath ? process.cwd() + '/' + toPath + '/' + name : process.cwd() + '/' + name;
            out = fs.createWriteStream(toPath);

            out.on('error', function (error) {
                return dfd.reject(new GoProException('Failed to copy ' + fromPath + ' from device.', error));
            });

            out.on('close', function () {
                return dfd.resolve({
                    fileName: name,
                    path: toPath
                });
            });

            out.on('finish', function () {
                return dfd.resolve({
                    fileName: name,
                    path: toPath
                });
            });

            out.on('end', function () {
                return dfd.resolve({
                    fileName: name,
                    path: toPath
                });
            });

            src.on('error', dfd.reject.bind(dfd));
            src.pipe(out);
        });

        return dfd.promise;
    };

//Ensure provided arguments exist in specified Enum
    Object.prototype.inEnum = function (v) {
        var prop;
        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                if (this[prop] === v) {
                    return true;
                }
            }
        }
    };

//Ensure provided arguments exist in specified Enum
    Object.prototype.getProp = function (v) {
        var prop;
        for (prop in this) {
            if (this.hasOwnProperty(prop)) {
                if (this[prop] === v) {
                    return prop;
                }
            }
        }
    };

    GoPro.CameraMode = {
        VIDEO: 0,
        PHOTO: 1,
        BURST: 2,
        TIMER: 3,
        HDMI: 5
    };

    GoPro.VideoResolution = {
        WVGA_120: 1,
        HD_720_30: 2,
        HD_720_60: 3,
        HD_960_30: 4,
        HD_960_60: 5,
        FHD_1080_30: 6
    };

    GoPro.FieldOfVision = {
        WIDE: 0,
        MEDIUM: 1,
        NARROW: 2
    };

    GoPro.PhotoResolution = {
        WIDE_11MP: 0,
        MEDIUM_8MP: 1,
        WIDE_5MP: 2,
        MEDIUM_5MP: 3
    };

    GoPro.Timer = {
        HALF_SECOND: 0,
        ONE_SECOND: 1,
        TWO_SECOND: 2,
        FIVE_SECOND: 3,
        TEN_SECOND: 4,
        THIRTY_SECOND: 5,
        SIXTY_SECOND: 6
    };

    GoPro.Volume = {
        MUTE: 0,
        MEDIUM: 1,
        FULL: 2
    };

    GoPro.LED = {
        OFF: 0,
        TWO: 1,
        FOUR: 2
    };

    GoPro.VideoMode = {
        NTSC: 0,
        PAL: 1
    };

    GoPro.AutoPowerOff = {
        NEVER: 0,
        SECONDS_60: 1,
        SECONDS_120: 2,
        SECONDS_300: 3
    };

    GoPro.LoopVideo = {
        OFF: 0,
        MIN_5: 1,
        MIN_20: 2,
        MIN_60: 3,
        MAX: 5
    };

    GoPro.WhiteBlack = {
        AUTO: 0,
        WB_3000K: 1,
        WB_5500K: 2,
        WB_6500K: 3,
        CAMRAW: 4
    };

    GoPro.ContinuousShot = {
        SINGLE: 0,
        THREE_SPS: 3,
        FIVE_SPS: 5,
        TEN_SPS: 'a'
    };

    GoPro.BurstRate = {
        RATE3_1s: 0,
        RATE5_1s: 1,
        RATE10_1s: 2,
        RATE10_2s: 3
    };

    module.exports = GoPro;


    /*
     video resolutions HERO2 and HERO3 silver:
     camera VR - 00 WVGA 60
     camera VR - 01 WVGA 120
     camera VR - 02 720 30
     camera VR - 03 720 60
     camera VR - 04 960 30
     camera VR - 05 960 48
     camera VR - 06 1080 30
     video resolutions Black edition:
     NOTE: SOME BUTTONS LEAD DIFFERENT RESOLUTIONS!
     camera VR - 03 2.7kCin24
     camera VR - 05 1080 25
     camera VR - 03 720 60
     camera VR - 06 960 48
     Protune Resolutions HERO2 and HERO3 silver:
     camera VR - 07 1080 30 Protune
     camera VR - 08 1080 24 Protune
     camera VR - 11 1080 25 Protune
     camera VR - 09 960 60 Protune

     Protune Resolutions HERO3 black ONLY IF PROTUNE IS ON:
     NOTE: SOME BUTTONS LEAD DIFFERENT RESOLUTIONS!
     camera VR - 02 4kCin12T
     camera VR - 03 2.7kCin24T
     camera VR - 06 720 60T
     camera VR - 07 960 100T
     camera VR - 08 1080 60T

     Photo resolution HERO2 and HERO3 silver:
     camera PR - 00 11mpW
     camera PR - 01 8mpM
     camera PR - 02 5mpW
     camera PR - 03 5mpM

     Photo resolution Black ed:
     camera PR - 05 12mpW
     camera PR - 04 7mpW
     camera PR - 06 7mpM
     camera PR - 03 5mpM
     */
}(GoProException));