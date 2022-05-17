const baseConfig = require('./karma.conf.js');

process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
    baseConfig(config);
    config.set({
        plugins: [
            require('karma-jasmine'),
            require('karma-firefox-launcher'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('karma-junit-reporter'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        browsers: ['ChromeHeadless'],
        singleRun: true
    });
};
