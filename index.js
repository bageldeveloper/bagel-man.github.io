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
  