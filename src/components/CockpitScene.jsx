import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { getModel } from '../models/model.js';

export default function CockpitScene(){
  const mountRef2 = useRef(null);
  const sectionRef = useRef(null); 
  const airplaneRef = useRef(null); 

  function handleMouse(e) {
      const containerRect = mountRef2.current.getBoundingClientRect();
      const xInContainer = e.clientX - containerRect.left;
      const yInContainer = e.clientY - containerRect.top;
      const midwidth = containerRect.width / 2;
      const midheight = containerRect.height / 2;
      const xvalue = xInContainer - midwidth;
      const yvalue = yInContainer - midheight;
      console.log({ xvalue, yvalue });
      airplaneRef.current.rotation.y = xvalue * 0.1
      airplaneRef.current.rotation.z = yvalue * 0.1
    }

  useEffect(() => {
    if (!mountRef2.current || !sectionRef.current) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mountRef2.current.clientWidth / mountRef2.current.clientHeight, 0.1, 10000);
    camera.position.set(0, 16, -84);
    camera.lookAt(0,14,-240)

    const light = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(light);
    
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef2.current.clientWidth, mountRef2.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); 
    
    if (mountRef2.current.firstChild) {
      mountRef2.current.removeChild(mountRef2.current.firstChild);
    }
    mountRef2.current.appendChild(renderer.domElement);

    getModel('/SU-35WFMWOLG.glb').then(gltf => {
      const airplaneModel = gltf.scene.clone(true);
      airplaneModel.position.set(0, 0, 0);
      airplaneModel.rotation.y = Math.PI/2;
      airplaneRef.current = airplaneModel;
      scene.add(airplaneModel);
    });

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
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
    <div ref={sectionRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen w-full">
        <video 
          src="/cloudVideo2.mp4" 
          className='absolute top-0 left-0 w-full h-full object-cover z-0' 
          autoPlay muted loop
        />
        <div 
          ref={mountRef2} 
          onMouseMove={handleMouse}
          className="absolute top-0 left-0 h-full w-full z-10"
        />
      </div>
    </div>
  );
}