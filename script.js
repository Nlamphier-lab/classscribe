// 1. Handle Chrome's webkit prefix
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

// Update these selectors to match your actual HTML IDs/classes
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const clearBtn = document.getElementById('clear-btn');
const statusBadge = document.getElementById('status-badge');
const transcriptBox = document.getElementById('transcript');

if (!SpeechRecognition) {
  alert("Your browser does not support the Web Speech API. Please use Chrome or Edge.");
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;      // Keep listening until stopped
  recognition.interimResults = true;  // Show words as they are spoken
  recognition.lang = 'en-US';

  let finalTranscript = '';

  // 2. Update UI when listening actually begins
  recognition.onstart = () => {
    statusBadge.textContent = 'Listening...';
    statusBadge.style.backgroundColor = '#22c55e'; // Green
    startBtn.disabled = true;
    stopBtn.disabled = false;
  };

  // 3. Reset UI when stopped or disconnected
  recognition.onend = () => {
    statusBadge.textContent = 'Offline';
    statusBadge.style.backgroundColor = '#ef4444'; // Red
    startBtn.disabled = false;
    stopBtn.disabled = true;
  };

  // 4. Catch microphone or network errors
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    statusBadge.textContent = `Error: ${event.error}`;
  };

  // 5. Render live text
  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += transcript + ' ';
      } else {
        interimTranscript += transcript;
      }
    }
    transcriptBox.innerHTML = `${finalTranscript}<span style="opacity: 0.6;">${interimTranscript}</span>`;
  };

  // Button Listeners
  startBtn.addEventListener('click', () => recognition.start());
  stopBtn.addEventListener('click', () => recognition.stop());
  clearBtn.addEventListener('click', () => {
    finalTranscript = '';
    transcriptBox.textContent = 'Spoken lecture text will appear here in real-time...';
  });
}
