const character = document.querySelector(".character")
const obstacles = document.querySelector(".obstacles")
const scoreText = document.querySelector(".score")
let score = 0;
let isStarted = false;
const jumpSound = new Audio('sound.wav')

function jump() {
    jumpSound.play()
    if (character.classList !== "jump") {
        clearTimeout()
        character.classList.add("jump");
        setTimeout(() => {
            character.classList.remove("jump");
        }, 700);
    }
}

const body = document.querySelector("body")
body.addEventListener("keypress", function (event) {
    if (event.code === "Space") {
        jump()
    } else {
        console.log(event)
    }
});


function startMoving() {
    if (obstacles.classList !== "move") {
        obstacles.classList.add("move")
    }
}

function start() {
    if (!isStarted) {
        isStarted = true;
        startMoving();
        checkDead();
        scoreCounter()
    }
}

function scoreCounter() {
    if (!isStarted) {
        return;
    }
    score++;
    scoreText.innerHTML = "Score: " + Math.round(score / 20)
    requestAnimationFrame(scoreCounter)
}

function checkDead() {
    let characterTopPosition = parseInt(window.getComputedStyle(character).getPropertyValue("top"))

    let obstaclesLeftPosition = parseInt(window.getComputedStyle(obstacles).getPropertyValue("left"))

    if (obstaclesLeftPosition <= 60 && obstaclesLeftPosition >= 20 && characterTopPosition >= 60) {
        isStarted = false;
        obstacles.classList.remove("move")
        swal("Game over", `Score: ${Math.round(score / 20)}`, "info")
        score = 0;
    }
    requestAnimationFrame(checkDead)
}