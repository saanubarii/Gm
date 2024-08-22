const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const interactionBox = document.getElementById('interactionBox');
const interactionMessage = document.getElementById('interactionMessage');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Map and Tile settings
const mapWidth = 1000;
const mapHeight = 1000;
const tileSize = 10;

// Initialize Simplex Noise
const simplex = new SimplexNoise();
const noiseScale = 0.1;

// Player settings
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    color: '#00F',
    speed: 5
};

// Array to hold NPC objects
const npcs = [];
const numNpcs = 10;  // Number of NPCs to generate

function NPC(x, y, name) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.color = '#FF4500';  // NPC color
    this.speed = 2;
    this.direction = Math.random() * 2 * Math.PI;
    this.name = name;  // NPC name for dialog
    this.targetX = Math.random() * canvas.width;
    this.targetY = Math.random() * canvas.height;

    this.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    };

    this.update = function() {
        // Move NPC towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > this.speed) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        } else {
            this.x = this.targetX;
            this.y = this.targetY;
            // Randomly choose a new target
            this.targetX = Math.random() * canvas.width;
            this.targetY = Math.random() * canvas.height;
        }

        this.draw();
    };

    this.isNear = function(px, py) {
        const dx = this.x - px;
        const dy = this.y - py;
        return Math.sqrt(dx * dx + dy * dy) < this.radius + player.radius;
    };

    this.getDialog = function() {
        // Simple dialog based on NPC name
        return `Hello, I am ${this.name}.`;
    };
}

// Create NPCs with names
for (let i = 0; i < numNpcs; i++) {
    const npcX = Math.random() * canvas.width;
    const npcY = Math.random() * canvas.height;
    const npcName = `NPC ${i + 1}`;  // Assign unique names
    const npc = new NPC(npcX, npcY, npcName);
    npcs.push(npc);
}

// Handle player movement
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            player.y -= player.speed;
            break;
        case 'ArrowDown':
        case 's':
            player.y += player.speed;
            break;
        case 'ArrowLeft':
        case 'a':
            player.x -= player.speed;
            break;
        case 'ArrowRight':
        case 'd':
            player.x += player.speed;
            break;
    }
});

// Check interaction with NPC
function checkInteraction() {
    let message = '';
    for (const npc of npcs) {
        if (npc.isNear(player.x, player.y)) {
            message = `Press E to interact with ${npc.name}`;
            interactionBox.style.display = 'block';
            interactionMessage.textContent = message;
            return npc;
        }
    }
    interactionBox.style.display = 'none';
    return null;
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'e') {
        const interactingNpc = checkInteraction();
        if (interactingNpc) {
            alert(interactingNpc.getDialog());
        }
    }
});

function generateMap() {
    for (let x = 0; x < mapWidth; x++) {
        for (let y = 0; y < mapHeight; y++) {
            const noiseValue = simplex.noise2D(x * noiseScale, y * noiseScale);
            const mappedValue = (noiseValue + 1) / 2;
            let color;

            if (mappedValue < 0.2) {
                color = '#000080'; // Water
            } else if (mappedValue < 0.4) {
                color = '#006400'; // Forest
            } else if (mappedValue < 0.6) {
                color = '#228B22'; // Grassland
            } else {
                color = '#D2B48C'; // Desert
            }

            ctx.fillStyle = color;
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        }
    }
}

function drawStaticObjects() {
    // Example building
    ctx.fillStyle = '#8B4513'; // Brown color for buildings
    ctx.fillRect(200, 200, 50, 50); // Draw a building

    // Example resource
    ctx.fillStyle = '#FFD700'; // Gold color for resources
    ctx.beginPath();
    ctx.arc(400, 400, 10, 0, 2 * Math.PI); // Draw a resource
    ctx.fill();
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    generateMap();
    drawStaticObjects();
    npcs.forEach(npc => npc.update());
    
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();

    checkInteraction();
    
    requestAnimationFrame(animate);
}

animate();
