import { useEffect, useRef } from 'react';
import { useScroll, useTransform, useSpring } from 'motion/react'; // Correct import path
import * as THREE from 'three';
import { getModel } from '../models/model.js';

export default function DownToUp(){
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
    const camera = new THREE.PerspectiveCamera(45, mountRef2.current.clientWidth / mountRef2.current.clientHeight, 0.1, 2000);
    camera.rotation.z = Math.PI
    
    const startCamPos = new THREE.Vector3(0, 2, -250);
    const endCamPos = new THREE.Vector3(0, 35, -250);
    camera.position.copy(startCamPos);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );
    directionalLight.position.set(0,60,-170)
    directionalLight.target.position.set(0, 25, -140);
    scene.add(directionalLight.target);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef2.current.clientWidth, mountRef2.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); 
    
    if (mountRef2.current.firstChild) {
      mountRef2.current.removeChild(mountRef2.current.firstChild);
    }
    mountRef2.current.appendChild(renderer.domElement);

    const startAirplanePos = new THREE.Vector3(0, 25, 0);
    const endAirplanePos = new THREE.Vector3(0, 25, -150);

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
      airportModel.scale.setScalar(5);
      airportModel.rotation.y = Math.PI / 2
      airportModel.position.set(0, 0, 0);
      scene.add(airportModel);
    });

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const scrollValue = progress.get();
      camera.position.lerpVectors(startCamPos, endCamPos, scrollValue);
      if(airplaneRef.current){
        airplaneRef.current.position.lerpVectors(startAirplanePos, endAirplanePos, scrollValue);
        camera.lookAt(airplaneRef.current.position);
        camera.rotation.z = scrollValue * 3.14
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
    <div ref={sectionRef} className="relative h-[250vh] flex justify-center" id="section2">
      <div className="sticky top-0 h-screen w-full" ref={mountRef2}/>
      <p className='absolute top-10 text-white text-4xl font-semibold text-center'>The Air Dominance Fighter redefining the skies.</p> 
      <p className='absolute top-[36rem] text-gray-800 text-7xl font-semibold text-center p-4 backdrop-blur-sm'>Anti Gravity Maneuverability</p> 
      <p className='absolute bottom-60 text-white text-4xl font-semibold text-center border-white border p-4 backdrop-blur-lg'>IF YOU COULD SEE ME, YOU WERE NEVER THE TARGET</p> 
    </div>
  );
}