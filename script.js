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
    let fullTranscript = '';
    for (let i = 0; i < event.results.length; i++) {
      fullTranscript += event.results[i][0].transcript + ' ';
    }
    
    // Display raw live speech stream
    transcriptBox.innerText = fullTranscript;
    
    // Process transcript into structured key notes
    extractImportantNotes(fullTranscript);
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

/**
 * Filters out filler speech and extracts key information using cue-phrase pattern matching
 */
function extractImportantNotes(text) {
  if (!text.trim()) {
    notesBox.innerText = '';
    return;
  }

  // Split into individual sentences or clauses
  const sentences = text
    .split(/(?<=[.?!])\s+|(?<=\b(?:and|so|but|now)\b)\s+/)
    .map(s => cleanText(s.trim()))
    .filter(s => s.length > 15); // Ignore short conversational blurbs

  const keyNotes = [];
  const definitions = [];
  const assignments = [];

  // Keywords that signal high-value lecture content
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

  // Build the formatted structured note output
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

  // If no specific cue words matched yet, show clean top-level takeaways
  if (output === '') {
    const summarySentences = sentences.slice(-3); // Show the last few substantial points
    output = `📝 LECTURE SUMMARY\n` + summarySentences.map(item => `• ${capitalize(item)}`).join('\n');
  }

  notesBox.innerText = output;
}

// Helper: Strip conversational filler words
function cleanText(str) {
  return str
    .replace(/\b(um|uh|you know|like|basically|actually|right|so yeah)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Helper: Capitalize sentence start
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(
