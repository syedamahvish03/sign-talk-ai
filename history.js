// history.js - The Bulletproof Data Vault
window.sentenceLog = []; 

window.saveToHistoryFile = function(text) {
    if (!text || text === "---" || text.includes("No history yet")) return;
    
    const entry = {
        time: new Date().toLocaleTimeString(),
        text: text.trim()
    };
    
    window.sentenceLog.push(entry);
    console.log("⭐ DATA LOCKED IN HISTORY:", entry);
};

window.downloadHistory = function() {
    if (window.sentenceLog.length === 0) {
        alert("Wait! The log is empty. You must sign a sentence and click CLEAR ALL first to save it.");
        return;
    }
    
    let content = "GESTURE TALK AI - SESSION HISTORY\n";
    content += "====================================\n\n";
    
    window.sentenceLog.forEach((item, i) => {
        content += `${i + 1}. [${item.time}] ${item.text}\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "Gesture_History.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log("💾 .txt file generated successfully!");
};