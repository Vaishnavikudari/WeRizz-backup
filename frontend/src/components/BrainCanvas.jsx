import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Circular soft glowing particle sprite texture
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(235, 220, 255, 0.9)');
    grad.addColorStop(0.6, 'rgba(167, 139, 250, 0.5)');
    grad.addColorStop(0.85, 'rgba(124, 58, 237, 0.15)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
}

// Procedural anatomical dual-hemisphere cortex particle generator
// Radii ratio 1.0 : 0.68 : 0.42 (length : height : width per hemisphere)
function generateProceduralBrainParticles(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorViolet = new THREE.Color('#a78bfa');
    const colorGreen = new THREE.Color('#34d399');

    let idx = 0;
    for (let i = 0; i < count; i++) {
        let x, y, z;
        const r = Math.random();

        if (r < 0.82) {
            // Cortex: Left or Right hemisphere
            const isLeft = Math.random() < 0.5;
            const sign = isLeft ? -1 : 1;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            // Ellipsoid proportions: 1.0 (Z - length), 0.68 (Y - height), 0.42 (X - half-width)
            const rad = 0.95 + (Math.random() - 0.5) * 0.12;
            let bx = rad * Math.sin(phi) * Math.cos(theta) * 0.42;
            let by = rad * Math.sin(phi) * Math.sin(theta) * 0.68;
            let bz = rad * Math.cos(phi) * 1.0;

            // Offset hemispheres with longitudinal fissure gap
            const fissureGap = 0.05;
            bx = sign * (Math.abs(bx) + fissureGap);

            // Flattened underside (base of cerebrum)
            if (by < -0.15) {
                by = -0.15 + (by + 0.15) * 0.45;
            }

            // Sine-based cortex sulci & gyri folds
            const fold = Math.sin(bx * 10.0) * Math.cos(by * 8.5) * 0.05
                       + Math.sin(bz * 9.0 + by * 5.0) * 0.035
                       + Math.sin(bx * 16.0) * Math.cos(bz * 14.0) * 0.015;

            x = bx + (bx > 0 ? 1 : -1) * fold;
            y = by + fold * 0.7;
            z = bz + fold * 0.7;
        } else if (r < 0.93) {
            // Small cerebellum at posterior-inferior region
            const sign = Math.random() < 0.5 ? -1 : 1;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const cr = 0.28 + (Math.random() - 0.5) * 0.06;
            const wrinkle = Math.sin(phi * 16.0) * 0.02;

            x = sign * (0.18 + (cr + wrinkle) * Math.sin(phi) * Math.cos(theta) * 0.55);
            y = -0.32 + (cr + wrinkle) * Math.sin(phi) * Math.sin(theta) * 0.55;
            z = -0.42 + (cr + wrinkle) * Math.cos(phi) * 0.65;
        } else {
            // Brain stem: central descending neural column
            const t = Math.random();
            const angle = Math.random() * Math.PI * 2;
            const stemRadius = (0.12 - t * 0.04) + (Math.random() - 0.5) * 0.02;

            x = Math.cos(angle) * stemRadius;
            y = -0.30 - t * 0.42;
            z = -0.10 - t * 0.06 + Math.sin(angle) * stemRadius * 0.6;
        }

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        // Violet #a78bfa with about 12% green #34d399
        const isGreen = Math.random() < 0.12;
        const c = isGreen ? colorGreen : colorViolet;

        colors[idx * 3] = c.r;
        colors[idx * 3 + 1] = c.g;
        colors[idx * 3 + 2] = c.b;

        idx++;
    }

    return { positions, colors };
}

const BrainCanvas = ({ className = "w-full h-full flex items-center justify-center relative select-none pointer-events-none" }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        // WebGL context check with silent fallback
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
        } catch (e) {
            if (canvas) canvas.style.display = 'none';
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 5000 : 12000;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        const width = container.clientWidth || 500;
        const height = container.clientHeight || 500;
        renderer.setSize(width, height, false);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0, 3.4);

        const brainGroup = new THREE.Group();
        brainGroup.rotation.x = 0.12;
        scene.add(brainGroup);

        const particleTexture = createParticleTexture();

        // 1. Procedural particle geometry
        const particleGeo = new THREE.BufferGeometry();
        const { positions, colors } = generateProceduralBrainParticles(particleCount);
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const basePointSize = isMobile ? 0.018 : 0.02;
        const particleMat = new THREE.PointsMaterial({
            size: basePointSize,
            vertexColors: true,
            map: particleTexture,
            transparent: true,
            opacity: 0.95,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const pointsMesh = new THREE.Points(particleGeo, particleMat);
        brainGroup.add(pointsMesh);

        // Optional /assets/brain.glb loader
        let isDisposed = false;
        (async () => {
            try {
                const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
                const { MeshSurfaceSampler } = await import('three/examples/jsm/math/MeshSurfaceSampler.js');
                const loader = new GLTFLoader();

                loader.load(
                    '/assets/brain.glb',
                    (gltf) => {
                        if (isDisposed) return;
                        let targetMesh = null;
                        gltf.scene.traverse((child) => {
                            if (child.isMesh && !targetMesh) targetMesh = child;
                        });

                        if (targetMesh && targetMesh.geometry) {
                            try {
                                const sampler = new MeshSurfaceSampler(targetMesh).build();
                                const newPos = new Float32Array(particleCount * 3);
                                const newCols = new Float32Array(particleCount * 3);
                                const tempV = new THREE.Vector3();
                                const colV = new THREE.Color('#a78bfa');
                                const colG = new THREE.Color('#34d399');

                                for (let i = 0; i < particleCount; i++) {
                                    sampler.sample(tempV);
                                    newPos[i * 3] = tempV.x;
                                    newPos[i * 3 + 1] = tempV.y;
                                    newPos[i * 3 + 2] = tempV.z;

                                    const isG = Math.random() < 0.12;
                                    const c = isG ? colG : colV;
                                    newCols[i * 3] = c.r;
                                    newCols[i * 3 + 1] = c.g;
                                    newCols[i * 3 + 2] = c.b;
                                }

                                particleGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
                                particleGeo.setAttribute('color', new THREE.BufferAttribute(newCols, 3));
                                particleGeo.computeBoundingSphere();
                            } catch (err) {
                                // fallback already running
                            }
                        }
                    },
                    undefined,
                    () => {
                        // Procedural fallback is active
                    }
                );
            } catch (e) {
                // Procedural fallback active
            }
        })();

        // Desktop mouse tracking for subtle parallax tilt up to 8 deg (~0.14 rad)
        const handleMouseMove = (e) => {
            if (isMobile) return;
            const rect = container.getBoundingClientRect();
            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
            mouseRef.current.targetX = Math.max(-1, Math.min(1, nx)) * 0.14; // max 8 deg
            mouseRef.current.targetY = Math.max(-1, Math.min(1, ny)) * 0.14;
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // Animation Loop
        let isVisible = true;
        let animationFrameId;
        const clock = new THREE.Clock();

        const renderFrame = () => {
            if (!isVisible) return;

            const elapsedTime = clock.getElapsedTime();

            if (prefersReducedMotion) {
                // Render single static frame
                renderer.render(scene, camera);
                return;
            }

            // Desktop parallax lerp
            if (!isMobile) {
                mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
                mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;
            } else {
                mouseRef.current.x = 0;
                mouseRef.current.y = 0;
            }

            // Slow Y rotation (1 turn per 40s = 0.157 rad/s) + mouse tilt
            brainGroup.rotation.y = elapsedTime * 0.157 + mouseRef.current.x;
            brainGroup.rotation.x = 0.12 - mouseRef.current.y;

            // Gentle float (small amplitude)
            brainGroup.position.y = Math.sin(elapsedTime * 1.1) * 0.035;

            // Soft size pulse
            const pulse = Math.sin(elapsedTime * 2.1);
            particleMat.size = basePointSize * (1.0 + pulse * 0.08);

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(renderFrame);
        };

        // IntersectionObserver (pause when off-screen)
        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting && !document.hidden;
                if (isVisible) {
                    clock.start();
                    renderFrame();
                } else {
                    cancelAnimationFrame(animationFrameId);
                }
            },
            { threshold: 0.05 }
        );
        observer.observe(container);

        // Visibility change
        const handleVisibilityChange = () => {
            if (document.hidden) {
                isVisible = false;
                cancelAnimationFrame(animationFrameId);
            } else {
                isVisible = true;
                clock.start();
                renderFrame();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // ResizeObserver
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width: w, height: h } = entry.contentRect;
                if (w > 0 && h > 0) {
                    camera.aspect = w / h;
                    camera.updateProjectionMatrix();
                    renderer.setSize(w, h, false);
                    if (prefersReducedMotion) renderer.render(scene, camera);
                }
            }
        });
        resizeObserver.observe(container);

        // Start
        renderFrame();

        // Cleanup
        return () => {
            isDisposed = true;
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            observer.disconnect();
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);

            particleGeo.dispose();
            particleMat.dispose();
            particleTexture.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className={className}
        >
            <canvas 
                ref={canvasRef} 
                aria-hidden="true" 
                className="w-full h-full block" 
            />
        </div>
    );
};

export default BrainCanvas;

