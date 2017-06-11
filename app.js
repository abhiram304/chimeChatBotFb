
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
	  var senderID = event.sender.id;
	  var recipientID = event.recipient.id;
	  var timeOfMessage = event.timestamp;
	  var message = event.message;

	  console.log("Received message for user %d and page %d at %d with message:", 
	    senderID, recipientID, timeOfMessage);
	  console.log(JSON.stringify(message));

	  var messageId = message.mid;

	  var messageText = message.text;
	  var messageAttachments = message.attachments;
	  
	  if (messageText) {
		  switch (messageText) {
	      case 'generic':
	        sendGenericMessage(senderID);
	        break;

	      default:
	        sendTextMessage(senderID, messageText);
	    }
	  } 
	  else if (messageAttachments) {
	    sendTextMessage(senderID, "Message with attachment received");
	  }
	}
		
function sendTextMessage(recipientId, messageText) {
	  var messageData = {
	    recipient: {
	      id: recipientId
	    },
	    message: {
	      text: "Helloooo"
	    }
	  };

	  callSendAPI(messageData);
	}

function callSendAPI(messageData) {
	  request({
	    uri: 'https://graph.facebook.com/v2.6/me/messages',
	    qs: { access_token: "EAAGCu5vOWZA8BACWsfqfZCz6ZCjBZAFwpfkMF8zfDqNrBwnGqpUunHFeBQFdEPFS20gnsQjYvHkm2E7AR4d0VLE25PHElmFXZBYJqUXQm1L9izZCJIod4hQOrrbF7mSLzL7RCqClVwSumZAqV1EIBSxOcjZBVfjHMnrF5vFrH0aodQZDZD" },
	    method: 'POST',
	    json: messageData

	  }, function (error, response, body) {
	    if (!error && response.statusCode == 200) {
	      var recipientId = body.recipient_id;
	      var messageId = body.message_id;

	      console.log("Successfully sent generic message with id %s to recipient %s", 
	        messageId, recipientId);
	    } else {
	      console.error("Unable to send message.");
	      console.error(response);
	      console.error(error);
	    }
	  });  
	}


http.createServer(app).listen(app.get('port'), function(){
			console.log('Express server listening on port ' + app.get('port'));
		});
