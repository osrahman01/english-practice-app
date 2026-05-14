let activeUtterance = null;
let activeAudio = null;
let selectedVoice = null;
let debugLogging = false;
let voicesLoadPromise = null;
let lastUtteranceInfo = null;

const VOICE_STORAGE_KEY = "englishPractice.preferredVoice";
const DEFAULT_RATE = 0.95;
const SLOW_RATE = 0.76;
const DEFAULT_PITCH = 1;
const PREFERRED_LANGS = ["en-US", "en-GB", "en-AU", "en-CA"];
const QUALITY_TERMS = [
  "natural",
  "neural",
  "premium",
  "enhanced",
  "online",
  "google",
  "microsoft",
  "samantha",
  "daniel",
  "karen",
  "serena",
  "ava",
  "jenny",
  "aria",
  "guy",
  "libby",
  "sonia",
  "ryan",
  "oliver",
  "moira",
  "tessa",
  "veena",
  "fiona"
];
const ROBOTIC_TERMS = [
  "default",
  "compact",
  "espeak",
  "festival",
  "basic",
  "robot",
  "monotone"
];

initializeVoiceSelection();

export function playText(text, options = {}) {
  if (!text && !options.audioUrl) {
    return false;
  }

  stopSpeaking();
  if (options.audioUrl) {
    playStaticAudio(options.audioUrl, text, options);
    return true;
  }

  if (!canUseSpeechSynthesis()) {
    return false;
  }

  speakWhenVoicesAreReady(text, options);
  return true;
}

export function playSlow(text) {
  return playText(text, { rate: SLOW_RATE });
}

export function playLessonAudio(lesson, text, options = {}) {
  return playText(text, {
    ...options,
    audioUrl: lesson?.audioUrl
  });
}

export function playLessonAudioSlow(lesson, text) {
  return playLessonAudio(lesson, text, { rate: SLOW_RATE });
}

export function playTextWithVoiceName(text, voiceName, options = {}) {
  if (!canUseSpeechSynthesis() || !text) {
    return false;
  }

  const voice = getAvailableVoices().find((item) => item.name === voiceName);
  return playText(text, {
    ...options,
    voice
  });
}

async function speakWhenVoicesAreReady(text, options = {}) {
  await ensureVoicesReady();
  const voice = options.voice || refreshSelectedVoice();
  const utterance = new window.SpeechSynthesisUtterance(cleanText(text));

  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = "en-US";
  }
  utterance.rate = options.rate || DEFAULT_RATE;
  utterance.pitch = options.pitch || DEFAULT_PITCH;
  activeUtterance = utterance;
  lastUtteranceInfo = {
    selectedVoice: selectedVoice?.name || null,
    utteranceVoice: utterance.voice?.name || null,
    utteranceVoiceLang: utterance.voice?.lang || null,
    utteranceLang: utterance.lang,
    rate: utterance.rate,
    pitch: utterance.pitch,
    text: cleanText(text)
  };
  logDebug("Speaking utterance", lastUtteranceInfo);
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute("src");
    activeAudio.load();
    activeAudio = null;
  }

  if (canUseSpeechSynthesis()) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

export function getSpeechRecognitionAdapter() {
  if (typeof window === "undefined") {
    return null;
  }

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    return null;
  }

  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;

  return {
    start({ onResult, onError, onEnd } = {}) {
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript || "")
          .join(" ")
          .trim();
        onResult?.({ transcript, rawEvent: event });
      };
      recognition.onerror = (event) => onError?.(event);
      recognition.onend = () => onEnd?.();
      recognition.start();
    },
    stop() {
      recognition.stop();
    }
  };
}

export function getSelectedVoiceInfo() {
  refreshSelectedVoice();
  return selectedVoice
    ? {
        name: selectedVoice.name,
        lang: selectedVoice.lang,
        localService: selectedVoice.localService
      }
    : null;
}

export function setTtsDebugLogging(enabled) {
  debugLogging = Boolean(enabled);
}

export function getTtsDebugSnapshot() {
  refreshSelectedVoice();
  return {
    supported: canUseSpeechSynthesis(),
    selectedVoice: getSelectedVoiceInfo(),
    utterance: {
      rate: DEFAULT_RATE,
      slowRate: SLOW_RATE,
      pitch: DEFAULT_PITCH,
      lang: selectedVoice?.lang || "en-US",
      voiceName: selectedVoice?.name || null,
      lastSpoken: lastUtteranceInfo
    },
    staticAudio: {
      activeUrl: activeAudio?.currentSrc || activeAudio?.src || null
    },
    voices: getAvailableVoices().map((voice) => ({
      name: voice.name,
      lang: voice.lang,
      localService: voice.localService,
      default: voice.default,
      score: scoreVoice(voice)
    }))
  };
}

function playStaticAudio(audioUrl, fallbackText, options = {}) {
  if (typeof Audio === "undefined") {
    logDebug("Static audio unavailable; falling back to browser TTS", { audioUrl });
    speakWhenVoicesAreReady(fallbackText, options);
    return;
  }

  const audio = new Audio(audioUrl);
  activeAudio = audio;
  logDebug("Playing static audio", { audioUrl });

  audio.addEventListener("error", () => {
    logDebug("Static audio failed; falling back to browser TTS", {
      audioUrl,
      error: audio.error?.message || audio.error?.code || "unknown"
    });
    if (activeAudio === audio) {
      activeAudio = null;
    }
    speakWhenVoicesAreReady(fallbackText, options);
  }, { once: true });

  audio.addEventListener("ended", () => {
    if (activeAudio === audio) {
      activeAudio = null;
    }
  }, { once: true });

  const playPromise = audio.play();
  if (playPromise?.catch) {
    playPromise.catch((error) => {
      logDebug("Static audio play rejected; falling back to browser TTS", {
        audioUrl,
        error: error?.message || "unknown"
      });
      if (activeAudio === audio) {
        activeAudio = null;
      }
      speakWhenVoicesAreReady(fallbackText, options);
    });
  }
}

export async function waitForVoices() {
  await ensureVoicesReady();
  return getTtsDebugSnapshot();
}

function initializeVoiceSelection() {
  if (!canUseSpeechSynthesis()) {
    return;
  }

  refreshSelectedVoice();
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    logDebug("speechSynthesis voiceschanged fired");
    voicesLoadPromise = null;
    refreshSelectedVoice({ allowUpgrade: true });
  });
}

function refreshSelectedVoice({ allowUpgrade = true } = {}) {
  if (!canUseSpeechSynthesis()) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) {
    return selectedVoice;
  }

  const bestVoice = chooseBestEnglishVoice(voices);
  const savedVoiceName = localStorage.getItem(VOICE_STORAGE_KEY);
  const savedVoice = voices.find((voice) => voice.name === savedVoiceName);

  if (!selectedVoice && savedVoice) {
    selectedVoice = savedVoice;
  }

  if (!selectedVoice || allowUpgrade && bestVoice && scoreVoice(bestVoice) > scoreVoice(selectedVoice)) {
    selectedVoice = bestVoice;
  }

  if (!selectedVoice) {
    selectedVoice = bestVoice || voices.find((voice) => voice.lang?.toLowerCase().startsWith("en")) || voices[0];
  }

  if (selectedVoice) {
    localStorage.setItem(VOICE_STORAGE_KEY, selectedVoice.name);
    logDebug("Selected TTS voice", {
      name: selectedVoice.name,
      lang: selectedVoice.lang,
      localService: selectedVoice.localService,
      default: selectedVoice.default,
      score: scoreVoice(selectedVoice)
    });
  }

  return selectedVoice;
}

function ensureVoicesReady() {
  if (!canUseSpeechSynthesis()) {
    return Promise.resolve([]);
  }

  const existingVoices = getAvailableVoices();
  if (existingVoices.length) {
    refreshSelectedVoice({ allowUpgrade: true });
    return Promise.resolve(existingVoices);
  }

  if (!voicesLoadPromise) {
    voicesLoadPromise = new Promise((resolve) => {
      const finish = () => {
        const voices = getAvailableVoices();
        refreshSelectedVoice({ allowUpgrade: true });
        resolve(voices);
      };

      const timeout = window.setTimeout(finish, 1200);
      window.speechSynthesis.addEventListener("voiceschanged", () => {
        window.clearTimeout(timeout);
        finish();
      }, { once: true });
    });
  }

  return voicesLoadPromise;
}

function getAvailableVoices() {
  if (!canUseSpeechSynthesis()) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

function chooseBestEnglishVoice(voices) {
  return voices
    .filter((voice) => voice.lang?.toLowerCase().startsWith("en"))
    .sort((a, b) => scoreVoice(b) - scoreVoice(a))[0] || null;
}

function scoreVoice(voice) {
  if (!voice) {
    return -Infinity;
  }

  const name = voice.name.toLowerCase();
  const lang = voice.lang || "";
  let score = 0;

  if (lang === "en-US") score += 82;
  else if (lang === "en-GB") score += 76;
  else if (lang === "en-AU") score += 70;
  else if (lang === "en-CA") score += 66;
  else if (PREFERRED_LANGS.includes(lang)) score += 60;
  if (lang.toLowerCase().startsWith("en")) score += 40;
  if (voice.localService === false) score += 12;
  if (voice.default) score -= 18;

  QUALITY_TERMS.forEach((term, index) => {
    if (name.includes(term)) {
      score += 44 - Math.min(index, 20);
    }
  });

  ROBOTIC_TERMS.forEach((term) => {
    if (name.includes(term)) {
      score -= 35;
    }
  });

  if (name.includes("google us english")) score += 20;
  if (name.includes("microsoft") && name.includes("online")) score += 20;
  if (name.includes("zira")) score += 18;
  if (name.includes("mark")) score += 14;
  if (name.includes("samantha")) score += 18;
  if (name.includes("serena")) score += 16;
  if (name.includes("david")) score -= 8;
  if (name.includes("english") && !name.includes("default")) score += 8;

  return score;
}

function canUseSpeechSynthesis() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function logDebug(message, payload) {
  if (debugLogging || isDebugUrlEnabled()) {
    console.log(`[TTS Debug] ${message}`, payload || "");
  }
}

function isDebugUrlEnabled() {
  return typeof window !== "undefined" &&
    Boolean(window.location?.search) &&
    new URLSearchParams(window.location.search).get("debugTts") === "1";
}

function cleanText(value) {
  return String(value || "")
    .replaceAll("\u2018", "'")
    .replaceAll("\u2019", "'")
    .replaceAll("\u201c", "\"")
    .replaceAll("\u201d", "\"")
    .replaceAll("\u2013", "-")
    .replaceAll("\u2014", "-")
    .replaceAll("\u00e2\u20ac\u2122", "'")
    .replaceAll("\u00e2\u20ac\u0153", "\"")
    .replaceAll("\u00e2\u20ac\u009d", "\"")
    .replaceAll("\u00e2\u20ac\u201c", "-")
    .replaceAll("\u00e2\u20ac\u201d", "-");
}
