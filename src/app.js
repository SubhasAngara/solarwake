import * as THREE from "https://esm.sh/three@0.165.0";
import { OrbitControls } from "https://esm.sh/three@0.165.0/examples/jsm/controls/OrbitControls.js?deps=three@0.165.0";
import { RoundedBoxGeometry } from "https://esm.sh/three@0.165.0/examples/jsm/geometries/RoundedBoxGeometry.js?deps=three@0.165.0";

const missions = {
    eva: {
        title: "Astronaut EVA",
        text: "Inspect a suited astronaut during a spacewalk and plan around radiation exposure, comms, and suit limits.",
    },
    iss: {
        title: "ISS Orbit",
        text: "Rotate the station and protect crew systems, solar arrays, and low Earth orbit communications.",
    },
    artemis: {
        title: "Artemis Capsule",
        text: "Study the Moon and capsule path during a lunar transit window outside Earth's magnetic shield.",
    },
    mars: {
        title: "Mars Transfer",
        text: "Track a Mars transfer mission while balancing radiation exposure, power, and signal delay.",
    },
    gps: {
        title: "GPS Satellite",
        text: "Inspect a navigation satellite and watch how solar activity can disturb signal reliability.",
    },
    cubesat: {
        title: "CubeSat",
        text: "Keep a small satellite alive with limited shielding, limited power, and very little room for mistakes.",
    },
};

const homeView = document.querySelector(".home-view");
const missionView = document.querySelector("#missionView") || document.querySelector(".mission-view");
const playButton = document.querySelector("#playButton");
const backButton = document.querySelector("#backButton");
const tutorialButton = document.querySelector("#tutorialButton");
const aboutButton = document.querySelector("#aboutButton");
const missionCards = [...document.querySelectorAll(".mission-card")];
const viewerTitle = document.querySelector("#viewerTitle");
const viewerText = document.querySelector("#viewerText");
const viewerFrame = document.querySelector("#viewerFrame");
const modal = document.querySelector("#infoModal");
const modalClose = document.querySelector("#modalClose");
const modalKicker = document.querySelector("#modalKicker");
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");

viewerFrame.querySelectorAll(".orbit, .mission-model").forEach((node) => node.remove());

let missionCanvas = document.querySelector("#missionCanvas");

if (!missionCanvas) {
    missionCanvas = document.createElement("canvas");
    missionCanvas.id = "missionCanvas";
    missionCanvas.className = "mission-canvas";
    viewerFrame.prepend(missionCanvas);
}

const modalCopy = {
    tutorial: {
        kicker: "Tutorial",
        title: "How to play",
        text: "Tutorial content will go here. This screen is ready for mission instructions, controls, scoring, and game flow once we finalize the tutorial.",
    },
    about: {
        kicker: "About Solarwake",
        title: "Mission control, under solar pressure",
        text: "Solarwake is a space-weather mission control simulator where you guide astronauts, spacecraft, satellites, and mission systems through solar storms. Your choices affect safety, communication, power, and mission success.",
    },
};

let scene;
let camera;
let renderer;
let controls;
let modelRoot;
let animationStarted = false;

function resetScroll() {
    window.scrollTo({ top: 0, left: 0 });
}

function showMissionView() {
    homeView.classList.remove("is-active");

    setTimeout(() => {
        homeView.hidden = true;
        missionView.hidden = false;
        resetScroll();
        requestAnimationFrame(() => {
            missionView.classList.add("is-active");
            resizeThreeViewer();
        });
    }, 220);
}

function showHomeView() {
    missionView.classList.remove("is-active");

    setTimeout(() => {
        missionView.hidden = true;
        homeView.hidden = false;
        resetScroll();
        requestAnimationFrame(() => homeView.classList.add("is-active"));
    }, 220);
}

function openModal(type) {
    const copy = modalCopy[type];
    if (!copy || !modal) return;

    modalKicker.textContent = copy.kicker;
    modalTitle.textContent = copy.title;
    modalText.textContent = copy.text;
    modal.hidden = false;

    requestAnimationFrame(() => {
        modal.classList.add("is-open");
    });
}

function closeModal() {
    if (!modal) return;

    modal.classList.remove("is-open");

    setTimeout(() => {
        modal.hidden = true;
    }, 180);
}

function selectMission(missionId) {
    const mission = missions[missionId];
    if (!mission) return;

    missionCards.forEach((card) => {
        card.classList.toggle("is-selected", card.dataset.mission === missionId);
    });

    viewerTitle.textContent = mission.title;
    viewerText.textContent = mission.text;
    viewerFrame.dataset.mission = missionId;
    buildMissionModel(missionId);
}

function initThreeViewer() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(3.2, 2.1, 4.8);

    renderer = new THREE.WebGLRenderer({
        canvas: missionCanvas,
        antialias: true,
        alpha: true,
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.72;
    controls.minDistance = 2.7;
    controls.maxDistance = 7;

    scene.add(new THREE.HemisphereLight(0xdcecff, 0x08111f, 1.75));

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.45);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x70fff0, 1.15);
    rimLight.position.set(-5, 2, -3);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0xff6fb6, 0.7, 12);
    fillLight.position.set(-3, -1, 4);
    scene.add(fillLight);

    modelRoot = new THREE.Group();
    scene.add(modelRoot);

    addViewerStars();
    resizeThreeViewer();

    if (!animationStarted) {
        animationStarted = true;
        animateThree();
    }
}

function resizeThreeViewer() {
    if (!renderer || !camera) return;

    const width = viewerFrame.clientWidth;
    const height = viewerFrame.clientHeight;

    if (!width || !height) return;

    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

function animateThree() {
    requestAnimationFrame(animateThree);

    const time = performance.now() * 0.001;

    if (modelRoot) {
        modelRoot.position.y = Math.sin(time * 1.2) * 0.045;
    }

    controls.update();
    renderer.render(scene, camera);
}

function clearModel() {
    if (!modelRoot) return;

    while (modelRoot.children.length) {
        modelRoot.remove(modelRoot.children[0]);
    }
}

function buildMissionModel(missionId) {
    if (!scene) initThreeViewer();

    clearModel();

    const builders = {
        eva: buildEva,
        iss: buildIss,
        artemis: buildMoonMission,
        mars: buildMars,
        gps: buildGps,
        cubesat: buildCubeSat,
    };

    const builder = builders[missionId];

    if (!builder) {
        console.error("No builder found for mission:", missionId);
        return;
    }

    try {
        builder(modelRoot);
        console.log("Loaded model:", missionId);
    } catch (error) {
        console.error("Model failed:", missionId, error);
        buildFallbackModel(modelRoot);
    }

    resizeThreeViewer();
}

function buildFallbackModel(group) {
    addMesh(group, new THREE.SphereGeometry(0.75, 48, 32), mat(0x70fff0, { roughness: 0.35, metalness: 0.18 }));
}

function addMesh(group, geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...position);
    mesh.rotation.set(...rotation);
    mesh.scale.set(...scale);
    group.add(mesh);
    return mesh;
}

function mat(color, options = {}) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.58,
        metalness: 0.12,
        ...options,
    });
}

function physical(color, options = {}) {
    return new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.45,
        metalness: 0.08,
        clearcoat: 0.35,
        ...options,
    });
}

function makeTexture(draw) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    draw(ctx, 512);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
}

function moonTexture() {
    return makeTexture((ctx, size) => {
        const gradient = ctx.createRadialGradient(size * 0.32, size * 0.26, 10, size * 0.5, size * 0.5, size * 0.65);
        gradient.addColorStop(0, "#f4f4ef");
        gradient.addColorStop(0.35, "#a8abb0");
        gradient.addColorStop(0.72, "#505762");
        gradient.addColorStop(1, "#171b24");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        for (let i = 0; i < 46; i += 1) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 5 + Math.random() * 22;
            ctx.fillStyle = `rgba(24, 28, 35, ${0.12 + Math.random() * 0.22})`;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function marsTexture() {
    return makeTexture((ctx, size) => {
        const gradient = ctx.createRadialGradient(size * 0.28, size * 0.22, 10, size * 0.5, size * 0.5, size * 0.7);
        gradient.addColorStop(0, "#ffb18a");
        gradient.addColorStop(0.35, "#d35f40");
        gradient.addColorStop(0.74, "#6d2119");
        gradient.addColorStop(1, "#240907");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        for (let i = 0; i < 18; i += 1) {
            ctx.fillStyle = `rgba(255, 196, 128, ${0.08 + Math.random() * 0.14})`;
            ctx.beginPath();
            ctx.ellipse(Math.random() * size, Math.random() * size, 40 + Math.random() * 80, 8 + Math.random() * 18, Math.random() * Math.PI, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function panelTexture(base, glow) {
    return makeTexture((ctx, size) => {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, base);
        gradient.addColorStop(1, glow);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 3;

        for (let x = 0; x <= size; x += 64) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
        }

        for (let y = 0; y <= size; y += 64) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }
    });
}

function cubeTexture() {
    return makeTexture((ctx, size) => {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, "#ffd166");
        gradient.addColorStop(1, "#5c3d0e");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.lineWidth = 3;

        for (let i = 0; i <= size; i += 86) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, size);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(size, i);
            ctx.stroke();
        }
    });
}

function addViewerStars() {
    const count = 900;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
        const radius = 8 + Math.random() * 11;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);

        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);

        const warmth = Math.random();
        colors[i * 3] = warmth > 0.82 ? 1 : 0.72 + Math.random() * 0.28;
        colors[i * 3 + 1] = warmth > 0.82 ? 0.82 : 0.82 + Math.random() * 0.18;
        colors[i * 3 + 2] = warmth > 0.82 ? 0.55 : 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const points = new THREE.Points(
        geometry,
        new THREE.PointsMaterial({
            size: 0.022,
            vertexColors: true,
            transparent: true,
            opacity: 0.78,
            sizeAttenuation: true,
        })
    );

    scene.add(points);
}

function buildEva(group) {
    const suit = physical(0xf2f6fb, { roughness: 0.42, metalness: 0.04, clearcoat: 0.45 });
    const soft = physical(0xcbd8e4, { roughness: 0.72, metalness: 0.02, clearcoat: 0.18 });
    const trim = physical(0x8ea5b8, { roughness: 0.52, metalness: 0.14, clearcoat: 0.22 });
    const dark = physical(0x050912, { roughness: 0.3, metalness: 0.38, clearcoat: 0.9 });
    const cyan = physical(0x70fff0, { roughness: 0.24, metalness: 0.12, emissive: 0x123c3a, emissiveIntensity: 0.35 });
    const red = mat(0xff6f91, { roughness: 0.32 });
    const yellow = mat(0xffd166, { roughness: 0.32 });

    const root = new THREE.Group();
    group.add(root);

    addMesh(root, new THREE.CapsuleGeometry(0.38, 0.78, 24, 48), suit, [0, -0.18, 0], [0, 0, 0], [1.05, 1, 0.86]);
    addMesh(root, new RoundedBoxGeometry(0.58, 0.34, 0.14, 8, 0.04), dark, [0, -0.05, 0.38]);
    addMesh(root, new RoundedBoxGeometry(0.74, 0.64, 0.3, 10, 0.08), soft, [0, -0.18, -0.34]);

    addMesh(root, new THREE.SphereGeometry(0.5, 96, 64), suit, [0, 0.74, 0], [0, 0, 0], [1, 1.04, 0.92]);
    addMesh(root, new THREE.BoxGeometry(0.58, 0.28, 0.08), dark, [0, 0.74, 0.43]);
    addMesh(root, new THREE.BoxGeometry(0.42, 0.08, 0.03), physical(0xcaa46a, { roughness: 0.16, metalness: 0.65, clearcoat: 1 }), [0.02, 0.84, 0.49]);

    addMesh(root, new THREE.TorusGeometry(0.42, 0.026, 18, 140), trim, [0, 0.74, 0.02], [Math.PI / 2, 0, 0]);
    addMesh(root, new THREE.TorusGeometry(0.36, 0.024, 18, 120), trim, [0, 0.4, 0], [Math.PI / 2, 0, 0]);
    addMesh(root, new THREE.TorusGeometry(0.34, 0.018, 18, 120), trim, [0, 0.23, 0], [Math.PI / 2, 0, 0]);
    addMesh(root, new THREE.TorusGeometry(0.3, 0.014, 18, 120), trim, [0, -0.58, 0], [Math.PI / 2, 0, 0]);

    addMesh(root, new THREE.CylinderGeometry(0.12, 0.12, 0.16, 48), trim, [-0.5, 0.74, 0], [0, 0, Math.PI / 2]);
    addMesh(root, new THREE.CylinderGeometry(0.12, 0.12, 0.16, 48), trim, [0.5, 0.74, 0], [0, 0, Math.PI / 2]);
    addMesh(root, new THREE.CylinderGeometry(0.09, 0.09, 0.14, 48), cyan, [-0.6, 0.74, 0], [0, 0, Math.PI / 2]);
    addMesh(root, new THREE.CylinderGeometry(0.09, 0.09, 0.14, 48), cyan, [0.6, 0.74, 0], [0, 0, Math.PI / 2]);

    addMesh(root, new THREE.CapsuleGeometry(0.1, 0.52, 20, 36), suit, [-0.48, 0.02, 0.04], [0.1, 0, -0.72]);
    addMesh(root, new THREE.CapsuleGeometry(0.1, 0.52, 20, 36), suit, [0.48, 0.02, 0.04], [0.1, 0, 0.72]);
    addMesh(root, new THREE.CapsuleGeometry(0.09, 0.38, 20, 32), soft, [-0.78, -0.2, 0.1], [0.08, 0, -0.42]);
    addMesh(root, new THREE.CapsuleGeometry(0.09, 0.38, 20, 32), soft, [0.78, -0.2, 0.1], [0.08, 0, 0.42]);
    addMesh(root, new THREE.SphereGeometry(0.13, 40, 26), suit, [-0.94, -0.34, 0.16]);
    addMesh(root, new THREE.SphereGeometry(0.13, 40, 26), suit, [0.94, -0.34, 0.16]);

    addMesh(root, new THREE.CapsuleGeometry(0.12, 0.52, 20, 36), suit, [-0.2, -0.84, 0.05], [0.05, 0, 0.12]);
    addMesh(root, new THREE.CapsuleGeometry(0.12, 0.52, 20, 36), suit, [0.2, -0.84, 0.05], [0.05, 0, -0.12]);
    addMesh(root, new THREE.CapsuleGeometry(0.1, 0.34, 20, 32), soft, [-0.24, -1.16, 0.08], [0.08, 0, 0.04]);
    addMesh(root, new THREE.CapsuleGeometry(0.1, 0.34, 20, 32), soft, [0.24, -1.16, 0.08], [0.08, 0, -0.04]);
    addMesh(root, new RoundedBoxGeometry(0.3, 0.14, 0.36, 8, 0.04), dark, [-0.28, -1.38, 0.2], [0, 0, 0.08]);
    addMesh(root, new RoundedBoxGeometry(0.3, 0.14, 0.36, 8, 0.04), dark, [0.28, -1.38, 0.2], [0, 0, -0.08]);

    addMesh(root, new THREE.SphereGeometry(0.04, 24, 16), cyan, [-0.14, -0.07, 0.44]);
    addMesh(root, new THREE.SphereGeometry(0.035, 24, 16), red, [0.01, -0.07, 0.44]);
    addMesh(root, new THREE.SphereGeometry(0.035, 24, 16), yellow, [0.14, -0.07, 0.44]);

    addMesh(root, new THREE.TorusGeometry(0.62, 0.006, 10, 140), cyan, [0, -0.05, -0.17], [0.95, 0.15, 0.08]);

    root.scale.setScalar(1.08);
    root.rotation.set(0, 0.08, 0);
    root.position.set(0, 0.02, 0);
}

function buildIss(group) {
    const metal = mat(0xdce8f5, { metalness: 0.35, roughness: 0.32 });
    const panel = new THREE.MeshStandardMaterial({
        map: panelTexture("#14346f", "#70fff0"),
        roughness: 0.55,
        metalness: 0.05,
        side: THREE.DoubleSide,
    });

    addMesh(group, new THREE.CylinderGeometry(0.08, 0.08, 2.4, 24), metal, [0, 0, 0], [0, 0, Math.PI / 2]);
    addMesh(group, new THREE.CylinderGeometry(0.2, 0.2, 0.58, 32), metal, [-0.45, 0, 0], [0, 0, Math.PI / 2]);
    addMesh(group, new THREE.CylinderGeometry(0.22, 0.22, 0.68, 32), metal, [0.28, 0, 0], [0, 0, Math.PI / 2]);
    addMesh(group, new THREE.BoxGeometry(1.25, 0.52, 0.035), panel, [-1.35, 0, 0]);
    addMesh(group, new THREE.BoxGeometry(1.25, 0.52, 0.035), panel, [1.35, 0, 0]);
    addMesh(group, new THREE.BoxGeometry(1.08, 0.44, 0.035), panel, [0, 0.72, 0], [0, 0, Math.PI / 2]);
    addMesh(group, new THREE.BoxGeometry(1.08, 0.44, 0.035), panel, [0, -0.72, 0], [0, 0, Math.PI / 2]);
}

function buildMoonMission(group) {
    const moon = new THREE.MeshStandardMaterial({
        map: moonTexture(),
        roughness: 0.85,
        metalness: 0,
    });

    addMesh(group, new THREE.SphereGeometry(0.92, 64, 42), moon);

    const orbitRadius = 1.32;
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.set(Math.PI / 2.2, 0.2, 0);
    group.add(orbitGroup);

    addMesh(orbitGroup, new THREE.TorusGeometry(orbitRadius, 0.008, 12, 180), mat(0xcfd5dc, { transparent: true, opacity: 0.6 }));

    const capsule = new THREE.Group();
    addMesh(capsule, new THREE.ConeGeometry(0.18, 0.32, 48), mat(0xf6f7f1), [0, 0.1, 0]);
    addMesh(capsule, new THREE.CylinderGeometry(0.13, 0.18, 0.22, 48), mat(0x9ca8b6), [0, -0.16, 0]);
    addMesh(capsule, new THREE.TorusGeometry(0.16, 0.012, 8, 40), mat(0x70fff0, { transparent: true, opacity: 0.7 }), [0, -0.04, 0], [Math.PI / 2, 0, 0]);

    const orbitAngle = Math.PI * 1.02;
    capsule.position.set(Math.cos(orbitAngle) * orbitRadius, Math.sin(orbitAngle) * orbitRadius, 0);
    capsule.rotation.z = orbitAngle - Math.PI / 2;
    capsule.scale.setScalar(0.78);
    orbitGroup.add(capsule);
}

function buildMars(group) {
    const mars = new THREE.MeshStandardMaterial({
        map: marsTexture(),
        roughness: 0.78,
        metalness: 0,
    });

    addMesh(group, new THREE.SphereGeometry(0.92, 64, 42), mars);

    const orbitRadius = 1.25;
    const orbitGroup = new THREE.Group();
    orbitGroup.rotation.set(Math.PI / 2.3, 0.1, 0.1);
    group.add(orbitGroup);

    addMesh(orbitGroup, new THREE.TorusGeometry(orbitRadius, 0.007, 12, 180), mat(0xff765f, { transparent: true, opacity: 0.5 }));

    const craft = new THREE.Group();
    addMesh(craft, new RoundedBoxGeometry(0.2, 0.13, 0.13, 5, 0.035), mat(0xdce8f5, { metalness: 0.24, roughness: 0.34 }));
    addMesh(craft, new RoundedBoxGeometry(0.32, 0.09, 0.018, 4, 0.018), mat(0x75c9ff, { metalness: 0.08, roughness: 0.42 }), [-0.28, 0, 0]);
    addMesh(craft, new RoundedBoxGeometry(0.32, 0.09, 0.018, 4, 0.018), mat(0x75c9ff, { metalness: 0.08, roughness: 0.42 }), [0.28, 0, 0]);

    const orbitAngle = Math.PI * 1.04;
    craft.position.set(Math.cos(orbitAngle) * orbitRadius, Math.sin(orbitAngle) * orbitRadius, 0);
    craft.rotation.z = orbitAngle + Math.PI / 2;
    craft.scale.setScalar(0.62);
    orbitGroup.add(craft);
}

function buildGps(group) {
    const metal = mat(0xdbe6f2, { metalness: 0.34, roughness: 0.28 });
    const darkMetal = mat(0x617188, { metalness: 0.42, roughness: 0.32 });
    const panel = new THREE.MeshStandardMaterial({
        map: panelTexture("#142a68", "#8fb7ff"),
        roughness: 0.42,
        metalness: 0.12,
        side: THREE.DoubleSide,
    });

    addMesh(group, new RoundedBoxGeometry(0.64, 0.64, 0.64, 8, 0.09), metal);
    addMesh(group, new RoundedBoxGeometry(0.32, 0.32, 0.08, 6, 0.04), darkMetal, [0, 0, 0.37]);
    addMesh(group, new THREE.SphereGeometry(0.08, 24, 18), mat(0x70fff0), [0, 0, 0.45]);

    addMesh(group, new RoundedBoxGeometry(1.18, 0.46, 0.035, 6, 0.025), panel, [-1.02, 0, 0]);
    addMesh(group, new RoundedBoxGeometry(1.18, 0.46, 0.035, 6, 0.025), panel, [1.02, 0, 0]);

    addMesh(group, new THREE.ConeGeometry(0.34, 0.2, 64, 1, true), mat(0xc6d5e6, { side: THREE.DoubleSide, metalness: 0.22 }), [0, -0.58, 0.32], [Math.PI / 2, 0, 0]);
    addMesh(group, new THREE.CylinderGeometry(0.035, 0.035, 0.94, 24), metal, [0, 0.78, 0]);
    addMesh(group, new THREE.SphereGeometry(0.09, 28, 20), mat(0x8fb7ff), [0, 1.25, 0]);
}

function buildCubeSat(group) {
    const cube = new THREE.MeshStandardMaterial({
        map: cubeTexture(),
        roughness: 0.42,
        metalness: 0.22,
    });

    const panel = new THREE.MeshStandardMaterial({
        map: panelTexture("#153464", "#70fff0"),
        roughness: 0.44,
        metalness: 0.08,
        side: THREE.DoubleSide,
    });

    addMesh(group, new RoundedBoxGeometry(0.86, 0.86, 0.86, 9, 0.09), cube, [0, 0, 0], [0.12, 0.34, 0.08]);
    addMesh(group, new RoundedBoxGeometry(0.78, 0.44, 0.035, 6, 0.025), panel, [-0.92, 0, 0], [0, 0.22, 0]);
    addMesh(group, new RoundedBoxGeometry(0.78, 0.44, 0.035, 6, 0.025), panel, [0.92, 0, 0], [0, -0.22, 0]);
    addMesh(group, new THREE.CylinderGeometry(0.032, 0.032, 0.78, 18), mat(0xf4f8ff, { metalness: 0.25 }), [0, 0.82, 0], [0.4, 0, 0.3]);
}

playButton.addEventListener("click", showMissionView);
backButton.addEventListener("click", showHomeView);
tutorialButton.addEventListener("click", () => openModal("tutorial"));
aboutButton.addEventListener("click", () => openModal("about"));

if (modalClose) {
    modalClose.addEventListener("click", closeModal);
}

if (modal) {
    modal.addEventListener("click", (event) => {
        if (event.target === modal) closeModal();
    });
}

window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal && !modal.hidden) {
        closeModal();
    }
});

window.addEventListener("resize", resizeThreeViewer);

missionCards.forEach((card) => {
    card.addEventListener("click", () => selectMission(card.dataset.mission));
});

initThreeViewer();
selectMission("eva");