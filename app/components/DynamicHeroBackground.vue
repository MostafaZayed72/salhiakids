<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';

const canvasContainer = ref(null);
let scene, camera, renderer, particles, containerWidth, containerHeight, animationFrameId;

const initThree = () => {
    if (!canvasContainer.value) return;

    // 1. إعداد المشهد (Scene)
    containerWidth = canvasContainer.value.clientWidth;
    containerHeight = canvasContainer.value.clientHeight;
    
    scene = new THREE.Scene();
    scene.background = null; // خلفية شفافة لدمجها مع الخلفية الحالية

    // 2. إعداد الكاميرا (Camera)
    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. إعداد الرسام (Renderer)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); // alpha: true للشفافية
    renderer.setSize(containerWidth, containerHeight);
    canvasContainer.value.appendChild(renderer.domElement);
    
    // 4. إعداد الجسيمات (Particles/Grid)
    const geometry = new THREE.BufferGeometry();
    const count = 1000;
    const positions = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // 5. إعداد المادة (Material)
    const material = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x8A2BE2, // لون أرجواني متناسق مع تصميمك
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.8
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
};

const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    // حركة بسيطة: تدوير الجسيمات
    particles.rotation.x += 0.0005;
    particles.rotation.y += 0.001;

    // حركة الكاميرا
    camera.position.x = Math.sin(Date.now() * 0.00005) * 0.5;
    camera.position.y = Math.cos(Date.now() * 0.00005) * 0.5;

    renderer.render(scene, camera);
};

const onResize = () => {
    containerWidth = canvasContainer.value.clientWidth;
    containerHeight = canvasContainer.value.clientHeight;
    
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerWidth, containerHeight);
};

onMounted(() => {
    initThree();
    animate();
    window.addEventListener('resize', onResize);
});

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', onResize);
    if (renderer) {
        renderer.dispose();
    }
});
</script>

<template>
  <div 
    ref="canvasContainer" 
    class="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
    style="height: 100%;" ></div>
</template>