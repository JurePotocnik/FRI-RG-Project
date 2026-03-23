function mousewheel(event) {
  event.preventDefault();
  event.stopPropagation();

  var delta = 0;

  if (event.wheelDelta) {
    delta = event.wheelDelta / 40;
  } else if (event.detail) {
    delta = -event.detail / 3;
  }

  Game.cameraScale -= delta * 0.0024;
  Game.cameraScale = Math.max(0.03, Math.min(0.16, Game.cameraScale));
  Game.updateCameraFrustum();
  Game.renderer.render(Game.scene, Game.camera);
}
