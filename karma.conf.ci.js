const baseConfig = require('./karma.conf.js');

module.exports = function (config) {
    baseConfig(config);
    config.set({
        plugins: [
            require('karma-jasmine'),
            require('karma-firefox-launcher'),
            require('karma-phantomjs-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage-istanbul-reporter'),
            require('karma-junit-reporter'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        browsers: ['PhantomJS'],
        singleRun: true
    });
};
