import * as THREE from "three";
import { degToRad } from "three/src/math/MathUtils";
import config from "../config";
import { HtmlToScene } from "./HtmlToScene";
import { LoadScene } from "./LoadScene";

const { sceneOpenXP } = config;

const { sceneries, objects } = sceneOpenXP;

const info = {};

const editablesMat = {};

let messageShowing = false;

let meshesTranslateScenery = {
  meshes: [],
  rules: {},
  toChange: []
};

let mixers = [];

// example por animations array = { animation: undefined, rules: {},mixer: undefined }
let meshesAnimateScenery = {
  animations: [],
  scene: undefined,
};

let meshesVideoScenery = {
  videos: [],
  rules: [],
  btns: []
}

export class ActionsForModels {

  constructor() {

  }

  arrayOfActions(models, nameScenery) {

    meshesAnimateScenery = {
      animations: []
    };

    const { objectsScenery } = models[nameScenery]

    for (let i = 0; i < objectsScenery.length; i++) {
      const { config, uuid } = objectsScenery[i];
      const { interactions } = config
      if(interactions.length) {

        for (let i = 0; i < interactions.length; i++) {

          const { interactionType, meshes} = interactions[i];
          const { type, rules } = interactionType;
          switch (type) {
            case 'translation':
              this.orderTranslateSceneries({meshes, uuid, rules, models: models[nameScenery]})
              break;
            case 'animation':
              this.orderAnimationsSceneries({meshes, uuid, rules, models: models[nameScenery]})
              break;
            case 'video':
              this.orderVideosScenaries({ uuid, rules, models: models[nameScenery]})
              break;
            case 'message':
            this.orderInfo({ uuid, rules})
              break;
            case 'editableMat':
              this.orderEditMaterial({ uuid, rules})
                break;
            default:
              break;
          }
        }

      }
    }

  }

  orderInfo(config) {
    const {uuid, rules} = config;
    info[uuid] = rules 
  }

  orderEditMaterial(config) {
    const {uuid, rules} = config;
    editablesMat[uuid] = rules 
  }

  orderAnimationsSceneries(config) {
    const {meshes, uuid, rules, models} = config;

    const { objectsScenery } = models;

    const idArrayModels = objectsScenery.findIndex( model => model.group.scene.uuid === uuid);
    const { group } = objectsScenery[idArrayModels];
    const { animations, scene } = group;

    const hasMeshes = meshes.length;

    const mixer = new THREE.AnimationMixer(scene)

    mixers.push(mixer)

    if(hasMeshes) {
      // here search animations for name into animations
      for (let i = 0; i < meshes.length; i++) {
        const mesh = meshes[i];
        const sceneMesh = scene.getObjectByName(mesh);
        meshesAnimateScenery.animations.push(sceneMesh);
      }
    } else {
      for (let i = 0; i < animations.length; i++) {
        const animation = animations[i];
        meshesAnimateScenery.animations.push({
          animation,
          rules,
          mixer
        });
      }
    }

  }

  orderTranslateSceneries(config) {

    const {meshes, uuid, rules, models} = config;

    const { objectsScenery } = models;

    const idArrayModels = objectsScenery.findIndex( model => model.group.scene.uuid === uuid);
    const { scene } = objectsScenery[idArrayModels].group;

    const indexScenery = sceneries.findIndex( sceneConfig => sceneConfig.nameScenery === rules.scenery )

    for (let i = 0; i < meshes.length; i++) {
      const mesh = meshes[i];
      const sceneMesh = scene.getObjectByName(mesh);
      meshesTranslateScenery.meshes.push(sceneMesh);
      meshesTranslateScenery.rules[sceneMesh.uuid] = rules;
      meshesTranslateScenery.toChange = sceneries[indexScenery];
    }
  }

  orderVideosScenaries(config) {

    const { uuid, rules, models} = config;
    const { objectsScenery } = models;
    const idArrayModels = objectsScenery.findIndex( model => model.uuid === uuid);
    const meshes = objectsScenery[idArrayModels].group;
 
    meshesVideoScenery.videos.push(meshes);
    meshesVideoScenery.rules.push(rules);

    for (let i = 0; i < meshesVideoScenery.videos.length; i++) {
      const { name } = meshesVideoScenery.videos[i];
      const vid = document.getElementById(name);
      vid.play();
    }

  }

  mixerToAnimate() {

    const { animations } = meshesAnimateScenery;

    for (let i = 0; i < animations.length; i++) {

      const { animation, rules, mixer } = animations[i];
      if(!rules.loop) {
        mixer.clipAction(animation).play();
      } else {
        console.log('no entro aqui')
        // here repeat each loop
      }
    }

    return mixers;

  }

  actionsVideoOnStage(thingsOfScene, events) {
    const {raycaster, actions, onPause} = thingsOfScene;

    const intersects = raycaster.intersectObjects( meshesVideoScenery.videos );

    if(intersects.length) {
      const { actionWeb } = meshesVideoScenery.rules[0];
      if ( events[actionWeb] ) {

        const { name } = intersects[0].object;
        const video = document.getElementById(name);
        video.muted = !video.muted;

      }
    }

  }

  translateOfScenery(thingsOfScene, events, floorObj) {

    const {raycaster, scene, user, actions, models, mixers, arrayColliders} = thingsOfScene;
    const intersects = raycaster.intersectObjects( meshesTranslateScenery.meshes );

    if(intersects.length) {

      let rules;
      if(meshesTranslateScenery.rules[intersects[0].object.parent.uuid]){
        rules = meshesTranslateScenery.rules[intersects[0].object.parent.uuid];
      } else {
        rules = meshesTranslateScenery.rules[intersects[0].object.uuid];
      }

      const { actionWeb, scenery } = rules;
      if ( events[actionWeb] ) {
        this.clearScenery(scene, scenery, user, actions, models, mixers, floorObj, arrayColliders)
      }
    }

  }

  updateAnimation(delta) {

    for (let i = 0; i < mixers.length; i++) {
      const mixer = mixers[i];
      if(mixer !== undefined) {
        mixer.update( delta );
      }
    }
  }

  positionCameraInScene(cameraOnInit, user, scene) {
    const { rotation, position } = cameraOnInit;
    user.position.set(position.x, position.y, position.z);
    user.rotation.set(degToRad(rotation.x), degToRad(rotation.y), degToRad(rotation.z));
    scene.add(user);
  }

  animationToScene(actions, models, nameScenery) {

    actions.arrayOfActions(models, nameScenery);
    const animationMixer = actions.mixerToAnimate();
    models[nameScenery].mixer = animationMixer;
  }

  addedGlbToScene(objectsScenery, scene, floorObj, arrayColliders) {

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
        if(objectsScenery[i].config.type === 'scenery') {
          floorObj.floor = group.scene.getObjectByName('floor');
        }
        scene.add(objectsScenery[i].group.scene);
      }
    }
  }

  showMessage(config) {
    const { raycaster, scene } = config;

    for (const [key, value] of Object.entries(info)) {
      let getter = scene.getObjectByProperty('uuid', key)
      let cast = raycaster.intersectObject(getter);
      if(cast.length) {
        const { distance } = cast[0]
        if(distance < 1 && !messageShowing) {

          const { message, keyInteract } = value;

          const html = new HtmlToScene().bodyMessageNote(message, keyInteract);
          const containerShow = document.getElementById('message');
          containerShow.style.display = 'flex'
          containerShow.innerHTML = ''
          containerShow.append(html)
          messageShowing = true;
        } else if(distance >= 1) {
          const containerShow = document.getElementById('message');
          containerShow.style.display = 'none';
          containerShow.innerHTML = ''
          messageShowing = false
        }
      } else {
        if(messageShowing) {
          messageShowing = false;
        }
      }
    }

  }

  editMaterial(config){
    const { raycaster, scene, letter } = config;

    for (const [key, value] of Object.entries(editablesMat)) {
      let getter = scene.getObjectByProperty('uuid', key)
      let cast = raycaster.intersectObject(getter);
      if(cast.length) {
        const { distance } = cast[0]
        if(distance < 1 && !messageShowing) {

          const { propertiesToEdit } = value;

          const containerShow = document.getElementById('message');
          containerShow.style.display = 'flex';
          containerShow.style.flexWrap = 'wrap';
          containerShow.innerHTML = '';

          for (let index = 0; index < propertiesToEdit.length; index++) {

            const { keyInteract, name, properties } = propertiesToEdit[index];

            if(letter === keyInteract) {
              const [mesh] = getter.children;
              const { material } = mesh;
              for (let i = 0; i < properties.length; i++) {
                const { type, value } = properties[i];
                material[type] = value;
              }
            }

            const html = new HtmlToScene().bodyInputsEditables( name, keyInteract);
            containerShow.append(html);
          }

          messageShowing = true;
        } else if(distance >= 1) {
          const containerShow = document.getElementById('message');
          containerShow.style.display = 'none';
          containerShow.innerHTML = ''
          messageShowing = false
        }
      } else {
        if(messageShowing) {
          messageShowing = false;
        }
      }
    }
  }

  clearScenery(scene, scenery, user, actions, models, mixers, floorObj, arrayColliders) {

    const scenaryToLoad = sceneries.find(sceneryEach => sceneryEach.nameScenery === scenery)
    const { cameraOnInit, nameScenery } = scenaryToLoad;
    meshesTranslateScenery = {
      meshes: [],
      rules: {},
      toChange: []
    };
    scene.remove.apply(scene, scene.children);

    if(models.hasOwnProperty(nameScenery)) {

      const { objectsScenery, env } = models[nameScenery];
      scene.environment = env;
      this.addedGlbToScene(objectsScenery, scene, floorObj, arrayColliders);
      this.animationToScene(actions, models, nameScenery);
      this.positionCameraInScene(cameraOnInit, user, scene);

    } else {

      let loadNewScenery = new LoadScene();
      loadNewScenery.init({scenery: scenaryToLoad, listobjects: objects, models}).then((sceneryLoaded) => {

        const { env } = sceneryLoaded;
        scene.environment = env;
        models[nameScenery] = {
          objectsScenery: sceneryLoaded.models,
          env,
          initPosition: cameraOnInit
        }
        const { objectsScenery } = models[nameScenery];
        this.addedGlbToScene(objectsScenery, scene, floorObj, arrayColliders);
        this.animationToScene(actions, models, nameScenery);
        this.positionCameraInScene(cameraOnInit, user, scene);

      });
    }
  }

  getDistanceOfFloor(jsonDistance) {

    const {rayFloor, floor} = jsonDistance;

    let distanceToUp = 0;

    if(rayFloor.intersectObject(floor).length) {
      const { distance } = rayFloor.intersectObject(floor)[0]
      if( distance > 0 ) {
        if(distanceToUp === 0) distanceToUp = distance;
        if(distance < distanceToUp) distanceToUp = distance;
      }
    }

    return distanceToUp;
  }

  checkForCollision(jsonTest) {

    const { boxCol, arrayColliders, position } = jsonTest;

    for (let i = 0; i < arrayColliders.length; i++) {
      const element = arrayColliders[i]; 
      if(boxCol.intersectsBox(element)) {
        if(element.distanceToPoint(position) > 0.2) {
          continue
        }
        return { x: boxCol.direction.x, z: boxCol.direction.z }
      } else {
        continue
      }
      
    }

    return false
  }

}