<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';

const canvasContainer = ref(null);
let scene, camera, renderer, planetsGroup, animationFrameId;

// عدد الكواكب
const PLANET_COUNT = 50;

const PLANET_COLORS = [
    0x8A2BE2,
    0x40E0D0,
    0xDA70D6,
    0xFF6347,
    0x6A5ACD,
    0xADD8E6,
    0xF08080,
    0x9ACD32
];

const initThree = () => {
    if (!canvasContainer.value) return;

    // تأكد من إزالة أي canvas سابق
    if (renderer && renderer.domElement && canvasContainer.value.contains(renderer.domElement)) {
        canvasContainer.value.removeChild(renderer.domElement);
        renderer.dispose();
        renderer = null;
    }

    // إعداد المشهد
    const containerWidth = window.innerWidth;
    const containerHeight = window.innerHeight;

    scene = new THREE.Scene();
    scene.background = null;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.2, 200);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 10;
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(containerWidth, containerHeight);
    renderer.domElement.style.display = 'block';
    canvasContainer.value.appendChild(renderer.domElement);

    // مجموعة الكواكب
    planetsGroup = new THREE.Group();

    for (let i = 0; i < PLANET_COUNT; i++) {
        const planetColor = PLANET_COLORS[Math.floor(Math.random() * PLANET_COLORS.length)];
        const planetSize = Math.random() * 0.4 + 0.2;
        const ringInnerRadius = planetSize * 1.2;
        const ringOuterRadius = planetSize * (1.2 + Math.random() * 0.8);
        const ringSegments = 32;

        const planetGeometry = new THREE.SphereGeometry(planetSize, 32, 32);
        const planetMaterial = new THREE.MeshStandardMaterial({
            color: planetColor,
            roughness: 0.7,
            metalness: 0.1
        });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);

        const ringGeometry = new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, ringSegments);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: planetColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: Math.random() * 0.5 + 0.15
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = Math.PI / 2;

        const planetContainer = new THREE.Group();
        planetContainer.add(planetMesh);
        planetContainer.add(ringMesh);

        planetContainer.position.x = (Math.random() - 0.5) * 20;
        planetContainer.position.y = (Math.random() - 0.5) * 20;
        planetContainer.position.z = (Math.random() - 0.5) * 20;

        planetContainer.userData.orbitSpeed = Math.random() * 0.005 + 0.001;
        planetContainer.userData.rotationSpeed = Math.random() * 0.01 + 0.005;
        planetContainer.userData.orbitRadius = Math.random() * 8 + 3;
        planetContainer.userData.orbitAngle = Math.random() * Math.PI * 2;

        planetsGroup.add(planetContainer);
    }

    scene.add(planetsGroup);
};

const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    if (!planetsGroup || !camera || !renderer) return;

    const time = Date.now() * 0.0001;

    planetsGroup.rotation.y += 0.0003;
    planetsGroup.rotation.x += 0.0001;

    planetsGroup.children.forEach(planetContainer => {
        planetContainer.rotation.y += planetContainer.userData.rotationSpeed;
        planetContainer.rotation.x += planetContainer.userData.rotationSpeed / 2;

        planetContainer.userData.orbitAngle += planetContainer.userData.orbitSpeed;
        planetContainer.position.x = Math.cos(planetContainer.userData.orbitAngle) * planetContainer.userData.orbitRadius;
        planetContainer.position.z = Math.sin(planetContainer.userData.orbitAngle) * planetContainer.userData.orbitRadius;
    });

    camera.position.x = Math.sin(time * 0.2) * 2;
    camera.position.y = Math.cos(time * 0.1) * 2;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
};

const onResize = () => {
    if (!canvasContainer.value || !camera || !renderer) return;
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
};

onMounted(() => {
    // اجعل الحاوية تغطي الـ viewport كاملاً لضمان الظهور عند التمرير
    if (canvasContainer.value) {
        canvasContainer.value.style.position = 'fixed';
        canvasContainer.value.style.inset = '0';
        canvasContainer.value.style.width = '100%';
        canvasContainer.value.style.height = '100vh';
        canvasContainer.value.style.pointerEvents = 'none';
        canvasContainer.value.style.zIndex = '0';
    }

    initThree();
    animate();
    window.addEventListener('resize', onResize);
});

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', onResize);
    if (renderer && planetsGroup) {
        planetsGroup.children.forEach(planetContainer => {
            planetContainer.children.forEach(mesh => {
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) {
                    if (Array.isArray(mesh.material)) {
                        mesh.material.forEach(m => m.dispose && m.dispose());
                    } else {
                        mesh.material.dispose && mesh.material.dispose();
                    }
                }
            });
        });
        renderer.dispose();
        if (canvasContainer.value && renderer.domElement && canvasContainer.value.contains(renderer.domElement)) {
            canvasContainer.value.removeChild(renderer.domElement);
        }
    }
    scene = null;
    camera = null;
    renderer = null;
    planetsGroup = null;
});
</script>

<template>
  <!-- الآن عنصر الخلفية ثابت ويغطي الشاشة كاملة ويعمل على كل أحجام الشاشات -->
  <div 
    ref="canvasContainer" 
    class="pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
    aria-hidden="true"></div>
</template>

<style scoped>
/* يمكن ضبط مستوى الظهور عبر opacity أو z-index حسب الحاجة */
</style>