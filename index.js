'use strict';
var fs = require('fs');
var path = require('path');
var exec = require('./lib/exec');

var lzz = './lzz-source/lazycpp';
switch (process.platform) {
	case 'darwin': lzz = './lzz-compiled/osx'; break;
	case 'win32': lzz = './lzz-compiled/windows.exe'; break;
	case 'linux': lzz = './lzz-compiled/linux'; break;
}
lzz = path.join(__dirname, lzz);


module.exports = function (args, moduleDir, debug) {
	if (!Array.isArray(args)) {
		return Promise.reject(new TypeError('Expected first argument to be an array'));
	}
	if (typeof moduleDir !== 'string') {
		return Promise.reject(new TypeError('Expected second argument to be a string'));
	}
	if (arguments.length < 3) {
		debug = process.env.NODE_ENV !== 'production';
	}
	
	var prerequisite = Promise.resolve();
	try {
		fs.accessSync(lzz, fs.constants.F_OK | fs.constants.X_OK);
	} catch (err) {
		prerequisite = exec('make', ['-f', 'Makefile.release'], path.dirname(lzz));
	}
	
	var gypArgs = debug ? ['rebuild', '--debug'] : ['rebuild'];
	args = args.slice();
	return prerequisite
		.then(function () {return exec(lzz, args, moduleDir);})
		.then(function () {return exec('node-gyp', gypArgs, moduleDir);});
};
