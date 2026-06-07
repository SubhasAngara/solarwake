const missions = {
    eva: {
        title: "Astronaut EVA",
        text: "Spacewalks are beautiful and risky. Rotate the EVA preview and plan around radiation exposure, comms, and suit limits.",
        model: "model-eva",
    },
    iss: {
        title: "ISS Orbit",
        text: "Keep the station stable while geomagnetic storms threaten communications, power systems, and crew timelines.",
        model: "model-iss",
    },
    artemis: {
        title: "Artemis Capsule",
        text: "Protect a crew capsule outside Earth's magnetic shield during a lunar transit window.",
        model: "model-artemis",
    },
    mars: {
        title: "Mars Transfer",
        text: "Balance radiation exposure, power, and delayed communications on a long-duration spacecraft.",
        model: "model-mars",
    },
    gps: {
        title: "GPS Satellite",
        text: "Inspect a navigation satellite and watch how solar activity can disturb signal reliability.",
        model: "model-gps",
    },
    cubesat: {
        title: "CubeSat",
        text: "Keep a small spacecraft alive with limited shielding, limited power, and very little room for mistakes.",
        model: "model-cubesat",
    },
};

const homeView = document.querySelector(".home-view");
const missionView = document.querySelector("#missionView");
const playButton = document.querySelector("#playButton");
const backButton = document.querySelector("#backButton");
const tutorialButton = document.querySelector("#tutorialButton");
const aboutButton = document.querySelector("#aboutButton");
const missionCards = [...document.querySelectorAll(".mission-card")];
const viewerTitle = document.querySelector("#viewerTitle");
const viewerText = document.querySelector("#viewerText");
const missionModel = document.querySelector("#missionModel");
const viewerFrame = document.querySelector("#viewerFrame");
const modal = document.querySelector("#infoModal");
const modalClose = document.querySelector("#modalClose");
const modalKicker = document.querySelector("#modalKicker");
const modalTitle = document.querySelector("#modalTitle");
const modalText = document.querySelector("#modalText");

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

function resetScroll() {
    window.scrollTo({ top: 0, left: 0 });
}

function showMissionView() {
    homeView.classList.remove("is-active");

    setTimeout(() => {
        homeView.hidden = true;
        missionView.hidden = false;
        resetScroll();
        requestAnimationFrame(() => missionView.classList.add("is-active"));
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
    missionModel.className = `mission-model ${mission.model}`;
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

missionCards.forEach((card) => {
    card.addEventListener("click", () => selectMission(card.dataset.mission));
});

let isDragging = false;
let startX = 0;
let startY = 0;
let rotateX = -14;
let rotateY = 24;

function setRotation() {
    viewerFrame.style.setProperty("--rx", `${rotateX}deg`);
    viewerFrame.style.setProperty("--ry", `${rotateY}deg`);
}

viewerFrame.addEventListener("pointerdown", (event) => {
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    viewerFrame.setPointerCapture(event.pointerId);
});

viewerFrame.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    startX = event.clientX;
    startY = event.clientY;

    rotateY += deltaX * 0.35;
    rotateX = Math.max(-58, Math.min(38, rotateX - deltaY * 0.25));
    setRotation();
});

viewerFrame.addEventListener("pointerup", (event) => {
    isDragging = false;
    viewerFrame.releasePointerCapture(event.pointerId);
});

viewerFrame.addEventListener("pointercancel", () => {
    isDragging = false;
});

selectMission("eva");