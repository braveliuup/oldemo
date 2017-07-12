var path = require('path');

module.exports = {
    entry: ['./js/config', './js/log', './js/mapHelper', './js/mark', './js/api_v1.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    }
};