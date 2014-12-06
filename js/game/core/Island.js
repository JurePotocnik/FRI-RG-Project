
var Island = function(x, y, z, size)
{
	this.nCubes = 10;  // Number of graphical cubes in this logical cube on each side
	
	
	this.x = x;
	this.y = y;
	this.z = z;
	
	this.size = size;
	
	this.colors =
	[
		0x3ba606,
		0x51a606,
		0x3b7e00,
		0x4b9013,
		0x3b7e00,
		0x4b9013,
		0x51a606,
		0x3ba606,
		0x34880b
	];
	
	
	
	//////
	// Make the logical cubes of this island
	//////
	
	this.smallCubeSize = this.size / this.nCubes;
	
	this.cubes = [];
	
	// 9 cubes on 3 y levels
	/*
	for (var i = 0; i < this.nCubes * this.nCubes * this.nCubes; i++)
	{
		// The starting pos
		var sX = -this.size / 2;
		var sY = -this.size / 2;
		var sZ = -this.size / 2;
		
		this.cubes.push(
			new Cube(
				sX  +  ( this.smallCubeSize / 2 )  +
					( i % this.nCubes ) * ( this.smallCubeSize ),
				sY  +  ( this.smallCubeSize / 2 )  +
					( Math.floor( i / ( this.nCubes * this.nCubes ) ) ) * ( this.smallCubeSize ),
				sZ  +  ( this.smallCubeSize / 2 )  +
					( ( Math.floor( i / this.nCubes ) % this.nCubes ) ) * ( this.smallCubeSize ),
				this.smallCubeSize,
				this.colors[ Math.floor( ( Math.random() * (this.colors.length - 1) ) + 1 ) ]
			)
		);
	}
	*/
	
	
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
		//var texture = THREE.ImageUtils.loadTexture( "assets/textures/cube/cube-surface-" + (i + 1) + ".png" );
		var texture = THREE.ImageUtils.loadTexture( "assets/textures/cube/cube-block-1.png" );
		texture.magFilter = THREE.NearestFilter;
		texture.minFilter = THREE.NearestFilter;
		
		materials.push(
			new THREE.MeshBasicMaterial(
				{
					//wireframe: (i%2==0 ? false : true),
					//wireframe: true,
					map: texture
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
	
	Game.scene.add( this.cube );
};

Island.prototype.update = function()
{
	// Animation
	//this.cube.rotation.y += 0.005;
	
	/*
	for (var i = 0; i < this.nCubes * this.nCubes * this.nCubes; i++)
	{
		this.cubes[i].update();
	}
	*/
};
