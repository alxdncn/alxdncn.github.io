var deltaTime;
var flock;

var sepSine = 0;
var sepHolder = 0;
var sepSineInc = 0.3;

var flockTime = 1;
var numBoids = 70;

var mouse;

var holes = [];
var maxSize = 2500;

var mice = [];

var sceneFox;

var maxCrowAudio = 1;

function initMiceAndHoles (){
    let vid = document.getElementById("mouseVideo");
    videoArray.push(vid);
    let vidTex = new THREE.VideoTexture(vid);
    vidTex.minFilter = THREE.NearestFilter;
    let _geo = new THREE.PlaneGeometry(10, 10);//new THREE.SphereGeometry(5, 8, 8);
    let _mat = new THREE.MeshBasicMaterial({map: vidTex, side: THREE.DoubleSide});
    
    for(var i = 0; i < 40; i++){
        let x = (Math.random() - 0.5) * maxSize;
        let z = (Math.random() - 0.5) * maxSize;
        let y = globalNoise.noise(x, z);
        
//        let tempGeo = new THREE.SphereGeometry(10);
//        let tempMat = new THREE.MeshBasicMaterial();
//        
//        let sp = new THREE.Mesh(tempGeo, tempMat);
//        sp.position.set(x,y,z);
//        scene.add(sp);
        
        holes.push(new THREE.Vector3(x, y, z));
        console.log(holes);
    }
    
    for(var i = 0; i < 12; i++){
        let x = (Math.random() - 0.5) * maxSize;
        let z = (Math.random() - 0.5) * maxSize;
        let y = globalNoise.noise(x, z);
        let mouseSize = (8 + (Math.random() * 4))/10;
        mice.push(new Mouse(scene, x, y, z, _geo, _mat, mouseSize));
    }
}

function makeFox(){
    let vid = document.getElementById("foxVideo");
    videoArray.push(vid);
    let vidTex = new THREE.VideoTexture(vid);
    vidTex.minFilter = THREE.NearestFilter;
    
    let _geo = new THREE.PlaneGeometry(25, 25);
    let _mat = new THREE.MeshBasicMaterial({map: vidTex, side: THREE.DoubleSide});
    
    let x = (Math.random() - 0.5) * maxSize;
    let z = (Math.random() - 0.5) * maxSize;
    let y = globalNoise.noise(x, z);
    
    sceneFox = new Fox(scene, x, y, z, _geo, _mat);
//    sceneFox = new Fox(scene, 0, 0, 0, _geo, _mat);

}

function makeFlock() {  
    let vid = document.getElementById("ravenVideo");
    videoArray.push(vid);
    let vidTex = new THREE.VideoTexture(vid);
    vidTex.minFilter = THREE.NearestFilter;
    let _geo = new THREE.PlaneGeometry(10, 10);//new THREE.SphereGeometry(5, 8, 8);
    let _mat = new THREE.MeshBasicMaterial({map: vidTex, side: THREE.DoubleSide});

    flock = new Flock();
    // Add an initial set of boids into the system
    for (var i = 0; i < numBoids; i++) {
        var b = new Boid(scene, 2500, 250, (Math.random() - 0.5) * 100, _geo, _mat);
        flock.addBoid(b);
        allClickableObjects.push(b.getChildObj());
    }
    crowAudio.play();
}

function createLandCreatures(){
    initMiceAndHoles();
    makeFox();
}

function runMouse(){
    for(let i = 0; i < mice.length; i++){
        if(mice[i] === undefined){
            return;
        }    
        mice[i].run();
    }
}

function runFox(){
    sceneFox.run();
}

function runAnimalAudio(glitching){
    let minDist = 100000;
    let noSoundDist = 1200;
    let average = new THREE.Vector3();
    
    if(!flock){
        return;
    }
    for(let i = 0; i < numBoids; i++){
        average.add(flock.getBoid(i));
        let d = playerObj.getWorldPosition().distanceTo(flock.getBoid(i));
        if(d < minDist){
            minDist = d;
        }
    }

    average.divideScalar(numBoids);

    let overall = average.distanceTo(playerObj.getWorldPosition()) + minDist;
    overall /= 2;
    
    if(!glitching){
        crowAudio.volume = maxCrowAudio - maxCrowAudio * Math.min(overall/noSoundDist, 1);
    } else{
        dCrowAudio.volume = maxCrowAudio - maxCrowAudio * Math.min(overall/noSoundDist, 1);
    }
}