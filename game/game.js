import {maps}  from '../maps/map.js';

    let currentMode = null // "save" или "load"
    let isPaused = false // ствтус игры Stop \ Play
    const urlParams = new URLSearchParams(window.location.search);
    const selectedMap = urlParams.get("map") || "default";
    console.log("Выбранная карта:", selectedMap);

    switch (selectedMap) {
        case "map1":
            layout = maps.map_1; // карта 1
            break;
        case "map2":
            layout = maps.map_2; // карта 2
            break;
        case "map3":
            layout = maps.map_3; // карта 3
            break;
        case "test":
            layout = maps.test; // тестовая
            break;
        default:
            layout = maps.map_default; // дефолтная карта
    }

    class Ghost {
        constructor(className, startIndex, speed) {
            this.className = className
            this.startIndex = startIndex
            this.speed = speed
            this.currentIndex = startIndex
            this.isScared = false
            this.timerId = NaN

        }
    }

    const ghosts = [
        new Ghost("blinky", 348, 250),
        new Ghost("pinky", 376, 400),
        new Ghost("inky", 351, 300),
        new Ghost("clyde", 379, 500),
    ]

    function createDefaultGameState() {
        const ghostStates = [
            { className: "blinky", currentIndex: 348, isScared: false },
            { className: "pinky", currentIndex: 376, isScared: false },
            { className: "inky", currentIndex: 351, isScared: false },
            { className: "clyde", currentIndex: 379, isScared: false }
        ]

        const initialPacmanIndex = 490
        const initialScore = 0

        const gridState = layout.map((cell, i) => {
            const classes = []
            if (cell === 0) classes.push("pac-dot")
            if (cell === 1) classes.push("wall")
            if (cell === 2) classes.push("ghost-lair")
            if (cell === 3) classes.push("power-pellet")
            return { classes }
        })

        gridState[initialPacmanIndex].classes.push("pac-man")
        ghostStates.forEach(g => {
            gridState[g.currentIndex].classes.push(g.className, "ghost")
        })

        return {
            pacmanIndex: initialPacmanIndex,
            score: initialScore,
            selectedMap: selectedMap || "default",
            ghosts: ghostStates,
            grid: gridState,
            timestamp: Date.now()
        }
    }


    function saveGameState(slot = 1) {
        const ghostStates = ghosts.map(g => ({
            className: g.className,
            currentIndex: g.currentIndex,
            isScared: g.isScared
        }))

          const gridState = squares.map(sq => {
            return { classes: Array.from(sq.classList) }
        })

        const state = {
            pacmanIndex: pacmanCurrentIndex,
            score: score,
            selectedMap: selectedMap || "default",
            ghosts: ghostStates,
            grid: gridState,
            timestamp: Date.now()
        }

        localStorage.setItem(`pacmanSave_slot${slot}`, JSON.stringify(state))
        localStorage.setItem("pacmanLastSlot", slot)
        alert(`Сохранено в слот ${slot}`)
    }


    function loadGameState(slot = 1) {
        const saved = JSON.parse(localStorage.getItem(`pacmanSave_slot${slot}`))
        if (!saved) {
            alert("Нет сохранения в выбранном слоте.")
            return
        }

        pacmanCurrentIndex = saved.pacmanIndex
        score = saved.score
        scoreDisplay.innerHTML = score

        if (saved.ghosts && Array.isArray(saved.ghosts)) {
            saved.ghosts.forEach((g, i) => {
                if (g.currentIndex != null && squares[g.currentIndex]) {
                squares[g.currentIndex].classList.remove(g.className, "ghost", "scared-ghost");
                }

                ghosts[i].currentIndex = g.currentIndex;
                ghosts[i].isScared = g.isScared;

                if (squares[g.currentIndex]) {
                squares[g.currentIndex].classList.add(g.className, "ghost");
                if (g.isScared) {
                    squares[g.currentIndex].classList.add("scared-ghost");
                }
                }
            });
        }


        if (saved.grid && Array.isArray(saved.grid)) {
            squares.forEach(sq => sq.className = "");

            saved.grid.forEach((cell, index) => {
                if (squares[index] && cell && Array.isArray(cell.classes)) {
                    cell.classes.forEach(cls => {
                        if (cls) {
                            squares[index].classList.add(cls);
                        }
                    });
                }
            });
        } else {
            console.warn("Старое сохранение не содержит данных сетки. Используется стандартная загрузка.");
        }

    }

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

    function createBoard() {
        for (let i = 0; i < layout.length; i++) {
            const square = document.createElement("div")
            square.id = i
            grid.appendChild(square)
            squares.push(square)

            //add layout to the board
            if (layout[i] === 0) {
                squares[i].classList.add("pac-dot")
            }
            if (layout[i] === 1) {
                squares[i].classList.add("wall")
            }
            if (layout[i] === 2) {
                squares[i].classList.add("ghost-lair")
            }
            if (layout[i] === 3) {
                squares[i].classList.add("power-pellet")
            }
        }
    }
    createBoard()

    const lastSlot = localStorage.getItem("pacmanLastSlot");
    if (lastSlot) {
        loadGameState(lastSlot);
    } else {
        squares[pacmanCurrentIndex].classList.add("pac-man");
    }

        function movePacman(e) {
        squares[pacmanCurrentIndex].classList.remove("pac-man")
        // switch (e.keyCode) { deprecated
        switch (e.key) {
            // case 37:
            case "ArrowLeft":
                if (
                    pacmanCurrentIndex % width !== 0 &&
                    !squares[pacmanCurrentIndex - 1].classList.contains("wall") &&
                    !squares[pacmanCurrentIndex - 1].classList.contains("ghost-lair")
                ) {
                    pacmanCurrentIndex -= 1
                }
                if ((pacmanCurrentIndex - 1) === 363) {
                    pacmanCurrentIndex = 391
                }
                break
            case "ArrowUp":
                // case 38:
                if (
                    pacmanCurrentIndex - width >= 0 &&
                    !squares[pacmanCurrentIndex - width].classList.contains("wall") &&
                    !squares[pacmanCurrentIndex - width].classList.contains("ghost-lair")

                ) {
                    pacmanCurrentIndex -= width
                }
                break
            case "ArrowRight":
                // case 39:
                if (
                    pacmanCurrentIndex % width < width - 1 &&
                    !squares[pacmanCurrentIndex + 1].classList.contains("wall") &&
                    !squares[pacmanCurrentIndex + 1].classList.contains("ghost-lair")
                ) {
                    pacmanCurrentIndex += 1
                }
                if (
                    (pacmanCurrentIndex + 1) === 392
                ) {
                    pacmanCurrentIndex = 364
                }
                break
            case "ArrowDown":
                // case 40:
                if (
                    pacmanCurrentIndex + width < width * width &&
                    !squares[pacmanCurrentIndex + width].classList.contains("wall") &&
                    !squares[pacmanCurrentIndex + width].classList.contains("ghost-lair")
                ) {
                    pacmanCurrentIndex += width
                }
                break
        }
        squares[pacmanCurrentIndex].classList.add("pac-man")
        pacDotEaten()
        powerPelletEaten()
        checkForGameOver()
        checkForWin()
        // saveGameState()
    }
    
    document.addEventListener("keyup", movePacman)
    
    function pacDotEaten() {
        if (squares[pacmanCurrentIndex].classList.contains("pac-dot")) {
            score++
            scoreDisplay.innerHTML = score
            squares[pacmanCurrentIndex].classList.remove("pac-dot")
        }
    }

    function powerPelletEaten() {
        if (squares[pacmanCurrentIndex].classList.contains("power-pellet")) {
            score += 10
            scoreDisplay.innerHTML = score
            ghosts.forEach(ghost => ghost.isScared = true)
            setTimeout(unScareGhosts, 10000)
            squares[pacmanCurrentIndex].classList.remove("power-pellet")
        }
    }

    function unScareGhosts() {
        ghosts.forEach(ghost => ghost.isScared = false)
    }

    ghosts.forEach(ghost => squares[ghost.currentIndex].classList.add(ghost.className, "ghost"))

        ghosts.forEach(ghost => moveGhost(ghost))

    function moveGhost(ghost) {
        const directions = [-1, 1, width, -width]
        let direction = directions[Math.floor(Math.random() * directions.length)]

        ghost.timerId = setInterval(function () {
            //if next square your ghost is going to go to does not have a ghost and does not have a wall
            if (
                !squares[ghost.currentIndex + direction].classList.contains("ghost") &&
                !squares[ghost.currentIndex + direction].classList.contains("wall")
            ) {
                squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost")
                ghost.currentIndex += direction
                squares[ghost.currentIndex].classList.add(ghost.className, "ghost")
                // else find a new random direction to go in
            } else direction = directions[Math.floor(Math.random() * directions.length)]
            // if the ghost is currently scared
            if (ghost.isScared) {
                squares[ghost.currentIndex].classList.add("scared-ghost")
            }

            //if the ghost is currently scared and pacman is on it
            if (ghost.isScared && squares[ghost.currentIndex].classList.contains("pac-man")) {
                ghost.isScared = false
                squares[ghost.currentIndex].classList.remove(ghost.className, "ghost", "scared-ghost")
                ghost.currentIndex = ghost.startIndex
                score += 100
                scoreDisplay.innerHTML = score
                squares[ghost.currentIndex].classList.add(ghost.className, "ghost")
            }
            checkForGameOver()
        }, ghost.speed)
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