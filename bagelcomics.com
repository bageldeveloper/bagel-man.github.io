<html>
  <head>
    <style>
      * {box-sizing: border-box}

/* Set height of body and the document to 100% */
body, html {
  
  background-color: #222;
  margin: 0;
  font-family: roboto;
}
.tablink {
  background-color: #444;
  color: white;
  float: left;
  border: 3;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  font-size: 17px;
  width: 20%;
}

.tablink:hover {
  background-color: #666;
}
.center{
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}
.tabcontent {
  color: white;
  display: none;
  padding: 100px 20px;
  height: 100%;
}


#Home {background-color: #222;}
#Memes { background-image: url("https://www.craftycreations.net/wp-content/uploads/2019/08/Oak-Planks-7.png");
background-repeat:repeat;}
#Contact {background-color: #222;}
#About {background-color: #222;}
#Game {background-color: #222;}

</style>

  </head>
   <body>
<script>
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
	
    let tablink = document.getElementById('tablink');
    subTitle.style.cssText = 'height: 300 px';
  }
  
  function openPage(pageName,elmnt,color) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablink");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].style.backgroundColor = "";
  }
  document.getElementById(pageName).style.display = "block";
  elmnt.style.backgroundColor = color;
}

// Get the element with id="defaultOpen" and click on it
document.getElementById("defaultOpen").click();



// dots is an array of Dot objects,
// mouse is an object used to track the X and Y position
   // of the mouse, set with a mousemove event listener below
var dots = [],
    mouse = {
      x: 0,
      y: 0
    };

// The Dot object used to scaffold the dots
var Dot = function() {
  this.x = 0;
  this.y = 0;
  this.node = (function(){
    var n = document.createElement("div");
    n.className = "trail";
    document.body.appendChild(n);
    return n;
  }());
};
// The Dot.prototype.draw() method sets the position of 
  // the object's <div> node
Dot.prototype.draw = function() {
  this.node.style.left = this.x + "px";
  this.node.style.top = this.y + "px";
};

// Creates the Dot objects, populates the dots array
for (var i = 0; i < 12; i++) {
  var d = new Dot();
  dots.push(d);
}

// This is the screen redraw function
function draw() {
  // Make sure the mouse position is set everytime
    // draw() is called.
  var x = mouse.x,
      y = mouse.y;
  
  // This loop is where all the 90s magic happens
  dots.forEach(function(dot, index, dots) {
    var nextDot = dots[index + 1] || dots[0];
    
    dot.x = x;
    dot.y = y + 5;
    dot.draw();
    x += (nextDot.x - dot.x) * .6;
    y += (nextDot.y - dot.y) * .6;

  });
}

addEventListener("mousemove", function(event) {
  //event.preventDefault();
  mouse.x = event.pageX;
  mouse.y = event.pageY;
});

// animate() calls draw() then recursively calls itself
  // everytime the screen repaints via requestAnimationFrame().
function animate() {
  draw();
  requestAnimationFrame(animate);
}

// And get it started by calling animate().
animate();

</script>
<button class="tablink" onclick="openPage('Home', this, '#222')" id="defaultOpen">hehehehe</button>
<button class="tablink" onclick="openPage('Memes', this, '#222')">Memes</button>
<button class="tablink" onclick="openPage('Contact', this, '#222')">Facts</button>
<button class="tablink" onclick="openPage('About', this, '#222')">About</button>
    <button class="tablink" onclick="openPage('Game', this, '#222')">Games</button>

<div id="Home" class="tabcontent">
  <h1>Home</h1>
  <p>This is a website about stuff, it has some stuff you can do</p>
</div>

<div id="Memes" class="tabcontent">
  <h1>Memes</h1>
  <p>ripe and dank memes</p> 
  <img src="https://i.redd.it/he77atzsrza71.jpg" width="400" class="center">
  <img src="https://i.redd.it/1zqfw903nya71.jpg" width="400" class="center">
    <img src="https://i.redd.it/dyiv0tk2oza71.jpg" width="400" class="center">
   <img src="https://preview.redd.it/pa2bopud6xa71.jpg?width=640&crop=smart&auto=webp&s=b9869e16d8b9bb842317689ba3d11179d5825be3" width="400" class="center">
   <img src="https://preview.redd.it/np3nu8hywya71.jpg?width=640&crop=smart&auto=webp&s=f2d8145d6139f3cd93e45742904d0a495e34df5e" width="400" class="center">
   <img src="https://i.redd.it/w7s0wrr8cya71.jpg" width="400" class="center">
  <img src="https://preview.redd.it/xfrr2b88x0b71.png?width=640&crop=smart&auto=webp&s=45039281a786218f0c51baf609b4beab2445b519" width="400" class="center">
</div>

<div id="Contact" class="tabcontent">
  <h1>Facts</h1>
  <ul>
    <li>The scientific term for brain freeze is “sphenopalatine ganglioneuralgia”.</li>
        <li>Canadians say “sorry” so much that a law was passed in 2009 declaring that an apology can’t be used as evidence of admission to guilt..</li>
    <li>Back when dinosaurs existed, there used to be volcanoes that were erupting on the moon.</li>
    <li>The only letter that doesn’t appear on the periodic table is J.</li>
    <li>One habit of intelligent humans is being easily annoyed by people around them, but saying nothing in order to avoid a meaningless argument.</li>
    <li>If a Polar Bear and a Grizzly Bear mate, their offspring is called a “Pizzy Bear”.</li>
    <li>In 2006, a Coca-Cola employee offered to sell Coca-Cola secrets to Pepsi. Pepsi responded by notifying Coca-Cola.</li>
    <li>There were two AI chatbots created by Facebook to talk to each other, but they were shut down after they started communicating in a language they made for themselves.</li>
    <li>Nintendo trademarked the phrase “It’s on like Donkey Kong” in 2010.</li>
    <li>A single strand of Spaghetti is called a “Spaghetto”.</li>
    <li>Hershey’s Kisses are named that after the kissing sound the deposited chocolate makes as it falls from the machine on the conveyor belt.</li>
    <li>If you cut down a cactus in Arizona, you’ll be penalized up to 25 years in jail. It is similar to cutting down a protected tree species.</li>
    <li>Fruit stickers are edible, though the same as any fruit, washing prior to eating is recommended. The glue used for them is regulated by the FDA.</li>
  </ul>
</div>

<div id="About" class="tabcontent">
  <h1>About</h1>
  <h4>This was made by a person</h4>
  <h5>Wanna contact me? too bad</h5>
</div>
     
     <div id="Game" class="tabcontent">
       <h1>Games</h1>
       <iframe src="https://scratch.mit.edu/projects/524470702/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>
       <iframe src="https://scratch.mit.edu/projects/506746593/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>
       <iframe src="https://scratch.mit.edu/projects/324436049/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>
       <iframe src="https://scratch.mit.edu/projects/386422379/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>
       <iframe src="https://scratch.mit.edu/projects/428683299/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>
       <iframe src="https://scratch.mit.edu/projects/406300826/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>
       <iframe src="https://scratch.mit.edu/projects/385038281/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>
       <iframe src="https://scratch.mit.edu/projects/385424031/embed" allowtransparency="true" width="485" height="402" frameborder="0" scrolling="no" allowfullscreen></iframe>
</div>
</body>
</html> 
