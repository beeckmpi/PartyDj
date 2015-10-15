
// Declare middleware using express app that writes to the log



/* Init and return synth app */

var synth = require('synth')
  , bodyParser = require('body-parser')
  , expressJwt = require('express-jwt')
  , logger = require('morgan')
  , jwt = require('jwt-simple')
  , db = require('promised-mongo')(process.env.MONGODB || 'pdjn')
  , moment = require('moment')
  , request = require('request')
  , app = synth.app;
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', ensureAuthenticated);
var config = require('./config');
module.exports = require('synth')();
/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
function ensureAuthenticated(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send({ message: 'Please make sure your request has an Authorization header' });
  }
  var token = req.headers.authorization.split(' ')[1];
  var payload = null;
  try {
    payload = jwt.decode(token, config.TOKEN_SECRET);
    req.user = payload.sub;
  }
  catch (err) {
    return res.status(401).send({ message: err.message });
  }

  if (payload.exp <= moment().unix()) {
    return res.status(401).send({ message: 'Token has expired' });
  }
  next();
}

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
function createJWT(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.TOKEN_SECRET);
}
app.get("/videos/view/:id", function (req, res) {
  res.render('../front/html/videos/get.jade');
});

/*
 |--------------------------------------------------------------------------
 | Login with Google
 |--------------------------------------------------------------------------
 */
app.post('/auth/google', function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.GOOGLE_SECRET,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };
    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
      // Step 3a. Link user accounts.
      if (req.headers.authorization) {
        db.collection('users').findOne({ google: profile.sub }).then(function(existingUser, err) {          
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          db.collection('users').find({_id: payload.sub}).then(function(user, err) {            
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            var userInfo = {
              google : profile.sub,
              picture : user.picture || profile.picture.replace('sz=50', 'sz=200'),
              displayName : user.displayName || profile.name,
            };
            db.collection('users').findAndModify({ query: {_id: user._id}, update: {$set: userInfo}}).then(function(user){
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        db.collection('users').findOne({ google: profile.sub }).then(function(existingUser, err) {
          if (existingUser) {
            return res.send({ token: createJWT(existingUser) });
          }
          var userInfo = {
            google : existingUser.google,
            picture : profile.picture.replace('sz=50', 'sz=200'),
            displayName : profile.name,
          };
          db.collection('users').save(userInfo);
          var token = createJWT(userInfo);
          res.send({ token: token, user: userInfo});
        });
      }
    });
  });
});
/*
 |--------------------------------------------------------------------------
 | Login with Facebook
 |--------------------------------------------------------------------------
 */
app.post('/auth/facebook', function(req, res) {
  var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.3/me';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: config.FACEBOOK_SECRET,
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }
      if (req.headers.authorization) {
        db.collection('users').findOne({ facebook: profile.id }).then(function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          db.collection('users').find({_id: payload.sub}).then(function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            var userInfo = {
              google : profile.sub,
              picture : user.picture || profile.picture.replace('sz=50', 'sz=200'),
              displayName : user.displayName || profile.name,
            };
            db.collection('users').findAndModify({ query: {_id: user._id}, update: {$set: userInfo}}).then(function(user){
              var token = createJWT(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        db.collection('users').findOne({ facebook: profile.id }).then(function(err, existingUser) {
          if (existingUser) {
            var token = createJWT(existingUser);
            return res.send({ token: token });
          }
          var userInfo = {
              google : profile.sub,
              picture : user.picture || profile.picture.replace('sz=50', 'sz=200'),
              displayName : user.displayName || profile.name,
            };
            db.collection('users').findAndModify({ query: {_id: user._id}, update: {$set: userInfo}}).then(function(user){
              var token = createJWT(user);
              res.send({ token: token });
            });
        });
      }
    });
  });
});

/*
 |--------------------------------------------------------------------------
 | Unlink Provider
 |--------------------------------------------------------------------------
 */
app.get('/auth/unlink/:provider', ensureAuthenticated, function(req, res) {
  var provider = req.params.provider;
  var providers = ['facebook', 'google', 'live', 'twitter'];

  if (provider.indexOf(providers) === -1) {
    return res.status(400).send('Unknown provider');
  }

  User.findById(req.user, function(err, user) {
    if (!user) {
      return res.status(400).send({ message: 'User not found' });
    }
    user[provider] = undefined;
    user.save(function() {
      res.status(200).end();
    });
  });
});

