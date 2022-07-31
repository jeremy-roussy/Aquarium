export function createTurtle(scene) {

    var meshTask = scene.assetsManager.addMeshTask("turtle", "", "./assets/models/turtle/", "scene.gltf", scene);

    meshTask.onSuccess = function (task) {

        onTurtleImported(task.loadedMeshes,
            task.loadedParticleSystems,
            task.loadedSkeletons);
    }

    meshTask.onerror = function () {
        console.log("ERRORRRR");
    }

    function onTurtleImported(meshes, particles, skeletons) {
        let turtle = meshes[0];

        const localAxes = new BABYLON.AxesViewer(scene, 0.01);
        localAxes.xAxis.parent = turtle;
        localAxes.yAxis.parent = turtle;
        localAxes.zAxis.parent = turtle;

        turtle.name = "turtle";
        turtle.scaling.scaleInPlace(1);
        turtle.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(-25), BABYLON.Space.LOCAL);
        
        turtle.position.x = -10;
        turtle.position.y = 3;
        turtle.position.z = -10;
        turtle.speed = 0.05;
        
        turtle.move = () => {
            turtle.frontVector = localAxes.zAxis.forward;

            turtle.moveWithCollisions(
                turtle.frontVector.multiplyByFloats(turtle.speed, turtle.speed, turtle.speed)
            );
                
            turtle.rotate(BABYLON.Axis.Y, BABYLON.Tools.ToRadians(0.2), BABYLON.Space.LOCAL);
        }
    }
}