"use strict";

var request = require('request');
var exec = require('child_process').exec;
var querystring = require('querystring');
var fs = require('fs');

var Say = module.exports = function(passwd) {
	this.voicerss_passwd = passwd
};

Say.prototype.google = function(str) {
	var writeStream = fs.createWriteStream('./tts.mp3');
	console.log('[say]str: ' + str);
	var params = {
		ie: 'UTF-8',
		q: str,
		tl: 'zh'
	};
	var params_full = {
		ie: 'UTF-8',
		total: 1,
		idx: 0,
		textlen: 32,
		client: 'tw-ob',
		q: str,
		tl: 'zh'
	};
	writeStream
		.on('finish', function() {
			console.log('Done.');
			exec('madplay -o wave:- /root/tts.mp3 | aplay -D plughw:1,0'); //, '--duration=10'
		});

	request
		.get({
			url: 'http://translate.google.com/translate_tts?' + querystring.stringify(params_full),
		})
		.on('error', function (err) {
			console.log(err);
		})
		.pipe(writeStream);
};

