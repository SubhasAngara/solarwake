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

const gameScenarios = {
    eva: {
        storm: "Solar storm G4 - EVA risk",
        flare: "X3.2",
        mode: "EVA tactical map",
        assetName: "EVA Crew-1",
        assetType: "Crew outside vehicle. Suit dose, comms, and return timing are critical.",
        status: "EVA crew is outside the vehicle. Suit radiation dose and comm delay are the main threats.",
        scenario: "Solar particle alert during spacewalk",
        event: "Particle counts are rising near the crew path. Mission control has a short window to reduce exposure.",
        caption: "Astronaut is moving along the vehicle while a charged particle front crosses the worksite.",
        health: 76,
        shield: 48,
        energy: 68,
        signal: 56,
        risks: { radiation: 82, comms: 46, power: 28, crew: 78 },
        alerts: ["Suit dose trending upward.", "Return path still clear.", "Helmet comms showing light static."],
    },
    iss: {
        storm: "Solar storm G3 - station watch",
        flare: "M8.7",
        mode: "LEO station theater",
        assetName: "ISS Orbit",
        assetType: "Crewed station. Solar arrays, comms, and attitude control are under watch.",
        status: "Station systems are stable, but solar array output and crew procedures need active monitoring.",
        scenario: "Geomagnetic activity building over next orbit",
        event: "A moderate storm is disturbing low Earth orbit communications and power forecasting.",
        caption: "Station crosses the dayside while auroral current systems disturb orbital communications.",
        health: 88,
        shield: 62,
        energy: 74,
        signal: 61,
        risks: { radiation: 52, comms: 61, power: 58, crew: 42 },
        alerts: ["Array output fluctuating.", "Ku-band link unstable.", "Crew shelter procedure on standby."],
    },
    artemis: {
        storm: "Solar storm S3 - lunar transit",
        flare: "X1.8",
        mode: "Lunar transit theater",
        assetName: "Artemis Capsule",
        assetType: "Crew capsule outside Earth's strongest magnetic protection.",
        status: "The capsule is outside Earth's strongest magnetic protection during lunar transit.",
        scenario: "Radiation shelter timing is critical",
        event: "A solar energetic particle warning arrives while the capsule is between major burn windows.",
        caption: "Capsule tracks along lunar transfer while the particle forecast compresses the safe window.",
        health: 84,
        shield: 66,
        energy: 71,
        signal: 69,
        risks: { radiation: 76, comms: 38, power: 42, crew: 72 },
        alerts: ["Shelter window recommended.", "Lunar link stable.", "Navigation burn remains available."],
    },
    mars: {
        storm: "Solar storm S4 - cruise hazard",
        flare: "X2.4",
        mode: "Mars transfer theater",
        assetName: "Ares Transfer",
        assetType: "Deep-space craft with communication delay and limited shielding.",
        status: "The transfer craft has limited shielding and a long communication delay.",
        scenario: "Storm front crossing cruise trajectory",
        event: "Solar wind speed is climbing. The crew cannot wait for real-time instructions from Earth.",
        caption: "Transfer vehicle rides the interplanetary path while the storm front sweeps across the route.",
        health: 79,
        shield: 52,
        energy: 64,
        signal: 48,
        risks: { radiation: 71, comms: 66, power: 49, crew: 64 },
        alerts: ["Deep-space network delay active.", "Radiation shelter advised.", "Power margin narrowing."],
    },
    gps: {
        storm: "Solar storm G3 - signal drift",
        flare: "M6.1",
        mode: "MEO navigation theater",
        assetName: "Navstar Relay",
        assetType: "Navigation satellite. Signal reliability is the priority.",
        status: "Navigation payload is active. Signal reliability is the priority.",
        scenario: "Signal drift across constellation",
        event: "Geomagnetic interference is creating timing noise and possible service degradation.",
        caption: "Navigation satellite holds medium Earth orbit while timing signals distort under storm noise.",
        health: 72,
        shield: 58,
        energy: 69,
        signal: 41,
        risks: { radiation: 36, comms: 78, power: 44, crew: 22 },
        alerts: ["Clock correction requested.", "Signal confidence falling.", "Backup routing available."],
    },
    cubesat: {
        storm: "Solar storm G2 - smallsat stress",
        flare: "M4.9",
        mode: "CubeSat survival theater",
        assetName: "CubeSat Finch",
        assetType: "Small satellite with limited battery, shielding, and thermal control.",
        status: "The small satellite has limited shielding, battery reserve, and thermal control.",
        scenario: "CubeSat bus voltage dropping",
        event: "Solar activity is increasing drag and power instability during the next pass.",
        caption: "CubeSat tumbles through a rough pass while power and thermal margins tighten.",
        health: 64,
        shield: 36,
        energy: 42,
        signal: 53,
        risks: { radiation: 58, comms: 54, power: 74, crew: 18 },
        alerts: ["Battery margin low.", "Thermal control cycling.", "Downlink pass in progress."],
    },
};

const modalCopy = {
    tutorial: {
        kicker: "Tutorial",
        title: "How to play",
        text: "Choose a mission, inspect the live theater, and respond to solar weather events before risk overwhelms the asset.",
    },
    about: {
        kicker: "About Solarwake",
        title: "Mission control, under solar pressure",
        text: "Solarwake is a space-weather mission control simulator where you guide astronauts, spacecraft, satellites, and mission systems through solar storms.",
    },
};

const homeView = document.querySelector(".home-view");
const missionView = document.querySelector("#missionView");
const gameView = document.querySelector("#gameView");
const playButton = document.querySelector("#playButton");
const backButton = document.querySelector("#backButton");
const launchButton = document.querySelector("#launchButton");
const gameBackButton = document.querySelector("#gameBackButton");
const tutorialButton = document.querySelector("#tutorialButton");
const aboutButton = document.querySelector("#aboutButton");
const missionCards = [...document.querySelectorAll(".mission-card")];
const viewerTitle = document.querySelector("#viewerTitle");
const viewerText = document.querySelector("#viewerText");
const viewerFrame = document.querySelector("#viewerFrame");
const gameMissionName = document.querySelector("#gameMissionName");
const gameMissionStatus = document.querySelector("#gameMissionStatus");
const gameScenario = document.querySelector("#gameScenario");
const gameEventText = document.querySelector("#gameEventText");
const gameRiskRows = [...document.querySelectorAll(".risk-row")];
const decisionCards = [...document.querySelectorAll(".decision-card")];
const latestLog = document.querySelector("#latestLog");
const gameCanvas = document.querySelector("#gameCanvas");
const gameStormLevel = document.querySelector("#gameStormLevel");
const gameFlareClass = document.querySelector("#gameFlareClass");
const gameEnergyFill = document.querySelector("#gameEnergyFill");
const gameSignalFill = document.querySelector("#gameSignalFill");
const gameEnergyValue = document.querySelector("#gameEnergyValue");
const gameSignalValue = document.querySelector("#gameSignalValue");
const gameAssetName = document.querySelector("#gameAssetName");
const gameAssetType = document.querySelector("#gameAssetType");
const gameHealthValue = document.querySelector("#gameHealthValue");
const gameShieldValue = document.querySelector("#gameShieldValue");
const gamePowerValue = document.querySelector("#gamePowerValue");
const theaterModeLabel = document.querySelector("#theaterModeLabel");
const theaterCaption = document.querySelector("#theaterCaption");
const commandLine = document.querySelector("#commandLine");
const alertFeed = document.querySelector("#alertFeed");
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

let scene;
let camera;
let renderer;
let controls;
let modelRoot;
let animationStarted = false;
let gameScene;
let gameCamera;
let gameRenderer;
let gameControls;
let gameRoot;
let gameAnimationStarted = false;
let currentMissionId = "eva";
let theaterObjects = {};

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

function updateGameScreen(missionId) {
    const mission = missions[missionId] || missions.eva;
    const scenario = gameScenarios[missionId] || gameScenarios.eva;

    gameMissionName.textContent = mission.title;
    gameMissionStatus.textContent = scenario.status;
    gameScenario.textContent = scenario.scenario;
    gameEventText.textContent = scenario.event;
    gameStormLevel.textContent = scenario.storm;
    gameFlareClass.textContent = scenario.flare;
    gameAssetName.textContent = scenario.assetName;
    gameAssetType.textContent = scenario.assetType;
    gameHealthValue.textContent = `${scenario.health}%`;
    gameShieldValue.textContent = `${scenario.shield}%`;
    gamePowerValue.textContent = `${scenario.energy}%`;
    gameEnergyValue.textContent = `${scenario.energy}%`;
    gameSignalValue.textContent = `${scenario.signal}%`;
    gameEnergyFill.style.width = `${scenario.energy}%`;
    gameSignalFill.style.width = `${scenario.signal}%`;
    theaterModeLabel.textContent = scenario.mode;
    theaterCaption.textContent = scenario.caption;
    commandLine.textContent = "> Awaiting flight director input.";
    alertFeed.innerHTML = scenario.alerts.map((alert) => `<li>${alert}</li>`).join("");

    gameRiskRows.forEach((row) => {
        const key = row.dataset.risk;
        const value = scenario.risks[key] ?? 0;
        const label = row.querySelector("strong");
        const bar = row.querySelector(".risk-track i");
        label.textContent = `${value}%`;
        bar.style.width = `${value}%`;
        row.dataset.level = value >= 70 ? "high" : value >= 45 ? "medium" : "low";
    });

    decisionCards.forEach((card) => card.classList.remove("is-selected"));
    latestLog.textContent = "Awaiting flight director decision.";
}

function showGameView() {
    currentMissionId = currentMissionId || "eva";
    gameView.removeAttribute("hidden");
    gameView.hidden = false;
    gameView.style.display = "grid";
    gameView.style.opacity = "1";
    gameView.style.transform = "translateY(0)";
    gameView.style.visibility = "visible";
    document.body.classList.add("is-playing");
    missionView.classList.remove("is-active");
    missionView.hidden = true;
    gameView.classList.add("is-active");
    resetScroll();
    updateGameScreen(currentMissionId);
    initGameTheater();
    buildGameTheaterScene(currentMissionId);
    requestAnimationFrame(resizeGameTheater);
}

function showMissionViewFromGame() {
    document.body.classList.remove("is-playing");
    missionView.hidden = false;
    missionView.classList.add("is-active");
    gameView.classList.remove("is-active");
    gameView.hidden = true;
    gameView.style.display = "";
    gameView.style.opacity = "";
    gameView.style.transform = "";
    gameView.style.visibility = "";
    resetScroll();
    resizeThreeViewer();
}

function chooseDecision(choice) {
    const outcomes = {
        safe: "Safe posture selected. Mission systems are reducing exposure and preserving crew safety.",
        comms: "Backup communication routing selected. Commands are shifting to cleaner signal windows.",
        shield: "Shield systems selected. Sensitive hardware is moving into protected operating mode.",
        hold: "Mission timeline held. Flight accepts higher short-term risk to preserve objective progress.",
    };

    decisionCards.forEach((card) => {
        card.classList.toggle("is-selected", card.dataset.choice === choice);
    });

    latestLog.textContent = outcomes[choice] || "Decision recorded.";
    commandLine.textContent = `> ${outcomes[choice] || "Decision recorded."}`;
}

function openModal(type) {
    const copy = modalCopy[type];
    if (!copy || !modal) return;
    modalKicker.textContent = copy.kicker;
    modalTitle.textContent = copy.title;
    modalText.textContent = copy.text;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("is-open"));
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
    currentMissionId = missionId;

    missionCards.forEach((card) => {
        card.classList.toggle("is-selected", card.dataset.mission === missionId);
    });

    viewerTitle.textContent = mission.title;
    viewerText.textContent = mission.text;
    viewerFrame.dataset.mission = missionId;
    buildMissionModel(missionId);

    if (document.body.classList.contains("is-playing")) {
        updateGameScreen(missionId);
        buildGameTheaterScene(missionId);
    }
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

function planetTexture(kind) {
    return makeTexture((ctx, size) => {
        const palettes = {
            earth: ["#8fd7ff", "#1c75b8", "#0c2b5f", "#020815"],
            moon: ["#f4f4ef", "#a8abb0", "#505762", "#171b24"],
            mars: ["#ffb18a", "#d35f40", "#6d2119", "#240907"],
            sun: ["#fff6b8", "#ffc247", "#ff6d2d", "#651411"],
        };
        const colors = palettes[kind] || palettes.earth;
        const gradient = ctx.createRadialGradient(size * 0.34, size * 0.25, 10, size * 0.5, size * 0.5, size * 0.68);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.38, colors[1]);
        gradient.addColorStop(0.74, colors[2]);
        gradient.addColorStop(1, colors[3]);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        if (kind === "earth") {
            ctx.fillStyle = "rgba(98, 190, 122, 0.82)";
            for (let i = 0; i < 18; i += 1) {
                ctx.beginPath();
                ctx.ellipse(Math.random() * size, Math.random() * size, 22 + Math.random() * 70, 12 + Math.random() * 38, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.fillStyle = "rgba(255, 235, 150, 0.8)";
            for (let i = 0; i < 90; i += 1) {
                ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
            }
        } else if (kind === "moon") {
            for (let i = 0; i < 44; i += 1) {
                ctx.fillStyle = `rgba(24, 28, 35, ${0.12 + Math.random() * 0.22})`;
                ctx.beginPath();
                ctx.arc(Math.random() * size, Math.random() * size, 5 + Math.random() * 22, 0, Math.PI * 2);
                ctx.fill();
            }
        } else if (kind === "mars") {
            for (let i = 0; i < 18; i += 1) {
                ctx.fillStyle = `rgba(255, 196, 128, ${0.08 + Math.random() * 0.14})`;
                ctx.beginPath();
                ctx.ellipse(Math.random() * size, Math.random() * size, 40 + Math.random() * 80, 8 + Math.random() * 18, Math.random() * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });
}

function initThreeViewer() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(3.2, 2.1, 4.8);
    renderer = new THREE.WebGLRenderer({ canvas: missionCanvas, antialias: true, alpha: true });
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
    if (modelRoot) modelRoot.position.y = Math.sin(time * 1.2) * 0.045;
    controls.update();
    renderer.render(scene, camera);
}

function clearModel() {
    while (modelRoot && modelRoot.children.length) {
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
    builders[missionId]?.(modelRoot);
    resizeThreeViewer();
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
        colors[i * 3] = 0.72 + Math.random() * 0.28;
        colors[i * 3 + 1] = 0.82 + Math.random() * 0.18;
        colors[i * 3 + 2] = 1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.022, vertexColors: true, transparent: true, opacity: 0.78 })));
}

function buildEva(group) {
    const asset = buildTheaterAsset("eva");
    asset.scale.setScalar(1.75);
    group.add(asset);
}

function buildIss(group) {
    const asset = buildTheaterAsset("iss");
    asset.scale.setScalar(1.8);
    group.add(asset);
}

function buildMoonMission(group) {
    addMesh(group, new THREE.SphereGeometry(0.86, 64, 42), new THREE.MeshStandardMaterial({ map: planetTexture("moon"), roughness: 0.85 }));
    const orbit = new THREE.Group();
    orbit.rotation.set(Math.PI / 2.2, 0.2, 0);
    group.add(orbit);
    addMesh(orbit, new THREE.TorusGeometry(1.35, 0.008, 12, 180), mat(0xcfd5dc, { transparent: true, opacity: 0.6 }));
    const capsule = buildTheaterAsset("artemis");
    capsule.position.set(-1.28, -0.16, 0);
    capsule.scale.setScalar(0.9);
    orbit.add(capsule);
}

function buildMars(group) {
    addMesh(group, new THREE.SphereGeometry(0.86, 64, 42), new THREE.MeshStandardMaterial({ map: planetTexture("mars"), roughness: 0.78 }));
    const orbit = new THREE.Group();
    orbit.rotation.set(Math.PI / 2.3, 0.1, 0.1);
    group.add(orbit);
    addMesh(orbit, new THREE.TorusGeometry(1.28, 0.007, 12, 180), mat(0xff765f, { transparent: true, opacity: 0.5 }));
    const craft = buildTheaterAsset("mars");
    craft.position.set(-1.2, -0.2, 0);
    craft.scale.setScalar(0.82);
    orbit.add(craft);
}

function buildGps(group) {
    const asset = buildTheaterAsset("gps");
    asset.scale.setScalar(1.7);
    group.add(asset);
}

function buildCubeSat(group) {
    const asset = buildTheaterAsset("cubesat");
    asset.scale.setScalar(1.85);
    group.add(asset);
}

function initGameTheater() {
    if (!gameCanvas || gameRenderer) return;
    gameScene = new THREE.Scene();
    gameCamera = new THREE.PerspectiveCamera(44, 1, 0.1, 100);
    gameCamera.position.set(0.4, 2.15, 6.4);
    gameRenderer = new THREE.WebGLRenderer({ canvas: gameCanvas, antialias: true, alpha: true });
    gameRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    gameRenderer.outputColorSpace = THREE.SRGBColorSpace;
    gameRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    gameRenderer.toneMappingExposure = 1.18;
    gameControls = new OrbitControls(gameCamera, gameRenderer.domElement);
    gameControls.enableDamping = true;
    gameControls.dampingFactor = 0.08;
    gameControls.enablePan = false;
    gameControls.minDistance = 3.8;
    gameControls.maxDistance = 9;
    gameControls.target.set(0.4, 0, 0);
    gameScene.add(new THREE.HemisphereLight(0xcfe7ff, 0x030813, 1.35));
    const sunLight = new THREE.PointLight(0xffb347, 4.2, 18);
    sunLight.position.set(-3.2, 0.5, 1.5);
    gameScene.add(sunLight);
    const rimLight = new THREE.DirectionalLight(0x70fff0, 1.6);
    rimLight.position.set(4, 3, 5);
    gameScene.add(rimLight);
    gameRoot = new THREE.Group();
    gameScene.add(gameRoot);
    addGameStars();
    resizeGameTheater();
    if (!gameAnimationStarted) {
        gameAnimationStarted = true;
        animateGameTheater();
    }
}

function resizeGameTheater() {
    if (!gameRenderer || !gameCamera || !gameCanvas) return;
    const frame = gameCanvas.parentElement;
    const width = frame.clientWidth;
    const height = frame.clientHeight;
    if (!width || !height) return;
    gameRenderer.setSize(width, height, false);
    gameCamera.aspect = width / height;
    gameCamera.updateProjectionMatrix();
}

function clearGameTheater() {
    while (gameRoot && gameRoot.children.length) {
        gameRoot.remove(gameRoot.children[0]);
    }
    theaterObjects = {};
}

function addGameStars() {
    const count = 1200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
        positions[i * 3] = (Math.random() - 0.5) * 18;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 9;
        positions[i * 3 + 2] = -3 - Math.random() * 12;
        colors[i * 3] = 0.65 + Math.random() * 0.35;
        colors[i * 3 + 1] = 0.78 + Math.random() * 0.2;
        colors[i * 3 + 2] = 1;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    gameScene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.018, vertexColors: true, transparent: true, opacity: 0.82 })));
}

function buildGameTheaterScene(missionId) {
    if (!gameRoot) return;
    clearGameTheater();

    const planetKind = missionId === "mars" ? "mars" : missionId === "artemis" ? "moon" : "earth";
    const planetColor = planetKind === "mars" ? 0xff765f : planetKind === "moon" ? 0xcfd5dc : 0x75c9ff;

    const sun = addMesh(gameRoot, new THREE.SphereGeometry(0.92, 96, 64), new THREE.MeshStandardMaterial({
        map: planetTexture("sun"),
        emissive: 0xff7b2f,
        emissiveIntensity: 1.35,
        roughness: 0.7,
    }), [-3.25, 0.05, -0.18]);

    const sunGlow = addMesh(gameRoot, new THREE.SphereGeometry(1.12, 64, 32), mat(0xff765f, {
        transparent: true,
        opacity: 0.12,
        emissive: 0xff5f6d,
        emissiveIntensity: 0.75,
    }), [-3.25, 0.05, -0.18]);

    const planet = addMesh(gameRoot, new THREE.SphereGeometry(0.92, 96, 64), new THREE.MeshStandardMaterial({
        map: planetTexture(planetKind),
        roughness: planetKind === "earth" ? 0.58 : 0.82,
        metalness: 0,
    }), [0.82, 0, 0]);

    const atmosphere = addMesh(gameRoot, new THREE.SphereGeometry(0.98, 64, 32), mat(planetColor, {
        transparent: true,
        opacity: planetKind === "earth" ? 0.14 : 0.06,
    }), [0.82, 0, 0]);

    const orbit = addMesh(gameRoot, new THREE.TorusGeometry(1.54, 0.006, 10, 220), mat(0x75c9ff, {
        transparent: true,
        opacity: 0.36,
    }), [0.82, 0, 0], [Math.PI / 2.18, 0.08, -0.12]);

    const storm = buildSolarWind();
    gameRoot.add(storm);
    const asset = buildTheaterAsset(missionId);
    gameRoot.add(asset);

    theaterObjects = {
        sun,
        sunGlow,
        planet,
        atmosphere,
        orbit,
        storm,
        asset,
        orbitData: {
            centerX: 0.82,
            radius: missionId === "artemis" || missionId === "mars" ? 1.78 : 1.54,
            depth: missionId === "gps" ? 0.88 : 0.72,
            y: missionId === "eva" ? 0.34 : 0.2,
            speed: missionId === "gps" ? 0.34 : missionId === "cubesat" ? 0.7 : 0.48,
            phase: missionId === "gps" ? 1.8 : missionId === "mars" ? 2.4 : 0.7,
        },
    };
}

function buildSolarWind() {
    const group = new THREE.Group();
    const count = 360;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
        positions[i * 3] = -2.6 + Math.random() * 3.4;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1.2;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const points = new THREE.Points(geometry, new THREE.PointsMaterial({
        color: 0xff765f,
        size: 0.03,
        transparent: true,
        opacity: 0.48,
    }));
    group.add(points);
    const wave = addMesh(group, new THREE.TorusGeometry(0.82, 0.012, 10, 120), mat(0xff765f, {
        transparent: true,
        opacity: 0.24,
        emissive: 0x66182a,
        emissiveIntensity: 0.5,
    }), [-0.9, 0, 0], [0, Math.PI / 2, 0], [1.25, 0.42, 1]);
    group.userData.wave = wave;
    return group;
}

function buildTheaterAsset(missionId) {
    const asset = new THREE.Group();

    if (missionId === "eva") {
        addMesh(asset, new THREE.CapsuleGeometry(0.11, 0.28, 16, 28), physical(0xf2f6fb, { roughness: 0.42 }), [0, -0.04, 0]);
        addMesh(asset, new THREE.SphereGeometry(0.15, 40, 28), physical(0xf2f6fb, { roughness: 0.38 }), [0, 0.22, 0]);
        addMesh(asset, new THREE.BoxGeometry(0.16, 0.07, 0.025), physical(0x050912, { roughness: 0.24, metalness: 0.35 }), [0, 0.23, 0.13]);
        addMesh(asset, new THREE.CapsuleGeometry(0.035, 0.24, 12, 18), physical(0xdce8f5), [-0.16, 0.02, 0], [0, 0, -0.55]);
        addMesh(asset, new THREE.CapsuleGeometry(0.035, 0.24, 12, 18), physical(0xdce8f5), [0.16, 0.02, 0], [0, 0, 0.55]);
        asset.scale.setScalar(0.85);
    } else if (missionId === "iss") {
        const metal = mat(0xdce8f5, { metalness: 0.35, roughness: 0.32 });
        const panel = new THREE.MeshStandardMaterial({ map: panelTexture("#14346f", "#70fff0"), roughness: 0.55, metalness: 0.05, side: THREE.DoubleSide });
        addMesh(asset, new THREE.CylinderGeometry(0.035, 0.035, 0.86, 20), metal, [0, 0, 0], [0, 0, Math.PI / 2]);
        addMesh(asset, new THREE.CylinderGeometry(0.08, 0.08, 0.3, 24), metal, [-0.18, 0, 0], [0, 0, Math.PI / 2]);
        addMesh(asset, new THREE.CylinderGeometry(0.08, 0.08, 0.34, 24), metal, [0.16, 0, 0], [0, 0, Math.PI / 2]);
        addMesh(asset, new THREE.BoxGeometry(0.62, 0.22, 0.018), panel, [-0.72, 0, 0]);
        addMesh(asset, new THREE.BoxGeometry(0.62, 0.22, 0.018), panel, [0.72, 0, 0]);
        asset.scale.setScalar(0.76);
    } else if (missionId === "artemis") {
        addMesh(asset, new THREE.ConeGeometry(0.14, 0.28, 42), mat(0xf6f7f1, { metalness: 0.12, roughness: 0.36 }), [0, 0.12, 0]);
        addMesh(asset, new THREE.CylinderGeometry(0.11, 0.15, 0.18, 42), mat(0x9ca8b6, { metalness: 0.22, roughness: 0.34 }), [0, -0.1, 0]);
        addMesh(asset, new THREE.TorusGeometry(0.14, 0.01, 8, 40), mat(0x70fff0, { transparent: true, opacity: 0.65 }), [0, 0, 0], [Math.PI / 2, 0, 0]);
        asset.scale.setScalar(0.95);
    } else if (missionId === "mars") {
        addMesh(asset, new RoundedBoxGeometry(0.22, 0.13, 0.13, 5, 0.035), mat(0xdce8f5, { metalness: 0.24, roughness: 0.34 }));
        addMesh(asset, new RoundedBoxGeometry(0.34, 0.09, 0.018, 4, 0.018), mat(0x75c9ff), [-0.3, 0, 0]);
        addMesh(asset, new RoundedBoxGeometry(0.34, 0.09, 0.018, 4, 0.018), mat(0x75c9ff), [0.3, 0, 0]);
        addMesh(asset, new THREE.ConeGeometry(0.08, 0.18, 28), mat(0xffd166), [0, -0.15, 0], [Math.PI, 0, 0]);
    } else if (missionId === "cubesat") {
        addMesh(asset, new RoundedBoxGeometry(0.24, 0.24, 0.24, 6, 0.035), mat(0xffd166, { metalness: 0.18, roughness: 0.44 }));
        addMesh(asset, new RoundedBoxGeometry(0.3, 0.14, 0.014, 4, 0.012), mat(0x70fff0), [-0.32, 0, 0]);
        addMesh(asset, new RoundedBoxGeometry(0.3, 0.14, 0.014, 4, 0.012), mat(0x70fff0), [0.32, 0, 0]);
        addMesh(asset, new THREE.CylinderGeometry(0.01, 0.01, 0.36, 12), mat(0xf4f8ff), [0, 0.32, 0], [0.3, 0, 0.2]);
    } else {
        const metal = mat(0xdbe6f2, { metalness: 0.34, roughness: 0.28 });
        const panel = new THREE.MeshStandardMaterial({ map: panelTexture("#142a68", "#8fb7ff"), roughness: 0.42, metalness: 0.12, side: THREE.DoubleSide });
        addMesh(asset, new RoundedBoxGeometry(0.26, 0.26, 0.26, 6, 0.04), metal);
        addMesh(asset, new RoundedBoxGeometry(0.58, 0.2, 0.016, 5, 0.012), panel, [-0.46, 0, 0]);
        addMesh(asset, new RoundedBoxGeometry(0.58, 0.2, 0.016, 5, 0.012), panel, [0.46, 0, 0]);
        addMesh(asset, new THREE.CylinderGeometry(0.015, 0.015, 0.48, 16), metal, [0, 0.38, 0]);
        addMesh(asset, new THREE.SphereGeometry(0.045, 20, 14), mat(0x8fb7ff), [0, 0.64, 0]);
    }

    return asset;
}

function animateGameTheater() {
    requestAnimationFrame(animateGameTheater);
    if (!gameRenderer || !gameScene || !gameCamera) return;
    const time = performance.now() * 0.001;

    if (theaterObjects.sun) theaterObjects.sun.rotation.y += 0.0016;
    if (theaterObjects.sunGlow) theaterObjects.sunGlow.scale.setScalar(1 + Math.sin(time * 2.3) * 0.035);
    if (theaterObjects.planet) theaterObjects.planet.rotation.y += 0.0022;
    if (theaterObjects.atmosphere) theaterObjects.atmosphere.rotation.y -= 0.001;
    if (theaterObjects.orbit) theaterObjects.orbit.rotation.z += 0.0008;

    if (theaterObjects.storm) {
        theaterObjects.storm.position.x = Math.sin(time * 0.9) * 0.18;
        theaterObjects.storm.rotation.z = Math.sin(time * 0.4) * 0.08;
        const wave = theaterObjects.storm.userData.wave;
        if (wave) {
            wave.scale.set(1.25 + Math.sin(time * 2.1) * 0.12, 0.42 + Math.sin(time * 1.7) * 0.05, 1);
        }
    }

    if (theaterObjects.asset && theaterObjects.orbitData) {
        const orbit = theaterObjects.orbitData;
        const angle = time * orbit.speed + orbit.phase;
        theaterObjects.asset.position.set(
            orbit.centerX + Math.cos(angle) * orbit.radius,
            Math.sin(angle * 1.3) * orbit.y,
            Math.sin(angle) * orbit.depth
        );
        theaterObjects.asset.rotation.y = -angle + Math.PI * 0.5;
        theaterObjects.asset.rotation.z = Math.sin(time * 1.4) * 0.08;
    }

    gameControls.update();
    gameRenderer.render(gameScene, gameCamera);
}

playButton.addEventListener("click", showMissionView);
backButton.addEventListener("click", showHomeView);
launchButton.addEventListener("click", showGameView);
gameBackButton.addEventListener("click", showMissionViewFromGame);
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

window.addEventListener("resize", () => {
    resizeThreeViewer();
    resizeGameTheater();
});

missionCards.forEach((card) => {
    card.addEventListener("click", () => selectMission(card.dataset.mission));
});

decisionCards.forEach((card) => {
    card.addEventListener("click", () => chooseDecision(card.dataset.choice));
});

initThreeViewer();
selectMission("eva");
