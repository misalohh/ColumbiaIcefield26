import * as THREE from "three";

import { createIcosahedron } from "./mesh.js";
import { createHemiLight } from "./lights.js";
import { createStars } from "./stars.js";
import { createControls } from "./controls.js";
import { calculateIcePercent } from "./climateModel.js";

let climateData = [];

async function loadClimateData() {
  const response = await fetch("/temp.csv");
  const text = await response.text();
  const rows = text.trim().split("\n");

  climateData = rows.slice(1).map(row => {
    const values = row.split(",");

    return {
      year: Number(values[0]),
      rcp2_6: Number(values[1]),
      rcp4_5: Number(values[2]),
      rcp8_5: Number(values[3])
    };
  });

  console.log(climateData);
  setupSlider();
}

const width = window.innerWidth;
const height = window.innerHeight;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const fov = 75;
const aspect = width / height;
const near = 0.1;
const far = 10;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x526482);
scene.fog = new THREE.Fog(0x526482, 1, 13);

const controls = createControls(camera, renderer.domElement);

const { mesh, wireMesh } = createIcosahedron();
scene.add(mesh);
scene.add(wireMesh);
scene.add(createHemiLight());
scene.add(createStars());

const slider = document.getElementById("scaleSlider");
const yearCounter = document.getElementById("yearCounter");
const percentRemaining = document.getElementById("percentRemaining");
const scenarioSlider = document.getElementById("scenarioSlider");

const step = parseFloat(slider.step);      
const minVal = parseFloat(slider.min);
const maxVal = parseFloat(slider.max);
const startValue = parseFloat(slider.value); 
const startYear = 2026;

let currentYear = 2026;
let currentScenario = "rcp4_5"; 

scenarioSlider.addEventListener("input", () => {
  if (scenarioSlider.value == 0) {
    currentScenario = "rcp2_6";
  } else if (scenarioSlider.value == 1) {
    currentScenario = "rcp4_5";
  } else if (scenarioSlider.value == 2) {
    currentScenario = "rcp8_5";
  }
  updateIce(currentYear);
});

let targetScale = 1;
let currentScale = 1;

function updateIce(year) {
    const icePercent = calculateIcePercent(climateData, currentScenario, year);
    const scale = Math.cbrt(icePercent / 100); //cube root to scale as V ∝ linear dimension
    targetScale = scale;

    yearCounter.textContent = year;
    if (icePercent.toFixed(0) == 100){
        percentRemaining.textContent = icePercent.toFixed(0) + "%";
    }
    else{
        percentRemaining.textContent = icePercent.toFixed(1) + "%";
    }
    
    console.log(
        "Year:", year,
        "Ice remaining:", icePercent.toFixed(2) + "%"
    );
}

function setupSlider() {
    slider.addEventListener("input", () => {

        const value = parseFloat(slider.value);
        const stepsMoved = Math.round((startValue - value) / step);
        currentYear = startYear - stepsMoved;

        updateIce(currentYear);
    });

    updateIce(2026);
}


function animate() {
  requestAnimationFrame(animate);
  controls.update();

  currentScale += (targetScale - currentScale) * 0.1;
  mesh.scale.setScalar(currentScale);

  renderer.render(scene, camera);
}
animate();

loadClimateData();