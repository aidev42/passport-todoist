var parse = require('./profile').parse
  , uri = require('url')
  , util = require('util')
  , OAuth2Strategy = require('passport-oauth2')
  , InternalOAuthError = require('passport-oauth2').InternalOAuthError
  , request = require('request')

/**
 Creates an instance of 'OAuth2Strategy'.

Documentation:
https://developer.todoist.com/index.html#oauth


Todoist uses a static link for all API calls and does not take in a callback URL, instead they always divert to the callback URL in your app settings within 'manage app' options of their developer page.

Example passport.js strategy with mongoose:

  passport.use('todoist', new TodoistStrategy({
    clientID: TodoistKey,
    clientSecret: TodoistSecret,
  },
  function(accessToken, refreshToken, todoist, done){
    User.findOne({
      'todoist.id': todoist.id
    },
    function(err, user){
      if(err){ return done(err); }

      if(!user){
        var user = new User({
          'todoist.full_name' : todoist.full_name,
          'todoist.email': todoist.email,
          'todoist.id': todoist.id,
          'todoist.inbox_project': todoist.inbox_project,
          'todoist.access_token': todoist.access_token,
          'todist.sync_token': todoist.sync_token
        });
        user.save(function(err){
          if(err) console.log('error saving user' + err);
          return done(err, user);
        });
      } else {
          // update access and sync tokens
          user.todoist.access_token = todoist.access_token;
          user.todoist.sync_token = todoist.sync_token;
          user.save(function(err){
            if(err) console.log('error saving user' + err);
            return done(err, user);
          });
      }
    });
  }));

*/

//DEFINE URLs from API documentation
var authURL = 'https://todoist.com/oauth/authorize'
var tokenURL = 'https://todoist.com/oauth/access_token'
var syncURL = 'https://todoist.com/API/v7/sync' //Static link for all API calls per todoist documentation


function Strategy(options, verify){
  options = options || {};
  options.authorizationURL = options.authorizationURL || authURL;
  options.tokenURL = options.tokenURL || tokenURL;
  options.scopeSeparator = options.scopeSeparator || ',';
  OAuth2Strategy.call(this, options, verify);
  this.name = 'todoist';
  //Static link for all API calls per todoist documentation
  this._APIURL = syncURL;
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
//be retrieved with just the access token due to extra parameters todoist
//requires and no existing override optionality within passport.js

//Thus this is a hacky way of using a request function to take the returned
//access token and retrieve actual user data


Strategy.prototype.userProfile = function(accessToken, done) {
  var profile = {
    provider: 'todoist',
    access_token: accessToken
  };

  var options = {
    url: syncURL,
    method: 'POST',
    form: {
      token: accessToken,
      sync_token: '*',
      resource_types: JSON.stringify(["user"])
    }
  };

  request(options, callback);

  function callback(error, response, body) {
    var json;

    if (error) {
      if (error.data) {
        try {
          json = JSON.parse(error.data);
        } catch (_) {}
      }
      if (json && json.errors && json.errors.length) {
        var e = json.errors[0];
        return done(new APIError(e.message, e.code));
      }
      return done(new InternalOAuthError('Failed to fetch user profile', error));
    }

    try {
      json = JSON.parse(body);
    } catch (ex) {
      return done(new Error('Failed to parse user profile'));
    }

    var profile = parse(json); //this is required at the top of the file
    profile.provider = 'todoist';
    profile._raw = body;
    profile._json = json;

    done(null, profile);
  }
};

//Make `Strategy` available to passport
module.exports = Strategy;