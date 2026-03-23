var Island = function (options) {
  this.name = options.name;
  this.x = options.x;
  this.z = options.z;
  this.baseAltitude = options.baseAltitude;
  this.footprintRadius = options.footprintRadius;
  this.heightLevels = options.heightLevels;
  this.driftPhase = options.driftPhase || 0;
  this.rotationSpeed = options.rotationSpeed || 0.0025;
  this.blockCount = 0;
  this.interactiveMeshes = [];
  this.cubes = [];

  this.palette = Island.getPalette(options.colorSeed || 0);
  this.group = new THREE.Object3D();
  this.group.position.set(this.x, this.baseAltitude, this.z);

  this.selectionRing = new THREE.Mesh(
    new THREE.TorusGeometry(this.footprintRadius * 2.7, 0.5, 10, 40),
    new THREE.MeshBasicMaterial({
      color: 0xffe3a8,
      transparent: true,
      opacity: 0.85
    })
  );
  this.selectionRing.rotation.x = Math.PI / 2;
  this.selectionRing.position.y = -1.5;
  this.selectionRing.visible = false;
  this.group.add(this.selectionRing);

  this.buildTerrain();

  this.description = "Altitude " + this.baseAltitude.toFixed(1) + ", " +
    this.heightLevels + " terrain layers, " + this.blockCount + " total blocks.";
};

Island.getPalette = function (seed) {
  var palettes = [
    {
      top: 0x7fbf63,
      side: 0x6f8d4a,
      dirt: 0x8c6941,
      rock: 0x80858a
    },
    {
      top: 0x79b56b,
      side: 0x6b8462,
      dirt: 0x876145,
      rock: 0x727880
    },
    {
      top: 0x93c16d,
      side: 0x6d9b57,
      dirt: 0xa27647,
      rock: 0x7e7772
    }
  ];

  return palettes[seed % palettes.length];
};

Island.prototype.buildTerrain = function () {
  var layer;
  var x;
  var z;
  var size = 4;

  for (layer = 0; layer < this.heightLevels; layer++) {
    var radius = this.footprintRadius - layer * 0.7;
    var max = Math.ceil(radius);

    for (x = -max; x <= max; x++) {
      for (z = -max; z <= max; z++) {
        var radialDistance = Math.sqrt(x * x + z * z);
        var noise = Math.sin((x + this.driftPhase) * 1.17) + Math.cos((z - this.driftPhase) * 1.11);
        var threshold = radius + noise * 0.2;

        if (radialDistance > threshold) {
          continue;
        }

        var cubeType = layer === this.heightLevels - 1 ? "top" : (layer === 0 ? "rock" : "dirt");
        var cube = new Cube(
          x * size,
          layer * size,
          z * size,
          size,
          {
            top: this.palette.top,
            side: cubeType === "rock" ? this.palette.rock : this.palette.side,
            bottom: this.palette.dirt
          },
          cubeType
        );

        cube.object.userData.island = this;
        this.cubes.push(cube);
        this.interactiveMeshes.push(cube.object);
        this.group.add(cube.object);
        this.blockCount++;
      }
    }
  }

  this.addLanterns();
};

Island.prototype.addLanterns = function () {
  var glowGeometry = new THREE.SphereGeometry(0.8, 10, 10);
  var glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xffdd9b,
    transparent: true,
    opacity: 0.8
  });
  var i;

  for (i = 0; i < 3; i++) {
    var glow = new THREE.Mesh(glowGeometry, glowMaterial.clone());
    glow.position.set(
      Game.randomRange(-this.footprintRadius * 2, this.footprintRadius * 2),
      this.heightLevels * 4 + Game.randomRange(2, 7),
      Game.randomRange(-this.footprintRadius * 2, this.footprintRadius * 2)
    );
    var scale = Game.randomRange(0.7, 1.4);
    glow.scale.set(scale, scale, scale);
    this.group.add(glow);
  }
};

Island.prototype.setSelected = function (isSelected) {
  this.selectionRing.visible = isSelected;
};

Island.prototype.update = function (elapsed, animationEnabled) {
  var bob = Math.sin(elapsed * 0.9 + this.driftPhase) * 1.8;
  this.group.position.y = this.baseAltitude + (animationEnabled ? bob : 0);

  if (animationEnabled) {
    this.group.rotation.y += this.rotationSpeed;
  }
};
