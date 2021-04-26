import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js'
import * as dat from 'dat.gui'

//Loaders

const textureLoader = new THREE.TextureLoader();

const containerTexture_N = textureLoader.load('/textures/containerTexture_N.png');
const containerTexture_D = textureLoader.load('/textures/containerTexture_D.png');

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const geometry_box = new THREE.BoxGeometry( .5, .5, .5);

const geometry_skybox = new THREE.BoxGeometry(10000,10000,10000);

// Materials

const material = new THREE.MeshStandardMaterial();
material.roughness = 0.1;
material.metalness = 0.4;
material.normalMap = containerTexture_N;
// material.displacementMap = containerTexture_D
// material.displacementScale = 0.1
material.color = new THREE.Color(0xffffff);
material.side = THREE.DoubleSide;

const array_skybox = 
[
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skyboxFt.png'), side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skyboxBk.png'), side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skyboxUp.png'), side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skyboxDn.png'), side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skyboxLf.png'), side: THREE.BackSide}),
    new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('textures/skyboxRt.png'), side: THREE.BackSide}),

];

// const material_skybox = new THREE.MeshBasicMaterial(array_skybox);

// Meshes
const box = new THREE.Mesh(geometry_box,material)
box.castShadow = true
box.receiveShadow = false
scene.add(box)

const skybox = new THREE.Mesh(geometry_skybox,array_skybox);
scene.add(skybox);


// Terrain

var tileSize = 100
var terrainResolution = 25

const geometry_floor = new THREE.PlaneGeometry(tileSize,tileSize,terrainResolution,terrainResolution);
geometry_floor.dynamic = true;
geometry_floor.__dirtyVertices = true;

var i;

console.log( geometry_floor.attributes.position.count);

// make uneven terrain
for (i = 0; i < geometry_floor.attributes.position.count; i++) {
    var verticeDisplacement = Math.random()
    geometry_floor.attributes.position.setZ(i,verticeDisplacement);
    
    // let yCoor = geometry_floor.vertices[i].y;
    // let xCoor = geometry_floor.vertices[i].x;
    // let zCoor = geometry_floor.vertices[i].z;
    // yCoor = Math.random();
}

const material_floor = new THREE.MeshStandardMaterial();
material_floor.roughness = 0.85;
material_floor.metalness = 0.02;
material_floor.color = new THREE.Color(0xF3BB80);
material_floor.side = THREE.DoubleSide;
// material_floor.wireframe = true;

const floor = new THREE.Mesh(geometry_floor,material_floor)
floor.castShadow = false;
floor.receiveShadow = true;
scene.add(floor);

floor.position.set(0,-1,0);
floor.rotation.x = Math.PI/2;

// Lights

// Directional Light Main
const dLight = new THREE.DirectionalLight(0xffffff, 1.4)
dLight.position.set(2,3,4);
dLight.castShadow = true;
scene.add(dLight)

dLight.shadow.camera.near = 0.3;

const dLightColor = {
    color: 0xfdfbd3
}

const dLightDebug = gui.addFolder("dLight")

const dLightHelper = new THREE.DirectionalLightHelper(dLight,1)
scene.add(dLightHelper)

dLightDebug.add(dLight.position, "x").min(-5).max(5).step(0.01)
dLightDebug.add(dLight.position, "y").min(-5).max(5).step(0.01)
dLightDebug.add(dLight.position, "z").min(-5).max(5).step(0.01)
dLightDebug.add(dLight, "intensity").min(0).max(10).step(0.01)
dLightDebug.addColor(dLightColor, "color")
    .onChange(() => {
        dLight.color.set(dLightColor.color)
    })


 // Point Light Additional
const pLight = new THREE.PointLight(0x37FDFC, 0.1)
pLight.position.set(-2,4,-4);
pLight.castShadow = true;
scene.add(pLight)

pLight.shadow.camera.near = 0.3;

const pLightColor = {
    color: 0xfdfbd3
}

const pLightDebug = gui.addFolder("pLight")

// const pLightHelper = new THREE.PointLightHelper(pLight,1)
// scene.add(pLightHelper)

pLightDebug.add(pLight.position, "x").min(-5).max(5).step(0.01)
pLightDebug.add(pLight.position, "y").min(-5).max(5).step(0.01)
pLightDebug.add(pLight.position, "z").min(-5).max(5).step(0.01)
pLightDebug.add(pLight, "intensity").min(0).max(10).step(0.01)
pLightDebug.addColor(pLightColor, "color")
    .onChange(() => {
        pLight.color.set(pLightColor.color)
    })

// const hemLight = new THREE.HemisphereLight(0xEB4678, 0x8CEBE7, 0.5 );
// hemLight.position.set(-2,3,-4);
// scene.add(hemLight)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100000)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// const skybox = textureLoader.load(
//     'https://threejsfundamentals.org/threejs/resources/images/equirectangularmaps/tears_of_steel_bridge_2k.jpg',
//     () => {
//         const rt = new THREE.WebGLCubeRenderTarget(skybox.image.height);
//         rt.fromEquirectangularTexture(renderer, skybox);
//         scene.background = rt.skybox;
//     }
// );

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    box.rotation.y = .5 * elapsedTime
    box.position.set(Math.sin(.5 * elapsedTime),0,Math.cos(.5 * elapsedTime))

    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()