
/**
 * Module dependencies.
 */

var express = require('express')
, routes = require('./routes')
, user = require('./routes/user')
, http = require('http')
, path = require('path');

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
app.post('/webhook', function (req, res) {
	var data = req.body;
	console.log("Here"+JSON.stringify(data.object));
	// Make sure this is a page subscription
	if (data.object === 'page') {
		console.log("Page");
		// Iterate over each entry - there may be multiple if batched
		data.entry.forEach(function(entry) {
			var pageID = entry.id;
			var timeOfEvent = entry.time;

			// Iterate over each messaging event
			entry.messaging.forEach(function(event) {
				if (event.message) {
					console.log("Eent"+event);
					receivedMessage(event);
				} else {
					console.log("Webhook received unknown event: ", event);
				}
			});
		});
		   res.status(200);
	  }
	});
	  
function receivedMessage(event) {
	  // Putting a stub for now, we'll expand it in the following steps
	  console.log("Message data: ", event.message);
	}	

		http.createServer(app).listen(app.get('port'), function(){
			console.log('Express server listening on port ' + app.get('port'));
		});
