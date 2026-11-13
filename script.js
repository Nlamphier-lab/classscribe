const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const clearBtn = document.getElementById('clear-btn');
const transcriptBox = document.getElementById('transcript');
const notesBox = document.getElementById('notes');
const statusBadge = document.getElementById('status');

// Web Speech API setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isUserRecording = false; // Tracks whether the user intends to keep recording
let savedTranscript = '';    // Preserves text across auto-restarts

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  // Fires only when the microphone actually opens and starts listening
  recognition.onstart = () => {
    updateStatus(true);
  };

  recognition.onresult = (event) => {
    let sessionTranscript = '';
    for (let i = 0; i < event.results.length; i++) {
      sessionTranscript += event.results[i][0].transcript + ' ';
    }

    const fullTranscript = (savedTranscript + ' ' + sessionTranscript).trim();

    // Display raw live speech stream
    transcriptBox.innerText = fullTranscript;

    // Process transcript into structured key notes
    extractImportantNotes(fullTranscript);
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    
    // Surface actionable errors on the status badge instead of failing silently
    if (event.error === 'not-allowed') {
      isUserRecording = false;
      statusBadge.innerText = 'Mic Blocked';
      statusBadge.className = 'status-offline';
    } else if (event.error === 'network') {
      statusBadge.innerText = 'Network Error';
      statusBadge.className = 'status-offline';
    } else if (event.error !== 'no-speech') {
      statusBadge.innerText = `Error: ${event.error}`;
      statusBadge.className = 'status-offline';
    }
  };

  recognition.onend = () => {
    // Save whatever was transcribed in this segment before Chrome ended it
    savedTranscript = transcriptBox.innerText;

    // If the user hasn't clicked Stop, restart automatically (handles Chrome silence timeouts)
    if (isUserRecording) {
      try {
        recognition.start();
      } catch (e) {
        console.warn('Restarting recognition:', e);
      }
    } else {
      updateStatus(false);
    }
  };
} else {
  alert('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
}

startBtn.addEventListener('click', () => {
  if (recognition && !isUserRecording) {
    isUserRecording = true;
    statusBadge.innerText = 'Connecting...';
    try {
      recognition.start();
    } catch (err) {
      console.error('Start failed:', err);
    }
  }
});

stopBtn.addEventListener('click', () => {
  if (recognition) {
    isUserRecording = false;
    recognition.stop();
    updateStatus(false);
  }
});

clearBtn.addEventListener('click', () => {
  savedTranscript = '';
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

/**
 * Filters out filler speech and extracts key information using cue-phrase pattern matching
 */
function extractImportantNotes(text) {
  if (!text.trim()) {
    notesBox.innerText = '';
    return;
  }

  const sentences = text
    .split(/(?<=[.?!])\s+|(?<=\b(?:and|so|but|now)\b)\s+/)
    .map(s => cleanText(s.trim()))
    .filter(s => s.length > 15);

  const keyNotes = [];
  const definitions = [];
  const assignments = [];

  const priorityRegex = /\b(important|remember|exam|test|quiz|crucial|key point|make sure|note that|always|never|focus on)\b/i;
  const definitionRegex = /\b(is defined as|refers to|means|is called|known as|defined by|concept of)\b/i;
  const taskRegex = /\b(due|homework|read|chapter|assignment|project|for next class|by monday|by friday)\b/i;

  sentences.forEach((sentence) => {
    if (priorityRegex.test(sentence)) {
      if (!keyNotes.includes(sentence)) keyNotes.push(sentence);
    } else if (definitionRegex.test(sentence)) {
      if (!definitions.includes(sentence)) definitions.push(sentence);
    } else if (taskRegex.test(sentence)) {
      if (!assignments.includes(sentence)) assignments.push(sentence);
    }
  });

  let output = '';

  if (keyNotes.length > 0) {
    output += `⭐ KEY CONCEPTS & EXAM HIGHLIGHTS\n`;
    output += keyNotes.map(item => `• ${capitalize(item)}`).join('\n') + '\n\n';
  }

  if (definitions.length > 0) {
    output += `📚 DEFINITIONS & TERMS\n`;
    output += definitions.map(item => `• ${capitalize(item)}`).join('\n') + '\n\n';
  }

  if (assignments.length > 0) {
    output += `📌 ACTION ITEMS & ASSIGNMENTS\n`;
    output += assignments.map(item => `• ${capitalize(item)}`).join('\n') + '\n\n';
  }

  if (output === '') {
    const summarySentences = sentences.slice(-3);
    output = `📝 LECTURE SUMMARY\n` + summarySentences.map(item => `• ${capitalize(item)}`).join('\n');
  }

  notesBox.innerText = output;
}

function cleanText(str) {
  return str
    .replace(/\b(um|uh|you know|like|basically|actually|right|so yeah)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}
console.log("ClassScribe v2 loaded"); // Check Console to confirm new file is active

startBtn.addEventListener('click', () => {
  if (!recognition) return;

  if (!isUserRecording) {
    isUserRecording = true;
    statusBadge.innerText = 'Connecting...';
    try {
      recognition.start();
    } catch (err) {
      isUserRecording = false;
      statusBadge.innerText = 'Start Error';
      console.error('Start failed:', err);
    }
  }
});

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
