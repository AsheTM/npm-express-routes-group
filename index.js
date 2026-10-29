const express = require('express');

express.Router.group = group;

express.application.group = group;

function group(...[path, ...fnList]) {
    if(!this || typeof this.use !== 'function') {
        throw new Error('group() must be called on an app or a router: app.group(...), router.group(...) or group(app, ...)');
    }

    function isPath(path) {
        return typeof path === 'string' || path instanceof RegExp;
    }

    const validFirstArg = isPath(path) ||
        Array.isArray(path) && path.flat(Infinity).length > 0 && path.flat(Infinity).every(isPath);

    if(!(validFirstArg || typeof path === 'function')) {
        throw new Error('Path (first argument) must be a string, a regexp, or a function');
    }

    if((validFirstArg || typeof path === 'function') && !fnList.flat(Infinity).every(fn => typeof fn === 'function')) {
        throw new Error('All arguments after the first must be functions');
    }

    if((validFirstArg || typeof path !== 'function') && fnList.length === 0) {
        throw new Error('At least one function must be provided after the path');
    }

    const callback = fnList.length === 0 ? path : fnList[fnList.length - 1];

    if(callback.length > 1) {
        throw new Error('Last argument must be the group callback (router) => {}, but it looks like a middleware (req, res, next)');
    }

    const router = express.Router({ mergeParams: true });

    if(fnList.length === 0) {
        const fn = path;

        fn(router);
        this.use(router);
    } else {
        const fn = fnList.pop();

        fn(router);
        this.use(path, ...fnList, router);
    }
    

    return this;
}

module.exports = (target, ...args) => group.apply(target, args);
