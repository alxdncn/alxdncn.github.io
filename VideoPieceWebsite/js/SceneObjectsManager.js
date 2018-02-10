var scope = this;
                    
function createVideoObject(xPos, zPos, yRot, width, height, material){
    let vidGeo = new THREE.PlaneGeometry(width, height);
    let vidPlane = new THREE.Mesh(vidGeo, material);

    let yPos = globalNoise.noise(xPos, zPos) + height/2;

    vidPlane.position.set(xPos, yPos, zPos);
    vidPlane.rotation.y = yRot;

    scene.add(vidPlane);
    allClickableObjects.push(vidPlane);
    trees.push(vidPlane);
}

var trees = [];

var queryTerm = 'nature';

var urls = [
    'https://www.google.com/search?tbm=isch&q=' + queryTerm,
    'http://image.baidu.com/search/index?tn=baiduimage&ps=1&ct=201326592&lm=-1&cl=2&nc=1&ie=utf-8&word=' + queryTerm,
    'https://www.flickr.com/search/?ytcheck=1&new_session=1&text=' + queryTerm,
    'https://imgur.com/search?q=' + queryTerm,
    'https://www.bing.com/images/search?q=' + queryTerm + '&FORM=BILH1',
    'https://duckduckgo.com/?q=' + queryTerm + '&t=h_&iax=1&ia=images', 'https://images.search.yahoo.com/search/images;_ylt=A0LEVxfPPNxZMkAALyZXNyoA;_ylu=X3oDMTE0NzBpZW00BGNvbG8DYmYxBHBvcwMxBHZ0aWQDVUkyQzNfMQRzZWMDcGl2cw--?p=' + queryTerm + '&fr2=piv-web&fr=yfp-t',
    'https://www.tumblr.com/search/' + queryTerm,
    'https://search.naver.com/search.naver?where=image&sm=tab_jum&query=' + queryTerm,
    'https://yandex.com/images/search?text=' + queryTerm,
    'http://image.so.com/i?q=' + queryTerm + '&src=tab_image',
    'https://search.daum.net/search?w=img&nil_search=btn&DA=NTB&enc=utf8&q=' + queryTerm
];

var maxTreeAudio = 0.6;
var minTreeAudio = 0.2;

function changeVideoSpeed(speed){
    
    for(let i = 0; i < videoArray.length; i++){
        videoArray[i].playbackRate = speed;
    }
}

function createTrees(){
    
    let video = document.getElementById( 'treeVideo' );
    videoArray.push(video);

    let treeTex = new THREE.VideoTexture(video);
    treeTex.minFilter = THREE.LinearFilter;
    treeTex.magFilter = THREE.LinearFilter;
    treeTex.format = THREE.RGBFormat;
    let treeMat = new THREE.MeshBasicMaterial({map: treeTex, side: THREE.DoubleSide});
    
    var camFacing = new THREE.Vector3();
    camFacing.addVectors(camera.position, camera.getWorldDirection());
    camFacing.multiplyScalar(12);
    createVideoObject(camFacing.x, camFacing.z, 0, 80, 80, treeMat);
    
    for(var i = 0; i < 100; i++){
        let x = (Math.random() - 0.5) * 2500;
        let z = (Math.random() - 0.5) * 2500;
        let w = 80 + (Math.random()) * 20;
        while(Math.abs(x) < 50 && Math.abs(z) < 15){
            z *= 1.1;
        }
        var rotY = 0;//Math.random() * Math.PI;
        createVideoObject(x, z, rotY, w, w, treeMat);
    }
}

function createSky(){
    let skyVideo = document.getElementById('skyVideo');
    videoArray.push(skyVideo);
    
    let skyTex = new THREE.VideoTexture(skyVideo, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter);
    skyTex.repeat.set(2, 2);
    let skyGeo = new THREE.SphereGeometry(2000, 64, 64);
    let skyMat = new THREE.MeshBasicMaterial({map: skyTex, side: THREE.BackSide})
    let sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
}

function createSceneObjects(){
    createSky();
    
    var terrain;
    generateTerrain(terrain, scene);

    createTrees();
    
}

function runEnvironmentAudio(glitching){
    let minDist = 100000;
    let noSoundDist = 100;
    
    for(let i = 0; i < trees.length; i++){
        let d = playerObj.getWorldPosition().distanceTo(trees[i].position);
        if(d < minDist){
            minDist = d;
        }
    }

    let adjust = maxTreeAudio - minTreeAudio;
    
    if(!glitching){
        treeAudio.volume = adjust - adjust * Math.min(minDist/noSoundDist, 1) + minTreeAudio;
                
    } else{
        dTreeAudio.volume = adjust - adjust * Math.min(minDist/noSoundDist, 1) + minTreeAudio;
    }
}


