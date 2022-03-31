var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io'); var app = express();
var server = http.Server(app);
var io = socketIO(server); app.set('port', 5000);
var tagid = 0;
var prt;
var numPlayers = 0;
var bullets = [];
var b;
var d;
var coins = [];
app.use('/static', express.static(__dirname + '/static'));// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});// Starts the server.
server.listen(5000, function() {
  console.log('Starting server on port 5000');
});
var players = {};
var fid = false;
io.on('connection', function(socket) {
  socket.on('new player', function() {
    socket.emit('id', socket.id);
    //io.sockets.emit('password',"password");
    players[socket.id] = {
      x: 0,
      y: 0,
      direction: 0,
      swordLength: 0,
      name: "",
      alive: false,
      sp: false,
      rf: false,
      iv: false,
      bs: false,
      sg: false,
      ls: false,
      sp2: false,
      rf2: false,
      iv2: false,
      bs2: false,
      sg2: false,
      ls2: false,
      alive2: true,
    };
    numPlayers += 1;
    if (numPlayers === 1) {
      tagid = socket.id;
    }
  });

  socket.on("leave", function(data) {
    console.log("player left");
    delete players[socket.id];
  });
  socket.on("alive", function(data) {
    var player = players[socket.id] || {};
    player.alive2 = true;
    //console.log("alive");
  });
  socket.on("message", function(data) {
    console.log(data);
  });
  socket.on("dead", function(data) {
    var player = players[socket.id] || {};
    player.alive = false;
    for (var i = 0; i < bullets.length; i++) {
      if (bullets[i][2] === data[2] && bullets[i][3] === data[3] && bullets[i][4] == data[4]) {
        players[bullets[i][4]].swordLength += 1;
        bullets.splice(i, 1);
      }
    }
  });
  socket.on("shoot", function(data) {
    var player = players[socket.id] || {};
    bullets.push(data);
  });
  socket.on("freeze", function(data) {
    fid = socket.id;
  });
  socket.on("unfreeze", function(data) {
    fid = false;
  });
  socket.on("name", function(data) {
    var player = players[socket.id] || {};
    player.name = data;
  });
  socket.on("password", function(data) {
    var player = players[socket.id] || {};
    console.log("p");
    if (data !== "crocky") {
      player.name = "Failure";
      socket.emit("password", false);
    }
  });
  socket.on("sword", function(data) {
    var player = players[socket.id] || {};
    player.direction = data;
  });
  socket.on("cdel", function(data) {
    for (var i = 0; i < coins.length; i++) {
      if (coins[i][0] === data[0] && coins[i][1] === data[1]) {
        coins.splice(i, 1);
      }
    }
  });
  socket.on("ability", function(data) {
    var player = players[socket.id] || {};
    if (data === 0) {
      if (player.rf) {
        player.rf2 = true;
        console.log("0");
      }
      player.rf = true;
      setTimeout(() => {
        if (player.rf2) { player.rf2 = false; }
        else {
          player.rf = false;
        }
      }, 10000);
    }
    else if (data === 1) {
      if (player.sp) {
        player.sp2 = true;
        console.log("1");
      }
      player.sp = true;
      setTimeout(() => {
        if (player.sp2) { player.sp2 = false; }
        else {
          player.sp = false;
        }
      }, 10000);
    }
    else if (data === 2) {
      if (player.iv) {
        player.iv2 = true;
        console.log("2");
      }
      player.iv = true;
      setTimeout(() => {
        if (player.iv2) { player.iv2 = false; }
        else {
          player.iv = false;
        }
      }, 10000);
    }
    else if (data === 3) {
      if (player.bs) {
        player.bs2 = true;
        console.log("3");
      }
      player.bs = true;
      setTimeout(() => {
        if (player.bs2) { player.bs2 = false; }
        else {
          player.bs = false;
        }
      }, 10000);
    }
    else if (data === 4) {
      if (player.sg) {
        player.sg2 = true;
        console.log("4");
      }
      player.sg = true;
      setTimeout(() => {
        if (player.sg2) { player.sg2 = false; }
        else {
          player.sg = false;
        }
      }, 10000);
    }
    else if (data === 5) {
      if (player.ls) {
        player.ls2 = true;
        console.log("4");
      }
      player.ls = true;
      setTimeout(() => {
        if (player.ls2) { player.ls2 = false; }
        else {
          player.ls = false;
        }
      }, 10000);
    }
  });
  socket.on('tagid', function(data) {
    prt = tagid;
    tagid = data;
  });
  socket.on('movement', function(data) {
    var player = players[socket.id] || {};
    if (fid === false || fid === socket.id) {
      if (data.left === "super" && player.x > 0) {
        player.x -= 5;
      }
      if (data.up === "super" && player.y > 0) {
        player.y -= 5;
      }
      if (data.right === "super" && player.x < 1180) {
        player.x += 5;
      }
      if (data.down === "super" && player.y < 530) {
        player.y += 5;
      }
      if (data.left === true && player.x > 0) {
        player.x -= 1;
      }
      if (data.up === true && player.y > 0) {
        player.y -= 1;
      }
      if (data.right === true && player.x < 1180) {
        player.x += 1;
      }
      if (data.down === true && player.y < 530) {
        player.y += 1;
      }
    }
  });
}); setInterval(function() {
  io.sockets.emit('state', players);
  io.sockets.emit('tagid', tagid);
  io.sockets.emit('prt', prt);
  io.sockets.emit('coins', coins);
  for (var i = 0; i < bullets.length; i++) {
    bullets[i][0] += bullets[i][2] * 3;
    bullets[i][1] += bullets[i][3] * 3;
    if (bullets[i][0] < -10 || bullets[i][1] < -10 || bullets[i][0] > 1200 || bullets[i][1] > 550) {
      bullets.splice(i, 1);
    }
  }
  io.sockets.emit('bullets', bullets);
  b = 0;
  d = 0;
  for (var i in players) {
    var player = players[i];
    if (player.alive) {
      b++;
    }
    d++;
  }
  if (b <= 1) {
    io.sockets.emit("end");
    setTimeout(() => { if (d > 1) { io.sockets.emit("restart"); coins = []; } }, 10000);

    if (d > 1) {
      bullets = [];
    }
    for (var i in players) {
      var player = players[i];
      player.alive = true;
      player.swordLength = 0;
      if (d > 1) {
        player.x = Math.random() * 1180;
        player.y = Math.random() * 530;
        player.sp = false;
        player.rf = false;
        player.bs = false;
        player.iv = false;
      }
    }
  }
}, 1000 / 60);

setInterval(function() {
  for (var i = 0; i < Math.floor((d + 2) / 3); i++) {
    coins.push([Math.random() * 1180 + 10, Math.random() * 530 + 10, Math.floor(Math.random() * 6)]);
  }
}, 10000);
setInterval(function() {
  for (var id in players) {
    var player = players[id];
    player.alive2 = false;
  }
  setTimeout(() => {
    for (var id in players) {
      var player = players[id] || {};
      if (!player.alive2) {
        delete players[id];
      }
    }
  }, 5000);
}, 6000);

