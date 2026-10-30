# express-routes-group

Group Express routes under a common path prefix and shared middlewares, with chaining.

```js
app.group('/api/v1', auth, (router) => {
    router.get('/users', listUsers);   // GET /api/v1/users
    router.post('/users', createUser); // POST /api/v1/users
});
```

## Installation

```bash
npm install express-routes-group
```

Requirements:

- Node.js 18 or later
- Express 4.17+ or Express 5 (installed in your app; it is a peer dependency)

## Usage

Require the library **once, before creating your app**. It adds a `group()` method to every Express app and router.

```js
const express = require('express');
require('express-routes-group');

const app = express();

app.group('/api', (router) => {
    router.get('/users', listUsers);    // GET /api/users
    router.get('/users/:id', getUser);  // GET /api/users/:id
});

app.listen(3000);
```

The callback receives a new router. Every route you add to it is mounted under the group's path.

### Call forms

```js
app.group(callback);                              // no prefix
app.group(path, callback);                        // prefix
app.group(path, middleware, callback);            // prefix + middleware
app.group(path, middleware1, middleware2, callback);
app.group(path, [middleware1, middleware2], callback);
app.group(middleware, callback);                  // middleware, no prefix
```

The **last argument is always the callback**. Everything between the path and the callback is a middleware.

### Paths

A path can be a string, a regular expression, or an array of them:

```js
app.group('/users', (router) => { /* ... */ });
app.group(/^\/v\d+/, (router) => { /* ... */ });          // /v1, /v2, ...
app.group(['/users', '/members'], (router) => { /* ... */ });
```

### Middlewares

Middlewares run before the group's routes, and only for requests that match the group's path:

```js
app.group('/admin', requireLogin, requireAdmin, (router) => {
    router.get('/dashboard', showDashboard); // requireLogin, then requireAdmin, then showDashboard
});

app.get('/public', showPublic);              // no middleware from the /admin group
```

### Without a prefix

Leave out the path to group routes, or to share middlewares, without adding a prefix:

```js
app.group(requireLogin, (router) => {
    router.get('/profile', showProfile);     // GET /profile, after requireLogin
});
```

A group without a path is mounted at `/`, so its middlewares run for **every request** that reaches it, including requests for routes declared after it.

### Route parameters

Parameters in the group's path are available in its routes:

```js
app.group('/users/:userId', (router) => {
    router.get('/posts', (req, res) => {
        res.send(`Posts of user ${req.params.userId}`); // GET /users/42/posts
    });
});
```

### Chaining

`group()` returns the app (or router) it was called on, so groups can be chained:

```js
app
    .group('/api/v1', (router) => {
        router.get('/users', listUsersV1);   // GET /api/v1/users
    })
    .group('/api/v2', (router) => {
        router.get('/users', listUsersV2);   // GET /api/v2/users
    });
```

### Nested groups

The router passed to the callback has `group()` too:

```js
app.group('/api', (api) => {
    api.group('/v1', (v1) => {
        v1.get('/users', listUsers);         // GET /api/v1/users
    });
});
```

### Routers

`group()` works on any Express router, not only on the app:

```js
const router = express.Router();

router.group('/users', (users) => {
    users.get('/', listUsers);
});

app.use('/api', router);                     // GET /api/users
```

### Function form

The library also exports `group()` as a plain function. Use it when you prefer not to rely on the added method, or when an app was created before the library was required:

```js
const group = require('express-routes-group');

group(app, '/api', (router) => {
    router.get('/users', listUsers);         // GET /api/users
});
```

It takes the app or router first, then the same arguments as `app.group()`.

With ES modules:

```js
import group from 'express-routes-group';
```

## Errors

Invalid calls throw a `TypeError` before anything is mounted:

| Call | Reason |
| --- | --- |
| `app.group()`, `app.group(123, cb)`, `app.group({}, cb)` | The first argument is not a path or a function |
| `app.group([], cb)`, `app.group(['/a', mw], cb)` | An array of paths must be non-empty and contain only paths |
| `app.group('/users')` | No callback |
| `app.group('/users', 'x')`, `app.group('/users', 'x', cb)` | A middleware or the callback is not a function |
| `app.group('/users', cb, mw)`, `app.group(mw)` | The last argument looks like a middleware (see below) |
| `const { group } = app; group('/users', cb)` | `group()` was called without an app or router |

## Limitations

- **Require the library before calling `express()`.** Express copies its methods into each app when the app is created, so an app created earlier has no `group()` method. Use the [function form](#function-form) for those apps.
- **The callback is detected by its number of parameters.** The callback takes at most one parameter (the router), while a middleware takes three (`req, res, next`) or four (`err, req, res, next`). A function with more than one parameter in the callback position is rejected. A middleware written with rest parameters, such as `(...args) => {}`, has zero declared parameters and can't be told apart from a callback.

## Migrating from 1.x

- **`router.group()` now returns the router it was called on**, like `app.group()`, instead of the new child router. Chained calls on a router now create sibling groups instead of nesting them:

  ```js
  router
      .group('/a', (r) => { /* ... */ })
      .group('/b', (r) => { /* ... */ }); // 1.x: /a/b · 2.x: /b
  ```

- **Express is a peer dependency.** Install Express in your app if it isn't already.
- **Invalid calls throw a `TypeError`** instead of failing later inside Express.

## Credits

Inspired by [express-group-routes](https://www.npmjs.com/package/express-group-routes).

## License

[ISC](LICENSE)
