import * as Speech from 'expo-speech';

/**
 * Reads aloud the 4-digit arrival safety code at a clear, comfortable cadence for senior users.
 * Example: "Your arrival safety code is 1 - 5 - 3 - 6."
 */
export const speakSafetyPin = (pin: string, onDone?: () => void) => {
  if (!pin) return;
  
  // Space out the digits so the TTS engine pronounces individual digits clearly rather than a thousands number
  const spacedDigits = pin.trim().split('').join(' , ');
  const message = `Your arrival safety code is, ${spacedDigits}.`;

  try {
    Speech.stop();
    Speech.speak(message, {
      rate: 0.82, // Slower, clearer cadence for seniors
      pitch: 1.0,
      language: 'en-US',
      onDone,
      onError: () => onDone?.(),
    });
  } catch (err) {
    console.warn('Speech synthesis unavailable:', err);
    onDone?.();
  }
};

export const stopSpeech = () => {
  try {
    Speech.stop();
  } catch {}
};
