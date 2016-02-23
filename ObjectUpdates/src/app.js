var app = require('http').createServer(handler);

var io = require('socket.io')(app);

var fs = require('fs');

var PORT = process.env.PORT || process.env.NODE_PORT || 3000;

app.listen(PORT);

var draws = {};

//Our HTTP server handler. Remember with an HTTP server, we always receive the request and response objects
function handler (req, res) {
  //read our file ASYNCHRONOUSLY from the file system. This is much lower performance, but allows us to reload the page
  //changes during development. 
  //First parameter is the file to read, second is the callback to run when it's read ASYNCHRONOUSLY
  fs.readFile(__dirname + '/../client/index.html', function (err, data) {
    //if err, throw it for now
    if (err) {
      throw err;
    }

    //otherwise write a 200 code and send the page back
    //Notice this is slightly different from what we have done in the past. There is no reason for this, just to keep it simple.
    //There are multiple ways to send things in Node's HTTP server module. The documentation will show the optional parameters. 
    res.writeHead(200);
    res.end(data);
  });
}
function handleMessage(data)
{
	draws[data.user] = data.coords;
	io.sockets.in('room1').emit('drawObjects', data);
}

//When new connections occur on our socket.io server (we receive the new connection as a socket in the parameters)
io.on('connection', function (socket) {

  //join that socket to a hard-coded room. Remember rooms are just a collection of sockets. A socket can be in none, one or many rooms. 
  //A room's name is just a string identifier. It can be anything you make. If the room exists when you add someone, it adds them to the room.
  //If the room does not exist when you add someone, it creates the room and adds them to it. 
  socket.join('room1');


  socket.on('draw', handleMessage);
  
  //When the user disconnects, remove them from the room (since they are no longer here)
  //The socket is maintained for a bit in case they reconnect, but we do want to remove them from the room
  //Since they are currently disconnected.
  socket.on('disconnect', function(data) {
    socket.leave('room1');
  });
});

console.log("listening on port " + PORT);