let canvas;
        let isDrawing = false;
        let selectedColor = '#000000';
        let artName = '';
        let strokeWeightValue = 5;
        let distortionMode = 'none';
        let previousX, previousY;
        let bgColor = '#DCEBFA';
        let canvasWidth;
        let canvasHeight;
        let keys = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", '\\'],
            ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
        ];

        function setup() {
            let canvasDiv = document.getElementById('canvas-container');
            canvasWidth = canvasDiv.offsetWidth;
            canvasHeight = canvasDiv.offsetHeight;

            canvas = createCanvas(canvasWidth, canvasHeight);
            canvas.parent('canvas-container');
            // bgColor = color(220, 235, 250);
            background(bgColor);

            createKeyboard();
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
            let containerWidth = document.getElementById('keys').offsetWidth;
            let containerHeight = document.getElementById('keys').offsetHeight;
            let keyWidth = containerWidth / (keys[0].length + 1);
            let keyHeight = containerHeight / (keys.length + 1) * 1.5; // Increased height by 50%
            let margin = keyWidth / 15;
            let keyboardWidth = keys[0].length * (keyWidth + margin) - margin;
            let startX = (containerWidth - keyboardWidth) / 2;
            let startY = (containerHeight - (keys.length * (keyHeight + margin) - margin)) / 2;

            let keysDiv = document.getElementById('keys');
            keysDiv.style.position = 'relative';

            for (let i = 0; i < keys.length; i++) {
                for (let j = 0; j < keys[i].length; j++) {
                    let key = keys[i][j];
                    let button = createButton(key);
                    button.class('key');
                    button.position(startX + j * (keyWidth + margin), startY + i * (keyHeight + margin));
                    button.size(keyWidth, keyHeight);
                    button.mousePressed(() => handleKeyPress(key));
                    button.parent('keys');
                }
            }
        }

        function backButton() {
            window.location.href = "index.html";
        }

        function stopButton() {
            window.location.href = "";
        }

        function clearButton() {
            background(bgColor);
            artName = '';
            document.getElementById('title-display').textContent = 'Naam kunstwerk: ';
        }

        function saveButton() {
            saveCanvas(canvas, artName || 'myArt', 'png');
        }

        function changeColor(color) {
            selectedColor = color;
        }

        function changeShape(shape) {
            distortionMode = shape;
        }

        function changeThickness() {
            let thickness = document.getElementById('sizeselect').value;
            strokeWeightValue = thickness;
        }

        function handleKeyPress(key) {
            if (key === 'BACKSPACE') artName = artName.slice(0, -1);
            else if (key === 'SPATIE') artName += ' ';
            else if (key === 'EMPTY') {
                artName = '';
                // background(bgColor);
            }
            else artName += key;

            document.getElementById('title-display').textContent = 'Naam kunstwerk: ' + artName;
        }