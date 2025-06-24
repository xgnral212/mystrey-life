const heistTimers = {};
const activeHeists = {};
let currentSelected = null;
let currentConnections = [];
let currentHeistType = '';
let currentPuzzleSolution = [];

let playerMoney = 0;
const MONEY_ELEMENT = document.getElementById('player-money');

function updateMoneyDisplay() {
    if (MONEY_ELEMENT) {
        MONEY_ELEMENT.textContent = `${playerMoney}$`;
    }
}

function simulateOtherHeists() {
    const heists = ['bank', 'casino', 'jewelry', 'grocery', 'federal', 'port'];
    setInterval(() => {
        const randomHeist = heists[Math.floor(Math.random() * heists.length)];
        if (Math.random() < 0.3 && !activeHeists[randomHeist]) {
            const duration = Math.floor(Math.random() * 10) + 5;
            activeHeists[randomHeist] = true;
            updateHeistStatus(randomHeist, `Someone else is currently robbing. Wait ${duration} seconds.`);
            disableHeistButtons(randomHeist);
            setTimeout(() => {
                delete activeHeists[randomHeist];
                updateHeistStatus(randomHeist, '');
                enableHeistButtons(randomHeist);
            }, duration * 1000);
        }
    }, 7000);
}

function disableHeistButtons(heistId) {
    const buttons = document.querySelectorAll(`.start-heist-btn[onclick*="startHeist('${heistId}')"]`);
    buttons.forEach(btn => btn.disabled = true);
}

function enableHeistButtons(heistId) {
    const buttons = document.querySelectorAll(`.start-heist-btn[onclick*="startHeist('${heistId}')"]`);
    buttons.forEach(btn => btn.disabled = false);
}

function updateHeistStatus(heistId, message) {
    document.getElementById(`${heistId}-status-message`).textContent = message;
}

function startHeist(heistType) {
    if (activeHeists[heistType]) {
        updateHeistStatus(heistType, 'You cannot start the heist now, someone else is doing it. Wait until they finish.');
        return;
    }

    activeHeists[heistType] = true;
    disableHeistButtons(heistType);
    updateHeistStatus(heistType, 'Heist started! Complete the puzzle...');

    currentHeistType = heistType;

    const puzzleArea = document.getElementById(`${heistType}-puzzle-area`);
    puzzleArea.style.display = 'block';
    puzzleArea.innerHTML = '';
    
    const resultMessage = document.getElementById(`${heistType}-result-message`);
    resultMessage.textContent = '';

    const puzzleTypes = ['connection', 'sequence'];
    const randomPuzzleType = puzzleTypes[Math.floor(Math.random() * puzzleTypes.length)];

    if (randomPuzzleType === 'connection') {
        generateConnectionPuzzle(heistType, puzzleArea);
    } else if (randomPuzzleType === 'sequence') {
        generateSequencePuzzle(heistType, puzzleArea);
    }
}

// --- Connection Puzzles ---
function generateConnectionPuzzle(heistType, puzzleArea) {
    const puzzleData = getRandomConnectionPuzzlePairs();
    currentPuzzleSolution = puzzleData.solution;
    
    puzzleArea.innerHTML = `<h3>Connect the matching items:</h3>
                            <div class="connection-puzzle-grid">
                                <div class="connection-column left-column" id="${heistType}-left-column"></div>
                                <div class="connection-column right-column" id="${heistType}-right-column"></div>
                            </div>
                            <div class="connection-line-container" id="${heistType}-line-container">
                                <canvas class="puzzle-canvas" id="${heistType}-canvas"></canvas>
                            </div>
                            <button class="check-btn" onclick="checkPuzzle('${heistType}')">Check Connections</button>`;

    const leftColumn = document.getElementById(`${heistType}-left-column`);
    const rightColumn = document.getElementById(`${heistType}-right-column`);
    const canvas = document.getElementById(`${heistType}-canvas`);

    const leftItems = shuffleArray(puzzleData.left);
    const rightItems = shuffleArray(puzzleData.right);

    const colors = ['color-1', 'color-2', 'color-3', 'color-4', 'color-5', 'color-6'];
    let colorIndex = 0;

    leftItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('connection-item');
        div.textContent = item.text;
        div.dataset.id = item.id;
        div.dataset.column = 'left';
        div.id = `item-${heistType}-left-${index}`;
        div.classList.add(colors[colorIndex % colors.length]);
        colorIndex++;

        div.addEventListener('click', () => handleConnectionClick(heistType, div));
        leftColumn.appendChild(div);
    });

    colorIndex = 0; // Reset color index for the right column
    rightItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.classList.add('connection-item');
        div.textContent = item.text;
        div.dataset.id = item.id;
        div.dataset.column = 'right';
        div.id = `item-${heistType}-right-${index}`;
        div.classList.add(colors[colorIndex % colors.length]);
        colorIndex++;

        div.addEventListener('click', () => handleConnectionClick(heistType, div));
        rightColumn.appendChild(div);
    });

    currentSelected = null;
    currentConnections = [];
    resizeCanvas(canvas, leftColumn, rightColumn);
    redrawAllLines(heistType);

    const handleResize = () => {
        document.querySelectorAll('.puzzle-canvas').forEach(canvasEl => {
            const heistId = canvasEl.id.replace('-canvas', '');
            const lc = document.getElementById(`${heistId}-left-column`);
            const rc = document.getElementById(`${heistId}-right-column`);
            if (lc && rc) resizeCanvas(canvasEl, lc, rc);
        });
        if(currentHeistType && document.getElementById(`${currentHeistType}-canvas`)){
             redrawAllLines(currentHeistType);
        }
    };
    window.removeEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
}

function getRandomConnectionPuzzlePairs() {
    const puzzleLevels = [
        {
            left: [{id: 'A', text: 'Red Wire'}, {id: 'B', text: 'Blue Wire'}, {id: 'C', text: 'Green Wire'}],
            right: [{id: 'A', text: 'Red Port'}, {id: 'B', text: 'Blue Port'}, {id: 'C', text: 'Green Port'}],
            solution: [['A', 'A'], ['B', 'B'], ['C', 'C']]
        },
        {
            left: [{id: 'X', text: 'Key X'}, {id: 'Y', text: 'Key Y'}, {id: 'Z', text: 'Key Z'}, {id: 'W', text: 'Key W'}],
            right: [{id: 'X', text: 'Lock X'}, {id: 'Y', text: 'Lock Y'}, {id: 'Z', text: 'Lock Z'}, {id: 'W', text: 'Lock W'}],
            solution: [['X', 'X'], ['Y', 'Y'], ['Z', 'Z'], ['W', 'W']]
        },
        {
            left: [{id: '1', text: 'Code 1'}, {id: '2', text: 'Code 2'}, {id: '3', text: 'Code 3'}, {id: '4', text: 'Code 4'}],
            right: [{id: '1', text: 'Match One'}, {id: '2', text: 'Match Two'}, {id: '3', text: 'Match Three'}, {id: '4', text: 'Match Four'}],
            solution: [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']]
        }
    ];
    return puzzleLevels[Math.floor(Math.random() * puzzleLevels.length)];
}

function handleConnectionClick(heistType, clickedElement) {
    const canvas = document.getElementById(`${heistType}-canvas`);
    const ctx = canvas.getContext('2d');

    if (currentSelected === clickedElement) {
        currentSelected.classList.remove('selected');
        currentSelected = null;
        return;
    }

    if (currentSelected && currentSelected.dataset.column !== clickedElement.dataset.column) {
        const item1 = currentSelected;
        const item2 = clickedElement;

        const isDuplicate = currentConnections.some(conn =>
            (conn.item1.id === item1.id && conn.item2.id === item2.id) ||
            (conn.item1.id === item2.id && conn.item2.id === item1.id)
        );

        if (!isDuplicate) {
            currentConnections.push({ item1: item1, item2: item2 });
            drawConnectionLine(ctx, item1, item2, canvas);
        }
        item1.classList.remove('selected');
        currentSelected = null;
    } else {
        clickedElement.classList.add('selected');
        currentSelected = clickedElement;
    }
}

function drawConnectionLine(ctx, item1, item2, canvas) {
    const rect1 = item1.getBoundingClientRect();
    const rect2 = item2.getBoundingClientRect();
    const puzzleRect = canvas.getBoundingClientRect();

    const startX = (rect1.right - puzzleRect.left);
    const startY = (rect1.top + rect1.height / 2) - puzzleRect.top;
    const endX = (rect2.left - puzzleRect.left);
    const endY = (rect2.top + rect2.height / 2) - puzzleRect.top;

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
}

function redrawAllLines(heistType) {
    const canvas = document.getElementById(`${heistType}-canvas`);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    currentConnections.forEach(conn => {
        drawConnectionLine(ctx, conn.item1, conn.item2, canvas);
    });
}

function resizeCanvas(canvas, leftColumn, rightColumn) {
    const container = leftColumn.parentElement.parentElement;
    const containerRect = container.getBoundingClientRect();
    
    const totalHeight = Math.max(leftColumn.offsetHeight, rightColumn.offsetHeight) + 20;
    canvas.width = containerRect.width;
    canvas.height = totalHeight;

    redrawAllLines(canvas.id.replace('-canvas', ''));
}


// --- Sequence Puzzles ---
function generateSequencePuzzle(heistType, puzzleArea) {
    const puzzleData = getRandomSequencePuzzle();
    currentPuzzleSolution = puzzleData.solution;

    let puzzleHTML = `<h3>Complete the sequence in the correct order:</h3>
                      <p style="font-size: 1.2em; color: #FFD700; font-weight: bold;">Sequence: ${puzzleData.sequence.join(', ')}</p>
                      <div class="sequence-inputs" style="display: flex; justify-content: center; gap: 10px; margin-top: 20px;">`;

    for (let i = 0; i < puzzleData.solution.length; i++) {
        puzzleHTML += `<input type="number" class="sequence-input" placeholder="Number ${i + 1}">`;
    }
    puzzleHTML += `</div>
                   <button class="check-btn" onclick="checkPuzzle('${heistType}')">Check Sequence</button>`;
    puzzleArea.innerHTML = puzzleHTML;
}

function getRandomSequencePuzzle() {
    const puzzles = [
        { // Easy: Even numbers
            sequence: [2, 4, 6, 8],
            solution: [10, 12]
        },
        { // Medium: Fibonacci sequence
            sequence: [0, 1, 1, 2, 3],
            solution: [5, 8]
        },
        { // Medium: Odd numbers
            sequence: [1, 3, 5, 7],
            solution: [9, 11, 13]
        },
        { // Medium: Multiples of a number
            sequence: [3, 6, 9, 12],
            solution: [15, 18]
        },
        { // Easy: Simple increment
            sequence: [10, 20, 30],
            solution: [40, 50]
        },
        { // Medium: Constant subtraction
            sequence: [50, 45, 40],
            solution: [35, 30]
        }
    ];
    return puzzles[Math.floor(Math.random() * puzzles.length)];
}

// --- Unified Puzzle Check Function ---
function checkPuzzle(heistType) {
    const resultMessage = document.getElementById(`${heistType}-result-message`);
    let isCorrect = false;

    // Check Connection Puzzle
    if (document.getElementById(`${heistType}-canvas`)) {
        if (currentConnections.length !== currentPuzzleSolution.length) {
            isCorrect = false;
        } else {
            isCorrect = true;
            const userConnectedPairs = currentConnections.map(conn => [conn.item1.dataset.id, conn.item2.dataset.id].sort().join('-'));
            const solutionIds = currentPuzzleSolution.map(pair => pair.sort().join('-'));

            for (const userConn of userConnectedPairs) {
                if (!solutionIds.includes(userConn)) {
                    isCorrect = false;
                    break;
                }
            }
        }
    }
    // Check Sequence Puzzle
    else if (document.querySelector(`#${heistType}-puzzle-area .sequence-inputs`)) {
        const inputs = document.querySelectorAll(`#${heistType}-puzzle-area .sequence-input`);
        const userSequence = Array.from(inputs).map(input => parseInt(input.value)).filter(val => !isNaN(val));

        if (userSequence.length === currentPuzzleSolution.length && JSON.stringify(userSequence) === JSON.stringify(currentPuzzleSolution)) {
            isCorrect = true;
        } else {
            isCorrect = false;
        }
    }

    if (isCorrect) {
        heistSuccess(heistType, resultMessage);
    } else {
        heistFail(heistType, resultMessage);
    }
}


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function heistSuccess(heistType, resultMessage) {
    const amount = Math.floor(Math.random() * 5000) + 1000;
    playerMoney += amount;
    updateMoneyDisplay();

    resultMessage.style.color = '#4CAF50';
    resultMessage.textContent = `Congratulations! You successfully completed the heist and got ${amount}$!`;
    resetHeist(heistType);
}

function heistFail(heistType, resultMessage) {
    resultMessage.style.color = '#E60000';
    resultMessage.textContent = 'Heist failed! Try again.';
    resetHeist(heistType);
}

function resetHeist(heistType) {
    const puzzleArea = document.getElementById(`${heistType}-puzzle-area`);
    puzzleArea.style.display = 'none';
    puzzleArea.innerHTML = '';
    currentSelected = null;
    currentConnections = [];
    currentPuzzleSolution = [];
    delete activeHeists[heistType];
    enableHeistButtons(heistType);
    updateHeistStatus(heistType, '');
}

// Smooth scrolling and section display for navigation
document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        document.querySelectorAll('nav ul li a').forEach(link => {
            link.classList.remove('active-nav');
        });
        this.classList.add('active-nav');

        document.querySelectorAll('.container').forEach(section => {
            section.classList.remove('active');
        });

        if (targetElement) {
            targetElement.classList.add('active');
            window.scrollTo({
                top: targetElement.offsetTop - 120,
                behavior: 'smooth'
            });
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('home').classList.add('active');
    document.querySelector('nav ul li a[href="#home"]').classList.add('active-nav');
    simulateOtherHeists();
    updateMoneyDisplay();
});