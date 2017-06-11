
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
var mysql = require('./routes/mysql');
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
					validateMessage(event);
					//sendMessage(event);
				}
			});
		});
		res.status(200).end();
	}
});
function validateMessage(event){
	var sender = event.sender.id;
	var text = event.message.text;
	var reply = "I couldn't understand";
	var sender = event.sender.id;
	/*if(event.message.text == 'hi'){
		sendMessage(event, reply);
	}*/
	if(!(event.message.text == 'hello' || 'whats up' || 'hey')){
		qArray = ["Do you like math?", "Do you know what 3x4 is?", "How about, if you made 10 Syrian Pounds, what percentage would you have if you bought a 2 pound 50 candy?", "What about stories? Do you like to read?", "What\'s the third letter of the word \'Power\'?", "What\'s the subject\'s intent in the sentence, \"Mohammed wanted me to come to his room after class\"?", "Do you know what a sanitary pad is?", "How do you put on condoms?", "How do you know if you have an STD?", "How is your Turksish? Can you say, \"What\'s your name\" in Turkish?"];
		aArray = ["yes", "12", "10", "yes", "w", "Mohammed wanted me", "yes", "", "", ""];
		//Check text with email of db
		//if its an email then update the messenger id
		var queryToCheckEmail = "SELECT * from user where email='"+event.message.text+"'";
		mysql.fetchData(
				function(err, results) {
					if (err) {
						console.log("Error: Some problem with db"+err);
						throw err;
					} else {
						if(results.length >0){
							//add messenger_id to the row
							var updateMessengerId = "Update user set messenger_id='"+sender+"' where email='"+event.message.text+"'";
							mysql.fetchData(
									function(err, results) {
										if (err) {
											console.log("Error: Some problem with db"+err);
											throw err;
										} else {
											console.log("Messenger id updated");	
										}

									}, updateMessengerId);

						}

						else{
							//Check the state count
							if(results.state_counter<9){
								//Check answer
								if(aArray[results.state_counter] ===  text){
									//Right answer
									//update the math
									if(results.state_counter<3){
										//update maths part
										var updateMaths = "Update user set math_rating=math_rating+3 where messenger_id='"+sender+"'";
										mysql.fetchData(
												function(err, results) {
													if (err) {
														console.log("Error: Some problem with db"+err);
														throw err;
													} else {
														console.log("updateMaths rating");	

														var updateStateCounter = "Update user set state_counter=state_counter+1 where messenger_id='"+sender+"'";
														mysql.fetchData(
																function(err, results) {
																	if (err) {
																		console.log("Error: Some problem with db"+err);
																		throw err;
																	} else {
																		console.log("state_counter updated");	
																		reply = qArray[results.state_counter];
																		sendMessage(event, reply);
																	}

																}, updateStateCounter);



													}

												}, updateMaths);

									}
									else if(results.state_counter>=3 && results.state_counter<6){
										//update verbal part
										var updateVerbal = "Update user set verbal_rating=math_rating+3 where messenger_id='"+sender+"'";
										mysql.fetchData(
												function(err, results) {
													if (err) {
														console.log("Error: Some problem with db"+err);
														throw err;
													} else {
														console.log("updateVerbal rating updated");	

														var updateStateCounter = "Update user set state_counter=state_counter+1 where messenger_id='"+sender+"'";
														mysql.fetchData(
																function(err, results) {
																	if (err) {
																		console.log("Error: Some problem with db"+err);
																		throw err;
																	} else {
																		console.log("state_counter updated");
																		reply = qArray[results.state_counter];
																		sendMessage(event, reply);
																	}

																}, updateStateCounter);



													}

												}, updateVerbal);
									}
								}else{
									//wrong answer
								}
								//question = stateconter
								reply = qArray[results.state_counter];
								sendMessage(event, reply);
							}
							else{
								//session not found. Ask user for his email id to continue
								reply = "You've already attempted all the questions!";	
								sendMessage(event, reply);
							}



						}

						/*else{//Ask user his email id
						reply = "What is your email?"
							//answer ="abhiram.304@gmail.com";
						//Update messenger_id
						sendMessage(event, reply); 
					}*/

					} 

				}, queryToCheckEmail);



	}
	if(event.message.text == 'hello' || 'whats up' || 'hey'){
		console.log("Message is hello");
		//check if session exists in db..i.e check if his msg_id exists in db
		var queryToCheckIfSessionExist = "SELECT state_counter from user where messenger_id="+event.sender.id+"";
		mysql.fetchData(
				function(err, results) {
					if (err) {
						console.log("Error: Some problem with db"+err);
						throw err;
					} else {
						console.log("Workkkkk");
						if(results.length>0){
							//Email is attached with messenger_id
							console.log("GT>0");
							if(results.state_counter<9){
								//question = stateconter
								reply = qArray[results.state_counter];
								sendMessage(event, reply);
							}
							else{
								//session not found. Ask user for his email id to continue
								console.log("GT<9");
								reply = "You've already attempted all the questions!";	
								sendMessage(event, reply);
							}


						}else{//Ask user his email id
							console.log("GT!>0");
							reply = "What is your email?";
								
							//Update messenger_id
							sendMessage(event, reply); 
						}

					}

				}, queryToCheckIfSessionExist);

		//If answered all questions, tell answer that he has already taken this quiz
		//Else continue from where he paused
	} 
	else if(event.message.text == 'bye' || 'good bye'){
		//check if session exists
		reply = "bye";
		sendMessage(event, reply);
	}
	else{
		reply = "I can't understand";
		sendMessage(event, reply);
	}
	//Check if the email id is valid for the first time

}
/*var questions = ["a", "b",  "];

//If session is found
function sessionFound(event){
	//Session found. Check state_counter value
	var queryToFetchUnansweredQuestions = "SELECT state_counter from user where messenger_id='"+event.sender.id+"'";
	mysql.fetchData(
			function(err, results) {
				if (err) {
					console.log("Error: Some problem with db"+err);
					throw err;
				} else {
					var questionNumber = results.state_counter;
					var questionName = "question"+ (questionNumber+1);

				}

			}, queryToFetchUnansweredQuestions);

}

//If there is no session
function nosessionExist(event){

}*/

function sendMessage(event, reply) {

	var sender = event.sender.id;
	var text = reply;
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