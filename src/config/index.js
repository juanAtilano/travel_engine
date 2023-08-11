const sceneOpenXP = {
  user: {
    id: 'x',
    name: 'test',
    mail: 'test@mail.com',
    alias: 'test',
    token: 'fsdfdff'
  },
  config: {
    volume: {
      voice: 20,
      vfx: 100,
      env: 50,
      music: 20
    },
    controls: {
      type: 'orbit/etc',
      config: {
        moveForward: 'w',
        moveBack: 's',
        left: 'a',
        right: 'd'
      }
    },
    sens: {
      x: 10,
      y: 10
    }
  },
  lobby: {
    nameScenery: 'lobby',
    id: '101',
    idScenery: '101'
  },
  sceneries: [
    {
      id: '101',
      nameScenery: 'lobby',
      cameraOnInit: {
        position: {x: 0.15215, y: 1.7, z: -7.42716},
        rotation: {x: 0,y: 180, z: 0}
      },
      lights: [],
      env: {
        type: 'exr',
        link: '02'
      },
      bg: {
        type: 'hex',
        link: '000000'
      },
      objects: ['1001', '1002', '1003', '1005']
    }
  ],
  objects: [
    {
      id: '1001', 
      name: 'scene',
      link: 'scene',
      type: 'scenery',
      position: {x:0, y:0, z:0},
      scale: {x:1, y:1, z:1}, 
      rotate: {x:0, y:0, z:0},
      interactions: [
      ],
      multiple: {
        canAddMultiple: false,
        limit: 1
      },
      physics: {
        collider: false
      }
    },
    {
      id: '1002', 
      name: 'about',
      link: 'about',
      type: 'info',
      position: {x:0, y:0, z:0},
      scale: {x:1, y:1, z:1}, 
      rotate: {x:0, y:0, z:0},
      interactions: [
        {
          interactionType: {
            id: '01',
            type: 'message',
            rules: {
              keyInteract: 'e',
              message: {
                isPredifined: true,
                predifined: {
                  title: 'About Us',
                  body: 'This about Us',
                  link: ''
                },
                classes: {},
                html: ''
              }
            }
          },
          meshes: ['all']
        }
      ],
      multiple: {
        canAddMultiple: false,
        limit: 1
      },
      physics: {
        collider: false
      }
    },
    {
      id: '1003', 
      name: 'product',
      link: 'product',
      type: 'editableMat',
      position: {x:0, y:0, z:0},
      scale: {x:1, y:1, z:1}, 
      rotate: {x:0, y:0, z:0},
      interactions: [
        {
          interactionType: {
            id: '02',
            type: 'editableMat',
            rules: {
              typeMaterial: 'MeshStandardMaterial',
              propertiesToEdit: [ {
                keyInteract: '1',
                name: 'Predifined 1',
                properties: [
                  {
                    type: 'color',
                    value: { r:1, g:1, b:0, isColor: true }
                  }
                ]
              },{
                keyInteract: '2',
                name: 'Predifined 2',
                properties: [
                  {
                    type: 'color',
                    value: { r:1, g:0, b:0, isColor: true }
                  }
                ]
              }]
            }
          },
          meshes: ['all']
        }
      ],
      multiple: {
        canAddMultiple: false,
        limit: 1
      },
      physics: {
        collider: false
      }
    },
    {
      id: '1005', 
      name: 'collider',
      link: 'collider',
      type: 'obj',
      position: {x:0, y:0, z:0},
      scale: {x:1, y:1, z:1}, 
      rotate: {x:0, y:0, z:0},
      interactions: [],
      multiple: {
        canAddMultiple: false,
        limit: 1
      },
      physics: {
        collider: true
      }
    }
  ],
  statics: [
    {
      id: '2001',
      name: 'play',
      link: 'play'
    },
    {
      id: '2002',
      name: 'pause',
      link: 'pause'
    },
    {
      id: '2003',
      name: 'sound',
      link: 'sound'
    },
    {
      id: '2004',
      name: 'mute',
      link: 'mute'
    }
  ]
}

export default {
  sceneOpenXP
}