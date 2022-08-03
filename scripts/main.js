import { createCustomLoadingScreen } from './loadingSreen.js';
import { createEnvironment, createShaders } from './environment.js';
import { createFish } from './fish.js';
import { createTurtle } from './turtle.js';

let canvas;
let engine;
let scene;

window.onload = startGame;
document.getElementById("card_container").style.display = "none";

function startGame() {
    canvas = document.querySelector("#renderCanvas");
    engine = new BABYLON.Engine(canvas, true, { stencil: true });

    //createCustomLoadingScreen(engine);
    let first = true;

    scene = createScene();

    // main animation loop 60 times/s
    scene.toRender = () => {

        if(first) {
            document.getElementById("card_container").style.display = "block";
            first = false;
        }

        scene.getMeshByName("turtle").move();        

        scene.render();
    };

    // instead of running the game, we tell instead the asset manager to load.
    // when finished it will execute its onFinish callback that will run the loop
    scene.assetsManager.load();
}

window.addEventListener("resize", () => {
    engine.resize()
});

function createScene() {
    let scene = new BABYLON.Scene(engine);

    scene.assetsManager = configureAssetManager(scene);

    createCamera(scene);
    createShaders(scene)
    createEnvironment(scene);

    createFish(scene);
    createTurtle(scene);
    
    return scene;
}

function createCamera(scene) {
    // setup the main camera for the scene and give it control limits
    let mainCam = new BABYLON.ArcRotateCamera("mainCam", BABYLON.Tools.ToRadians(100), BABYLON.Tools.ToRadians(85), 10, new BABYLON.Vector3(-0.25, 1, 0), scene);
    mainCam.layerMask = 1;
    mainCam.lowerRadiusLimit = 10;
    mainCam.upperRadiusLimit = 10;
    mainCam.lowerBetaLimit = BABYLON.Tools.ToRadians(45);
    mainCam.upperBetaLimit = BABYLON.Tools.ToRadians(85);

    mainCam.attachControl(canvas, true);

    return mainCam;
}

function configureAssetManager(scene) {
    // useful for storing references to assets as properties. i.e scene.assets.cannonsound, etc.
    scene.assets = {};

    let assetsManager = new BABYLON.AssetsManager(scene);

    assetsManager.onProgress = function (
        remainingCount,
        totalCount,
        lastFinishedTask
    ) {
        engine.loadingUIText =
            "We are loading the scene. " +
            remainingCount +
            " out of " +
            totalCount +
            " items still need to be loaded.";
        console.log(
            "We are loading the scene. " +
            remainingCount +
            " out of " +
            totalCount +
            " items still need to be loaded."
        );
    };

    assetsManager.onFinish = function (tasks) {
        engine.runRenderLoop(function () {
            scene.toRender();
        });
    };

    return assetsManager;
}

document.getElementById("close_button").onclick = () => {
    document.getElementById("card_container").style.display = "none";
}

document.addEventListener("keypress", function(e) {
    if (e.code === 'KeyF') {
      e.preventDefault();
        document.documentElement.requestFullscreen();
    }
});