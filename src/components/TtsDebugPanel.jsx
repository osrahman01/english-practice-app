import { useEffect, useMemo, useState } from "react";
import {
  getTtsDebugSnapshot,
  playText,
  playTextWithVoiceName,
  setTtsDebugLogging,
  waitForVoices
} from "../services/speechService.js";

const TEST_PHRASE = "This is a voice test for English communication practice.";

function TtsDebugPanel() {
  const [snapshot, setSnapshot] = useState(() => getTtsDebugSnapshot());
  const englishVoices = useMemo(() => (
    snapshot.voices.filter((voice) => voice.lang?.toLowerCase().startsWith("en"))
  ), [snapshot.voices]);

  useEffect(() => {
    setTtsDebugLogging(true);
    let mounted = true;
    waitForVoices().then((nextSnapshot) => {
      if (mounted) setSnapshot(nextSnapshot);
    });

    const refresh = () => setSnapshot(getTtsDebugSnapshot());
    window.speechSynthesis?.addEventListener("voiceschanged", refresh);

    return () => {
      mounted = false;
      window.speechSynthesis?.removeEventListener("voiceschanged", refresh);
      setTtsDebugLogging(false);
    };
  }, []);

  const refresh = async () => {
    setSnapshot(await waitForVoices());
  };

  return (
    <aside className="tts-debug-panel" aria-label="TTS debug panel">
      <div className="tts-debug-header">
        <div>
          <strong>Debug TTS</strong>
          <span>Visible only with ?debugTts=1</span>
        </div>
        <button className="secondary-button" type="button" onClick={refresh}>Refresh voices</button>
      </div>

      <div className="tts-debug-summary">
        <div><span>Selected voice</span><strong>{snapshot.selectedVoice?.name || "None"}</strong></div>
        <div><span>Selected lang</span><strong>{snapshot.selectedVoice?.lang || "n/a"}</strong></div>
        <div><span>Utterance</span><strong>{snapshot.utterance.rate} / {snapshot.utterance.pitch} / {snapshot.utterance.lang}</strong></div>
        <div><span>Voices</span><strong>{snapshot.voices.length}</strong></div>
      </div>

      {snapshot.utterance.lastSpoken ? (
        <div className="tts-debug-last">
          <strong>Last spoken utterance</strong>
          <span>utterance.voice: {snapshot.utterance.lastSpoken.utteranceVoice || "none"}</span>
          <span>voice lang: {snapshot.utterance.lastSpoken.utteranceVoiceLang || "none"}</span>
          <span>utterance.lang: {snapshot.utterance.lastSpoken.utteranceLang}</span>
          <span>rate: {snapshot.utterance.lastSpoken.rate} | pitch: {snapshot.utterance.lastSpoken.pitch}</span>
        </div>
      ) : null}

      <div className="tts-debug-actions">
        <button className="primary-button" type="button" onClick={() => {
          playText(TEST_PHRASE);
          window.setTimeout(() => setSnapshot(getTtsDebugSnapshot()), 100);
        }}>
          Test selected voice
        </button>
      </div>

      <div className="tts-debug-list">
        {snapshot.voices.map((voice) => (
          <div className={voice.name === snapshot.selectedVoice?.name ? "tts-debug-row active" : "tts-debug-row"} key={`${voice.name}-${voice.lang}`}>
            <div>
              <strong>{voice.name}</strong>
              <span>{voice.lang} | localService: {String(voice.localService)} | default: {String(voice.default)} | score: {voice.score}</span>
            </div>
            {voice.lang?.toLowerCase().startsWith("en") ? (
              <button className="secondary-button" type="button" onClick={() => {
                playTextWithVoiceName(TEST_PHRASE, voice.name);
                window.setTimeout(() => setSnapshot(getTtsDebugSnapshot()), 100);
              }}>
                Test
              </button>
            ) : null}
          </div>
        ))}
        {!snapshot.voices.length ? <p>No voices loaded yet. Click Refresh voices or try Play once.</p> : null}
      </div>

      <p className="tts-debug-note">
        English voices: {englishVoices.length}. Check the browser console for utterance.voice, utterance.lang, rate, and pitch logs.
      </p>
    </aside>
  );
}

export default TtsDebugPanel;
