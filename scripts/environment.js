export function createShaders(scene) {
    let textureCamera = new BABYLON.ArcRotateCamera("textureCam", 0, 0, 190, new BABYLON.Vector3.Zero(), scene);
    textureCamera.layerMask = 2;
    textureCamera.mode = 1;
    textureCamera.orthoLeft = -7;
    textureCamera.orthoTop = 7;
    textureCamera.orthoRight = 7;
    textureCamera.orthoBottom = -7;

    // create a spotlight that will project the cuastics pattern as light
    let light = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(0, 40, 0), BABYLON.Vector3.Down(), BABYLON.Tools.ToRadians(50), 8, scene);

    // create a high resolution plane to function as the basis for the water caustics
    let waterPlane = new BABYLON.Mesh.CreateGround("waterPlane", 15, 15, 400, scene);
    waterPlane.layerMask = 2;

    // setup a render target texture from the view of the texture camera, recording the waterplane...also set the render target UVs to a higher resolution with a mirrored wrap mode
    let renderTarget = new BABYLON.RenderTargetTexture("RTT", 1024, scene);
    renderTarget.activeCamera = textureCamera;
    scene.customRenderTargets.push(renderTarget);
    renderTarget.renderList.push(waterPlane);
    renderTarget.wrapU = BABYLON.Constants.TEXTURE_MIRROR_ADDRESSMODE;
    renderTarget.wrapV = BABYLON.Constants.TEXTURE_MIRROR_ADDRESSMODE;
    renderTarget.uScale = 2;
    renderTarget.vScale = 2;

    // instruct the spotlight to project the rendered target texture as a light projection
    light.projectionTexture = renderTarget;

    // load the waterShader from a URL snippet and assign it to the high res water plane
    BABYLON.NodeMaterial.ParseFromSnippetAsync("7X2PUH", scene).then(nodeMaterial => {
        nodeMaterial.name = "causticMaterial";
        waterPlane.material = nodeMaterial;
    });
}

export function createEnvironment(scene) {
    // create a background cube
    let backgroundCube = BABYLON.MeshBuilder.CreateBox("background", { size: 60, sideOrientation: 2 }, scene);
    
    // create hemispheric light to see fish colors
    let light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 0, 0), scene);

    createFog(scene);
    createGround(scene);
    createGodRays(scene);
    
    createRockArch(scene);
    createSmallRock(scene, -4, 0, 0, 0);
    createSmallRock(scene, -4.5, 0.2, 0.5, 0);
    createSmallRock(scene, -5, -0.2, 5, 90);
    createAnchor(scene);

    let range = 20

    for (let pas = 0; pas < 10; pas++) {
        createPlant(scene, Math.random()*(0.03-0.01)+0.01, Math.random()*(0-range), Math.random()*range);
        createPlant(scene, Math.random()*(0.03-0.01)+0.01, Math.random()*range, Math.random()*(0-range));
        createPlant(scene, Math.random()*(0.03-0.01)+0.01, Math.random()*(0-range), Math.random()*(0-range));
        createPlant(scene, Math.random()*(0.03-0.01)+0.01, Math.random()*range, Math.random()*range);
    }
}

function createFog(scene) {
    // setup fog in the scene
    scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
    scene.fogStart = 5;
    scene.fogEnd = 25;
    scene.fogColor = new BABYLON.Color3(0.0, 0.87, 0.87);
    scene.fogDensity = 0.1;
}

function createGround(scene) {
    // load the assets for the scene and apply node materials from URL snippets
    BABYLON.SceneLoader.ImportMesh("", "./assets/ground/", "underwaterGround.glb", scene, function (newMeshes) {
        newMeshes[0].name = "underWaterGround";
        let childMeshes = newMeshes[0].getChildMeshes(false);
        for (let i = 0; i < childMeshes.length; i++) {
            childMeshes[i].layerMask = 1;
        }
        BABYLON.NodeMaterial.ParseFromSnippetAsync("XWTJA2", scene).then(nodeMaterial => {
            nodeMaterial.name = "groundMaterial";
            scene.getMeshByName("ground").material = nodeMaterial;
        });
    });
}

function createGodRays(scene) {
    // setup the "god rays"
    // particle system variables
    let volumetricEmitter = new BABYLON.AbstractMesh("volumetricEmitter", scene);

    // set up animation sheet
    let setupAnimationSheet = function (system, texture, width, height, numSpritesWidth, numSpritesHeight, animationSpeed, isRandom) {
        // assign animation parameters
        system.isAnimationSheetEnabled = true;
        system.particleTexture = new BABYLON.Texture(texture, scene, false, false, BABYLON.Texture.TRILINEAR_SAMPLINGMODE);
        system.particleTexture.wrapU = BABYLON.Texture.CLAMP_ADDRESSMODE;
        system.particleTexture.wrapV = BABYLON.Texture.CLAMP_ADDRESSMODE;
        system.spriteCellWidth = width / numSpritesWidth;
        system.spriteCellHeight = height / numSpritesHeight;
        let numberCells = numSpritesWidth * numSpritesHeight;
        system.startSpriteCellID = 0;
        system.endSpriteCellID = numberCells - 1;
        system.spriteCellChangeSpeed = animationSpeed;
        system.spriteRandomStartCell = isRandom;
        system.updateSpeed = 1 / 30;
    };

    // particle system
    let volumetricSystem = new BABYLON.ParticleSystem("volumetricSystem", 100, scene, null, true);
    setupAnimationSheet(volumetricSystem, "https://models.babylonjs.com/Demos/UnderWaterScene/godRays/volumetricLight.png", 1024, 1024, 4, 1, 0, true);
    volumetricSystem.emitter = volumetricEmitter.position;
    let boxEmitter = volumetricSystem.createBoxEmitter(new BABYLON.Vector3(-1, 0, 0), new BABYLON.Vector3(1, 0, 0), new BABYLON.Vector3(-5, 5, -3), new BABYLON.Vector3(5, 5, 3));
    boxEmitter.radiusRange = 0;
    volumetricSystem.minInitialRotation = 0;
    volumetricSystem.maxInitialRotation = 0;
    volumetricSystem.minScaleX = 6;
    volumetricSystem.maxScaleX = 10;
    volumetricSystem.minScaleY = 30;
    volumetricSystem.maxScaleY = 50;
    volumetricSystem.minLifeTime = 6;
    volumetricSystem.maxLifeTime = 9;
    volumetricSystem.emitRate = 15;
    volumetricSystem.minEmitPower = 0.05;
    volumetricSystem.maxEmitPower = 0.1;
    volumetricSystem.minSize = 0.1;
    volumetricSystem.maxSize = 0.2;
    volumetricSystem.addColorGradient(0, new BABYLON.Color4(0, 0, 0, 0));
    volumetricSystem.addColorGradient(0.5, new BABYLON.Color4(0.25, 0.25, 0.3, 0.2));
    volumetricSystem.addColorGradient(1.0, new BABYLON.Color4(0, 0, 0, 0));
    volumetricSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    volumetricSystem.start();
}

function createRockArch(scene) {
    var meshTask = scene.assetsManager.addMeshTask("rock_arch", "", "./assets/models/rock_arch/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onRockArchImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onRockArchImported(meshes, particles, skeletons) {
        let rock_arch = meshes[0];

        rock_arch.name = "rock_arch";
        
        rock_arch.scaling.scaleInPlace(0.025);

        rock_arch.position.x = 5;
        rock_arch.position.z = -3;
        rock_arch.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(100), BABYLON.Space.LOCAL);
    }
}

function createAnchor(scene) {
    var meshTask = scene.assetsManager.addMeshTask("anchor", "", "./assets/models/anchor/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onAnchorImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onAnchorImported(meshes, particles, skeletons) {
        let anchor = meshes[0];

        anchor.name = "anchor";
        
        anchor.scaling.scaleInPlace(0.04);

        anchor.position.x = 5;
        anchor.position.z = 0;
        anchor.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(10), BABYLON.Space.LOCAL);
    }
}

function createPlant(scene, scale, posX, posZ) {
    var meshTask = scene.assetsManager.addMeshTask("plant", "", "./assets/models/plant/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onPlantImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onPlantImported(meshes, particles, skeletons) {
        let plant = meshes[0];

        plant.name = "plant";
        
        plant.scaling.scaleInPlace(scale);

        plant.position.x = posX;
        plant.position.z = posZ;
    }
}

function createSmallRock(scene, posX, posY, posZ, angle) {
    var meshTask = scene.assetsManager.addMeshTask("smallRock", "", "./assets/models/small_rock/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onSmallRockImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onSmallRockImported(meshes, particles, skeletons) {
        let smallRock = meshes[0];

        smallRock.name = "smallRock";

        smallRock.position.x = posX;
        smallRock.position.y = posY;
        smallRock.position.z = posZ;

        smallRock.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(angle), BABYLON.Space.LOCAL);
    }
}

function createCorail(scene, num) {
    var meshTask = scene.assetsManager.addMeshTask("corail", "", "./assets/models/corail" + num +"/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onCorailImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onCorailImported(meshes, particles, skeletons) {
        let corail = meshes[0];

        corail.name = "corail";
        
        if(num === 1) corail.scaling.scaleInPlace(1);
        else if(num === 2) corail.scaling.scaleInPlace(0.1);
        else if(num === 3) corail.scaling.scaleInPlace(0.05);
        else if(num === 4) corail.scaling.scaleInPlace(1);
        else if(num === 5) corail.scaling.scaleInPlace(0.05);

        corail.position.x = 1;
        corail.position.y = 1;
        corail.position.z = 1;
    }
}