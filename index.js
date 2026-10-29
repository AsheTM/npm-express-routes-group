const express = require('express');

express.Router.group = group;

express.application.group = group;

function group(path, ...fnList) {
    if (!this || typeof this.use !== 'function') {
        throw new TypeError('group() must be called on an app or a router: app.group(...), router.group(...) or group(app, ...)');
    }

    function isPath(path) {
        return typeof path === 'string' || path instanceof RegExp;
    }

    function isPathList(value) {
        const paths = Array.isArray(value) ? value.flat(Infinity) : [];

        return paths.length > 0 && paths.every(isPath);
    }

    if (typeof path === 'function') {
        fnList.unshift(path);
        path = '/';
    } else if (!isPath(path) && !isPathList(path)) {
        throw new TypeError('Path (first argument) must be a string, a regexp, an array of paths, or a function');
    }

    if (fnList.length === 0) {
        throw new TypeError('At least one function must be provided after the path');
    }

    if (!fnList.flat(Infinity).every(fn => typeof fn === 'function')) {
        throw new TypeError('All arguments after the first must be functions');
    }

    const callback = fnList.pop();

    if (callback.length > 1) {
        throw new TypeError('Last argument must be the group callback (router) => {}, but it looks like a middleware (req, res, next)');
    }

    const router = express.Router({ mergeParams: true });

    callback(router);
    this.use(path, ...fnList, router);

    return this;
}

module.exports = (target, ...args) => group.apply(target, args);
