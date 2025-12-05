// SpaceNetworkBackground.tsx
import { useRef, useEffect } from "react";
import * as THREE from "three";

export default function SpaceNetworkBackground() {
    const mountRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!mountRef.current) return;
        const mount = mountRef.current;

        const scene = new THREE.Scene();

        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        camera.position.z = 400;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mount.appendChild(renderer.domElement);

        /** 🌌 Star Field (small white points) **/
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 200;
        const starPositions = [];
        for (let i = 0; i < starCount; i++) {
            starPositions.push(
                (Math.random() - 0.5) * 2000,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 2000
            );
        }
        starGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(starPositions, 3)
        );
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1,
            transparent: true,
            opacity: 0.8,
        });
        const starField = new THREE.Points(starGeometry, starMaterial);
        scene.add(starField);

        /** ✨ Galaxy Clusters (colored glowing points) **/
        const galaxyGeometry = new THREE.BufferGeometry();
        const galaxyCount = 200;
        const galaxyPositions = [];
        const galaxyColors = [];
        const color = new THREE.Color();

        for (let i = 0; i < galaxyCount; i++) {
            galaxyPositions.push(
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 800,
                (Math.random() - 0.5) * 800
            );
            color.setHSL(Math.random(), 1, 0.6); // random bright neon colors
            galaxyColors.push(color.r, color.g, color.b);
        }
        galaxyGeometry.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(galaxyPositions, 3)
        );
        galaxyGeometry.setAttribute(
            "color",
            new THREE.Float32BufferAttribute(galaxyColors, 3)
        );

        const galaxyMaterial = new THREE.PointsMaterial({
            vertexColors: true,
            size: 4,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
        });
        const galaxies = new THREE.Points(galaxyGeometry, galaxyMaterial);
        scene.add(galaxies);

        /** 🌐 Sci-Fi Lines (between nearby galaxy points) **/
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.15,
        });
        const lineGeometry = new THREE.BufferGeometry();
        const maxLines = galaxyCount * galaxyCount * 3;
        const linePositions = new Float32Array(maxLines);
        lineGeometry.setAttribute(
            "position",
            new THREE.BufferAttribute(linePositions, 3)
        );
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        /** 🎥 Animation **/
        function animate() {
            requestAnimationFrame(animate);

            // Rotate scene slowly for parallax effect
            scene.rotation.y += 0.0005;
            scene.rotation.x += 0.0002;

            // Twinkle stars
            starMaterial.size = 1 + Math.sin(Date.now() * 0.002) * 0.3;

            // Connect galaxy points if close
            const gPos = galaxyGeometry.attributes.position.array;
            let vertexpos = 0;
            for (let i = 0; i < galaxyCount; i++) {
                for (let j = i + 1; j < galaxyCount; j++) {
                    const ix = i * 3;
                    const jx = j * 3;
                    const dx = gPos[ix] - gPos[jx];
                    const dy = gPos[ix + 1] - gPos[jx + 1];
                    const dz = gPos[ix + 2] - gPos[jx + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 120) {
                        linePositions[vertexpos++] = gPos[ix];
                        linePositions[vertexpos++] = gPos[ix + 1];
                        linePositions[vertexpos++] = gPos[ix + 2];

                        linePositions[vertexpos++] = gPos[jx];
                        linePositions[vertexpos++] = gPos[jx + 1];
                        linePositions[vertexpos++] = gPos[jx + 2];
                    }
                }
            }
            lineGeometry.setDrawRange(0, vertexpos / 3);
            lineGeometry.attributes.position.needsUpdate = true;

            renderer.render(scene, camera);
        }
        animate();

        /** 📏 Handle resize **/
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            mount.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div
            ref={mountRef}
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: -1,
                width: "100%",
                height: "100%",
                background: "radial-gradient(circle at 50% 50%, #000010, #000000)",
            }}
        />
    );
}
