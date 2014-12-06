/**
 * Created by Jure on 6.12.2014.
 */
function mousewheel( event ) {
  event.preventDefault();
  event.stopPropagation();

  var delta = 0;

  if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9
    delta = event.wheelDelta / 40;
  } else if ( event.detail ) { // Firefox
    delta = - event.detail / 3;
  }

  var width = Game.camera.right / Game.zoom;
  var height = Game.camera.top / Game.zoom;

  Game.zoom -= delta * 0.001;

  Game.camera.left = -Game.zoom*width;
  Game.camera.right = Game.zoom*width;
  Game.camera.top = Game.zoom*height;
  Game.camera.bottom = -Game.zoom*height;

  Game.camera.updateProjectionMatrix();

  Game.renderer.render( Game.scene, Game.camera );

};