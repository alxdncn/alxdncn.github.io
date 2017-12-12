var Mouse = function(scene, x, y, z, geo, mat, matHeight){  
  var obj;
  var childObj;
  var velocity; 
    
  var target = null;
    
  var acceleration;
  
  //TUNING VARIABLES
  //Speeds
  var rMaxS = 70;
  var rMinS = 60;
  var rMaxF = 20;
  var rMinF = 17;

  //Detection ranges
  var fleeRange = 100;
  
  var maxspeed = rMinS;    // Maximum speed
  var maxforce = rMinF;    // Maximum steering force
    
  var walkSpeed = rMinS + Math.random() * (rMaxS - rMinS);
  var fleeSpeed = walkSpeed * 2;
    
  var defaultSpeed = walkSpeed;
  var defaultForce = rMinF + Math.random() * (rMaxF - rMinF);

  var initialized = false;
    
  var worldX = 1100;
  var worldY = 900;
  var worldZ = 1100;
    
  var worldForward = new THREE.Vector3(0,0,1);
    
  var height;
    
  var runToHole = null;
  var reachHoleDist = 8;
  var straightToHoleDist = 25;
  var straightToHole = false;
    var fleeing = false;
    
  this.getPosition = function(){
      return obj.position;
  }
  
  function init() {
    acceleration = new THREE.Vector3(0, 0, 0);
    velocity = new THREE.Vector3();
    let pos = new THREE.Vector3(x, y, z);
    
    childObj = new THREE.Mesh(geo, mat);
    scene.add(childObj);

    obj = new THREE.Object3D();
    obj.position.set(pos.x, pos.y, pos.z);
    scene.add(obj);

    obj.add(childObj);
    childObj.position.set(0,0,0);
      
    allClickableObjects.push(childObj);
    
    obj.scale.set(matHeight, matHeight, matHeight);
      
    height = 10 * matHeight;
            
    initialized = true;
  }
    
  this.run = function() { 
    if(!initialized || killed)
        return;
      
    update();
    render();
  }
    
  // Method to update position
  function update() {
    if(runTimer){
        holeTimer += deltaTime;
        if(holeTimer > holeTime){
            reappear();
        }
        return;
    }  
    
    maxspeed = defaultSpeed * deltaTime * globalSpeed;
    maxforce = defaultForce * deltaTime  * globalSpeed;
    
    if(runToHole === null){
        noiseTargetTrigger();
    } else {
        let distToHole = obj.position.distanceTo(runToHole);
        
        if(distToHole < reachHoleDist){
            reachHole();
        } else if(distToHole < straightToHoleDist && !straightToHole){
            console.log("STRAIGHT SHOT");
            straightToHole = true;
        }
    }
      
    if(!straightToHole){
       flee(sceneFox.getPosition());
    }
      
    if(target !== null){
        applyForce(seek(target));
        
        if(obj.position.distanceToSquared(target) < 1){
            velocity.multiplyScalar(0);
            acceleration.multiplyScalar(0);
            obj.position.set(target.x, target.y, target.z);
            target = null;
        }
    }
    // Update velocity
    velocity.add(acceleration);
    // Limit speed
    velocity.clampLength(0, maxspeed);
    obj.position.add(velocity);
    obj.position.y = globalNoise.noise(obj.position.x, obj.position.z) + height/2;
          
    // Reset accelertion to 0 each cycle
    acceleration.multiplyScalar(0);
  }
    
  function render() {
    // Draw a triangle rotated in the direction of velocity
//    obj.position.add(velocity);
      
    if(!tween && target !== null){
        childObj.lookAt(velocity);
    }
  }
    
  function switchMaxSpeed(newSpeed){
      defaultSpeed = newSpeed;
  }

  var randStart = Math.random() * 5000;
  function noiseTargetTrigger(){
      let noise = globalNoise.noise(randStart, timer * 1000, false);
      
      if(noise > 0.6 && target === null){
          makeTarget();
      }
      
  }
    
  function applyForce(force) {
    // We could add mass here if we want A = F / M
    acceleration.add(force);
  }
    
  function makeTarget(){
      
      let minDist = 50;
      let maxDist = 150;
      
      let randX = (Math.random() - 0.5) * 2;
      let randZ = (Math.random() - 0.5) * 2;

      //now that it's between 0 and 1, let's set a vector and make its magnitude between min and max
      target = new THREE.Vector3(randX, 0, randZ);
      
      let mag = minDist + Math.random() * (maxDist - minDist);
      
      target.normalize();
      target.multiplyScalar(mag);
      target.x = obj.position.x + target.x;
      target.z = obj.position.z + target.z;
      
      if(target.length() > worldEdge){
          target.set(0,0,0);
      }
                  
      target.y = globalNoise.noise(target.x, target.z) + height/2;
  }
    
  // A method that calculates and applies a steering force towards a target
  // STEER = DESIRED MINUS VELOCITY
  function seek(yourTarget) {
    let desired = new THREE.Vector3(yourTarget.x - obj.position.x, yourTarget.y - obj.position.y, yourTarget.z - obj.position.z); // A vector pointing from the position to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(walkSpeed);
    // Steering = Desired minus Velocity
    var steer = new THREE.Vector3(desired.x - velocity.x, desired.y - velocity.y, desired.z - velocity.z);
    steer.clampLength(0, maxforce);  // Limit to maximum steering force
    return steer;
  }
    
  var minDotToHole = 0.25;
        
  function runToNearestHole(directionFromFox){
     let closestHole = new THREE.Vector3();
     let minDist = 100000;
      
      directionFromFox.normalize();
      if(runToHole !== null){
          let dir = new THREE.Vector3();
          dir.subVectors(runToHole, obj.position);
          dir.normalize();
          if(dir.dot(directionFromFox) > minDotToHole){
              return;
          }
      }

    for(var i = 0; i < holes.length; i++){
         let dir = new THREE.Vector3(holes[i].x - obj.position.x, holes[i].y - obj.position.y, holes[i].z - obj.position.z);
         let dirCopy = new THREE.Vector3();
         dirCopy.copy(dir);
         dir.normalize();
         
         if(dir.dot(directionFromFox) > minDotToHole && dirCopy.length() < minDist){
              closestHole = holes[i];
              minDist = dirCopy.length();
         }
      }
      target = closestHole;
      runToHole = closestHole;
  }
    
  function flee(fox){
      let retValue = new THREE.Vector3(0,0,0);
      
      let foxDist = fox.distanceTo(obj.position);
      
      if(foxDist < fleeRange){
          if(fleeing === false){
              switchMaxSpeed(fleeSpeed);
              fleeing = true;
          }
          let fleeDir = new THREE.Vector3(obj.position.x - fox.x, 0, obj.position.z - fox.z);
          fleeDir.normalize();
          fleeDir.multiplyScalar(fleeSpeed);
          
          runToNearestHole(fleeDir);
          
//          retValue = new THREE.Vector3(fleeDir.x - velocity.x, 0, fleeDir.z - velocity.z);
//          retValue.normalize();
//          retValue.multiplyScalar(fleeForce);
      }
      
//      return retValue;
      
  }
    
  var holeTimer = 0;
  var holeTime = 30;
  var runTimer = false;
  var lastHole;
  var killed = false;
    
  this.eatMouse = function(){
      killed = true;
      scene.remove(obj);
  }
    
  this.isActive = function(){
      active = true;
      if(runTimer === true || killed === true){
          active = false;
      }
      return active;
  }
    
  function reachHole(){      
      scene.remove(obj);
      
      fleeing = false;
      
      switchMaxSpeed(walkSpeed);
      
      straightToHole = false;
      
      runTimer = true;
      
      lastHole = runToHole;
      
      runToHole = null;
  }
    
  function reappear(){
      scene.add(obj);
      runTimer = false;
      holeTimer = 0;
      obj.position = lastHole;
      makeTarget();
  }
  init();
    
}