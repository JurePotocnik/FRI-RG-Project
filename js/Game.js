
(function (window, undefined) {
	if (window.Game === undefined)
		window.Game = {};

	var rootGame = window.Game,
		Game = function (selector, context) {
			return new Game.fn.init(selector, context, rootGame);
		},
		document = window.document,
		location = window.location;

	Game.fn = Game.prototype = {
		version: 0.01,
		constructor: Game,
		init: function (selector, context, rootGame) {
			if (!selector)
				return this;

			var selectorObject = $(selector);
			if (selectorObject.length) {
				this[0] = selectorObject[0];
				this.length = 1;
			}

			this.context = document;
			this.selector = selector;

			return this;
		},
		length: 0,
		context: null,
		selector: null,
		scene: null,
		camera:null,
		renderer:null,
		islands: null,
		zoom: null,
		controls: null
	};


	Game.fn.init.prototype = Game.fn;

	window.Game = Game;
})(window);

Game.initScene = function(){
	if(Game.scene === undefined){
		Game.scene = new THREE.Scene();

		var width = window.innerWidth;
		var height = window.innerHeight;

		Game.zoom = 0.01;
		/*
		 var camera = new THREE.PerspectiveCamera(
		 100,				// Vertical FoV
		 width / height,		// Ratio
		 0.1,				// Near plane
		 1000				// Far plane
		 );
		 */
		Game.camera = new THREE.OrthographicCamera(
			Game.zoom * width / -2,		// Left plane
			Game.zoom * width / 2,		// RIght plane
			Game.zoom * height / 2,		// Top plane
			Game.zoom * height / -2,		// Bottom plane
			0.1,					// Near plane
			1000					// Far plane
		);
		Game.scene.add( this.camera );

		Game.camera.position.x = 100;
		Game.camera.position.y = 100;
		Game.camera.position.z = 100;

		// Points the camera to a point in the global space
		Game.camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );

		Game.camera.position.z = 100;


		// Set up the renderer
		Game.renderer = new THREE.WebGLRenderer();
		Game.renderer.setSize( width, height );
		document.body.appendChild( this.renderer.domElement );

		Game.renderer.domElement.addEventListener( 'mousewheel', mousewheel, false );
		Game.renderer.domElement.addEventListener( 'DOMMouseScroll', mousewheel, false ); // firefox

		Game.controls = new THREE.TrackballControls( Game.camera );
		Game.controls.noZoom = true; // important!



		Game.islands = [];
		Game.islands.push(new Island( 0, 0, 0, 1 ));
	}
};

Game.render = function (){


	requestAnimationFrame( Game.render );

	/*Game.islands.forEach(function(entry) {
		entry.update()
	});*/


	/*
	 zoom = 0.9;
	 camera.left  = camera.left * zoom;
	 camera.right = camera.right * zoom;
	 camera.top  = camera.top * zoom;
	 camera.bottom = camera.bottom * zoom;
	 camera.updateProjectionMatrix();
	 */

	// Render
	Game.renderer.render( Game.scene, Game.camera );
};
