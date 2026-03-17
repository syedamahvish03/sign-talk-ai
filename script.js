const videoElement = document.querySelector('.input_video');
const canvasElement = document.querySelector('.output_canvas');
const canvasCtx = canvasElement.getContext('2d');
const gestureDisplay = document.getElementById('gesture-display');
const historyList = document.getElementById('conversation-history');
const audioBtn = document.querySelector('.voice-toggle');

let gestureLibrary = [];
let currentLandmarks = null;
let isAudioEnabled = false;
let currentMode = 'alpha';
let isTraining = false;
let lastDetected = null;
let stableFrames = 0;
const STABILITY_FRAMES = 25;
let sentenceWords = [];
let sentenceTimeout = null;

let lastConfirmedWord = "";
let lockCounter = 0;
const LOCK_SENSITIVITY = 5; // How many frames to wait before locking (5 is very fast)

// --- STABILITY CONFIGURATION ---
let lastDetectedWord = "";
let stabilityCounter = 0;
const STABILITY_THRESHOLD = 8; // Number of frames a gesture must stay the same to count

// Audio Toggle
audioBtn.onclick = () => {
    isAudioEnabled = !isAudioEnabled;
    audioBtn.innerText = isAudioEnabled ? "🔊 Audio: ON" : "🔇 Audio: OFF";
    const u = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(u);
};

function speak(text) {
    if (!isAudioEnabled || !text) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function setMode(mode) {
    currentMode = mode;
    sentenceWords = [];
    document.getElementById('sidebar-sentence-text').innerText = "---";
    document.getElementById('main-sentence-text').innerText = "---";
    document.getElementById('mode-alpha').classList.toggle('active', mode === 'alpha');
    document.getElementById('mode-sentence').classList.toggle('active', mode === 'sentence');
}

function acceptWord(word) {
    if (currentMode === 'alpha') {
        speak(word);
        const li = document.createElement('li');
        li.innerHTML = `<b>${word}</b>`;
        historyList.prepend(li);
    } else {
        sentenceWords.push(word);
        const full = sentenceWords.join(" ");
        document.getElementById('sidebar-sentence-text').innerText = full;
        document.getElementById('main-sentence-text').innerText = full;
        clearTimeout(sentenceTimeout);
        sentenceTimeout = setTimeout(() => { speak(full); sentenceWords = []; }, 3000);
    }
}

function identify(landmarks) {
    if (!landmarks || gestureLibrary.length === 0) return "Show Hand";
    const base = landmarks[0];
    const rel = landmarks.map(p => ({ x: p.x - base.x, y: p.y - base.y }));
    let best = "Show Hand";
    let min = 0.08;

    gestureLibrary.forEach(g => {
        if (!g.points_json || g.points_json === "[]") return;
        const saved = JSON.parse(g.points_json);
        let d = 0;
        for (let i = 0; i < 21; i++) d += Math.hypot(rel[i].x - saved[i].x, rel[i].y - saved[i].y);
        d /= 21;
        if (d < min) { min = d; best = g.gesture_name.split('_v')[0]; }
    });
    return best;
}

const hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
hands.setOptions({ maxNumHands: 1, modelComplexity: 0, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });


function getStableWord(currentWord) {
    if (currentWord === "Show Hand" || currentWord === "") {
        stabilityCounter = 0;
        return "";
    }

    if (currentWord === lastDetectedWord) {
        stabilityCounter++;
    } else {
        // Hand is moving/shifting - Reset counter
        stabilityCounter = 0;
        lastDetectedWord = currentWord;
    }

    // Only return the word if it has been solid for 8 frames (~0.2 seconds)
    if (stabilityCounter === STABILITY_THRESHOLD) {
        return currentWord;
    }
    return null;
}

hands.onResults(results => {
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks[0]) {
        currentLandmarks = results.multiHandLandmarks[0];
        canvasElement.classList.add('active');

        // DRAW VISUALS
        drawConnectors(canvasCtx, currentLandmarks, HAND_CONNECTIONS, { color: '#10b981', lineWidth: 4 });
        drawLandmarks(canvasCtx, currentLandmarks, { color: '#FFFFFF', lineWidth: 1, radius: 4 });

        const detected = identify(currentLandmarks);
        gestureDisplay.innerText = detected;

        if (detected !== "Show Hand" && !isTraining) {
            if (detected === lastDetected) {
                stableFrames++;
                if (stableFrames >= STABILITY_FRAMES) { acceptWord(detected); stableFrames = 0; lastDetected = null; }
            } else { lastDetected = detected; stableFrames = 0; }
        }
    } else {
        canvasElement.classList.remove('active');
        gestureDisplay.innerText = "Show Hand";
        currentLandmarks = null;
    }
    // --- FIND YOUR PREDICTION VARIABLE ---
    let currentPrediction = results.gesture; // Use your existing variable name here

    if (currentPrediction && currentPrediction !== "None") {

        // If the hand is still showing the SAME gesture as the last frame
        if (currentPrediction === lastConfirmedWord) {
            lockCounter++;
        } else {
            // Hand is shifting! Reset the counter immediately
            lockCounter = 0;
            lastConfirmedWord = currentPrediction;
        }

        // LOCK TRIGGER: Only add the word once the counter hits the sensitivity limit
        if (lockCounter === LOCK_SENSITIVITY) {

            // YOUR EXISTING ADD-TO-SENTENCE LOGIC GOES HERE:
            // Example: if (currentPrediction !== lastWordInSentence) { addToSentence(currentPrediction); }

            console.log("Locked:", currentPrediction);

            // Reset counter to prevent the same word from repeating a million times
            lockCounter = -100; // This creates a "cool down" so it only logs once
        }
    }
    canvasCtx.restore();
});

const camera = new Camera(videoElement, { onFrame: async () => { await hands.send({ image: videoElement }); }, width: 640, height: 480 });

async function loadGesturesFromDB() {
    const r = await fetch('/get-gestures');
    gestureLibrary = await r.json();
}

window.onload = async () => { await loadGesturesFromDB(); camera.start(); };

function openModal() { document.getElementById('customModal').style.display = 'block'; }
function closeModal() { document.getElementById('customModal').style.display = 'none'; }

async function startCustomTraining() {
    const name = document.getElementById('custom-name').value.trim();
    if (!name) return alert("Enter word name");
    isTraining = true;
    for (let i = 1; i <= 3; i++) {
        document.getElementById('modal-status').innerText = `Pose for ${name} (${i}/3) in 3s...`;
        await new Promise(r => setTimeout(r, 3000));
        if (currentLandmarks) {
            const base = currentLandmarks[0];
            const rel = currentLandmarks.map(p => ({ x: p.x - base.x, y: p.y - base.y }));
            await fetch('/update-gesture', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: `${name}_v${i}`, points: rel }) });
        }
    }
    isTraining = false;
    await loadGesturesFromDB();
    closeModal();
}