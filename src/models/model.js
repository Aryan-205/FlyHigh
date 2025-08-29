import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const loader = new GLTFLoader();
const cache = {};

export const getModel = (path) => {
  if (cache[path]) return cache[path]; 
  cache[path] = new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => resolve(gltf),
      null,
      (err) => reject(err)
    );
  });
  return cache[path];
};
