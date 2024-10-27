import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import vertex from './shader/vertex.glsl?raw';
import fragment from './shader/fragment.glsl?raw';
import bloomVertex from './shader/bloom.vert.glsl?raw';
import bloomFragment from './shader/bloom.frag.glsl?raw';
import { EffectComposer, OutputPass, RenderPass, ShaderPass, UnrealBloomPass } from 'three/examples/jsm/Addons.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setAnimationLoop( animate );
renderer.toneMapping = THREE.ReinhardToneMapping;
document.body.appendChild( renderer.domElement );


const BLOOM_SCENE = 1;

const bloomLayer = new THREE.Layers();
bloomLayer.set( BLOOM_SCENE );

const params = {
  threshold: 0.25,
  strength: 0.5,
  radius: 0.1,
  exposure: 0.25
};

const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
const materials = {} as any;



const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const bloomComposer = new EffectComposer( renderer );
bloomComposer.renderToScreen = false;
bloomComposer.addPass( renderScene );
bloomComposer.addPass( bloomPass );


const mixPass = new ShaderPass(
  new THREE.ShaderMaterial( {
    uniforms: {
      baseTexture: { value: null },
      bloomTexture: { value: bloomComposer.renderTarget2.texture }
    },
    vertexShader: bloomVertex,
    fragmentShader: bloomFragment,
    defines: {}
  } ), 'baseTexture'
);
mixPass.needsSwap = true;

const outputPass = new OutputPass();

const finalComposer = new EffectComposer( renderer );
finalComposer.addPass( renderScene );
finalComposer.addPass( mixPass );
finalComposer.addPass( outputPass );

const raycaster = new THREE.Raycaster();




const controls = new OrbitControls( camera, renderer.domElement );

const texture1 = new THREE.TextureLoader().load( 'textures/ioutline.png' );
const texture2 = new THREE.TextureLoader().load( 'textures/ioutline.png' );

// texture2.rotation = 3.14 * 0.15;
// texture2.transformUv(new THREE.Vector2( 100, 0.0 ));
texture2.offset = new THREE.Vector2( 1000, 0.5 );

const material1 = new THREE.MeshBasicMaterial( { 
  color: 0x00ff00,
  // opacity: 0.15,
  // transparent: true,
  // fog: true,
  // texture,
  // wireframe: true,
  map: texture1,
  // vertexColors: true,
 } );

//  const material = new THREE.MeshPhongMaterial( { 
//   color: 0x00ff00,
//   // opacity: 0.15,
//   // transparent: true,
//   // fog: true,
//   map: texture,
//   // wireframe: true,
//   // vertexColors: true,
//  } );

const uniforms = {
  // 'fogDensity': { value: 0.45 },
  // 'fogColor': { value: new THREE.Vector3( 0, 0, 0 ) },
  'time': { value: 1.0 },
  // 'uvScale': { value: new THREE.Vector2( 3.0, 1.0 ) },
  'texture1': { value: texture1 },
  'side': { value: 0.0 },
};

const material = new THREE.ShaderMaterial( {
  // premultipliedAlpha: true,
  uniforms: uniforms,
  vertexShader: vertex,
  fragmentShader: fragment,
  // alphaHash: false,
  // alphaTest: 1,
  // blendAlpha: 0.5,
  // alphaToCoverage: false,
  // blendDstAlpha: 0.5,
  // blendEquationAlpha: 0.5,
  // dithering: true,
  // blendColor: 0.5,
  // blendSrcAlpha: 0.5,
  // wireframe: false,
  transparent: true,
  side: THREE.FrontSide,
} );

const material2 = new THREE.ShaderMaterial( {
  // premultipliedAlpha: true,
  uniforms: {
    'time': { value: 1.0 },
    'texture1': { value: texture2 },
    'side': { value: 1.0 },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
  // alphaHash: false,
  // alphaTest: 1,
  // blendAlpha: 0.5,
  // alphaToCoverage: false,
  // blendDstAlpha: 0.5,
  // blendEquationAlpha: 0.5,
  // dithering: true,
  // blendColor: 0.5,
  // blendSrcAlpha: 0.5,
  // wireframe: false,
  // transparent: true,
  side: THREE.BackSide,
} );

// const geometry = new THREE.SphereGeometry( 5, 10 );
const geometry = new THREE.SphereGeometry( 5, 100 );

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const sphere = new THREE.Mesh( geometry, material );


const gSphere2 = new THREE.SphereGeometry( 5, 100 );

const sphere2 = new THREE.Mesh(gSphere2 , material2 );
// const sphere = new THREE.Mesh()
scene.add( sphere );
scene.add( sphere2 );

// sphere2.translateX(5);

// scene.background = new THREE.Color( 0xffffff );

camera.position.z = 20;
controls.update();



const points = [];
points.push( new THREE.Vector3( - 10, 0, 0 ) );
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 10, 0, 0 ) );

const geometryLine = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( geometryLine, material1 );
// scene.add( line );

sphere.rotation.y -= 3.14/2;
sphere2.rotation.y -= 3.14/2;


function render() {
  // scene.traverse( darkenNonBloomed );
  bloomComposer.render();
  // scene.traverse( restoreMaterial );

  // render the entire scene, then render bloom scene on top
  finalComposer.render();
}

function darkenNonBloomed( obj: any ) {

  if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {
    materials[ obj.uuid ] = obj.material;
    obj.material = darkMaterial;

  }

}

function restoreMaterial( obj: any ) {

  if ( materials[ obj.uuid ] ) {

    obj.material = materials[ obj.uuid ];
    delete materials[ obj.uuid ];

  }

}

sphere.rotation.x += 3.14/7;
sphere2.rotation.x += 3.14/7;

function animate() {

	// sphere.rotation.x += 0.01;
	sphere.rotation.y += 0.001;
  sphere2.rotation.y += 0.001;

  controls.update();

	// renderer.render( scene, camera );
  render();
}

