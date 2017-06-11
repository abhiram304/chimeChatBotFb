var express           =     require('express')
  , passport          =     require('passport')
  , util              =     require('util')
  , FacebookStrategy  =     require('passport-facebook').Strategy
  , session           =     require('express-session')
  , cookieParser      =     require('cookie-parser')
  , bodyParser        =     require('body-parser')
  , config            =     require('./configuration/config')
  , mysql             =     require('mysql')
  , app               =     express();

//Define MySQL parameter in Config.js file.
var connection = mysql.createConnection({
  host     : config.host,
  user     : config.username,
  password : config.password,
  database : config.database
});
//EAAYAllYwB8EBAGpdHGX0d5oyTTC5fJnbnh15ck1ZBUgGJrD45cVfkhPVcSJbrJcO59YsVpvXhRkQ3tdap39D2g2OZBxmZBpQz7P8Pt1hjDYrFIIknjyHDCM9coMDJZBlFrsKZCHinln4nIx5ZBNerjOVXep8S9ZCIZBk9LROgZAMt7gZDZD
//Connect to Database only if Config.js parameter is set.

if(config.use_database==='true')
{
    connection.connect();
}

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


// Use the FacebookStrategy within Passport.

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.callback_url,
    profileFields: ['id', 'emails', 'name']
  },
  function(accessToken, refreshToken, profile, done) {
	  console.log("passport used ="+profile.emails[0].value);
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
      console.log("Details: "+profile.id);
    	if(config.use_database==='true')
      {
      connection.query("SELECT * from user where fbid="+profile.id,function(err,rows,fields){
        if(err) throw err;
        if(rows.length===0)
          {
            console.log("There is no such user, adding now "+ JSON.stringify(profile));
            connection.query("INSERT into user(name, fbid, email) VALUES('"+profile.name.givenName+"','"+profile.id+"', '"+profile.emails[0].value+"')");
          }
          else
            {
              console.log("User already exists in database");
            }
          });
      }
      return done(null, profile);
    });
  }
));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'working secret', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});
//Verify fb messnger
app.get('/webhook', function(req, res) {
	  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'chime') {
	    res.status(200).send(req.query['hub.challenge']);
	  } else {
	    res.status(403).end();
	  }
	});
//EAAGCu5vOWZA8BACWsfqfZCz6ZCjBZAFwpfkMF8zfDqNrBwnGqpUunHFeBQFdEPFS20gnsQjYvHkm2E7AR4d0VLE25PHElmFXZBYJqUXQm1L9izZCJIod4hQOrrbF7mSLzL7RCqClVwSumZAqV1EIBSxOcjZBVfjHMnrF5vFrH0aodQZDZD
//Post messages

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});


app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));
app.get('/connect/facebook', passport.authorize('facebook', { scope : ['email'] }));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
	console.log("In the redirect:");
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

app.listen(3000);
