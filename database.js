// Retrieve
'use strict'
var express = require("express");  
var bodyParser  = require("body-parser");
var mongoose = require('mongoose');
var methodOverride = require("method-override");
var app = express();
var socketio;

var ServerPort = process.env.PORT || 3000;
var socketPort = process.env.PORT || 3031;

mongoose.connect('mongodb://localhost', function(err, res) {  
  if(err) {
    console.log('ERROR: connecting to Database. ' + err);
  }
  console.log('respuesta mongo: ', res);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());  
app.use(methodOverride());

var faceModel	= require('./models/faceCollectionMod')(app, mongoose);  
var faceCtrl 	= require('./controllers/faceCollectionCtrl');

var faces = express.Router();

faces.route('/faceCollection')
	.get(faceCtrl.findAllFaces)
	.post(faceCtrl.addFaces)
  .delete(faceCtrl.deleteFaces);

app.use('/faces', faces);
 
app.listen(ServerPort, function() {
	console.log("Node server running");
});

var sockerServer = require('http').Server(app);
var io = require('socket.io')(sockerServer, { origins: '*:*', forceNew: true });

sockerServer.listen(socketPort, function() {
  console.log("websocket server running");
});

io.on('connection', function(socket){
  socketio = socket;
  console.log('alguien se ha conectado con socket.');
  socketio.on('zombis', function(data){
    console.log('mensaje recibido de defenders: ',data);
    io.emit("toSmartMirror", data);
  });
  socketio.on('armas', function(data){
    console.log('mensaje recibido de explorers: ',data);
    io.emit("toDefenders", data);
  });
  socketio.on('timeOut', function(data){
    console.log('mensaje recibido de explorers: ',data);
    io.emit("toExplorers", data);
  });
  socketio.on('requestWeapons', function(data){
    console.log('mensaje recibido de explorers: ',data);
    io.emit("toExplorers", data);
  });
});


