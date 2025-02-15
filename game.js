// La GroTTe : The JavaScript Game (with a bit of CSS and good ol' HTML) is dedicated to good old textual games.

//Game logic and enemy encounters

const enemies = [
    { name: "Orc", health: 50, attack: 10 },
    { name: "Goblin", health: 30, attack: 8 },
    { name: "Troll des souterrains", health: 70, attack: 12 },
    { name: "Sorcier", health: 40, attack: 15 },
    { name: "Guerrier maudit", health: 60, attack: 14 },
    { name: "Rat mutant", health: 20, attack: 5 },
];

const rooms = {
    'depart': {
        description: 'Vous ouvrez les yeux et distinguez les contours de la grotte. Il fait sombre ici. Vous pouvez aller vers l\'est.',
        connected: ['est'],
        items: ['torche'],
        special: null,
    },
    'est': {
        description: 'Vous êtes dans une petite chambre avec un coffre. Il y a un coffre ici. Vous pouvez aller vers le sud ou l\'ouest.',
        connected: ['depart', 'sud', 'ouest'],
        items: ['or'],
        special: 'coffre',
    },
    'sud': {
        description: 'Vous êtes dans une salle plus grande. Il y a des pierres tombées par terre. Vous pouvez aller vers l\'ouest ou le nord.',
        connected: ['est', 'ouest', 'nord'],
        items: [],
        special: null,
    },
    'ouest': {
        description: 'Vous êtes dans une pièce sombre. Il y a un trou au sol. Vous pouvez revenir à l\'est.',
        connected: ['sud'],
        items: ['clé'],
        special: 'porte',  // Locked door that needs the key
    },
    'nord': {
        description: 'Vous êtes dans une salle secrète, mais il semble qu\'une porte soit verrouillée. Vous pouvez aller au sud.',
        connected: ['sud'],
        items: ['carte'],
        special: 'porte',
    },
};

let currentRoom = 'depart';  
let inventory = [];
let player = { health: 100, attack: 10 };

const gameOutput = document.getElementById('gameOutput');
const lookBtn = document.getElementById('lookBtn');
const takeBtn = document.getElementById('takeBtn');
const inventoryBtn = document.getElementById('inventoryBtn');
const moveDirectionBtns = document.getElementById('moveDirectionBtns');
const combatPopup = document.getElementById('combatPopup');
const fightBtn = document.getElementById('fightBtn');
const fleeBtn = document.getElementById('fleeBtn');

function updateGameOutput(message) {
    gameOutput.innerHTML = message;
    gameOutput.scrollTop = gameOutput.scrollHeight;
}

function showDirections() {
    moveDirectionBtns.style.display = 'block';
    moveDirectionBtns.innerHTML = ''; 

    rooms[currentRoom].connected.forEach(direction => {
        const btn = document.createElement('button');
        btn.textContent = `Direction : ${direction}`;
        btn.addEventListener('click', () => {
            moveTo(direction);
        });
        moveDirectionBtns.appendChild(btn);
    });
}

function moveTo(direction) {
    if (rooms[currentRoom].connected.includes(direction)) {
        // Random enemy encounter
        if (Math.random() < 0.3) {  
            showCombatPopup();
        } else {
            currentRoom = direction;
            updateGameOutput(rooms[currentRoom].description);
            showDirections();
        }
    } else {
        updateGameOutput("Ce n'est pas possible d'aller dans cette direction.");
    }
}

function takeItem() {
    if (rooms[currentRoom].items.length > 0) {
        const item = rooms[currentRoom].items[0];
        inventory.push(item);
        rooms[currentRoom].items = [];
        updateGameOutput(`Vous avez pris l'objet: ${item}.`);
    } else {
        updateGameOutput('Il n\'y a pas d\'objet ici.');
    }
}

function showCombatPopup() {
    const enemy = enemies[Math.floor(Math.random() * enemies.length)];
    combatPopup.style.display = 'block';

    // Set the combat message and actions
    document.querySelector('.combat-popup h3').textContent = `Un ${enemy.name} apparaît ! Que voulez-vous faire ?`;

    fightBtn.onclick = () => {
        combatPopup.style.display = 'none';
        const battleMessage = battle(player, enemy);
        updateGameOutput(battleMessage);
    };

    fleeBtn.onclick = () => {
        combatPopup.style.display = 'none';
        updateGameOutput(`Vous avez fui le combat contre le ${enemy.name}.`);
    };
}

function battle(player, enemy) {
    let battleMessage = `Un combat avec ${enemy.name} commence!`;

    // Simple combat loop: player vs enemy
    while (player.health > 0 && enemy.health > 0) {
        // Player attacks first
        enemy.health -= player.attack;
        if (enemy.health <= 0) {
            battleMessage += `<br>Vous avez tué ${enemy.name}!`;
            return battleMessage;
        }

        // Enemy attacks back
        player.health -= enemy.attack;
        if (player.health <= 0) {
            battleMessage += `<br>${enemy.name} vous a tué!`;
            return battleMessage;
        }
    }
}

lookBtn.addEventListener('click', () => {
    updateGameOutput(rooms[currentRoom].description);
    showDirections();
});

takeBtn.addEventListener('click', takeItem);

inventoryBtn.addEventListener('click', () => {
    if (inventory.length > 0) {
        updateGameOutput(`Vous avez: ${inventory.join(', ')}`);
    } else {
        updateGameOutput('Votre inventaire est vide.');
    }
});

updateGameOutput(rooms[currentRoom].description);
showDirections();
