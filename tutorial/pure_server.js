// npm install express, ...
// http://expressjs.com/en/starter/static-files.html
// use pure_client.html
// node Desktop\work\nodeJS\pure_server.js


// Spawning App
const { spawn } = require('child_process');
const child = spawn('pure', ['-i']);

var input = process.stdin.pipe(child.stdin);


input.on('end', () => {console.log('Goodbye\n'); process.exit() });

input.write('let x=123;let x=x+1;');

/*
child.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
  socket.emit('pure_output',{id:data.id, data:'child:'+data});
  if (data=='exit\n') {input.write('quit');
                   input.end();};
});
*/

// Server
var port = 3010;
var clientHTML = '/pure_client.html';

var http = require('http');
var express = require('express');
var app = express();

var server = http.createServer(app);

// Passing the http.Server instance to the listen method
var io = require('socket.io').listen(server);

// Child on data event
child.stdout.on('data', (data) => {
  console.log(`child stdout:\n${data}`);
  io.emit('pure_output',{id:data.id, data:'child:'+data});
  if (data=='exit\n') {input.write('quit');
                   input.end();};
});


// The server starts listening
server.listen(port);
console.log ("Welcome to xyz");
console.log("Pure Server listening on port "+ port.toString());

// Registering the route of your app that returns the HTML start file
app.get('/', function (req, res) {
    console.log("App root");
    res.sendFile(__dirname + clientHTML);
});

// Expose the node_modules folder as static resources 
// (to access socket.io.js in the browser)
// maybe path.join(__dirname, 'directory')
app.use('/static', express.static('node_modules'));


// Handling the connection
io.on('connection', function (socket) {
    //console.log(socket.handshake);  // a lot of data without .handshake
    console.log("Client X connected @");

    socket.on('pure_eval', function (data) {
        console.log('Pure input '+data.id+': '+data.data);
        input.write(data.data+'\n');
        socket.emit('pure_output',{id:data.id, data:'answer:'+data.data});
    });
    
    socket.on('disconnect', function(){console.log('Client disconnect ...');});
});