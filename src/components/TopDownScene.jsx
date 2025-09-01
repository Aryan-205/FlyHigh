import { useEffect, useRef } from 'react';
import { useScroll, useTransform, motion, useSpring } from 'motion/react'; // Correct import path
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

  const springMovement = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 30,
  })

  const progress = useTransform(springMovement, [0, 1], [0, 1]);

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

    getModel('/SU-35WFM(1).glb').then(gltf => {
      const airplaneModel = gltf.scene.clone(true);
      airplaneModel.position.set(0, 25, 0);
      airplaneModel.rotation.y = Math.PI/2;
      airplaneModel.rotation.x = -0.05;
      airplaneRef.current = airplaneModel;
      scene.add(airplaneModel);
    });

    getModel('/airport(1).glb').then(gltf => {
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
    <div ref={sectionRef} className="relative h-[250vh]" id="section2">
      <img src="/cloudimg1" className='absolute top-0 z-10' alt="" />
      <div className="sticky top-0 h-screen w-full z-0" ref={mountRef2}/>
      <motion.p whileInView={{opacity:1}} transition={{duration:2}} className='text-5xl font-extrabold text-white text-center top-60 left-20 tracking-wider absolute z-0 vertical-stretch'>The SU-35 Flanker</motion.p>
      <motion.p className='text-2xl font-semibold text-white text-center top-80 left-20 tracking-wider absolute z-0 vertical-stretch'>Master of the sky. A Force to be reckoned with</motion.p>
    </div>
  );
}