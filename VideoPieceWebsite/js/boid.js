var Boid = function(scene, x, y, z, geo, mat) {
  var obj;
  var childObj;
  var velocity;    

  var acceleration;
  var r;
  
  //TUNING VARIABLES
  //Speeds
  var rMaxS = 170;
  var rMinS = 130;
  var rMaxF = 0.8;
  var rMinF = 0.5;

  //Multipliers
  var sepMult = 1.5;
  var aliMult = 1.3;
  var cohMult = 1;
  var boundsMult = 10;
  var noiseMult = 0.2;

  //Detection ranges
  var sepRange = 50;
  var aliRange = 200;
  var cohRange = 200;
    
  var minY = 160;
  var sineCutoff = 0.5;
  
  var maxspeed = rMinS;    // Maximum speed
  var maxforce = rMinF;    // Maximum steering force
  var defaultSpeed = rMinS + Math.random() * (rMaxS - rMinS);
  var defaultForce = rMinF + Math.random() * (rMaxF - rMinF);

  var initialized = false;
    
  var worldX = 1100;
  var worldY = 900;
  var worldZ = 1100;
    
  var worldForward = new THREE.Vector3(0,0,1);
  
  function init() {
    acceleration = new THREE.Vector3(0, 0, 0);
    velocity = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
    velocity.multiplyScalar(maxspeed);
    let pos = new THREE.Vector3(x, y, z);
    r = 5.0;
    
    childObj = new THREE.Mesh(geo, mat);
    scene.add(childObj);

    obj = new THREE.Object3D();
    obj.position.set(pos.x, pos.y, pos.z);
    scene.add(obj);

    obj.add(childObj);
    childObj.position.set(0,0,0);
    
    initialized = true;
  }

  this.run = function() { 
    if(!initialized)
        return;
      
    update();
    render();
  }
    
  this.getObj = function(){
      return obj;
  }
  
  this.getChildObj = function(){
      return childObj;
  }
  
  this.getVelocity = function(){
      return velocity;
  }
  
  this.getPosition = function(){
      return obj.position;
  }

  function applyForce(force) {
    // We could add mass here if we want A = F / M
    acceleration.add(force);
  }

  // We accumulate a new acceleration each time based on three rules
  this.flock = function(boids) {
    let coh = cohesion(boids);   
    let cMult = cohMult - Math.max(sineCutoff, sepSine) * 1 + (sineCutoff * 1);
    coh.multiplyScalar(cMult);
    applyForce(coh);

    let ali = align(boids);      // Alignment
    let aMult = aliMult - Math.max(sineCutoff, sepSine) * 1 + (sineCutoff * 1);
    ali.multiplyScalar(aMult);
    applyForce(ali);

    let sep = separate(boids);   // Separation
    let sMult = sepMult + Math.max(sineCutoff, sepSine) * 2 - (sineCutoff * 2);  
    sep.multiplyScalar(sMult);
    applyForce(sep);

    let noiseForce = moveWithNoise();
    noiseForce.multiplyScalar(noiseMult);
    applyForce(noiseForce);

    let bounds = turnToCenter();
    bounds.multiplyScalar(boundsMult);
    applyForce(bounds);
      
  }
  
  // Method to update position
  function update() {
    maxspeed = defaultSpeed * deltaTime * globalSpeed;
    maxforce = defaultForce * deltaTime  * globalSpeed;
    // Update velocity
    velocity.add(acceleration);
    // Limit speed
    velocity.clampLength(0, maxspeed);
    obj.position.add(velocity);
    // Reset accelertion to 0 each cycle
    acceleration.multiplyScalar(0);
  }
  
  function outOfBounds(){
      if(Math.abs(obj.position.x + velocity.x) > worldX){
          return true;
      }
      if(obj.position.y + velocity.y > worldY || 
         obj.position.y + velocity.y < minY + globalNoise.noise(obj.position.x, obj.position.z)){
          return true;
      }
      if(Math.abs(obj.position.z + velocity.z) > worldZ){
          return true;
      }
      return false;
  }
    
  function turnToCenter(){
      if(outOfBounds()){
          let target = new THREE.Vector3(0 - obj.position.x, (worldY - minY)/2 - obj.position.y, 0 - obj.position.z);
          
          let force = new THREE.Vector3(target.x - velocity.x, target.y - velocity.y, target.z - velocity.z);//velocity.reflect(obj.up.applyQuaternion(obj.quaternion));
          force.normalize();
          force.multiplyScalar(maxforce);
          return force;
      } else{
          return new THREE.Vector3(0,0,0);
      }
  }


    
  function render() {
    // Draw a triangle rotated in the direction of velocity
    obj.position.add(velocity);
      
    if(!tween){
        childObj.lookAt(velocity);
    }
  }

  // Separation
  // Method checks for nearby boids and steers away
  function separate (boids) {
    let currentSep = Math.max(sineCutoff, sepSine) * 200 + sepRange - (200 * sineCutoff);
    let desiredseparation = currentSep;
    let steer = new THREE.Vector3();
    let count = 0;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < boids.length; i++) {
      let d = obj.position.distanceTo(boids[i].getObj().position);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        let other = boids[i].getObj();
        let diff = new THREE.Vector3(obj.position.x - other.position.x, obj.position.y - other.position.y, obj.position.z - other.position.z);
        diff.normalize();
        diff.divideScalar(d);        // Weight by distance
        steer.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.divideScalar(count);
    }

    // As long as the vector is greater than 0
    if (steer.length() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.multiplyScalar(maxspeed);
      steer.sub(velocity);
      steer.clampLength(0, maxforce);
    }
      
    return steer;
  }
    
  var randXVal = Math.random() * 5000;
  var randYVal = Math.random() * 5000;
  var randZVal = Math.random() * 5000;
  var randTMult = 100;
  function moveWithNoise(){    
      let noiseX = globalNoise.noise(randXVal + timer * randTMult, randYVal + timer * randTMult) / 100;
      let noiseY = globalNoise.noise(randYVal + timer * randTMult, randXVal + timer * randTMult) / 100;
      let noiseZ = globalNoise.noise(randZVal + timer * randTMult, randXVal + timer * randTMult) / 100;
                  
      let dir = new THREE.Vector3(noiseX, noiseY, noiseZ);
      
      dir.normalize();
      dir.multiplyScalar(0.05);
            
      return dir;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  function align (boids) {
    let neighbordist = aliRange;
    let sum = new THREE.Vector3();
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = obj.position.distanceTo(boids[i].getObj().position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].getVelocity());
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      sum.normalize();
      sum.multiplyScalar(maxspeed);
      let steer = new THREE.Vector3(sum.x - velocity.x, sum.y - velocity.y, sum.z - velocity.z);
      steer.clampLength(0, maxforce);
      return steer;
    } 
    else {
      return new THREE.Vector3(0,0,0);
    }
  }

  // Cohesion
  // For the average position (i.e. center) of all nearby boids, calculate steering vector towards that position
  function cohesion (boids) {
    let neighbordist = cohRange;
    let sum = new THREE.Vector3();   // Start with empty vector to accumulate all positions
    let count = 0;
    for (let i = 0; i < boids.length; i++) {
      let d = obj.position.distanceTo(boids[i].getObj().position);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(boids[i].getObj().position);
        count++;
      }
    }
    if (count > 0) {
      sum.divideScalar(count);
      return seek(sum);  // Steer towards the position
    } 
    else {
      return new THREE.Vector3(0, 0, 0);
    }
  }
    
  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  function seek(target) {
    let desired = new THREE.Vector3(target.x - obj.position.x, target.y - obj.position.y, target.z - obj.position.z); // A vector pointing from the position to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(maxspeed);
    // Steering = Desired minus Velocity
    var steer = new THREE.Vector3(desired.x - velocity.x, desired.y - velocity.y, desired.z - velocity.z);
    steer.clampLength(0, maxforce);  // Limit to maximum steering force
    return steer;
  }
    
  init();
}