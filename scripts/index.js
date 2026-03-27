if (!navigator.serial) {
    document.getElementById("message").innerHTML += "<b>Web Serial API is not supported in this browser.</b><br> This is needed to connect to the Haptic device.<br> Try the latest version of Chrome or Edge.";
}