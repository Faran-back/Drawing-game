// ============== BASIC SETUP ==============
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentTool = 'pencil';
let currentColor = '#222222';

let guideDots = [];
let completedDots = new Set();
let currentTarget = 0;
let levelCompleted = false;

// Resize Canvas
function resizeCanvas() {
    const container = document.getElementById('drawing-area');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ============== LOAD LEVEL ==============
function loadLevel() {
    guideDots = [
        {x: 250, y: 140, num: 1}, {x: 320, y: 100, num: 2}, {x: 400, y: 130, num: 3},
        {x: 440, y: 200, num: 4}, {x: 410, y: 260, num: 5}, {x: 340, y: 290, num: 6},
        {x: 250, y: 280, num: 7}, {x: 190, y: 230, num: 8}, {x: 200, y: 160, num: 9},
        {x: 220, y: 80, num: 10}, {x: 190, y: 50, num: 11}, {x: 230, y: 40, num: 12},
        {x: 270, y: 70, num: 13}, {x: 380, y: 70, num: 14}, {x: 410, y: 45, num: 15},
        {x: 450, y: 65, num: 16}, {x: 430, y: 95, num: 17}, {x: 280, y: 340, num: 18},
        {x: 240, y: 400, num: 19}, {x: 310, y: 420, num: 20}, {x: 370, y: 390, num: 21},
        {x: 350, y: 340, num: 22}
    ];
    
    completedDots.clear();
    currentTarget = 0;
    levelCompleted = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ============== DRAWING (Only if not completed) ==============
function startDrawing(e) {
    if (levelCompleted) return;
    isDrawing = true;
    const pos = getMousePos(e);
    lastX = pos.x;
    lastY = pos.y;
}

function draw(e) {
    if (!isDrawing || levelCompleted) return;

    const pos = getMousePos(e);
    
    ctx.lineWidth = currentTool === 'eraser' ? 25 : 9;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : currentColor;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    lastX = pos.x;
    lastY = pos.y;

    checkDotProximity(pos.x, pos.y);
}

function stopDrawing() {
    isDrawing = false;
}

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
    let clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);

    return { x: clientX - rect.left, y: clientY - rect.top };
}

// Proximity check (more forgiving)
function checkDotProximity(x, y) {
    if (levelCompleted || currentTarget >= guideDots.length) return;
    
    const dot = guideDots[currentTarget];
    const distance = Math.hypot(x - dot.x, y - dot.y);

    if (distance < 45) {
        completedDots.add(currentTarget);
        currentTarget++;
        
        if (currentTarget >= guideDots.length) {
            levelCompleted = true;
            setTimeout(showCompletion, 300);
        }
    }
}

// ============== DRAWING THE SHAPE ==============
function drawConnectingLines() {
    ctx.strokeStyle = levelCompleted ? '#2f3542' : 'rgba(47, 53, 66, 0.25)';
    ctx.lineWidth = levelCompleted ? 8 : 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    
    for (let i = 0; i < guideDots.length - 1; i++) {
        ctx.moveTo(guideDots[i].x, guideDots[i].y);
        ctx.lineTo(guideDots[i+1].x, guideDots[i+1].y);
    }
    ctx.stroke();
}

function drawGuideDots() {
    guideDots.forEach((dot, i) => {
        const completed = completedDots.has(i);
        const isNext = i === currentTarget && !levelCompleted;

        // === DOTTED GUIDE CIRCLE (like your image) ===
        if (isNext) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 6]);           // Dotted line
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, 28, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);               // Reset dash
        }

        // === MAIN DOT ===
        let radius = completed ? 13 : 11;
        
        if (isNext) {
            ctx.shadowColor = '#ffd93d';
            ctx.shadowBlur = 22;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = completed ? '#55efc4' : (isNext ? '#ff4757' : '#2f3542');
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Number (hide after completion)
        if (!levelCompleted) {
            ctx.fillStyle = completed ? '#2f3542' : 'white';
            ctx.font = 'bold 15px Baloo 2, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(dot.num.toString(), dot.x, dot.y);
        }
    });
}

function showCompletion() {
    alert("🌟 AMAZING! You completed the Labubu! 🌟");
    // You can later add confetti or next level button here
}

// ============== GAME LOOP ==============
function gameLoop() {
    drawConnectingLines();
    drawGuideDots();
    requestAnimationFrame(gameLoop);
}

// ============== EVENT LISTENERS ==============
// (Keep your existing tool, color, restart listeners)

document.getElementById('restart-btn').addEventListener('click', () => {
    loadLevel();
});

// Touch + Mouse listeners (same as before)
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

// Initialize
loadLevel();
gameLoop();