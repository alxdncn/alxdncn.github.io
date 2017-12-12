var generateTerrain = function(object, scene){
    let loader = new THREE.JSONLoader();
    
    let grassVideo = document.getElementById('grassVideo');
    videoArray.push(grassVideo);
    let grassTex = new THREE.VideoTexture(grassVideo, THREE.UVMapping, THREE.RepeatWrapping, THREE.RepeatWrapping, THREE.NearestFilter, THREE.NearestFilter);
    grassTex.repeat.set( 1, 1 );
    
    loader.load('models/Circle.json', 
        function(geometry){
        
            for(let i = 0; i < geometry.vertices.length; i++){
                geometry.vertices[i].x *= 15;
                geometry.vertices[i].z *= 15;
                geometry.vertices[i].y = globalNoise.noise(geometry.vertices[i].x, geometry.vertices[i].z);
            }
            
            geometry.verticesNeedUpdate = true;
            geometry.normalsNeedUpdate = true;
            geometry.elementsNeedUpdate = true;
            geometry.groupsNeedUpdate = true;
            geometry.lineDistancesNeedUpdate = true;
            geometry.colorsNeedUpdate = true;
            geometry.uvsNeedUpdate = true;
            geometry.computeBoundingBox ();
            geometry.computeBoundingSphere ();
        
            let material = new THREE.MeshBasicMaterial({map: grassTex, side: THREE.BackSide});
        
            material.needsUpdate = true;
            object = new THREE.Mesh( geometry, material );
        
        
            scene.add(object);
        });    
    
}