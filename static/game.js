var name = window.prompt("What is your name?", "");
if(name.length > 10){
  var s = "";
  for(var i = 0; i < 10; i++){
    s += name[i];
  }
  name = s;
}
if(name === null || name === "" || name === "null"){
  name = "Anonymous";
}
var socket = io();
socket.on('message', function(data) {
  console.log(data);
});
var reload = 0;
var collision = function(x1,y1,w1,h1,x2,y2,w2,h2){
   if(y1 + h1 > y2 && y1 + h1 < y2 + h2 && x1 < x2 + w2  && x1 + w1 > x2 ||
   y1 < y2 + h2 && y1 > y2 && x1 < x2 + w2 && x1 + w1 > x2 ||
   x1 + w1 > x2 && x1 + w1 < x2 + w2 && y1 < y2 + h2  && y1 + h1 > y2 ||
   x1 < x2 + w2 && x1 > x2 && y1 < y2 + h2 && y1 + h1 > y2 ||
   x1 === x2 && y1 === y2){
       return true;   
   } else {
       return false;   
   }
};

var movement = {
  up: false,
  down: false,
  left: false,
  right: false,
}
var myid = 0;
var tagid = 0;
var direction = 0;
var prt;
var mylength = 1;
var counter = 0;
var password;
var coins = [];
var players = [];
if(name === "Admin"){
  password = window.prompt("Enter Admin Password", "");
}
socket.on('id', function(data) {
  myid = data;
});
socket.on('password', function(data) {
    if(!data){
      name = "Failure";
    }
});
socket.on('coins', function(data) {
    coins = data;
});
var admin = false;

players = {};
var hpress = false;
var gpress = false;
var spacepress = false;
var clicked = false;
document.addEventListener('keydown', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = true;
      if(spacepress && admin || players[myid].sp){
        movement.left = "super";
      }
      break;
    case 87: // W
      movement.up = true;
      if(spacepress && admin || players[myid].sp){
        movement.up = "super";
      }
      break;
    case 68: // D
      movement.right = true;
      if(spacepress && admin || players[myid].sp){
        movement.right = "super";
      }
      break;
    case 83: // S
      movement.down = true;
      if(spacepress && admin || players[myid].sp){
        movement.down = "super";
      }
      break;
    case 37: // A
      direction = 1;
      break;
    case 38: // W
      direction = 2;
      break;
    case 39: // D
      direction = 3;
      break;
    case 40: // S
      direction = 0;
      break;
    case 71: // S
      gpress = true;
      break;
    case 72: // S
      hpress = true;
      break;
    case 32: // S
      spacepress = true;
      break;
  }
});
document.addEventListener('keyup', function(event) {
  switch (event.keyCode) {
    case 65: // A
      movement.left = false;
      break;
    case 87: // W
      movement.up = false;
      break;
    case 68: // D
      movement.right = false;
      break;
    case 83: // S
      movement.down = false;
      break;
    case 71: // S
      gpress = false;
      break;
    case 72: // S
      hpress = false;
      break;
    case 32: // S
      spacepress = false;
      break;
  }
});
var alive = false;
var c = 0;
bullets = [];
window.addEventListener('beforeunload', (event) => {
  // Cancel the event as stated by the standard.
  //event.preventDefault();
  socket.emit("leave",true);
  event.returnValue = '';
  // Chrome requires returnValue to be set.
});
helicopter = 0;
socket.emit('new player');
socket.emit('name',name);
socket.on('bullets', function(data) {
  bullets = data;
});
if(name === "Admin"){
  socket.emit('password', password);
}
socket.on('tagid', function(data) {
  tagid = data;
});
game = true;
socket.on('restart', function(data) {
  game = true;
  alive = true;
});
socket.on('end', function(data) {
  game = false;
});
var ac = 0;
setInterval(function() {
  socket.emit('movement', movement);
  socket.emit("length", mylength);
  socket.emit("sword", direction);
  socket.emit("alive");
}, 1000 / 60);
    var sketchProc = function(processingInstance) {
     with (processingInstance) {
       textAlign(LEFT,CENTER);
       size(1200, 550); 
       noStroke();
        frameRate(55);
        socket.on('state', function(players2) {
          if(name === "Admin" && !admin){
              admin = true;
          }
          var b = 0;
          for(var i in players){
              b++;
          }
          if(!game && myid !== undefined){
            var winner = "";
            var k = "";
            for(var i in players){
              if(players[i].alive){
                winner = players[i].name;
                k = players[i].swordLength;
              }
            }
            textAlign(CENTER,CENTER);
            background(30,30,30);
            fill(76, 235, 52);
            if(b > 1){
            textSize(60);
            text("Winner: " + winner + ", with " + k + " hits",600,240);
            textSize(30);
            text("New Game Starting...",600,300);
            }
            else{
              textSize(60);
            text("Waiting for more players...",600,275);
            }
            
          }
          if(game){
            textAlign(LEFT,CENTER);
          leaderboard = [];
          background(255);
          for(var i = 0; i < coins.length; i++){
            fill(138, 134, 134);
          ellipse(coins[i][0],coins[i][1],30,30);
            fill(219, 219, 219);
          ellipse(coins[i][0],coins[i][1],25,25);
          if(coins[i][2] === 0){
            fill(50,50,50);
            ellipse(coins[i][0] + 6,coins[i][1],7,7);
            ellipse(coins[i][0] - 3,coins[i][1] + 6,7,7);
            ellipse(coins[i][0] - 3,coins[i][1] - 6,7,7);
          }
          else if(coins[i][2] === 1){
            stroke(0,255,0);
            strokeWeight(2);
            line(coins[i][0] + 9,coins[i][1],coins[i][0],coins[i][1] - 5);
            line(coins[i][0] + 9,coins[i][1],coins[i][0],coins[i][1] + 5);
            line(coins[i][0] + 1,coins[i][1],coins[i][0] - 8,coins[i][1] - 5);
            line(coins[i][0] + 1,coins[i][1],coins[i][0] - 8,coins[i][1] + 5);
            //line();
            noStroke();
          }
          else if(coins[i][2] === 2){
            fill(255,0,0,60);
            rect(coins[i][0] - 7.5,coins[i][1] - 7.5,15,15,4);
          }
          else if(coins[i][2] === 3){
            fill(50,50,50);
            ellipse(coins[i][0] + 5,coins[i][1] - 5,7,7);
            stroke(50,50,50);
            strokeWeight(2);
            line(coins[i][0],coins[i][1] ,coins[i][0] - 6, coins[i][1] + 6);
            line(coins[i][0] + 4,coins[i][1]  + 1,coins[i][0] - 2, coins[i][1] + 6.5);
            line(coins[i][0] - 1,coins[i][1] - 4,coins[i][0] - 8, coins[i][1] + 3);
            //line(coins[i][0] - 3,coins[i][1] + 4,coins[i][0] - 5, coins[i][1] + 5);
            //line(coins[i][0] + 2,coins[i][1] + 2,coins[i][0] - 5, coins[i][1] + 5);
            noStroke();
          }
          else if(coins[i][2] === 4){
            fill(50,50,50);
            ellipse(coins[i][0] + 5,coins[i][1] + 5,7,7);
            ellipse(coins[i][0] - 5,coins[i][1] + 5,7,7);
            ellipse(coins[i][0] - 5,coins[i][1] - 5,7,7);
            ellipse(coins[i][0] + 5,coins[i][1] - 5,7,7);
          }
          else if(coins[i][2] === 5){
            fill(100,100,100);
            ellipse(coins[i][0],coins[i][1],15,15);
          }
         }
         fill(0,0,0);
         players = players2;
       for(var id in players){
        var player = players[id];
        if(player.alive){
          
        leaderboard.push([player.name,player.swordLength]);
        }
        
        if(player.name === "Admin"){
          fill(106, 0, 255);
        }
        else if(id === myid && player.iv){
            fill(255,0,0,20);
         } 
         else if(player.iv && !players[myid].alive){
            fill(0,255,0,20);
         } 
         
        else if(id === myid){
            fill(255,0,0);
         } 
         else{
           fill(0,255,0);
         }
         if(myid !== 0){
         if(player.alive && !player.iv || id === myid && player.alive || !players[myid].alive && id !==  myid && player.alive){
         rect(player.x,player.y,20,20,4);
         }
         }
         textSize(10);
         for(var i = 0; i < bullets.length; i++){
           if(!players[bullets[i][4]].ls){
             fill(0);
           ellipse(bullets[i][0] + 5,bullets[i][1] + 5,10,10);
           }
           if(players[bullets[i][4]].ls){
             fill(0,0,0,10);
           ellipse(bullets[i][0] + 5,bullets[i][1] + 5,10,10);
           }
         }
         
         fill(0);
         if(myid !== 0){
         if(player.name !== "Anonymous" && player.alive && !player.iv|| player.iv && id === myid && player.name !== "Anonymous" && player.alive){
          text(player.name,player.x,player.y - 5);
         }
         }
         fill(100,100,100);

        if(player.name === "Admin"){
          fill(31, 27, 48);
        }
        if(id === myid && alive){
          for(var i = 0; i < bullets.length; i++){
            if(collision(player.x,player.y,20,20,bullets[i][0],bullets[i][1],10,10) && bullets[i][4] != myid){
              alive = false;
              socket.emit("dead",bullets[i]);
            }
          }
          for(var i = 0; i < coins.length; i++){
            if(collision(player.x,player.y,20,20,coins[i][0] - 10,coins[i][1] - 10,30,30) && ac > 10){
              ac = 0;
              socket.emit("ability", coins[i][2]);
              socket.emit("cdel",coins[i]);
              if(coins[i][2] === 1){
                if(movement.up){
                  movement.up = "super";
                }
                if(movement.down){
                  movement.down = "super";
                }
                if(movement.left){
                  movement.left = "super";
                }
                if(movement.right){
                  movement.right = "super";
                }
              }
            }
          }
          
          ac++;
          counter = 0;
          if(clicked){
            var xv = (mouseX +  - (player.x+ 10))/Math.sqrt((Math.pow(mouseX - (player.x+ 10),2) + Math.pow(mouseY - (player.y+ 10),2)));
            var yv = (mouseY - (player.y+ 10))/Math.sqrt((Math.pow(mouseX - (player.x+ 10),2) + Math.pow(mouseY - (player.y + 10),2)));
            if(players[myid].bs){
              xv*=2;
              yv*=2;
            }
            //socket.emit("message",xv + ", " + yv);
            socket.emit("shoot",[player.x + 7.5,player.y + 7.5,xv,yv,myid]);
            socket.emit("message",5);
            if(players[myid].sg){
              /*var x2v = ((player.x + xv + yv) +  - (player.x+ 10))/Math.sqrt((Math.pow((player.x + xv + yv) - (player.x+ 10),2) + Math.pow((player.y + yv + xv) - (player.y+ 10),2)));
            var y2v = ((player.y + xv + yv) - (player.y+ 10))/Math.sqrt((Math.pow((player.x + xv + yv) - (player.x+ 10),2) + Math.pow((player.y + xv + yv) - (player.y + 10),2)));
            */
            //socket.emit("message", xv + ", " + x2v);
            //socket.emit("shoot",[player.x + 10,player.y + 10,-xv,yv,myid]);
            socket.emit("shoot",[player.x + 7.5,player.y + 7.5,-xv,-yv,myid]);
            socket.emit("shoot",[player.x + 7.5,player.y + 7.5,-yv,-xv,myid]);
            socket.emit("shoot",[player.x + 7.5,player.y + 7.5,yv,xv,myid]);
            socket.emit("shoot",[player.x + 7.5,player.y + 7.5,-xv,yv,myid]);
             socket.emit("shoot",[player.x + 7.5,player.y + 7.5,xv,-yv,myid]);
            socket.emit("shoot",[player.x + 7.5,player.y + 7.5,yv,-xv,myid]);
            socket.emit("shoot",[player.x + 7.5,player.y + 7.5,-yv,xv,myid]);
            }
            
          }
        }
         //println(player.direction);
         }
        
      leaderboard.sort(function(a,b){return b[1] - a[1];}); 
      textSize(30);
      textAlign(LEFT,CENTER);
      fill(0);

      text("Leaderboard:",1000,22);
       for(var l = 0; l < 5; l++){
         if(leaderboard[l] !== undefined){
           textSize(15);
           text((l + 1) + ". " + leaderboard[l][0] + " " + leaderboard[l][1], 1075, 50 + l*20);
         }
       }
       if(movement.left && movement.right && direction === 1 && gpress && hpress && admin){
        socket.emit("freeze");
       }
       if(movement.up && movement.down && direction === 1 && gpress && hpress && admin){
        socket.emit("unfreeze");
       }
       reload++;
       
       if(!alive){
         textSize(50);
         textAlign(CENTER,CENTER);
         fill(219, 219, 219,20);
         rect(0,0,1200, 550);
         fill(255,0,0,60);
         text("Waiting for new match to begin...", 600,275);
         textAlign(LEFT,CENTER);
       }
       clicked = false;
          }
        });
        var mouseClicked = function(){
          if(reload > 100 || admin || players[myid].rf){
          clicked = true;
          reload = 0;
          }
        }
       }};

    // Get the canvas that Processing-js will use
    var canvas = document.getElementById("canvas"); 
    // Pass the function sketchProc (defined in myCode.js) to Processing's constructor.
    var processingInstance = new Processing(canvas, sketchProc); 