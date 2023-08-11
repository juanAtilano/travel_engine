import * as THREE from "three";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Octree } from "three/examples/jsm/math/Octree";
import { OctreeHelper } from 'three/examples/jsm/helpers/OctreeHelper';
import { degToRad } from "three/src/math/MathUtils";



export class LoadScene {

  constructor() {

  }

  init( lobbyScenery ) {

    const { scenery, listobjects, models } = lobbyScenery;

    const { lights, env, objects } = scenery;

    const promisesObj = [];

    const sceneLoaded = {
      models: [],
      lights: [],
      env: false
    }

    for (let i = 0; i < lights.length; i++) {
      const light = lights[i];
      this.createLight(light);
      sceneLoaded.lights.push();
    }

    for (let i = 0; i < objects.length; i++) {
      const idObj = objects[i];
      const id = listobjects.findIndex( object => object.id === idObj );

      const { type } = listobjects[id];

      if(type === 'objvideo') {
        promisesObj.push(this.loaderVideo(listobjects[id], models));
      } else {
        promisesObj.push( this.loaderScenery(listobjects[id]));
      }

    }

    return new Promise((resolve, reject) => {

      Promise.all(promisesObj).then((modelsToAdd) => {

        sceneLoaded.models = modelsToAdd;

        this.loaderEnv(env.link).then((envTexture) => {
          sceneLoaded.env = envTexture;
          resolve(sceneLoaded);
        });

      })

    })
  }

  createLight(params) {
    const light = new THREE.PointLight( 0xff0000, 1, 100 );
    light.position.set( 50, 50, 50 );
    return light;
  }

  loaderVideo(config, models) {

    const { statics } = models

    return new Promise((resolve, reject) => {
      const { link, name } = config;

      const videoElem = document.createElement('video');
      videoElem.style.display = 'none';
      videoElem.id = name;
      videoElem.src = './videos/' + link;
      videoElem.muted = true;
      document.body.appendChild(videoElem);

      const listObjects = [ 'sound', 'mute' ];

      videoElem.onloadeddata = (() => {

        const texture = new THREE.VideoTexture(videoElem);
        const plane = new THREE.PlaneGeometry( 1, 1 );

        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map: texture, side: THREE.DoubleSide  });
        const mesh = new THREE.Mesh(plane, material);

        mesh.name = name;

        mesh.position.set(0, 1, 0);
        mesh.scale.set(1,1, 1);
        mesh.rotateY(degToRad(180));

        const group = new THREE.Group();

        for (let i = 0; i < listObjects.length; i++) {
          const gltf = statics.find(model => model.config.name === listObjects[i]);

          gltf.group.scene.scale.set(0.2,0.2,0.2);
          gltf.group.scene.position.set(0, 0.5, 0);
          let meshObj = gltf.group.scene.getObjectByName(listObjects[i])
          meshObj.name = `${name}-${listObjects[i]}`;
          group.add(gltf.group.scene);
        }

        group.add(mesh);
        group.name = name;

        resolve({
          config,
          group: group,
          uuid: group.uuid
        });

      });
    })
    


  }

  loaderEnv(urlEnv) {

    return new Promise((resolve, reject) => {
      new RGBELoader().load(`../exr/${urlEnv}.hdr`, function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        resolve(texture)
      }, undefined, function () {reject(error)});
    })

  }

  loaderScenery(config) {

    const { link, interactions, physics } = config;
    const boxCollider = [];
    const helpersCollider = [];

    return new Promise((resolve, reject) => {
      new GLTFLoader().load(
        `../gltf/${link}.glb`,
        function (gltf) {

          if(physics) {
            const { collider } = physics;
            if(collider) {
              gltf.computeBoundingBox
              gltf.scene.traverse((obj) => {
                const { type } = obj;
                if(type === 'Mesh') {

                  obj.geometry.computeBoundingBox();
                  const box3 = new THREE.Box3();

                  box3.setFromObject(obj);

                  boxCollider.push(box3);

                  const helper = new THREE.Box3Helper( box3, 0xffff00 );
                  helpersCollider.push(helper);
                }
              })
            }
          }

          /* const helper = new OctreeHelper( worldOctree ); */

          resolve({
            config,
            group: gltf,
            uuid: gltf.scene.uuid,
            boxCollider,
            helpersCollider
          })

        },
        function (xhr) {
          /* console.log((xhr.loaded / xhr.total) * 100 + "% loaded"); */
        },
        function (error) {
          reject(error)
        }
      );
    })

  }

  loaderBasics(forStatics) {

    const { listStatics, statics } = forStatics;

    const promisesObj = [];

    for (let i = 0; i < listStatics.length; i++) {
      const idObj = listStatics[i];
      const id = statics.findIndex( object => object.id === idObj );
      promisesObj.push( this.loaderScenery(statics[id]));
    }

    return new Promise((resolve, reject) => {
      Promise.all(promisesObj).then((modelsToAdd) => {
        resolve(modelsToAdd);
      })
    })

  }

}