# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).

## [2.0.0] - 2026-10-30

### Breaking changes

- `router.group()` returns the router it was called on, like `app.group()`, instead of the new child router. Chained calls on a router now create sibling groups instead of nesting them (#4).
- `express` is now a peer dependency (`^4.17.1 || ^5.0.0`): install it in your app (#5).
- Invalid calls throw a `TypeError` before anything is mounted (#4, #7).
- Node.js 18 or later is required (#10).

### Added

- Middlewares on groups: `group(path, ...middlewares, callback)`, `group(path, [middlewares], callback)` and `group(middleware, callback)` (#4).
- Regexp paths and (nested) arrays of paths (#4).
- Express 5 support (#8).
- Function form: `require('express-routes-group')(app, ...args)`, for apps created before the library was required (#4).
- Clear errors for a missing or invalid callback, a middleware passed as the callback, and detached calls (#4).

### Fixed

- Parameters in the group path (e.g. `/users/:id`) are now available in the group's routes (#4).

### Changed

- README rewritten for 2.0, LICENSE file added, package metadata completed. Only `index.js` is published (#9, #10).

## [1.0.4] - 2019-11-29

- First releases (1.0.0 to 1.0.4): `app.group()` and `router.group()` with an optional path prefix.

[2.0.0]: https://github.com/AsheTM/npm-express-routes-group/releases/tag/v2.0.0
