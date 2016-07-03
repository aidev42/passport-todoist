# Passport-Todoist-OAuth

[Passport](http://passportjs.org/) strategies for authorizing read/write with [Todoist](https://doist.com/)
using OAuth 2.0.

This module lets you authenticate using Todoist in your Node.js applications.
By plugging into Passport, Todoist authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm i passport-todoist


## Usage of OAuth 2.0

#### Configure Strategy

The Todoist OAuth 2.0 authentication strategy authenticates users using a Todoist
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying a `clientID` and `clientSecret`. Note that per Todoist API
documentation they always redirect to the callback URL specified in your
[Todoist developer app management] (https://developer.todoist.com/appconsole.html/)

    var VenmoStrategy = require('passport-venmo').Strategy;

    passport.use('todoist', new TodoistStrategy({
        clientID: TodoistKey,
        clientSecret: TodoistSecret
    },
      function(accessToken, todoist, done) {
        User.findOrCreate({ TodoistID: todoist.id }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'todoist'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

      app.get('/auth/todoist',
        passport.authenticate('todoist', { scope: 'data:read_write'}));

      app.get('/auth/todoist/callback',
        passport.authenticate('todoist', {successRedirect: '/profile', failureRedirect: '/'}));

## Credits

  - [Matt R O'Connor](http://github.com/mattroconnor)

## License

ISC

Copyright (c) 2016
