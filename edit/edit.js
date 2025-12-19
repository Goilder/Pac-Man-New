const size = 28;
const grid = document.getElementById("map");
const tileType = document.getElementById("tileType");
let layout = Array(size * size).fill(0); // по дефорту все пустое


function saveMap() {
  document.getElementById("output").value = JSON.stringify(layout);
}

function generate() {
  layout = generateRandomMap(size);
  drawGrid();
}

function exportAsJSON() {
  const content = JSON.stringify(layout, null, 2);
  downloadFile(content, "map.json", "application/json");
}