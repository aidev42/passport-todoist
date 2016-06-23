var parse = require('./profile').parse
  , uri = require('url')
  , util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError;

/**
 Creates an instance of 'OAuth2Strategy'.

Documentation:
https://developer.todoist.com/index.html#oauth


Todoist uses a static link for all API calls and does not take in a callback URL, instead they always divert to the callback URL in your app settings within 'manage app' options of their developer page.

Example passport.js strategy with mongoose:

//INSERT EXAMPLE

*/


function Strategy(options, verify){
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://todoist.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://todoist.com/oauth/access_token';
  options.scopeSeparator = options.scopeSeparator || ',';
  OAuth2Strategy.call(this, options, verify);
  this.name = 'todoist';
  //Static link for all API calls per todoist documentation
  this._APIURL = 'https://todoist.com/API/v7/sync';
}


 //Inherit from `OAuth2Strategy`.
util.inherits(Strategy, OAuth2Strategy);



//Authenticate request by delegating to a service provider using OAuth 2.0.

Strategy.prototype.authenticate = function(req, options) {

  // When a user denies access to your app, redirects to a url containing
  // an 'error' query parameter describing the error:
  // https://example.com/oauth?error=user+denied+access
  if (req.query && req.query.error) {
    return this.fail();
  }

  // Call the base class for standard OAuth2 authentication.
  OAuth2Strategy.prototype.authenticate.call(this, req, options);
};


//Per documentation todoist takes 3 parameters for initial
// authorization request:
// 1. your app's unique clientID
// 2. the scope of requested permissions (ie. read/write)
// 3. a state (for defense against CSRF attacks). Note this can be left blank

Strategy.prototype.authorizationParams = function(options){
  var params = {};
  if(options.client_id)
    params.client_id = options.client_id;
  if(options.scope)
    params.scope = options.scope;
  if(options.state)
    params.state = options.state;
  return params
}


//Note that after initial authorization, unlike many APIs a permanent
//userID or profile is not passed back in authorization and can not
//be retrieved only via the access token due to extra parameters todoist
//requires and no existing override optionality within passport.js

//Thus this is a hacky way of using a request function to take the returned
//access token and retrieve actual user data-- NOT YET BUILT


Strategy.prototype.userProfile = function(accessToken, done) {

    var profile = {
      provider: 'todoist',
      access_token: accessToken
    };
    done(null, profile);

//IGNORE- to be used later for parsing json data about user
  // this._oauth2.get(this._APIURL, accessToken, function (err, body, res) {
  //   var json;

  //   if (err) {
  //     if (err.data) {
  //       try {
  //         json = JSON.parse(err.data);
  //       } catch (_) {}
  //     }
  //     if (json && json.errors && json.errors.length) {
  //       var e = json.errors[0];
  //       return done(new APIError(e.message, e.code));
  //     }
  //     return done(new InternalOAuthError('Failed to fetch user profile', err));
  //   }

  //   try {
  //     json = JSON.parse(body);
  //   } catch (ex) {
  //     return done(new Error('Failed to parse user profile'));
  //   }

  //   var profile = parse(json); //this is required at the top of the file
  //   profile.provider = 'todoist';
  //   profile._raw = body;
  //   profile._json = json.data.user;

  //   done(null, profile);
  //});
};


//Make `Strategy` available to passport
module.exports = Strategy;