const express = require('express');

express.Router.group = group;

express.application.group = group;

function group(arg1, arg2) {
    let fn, path;
    
    if (arg2 === undefined) {
        path = "/";
        fn = arg1;
    } else {
        path = arg1;
        fn = arg2;
    }

    let router = express.Router();

    fn(router);
    this.use(path, router);

    return this;
}