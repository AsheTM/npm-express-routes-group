const { describe, it, mock, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');

const group = require('./index');

// What group() passed to parent.use(). use(router) and use('/', router)
// do the same thing in Express, so a missing path is reported as '/'.
function mounted(parent) {
    assert.equal(parent.use.mock.callCount(), 1);

    const args = parent.use.mock.calls[0].arguments;

    return typeof args[0] === 'function' ? ['/', ...args] : args;
}

describe('express-routes-group', () => {
    const mw = (req, res, next) => next();
    const mw2 = (req, res, next) => next();

    let parent;

    beforeEach(() => {
        parent = express.Router();
        mock.method(parent, 'use');
    });

    // The call throws and nothing gets mounted.
    function assertRejected(call) {
        assert.throws(call, TypeError);
        assert.equal(parent.use.mock.callCount(), 0);
    }

    it('should define group on app and router instances', () => {
        assert.equal(typeof express().group, 'function');
        assert.equal(typeof express.Router().group, 'function');
    });

    describe('valid calls', () => {
        it('group(path, cb)', () => {
            let child;
            parent.group('/users', r => { child = r; });

            assert.deepEqual(mounted(parent), ['/users', child]);
        });

        it('group(regexp, cb)', () => {
            // Same object on both sides: Express adds its own properties to the regexp.
            const path = /^\/users/;
            let child;
            parent.group(path, r => { child = r; });

            const [mountedPath, mountedChild] = mounted(parent);
            assert.equal(mountedPath, path);
            assert.equal(mountedChild, child);
        });

        it('group([paths], cb)', () => {
            let child;
            parent.group(['/users', '/members'], r => { child = r; });

            assert.deepEqual(mounted(parent), [['/users', '/members'], child]);
        });

        it('group([[nested paths]], cb)', () => {
            let child;
            parent.group([['/users', '/members']], r => { child = r; });

            assert.deepEqual(mounted(parent), [[['/users', '/members']], child]);
        });

        it('group(cb)', () => {
            let child;
            parent.group(r => { child = r; });

            assert.deepEqual(mounted(parent), ['/', child]);
        });

        it('group(mw, cb)', () => {
            let child;
            parent.group(mw, r => { child = r; });

            assert.deepEqual(mounted(parent), ['/', mw, child]);
        });

        it('group(path, mw, mw2, cb)', () => {
            let child;
            parent.group('/users', mw, mw2, r => { child = r; });

            assert.deepEqual(mounted(parent), ['/users', mw, mw2, child]);
        });

        it('group(path, [mw, mw2], cb)', () => {
            let child;
            parent.group('/users', [mw, mw2], r => { child = r; });

            assert.deepEqual(mounted(parent), ['/users', [mw, mw2], child]);
        });
    });

    describe('callback', () => {
        it('should be called once with a new router', () => {
            const cb = mock.fn();

            parent.group('/users', cb);

            assert.equal(cb.mock.callCount(), 1);
            assert.equal(typeof cb.mock.calls[0].arguments[0].use, 'function');
        });

        it('should receive a router with mergeParams', () => {
            let child;
            parent.group('/users/:id', r => { child = r; });

            assert.equal(child.mergeParams, true);
        });
    });

    describe('invalid calls', () => {
        it('group()', () => {
            assertRejected(() => parent.group());
        });

        it('group(123, cb)', () => {
            assertRejected(() => parent.group(123, () => {}));
        });

        it('group({}, cb)', () => {
            assertRejected(() => parent.group({}, () => {}));
        });

        it('group([], cb)', () => {
            assertRejected(() => parent.group([], () => {}));
        });

        it('group([[]], cb)', () => {
            assertRejected(() => parent.group([[]], () => {}));
        });

        it('group([path, mw], cb)', () => {
            assertRejected(() => parent.group(['/users', mw], () => {}));
        });

        it('group(path) without callback', () => {
            assertRejected(() => parent.group('/users'));
        });

        it("group(path, 'x') with a non-function callback", () => {
            assertRejected(() => parent.group('/users', 'x'));
        });

        it("group(path, 'x', cb) with a non-function middleware", () => {
            assertRejected(() => parent.group('/users', 'x', () => {}));
        });

        it("group(path, [mw, 'x'], cb) with a non-function middleware in an array", () => {
            assertRejected(() => parent.group('/users', [mw, 'x'], () => {}));
        });

        it('group(mw) with a middleware instead of a callback', () => {
            assertRejected(() => parent.group(mw));
        });

        it('group(path, cb, mw) with arguments in the wrong order', () => {
            assertRejected(() => parent.group('/users', () => {}, mw));
        });

        it('should not call the callback when rejected', () => {
            const cb = mock.fn();

            assertRejected(() => parent.group(123, cb));
            assert.equal(cb.mock.callCount(), 0);
        });

        it('should throw when called detached from an app or router', () => {
            const detached = parent.group;

            assertRejected(() => detached('/users', () => {}));
        });
    });

    describe('return value and chaining', () => {
        it('app.group should return the app', () => {
            const app = express();

            assert.equal(app.group('/users', () => {}), app);
        });

        it('router.group should return the router', () => {
            assert.equal(parent.group('/users', () => {}), parent);
        });

        it('chained groups should be mounted on the same parent', () => {
            parent
                .group('/a', () => {})
                .group('/b', () => {});

            assert.equal(parent.use.mock.callCount(), 2);
            assert.equal(parent.use.mock.calls[0].arguments[0], '/a');
            assert.equal(parent.use.mock.calls[1].arguments[0], '/b');
        });
    });

    describe('exported function', () => {
        it('group(router, path, cb) should mount on the given router', () => {
            let child;
            group(parent, '/users', r => { child = r; });

            assert.deepEqual(mounted(parent), ['/users', child]);
        });

        it('group(app, path, cb) should return the app', () => {
            const app = express();

            assert.equal(group(app, '/users', () => {}), app);
        });

        it('group(undefined, path, cb) should throw', () => {
            assert.throws(() => group(undefined, '/users', () => {}), TypeError);
        });
    });
});
