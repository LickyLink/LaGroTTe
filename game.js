// La GroTTe : The JavaScript Game (with a bit of CSS and good ol' HTML) is dedicated to good old textual games.

// Game logic and enemy encounters

class Item {
    constructor(name, type, effect) {
        this.name = name;
        this.type = type;
        this.effect = effect;
    }
}

const offensiveItems = [
    new Item("épée rouillée", "offensive", { attack: 5 }),
    new Item("cure-dent métallique", "offensive", { attack: 3 }),
    new Item("os de rat pointu", "offensive", { attack: 2 }),
    new Item("cuillère à soupe fendue", "offensive", { attack: 4 }),
    new Item("assiette ébréchée", "offensive", { attack: 1 }),
];

const defensiveItems = [
    new Item("bouclier en planche pourrie", "defensive", { defense: 3 }),
    new Item("parchemin de protection +2", "defensive", { defense: 2 }),
    new Item("robe de l'archimage Tolsadum", "defensive", { defense: 4 }),
];

const debuffItems = [
    new Item("scroll of stupidity", "debuff", { health: -5 }),
    new Item("runestaff of curse", "debuff", { health: -10 }),
    new Item("baguette d'harry crotteur", "debuff", { health: -7 }),
];

const keys = [
    new Item("clé rouillée", "key", { opens: "porte rouillée" }),
    new Item("clé d'argent", "key", { opens: "porte argentée" }),
    new Item("clé en or", "key", { opens: "porte dorée" }),
];

const enemies = [
    { name: "Orc", health: 50, attack: 10, loot: offensiveItems[0] },
    { name: "Goblin", health: 30, attack: 8, loot: keys[0] },
    { name: "Troll des souterrains", health: 70, attack: 12, loot: keys[1] },
    { name: "Sorcier", health: 40, attack: 15, loot: offensiveItems[1] },
    { name: "Guerrier maudit", health: 60, attack: 14, loot: keys[2] },
    { name: "Rat mutant", health: 20, attack: 5, loot: debuffItems[0] },
];

const rooms = {
    'depart': {
        description: 'Vous ouvrez les yeux et distinguez les contours de la grotte. Il fait sombre ici. Vous pouvez aller vers l\'Est.',
        connected: ['Est'],
        items: ['torche'],
        special: null,
    },
    'Est': {
        description: 'Vous êtes dans une petite chambre avec un coffre. Il y a un coffre ici. Vous pouvez aller vers le Sud ou l\'Ouest.',
        connected: ['depart', 'Sud', 'Ouest'],
        items: ['or'],
        special: 'coffre',
    },
    'Sud': {
        description: 'Vous êtes dans une salle plus grande. Il y a des pierres tombées par terre. Vous pouvez aller vers l\'Ouest ou le Nord.',
        connected: ['Est', 'Ouest', 'Nord'],
        items: [],
        special: null,
    },
    'Ouest': {
        description: 'Vous êtes dans une pièce sombre. Il y a un trou au sol. Vous pouvez revenir à l\'Est.',
        connected: ['Est'],
        items: ['clé'],
        special: 'porte',  // Locked door that needs the key
    },
    'Nord': {
        description: 'Vous êtes dans une salle secrète, mais il semble qu\'une porte soit verrouillée. Vous pouvez aller au Sud.',
        connected: ['Sud'],
        items: ['carte'],
        special: 'porte',
    },
    'NordEst': {
        description: 'Vous êtes dans une galerie étroite. Vous pouvez aller au Sud ou à l\'Ouest.',
        connected: ['Nord', 'Ouest'],
        items: ['potion'],
        special: null,
    },
    'SudOuest': {
        description: 'Vous êtes dans une salle de stockage abandonnée. Vous pouvez aller au Nord ou à l\'Est.',
        connected: ['Sud', 'Est'],
        items: ['épée'],
        special: null,
    },
    'SalleCachée': {
        description: 'Vous découvrez une salle cachée derrière un mur. Vous pouvez aller au Nord.',
        connected: ['Nord'],
        items: ['amulette'],
        special: 'coffre spécial',
    },
    'ChambreMagique': {
        description: 'Vous entrez dans une chambre magique éclairée par des cristaux. Vous pouvez aller à l\'Est.',
        connected: ['Est'],
        items: ['baguette magique'],
        special: 'coffre magique',
    },
    'SanctuaireAncien': {
        description: 'Vous pénétrez dans un sanctuaire ancien. Vous pouvez aller au Sud.',
        connected: ['Sud'],
        items: ['grimoire ancien'],
        special: 'coffre ancien',
    },
};

let currentRoom = 'depart';  
let inventory = [];
let player = { health: 100, attack: 10, defense: 0 };

const gameOutput = document.getElementById('gameOutput');
const lookBtn = document.getElementById('lookBtn');
const takeBtn = document.getElementById('takeBtn');
const inventoryBtn = document.getElementById('inventoryBtn');
const equipBtn = document.getElementById('equipBtn');
const moveDirectionBtns = document.getElementById('moveDirectionBtns');
const combatPopup = document.getElementById('combatPopup');
const fightBtn = document.getElementById('fightBtn');
const fleeBtn = document.getElementById('fleeBtn');
const deathPopup = document.getElementById('deathPopup');
const restartBtn = document.getElementById('restartBtn');
const healthDisplay = document.getElementById('healthDisplay');

function updateGameOutput(message) {
    gameOutput.innerHTML = message;
    gameOutput.scrollTop = gameOutput.scrollHeight;
    updateHealthDisplay();
}

function updateHealthDisplay() {
    const healthArt = `
    PV: ${player.health}
    ${'█'.repeat(player.health / 10)}${'░'.repeat(10 - player.health / 10)}
    `;
    healthDisplay.innerHTML = `<pre>${healthArt}</pre>`;
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
    let battleMessage = `Un combat commence avec ${enemy.name}!`;
    let playerStartingHealth = player.health;
    let enemyStartingHealth = enemy.health;

    // Simple combat loop: player vs enemy
    while (player.health > 0 && enemy.health > 0) {
        // Player attacks first
        enemy.health -= player.attack;
        if (enemy.health <= 0) {
            battleMessage += `<br>Victoire! Vous avez tué ${enemy.name}. Vous trouvez ${enemy.loot.name}.`;
            inventory.push(enemy.loot);
            break;
        }

        // Enemy attacks back
        player.health -= Math.max(0, enemy.attack - player.defense);
        if (player.health <= 0) {
            showDeathPopup();
            battleMessage += `<br>Défaite! ${enemy.name} vous a tué.`;
            break;
        }
    }

    battleMessage += `<br>Dégâts infligés: ${playerStartingHealth - player.health}, Dégâts reçus: ${enemyStartingHealth - enemy.health}.`;
    return battleMessage;
}

function equipItem() {
    if (inventory.length > 0) {
        const item = inventory.pop();
        if (item.type === "offensive") {
            player.attack += item.effect.attack;
            updateGameOutput(`Vous avez équipé ${item.name}. Votre attaque a augmenté de ${item.effect.attack}.`);
        } else if (item.type === "defensive") {
            player.defense += item.effect.defense;
            updateGameOutput(`Vous avez équipé ${item.name}. Votre défense a augmenté de ${item.effect.defense}.`);
        } else if (item.type === "debuff") {
            player.health += item.effect.health;
            updateGameOutput(`Vous avez utilisé ${item.name}. Votre santé a diminué de ${-item.effect.health}.`);
        }
    } else {
        updateGameOutput("Vous n'avez aucun objet à équiper.");
    }
}

function showDeathPopup() {
    deathPopup.style.display = 'block';
}

function restartGame() {
    deathPopup.style.display = 'none';
    currentRoom = 'depart';
    inventory = [];
    player = { health: 100, attack: 10, defense: 0 };
    updateGameOutput(rooms[currentRoom].description);
    showDirections();
}

lookBtn.addEventListener('click', () => {
    updateGameOutput(rooms[currentRoom].description);
    showDirections();
});

takeBtn.addEventListener('click', takeItem);

inventoryBtn.addEventListener('click', () => {
    if (inventory.length > 0) {
        updateGameOutput(`Vous avez: ${inventory.map(item => item.name).join(', ')}`);
    } else {
        updateGameOutput('Votre inventaire est vide.');
    }
});

equipBtn.addEventListener('click', equipItem);

restartBtn.addEventListener('click', restartGame);

updateGameOutput(rooms[currentRoom].description);
showDirections();
