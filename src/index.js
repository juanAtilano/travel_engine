import * as THREE from "three";
import { BoxGeometry } from "three";
import Stats from 'three/examples/jsm/libs/stats.module'

import { degToRad } from "three/src/math/MathUtils";
import { ActionsForModels } from "./commons/ActionsForModels";
import { HtmlToScene } from "./commons/HtmlToScene";
import { LoadScene } from './commons/LoadScene';

import config from "./config";

const { sceneOpenXP } = config;

const clock = new THREE.Clock();

let container;
let camera, scene, raycaster, renderer;

let isSelected = false;

const containerStats = document.getElementById( 'container' );

const stats = new Stats();
containerStats.appendChild( stats.dom );

let lobbyMesh, user;

let floorObj = {
  floor: undefined
}

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let jump_can = true;
let velocity_y = 0;
let distanceUp = 0;
let letter = ''

let can_move = true;
let collider;
let boxCol;
let rayFloor;
let arrayColliders = {
  arrayColliders: []
};

let onPause = true;

// this variable save all scene loaded, this will save in the future the objects
let models = {
  statics: []
};
let mixers;

// this variable save all events to eject, example: 'dbleclick', 'click' 'keypress', etc
let actions;

// name of scenery displayed
let nameScenery;

// variables with status for actios
let dblClick = false;
let click = false;

// loader 
let loader;

// env
let environmentTex;

// events
const pointer = new THREE.Vector2(0,0);

document.addEventListener("dblclick", (e) => {
  dblClick = true;
});

document.addEventListener("click", (e) => {
  click = true;
});

const { lobby, sceneries, objects, statics } = sceneOpenXP;

const idLobby = sceneries.findIndex( objScene =>  lobby.id === objScene.id );

const loaderLobbyS = new LoadScene();

const listStatics = ['2001'];

loaderLobbyS.loaderBasics({listStatics, statics}).then((statics) => {
  models.statics = [...statics];

  loaderLobbyS.init({
    scenery:sceneries[idLobby], listobjects: objects, models, loader
  }).then((sceneryLoaded) => {

    const { env } = sceneryLoaded;
    environmentTex = env;
    nameScenery = sceneries[idLobby].nameScenery;
    models[nameScenery] = {
      objectsScenery: sceneryLoaded.models,
      env,
      initPosition: sceneries[idLobby].cameraOnInit
    }

    actions = new ActionsForModels();

    actions.arrayOfActions(models, nameScenery);

    const animationMixer = actions.mixerToAnimate();

    models[nameScenery].mixer = animationMixer;

    /* mixers = mode */

    init();
    animate();

  })
});

function init() {
  container = document.createElement("div");
  document.body.appendChild(container);

  const divPointer = document.getElementById('pointer')
  const htmlScene = new HtmlToScene();
  htmlScene.pointer(divPointer, 'pointer');

  scene = new THREE.Scene();

  const { objectsScenery, initPosition } = models[nameScenery];

  for (let i = 0; i < objectsScenery.length; i++) {

    const { config, group, boxCollider, helpersCollider } = objectsScenery[i];
    const { position, rotate, scale } = config;

    arrayColliders.arrayColliders = boxCollider;

    for (let ix = 0; ix < helpersCollider.length; ix++) {
      const element = helpersCollider[ix];
      scene.add(element);
    }

    if(config.type === 'objvideo') {
      group.position.set(position.x, position.y, position.z)
      group.rotation.set(degToRad(rotate.x), degToRad(rotate.y), degToRad(rotate.z));
      group.scale.set(scale.x, scale.y, scale.z);
      scene.add(objectsScenery[i].group);
    } else {
      group.scene.position.set(position.x, position.y, position.z)
      group.scene.rotation.set(degToRad(rotate.x), degToRad(rotate.y), degToRad(rotate.z));
      group.scene.scale.set(scale.x, scale.y, scale.z);
      scene.add(objectsScenery[i].group.scene);

      if(objectsScenery[i].config.type === 'scenery') {
        floorObj.floor = group.scene.getObjectByName('floor');
        /* arrayColliders.push(floorObj.floor); */
      }
      
    }

  }

  scene.environment = environmentTex;

  user = new THREE.Group();
  camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  boxCol = new THREE.Ray();
  rayFloor = new THREE.Raycaster();

  camera.rotation.order = 'YXZ';
  user.add(camera);
  const { position, rotation } = initPosition;
  user.position.set(position.x, position.y, position.z);
  user.rotation.set(degToRad(rotation.x), degToRad(rotation.y),degToRad(rotation.z));
  scene.add(user);

  raycaster = new THREE.Raycaster();

  const screen = document.getElementById('screen');
  screen.addEventListener('click' ,(e) => {
    document.body.requestPointerLock();
    screen.style.display = 'none';
    onPause = false;
    animate();
  });

  document.addEventListener('pointerlockchange', (e) => {
    if(document.pointerLockElement === null) {
      screen.style.display = 'flex';
      onPause = true;
      animate();
    }
  });

  document.body.addEventListener( 'mousemove', ( event ) => {

    if ( document.pointerLockElement === document.body ) {
      camera.rotation.y -= event.movementX / 500;
      camera.rotation.x -= event.movementY / 500;
    }
  });

  const onKeyDown = function (event) {
    switch (event.code) {
      case "KeyW":
        moveForward = true;
        break;
      case "KeyA":
        moveLeft = true;
        break;
      case "KeyS":
        moveBackward = true;
        break;
      case "KeyD":
        moveRight = true;
        break;
      case "Space":
        console.log(user.position)
        if(jump_can)velocity_y = 25;
        jump_can = false;
       /*  velocity_y = 25; */
        break;
      default:
        letter = event.key;
    }
  };
  
  const onKeyUp = function (event) {
    switch (event.code) {
      case "KeyW":
        moveForward = false;
        break;
      case "KeyA":
        moveLeft = false;
        break;
      case "KeyS":
        moveBackward = false;
        break;
      case "KeyD":
        moveRight = false;
        break;
      case "Space":
        jump_can = false;
        break;
      default:
        letter = ''
    }
  };
  
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMappingExposure = 0.3;
  container.appendChild(renderer.domElement);

  window.addEventListener("resize", onWindowResize);

  renderer.render(scene, camera);

}

function onWindowResize() {
  const divPointer = document.getElementById('pointer');
  const htmlScene = new HtmlToScene();
  htmlScene.pointer(divPointer, 'pointer');

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  if(onPause) {
    renderer.setAnimationLoop(null);
  } else {
    renderer.setAnimationLoop(render);
  }
}

function render() {

  raycaster.setFromCamera( pointer, camera );

  const delta = clock.getDelta();

  if(document.pointerLockElement !== null) {

    if (moveForward || moveBackward) {

      rayFloor.set(user.getWorldPosition(new THREE.Vector3()), new THREE.Vector3(0,-1,0))

      const getDistance = actions.getDistanceOfFloor({
        rayFloor, arrayColliders, floor: floorObj.floor,
        position: user.getWorldPosition(new THREE.Vector3())
      })

      if (getDistance && jump_can) {
        if (getDistance > 1.39) {
          distanceUp = 1.7 - getDistance;
          user.position.y += distanceUp;
        }
      }

      const cameraLook = camera.getWorldDirection(new THREE.Vector3());
      const { x, z }  = cameraLook;
      const speed = moveForward ? 5 : -5;
      
      if(moveBackward) cameraLook.z += -1;

      boxCol.set(user.getWorldPosition(new THREE.Vector3()), cameraLook);

      const hasCollition = actions.checkForCollision({
        boxCol, arrayColliders: arrayColliders.arrayColliders,
        position: user.getWorldPosition(new THREE.Vector3())
      });
  
      if(!hasCollition) {
        const valueMoveZ = z * speed;
        const valueMoveX = x * speed;

        user.position.z += valueMoveZ * delta;
        user.position.x += valueMoveX * delta;
      } else {
        const valueMoveZ = (hasCollition.z - z) * speed;
        const valueMoveX = (hasCollition.x - x) * speed;

        user.position.z += valueMoveZ * delta;
        user.position.x += valueMoveX * delta;
      }
    }
  
    if (moveLeft || moveRight) {
      const cameraLook = camera.getWorldDirection(new THREE.Vector3());
      const { x, z }  = cameraLook;
      const speed = moveLeft ? 5 : -5;

      if(moveLeft){
        cameraLook.z += -0.5;
      } else {
        cameraLook.z -= -0.5;
      }

      boxCol.set(user.getWorldPosition(new THREE.Vector3()), cameraLook);

      const hasCollition = actions.checkForCollision({
        boxCol, arrayColliders: arrayColliders.arrayColliders,
        position: user.getWorldPosition(new THREE.Vector3())
      });

      if(!hasCollition) {
        const valueMoveZ = z * speed;
        const valueMoveX = x * speed;

        user.position.z -= valueMoveX * delta;
        user.position.x += valueMoveZ * delta;
      } else {
        const valueMoveZ = (hasCollition.z - z) * speed;
        const valueMoveX = (hasCollition.x - x) * speed;

        user.position.z -= valueMoveX * delta;
        user.position.x += valueMoveZ * delta;
      }
  
    }

    if( !jump_can) {

      user.position.y+= velocity_y*delta;
      velocity_y-=9.8*10*delta;

      if(user.position.y<= (1.7 +distanceUp)){
        velocity_y=0;
        user.position.y = 1.7 + distanceUp;
        jump_can = true;
      }
    }

  }

  actions.updateAnimation(delta);

  actions.actionsVideoOnStage({raycaster, actions, onPause}, {click:click});
  actions.translateOfScenery(
    {raycaster, mixers, scene, user, actions, models, arrayColliders},
    {dblclick:dblClick}, floorObj);

  actions.showMessage({ raycaster, scene })

  actions.editMaterial( { raycaster, scene, letter } )

  renderer.render(scene, camera);

  stats.update();

  dblClick = false;
  click = false;

}
