import { useEffect, useRef } from 'react';
import { useScroll, useTransform } from 'framer-motion'; // Correct import path
import * as THREE from 'three';
import { getModel } from '../models/model.js';

export default function TopDownScene(){
  const mountRef2 = useRef(null);
  const sectionRef = useRef(null); 
  const airplaneRef = useRef(null); 

  const { scrollYProgress } = useScroll({
    target: sectionRef, 
    offset: ['start start', 'end end'],
  });

  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useEffect(() => {
    if (!mountRef2.current || !sectionRef.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, mountRef2.current.clientWidth / mountRef2.current.clientHeight, 0.1, 10000);
    
    const startCamPos = new THREE.Vector3(0, 350, 0);
    const endCamPos = new THREE.Vector3(0, 2, 250);
    camera.position.copy(startCamPos);

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    scene.add( directionalLight );
    directionalLight.position.set(0,300,50)
    directionalLight.target.position.set(0, 0, 0);
    scene.add(directionalLight.target);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef2.current.clientWidth, mountRef2.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); 
    
    if (mountRef2.current.firstChild) {
      mountRef2.current.removeChild(mountRef2.current.firstChild);
    }
    mountRef2.current.appendChild(renderer.domElement);

    getModel('/SU-35WFM.glb').then(gltf => {
      const airplaneModel = gltf.scene.clone(true);
      airplaneModel.position.set(0, 25, 0);
      airplaneModel.rotation.y = Math.PI/2;
      airplaneModel.rotation.x = -0.05;
      airplaneRef.current = airplaneModel;
      scene.add(airplaneModel);
    });

    getModel('/airport.glb').then(gltf => {
      const airportModel = gltf.scene.clone(true);
      airportModel.scale.setScalar(0.25);
      airportModel.position.set(3110, 0, 0);
      scene.add(airportModel);
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
    <div ref={sectionRef} className="relative h-[200vh]" id="section2">
      <img src="/cloudimg1" className='absolute top-0 z-10' alt="" />
      <div className="sticky top-0 h-screen w-full z-0" ref={mountRef2}/>
    </div>
  );
}