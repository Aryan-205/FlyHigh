import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import * as THREE from 'three'
import { getModel } from '../models/model.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

export default function LandingPage(){

  const mountRef = useRef(null);

    useEffect(() => {
    
      if (!mountRef.current) return;
      window.scrollTo(0,0)
      
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight ,0.1, 10000)
      camera.position.set(0, 0, 100);
      camera.lookAt(0,0,0)
      const light = new THREE.AmbientLight(0xffffff, 1);
      scene.add(light);
      const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
      scene.add( directionalLight );
      directionalLight.position.set(20,0,100)
      directionalLight.target.position.set(-20, 0, 0);
      scene.add(directionalLight.target);
      
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha:true }); //antialias for quality and alpha for background
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setClearColor(0x000000, 0); 
      
      // Clear any existing canvas before appending
      if (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
      }
      mountRef.current.appendChild(renderer.domElement);

      getModel('/SU-35WFMWOLG(1).glb').then(gltf => {
        const airplaneModel = gltf.scene.clone(true);
        airplaneModel.position.set(0, 0, 0);
        airplaneModel.rotation.x = Math.PI/4
        airplaneModel.castShadow = true
        scene.add(airplaneModel);
      });

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

      // Handle window resize
      const handleResize = () => {
          if (mountRef.current) {
            camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
          }
      };
      window.addEventListener('resize', handleResize);


      // Cleanup function for Three.js
      return () => {
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && mountRef.current.firstChild) {
            mountRef.current.removeChild(mountRef.current.firstChild);
        }
        cancelAnimationFrame(frameId);
      };
    }, []);

  useEffect(() => {
      // --- Section 1 Animation ---
      const tl1 = gsap.timeline({
          scrollTrigger: {
              trigger: "#section1",
              start: "top top",
              end: "300px",
              scrub: true,
              pinSpacing: false,
          },
      });

      tl1.to("#cloud", {
          duration: 1,
          y: -200,
      })
      tl1.to(".vertical-stretch",{
          y:60,
          duration:1
      },"<");

      // Clean up function to revert ScrollTriggers and prevent memory leaks
      return () => {
        tl1.kill();
      };
    }, []);
    
  return (
    <div id="section1" className="h-[100vh] relative flex justify-center ">
      <video src="/cloudVideo31.mp4" className='absolute inset-0 -z-10 scale-x-[-1]' autoPlay muted loop/>
      <p className='text-4xl font-extrabold text-white text-center top-20 tracking-wider absolute z-0'>The SU-35 Flanker</p>
      <p className='text-9xl font-extrabold text-white text-center top-40 absolute z-0 vertical-stretch'>MASTERING SKY</p>
      <div ref={mountRef} className="absolute inset-0 z-10 h-[100vh] "></div>
      <img id='cloud' src="/cloudimg1.png" className='z-20 absolute -bottom-[30rem] w-full' alt="" />
  </div>
  )
}