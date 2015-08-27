var through = require('through2');
var gutil = require('gulp-util');
var request = require('request');
var path = require('path');
var fs = require('fs');

var PluginError = gutil.PluginError;
var green = gutil.colors.green;

const PLUGIN_NAME = "gulp-send-mail";

function sendMail(options) {
    var mailJsonFile, mailHtmlFile;

    function transformFile(file, env, callback) {
        //var verbose = PLUGIN_NAME;
        //verbose += ", base: " + file.base;
        //verbose += ", path: " + file.path;
        //verbose += ", cwd: " + file.cwd;
        ////verbose += ", stat: " + file.stat;
        //console.log('file: ', verbose);

        var fileName = path.basename(file.path);
        if (fileName === 'mail.json')
            mailJsonFile = file;
        if (fileName === 'mail.html')
            mailHtmlFile = file;

        this.push(file);
        callback();
    }

    function flushFn(callback) {
        var mailJson = JSON.parse(mailJsonFile.contents.toString()),
            mailHtml = mailHtmlFile.contents.toString();

        gutil.log("start send mail ...");
        request.post(options.url, {
            form: {
                apiKey: options.apiKey,
                From: mailJson.from,
                To: mailJson.to,
                CC: mailJson.cc,
                Title: "重构待确认-" + mailJson.title,
                Content: mailHtml
            }
        }, function (err, resp, body) {
            if (err) {
                throw new PluginError(PLUGIN_NAME, "send mail error happen: " + err.stack);
            }
            gutil.log("send mail result: " + body);
            callback();
        });
    }

    return through.obj(transformFile, flushFn);
}

module.exports = sendMail;