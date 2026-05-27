export const playAlertSound = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Settings for a professional sounding alert (e.g. airport/hospital desk chime)
        const oscillator1 = audioCtx.createOscillator();
        const oscillator2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator1.type = 'sine';
        oscillator1.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        
        oscillator2.type = 'sine';
        oscillator2.frequency.setValueAtTime(1108.73, audioCtx.currentTime); // C#6 (Major third higher)

        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05); // quick fade in
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2); // smooth fade out

        oscillator1.connect(gainNode);
        oscillator2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator1.start();
        oscillator2.start();
        
        // Second chime
        setTimeout(() => {
            if (audioCtx.state === 'running') {
                const osc3 = audioCtx.createOscillator();
                const gain3 = audioCtx.createGain();
                
                osc3.type = 'sine';
                osc3.frequency.setValueAtTime(1318.51, audioCtx.currentTime); // E6
                
                gain3.gain.setValueAtTime(0, audioCtx.currentTime);
                gain3.gain.linearRampToValueAtTime(0.4, audioCtx.currentTime + 0.05);
                gain3.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
                
                osc3.connect(gain3);
                gain3.connect(audioCtx.destination);
                
                osc3.start();
                osc3.stop(audioCtx.currentTime + 1.5);
            }
        }, 200);

        oscillator1.stop(audioCtx.currentTime + 1.5);
        oscillator2.stop(audioCtx.currentTime + 1.5);
    } catch (e) {
        console.log("AudioContext not supported or blocked: ", e);
    }
};
