import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader.js'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader.js'
import * as dat from 'dat.gui'
import { BackSide, DoubleSide } from 'three'


// Global Constants
var planetRadius = 1000;
var roadRadiusMult = 1.005;
var terrainResolution = 250;
var roadResolution = 375;
var roadWidth = 4
var planetDisplacement = -5.48;
var orbitRadius = 10000;

// HTML Elements

let hud = document.getElementById('t');

// Loader
const textureLoader = new THREE.TextureLoader();
var fontLoader = new THREE.FontLoader();

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Objects

/////////////////////////////////////////Skybox/////////////////////////////////////////////
const space = textureLoader.load(
    'textures/space.jpg',
    () => {
      const rt = new THREE.WebGLCubeRenderTarget(space.image.height);
      rt.fromEquirectangularTexture(renderer, space);
      scene.background = rt.texture;
    });

const geometry_skybox = new THREE.SphereGeometry(10000,32,32);

const material_skybox = new THREE.MeshStandardMaterial();
material_skybox.color = new THREE.Color(0x000000);
// const array_skybox = 
// [
//     new THREE.MeshBasicMaterial({ map: textureLoader.load('textures/skyboxTransparent.png'), side: THREE.BackSide}),
//     new THREE.MeshBasicMaterial({ map: textureLoader.load('textures/skyboxTransparent.png'), side: THREE.BackSide}),
//     new THREE.MeshBasicMaterial({ map: textureLoader.load('textures/skyboxTransparent.png'), side: THREE.BackSide}),
//     new THREE.MeshBasicMaterial({ map: textureLoader.load('textures/skyboxTransparent.png'), side: THREE.BackSide}),
//     new THREE.MeshBasicMaterial({ map: textureLoader.load('textures/skyboxTransparent.png'), side: THREE.BackSide}),
//     new THREE.MeshBasicMaterial({ map: textureLoader.load('textures/skyboxTransparent.png'), side: THREE.BackSide}),

// ];

const skybox = new THREE.Mesh(geometry_skybox,material_skybox);
scene.add(skybox);
skybox.material.side = BackSide;
skybox.material.transparent = true;
skybox.material.opacity = 0.75;



/////////////////////////////////////////Truck/////////////////////////////////////////////
const container_nMap = textureLoader.load('/textures/containerTexture_N.png');
const container_dMap = textureLoader.load('/textures/containerTexture_D.png');

const geometry_box = new THREE.CylinderBufferGeometry( .5, .5, .5, 32);

const material_container = new THREE.MeshStandardMaterial();
material_container.roughness = 0.1;
material_container.metalness = 0.4;
material_container.normalMap = container_nMap;
// material.displacementMap = container_dMap;
// material.displacementScale = 0.1
material_container.color = new THREE.Color(0xffffff);
material_container.side = THREE.DoubleSide;

const box = new THREE.Mesh(geometry_box,material_container);
box.castShadow = true;
box.receiveShadow = false;
scene.add(box);
box.rotateX(Math.PI/2);
scene.remove(box);

const truck = new THREE.Object3D();
scene.add(truck);

const objLoader = new OBJLoader();
objLoader.load('/models/Truck.obj', (root) => {
    truck.add(root);
    root.scale.set(0.01,0.01,0.01);
    root.rotateY(Math.PI);
    root.position.setY(-0.54);
    root.castShadow = true;
    root.receiveShadow = true;
});


/////////////////////////////////////////Digital Clock/////////////////////////////////////////////

var string_trucktext;
var clockscale = 1;
const clocktext = new THREE.Object3D();
// scene.add(clocktext);

function updateTrucktext(hours,minutes,seconds) {
    var h = hours.toString();
    var m = minutes.toString();
    var s = seconds.toString();

    if (hours<10) {
        h = "0"+hours.toString();
    }

    if (minutes<10) {
        m = "0"+minutes.toString();
    }

    if (seconds<10) {
        s = "0"+seconds.toString();
    }

    string_trucktext = h+" : "+m+" : "+s;

    clockscale = ((camera.position.distanceTo(clocktext.position))/initCameraDist)**2;

    fontLoader.load( '/fonts/helvetiker_regular.typeface.json', function ( font ) {
        clocktext.children[0].geometry = new THREE.TextBufferGeometry( string_trucktext, {
            font: font,
            size: 10,
            height: 1,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 10,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 0
        } );

        clocktext.children[0].material.opacity = 0.4;

        if (clockscale<0.2) {clocktext.children[0].material.opacity = 0.2+(clockscale);}
        if (clockscale>1) {clocktext.children[0].material.opacity = 0.4*(1/clockscale)**2;}

        // if (seconds%2==0) {clocktext.position.set(0,1,0);} 
        // else {clocktext.position.set(0,0,0)}

        // clocktext.scale.set(clockscale,clockscale,clockscale);

        // clocktext.rotation.y = Math.atan2( ( camera.position.x - clocktext.position.x ), ( camera.position.z - clocktext.position.z ) );
    } );
}

fontLoader.load( '/fonts/helvetiker_regular.typeface.json', function ( font ) {

        var geometry_trucktext = new THREE.TextBufferGeometry( string_trucktext, {
            font: font,
        } );

        var material_trucktext = new THREE.MeshStandardMaterial({color: 0xffffff});
        material_trucktext.transparent = true;
        material_trucktext.emissive = new THREE.Color(0xffffff);
        material_trucktext.emissiveIntensity = 3;
        
        var trucktext = new THREE.Mesh(geometry_trucktext, material_trucktext); 
        trucktext.position.set(-73,1,0);
        trucktext.rotateZ(Math.PI/128);
        // trucktext.rotateY(Math.PI/2);
        clocktext.add(trucktext);
} );

/////////////////////////////////////////Terrain/////////////////////////////////////////////

const geometry_floor = new THREE.SphereGeometry(planetRadius,terrainResolution,terrainResolution);
geometry_floor.dynamic = true;
geometry_floor.__dirtyVertices = true;

// make rolling terrain
for (var i = 0; i < geometry_floor.attributes.position.count; i++) {
    var verticeDisplacement = Math.random()*8;
    geometry_floor.attributes.position.setZ(i, geometry_floor.attributes.position.getZ(i)+verticeDisplacement);
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
// scene.add(floor);

floor.rotation.x = Math.PI/2;


/////////////////////////////////////////Road/////////////////////////////////////////////
const road_nMap = textureLoader.load('/textures/road_nMap.jpg');
const road_dMap = textureLoader.load('/textures/road_dMap.jpg');

const geometry_road = new THREE.CylinderBufferGeometry(planetRadius*roadRadiusMult,planetRadius*roadRadiusMult,roadWidth,roadResolution);

const material_road = new THREE.MeshStandardMaterial();
material_road.roughness = 0.5;
material_road.metalness = 0.01;
material_road.normalMap = road_nMap;
// material_road.displacementMap = road_dMap;
// material_road.displacementScale = 0.1;
material_road.color = new THREE.Color(0x111111);

const road = new THREE.Mesh(geometry_road, material_road);
scene.add(road);
road.rotateX(Math.PI/2);
road.castShadow = true;
road.receiveShadow = true;
// road.position.set(0,(planetDisplacement),0);


/////////////////////////////////////////Planet Group/////////////////////////////////////////////

const SMGroup = new THREE.Group();

// Simulated Motion

SMGroup.add(floor);
SMGroup.add(road);
// SMGroup.add(marker);
SMGroup.position.set(0,-planetRadius+planetDisplacement,0);
// SMGroup.add(skybox);
// scene.add(SMGroup);

// scene.add(floor);

/////////////////////////////////////////Checkpoints/////////////////////////////////////////////

const geometry_checkpoint = new THREE.TorusGeometry(100,10,16,200);
const material_checkpoint = new THREE.MeshBasicMaterial();
material_checkpoint.side = DoubleSide;
const checkpoint = new THREE.Mesh(geometry_checkpoint,material_checkpoint);
checkpoint.rotateY(Math.PI/2);
checkpoint.position.set(0,planetRadius+planetDisplacement,0);

var angle_checkpoint = 0;

const container_checkpoint = new THREE.Object3D();
container_checkpoint.add(checkpoint);
container_checkpoint.position.set(0,-planetRadius+planetDisplacement,0);

container_checkpoint.rotateZ(angle_checkpoint);

function updateCheckpoint(init_seconds,seconds) {
    angle_checkpoint = 2*Math.PI*(seconds/60)/1000;
    container_checkpoint.rotateZ(angle_checkpoint);
}

scene.add(container_checkpoint);


/////////////////////////////////////////Sun/////////////////////////////////////////////

var sunRadius = planetRadius*5;
orbitRadius = 100000;
var y_sun = 0;
var x_sun = 0;
var z_sun = 0;

const geometry_sun = new THREE.SphereBufferGeometry(10,100,100);
const material_sun = new THREE.MeshStandardMaterial();
material_sun.roughness = 0.85;
material_sun.metalness = 0.02;
material_sun.color = new THREE.Color(0xF3BB80);
material_sun.emissive = new THREE.Color(0xF3BB80);
material_sun.emissiveIntensity = 5;

const sun = new THREE.Mesh(geometry_sun,material_sun);
scene.add(sun);
sun.scale.set(sunRadius/10,sunRadius/10,sunRadius/10);

const sunLight = new THREE.PointLight(0xfdfbd3, 1)
sunLight.castShadow = true;
scene.add(sunLight);

sunLight.shadow.camera.near = 0.3;

const geometry_orbit = new THREE.TorusBufferGeometry(orbitRadius,20,16,500);

const orbit = new THREE.Mesh(geometry_orbit,material_sun);
scene.add(orbit);

const sunGroup = new THREE.Group();
sunGroup.add(sun);
sunGroup.add(sunLight);
sunGroup.add(orbit);
sunGroup.position.set(x_sun,y_sun,z_sun);
// scene.add(sunGroup);

function sunMovement(orbitLocation) {
    x_sun = (orbitRadius-planetRadius)*Math.cos(orbitLocation);
    y_sun = (orbitRadius-planetRadius)*Math.sin(orbitLocation);
    sunGroup.position.set(x_sun,y_sun,z_sun);
    // console.log(orbitLocation);
}

/////////////////////////////////////////Atmosphere/////////////////////////////////////////////

var atmosRadius = planetRadius*1.4;
var atmosRadius1 = planetRadius*1.2;



const geometry_atmos = new THREE.SphereBufferGeometry(atmosRadius1,terrainResolution,terrainResolution);
const material_atmos = new THREE.MeshStandardMaterial();
material_atmos.roughness = 0.85;
material_atmos.metalness = 0.02;
material_atmos.color = new THREE.Color(0xF3BB80);

const atmosphere = new THREE.Mesh(geometry_atmos,material_atmos);
scene.add(atmosphere);
atmosphere.position.set(0,-planetRadius+planetDisplacement,0);
atmosphere.material.side = DoubleSide;
atmosphere.material.transparent = true;

function createAtmosphere(hours,minutes) {

    var atmosDensity = 0.01;
    const fogColor = new THREE.Color(0xF3BB80);

    scene.fog = new THREE.FogExp2(fogColor,atmosDensity);

        if (camera.position.distanceTo(SMGroup.position) < atmosRadius1) {
            scene.add(SMGroup);
            scene.add(clocktext);
            scene.remove(sunGroup);
            atmosphere.material.opacity = Math.sin(2*Math.PI*(hours+minutes/60)/48);
            atmosDensity = 0.01*Math.sin(2*Math.PI*(hours+minutes/60)/48);
            scene.fog = new THREE.FogExp2(fogColor,atmosDensity);
            // scene.remove(atmosphere);
        }

        if (camera.position.distanceTo(SMGroup.position) > atmosRadius1) {
            atmosDensity = (0.001*(atmosRadius-camera.position.distanceTo(SMGroup.position)))**4;
            scene.fog = new THREE.FogExp2(fogColor,atmosDensity);
            atmosphere.material.opacity = 1;
            // atmosphere.material.opacity = 1/(atmosDensity*1000;
            // scene.add(atmosphere);
            scene.add(sunGroup)
            scene.remove(SMGroup);
            scene.remove(clocktext);

            hud.innerHTML = "Click To Go Back";
            hud.classList.add('back');

            hud.addEventListener("click", () => {camera.position.set(0,10,104); controls.reset()});
        }

        if (camera.position.distanceTo(SMGroup.position) < atmosRadius) {
            scene.add(skybox);
        }

        if (camera.position.distanceTo(SMGroup.position) > atmosRadius) {
            atmosDensity = 0;
            scene.fog = new THREE.FogExp2(fogColor,atmosDensity);
            scene.remove(skybox);
        }

    // console.log(atmosDensity);
}


/////////////////////////////////////////Lights/////////////////////////////////////////////

// Directional Light Main
const dLight = new THREE.DirectionalLight(0xffffff, 0)
dLight.position.set(2,3,4);
dLight.castShadow = true;
scene.add(dLight)

dLight.shadow.camera.near = 0.3;

const dLightColor = {
    color: 0xfdfbd3
}

const dLightDebug = gui.addFolder("dLight")

// const dLightHelper = new THREE.DirectionalLightHelper(dLight,1)
// scene.add(dLightHelper)

dLightDebug.add(dLight.position, "x").min(-5).max(5).step(0.01)
dLightDebug.add(dLight.position, "y").min(-5).max(5).step(0.01)
dLightDebug.add(dLight.position, "z").min(-5).max(5).step(0.01)
dLightDebug.add(dLight, "intensity").min(0).max(10).step(0.01)
dLightDebug.addColor(dLightColor, "color")
    .onChange(() => {
        dLight.color.set(dLightColor.color)
    })


 // Point Light Additional
const pLight = new THREE.PointLight(0xfdfbd3, 1)
pLight.position.set(0,6,0);
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
pLightDebug.add(pLight.position, "y").min(-5).max(20).step(0.01)
pLightDebug.add(pLight.position, "z").min(-5).max(5).step(0.01)
pLightDebug.add(pLight, "intensity").min(0).max(10).step(0.01)
pLightDebug.addColor(pLightColor, "color")
    .onChange(() => {
        pLight.color.set(pLightColor.color)
    })

// const hemLight = new THREE.HemisphereLight(0xEB4678, 0x8CEBE7, 0.5 );
// hemLight.position.set(-2,3,-4);
// scene.add(hemLight)


/////////////////////////////////////////Responsive Design/////////////////////////////////////////////
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


/////////////////////////////////////////Camera/////////////////////////////////////////////
// Base camera
const camera = new THREE.PerspectiveCamera(90, sizes.width / sizes.height, 0.1, 300000);
camera.position.x = 0;
camera.position.y = 10;
camera.position.z = 104;
scene.add(camera);

var initCameraDist = camera.position.distanceTo(clocktext.position);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.minDistance = 6.5;
controls.maxDistance = 200000;
controls.saveState();
// controls.enableDamping = true

/////////////////////////////////////////Renderer/////////////////////////////////////////////
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;



/////////////////////////////////////////Animation (important!) /////////////////////////////////////////////

const clock = new THREE.Clock()
const init_time = new Date();
const init_seconds = init_time.getSeconds();

const tick = () => {

    const elapsedTime = clock.getElapsedTime();

    var time = new Date();
    var hours = time.getHours();
    var minutes = time.getMinutes();
    var seconds = time.getSeconds();

    var timeTotal = 2*Math.PI*(Math.floor(time.getTime()/1000))/31557600;

    // Update objects
    box.rotation.y = -2010*elapsedTime/60;
    // box.position.set(Math.sin(.5 * elapsedTime),0,Math.cos(.5 * elapsedTime));

    // floor.rotation.z = 0.00027 * elapsedTime;

    // console.log(camera.position.distanceTo(SMGroup.position));

    createAtmosphere(hours,minutes);

    updateTrucktext(hours,minutes,seconds);

    updateCheckpoint(init_seconds,elapsedTime);

    sunMovement(timeTotal);

    // console.log(camera.position);

    // Simulates truck movement by rotating entire scene
    SMGroup.rotation.z = elapsedTime/60;

    // Update Orbital Controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
}

tick();
