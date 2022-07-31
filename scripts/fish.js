export function createFish(scene) {

    var meshTask = scene.assetsManager.addMeshTask("fish", "", "./assets/models/fish/source/", "fish.glb", scene);

    meshTask.onSuccess = function (task) {

        onFishImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onFishImported(meshes, particles, skeletons) {
        let fish = meshes[0];

        fish.name = "fish";

        fish.scaling.scaleInPlace(0.15);
    }
}