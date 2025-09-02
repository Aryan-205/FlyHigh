import { useEffect, useRef } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'motion/react'; // Correct import path
import * as THREE from 'three';
import { getModel } from '../models/model.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

export default function TopDownScene(){
  const mountRef2 = useRef(null);
  const sectionRef = useRef(null); 
  const airplaneRef = useRef(null); 

  const { scrollYProgress } = useScroll({
    target: sectionRef, 
    offset: ['start start', 'end end'],
  });

  const springMovement = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 50,
  })

  const progress = useTransform(springMovement, [0, 1], [0, 1]);

  useEffect(() => {
    if (!mountRef2.current || !sectionRef.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mountRef2.current.clientWidth / mountRef2.current.clientHeight, 0.1, 6000);
    
    const startCamPos = new THREE.Vector3(0, 350, 0);
    const endCamPos = new THREE.Vector3(0, 8, 250);
    camera.position.copy(startCamPos);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );
    directionalLight.position.set(0,300,50)
    directionalLight.target.position.set(0, 25, 0);
    scene.add(directionalLight.target);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef2.current.clientWidth, mountRef2.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); 
    
    if (mountRef2.current.firstChild) {
      mountRef2.current.removeChild(mountRef2.current.firstChild);
    }
    mountRef2.current.appendChild(renderer.domElement);

    getModel('/jetWithLanding.glb').then(gltf => {
      const airplaneModel = gltf.scene.clone(true);
      airplaneModel.position.set(0, 25, 0);
      airplaneModel.rotation.y = Math.PI/2;
      airplaneModel.rotation.x = -0.05;
      airplaneRef.current = airplaneModel;
      scene.add(airplaneModel);
    });

    getModel('/runway.glb').then(gltf => {
      const airportModel = gltf.scene.clone(true);
      airportModel.scale.setScalar(7);
      airportModel.rotation.y = Math.PI / 2
      airportModel.position.set(0, 0, -6000);
      scene.add(airportModel);
    });

    // PMREM generator makes HDR environment usable
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();

    new RGBELoader()
      .setPath('/hdrs/') // your folder
      .load('citrus_orchard_road_puresky_2k.hdr', (texture) => {
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;

        scene.background = envMap;   // optional: shows as skybox
        scene.environment = envMap;  // reflections & lighting

        texture.dispose();
        pmremGenerator.dispose();
      });

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const scrollValue = progress.get();
      camera.position.lerpVectors(startCamPos, endCamPos, scrollValue);
      
      if (airplaneRef.current) {
        camera.lookAt(airplaneRef.current.position);
      }
      
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (mountRef2.current) {
        camera.aspect = mountRef2.current.clientWidth / mountRef2.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef2.current.clientWidth, mountRef2.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef2.current && mountRef2.current.firstChild) {
        mountRef2.current.removeChild(mountRef2.current.firstChild);
      }
      cancelAnimationFrame(frameId);
    };
  }, [progress]);

  return (
    <div ref={sectionRef} className="relative h-[250vh]" id="section2">
      <img src="/cloudimg1" className='absolute top-0 z-10' alt="" />
      <div className="sticky top-0 h-screen w-full z-0" ref={mountRef2}/>

      <section className="w-full absolute top-80 flex flex-col items-center z-20">
        <h2 className="text-4xl md:text-7xl font-bold mb-6 text-white text-center">UNMATCHED PERFORMANCE</h2>
        <p className="max-w-2xl text-center text-gray-200 text-lg">
          Thrust-vectoring engines, supermaneuverability, and cutting-edge avionics push the SU-35 beyond limits.
        </p>

        <div className="grid grid-cols-2 gap-[20rem] pt-40">
          <div className="p-4 rounded-2xl border border-gray-400 backdrop-blur-md text-center w-60">
            <h3 className="text-xl font-bold text-gray-200">2,500 km/h</h3>
            <p className="text-gray-400">Top Speed</p>
          </div>
          <div className="p-4 rounded-2xl border border-gray-400 backdrop-blur-md text-center w-60">
            <h3 className="text-xl font-bold text-gray-200">11,000 km</h3>
            <p className="text-gray-400">Range</p>
          </div>
          <div className="p-4 rounded-2xl border border-gray-400 backdrop-blur-md text-center w-60">
            <h3 className="text-xl font-bold text-gray-200">12</h3>
            <p className="text-gray-400">Hardpoints</p>
          </div>
          <div className="p-4 rounded-2xl border border-gray-400 backdrop-blur-md text-center w-60">
            <h3 className="text-xl font-bold text-gray-200">30mm</h3>
            <p className="text-gray-400">Cannon</p>
          </div>
        </div>
      </section>

      <div className='absolute bottom-0 w-full flex justify-center'>
        <h2 className="text-8xl font-bold mb-6 text-white text-center">DOMINATE THE SKY</h2>
      </div>
    </div>
  );
}