class Mat{
  constructor(xpos, zpos){
	  this.geometry = new THREE.BoxGeometry(1,0.2,1);
	  this.material = new THREE.MeshPhongMaterial( { color: 0xffff00 } );
	  this.mesh = new THREE.Mesh(this.geometry, this.material);
	  this.edgesGeometry = new THREE.EdgesGeometry( this.geometry );
	  this.edgesMaterial = new THREE.LineBasicMaterial({color:0x909000});
	  this.line = new THREE.LineSegments( this.edgesGeometry, this.edgesMaterial);
	  this.mesh.position.set(xpos, 0, zpos);
	  this.line.position.set(xpos, 0, zpos);
	  scene.add(this.line);
	  scene.add(this.mesh);
  }
	detect(){
		if(ball.mesh.position.x >= this.mesh.position.x - 0.5 && ball.mesh.position.x <= this.mesh.position.x + 0.5 && ball.mesh.position.z >= this.mesh.position.z - 0.5 && ball.mesh.position.z <= this.mesh.position.z + 0.5 && ball.mesh.position.z <= 0.5){
			return true;
		}
	}
}
class Bouncer{
  constructor(xpos, zpos){
	  this.geometry = new THREE.BoxGeometry(1,0.2,1);
	  this.material = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
	  this.mesh = new THREE.Mesh(this.geometry, this.material);
	  this.edgesGeometry = new THREE.EdgesGeometry( this.geometry );
	  this.edgesMaterial = new THREE.LineBasicMaterial({color:0x000000});
	  this.line = new THREE.LineSegments( this.edgesGeometry, this.edgesMaterial);
	  this.mesh.position.set(xpos, 0, zpos);
	  this.line.position.set(xpos, 0, zpos);
	  scene.add(this.mesh);
  }
	detect(){
		if(ball.mesh.position.x >= this.mesh.position.x - 0.5 && ball.mesh.position.x <= this.mesh.position.x + 0.5 && ball.mesh.position.z >= this.mesh.position.z - 0.5 && ball.mesh.position.z <= this.mesh.position.z + 0.5 && ball.mesh.position.z <= 0.5){
			return true;
		}
	}
	
}

class Obstacle{
  constructor(xpos, zpos){
	  this.geometry = new THREE.BoxGeometry(1, 0.7, 1);
	  this.material = new THREE.MeshPhongMaterial( { color: 0x00ddff } );
	  this.mesh = new THREE.Mesh(this.geometry, this.material);
	  	this.edgesGeometry = new THREE.EdgesGeometry( this.geometry );
	  this.edgesMaterial = new THREE.LineBasicMaterial({color:0x000000});
	  this.line = new THREE.LineSegments( this.edgesGeometry, this.edgesMaterial);
	  this.mesh.position.set(xpos,0.35,zpos);
	  this.line.position.set(xpos, 0.35, zpos);
	  scene.add(this.line);
	  scene.add(this.mesh);
  }
	detect(){
		if(ball.mesh.position.x >= this.mesh.position.x - 0.5 && ball.mesh.position.x <= this.mesh.position.x + 0.5 && ball.mesh.position.z >= this.mesh.position.z - 0.5 && ball.mesh.position.z <= this.mesh.position.z + 0.5 && ball.mesh.position.z <= 0.5 && ball.mesh.position.y < this.mesh.position.y + 0.85){
			  return true;
		}
	}

}