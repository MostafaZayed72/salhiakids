<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';

const canvasContainer = ref(null);
let scene, camera, renderer, particles, containerWidth, containerHeight, animationFrameId;

// **القيمة الثابتة لكائن Three.js لمجموعة الكواكب/النجوم**
const PLANET_COUNT = 50; 

const initThree = () => {
    if (!canvasContainer.value) return;

    // 1. إعداد المشهد (Scene)
    containerWidth = canvasContainer.value.clientWidth;
    containerHeight = canvasContainer.value.clientHeight;
    
    scene = new THREE.Scene();
    scene.background = null; 
    
    // إضافة إضاءة محيطية
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
    scene.add(ambientLight); 

    // 2. إعداد الكاميرا (Camera)
    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. إعداد الرسام (Renderer)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    canvasContainer.value.appendChild(renderer.domElement);
    
    // 4. إعداد الأشكال الفضائية (Spheres/Planets)
    particles = new THREE.Group(); // استخدم Group لتجميع الأشكال
    
    // تعريف الشكل الأساسي (كرة بسيطة)
    const geometry = new THREE.SphereGeometry(0.1, 16, 16); 

    for (let i = 0; i < PLANET_COUNT; i++) {
        // مادة مضيئة (BasicMaterial) لتشبه التوهج أو النجم
        const material = new THREE.MeshBasicMaterial({ 
            color: 0x8A2BE2, 
            transparent: true,
            opacity: 0.9,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        // وضع عشوائي ثلاثي الأبعاد
        mesh.position.x = (Math.random() - 0.5) * 15; // توسيع النطاق
        mesh.position.y = (Math.random() - 0.5) * 15;
        mesh.position.z = (Math.random() - 0.5) * 15;
        
        // تغيير حجم عشوائي
        const scale = Math.random() * 0.7 + 0.3; // حجم بين 0.3 و 1.0
        mesh.scale.set(scale, scale, scale);
        
        // تخزين بيانات الحركة الدائرية
        mesh.userData.orbitSpeed = Math.random() * 0.005 + 0.001; 
        mesh.userData.orbitRadius = Math.random() * 5 + 2; 
        
        particles.add(mesh);
    }

    scene.add(particles);
};

const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    const time = Date.now() * 0.0005;

    // 1. حركة المجموعة الرئيسية (تدوير)
    particles.rotation.y += 0.0005;

    // 2. حركة الكواكب الفردية (دوران حول نقطة محورية)
    particles.children.forEach((mesh, index) => {
        // حركة دورانية بسيطة
        mesh.position.x += Math.sin(time + index) * 0.005;
        mesh.position.y += Math.cos(time + index) * 0.005;

        // تدوير الكوكب حول نفسه
        mesh.rotation.x += mesh.userData.orbitSpeed / 2;
        mesh.rotation.y += mesh.userData.orbitSpeed;
    });

    // 3. حركة الكاميرا
    camera.position.x = Math.sin(time * 0.1) * 0.5;
    camera.position.y = Math.cos(time * 0.1) * 0.5;

    renderer.render(scene, camera);
};

// ... (بقية الدوال onResize, onMounted, onUnmounted لم تتغير)

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
        // تنظيف ذاكرة GPU
        particles.children.forEach(mesh => {
            mesh.geometry.dispose();
            mesh.material.dispose();
        });
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