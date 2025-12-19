function saveLastMap(map){
  localStorage.setItem('map_name', map)
}

function startNewGame() {
  console.log('window.location.href');
  window.location.href = "./game/game.html?map=default";
  // window.location.href = "asdasd.html";
}

function openSettings() {
  // alert("Настройки пока не доступны.");
  window.location.href = `./edit/edit.html`;

}

function selectMap() {
  const selectedMap = prompt("Введите имя карты (например: map1, map2, test):", "map2");
  if (selectedMap) {
    saveLastMap(selectedMap);
    window.location.href = `./game/game.html?map=${encodeURIComponent(selectedMap)}`;
  }
}