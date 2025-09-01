
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getModel } from '../models/model.js';
import { useScroll, useSpring, useTransform,motion } from 'motion/react';

export default function CockpitScene(){
  const mountRef2 = useRef(null);
  const sectionRef = useRef(null); 
  const airplaneRef = useRef(null); 

  const { scrollYProgress } = useScroll({
    target: sectionRef, 
    offset: ['500px start', 'end end'],
  });

  const springMovement = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 50,
  })

  const progress = useTransform(springMovement, [0, 1], [0, 1]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0]);
  const textOpacity1 = useTransform(scrollYProgress, [0.5, 1], [0, 1]);

  function handleMouse(e) {
    if(airplaneRef.current && airplaneRef.current.position.z === 0){
      const containerRect = mountRef2.current.getBoundingClientRect();
      const xInContainer = e.clientX - containerRect.left;
      const yInContainer = e.clientY - containerRect.top;
      const midwidth = containerRect.width / 2;
      const midheight = containerRect.height / 2;
      const xvalue = xInContainer - midwidth;
      const yvalue = yInContainer - midheight;
      airplaneRef.current.rotation.x = xvalue * 0.0001
      airplaneRef.current.rotation.y = -xvalue * 0.00002
      airplaneRef.current.rotation.z = -yvalue * 0.00005
    }
  }

  useEffect(() => {
    if (!mountRef2.current || !sectionRef.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef2.current.clientWidth / mountRef2.current.clientHeight,
      0.1,
      10000
    );

    const startTarget = new THREE.Vector3(150,17,0);
    const endTarget = new THREE.Vector3(40, 16, 0);
    const startCamPos = new THREE.Vector3(84, 16, 0);
    const endCamPos = new THREE.Vector3(40, 16, 80);
    camera.position.copy(startCamPos);

    // Lights
    const light = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    scene.add(directionalLight);
    directionalLight.position.set(84,16,0);
    directionalLight.target.position.set(90, 16, 0);
    scene.add(directionalLight.target);
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef2.current.clientWidth, mountRef2.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // transparent background
    
    if (mountRef2.current.firstChild) {
      mountRef2.current.removeChild(mountRef2.current.firstChild);
    }
    mountRef2.current.appendChild(renderer.domElement);

    // Load model
    getModel('/SU-35WFMWOLG(1).glb').then(gltf => {
      const airplaneModel = gltf.scene.clone(true);
      airplaneModel.position.set(0, 0, 0);
      airplaneRef.current = airplaneModel;
      scene.add(airplaneModel);
    });

    // Animation loop
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const scrollValue = progress.get();
      camera.position.lerpVectors(startCamPos, endCamPos, scrollValue);
      const cameraLook = startTarget.clone().lerp(endTarget, scrollValue);
      camera.lookAt(cameraLook);

      if (airplaneRef.current) {
        airplaneRef.current.rotation.x = -scrollValue * (Math.PI / 2);
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (mountRef2.current) {
        camera.aspect = mountRef2.current.clientWidth / mountRef2.current.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mountRef2.current.clientWidth, mountRef2.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    mountRef2.current.addEventListener("mousemove", handleMouse);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef2.current && mountRef2.current.firstChild) {
        mountRef2.current.removeChild(mountRef2.current.firstChild);
      }
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div ref={sectionRef} className="relative h-[250vh] cursor-crosshair bg-black">
      <div className="sticky top-0 h-screen w-full">
        
        {/* Background Video */}
        <video 
          src="/cloudVideo21.mp4" 
          className="absolute top-0 left-0 w-full h-full object-cover z-[-10]" 
          autoPlay muted loop
        />
        {/* Cockpit Section */}
        <motion.section className="w-full absolute top-10 flex flex-col items-center z-0" style={{opacity:textOpacity}}>
          <h2 className="text-7xl font-bold mb-4">ADVANCED COCKPIT</h2>
          <p className="max-w-xl text-center text-gray-600 text-lg">
            A glass cockpit with digital displays, HUD overlays, and real-time combat awareness.
          </p>
          <div className="p-6 rounded-2xl bg-gray-800/50 border border-cyan-500 shadow-xl text-center max-w-lg">
            <p className="text-cyan-400 font-mono">[ HUD ACTIVE — Move Cursor ]</p>
          </div>
        </motion.section>

        <motion.section className="w-fit backdrop-blur-lg absolute bottom-[24rem] right-10 flex flex-col items-end z-0 border border-black p-4" style={{opacity:textOpacity1}}>
        <h2 className="text-4xl md:text-6xl font-bold mb-4">ARSENAL</h2>
        <ul className="space-y-4 text-lg text-black">
          <li>-R-77 Beyond-Visual-Range Missiles</li>
          <li>-Kh-31 Anti-Ship & Anti-Radar Missiles</li>
          <li>-Precision Guided Bombs</li>
        </ul>
      </motion.section>

        {/* Three.js Canvas */}
        <div 
          ref={mountRef2}
          className="absolute top-0 left-0 h-full w-full z-10"
        />
      </div>
    </div>
  );
}