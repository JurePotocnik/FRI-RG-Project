
var Cube = function(x, y, z, size, color)
{
	this.x = x;
	this.y = y;
	this.z = z;
	
	this.size = size;
	
	this.color = color;
	
	
	//////
	// Make a cube
	//////
	
	var geometry = new THREE.BoxGeometry(
		this.size,
		this.size,
		this.size
	);
	
	var materials = [];
	for (var i = 0; i < 6; i++)
	{
		/*
		var texture = THREE.ImageUtils.loadTexture( "assets/textures/cube/cube-surface-" + (i + 1) + ".png" );
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		*/
		
		materials.push(
			new THREE.MeshBasicMaterial(
				{
					//wireframe: true,
					color: this.color,
					//map: texture
				}
			)
		);
	}
	
	this.cube = new THREE.Mesh(
		geometry,
		new THREE.MeshFaceMaterial( materials )
	);
	
	this.cube.translateX( this.x );
	this.cube.translateY( this.y );
	this.cube.translateZ( this.z );
	
	scene.add( this.cube );
}

Cube.prototype.update = function()
{
	this.cube.position.x = this.x;
	this.cube.position.y = this.y;
	this.cube.position.z = this.z;
}
