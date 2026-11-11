const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const clearBtn = document.getElementById('clear-btn');
const transcriptBox = document.getElementById('transcript');
const notesBox = document.getElementById('notes');
const statusBadge = document.getElementById('status');

// Web Speech API setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let currentTranscript = '';
    for (let i = 0; i < event.results.length; i++) {
      currentTranscript += event.results[i][0].transcript + ' ';
    }
    transcriptBox.innerText = currentTranscript;
    generateSimpleNotes(currentTranscript);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.onend = () => {
    updateStatus(false);
  };
} else {
  alert('Web Speech API is not supported in this browser. Try Google Chrome.');
}

startBtn.addEventListener('click', () => {
  if (recognition) {
    recognition.start();
    updateStatus(true);
  }
});

stopBtn.addEventListener('click', () => {
  if (recognition) {
    recognition.stop();
    updateStatus(false);
  }
});

clearBtn.addEventListener('click', () => {
  transcriptBox.innerText = '';
  notesBox.innerText = '';
});

function updateStatus(isRecording) {
  startBtn.disabled = isRecording;
  stopBtn.disabled = !isRecording;
  if (isRecording) {
    statusBadge.innerText = 'Listening...';
    statusBadge.className = 'status-online';
  } else {
    statusBadge.innerText = 'Offline';
    statusBadge.className = 'status-offline';
  }
}

// Basic client-side note extraction demo
function generateSimpleNotes(text) {
  const sentences = text.split('.').filter(s => s.trim().length > 0);
  if (sentences.length === 0) return;

  let bulletPoints = sentences.map(sentence => `• ${sentence.trim()}`).join('\n');
  notesBox.innerText = `Key Takeaways:\n\n${bulletPoints}`;
}
