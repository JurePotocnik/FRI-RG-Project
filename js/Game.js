(function (window, undefined) {
  if (window.Game === undefined) {
    window.Game = {};
  }

  var rootGame = window.Game;
  var Game = function (selector, context) {
    return new Game.fn.init(selector, context, rootGame);
  };
  var document = window.document;

  Game.fn = Game.prototype = {
    version: 0.2,
    constructor: Game,
    init: function (selector, context, rootGame) {
      if (!selector) {
        return this;
      }

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
    selector: null
  };

  Game.fn.init.prototype = Game.fn;

  window.Game = Game;
})(window);

Game.scene = null;
Game.camera = null;
Game.renderer = null;
Game.controls = null;
Game.clock = null;
Game.islands = [];
Game.interactiveMeshes = [];
Game.worldRoot = null;
Game.environmentRoot = null;
Game.raycaster = null;
Game.pointer = new THREE.Vector2();
Game.cameraScale = 0.085;
Game.animationEnabled = true;
Game.frameId = null;
Game.selectedIsland = null;
Game.water = null;
Game.starfield = null;
Game.statusMessage = "";
Game.keyboardState = {};
Game.ui = {};
Game.worldPresets = {
  balanced: {
    name: "Balanced",
    count: 6,
    spreadX: 64,
    spreadZ: 54,
    baseAltitude: 8,
    altitudeVariance: 10,
    footprint: [4, 6],
    height: [2, 4],
    spacingJitter: 14,
    message: "Balanced layout: medium-sized islands with a broad exploration loop."
  },
  scattered: {
    name: "Scattered",
    count: 9,
    spreadX: 96,
    spreadZ: 88,
    baseAltitude: 10,
    altitudeVariance: 14,
    footprint: [3, 5],
    height: [1, 3],
    spacingJitter: 18,
    message: "Scattered layout: more islands, lighter footprints, and wider air lanes."
  },
  monument: {
    name: "Monument",
    count: 4,
    spreadX: 58,
    spreadZ: 44,
    baseAltitude: 14,
    altitudeVariance: 8,
    footprint: [6, 8],
    height: [4, 6],
    spacingJitter: 10,
    message: "Monument layout: fewer but heavier formations with dramatic elevation."
  }
};
Game.currentPreset = "balanced";

Game.initScene = function () {
  if (Game.scene !== null) {
    return;
  }

  Game.cacheUi();

  Game.scene = new THREE.Scene();
  Game.scene.fog = new THREE.FogExp2(0xd6e2ee, 0.0028);

  Game.clock = new THREE.Clock();
  Game.raycaster = new THREE.Raycaster();

  Game.createCamera();
  Game.createRenderer();
  Game.createControls();
  Game.createLights();
  Game.createEnvironment();
  Game.bindEvents();
  Game.generateWorld(Game.currentPreset);
  Game.setStatus("World ready. Click an island to inspect it.");
};

Game.cacheUi = function () {
  Game.ui.root = document.getElementById("game-root");
  Game.ui.worldPreset = document.getElementById("world-preset");
  Game.ui.islandCount = document.getElementById("island-count");
  Game.ui.voxelCount = document.getElementById("voxel-count");
  Game.ui.selectedName = document.getElementById("selected-name");
  Game.ui.selectedDescription = document.getElementById("selected-description");
  Game.ui.selectedAltitude = document.getElementById("selected-altitude");
  Game.ui.selectedBlocks = document.getElementById("selected-blocks");
  Game.ui.statusMessage = document.getElementById("status-message");
  Game.ui.toggleAnimationButton = document.getElementById("toggle-animation");
};

Game.createCamera = function () {
  Game.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 2000);
  Game.camera.position.set(130, 110, 130);
  Game.updateCameraFrustum();
  Game.camera.lookAt(new THREE.Vector3(0, 0, 0));
  Game.scene.add(Game.camera);
};

Game.createRenderer = function () {
  var width = Game.ui.root.clientWidth || window.innerWidth;
  var height = Game.ui.root.clientHeight || window.innerHeight;

  Game.renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  Game.renderer.setClearColor(0x000000, 0);
  Game.renderer.setSize(width, height);
  Game.ui.root.appendChild(Game.renderer.domElement);

  Game.renderer.domElement.addEventListener("mousewheel", mousewheel, false);
  Game.renderer.domElement.addEventListener("DOMMouseScroll", mousewheel, false);
};

Game.createControls = function () {
  Game.controls = new THREE.TrackballControls(Game.camera, Game.renderer.domElement);
  Game.controls.noZoom = true;
  Game.controls.panSpeed = 0.4;
  Game.controls.rotateSpeed = 1.1;
  Game.controls.dynamicDampingFactor = 0.15;
  Game.controls.target.set(0, 18, 0);
  Game.controls.handleResize();
};

Game.createLights = function () {
  var ambientLight = new THREE.AmbientLight(0xf0eadf, 0.8);
  var sunLight = new THREE.DirectionalLight(0xfff5d6, 0.95);
  var rimLight = new THREE.DirectionalLight(0x87b7ff, 0.35);

  sunLight.position.set(160, 220, 90);
  rimLight.position.set(-120, 70, -160);

  Game.scene.add(ambientLight);
  Game.scene.add(sunLight);
  Game.scene.add(rimLight);
};

Game.createEnvironment = function () {
  Game.environmentRoot = new THREE.Object3D();
  Game.scene.add(Game.environmentRoot);

  var waterGeometry = new THREE.CylinderGeometry(120, 140, 12, 40, 1, true);
  var waterMaterial = new THREE.MeshBasicMaterial({
    color: 0x77a8c8,
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide
  });

  Game.water = new THREE.Mesh(waterGeometry, waterMaterial);
  Game.water.position.y = -10;
  Game.environmentRoot.add(Game.water);

  var haloGeometry = new THREE.TorusGeometry(118, 3, 10, 60);
  var haloMaterial = new THREE.MeshBasicMaterial({
    color: 0xf4c888,
    transparent: true,
    opacity: 0.55
  });

  var halo = new THREE.Mesh(haloGeometry, haloMaterial);
  halo.rotation.x = Math.PI / 2;
  halo.position.y = -3;
  Game.environmentRoot.add(halo);

  Game.starfield = new THREE.Object3D();
  Game.environmentRoot.add(Game.starfield);

  var starGeometry = new THREE.SphereGeometry(0.7, 8, 8);
  var starMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.7
  });
  var i;
  for (i = 0; i < 36; i++) {
    var star = new THREE.Mesh(starGeometry, starMaterial.clone());
    star.position.set(
      Game.randomRange(-170, 170),
      Game.randomRange(50, 130),
      Game.randomRange(-170, 170)
    );
    var scale = Game.randomRange(0.6, 1.8);
    star.scale.set(scale, scale, scale);
    Game.starfield.add(star);
  }
};

Game.bindEvents = function () {
  window.addEventListener("resize", Game.handleResize, false);
  window.addEventListener("keydown", Game.handleKeyDown, false);
  window.addEventListener("keyup", Game.handleKeyUp, false);
  Game.renderer.domElement.addEventListener("click", Game.handlePointerSelect, false);

  document.getElementById("regenerate-world").addEventListener("click", function () {
    Game.generateWorld(Game.currentPreset);
  }, false);

  document.getElementById("toggle-animation").addEventListener("click", function () {
    Game.toggleAnimation();
  }, false);

  document.getElementById("focus-island").addEventListener("click", function () {
    Game.focusSelectedIsland();
  }, false);

  var presetButtons = document.querySelectorAll(".preset-button");
  Array.prototype.forEach.call(presetButtons, function (button) {
    button.addEventListener("click", function () {
      Game.generateWorld(button.getAttribute("data-preset"));
    }, false);
  });
};

Game.generateWorld = function (presetName) {
  var preset = Game.worldPresets[presetName] || Game.worldPresets.balanced;
  var i;
  var totalBlocks = 0;

  Game.currentPreset = presetName in Game.worldPresets ? presetName : "balanced";
  Game.clearWorld();

  Game.worldRoot = new THREE.Object3D();
  Game.scene.add(Game.worldRoot);
  Game.islands = [];
  Game.interactiveMeshes = [];

  for (i = 0; i < preset.count; i++) {
    var island = new Island({
      name: "Isle " + (i + 1),
      x: (i - (preset.count - 1) / 2) * preset.spreadX + Game.randomRange(-preset.spacingJitter, preset.spacingJitter),
      z: Game.randomRange(-preset.spreadZ, preset.spreadZ),
      baseAltitude: preset.baseAltitude + Game.randomRange(-preset.altitudeVariance, preset.altitudeVariance),
      footprintRadius: Game.randomInt(preset.footprint[0], preset.footprint[1]),
      heightLevels: Game.randomInt(preset.height[0], preset.height[1]),
      colorSeed: i,
      driftPhase: i * 0.7 + Math.random(),
      rotationSpeed: Game.randomRange(0.0015, 0.004)
    });

    Game.islands.push(island);
    Game.worldRoot.add(island.group);
    totalBlocks += island.blockCount;
    Game.interactiveMeshes = Game.interactiveMeshes.concat(island.interactiveMeshes);
  }

  Game.setActivePresetButton();
  Game.selectIsland(Game.islands[0] || null);
  Game.updateHud(totalBlocks);
  Game.setStatus(preset.message);
};

Game.clearWorld = function () {
  if (Game.worldRoot !== null) {
    Game.scene.remove(Game.worldRoot);
  }

  if (Game.selectedIsland) {
    Game.selectedIsland.setSelected(false);
  }

  Game.worldRoot = null;
  Game.selectedIsland = null;
};

Game.setActivePresetButton = function () {
  var presetButtons = document.querySelectorAll(".preset-button");
  Array.prototype.forEach.call(presetButtons, function (button) {
    var isActive = button.getAttribute("data-preset") === Game.currentPreset;
    if (isActive) {
      button.classList.add("is-active");
    } else {
      button.classList.remove("is-active");
    }
  });
};

Game.selectIsland = function (island) {
  if (Game.selectedIsland === island) {
    return;
  }

  if (Game.selectedIsland) {
    Game.selectedIsland.setSelected(false);
  }

  Game.selectedIsland = island;

  if (Game.selectedIsland) {
    Game.selectedIsland.setSelected(true);
  }

  Game.updateSelectedPanel();
};

Game.updateHud = function (totalBlocks) {
  var blockTotal = totalBlocks;
  var i;

  if (typeof blockTotal !== "number") {
    blockTotal = 0;
    for (i = 0; i < Game.islands.length; i++) {
      blockTotal += Game.islands[i].blockCount;
    }
  }

  Game.ui.worldPreset.textContent = Game.worldPresets[Game.currentPreset].name;
  Game.ui.islandCount.textContent = String(Game.islands.length);
  Game.ui.voxelCount.textContent = String(blockTotal);
  Game.updateSelectedPanel();
};

Game.updateSelectedPanel = function () {
  if (!Game.selectedIsland) {
    Game.ui.selectedName.textContent = "None selected";
    Game.ui.selectedDescription.textContent = "Click an island to inspect its scale, altitude, and terrain density.";
    Game.ui.selectedAltitude.textContent = "-";
    Game.ui.selectedBlocks.textContent = "-";
    return;
  }

  Game.ui.selectedName.textContent = Game.selectedIsland.name;
  Game.ui.selectedDescription.textContent = Game.selectedIsland.description;
  Game.ui.selectedAltitude.textContent = Game.selectedIsland.baseAltitude.toFixed(1);
  Game.ui.selectedBlocks.textContent = String(Game.selectedIsland.blockCount);
};

Game.focusSelectedIsland = function () {
  if (!Game.selectedIsland) {
    Game.setStatus("Select an island first to focus the camera.");
    return;
  }

  var target = Game.selectedIsland.group.position.clone();
  var offset = Game.camera.position.clone().sub(Game.controls.target);

  Game.controls.target.copy(target);
  Game.camera.position.copy(target.clone().add(offset));
  Game.camera.lookAt(target);
  Game.setStatus("Camera focused on " + Game.selectedIsland.name + ".");
};

Game.toggleAnimation = function () {
  Game.animationEnabled = !Game.animationEnabled;
  Game.ui.toggleAnimationButton.textContent = Game.animationEnabled ? "Pause drift" : "Resume drift";
  Game.setStatus(Game.animationEnabled ? "Island drift resumed." : "Island drift paused.");
};

Game.handleResize = function () {
  if (!Game.renderer) {
    return;
  }

  Game.updateCameraFrustum();
  Game.renderer.setSize(Game.ui.root.clientWidth, Game.ui.root.clientHeight);
  Game.controls.handleResize();
};

Game.updateCameraFrustum = function () {
  var width = Game.ui.root ? (Game.ui.root.clientWidth || window.innerWidth) : window.innerWidth;
  var height = Game.ui.root ? (Game.ui.root.clientHeight || window.innerHeight) : window.innerHeight;
  var halfWidth = Game.cameraScale * width * 0.5;
  var halfHeight = Game.cameraScale * height * 0.5;

  Game.camera.left = -halfWidth;
  Game.camera.right = halfWidth;
  Game.camera.top = halfHeight;
  Game.camera.bottom = -halfHeight;
  Game.camera.updateProjectionMatrix();
};

Game.handlePointerSelect = function (event) {
  var rect = Game.renderer.domElement.getBoundingClientRect();
  var vector;
  var direction;
  Game.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  Game.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  vector = new THREE.Vector3(Game.pointer.x, Game.pointer.y, 0.5);
  vector.unproject(Game.camera);
  direction = vector.sub(Game.camera.position).normalize();
  Game.raycaster.set(Game.camera.position.clone(), direction);

  var intersections = Game.raycaster.intersectObjects(Game.interactiveMeshes);
  if (intersections.length && intersections[0].object.userData.island) {
    Game.selectIsland(intersections[0].object.userData.island);
    Game.setStatus("Selected " + intersections[0].object.userData.island.name + ".");
  }
};

Game.handleKeyDown = function (event) {
  Game.keyboardState[event.keyCode] = true;

  if (event.keyCode === 32) {
    event.preventDefault();
    Game.toggleAnimation();
  }

  if (event.keyCode === 82) {
    Game.generateWorld(Game.currentPreset);
  }

  if (event.keyCode === 70) {
    Game.focusSelectedIsland();
  }

  if (event.keyCode === 49 || event.keyCode === 97) {
    Game.generateWorld("balanced");
  }

  if (event.keyCode === 50 || event.keyCode === 98) {
    Game.generateWorld("scattered");
  }

  if (event.keyCode === 51 || event.keyCode === 99) {
    Game.generateWorld("monument");
  }
};

Game.handleKeyUp = function (event) {
  Game.keyboardState[event.keyCode] = false;
};

Game.handleKeyboardPan = function () {
  var step = 1.6 + Game.cameraScale * 8;
  var x = 0;
  var z = 0;

  if (Game.keyboardState[37] || Game.keyboardState[65]) {
    x -= step;
  }
  if (Game.keyboardState[39] || Game.keyboardState[68]) {
    x += step;
  }
  if (Game.keyboardState[38] || Game.keyboardState[87]) {
    z -= step;
  }
  if (Game.keyboardState[40] || Game.keyboardState[83]) {
    z += step;
  }

  if (x === 0 && z === 0) {
    return;
  }

  Game.camera.position.x += x;
  Game.camera.position.z += z;
  Game.controls.target.x += x;
  Game.controls.target.z += z;
};

Game.setStatus = function (message) {
  Game.statusMessage = message;
  if (Game.ui.statusMessage) {
    Game.ui.statusMessage.textContent = message;
  }
};

Game.randomRange = function (min, max) {
  return min + Math.random() * (max - min);
};

Game.randomInt = function (min, max) {
  return Math.floor(Game.randomRange(min, max + 1));
};

Game.render = function () {
  Game.frameId = requestAnimationFrame(Game.render);
  Game.update();
  Game.renderer.render(Game.scene, Game.camera);
};

Game.update = function () {
  var elapsed = Game.clock.getElapsedTime();
  var i;

  Game.handleKeyboardPan();
  Game.controls.update();

  if (Game.water) {
    Game.water.rotation.y += 0.0012;
  }

  if (Game.starfield) {
    Game.starfield.rotation.y += 0.0007;
  }

  for (i = 0; i < Game.islands.length; i++) {
    Game.islands[i].update(elapsed, Game.animationEnabled);
  }
};
