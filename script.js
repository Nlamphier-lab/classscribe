const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const clearBtn = document.getElementById('clear-btn');
const transcriptBox = document.getElementById('transcript');
const notesBox = document.getElementById('notes');
const statusBadge = document.getElementById('status');

// Web Speech API initialization
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

// Persistent session state
let fullFinalTranscript = '';

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let interimTranscript = '';
    let currentFinalTranscript = '';

    // Reconstruct the full audio record from the start of the session
    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        currentFinalTranscript += result[0].transcript + ' ';
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    fullFinalTranscript = currentFinalTranscript;

    // Display the entire session transcript (Final + Interim)
    const entireText = fullFinalTranscript + interimTranscript;
    transcriptBox.innerText = entireText;
    
    // Smooth auto-scroll down to follow live captions unless user scrolled up
    autoScroll(transcriptBox);

    // Build structured study notes from finalized text
    buildStudyNotes(fullFinalTranscript);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.onend = () => {
    updateStatus(false);
  };
} else {
  alert('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
}

// Event Listeners
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
  full
