// ========================================================
// FORMATTER.JS: AI LOADING OVERLAY & SAFETY BOOT
// ========================================================

// --- CSS INJECTION (Loading Screen Style) ---
const loadingStyle = document.createElement('style');
loadingStyle.innerHTML = `
    #ai-loading-screen {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle, #0f172a 0%, #020617 100%);
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        z-index: 20000; transition: opacity 0.8s ease;
    }
    .loader-ring {
        width: 80px; height: 80px; border: 5px solid rgba(0, 207, 213, 0.1);
        border-top: 5px solid #00cfd5; border-radius: 50%;
        animation: spin 1s linear infinite; margin-bottom: 20px;
    }
    .loading-text {
        color: #00cfd5; font-family: 'Segoe UI', sans-serif;
        font-weight: bold; letter-spacing: 2px; animation: blink 1.5s infinite;
    }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
`;
document.head.appendChild(loadingStyle);

// --- HTML INJECTION (The Overlay) ---
const loadingHtml = `
    <div id="ai-loading-screen">
        <div class="loader-ring"></div>
        <div class="loading-text">INITIALIZING GESTURE AI...</div>
        <div style="color: white; font-size: 12px; margin-top: 10px; opacity: 0.6;">Optimizing MediaPipe Engine</div>
    </div>
`;
document.body.insertAdjacentHTML('afterbegin', loadingHtml);

// --- AUTOMATIC HIDE LOGIC ---
// This checks every 500ms if your video stream is actually playing
const checkCameraReady = setInterval(() => {
    const video = document.querySelector('video');
    // If video is playing and sending data, hide the loader
    if (video && video.readyState >= 3) {
        const loader = document.getElementById('ai-loading-screen');
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 800);
        clearInterval(checkCameraReady);
        console.log("🚀 AI Camera Live - Removing Loader");
    }
}, 500);



// ========================================================
// FORMATTER.JS: Elite Demo Version (Pro UI + UX)
// ========================================================

// --- CSS INJECTION (Animations, Notifications, and Colors) ---
const style = document.createElement('style');
style.innerHTML = `
    .demo-btn {
        padding: 12px 24px; border-radius: 10px; font-family: sans-serif;
        font-weight: 700; text-transform: uppercase; cursor: pointer;
        transition: all 0.2s ease; border: 2px solid; background: rgba(0,0,0,0.6);
        backdrop-filter: blur(5px); outline: none; letter-spacing: 1px;
    }
    #start-btn { color: #00cfd5; border-color: #00cfd5; }
    #start-btn:active { background: #00cfd5; color: white; transform: scale(0.95); }
    
    #reset-btn { color: #ff4757; border-color: #ff4757; }
    #reset-btn:active { background: #ff4757; color: white; transform: scale(0.95); }

    #download-btn { color: #ffb800; border-color: #ffb800; }
    #download-btn:active { background: #ffb800; color: white; transform: scale(0.95); }

    /* Toast Notification Animation */
    #toast-msg {
        position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%);
        background: #00cfd5; color: black; padding: 10px 20px; border-radius: 20px;
        font-weight: bold; z-index: 10001; display: none; 
        animation: fadeInOut 2s ease forwards; box-shadow: 0 0 20px rgba(0,207,213,0.5);
    }
    @keyframes fadeInOut {
        0% { opacity: 0; bottom: 80px; }
        20% { opacity: 1; bottom: 100px; }
        80% { opacity: 1; bottom: 100px; }
        100% { opacity: 0; bottom: 120px; }
    }
`;
document.head.appendChild(style);

// --- HTML INJECTION ---
const controlsHtml = `
    <div id="toast-msg">SENTENCE LOGGED! ⭐</div>
    <div id="gesture-controls" style="position: fixed; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; gap: 15px;">
        <button id="start-btn" class="demo-btn">START CAPTURE</button>
        <button id="reset-btn" class="demo-btn">CLEAR ALL</button>
        <button id="download-btn" class="demo-btn">DOWNLOAD LOG</button>
    </div>
    <div id="gesture-timer-overlay" style="
        position: absolute; top: 20px; left: 50%; transform: translateX(-50%); 
        width: 75px; height: 75px; border-radius: 50%; 
        background: rgba(0,0,0,0.85); color: #00cfd5; 
        display: none; align-items: center; justify-content: center; 
        border: 4px solid #00cfd5; z-index: 10000; pointer-events: none; flex-direction: column; transition: 0.5s;">
        <span id="timer-count" style="font-size: 28px; font-weight: bold;">7</span>
        <span style="font-size: 10px;">SEC</span>
    </div>
`;
document.body.insertAdjacentHTML('beforeend', controlsHtml);

// --- LOGIC LAYER ---
let capturedSigns = [];
let isTimerRunning = false;
let countdown = 10; 
let timerTask;

const showToast = () => {
    const toast = document.getElementById('toast-msg');
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2000);
};

document.getElementById('start-btn').addEventListener('click', () => {
    if (isTimerRunning) return;
    isTimerRunning = true;
    capturedSigns = [];
    countdown = 10;
    
    const overlay = document.getElementById('gesture-timer-overlay');
    overlay.style.display = 'flex';
    overlay.style.borderColor = '#00cfd5';
    overlay.style.color = '#00cfd5';

    timerTask = setInterval(() => {
        countdown--;
        document.getElementById('timer-count').innerText = countdown;

        // TRAFFIC LIGHT COLORS
        if (countdown === 3) {
            overlay.style.borderColor = '#ffb800'; // Yellow
            overlay.style.color = '#ffb800';
        } else if (countdown === 1) {
            overlay.style.borderColor = '#ff4757'; // Red
            overlay.style.color = '#ff4757';
        }

        if (countdown <= 0) {
            clearInterval(timerTask);
            isTimerRunning = false;
            overlay.style.display = 'none';
            if (capturedSigns.length > 0) {
                const finalStr = capturedSigns.join(" ").toUpperCase();
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(finalStr));
                if(document.getElementById('history-area')) document.getElementById('history-area').innerText = finalStr;
            }
        }
    }, 1000);
});

document.getElementById('reset-btn').addEventListener('click', () => {
    // 1. Find the text to save (Searching multiple possible IDs)
    const liveText = document.getElementById('main-sentence-text')?.innerText;
    const historyText = document.getElementById('history-area')?.innerText;
    
    // Choose whichever one has the actual sentence
    let finalSentence = "";
    if (liveText && liveText !== "---") finalSentence = liveText;
    else if (historyText && historyText !== "No history yet.") finalSentence = historyText;

    // 2. FORCE SAVE before clearing
    if (finalSentence !== "" && finalSentence !== "---") {
        console.log("Final Syncing: " + finalSentence);
        window.saveToHistoryFile(finalSentence);
        if (typeof showToast === "function") showToast();
    }

    // 3. CLEAR UI
    clearInterval(timerTask);
    isTimerRunning = false;
    capturedSigns = [];
    document.getElementById('gesture-timer-overlay').style.display = 'none';
    
    if (document.getElementById('main-sentence-text')) 
        document.getElementById('main-sentence-text').innerText = "---";
    if (document.getElementById('history-area')) 
        document.getElementById('history-area').innerText = "No history yet.";
});

document.getElementById('download-btn').addEventListener('click', () => {
    window.downloadHistory();
});

setInterval(() => {
    const mainText = document.getElementById('main-sentence-text');
    if (isTimerRunning && mainText && mainText.innerText !== "---") {
        const words = mainText.innerText.trim().split(/\s+/);
        words.forEach(w => { if (!capturedSigns.includes(w) && w !== "---") capturedSigns.push(w); });
    }
}, 300);