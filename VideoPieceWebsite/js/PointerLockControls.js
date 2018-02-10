/**
 * @author mrdoob / http://mrdoob.com/
 */

var tween = false;
THREE.PointerLockControls = function ( camera, scene ) {

	var scope = this;
    
    this.enabled = false;
    this.canMove = true;
    this.yHeight = 20;
    this.raycaster = new THREE.Raycaster(camera.position, camera.getWorldDirection(), camera.near, camera.far); 

    this.tweenObject;
    this.baseFOV = camera.fov;

	camera.rotation.set( 0, 0, 0 );
    
	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );
    scene.add(pitchObject);
    
    
    document.addEventListener('click', function lockPointer(event){
        var element = document.body;
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        element.requestPointerLock();
        scope.enabled = true;
    }, false);
    
    document.addEventListener('pointerlockchange', function(event){
        if(document.pointerLockElement !== document.body &&
           document.mozPointerLockElement !== document.body && 
           document.webkitRequestPointerLock !== document.body){
            scope.enabled = false;
        }
    }, false);


    var yawObject;
	yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );
    scene.add(yawObject);
    playerObj = yawObject;
    
    var centerObj;

	var PI_2 = Math.PI / 2;
    
    var moveForward;
    var moveBackward;
    var moveLeft;
    var moveRight;
    
    var lastPosition = new THREE.Vector3();
    
    var vector = new THREE.Vector3();
    var worldUp = new THREE.Vector3(0,1,0);
    var speedVector = new THREE.Vector3();
    var speed = 50;
    
    var startDistFromObj;
    
    this.castRays = false;
    
    this.getRaycast = function(){
        return scope.castRays;
    }
    
    this.setRaycast = function(value){
        scope.castRays = value;
    }

	var onMouseMove = function ( event ) {
        
		if ( scope.enabled === false ) return;
        
		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.001;
		pitchObject.rotation.x -= movementY * 0.001;
        
		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

        if(scope.castRays){
            rayCast();
        }
	};
    
    var hoveredObject = null;
    var raycenter = new THREE.Vector2(0, 0), INTERSECTED;

    var uniforms = {
		texture: { type: "t", value: 0 },
		texture2: { type: "t", value: tex }
	};

	// material
	var hoveredMat = new THREE.ShaderMaterial({
		uniforms        : uniforms,
        side            : THREE.DoubleSide,
		vertexShader    : document.getElementById( 'vertex_shader' ).textContent,
		fragmentShader  : document.getElementById( 'fragment_shader' ).textContent
	});
    
//    var hoveredMat = new THREE.MeshBasicMaterial({color:0x778877, side: THREE.DoubleSide});
    var storeMat;
    
    var rayCast = function(){
        if(scope.enabled){
            let dir = new THREE.Vector3();//camera.position.add(camera.getWorldDirection()).normalize();
            camera.getWorldDirection(dir);
            scope.raycaster.set(camera.getWorldPosition(), dir);
            
            let params = scope.raycaster.intersectObjects(allClickableObjects);
                        
            if(params[0] !== undefined){
                if(hoveredObject === null){
                    hoveredObject = params[0].object;
                    storeMat = hoveredObject.material;
                    hoveredMat.uniforms.texture.value = hoveredObject.material.map;
                    hoveredMat.needsUpdate = true;
//                    hoveredMat.map = hoveredObject.material.map;
                    hoveredObject.material = hoveredMat;
                }
                else if(hoveredObject !== params[0].object){
                    hoveredObject.material = storeMat;
                    hoveredObject = params[0].object;
                    storeMat = hoveredObject.material;
                    hoveredMat.uniforms.texture.value = hoveredObject.material.map;
                    hoveredMat.needsUpdate = true;
//                    hoveredMat.map = hoveredObject.material.map;
                    hoveredObject.material = hoveredMat;
                }
            } else{
                if(hoveredObject != null){
                    hoveredObject.material = storeMat;
                    storeMat = null;
                    hoveredObject = null;
                    hoveredMat.map = null;
                }
            }
            
            camera.position.set(0,0,0);
            camera.rotation.set(0,0,0);
        }
    }
    
    function lockCamera(){
        if(hoveredObject !== null){
            let tempPos = yawObject.getWorldPosition();
            tempPos.sub(hoveredObject.position);
            startDistFromObj = tempPos.length();
            let pos = yawObject.getWorldPosition();
            yawObject.position.set(pos.x, pos.y, pos.z);
            yawObject.parent = null;
            if(hoveredObject.parent !== scene){
                tweenObject = hoveredObject.parent;
            } else{
                tweenObject = hoveredObject;
            }
            scope.setCanMove(false);
            changeSpeed(0);
            tween = true;
        }
    }
    
    //f(x) = (sin(2 * π * (x - 1/4)) + 1) / 2
    function tweenToObject(objFrom){
        let vecMag = new THREE.Vector3();
        vecMag.subVectors(tweenObject.position, objFrom.position);
        let magnitude = vecMag.length();
        if(magnitude > 0.1 ){
            let magDiff = 1 - magnitude/startDistFromObj;
            
            let newFOV = (Math.sin(2 * Math.PI * (magDiff - 1/4)) + 1)/4;
            
            camera.fov = scope.baseFOV + 20 * newFOV;
            
            camera.updateProjectionMatrix();
            objFrom.position.lerp(tweenObject.position, 5 * deltaTime);
        } else{
            tween = false;
            changeSpeed(1);
            let rot = objFrom.rotation;
            tweenObject.add(yawObject);
            objFrom.position.set(0,0,0);
            tweenObject = null;
            camera.fov = scope.baseFOV;
            camera.updateProjectionMatrix();
        }
    }
    
    this.getYawObject = function(){
        return yawObject;
    }
    
	this.dispose = function() {

		document.removeEventListener( 'mousemove', onMouseMove, false );

	};
    
    document.addEventListener('mousedown', lockCamera, false);

	document.addEventListener( 'mousemove', onMouseMove, false );

    function keyDown(event){
        switch(event.keyCode){
            case 87:
                moveForward = true;
                break;  
            case 83:
                moveBackward = true;
                break;
            case 65:
                moveLeft = true;
                break;
            case 68:
                moveRight = true;
                break;
        }
    }

    function keyUp(event){
        switch(event.keyCode){
            case 87:
                moveForward = false;
                break;
            case 83:
                moveBackward = false;
                break;
            case 65:
                moveLeft = false;
                break;
            case 68:
                moveRight = false;
                break;
        } 
    }

    document.addEventListener('keydown', function(event){keyDown(event)}, false);
    document.addEventListener('keyup', function(event){keyUp(event)}, false);

    this.update = function(deltaTime){
        if(tween){
            tweenToObject(yawObject);
            return;
        }
        
        if(!scope.canMove)
            return;
        
        lastPosition.set(yawObject.position.x, yawObject.position.y, yawObject.position.z);
        
        camera.getWorldDirection(vector);
                
        var crossProd = new THREE.Vector3();
        crossProd.crossVectors(vector, worldUp);

        //Prevent the direction of the camera from effecting
        //up and down directions
        vector.y = 0;
        crossProd.y = 0;
        
        speedVector.set(speed * deltaTime, speed * deltaTime, speed * deltaTime);

        vector.normalize();
        crossProd.normalize();
        
        vector.multiply(speedVector);
        crossProd.multiply(speedVector);
        if(moveForward){
            yawObject.position.addVectors(yawObject.position, vector);
        }
        if(moveBackward){
            yawObject.position.addVectors(yawObject.position, vector.negate());
        }
        if(moveLeft){
            yawObject.position.addVectors(yawObject.position, crossProd.negate());
        }
        if(moveRight){
            yawObject.position.addVectors(yawObject.position, crossProd);
        }
                
        yawObject.position.y = globalNoise.noise(yawObject.position.x, yawObject.position.z) + scope.yHeight;
        
        let xyPos = new THREE.Vector2(yawObject.position.x, yawObject.position.z);
                
        if(xyPos.lengthSq() > (worldEdge * worldEdge)){
            console.log("LAST POS: " + lastPosition + "CURRENT POS: " + yawObject.position);
            yawObject.position.set(lastPosition.x, lastPosition.y, lastPosition.z);
        }
        
    }
    
    this.setCanMove = function(bool){
        scope.canMove = bool;
        if(bool === true){
            yawObject.parent = null;
        }
    }
    
    this.getYHeight = function(){
        return scope.yHeight;
    }
    
    this.setYHeight = function(val){
        scope.yHeight = val;
    }
    
	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function() {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, "YXZ" );

		return function( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	}();

};