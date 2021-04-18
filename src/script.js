import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js'
import * as dat from 'dat.gui'

//Loaders

const textureLoader = new THREE.TextureLoader();

const containerTexture = textureLoader.load('/textures/containerTexture.png');

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects
const geometry = new THREE.BoxGeometry( .5, .5, .5);

const geometry_floor = new THREE.BoxGeometry(10,0.1,10);

// Materials

const material = new THREE.MeshStandardMaterial()
material.roughness = 0.1
material.metalness = 0.4
material.normalMap = containerTexture
material.color = new THREE.Color(0xffffff)

// Mesh
const sphere = new THREE.Mesh(geometry,material)
scene.add(sphere)

const floor = new THREE.Mesh(geometry_floor,material)
scene.add(floor)

// Lights

const dLight = new THREE.DirectionalLight(0xffffff, 1)
dLight.position.set(2,3,4);
scene.add(dLight)

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
dLightDebug.addColor(dLight, "color")
    .onChange(() => {
        dLight.color.set(dLightDebug.color)
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
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
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
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    sphere.rotation.y = .5 * elapsedTime
    floor.position.set(0,-1,0)


    // Update Orbital Controls
    // controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()