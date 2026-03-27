// Utility function to dynamically load a CSS file
function loadCSS(href) {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
    });
}

// Factory function to create and display a modal for serial haptic device connection
async function createAndShowHapticModal() {
    // Dynamically load the modal's stylesheet
    await loadCSS('styles/modal.css');

    // Create the modal container
    const modal = document.createElement('div');
    modal.id = 'modalHaptic';
    modal.className = 'modal';

    // Create the modal content container
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    // Add title
    const title = document.createElement('h2');
    title.textContent = 'Connect a serial haptic device';

    // Add connect button
    const connectButton = document.createElement('button');
    connectButton.id = 'modalConnectButton';
    connectButton.textContent = 'Connect';

    // Add message box for status updates
    const messageBox = document.createElement('div');
    messageBox.id = 'modalMessageBox';
    messageBox.className = 'modal-message-box';

    // Assemble modal structure
    modalContent.append(title, connectButton, messageBox);
    modal.appendChild(modalContent);

    // Add modal to the document body
    document.body.appendChild(modal);

    // Make modal visible
    modal.style.display = 'block';

    // Initialize serial connection setup
    addSerialConnection();

    // Return modal reference for potential future use
    return modal;
}

// Updates the message box with a given status message
function updateMessage(message) {
    const messageBox = document.getElementById('modalMessageBox');
    if (messageBox) {
        messageBox.textContent = message;
    } else {
        console.error("The modalMessageBox is not available!");
    }
}

// Main execution: Create and show the haptic modal
createAndShowHapticModal();

// --- Serial Connection Setup ---
let port;
let writer;
let reader;

function addSerialConnection() {
    // Check Web Serial API availability
    if (!navigator.serial) {
        updateMessage("Your browser does not support WebSerial API - please use either Chrome or Edge.");
        return;
    }

    const connectButton = document.getElementById("modalConnectButton");

    // Set up event listener for connect button
    connectButton.addEventListener("click", async () => {
        try {
            // Request and open a serial port
            const filter = { usbVendorId: 0x239A };
            port = await navigator.serial.requestPort({ filters: [filter] });
            await port.open({ baudRate: 115200 });

            // Prepare data writer
            writer = port.writable.getWriter();

            // Hide modal after successful connection
            document.getElementById("modalHaptic").style.display = 'none';
        }
        catch (error) {
            console.error(error);
            updateMessage(`Error connecting to Arduino: ${error}`);
        }
    });
}

// Sends a message via the serial port if available
async function sendMessage(message) {
    if (writer) {
        try {
            await writer.write(message);
        } catch (error) {
            console.error("Error sending message:", error);
        }
    } else {
        console.error("No Serial writer available");
    }
}

// fetch('data/testConfig.json')
//     .then(response => response.json())
//     .then((data) => {
//         data.forEach(interaction => {

//             let domElements = document.querySelectorAll(interaction.domId);
//             if (domElements.length === 0) {
//                 console.error(`No DOM elements found with selector ${interaction.domId}`);
//                 return;
//             } else {
//                 domElements.forEach(domElement => {
//                     domElement.addEventListener(interaction.eventType, (e) => {
//                         console.log(`${interaction.domId} has triggered ${interaction.eventType}`);
//                         // TODO: apply special case to hover
//                         if (interaction.eventType === "hover") return;
//                         // Send configured sequence to Arduino
//                         const message = new Uint8Array(interaction.sequence);
//                         sendMessage(message);
//                     });
//                 });
//             }

//             // const domElement = document.getElementById(interaction.domId);
//             // if (!domElement) {
//             //     console.error(`DOM element with ID ${interaction.domId} not found`);
//             // } else {
//             //     domElement.addEventListener(interaction.eventType, (e) => {
//             //         console.log(`${interaction.domId} has triggered ${interaction.eventType}`);

//             //         // Skip hover events (no action needed)
//             //         if (interaction.eventType === "hover") return;

//             //         // Send configured sequence to Arduino
//             //         const message = new Uint8Array(interaction.sequence);
//             //         sendMessage(message);
//             //     });
//             // }
//         });
//     })
//     .catch(error => console.error('Error loading configuration:', error));

function loadConfig() {
    // Loads and processes DOM event configurations from a JSON file
    if (localStorage.getItem("hapticConfig")) {
        // If config exists in localStorage, parse and use it
        config = JSON.parse(localStorage.getItem("hapticConfig"));
    } else {
        console.error("No config was saved yet!");
        updateMessage("No haptic configuration file was found in the storage!");
        return; // Exit if no config exists
    }

    // Process each interaction in the config
    config.forEach(interaction => {
        // Find all DOM elements matching the selector
        let domElements = document.querySelectorAll(interaction.domId);

        if (domElements.length === 0) {
            console.error(`No DOM elements found with selector ${interaction.domId}`);
            return; // Skip if no elements found
        }

        // Add event listeners to each matching element
            domElements.forEach(domElement => {
                domElement.addEventListener(interaction.eventType, (e) => {
                    console.log(`${interaction.domId} has triggered ${interaction.eventType}`);

                // Skip hover events (no action needed)
                    if (interaction.eventType === "hover") return;
                // Convert sequence to Uint8Array and send to Arduino
                    const message = new Uint8Array(interaction.sequence);
                    sendMessage(message);
                });
            });
    });

    console.log("Configuration was applied to the DOM elements");
}

// TODO: fix a better method to load the config after all buttons etc. are loaded
setTimeout(() => {
    loadConfig();
}, 1000);