"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

type CarSceneProps = {
  className?: string;
};

export default function CarScene({ className }: CarSceneProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(
      32,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(5, 3.2, 7.2);

    const ambient = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(6, 8, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xcad9ff, 0.6);
    fillLight.position.set(-6, 3, 2);
    scene.add(fillLight);

    const group = new THREE.Group();
    scene.add(group);

    let carModel: THREE.Object3D | null = null;

    const mtlLoader = new MTLLoader();
    mtlLoader.setPath("/assets/cars/");
    mtlLoader.load("Low_Poly_City_Cars.mtl", (materials) => {
      materials.preload();
      const objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath("/assets/cars/");
      objLoader.load("Low_Poly_City_Cars.obj", (object) => {
        carModel = object;
        const box = new THREE.Box3().setFromObject(object);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        object.position.sub(center);
        const maxAxis = Math.max(size.x, size.y, size.z);
        const scale = 2.2 / maxAxis;
        object.scale.setScalar(scale);
        object.rotation.y = -Math.PI / 6;

        group.add(object);
      });
    });

    const plane = new THREE.Mesh(
      new THREE.CircleGeometry(2.8, 64),
      new THREE.MeshStandardMaterial({
        color: 0xf7f4ef,
        roughness: 0.85,
        metalness: 0,
      })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.25;
    scene.add(plane);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      group.rotation.y = elapsed * 0.22;
      group.position.y = Math.sin(elapsed * 0.9) * 0.08;

      if (carModel) {
        carModel.rotation.y = -Math.PI / 6 + Math.sin(elapsed * 0.5) * 0.05;
      }

      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      const { clientWidth, clientHeight } = mountRef.current;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frameId);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className={className} ref={mountRef} />;
}
