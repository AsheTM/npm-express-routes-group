// Preload: make require('express') resolve to the express5 alias,
// so the test suite runs against Express 5.
const Module = require('node:module');
const resolve = Module._resolveFilename;

Module._resolveFilename = function (request, ...rest) {
    return resolve.call(this, request === 'express' ? 'express5' : request, ...rest);
};
