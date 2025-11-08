<!-- <script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import * as THREE from 'three';

const canvasContainer = ref(null);
let scene, camera, renderer, planetsGroup, animationFrameId;

// 🟢 عدد الكواكب
const PLANET_COUNT = 50; // قللت العدد قليلاً لتجنب الازدحام مع الحلقات

// 🟢 قائمة الألوان الممكنة للكواكب والحلقات
const PLANET_COLORS = [
    0x8A2BE2, // بنفسجي أزرق (BlueViolet)
    0x40E0D0, // تركواز (Turquoise)
    0xDA70D6, // أرجواني (Orchid)
    0xFF6347, // برتقالي طماطم (Tomato)
    0x6A5ACD, // أزرق أردوازي (SlateBlue)
    0xADD8E6, // أزرق فاتح (LightBlue)
    0xF08080, // مرجاني فاتح (LightCoral)
    0x9ACD32  // أخضر أصفر (YellowGreen)
];

// 🟢 إعداد المشهد ثلاثي الأبعاد
const initThree = () => {
    if (!canvasContainer.value) return;

    // 1. إعداد المشهد (Scene)
    const containerWidth = canvasContainer.value.clientWidth;
    const containerHeight = canvasContainer.value.clientHeight;
    
    scene = new THREE.Scene();
    scene.background = null; // خلفية شفافة للحفاظ على الخلفية الأصلية للموقع
    
    // إضافة إضاءة محيطية (Ambient Light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); 
    scene.add(ambientLight); 

    // 🟢 إضافة إضاءة نقطية (Point Light) لمحاكاة ضوء الشمس أو نجم
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 100);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    // 2. إعداد الكاميرا (Camera)
    camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
    camera.position.z = 10; // زيادة مسافة الكاميرا لرؤية المشهد أوسع
    camera.lookAt(0, 0, 0); // جعل الكاميرا تنظر إلى مركز المشهد

    // 3. إعداد الرسام (Renderer)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerWidth, containerHeight);
    canvasContainer.value.appendChild(renderer.domElement);
    
    // 4. إعداد الكواكب والحلقات
    planetsGroup = new THREE.Group(); // مجموعة رئيسية للكواكب والحلقات
    
    for (let i = 0; i < PLANET_COUNT; i++) {
        const planetColor = PLANET_COLORS[Math.floor(Math.random() * PLANET_COLORS.length)];
        const planetSize = Math.random() * 0.4 + 0.2; // حجم الكوكب بين 0.2 و 0.6
        const ringInnerRadius = planetSize * 1.2; // الحلقات تبدأ بعد الكوكب
        const ringOuterRadius = planetSize * (1.2 + Math.random() * 0.8); // عرض الحلقات عشوائي
        const ringSegments = 32;

        // 🟢 الكوكب (Sphere Geometry)
        const planetGeometry = new THREE.SphereGeometry(planetSize, 32, 32); 
        // 🟢 مادة قياسية (MeshStandardMaterial) تتفاعل مع الضوء
        const planetMaterial = new THREE.MeshStandardMaterial({ 
            color: planetColor,
            roughness: 0.7, // نعومة السطح
            metalness: 0.1  // معدنية قليلة
        });
        const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // 🟢 الحلقات (Ring Geometry)
        const ringGeometry = new THREE.RingGeometry(ringInnerRadius, ringOuterRadius, ringSegments);
        // 🟢 مادة BasicMaterial للحلقات الشفافة
        const ringMaterial = new THREE.MeshBasicMaterial({ 
            color: planetColor, 
            side: THREE.DoubleSide, // لتظهر الحلقات من الجانبين
            transparent: true,
            opacity: Math.random() * 0.5 + 0.2 // شفافية عشوائية
        });
        const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
        ringMesh.rotation.x = Math.PI / 2; // تدوير الحلقات لتكون أفقية

        // 🟢 مجموعة لكل كوكب وحلقاته
        const planetContainer = new THREE.Group();
        planetContainer.add(planetMesh);
        planetContainer.add(ringMesh);

        // وضع عشوائي ثلاثي الأبعاد
        planetContainer.position.x = (Math.random() - 0.5) * 20; // توسيع نطاق الانتشار
        planetContainer.position.y = (Math.random() - 0.5) * 20;
        planetContainer.position.z = (Math.random() - 0.5) * 20;
        
        // تخزين بيانات الحركة الدائرية لكل كوكب
        planetContainer.userData.orbitSpeed = Math.random() * 0.005 + 0.001; 
        planetContainer.userData.rotationSpeed = Math.random() * 0.01 + 0.005; // سرعة دوران حول نفسه
        planetContainer.userData.orbitRadius = Math.random() * 8 + 3; // نصف قطر المدار حول المركز
        planetContainer.userData.orbitAngle = Math.random() * Math.PI * 2; // زاوية بداية المدار

        planetsGroup.add(planetContainer);
    }

    scene.add(planetsGroup);
};

// 🟢 حلقة الرسوم المتحركة
const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    const time = Date.now() * 0.0001; // بطء الحركة الكلية قليلاً

    // تدوير المجموعة الكلية للكواكب
    planetsGroup.rotation.y += 0.0003;
    planetsGroup.rotation.x += 0.0001;

    // حركة الكواكب الفردية
    planetsGroup.children.forEach(planetContainer => {
        // دوران الكوكب والحلقات حول نفسه
        planetContainer.rotation.y += planetContainer.userData.rotationSpeed;
        planetContainer.rotation.x += planetContainer.userData.rotationSpeed / 2;

        // حركة مدارية حول مركز المشهد
        planetContainer.userData.orbitAngle += planetContainer.userData.orbitSpeed;
        planetContainer.position.x = Math.cos(planetContainer.userData.orbitAngle) * planetContainer.userData.orbitRadius;
        planetContainer.position.z = Math.sin(planetContainer.userData.orbitAngle) * planetContainer.userData.orbitRadius;
        // يمكن إضافة حركة على محور Y لجعل المدارات ليست مسطحة تمامًا
        // planetContainer.position.y = Math.sin(planetContainer.userData.orbitAngle * 0.5) * (planetContainer.userData.orbitRadius / 4);
    });

    // حركة الكاميرا بسيطة
    camera.position.x = Math.sin(time * 0.2) * 2;
    camera.position.y = Math.cos(time * 0.1) * 2;
    camera.lookAt(scene.position); // جعل الكاميرا دائما تنظر إلى مركز المشهد

    renderer.render(scene, camera);
};

// 🟢 التعامل مع تغيير حجم النافذة
const onResize = () => {
    if (!canvasContainer.value || !camera || !renderer) return;
    const containerWidth = canvasContainer.value.clientWidth;
    const containerHeight = canvasContainer.value.clientHeight;
    
    camera.aspect = containerWidth / containerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(containerWidth, containerHeight);
};

// 🟢 دورة حياة المكون (Vue Lifecycle Hooks)
onMounted(() => {
    initThree();
    animate();
    window.addEventListener('resize', onResize);
});

onUnmounted(() => {
    cancelAnimationFrame(animationFrameId);
    window.removeEventListener('resize', onResize);
    if (renderer && planetsGroup) {
        // تنظيف ذاكرة GPU بشكل أفضل
        planetsGroup.children.forEach(planetContainer => {
            planetContainer.children.forEach(mesh => {
                if (mesh.geometry) mesh.geometry.dispose();
                if (mesh.material) mesh.material.dispose();
            });
        });
        renderer.dispose();
        // إزالة العناصر من الـ DOM
        if (canvasContainer.value && renderer.domElement) {
            canvasContainer.value.removeChild(renderer.domElement);
        }
    }
    // مسح الـ scene والكاميرا لتجنب تسرب الذاكرة
    scene = null;
    camera = null;
    renderer = null;
    planetsGroup = null;
});
</script> -->

<template>
  <div 
    ref="canvasContainer" 
    class="absolute top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40 transition-opacity duration-1000"
    style="height: 100%;" ></div>
</template>