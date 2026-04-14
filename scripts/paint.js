let canvas;
let isDrawing = false;
let selectedColor = '#000000';
let artName = '';
let strokeWeightValue = 5;
let distortionMode = 'none';
let previousX, previousY;
let bgColor;
let canvasWidth = 800;
let canvasHeight = 500;
let keys = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", '\\'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
];

function setup() {
    canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent('canvas-container');
    bgColor = color(220, 235, 250);
    background(bgColor);

    // Position all elements dynamically
    positionElements();
    windowResized(); // Initial positioning

    // Menu sections (left side)
    createMenuSection(
        'Colors:',
        20,
        canvasHeight + 40,
        [
            { color: 'red', action: () => selectedColor = color(255, 0, 0) },
            { color: 'blue', action: () => selectedColor = color(0, 0, 255) },
            { color: 'yellow', action: () => selectedColor = color(255, 255, 0) },
            { color: '#000080', label: '🧽', action: () => selectedColor = bgColor }
        ]
    );

    createMenuSection(
        'Line Types:',
        20,
        canvasHeight + 110,
        [
            { color: '#aaa', label: '➖', action: () => distortionMode = 'none' },
            { color: '#aaa', label: '◼', action: () => distortionMode = 'rectangles' },
            { color: '#aaa', label: '⬢', action: () => distortionMode = 'dotted' },
            { color: '#aaa', label: '⭕', action: () => distortionMode = 'circles' }
        ]
    );

    // Thickness dropdown
    let thicknessDropdown = createSelect();
    thicknessDropdown.position(60, canvasHeight + 200);
    thicknessDropdown.option('Thin (1px)', 1);
    thicknessDropdown.option('Medium (5px)', 5);
    thicknessDropdown.option('Thick (10px)', 10);
    thicknessDropdown.option('Very Thick (15px)', 15);
    thicknessDropdown.selected('Medium (5px)');
    thicknessDropdown.class('thickness');
    thicknessDropdown.changed(() => strokeWeightValue = thicknessDropdown.value());

    createKeyboard();
}

function positionElements() {
    // Logo position (top left)
    document.getElementById('logo').style.left = '20px';
    document.getElementById('logo').style.top = '10px';

    // Title display (below logo)
    document.getElementById('title-display').style.marginLeft = '60px';
    document.getElementById('title-display').style.marginTop = '10px';

    // Save and Clear buttons (top right)
    createTopButton('SAVE', windowWidth - 100, 10, () => saveCanvas(canvas, artName || 'myArt', 'png'));
    createTopButton('CLEAR', windowWidth - 200, 10, () => {
        background(bgColor);
        artName = '';
        document.getElementById('title-display').textContent = 'Art Name: ';
    });
}

function windowResized() {
    // Reposition elements when window is resized
    positionElements();
}

function createTopButton(label, x, y, onPress) {
    let button = createButton(label);
    button.position(x, y);
    button.style('background-color', '#4CAF50');
    button.style('color', 'white');
    button.style('padding', '8px 16px');
    button.class('top-button');
    button.mousePressed(onPress);
}

function createMenuSection(labelText, x, y, buttons) {
    let section = document.createElement('div');
    section.className = 'menu-section';
    section.style.left = x + 'px';
    section.style.top = y + 'px';

    let label = document.createElement('div');
    label.className = 'menu-label';
    label.textContent = labelText;
    section.appendChild(label);

    let buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'menu-buttons';

    buttons.forEach(btn => {
        let button = createButton(btn.label || '');
        button.class('menu-button');
        button.style('background-color', btn.color);
        button.mousePressed(btn.action);
        button.parent(buttonsDiv);
    });

    section.appendChild(buttonsDiv);
    document.body.appendChild(section);
}

function draw() {
    if (isDrawing && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        stroke(selectedColor);
        strokeWeight(strokeWeightValue);

        if (distortionMode === 'none') line(previousX, previousY, mouseX, mouseY);
        else if (distortionMode === 'rectangles') drawRectangles(previousX, previousY, mouseX, mouseY);
        else if (distortionMode === 'dotted') drawDotted(previousX, previousY, mouseX, mouseY);
        else if (distortionMode === 'circles') drawCircles(previousX, previousY, mouseX, mouseY);

        previousX = mouseX;
        previousY = mouseY;
    }
}

function mousePressed() {
    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        isDrawing = !isDrawing;
        previousX = mouseX;
        previousY = mouseY;
    }
}

function drawRectangles(x1, y1, x2, y2) {
    let distance = dist(x1, y1, x2, y2);
    let steps = floor(distance / 10);
    let stepX = (x2 - x1) / steps;
    let stepY = (y2 - y1) / steps;

    for (let i = 0; i < steps; i++) {
        let x = x1 + i * stepX;
        let y = y1 + i * stepY;
        rect(x - strokeWeightValue, y - strokeWeightValue, strokeWeightValue * 2, strokeWeightValue * 2);
    }
}

function drawDotted(x1, y1, x2, y2) {
    let distance = dist(x1, y1, x2, y2);
    let steps = floor(distance / 10);
    let stepX = (x2 - x1) / steps;
    let stepY = (y2 - y1) / steps;

    for (let i = 0; i < steps; i += 2) {
        let x = x1 + i * stepX;
        let y = y1 + i * stepY;
        point(x, y);
    }
}

function drawCircles(x1, y1, x2, y2) {
    let distance = dist(x1, y1, x2, y2);
    let steps = floor(distance / 15);
    let stepX = (x2 - x1) / steps;
    let stepY = (y2 - y1) / steps;

    for (let i = 0; i < steps; i++) {
        let x = x1 + i * stepX;
        let y = y1 + i * stepY;
        ellipse(x, y, strokeWeightValue * 2, strokeWeightValue * 2);
    }
}

function createKeyboard() {
    let keySize = 50;
    let margin = 10;
    let keyboardWidth = keys[0].length * (keySize + margin) - margin;
    let startX = (windowWidth - keyboardWidth) / 2;
    let startY = canvasHeight + 220; // Below all menu sections

    for (let i = 0; i < keys.length; i++) {
        for (let j = 0; j < keys[i].length; j++) {
            let key = keys[i][j];
            let button = createButton(key);
            button.class('keyboard');
            button.position(startX + j * (keySize + margin), startY + i * (keySize + margin));
            button.size(keySize, keySize);
            button.mousePressed(() => handleKeyPress(key));
        }
    }

    let rightStartX = startX + keyboardWidth + 20;
    createKeyboardButton(rightStartX, startY, 'SPACE', 'SPACE');
    createKeyboardButton(rightStartX, startY + keySize + margin, 'CLEAR', 'CLEAR');
    createKeyboardButton(rightStartX, startY + 2 * (keySize + margin), '<-', '<-');
}

function createKeyboardButton(x, y, label, key) {
    let button = createButton(label);
    button.class('keyboard-button');
    button.position(x, y);
    button.size(110, 50);
    button.mousePressed(() => handleKeyPress(key));
}

function handleKeyPress(key) {
    if (key === '<-') artName = artName.slice(0, -1);
    else if (key === 'SPACE') artName += ' ';
    else if (key === 'CLEAR') {
        artName = '';
        background(bgColor);
    }
    else artName += key;
    document.getElementById('title-display').textContent = 'Art Name: ' + artName;
}

