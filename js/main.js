var scene;

window.onload = function()
{
	scene = new THREE.Scene();
	
	var width = window.innerWidth;
	var height = window.innerHeight;
	
	var zoom = 0.01;
	/*
	var camera = new THREE.PerspectiveCamera(
		100,				// Vertical FoV
		width / height,		// Ratio
		0.1,				// Near plane
		1000				// Far plane
	);
	*/
	var camera = new THREE.OrthographicCamera(
		zoom * width / -2,		// Left plane
		zoom * width / 2,		// RIght plane
		zoom * height / 2,		// Top plane
		zoom * height / -2,		// Bottom plane
		0.1,					// Near plane
		1000					// Far plane
	);
	scene.add( camera );
	
	camera.position.x = 100;
	camera.position.y = 100;
	camera.position.z = 100;
	
	// Points the camera to a point in the global space
	camera.lookAt( new THREE.Vector3( 0, 0, 0 ) );
	
	
	// Set up the renderer
	var renderer = new THREE.WebGLRenderer();
	
	renderer.setSize( width, height );
	document.body.appendChild( renderer.domElement );
	
	
	var islandTest = new Island( 0, 0, 0, 1 );
	
	
	var render = function ()
	{
		requestAnimationFrame( render );
		
		islandTest.update();
		
		/*
		zoom = 0.9;
		camera.left  = camera.left * zoom;
		camera.right = camera.right * zoom;
		camera.top  = camera.top * zoom;
		camera.bottom = camera.bottom * zoom;
		camera.updateProjectionMatrix();
		*/
			
		// Render
		renderer.render( scene, camera );
	};
	
	render();
}
