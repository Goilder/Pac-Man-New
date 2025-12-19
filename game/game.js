
let currentMode = null // "save" или "load"

let isPaused = false
function togglePause() {
    isPaused = !isPaused

    if (isPaused) {
        document.removeEventListener("keyup", movePacman)
        ghosts.forEach(ghost => clearInterval(ghost.timerId))
    } else {
        document.addEventListener("keyup", movePacman)
        ghosts.forEach(moveGhost)
    }
    
}

function restartGame() {
    localStorage.removeItem("pacmanSave")
    location.reload()
}

function promptSave() {
    currentMode = "save"
    document.getElementById("modal-title").innerText = "Сохранить в слот"
    updateSlotInfo()
    document.getElementById("save-load-modal").classList.remove("hidden")
}

function promptLoad() {
    currentMode = "load"
    document.getElementById("modal-title").innerText = "Загрузить из слота"
    updateSlotInfo()
    document.getElementById("save-load-modal").classList.remove("hidden")
}

function newGame() {
    const confirmNew = confirm("Начать новую игру? Текущий прогресс будет удалён.")
    if (confirmNew) {
        const defaultState = createDefaultGameState()
        localStorage.setItem("pacmanSave_slot1", JSON.stringify(defaultState))
        localStorage.setItem("pacmanLastSlot", 1)
        location.href = "game.html?map=" + (selectedMap || "default")
    }
}

function handleSlot(slot) {
    if (currentMode === "save") {
        saveGameState(slot)
    } else if (currentMode === "load") {
        loadGameState(slot)
    }
    closeModal()
}

function closeModal() {
    document.getElementById("save-load-modal").classList.add("hidden")
    currentMode = null
}

function resetSlot() {
    const slot = prompt("Введите номер слота для сброса (1–3):", "1")
    if (slot && slot >= 1 && slot <= 3) {
        localStorage.removeItem(`pacmanSave_slot${slot}`)
        if (localStorage.getItem("pacmanLastSlot") == slot) {
        localStorage.removeItem("pacmanLastSlot")
        }
        alert(`Слот ${slot} сброшен`)
        updateSlotInfo()
    }
}

function goBack(){
    // localStorage.setItem("pacmanSave_slot1", defaultState)
    // localStorage.setItem("pacmanLastSlot", 1)
    window.location.href = '/index.html';
}

window.togglePause = togglePause;
window.restartGame = restartGame;
window.promptSave = promptSave;
window.promptLoad = promptLoad;
window.handleSlot = handleSlot;
window.closeModal = closeModal;
window.resetSlot = resetSlot;
window.newGame = newGame;
window.goBack = goBack;