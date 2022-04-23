$('#retry').hide();
$('#play').click(start);
startOnSpace()

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(
	60,
	window.innerWidth / window.innerHeight,
	1,
	10000
);

var renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xaaaaaa, 1);
var canvas = $('#canvascontainer').append(renderer.domElement);
var distance = 4;
var started = false;
var lost = false;
var percent = 0;
var length = floorData.length;
camera.position.set(0, 5, distance);
camera.rotation.x -= 0.8;

function startOnSpace() {
  const handler = function(event) {
    if (event.which === 32) {
      start();
    
      
      
    }
  }
  $(document).on('keydown', handler);
}

function start(e) {
	e.preventDefault();
	started = true;
	ball.speed.z = -0.15;
	$('#main').fadeOut(300);
	if (lost) {
		ball.jumping = false;
		lost = false;
		camera.position.set(0, 5, distance);
		ball.mesh.position.set(0, 0.3, 0);
		ball.speed.y = 0;
		ball.crashed = false;

		world.forEach(v => {
			if (v instanceof Bouncer) {
				v.mesh.position.y = 0;
			}
		});
	}
}
canvas.on('mousemove', mousemoveBall);
canvas.on('touchmove', touchmoveBall);
keystate = [];
$(window).on('keydown', e => {
	keystate[e.keyCode] = true;
});
$(window).on('keyup', e => {
	delete keystate[e.keyCode];
});
$(window).on('resize', e => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
});
console.clear();
console.log(
	"If you're interested to look into the source code, it's avaliable here: https://repl.it/@iamcaleblol/WebGL-Rolling-Sky"
);

var light = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
scene.add(light);

var world = [];
for (var i in floorData) {
	for (var j in floorData[i]) {
		switch (floorData[i][j]) {
			case 1:
				world.push(new Mat(j - 2, -i));
				break;
			case 2:
				world.push(new Bouncer(j - 2, -i));
				break;
			case 3:
				world.push(new Mat(j - 2, -i));
				world.push(new Obstacle(j - 2, -i));
		}
	}
}
var ball = {
	geometry: new THREE.SphereGeometry(0.5, 100, 100),
	material: new THREE.MeshLambertMaterial({ color: 0xff1111 }),
	speed: { z: 0, y: 0 },
	dropped: false,
	crashed: false,
	jumping: false,
	offsetZ: 0,
	update: function() {
		this.mesh.position.y += this.speed.y;
		this.mesh.position.z += this.speed.z;
		camera.position.z += this.speed.z;
		if (!this.jumping) {
			world.forEach(v => {
				if (v instanceof Bouncer) {
					if (v.detect()) {
						this.jumping = true;
						this.speed.y = 0.55;
						this.offsetZ = this.mesh.position.z;
						v.mesh.position.y = 1;
					}
				}
			});
		}
		if (!this.jumping) {
			this.dropped = true;
			world.forEach(v => {
				if (v instanceof Mat) {
					if (v.detect()) {
						this.dropped = false;
					}
				}
			});
		}
		world.forEach(v => {
			if (v instanceof Obstacle) {
				if (v.detect()) this.crashed = true;
			}
		});
		if (this.mesh.position.x < -2.4 || this.mesh.position.x > 2.4) {
			this.dropped = true;
		}
		if (this.dropped) {
			this.speed.y -= 0.04;
			lost = true;
			started = false;
			ball.speed.z = 0;
			$('#main').fadeIn(500);
			$('#retry').show();
			$('#retry').click(start);
      startOnSpace()
			$('#score').html($('#percent').html());
		}
		if (this.crashed) {
			lost = true;
			started = false;
			ball.speed.z = 0;
			$('#main').fadeIn(500);
			$('#retry').show();
			$('#retry').click(start);
      startOnSpace()
			$('#score').html($('#percent').html());
		}
		if (this.jumping) {
			this.speed.y -= 0.04;
			if (this.mesh.position.y <= 0.3 && this.speed.y < 0 && !this.dropped) {
				this.jumping = false;
				this.mesh.position.z = this.offsetZ - 4;
				camera.position.z = this.offsetZ - 4 + distance;
				this.speed.y = 0;
				this.mesh.position.y = 0.3;
			}
		}
	},
};
ball.mesh = new THREE.Mesh(ball.geometry, ball.material);
ball.mesh.position.set(0, 0.3, 0);
scene.add(ball.mesh);

var render = function() {
	renderer.render(scene, camera);
	ball.update();
	percent = Math.ceil(Math.abs(ball.mesh.position.z) / length * 100);
	percent = percent > 100 ? 100 : percent;
	$('#percent').html(percent + '%');
	if (keystate[37]) ball.mesh.position.x -= 0.15;
	if (keystate[39]) ball.mesh.position.x += 0.15;
	requestAnimationFrame(render);
};
render();

function mousemoveBall(e) {
	if (started) {
		var pos = (e.clientX - window.innerWidth / 2) / (450 / 5);
		if (pos >= -3.5 && pos <= 3.5) {
			ball.mesh.position.x = pos;
			camera.position.x = pos / 7;
		}
	}
}
function touchmoveBall(e) {
	e.preventDefault();
	if (started) {
		var pos = (e.changedTouches[0].pageX - window.innerWidth / 2) / (450 / 5);
		if (pos >= -3.5 && pos <= 3.5) {
			ball.mesh.position.x = pos;
			camera.position.x = pos / 7;
		}
	}
}
