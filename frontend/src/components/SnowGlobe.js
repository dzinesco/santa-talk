import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const SnowGlobe = () => {
    const mountRef = useRef(null);
    const snowParticlesRef = useRef([]);
    const frameIdRef = useRef(null);

    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0xf0f8ff); // Light blue background
        mountRef.current.appendChild(renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        // Glass dome
        const globeGeometry = new THREE.SphereGeometry(5, 32, 32);
        const globeMaterial = new THREE.MeshPhysicalMaterial({
            transparent: true,
            opacity: 0.3,
            roughness: 0,
            metalness: 0,
            clearcoat: 1,
            clearcoatRoughness: 0,
            reflectivity: 1,
        });
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        scene.add(globe);

        // Base
        const baseGeometry = new THREE.CylinderGeometry(5.2, 5.2, 1, 32);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0xd42426 }); // Santa red
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -5;
        scene.add(base);

        // Ground (snow)
        const groundGeometry = new THREE.CylinderGeometry(4.8, 4.8, 0.1, 32);
        const groundMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.position.y = -4;
        scene.add(ground);

        // Simple Santa (using basic shapes)
        const createSanta = () => {
            const santa = new THREE.Group();

            // Body
            const bodyGeometry = new THREE.SphereGeometry(0.6, 32, 32);
            const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xd42426 });
            const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            santa.add(body);

            // Head
            const headGeometry = new THREE.SphereGeometry(0.3, 32, 32);
            const headMaterial = new THREE.MeshPhongMaterial({ color: 0xfad6a5 });
            const head = new THREE.Mesh(headGeometry, headMaterial);
            head.position.y = 0.5;
            santa.add(head);

            // Hat
            const hatGeometry = new THREE.ConeGeometry(0.3, 0.5, 32);
            const hatMaterial = new THREE.MeshPhongMaterial({ color: 0xd42426 });
            const hat = new THREE.Mesh(hatGeometry, hatMaterial);
            hat.position.y = 0.9;
            santa.add(hat);

            santa.position.y = -3.5;
            return santa;
        };

        const santa = createSanta();
        scene.add(santa);

        // Add trees
        const createTree = () => {
            const tree = new THREE.Group();

            // Trunk
            const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 8);
            const trunkMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 0.25;
            tree.add(trunk);

            // Leaves
            const leavesGeometry = new THREE.ConeGeometry(0.4, 1.0, 8);
            const leavesMaterial = new THREE.MeshPhongMaterial({ color: 0x006400 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 1.0;
            tree.add(leaves);

            return tree;
        };

        // Add multiple trees in a circle
        for (let i = 0; i < 5; i++) {
            const tree = createTree();
            const angle = (i / 5) * Math.PI * 2;
            const radius = 3;
            tree.position.x = Math.cos(angle) * radius;
            tree.position.z = Math.sin(angle) * radius;
            tree.position.y = -4;
            scene.add(tree);
        }

        // Snow particles
        const createSnowParticles = () => {
            const particlesCount = 500;
            const positions = new Float32Array(particlesCount * 3);
            const geometry = new THREE.BufferGeometry();
            const material = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.05,
                transparent: true,
                opacity: 0.8,
            });

            for (let i = 0; i < particlesCount; i++) {
                const i3 = i * 3;
                positions[i3] = (Math.random() - 0.5) * 8;
                positions[i3 + 1] = Math.random() * 10 - 4;
                positions[i3 + 2] = (Math.random() - 0.5) * 8;
                snowParticlesRef.current.push({
                    velocity: -0.02 - Math.random() * 0.02,
                    x: positions[i3],
                    y: positions[i3 + 1],
                    z: positions[i3 + 2],
                });
            }

            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            return new THREE.Points(geometry, material);
        };

        const snow = createSnowParticles();
        scene.add(snow);

        // Camera position
        camera.position.z = 15;

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 20;
        controls.minDistance = 8;

        // Animation
        let shakeTime = 0;
        const animate = () => {
            frameIdRef.current = requestAnimationFrame(animate);

            // Update snow particles
            const positions = snow.geometry.attributes.position.array;
            snowParticlesRef.current.forEach((particle, i) => {
                const i3 = i * 3;
                particle.y += particle.velocity;
                
                if (particle.y < -4) {
                    particle.y = 6;
                }
                
                positions[i3] = particle.x;
                positions[i3 + 1] = particle.y;
                positions[i3 + 2] = particle.z;
            });
            snow.geometry.attributes.position.needsUpdate = true;

            // Gentle santa movement
            santa.position.y = -3.5 + Math.sin(Date.now() * 0.001) * 0.1;

            controls.update();
            renderer.render(scene, camera);
        };

        animate();

        // Handle window resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        // Handle device motion for shaking
        const handleDeviceMotion = (event) => {
            const acceleration = Math.sqrt(
                Math.pow(event.acceleration.x, 2) +
                Math.pow(event.acceleration.y, 2) +
                Math.pow(event.acceleration.z, 2)
            );

            if (acceleration > 20 && Date.now() - shakeTime > 1000) {
                shakeTime = Date.now();
                // Increase snow on shake
                snowParticlesRef.current.forEach(particle => {
                    particle.velocity = -0.08 - Math.random() * 0.08;
                });
                
                // Reset velocities after 2 seconds
                setTimeout(() => {
                    snowParticlesRef.current.forEach(particle => {
                        particle.velocity = -0.02 - Math.random() * 0.02;
                    });
                }, 2000);
            }
        };

        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', handleDeviceMotion);
        }

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('devicemotion', handleDeviceMotion);
            mountRef.current?.removeChild(renderer.domElement);
            cancelAnimationFrame(frameIdRef.current);
        };
    }, []);

    return (
        <div 
            ref={mountRef} 
            style={{ 
                width: '100%', 
                height: '100vh',
                touchAction: 'none'  // Prevents default touch behaviors
            }}
        />
    );
};

export default SnowGlobe;
