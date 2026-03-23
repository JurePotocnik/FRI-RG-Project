var Cube = function (x, y, z, size, palette, cubeType) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.size = size;
  this.palette = palette;
  this.cubeType = cubeType || "dirt";

  var geometry = new THREE.BoxGeometry(this.size, this.size, this.size);
  var materials = [
    new THREE.MeshLambertMaterial({ color: this.palette.side }),
    new THREE.MeshLambertMaterial({ color: this.palette.side }),
    new THREE.MeshLambertMaterial({ color: this.cubeType === "top" ? this.palette.top : this.palette.side }),
    new THREE.MeshLambertMaterial({ color: this.palette.bottom }),
    new THREE.MeshLambertMaterial({ color: this.palette.side }),
    new THREE.MeshLambertMaterial({ color: this.palette.side })
  ];

  this.object = new THREE.Mesh(geometry, new THREE.MeshFaceMaterial(materials));
  this.object.position.set(this.x, this.y, this.z);
};

Cube.prototype.update = function () {
  this.object.position.set(this.x, this.y, this.z);
};
