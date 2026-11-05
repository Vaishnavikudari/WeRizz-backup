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
    grad.addColorStop(0.25, 'rgba(220, 200, 255, 0.9)');
    grad.addColorStop(0.55, 'rgba(167, 139, 250, 0.45)');
    grad.addColorStop(0.85, 'rgba(124, 58, 237, 0.12)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// Procedural anatomical dual-hemisphere cortex particle generator
function generateProceduralBrainParticles(count) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const colorViolet = new THREE.Color(0xa78bfa);
    const colorEmerald = new THREE.Color(0x34d399);
    const colorPink = new THREE.Color(0xe879f9);

    let idx = 0;
    for (let i = 0; i < count; i++) {
        let x, y, z;
        const r = Math.random();

        if (r < 0.82) {
            // Cerebrum: Left or Right Hemisphere with longitudinal fissure gap
            const isLeft = Math.random() < 0.5;
            const sign = isLeft ? -1 : 1;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            // Base ellipsoid proportions: x: 0.88, y: 0.78, z: 1.05
            const rad = 0.92 + (Math.random() - 0.5) * 0.14;
            let bx = rad * Math.sin(phi) * Math.cos(theta) * 0.88;
            let by = rad * Math.sin(phi) * Math.sin(theta) * 0.78;
            let bz = rad * Math.cos(phi) * 1.05;

            // Fissure separation gap
            const gap = 0.08;
            bx = sign * (Math.abs(bx) + gap);

            // Natural gyri and sulci cortex folding displacement
            const fold = Math.sin(bx * 7.0) * Math.cos(by * 6.5) * 0.09
                       + Math.sin(bz * 8.0 + by * 4.0) * 0.05
                       + Math.sin(bx * 14.0) * Math.cos(bz * 12.0) * 0.025;

            const fissurePinch = Math.min(1.0, Math.abs(bx) * 4.0);
            
            x = bx + (bx > 0 ? 1 : -1) * fold * fissurePinch;
            y = by + fold * 0.8;
            z = bz + fold * 0.8;

            // Anatomical temporal lobe contour
            if (y < -0.3 && Math.abs(x) < 0.3) {
                y += 0.08;
            }
        } else if (r < 0.94) {
            // Cerebellum: Dual posterior lobes
            const sign = Math.random() < 0.5 ? -1 : 1;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const cr = 0.36 + (Math.random() - 0.5) * 0.08;
            const wrinkle = Math.sin(phi * 18.0) * 0.025;

            x = sign * (0.24 + (cr + wrinkle) * Math.sin(phi) * Math.cos(theta) * 0.85);
            y = -0.42 + (cr + wrinkle) * Math.sin(phi) * Math.sin(theta) * 0.65;
            z = -0.48 + (cr + wrinkle) * Math.cos(phi) * 0.85;
        } else {
            // Brain stem: Central descending neural column
            const t = Math.random();
            const angle = Math.random() * Math.PI * 2;
            const stemRadius = (0.16 - t * 0.05) + (Math.random() - 0.5) * 0.03;

            x = Math.cos(angle) * stemRadius;
            y = -0.38 - t * 0.45;
            z = -0.12 - t * 0.08 + Math.sin(angle) * stemRadius * 0.8;
        }

        positions[idx * 3] = x;
        positions[idx * 3 + 1] = y;
        positions[idx * 3 + 2] = z;

        // Color weighting: ~80% brand violet (#a78bfa), ~15% emerald accent (#34d399), ~5% synaptic pink (#e879f9)
        const randCol = Math.random();
        let c;
        if (randCol < 0.80) {
            c = colorViolet;
        } else if (randCol < 0.95) {
            c = colorEmerald;
        } else {
            c = colorPink;
        }

        colors[idx * 3] = c.r;
        colors[idx * 3 + 1] = c.g;
        colors[idx * 3 + 2] = c.b;

        idx++;
    }

    return { positions, colors };
}

// Procedural low-poly wireframe cortex shell
function createProceduralWireframe() {
    const group = new THREE.Group();
    const wireMat = new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        wireframe: true,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending
    });

    [-1, 1].forEach((sign) => {
        const geo = new THREE.IcosahedronGeometry(0.85, 2);
        geo.scale(0.85, 0.76, 1.02);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            let px = pos.getX(i);
            let py = pos.getY(i);
            let pz = pos.getZ(i);
            const fold = Math.sin(px * 6) * Math.cos(py * 6) * 0.06;
            pos.setXYZ(i, px + fold, py + fold, pz + fold);
        }
        geo.computeVertexNormals();
        const mesh = new THREE.Mesh(geo, wireMat);
        mesh.position.x = sign * 0.14;
        group.add(mesh);
    });

    return group;
}

const BrainHero = ({ mousePos = { x: 0, y: 0 } }) => {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const mouseTargetRef = useRef({ x: 0, y: 0 });
    const mouseCurrentRef = useRef({ x: 0, y: 0 });

    // Sync external mouse coordinates into target ref
    useEffect(() => {
        mouseTargetRef.current = {
            x: mousePos.x || 0,
            y: mousePos.y || 0
        };
    }, [mousePos]);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        // Check WebGL availability safely
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({
                canvas,
                alpha: true,
                antialias: true,
                powerPreference: 'high-performance'
            });
        } catch (e) {
            console.warn('WebGL not supported, silencing 3D brain canvas:', e);
            if (canvas) canvas.style.display = 'none';
            return;
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 5000 : 12000;

        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        const width = container.clientWidth || 400;
        const height = container.clientHeight || 400;
        renderer.setSize(width, height, false);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
        camera.position.set(0, 0, 3.8);

        const brainGroup = new THREE.Group();
        // Initial gentle downward tilt for anatomical beauty
        brainGroup.rotation.x = 0.12;
        scene.add(brainGroup);

        const particleTexture = createParticleTexture();

        // 1. Procedural Particles Setup (default & immediate fallback)
        let particleGeo = new THREE.BufferGeometry();
        const { positions, colors } = generateProceduralBrainParticles(particleCount);
        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const basePointSize = isMobile ? 0.024 : 0.028;
        const particleMat = new THREE.PointsMaterial({
            size: basePointSize,
            vertexColors: true,
            map: particleTexture,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const pointsMesh = new THREE.Points(particleGeo, particleMat);
        brainGroup.add(pointsMesh);

        // 2. Faint Tech-Noir Wireframe Shell
        const wireframeGroup = createProceduralWireframe();
        brainGroup.add(wireframeGroup);

        // 3. Optional GLB Loader attempt (seamlessly swaps points if /assets/brain.glb exists)
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
                                const colV = new THREE.Color(0xa78bfa);
                                const colE = new THREE.Color(0x34d399);

                                for (let i = 0; i < particleCount; i++) {
                                    sampler.sample(tempV);
                                    newPos[i * 3] = tempV.x;
                                    newPos[i * 3 + 1] = tempV.y;
                                    newPos[i * 3 + 2] = tempV.z;

                                    const c = Math.random() < 0.85 ? colV : colE;
                                    newCols[i * 3] = c.r;
                                    newCols[i * 3 + 1] = c.g;
                                    newCols[i * 3 + 2] = c.b;
                                }

                                particleGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
                                particleGeo.setAttribute('color', new THREE.BufferAttribute(newCols, 3));
                                particleGeo.computeBoundingSphere();
                            } catch (err) {
                                console.warn('GLB surface sampling skipped, using procedural cortex:', err);
                            }
                        }
                    },
                    undefined,
                    () => {
                        // Missing /assets/brain.glb is completely fine - procedural cortex is already running
                    }
                );
            } catch (e) {
                // Ignore dynamic import failure in environments without it
            }
        })();

        // 4. Animation Loop with IntersectionObserver
        let isVisible = true;
        let animationFrameId;
        const clock = new THREE.Clock();

        const renderFrame = () => {
            if (!isVisible) return;

            const elapsedTime = clock.getElapsedTime();

            if (!prefersReducedMotion) {
                // Smooth Lerp Mouse Parallax (up to 8 degrees = ~0.14 radians)
                if (!isMobile) {
                    mouseCurrentRef.current.x += (mouseTargetRef.current.x - mouseCurrentRef.current.x) * 0.06;
                    mouseCurrentRef.current.y += (mouseTargetRef.current.y - mouseCurrentRef.current.y) * 0.06;
                } else {
                    mouseCurrentRef.current.x = 0;
                    mouseCurrentRef.current.y = 0;
                }

                // Slow Y-axis rotation (~1 turn per 40 seconds => 2pi / 40 ≈ 0.157 rad/s)
                brainGroup.rotation.y = elapsedTime * 0.157 + mouseCurrentRef.current.x * 0.14;
                brainGroup.rotation.x = 0.12 - mouseCurrentRef.current.y * 0.14;

                // Gentle vertical float
                brainGroup.position.y = Math.sin(elapsedTime * 1.05) * 0.035;

                // Soft point size & opacity pulse (sine wave ~3s period synced with engine pulse)
                const pulse = Math.sin(elapsedTime * (Math.PI * 2 / 3.0));
                particleMat.size = basePointSize * (1.0 + pulse * 0.12);
                particleMat.opacity = 0.85 + pulse * 0.10;
            }

            renderer.render(scene, camera);
            animationFrameId = requestAnimationFrame(renderFrame);
        };

        // Pause loop when hero is off-screen
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
            { threshold: 0.1 }
        );
        observer.observe(container);

        // Pause loop on tab visibility change
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
                }
            }
        });
        resizeObserver.observe(container);

        // Start render loop
        renderFrame();

        // Cleanup
        return () => {
            isDisposed = true;
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            observer.disconnect();
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);

            // Dispose Three.js objects
            particleGeo.dispose();
            particleMat.dispose();
            particleTexture.dispose();

            wireframeGroup.traverse((child) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                    child.material.dispose();
                }
            });

            renderer.dispose();
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className="absolute inset-0 w-full h-full rounded-full overflow-hidden pointer-events-none flex items-center justify-center select-none"
            style={{
                // Required subtle canvas opacity so central headline remains 100% crystal-clear & readable
                opacity: 0.48,
                filter: 'drop-shadow(0 0 30px rgba(124, 58, 237, 0.55))'
            }}
        >
            <canvas 
                ref={canvasRef} 
                className="w-full h-full block rounded-full" 
            />
        </div>
    );
};

export default BrainHero;
