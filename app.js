
/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path');
var request = require('request');
var app = express();

//all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

//development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);
//Verify fb messnger
app.get('/webhook', function(req, res) {
	if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'chime') {
		res.status(200).send(req.query['hub.challenge']);
	} else {
		res.status(403).end();
	}
});
//Post messages
app.post('/webhook', function(req, res)  {
	  console.log(req.body);
	  if (req.body.object === 'page') {
	    req.body.entry.forEach(function(entry) {
	      entry.messaging.forEach(function(event){
	        if (event.message && event.message.text) {
	          sendMessage(event);
	        }
	      });
	    });
	    res.status(200).end();
	  }
	});
function sendMessage(event) {
	  var sender = event.sender.id;
	  var text = "roger that";
	  console.log("SENDER: "+sender);
	  request({
	    url: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: {access_token: "EAAGCu5vOWZA8BACWsfqfZCz6ZCjBZAFwpfkMF8zfDqNrBwnGqpUunHFeBQFdEPFS20gnsQjYvHkm2E7AR4d0VLE25PHElmFXZBYJqUXQm1L9izZCJIod4hQOrrbF7mSLzL7RCqClVwSumZAqV1EIBSxOcjZBVfjHMnrF5vFrH0aodQZDZD"},
	    method: 'POST',
	    json: {
	      recipient: {id: sender},
	      message: {text: text}
	    }
	  }, function (error, response) {
	    if (error) {
	        console.log('Error sending message: ', error);
	    } else if (response.body.error) {
	        console.log('Error: ', response.body.error);
	    }
	  });
	}


http.createServer(app).listen(app.get('port'), function(){
			console.log('Express server listening on port ' + app.get('port'));
		});
