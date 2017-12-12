var Fox = function(scene, x, y, z, geo, mat){  
  var obj;
  var childObj;
  var velocity; 
    
  var target = null;
    
  var acceleration;
  
  //TUNING VARIABLES
  //Speeds
  var walkSpeed = 60;
  var stalkSpeed = 40;
  var chaseSpeed = 160;
  var maxspeed = 60;
  var maxforce = 10;
    
  //Detection ranges
  var chaseRange = 200;
  var stalkRange = 500;
    
  var minHunger = 50;
  var maxHunger = 70;
  var hunger = minHunger + (Math.random() * (maxHunger - minHunger));
  
  var defaultSpeed = maxspeed;
  var defaultForce = maxforce;

  var initialized = false;
    
  var worldX = 1100;
  var worldY = 900;
  var worldZ = 1100;
    
  var worldForward = new THREE.Vector3(0,0,1);
    
  var height;
    
  var chasing = false;
  var targetMouse = null;    
  
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
    
    height = 25;
            
    initialized = true;
  }
    
  this.run = function() { 
    if(!initialized)
        return;
      
    update();
    render();
  }
  
  this.getPosition = function(){
      return obj.position;
  }
    
  // Method to update position
  function update() {
    maxspeed = defaultSpeed * deltaTime * globalSpeed;
    maxforce = defaultForce * deltaTime  * globalSpeed;
      
    if(targetMouse !== null){
        target = targetMouse.getPosition();
        
        if(obj.position.distanceTo(target) < chaseRange && chasing === false){
            console.log("CHASE IS ON!");
            chasing = true;
            switchMaxSpeed(chaseSpeed);
        }
        
        if(chasing){
            if(targetMouse.isActive() === false){
                hunger = minHunger/2;
                stopChasing();
                console.log("GOT AWAY!");
            }
            if(obj.position.distanceTo(target) < 15){
                hunger = minHunger + (Math.random() * (maxHunger - minHunger));
                targetMouse.eatMouse();
                stopChasing();
                console.log("CAUGHT IT!");
            }
        }
        
        
        
    } else{
        hunger -= deltaTime;
        
        if(hunger < 0){
            findMouseToStalk();
        }
    }      
      
    if(target !== null){
        applyForce(seek(target, walkSpeed));
        
        if(obj.position.distanceToSquared(target) < 1){
            velocity.multiplyScalar(0);
            acceleration.multiplyScalar(0);
            obj.position.set(target.x, target.y, target.z);
            target = null;
        }
    } else{
        noiseTargetTrigger();
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
    
  function switchMaxSpeed(newMax){
      defaultSpeed = newMax;
  }
    
  function render() {
    // Draw a triangle rotated in the direction of velocity      
    if(!tween && target !== null){
        childObj.lookAt(velocity);
    }
  }

  var randStart = Math.random() * 5000;
    
  function noiseTargetTrigger(){
      let noise = globalNoise.noise(randStart, timer * 1000, false);
      
      if(noise > 0.4 && target === null){
          makeTarget();
      }      
  }
    
  function applyForce(force) {
    // We could add mass here if we want A = F / M
    acceleration.add(force);
  }
    
  function makeTarget(){
      switchMaxSpeed(walkSpeed);
      let minDist = 200;
      let maxDist = 500;
      
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
  function seek(yourTarget, speed) {
    let desired = new THREE.Vector3(yourTarget.x - obj.position.x, yourTarget.y - obj.position.y, yourTarget.z - obj.position.z); // A vector pointing from the position to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.multiplyScalar(speed);
    // Steering = Desired minus Velocity
    var steer = new THREE.Vector3(desired.x - velocity.x, desired.y - velocity.y, desired.z - velocity.z);
    steer.clampLength(0, maxforce);  // Limit to maximum steering force
    return steer;
  }
    
  function stopChasing(){
      targetMouse = null;
      target = null;
      chasing = false;
      velocity.multiplyScalar(0);
      acceleration.multiplyScalar(0);
      switchMaxSpeed(walkSpeed);
  }
    
  function findMouseToStalk(){      
      let closestMouse = new THREE.Object3D();
      let minDist = 100000;
      
      let foundMouse = false;
      
      for(var i = 0; i < mice.length; i++){
          if(mice[i].isActive() === false){
              continue;
          }
          let d = obj.position.distanceTo(mice[i].getPosition());
          if(d < stalkRange && d < minDist){
              minDist = d;
              closestMouse = mice[i];
              foundMouse = true;
          }
      }
      
      if(foundMouse === true){
          switchMaxSpeed(stalkSpeed);
          targetMouse = closestMouse;
      }
  }
    
  function flee(fox){
      let retValue = new THREE.Vector3(0,0,0);
      
      let foxDist = fox.position.distanceTo(obj.position);
      
      if(foxDist < fleeRange){
          let fleeDir = new THREE.Vector3(obj.position.x - fox.position.x, 0, obj.position.z - fox.position.z);
          fleeDir.normalize();
          fleeDir.multiplyScalar(fleeSpeed);
          
          runToNearestHole(fleeDir);
          
          retValue = new THREE.Vector3(fleeDir.x - velocity.x, 0, fleeDir.z - velocity.z);
          retValue.normalize();
          retValue.multiplyScalar(fleeForce);
      }
      
      return retValue;
      
  }
  init();
    
}