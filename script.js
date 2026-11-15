// ---------- Starfield ----------
(function stars() {
  const c = document.getElementById("stars"), x = c.getContext("2d");
  function draw() {
    c.width = innerWidth; c.height = innerHeight;
    x.fillStyle = "#fff";
    for (let i = 0; i < 220; i++) {
      x.globalAlpha = Math.random();
      x.fillRect(Math.random() * c.width, Math.random() * c.height, Math.random() * 1.6 + .3, Math.random() * 1.6 + .3);
    }
  }
  draw(); addEventListener("resize", draw);
})();

// ---------- State ----------
let OBJECTS = [], map, markers = [], planet = "Moon", currentObj = null;
const $ = id => document.getElementById(id);

// Map base layers (NASA Solar System Treks)
const TREK = {
  Moon: "https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/{z}/{y}/{x}.jpg",
  Mars: "https://trek.nasa.gov/tiles/Mars/EQ/Mars_Viking_MDIM21_ClrMosaic_global_232m/1.0.0/default/default028mm/{z}/{y}/{x}.jpg"
};
const VIEW = { Moon: [10, 15, 2], Mars: [18, 77, 3] };
let baseLayer;

// ---------- Load data (JSON first, embedded fallback for file://) ----------
async function loadData() {
  try {
    const r = await fetch("data/objects.json");
    if (!r.ok) throw new Error(r.status);
    return await r.json();
  } catch (e) {
    if (window.OBJECTS_FALLBACK) return window.OBJECTS_FALLBACK;
    throw e;
  }
}

// ---------- Map ----------
function initMap() {
  map = L.map("map", { crs: L.CRS.EPSG4326, minZoom: 0, maxZoom: 7, worldCopyJump: true });
  setPlanet("Moon");
}

function setPlanet(p) {
  planet = p;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.planet === p));
  if (baseLayer) map.removeLayer(baseLayer);
  baseLayer = L.tileLayer(TREK[p], {
    maxNativeZoom: 7, noWrap: false,
    attribution: "NASA/JPL Solar System Treks · " + (p === "Moon" ? "LRO WAC" : "Viking MDIM")
  }).addTo(map);
  map.setView([VIEW[p][0], VIEW[p][1]], VIEW[p][2]);
  markers.forEach(m => map.removeLayer(m));
  markers = OBJECTS.filter(o => o.planet === p).map(o => {
    const approx = /approx/i.test(o.confidence);
    const m = L.circleMarker([o.lat, o.lng], {
      radius: 9, color: approx ? "#ffd08a" : "#ff8a3d", fillColor: approx ? "#ffd08a" : "#ff8a3d", fillOpacity: .6
    }).addTo(map);
    m.bindTooltip(o.name + (approx ? " (approx.)" : ""));
    m.on("click", () => openStory(o));
    return m;
  });
}

// ---------- Cards ----------
function renderCards() {
  const q = $("search").value.toLowerCase();
  const list = OBJECTS.filter(o => !q || [o.name, o.mission, o.location, o.type, o.planet].join(" ").toLowerCase().includes(q));
  $("cards").innerHTML = list.length ? list.map(o => `
    <div class="card" data-id="${o.id}">
      <div class="tag">${o.planet} · ${o.year}</div>
      <h3>${o.name}</h3>
      <p>${o.type} — ${o.status}</p>
    </div>`).join("") : "<p>No objects match your search.</p>";
  document.querySelectorAll(".card").forEach(c => c.onclick = () => openStory(OBJECTS.find(o => o.id == c.dataset.id)));
}

// ---------- Timeline ----------
function renderTimeline() {
  $("timeline-list").innerHTML = [...OBJECTS].sort((a, b) => a.year - b.year).map(o => `
    <li data-id="${o.id}"><b>${o.year}</b> · ${o.mission}<br><span>${o.name}</span></li>`).join("");
  document.querySelectorAll("#timeline-list li").forEach(li => li.onclick = () => openStory(OBJECTS.find(o => o.id == li.dataset.id)));
}

// ---------- NASA image ----------
async function loadImage(o) {
  const img = $("p-img"); img.removeAttribute("src"); $("p-credit").textContent = "";
  try {
    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(o.query)}&media_type=image`;
    const r = await fetch(url);
    const data = await r.json();
    const item = data.collection.items.find(i => i.links && i.links[0]);
    if (!item || currentObj !== o) return;
    img.src = item.links[0].href;
    img.alt = item.data[0].title;
    $("p-credit").textContent = "NASA Image and Video Library: " + item.data[0].title;
  } catch (e) {
    console.error("NASA image search failed:", e);
    $("p-credit").textContent = "Image unavailable right now (NASA image service could not be reached).";
  }
}

// ---------- Story panel ----------
function openStory(o) {
  currentObj = o;
  speechSynthesis.cancel(); $("narrate").textContent = "▶ Play narration";
  $("p-name").textContent = o.name;
  $("p-meta").textContent = `${o.planet} · ${o.mission} · ${o.year} · ${o.location} · ${o.status}`;
  $("p-conf").textContent = "Location: " + o.confidence;
  $("p-c1").textContent = o.beginning;
  $("p-c2").textContent = o.mission_story;
  $("p-c3").textContent = o.legacy;
  $("p-sci").textContent = o.scientific_value;
  $("panel").classList.remove("hidden");
  loadImage(o);
}

$("close").onclick = () => { $("panel").classList.add("hidden"); speechSynthesis.cancel(); };
$("narrate").onclick = () => {
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); $("narrate").textContent = "▶ Play narration"; return; }
  const o = currentObj;
  const u = new SpeechSynthesisUtterance(`${o.name}. ${o.beginning} ${o.mission_story} ${o.legacy}`);
  u.rate = .95; u.onend = () => $("narrate").textContent = "▶ Play narration";
  speechSynthesis.speak(u); $("narrate").textContent = "■ Stop narration";
};

// ---------- Init ----------
document.querySelectorAll(".tab").forEach(t => t.onclick = () => setPlanet(t.dataset.planet));
$("search").oninput = renderCards;

loadData().then(d => {
  OBJECTS = d;
  initMap(); renderCards(); renderTimeline();
}).catch(e => {
  console.error(e);
  $("cards").innerHTML = "<p>Could not load data/objects.json. Open this site with a local server (VS Code Live Server, or run: python -m http.server).</p>";
});
