import idiomData from '@/static/data/idioms.js';
import lifeData from '@/static/data/life_fixed.js';

export function useGameLogic() {
  // Trigger immediately once z leaves the vertical range.
  const TRIGGER_MIN = -2;
  const TRIGGER_MAX = 5;
  // Reset lock only when device is close to vertical (hysteresis).
  const RESET_MIN = -1.2;
  const RESET_MAX = 2.2;
  // Freeze window after each trigger to avoid repeated accidental triggers.
  const FREEZE_MS = 1000;
  // Ignore noisy bumps / knocks: acceleration magnitude should stay near gravity.
  const G_NORMALIZED_MIN = 0.75;
  const G_NORMALIZED_MAX = 1.25;
  const G_MPS2_MIN = 7.5;
  const G_MPS2_MAX = 13.5;

  let accelerometerListener = null;
  let lastTriggerAt = 0;

  const getLocalWords = (category = 'idiom') => {
    if (category === 'life') {
      return lifeData;
    }
    return idiomData;
  };

  // Prepare shuffled word list
  const fetchWords = (options = {}) => {
    const { excludeIds, sourceWords, category = 'idiom' } = options;
    const localWords = getLocalWords(category);
    const baseWords = Array.isArray(sourceWords) && sourceWords.length ? sourceWords : localWords;
    let allWords = [...baseWords];

    if (excludeIds && excludeIds.size) {
      allWords = allWords.filter((w) => !excludeIds.has(w.word_id));
      if (allWords.length === 0) {
        allWords = [...baseWords];
      }
    }

    return allWords.sort(() => Math.random() - 0.5);
  };

  // Start accelerometer monitoring
  const startMotion = (onTilt) => {
    lastTriggerAt = 0;

    if (uni.offAccelerometerChange && accelerometerListener) {
      uni.offAccelerometerChange(accelerometerListener);
      accelerometerListener = null;
    }
    if (uni.stopAccelerometer) uni.stopAccelerometer();

    uni.startAccelerometer({
      interval: 'game',
      success: () => {
        accelerometerListener = (res) => {
          onTilt(res);
        };
        uni.onAccelerometerChange(accelerometerListener);
      },
      fail: (err) => {
        console.error('Failed to start accelerometer', err);
      }
    });
  };

  // Stop accelerometer
  const stopMotion = () => {
    if (uni.offAccelerometerChange && accelerometerListener) {
      uni.offAccelerometerChange(accelerometerListener);
      accelerometerListener = null;
    }
    if (uni.stopAccelerometer) {
      uni.stopAccelerometer();
    }
  };

  // Handle accelerometer data
  const handleTilt = (res, isLocked, onCorrect, onPass, onReset) => {
    const x = Number(res.x || 0);
    const y = Number(res.y || 0);
    const z = Number(res.z || 0);
    const maxAxis = Math.max(Math.abs(x), Math.abs(y), Math.abs(z));
    const g = Math.sqrt(x * x + y * y + z * z);
    // Some Android devices report normalized gravity in [-1, 1], others in m/s^2.
    const scale = maxAxis <= 2 ? 9.8 : 1;
    const zForJudge = z * scale;
    const isNormalized = maxAxis <= 2;
    const isStableGravity = isNormalized
      ? g >= G_NORMALIZED_MIN && g <= G_NORMALIZED_MAX
      : g >= G_MPS2_MIN && g <= G_MPS2_MAX;
    const now = Date.now();
    const inFreeze = now - lastTriggerAt < FREEZE_MS;

    if (isLocked) {
      if (inFreeze) return;
      if (zForJudge > RESET_MIN && zForJudge < RESET_MAX) {
        onReset();
      }
      return;
    }

    if (inFreeze || !isStableGravity) return;

    if (zForJudge < TRIGGER_MIN) {
      lastTriggerAt = now;
      onCorrect();
      return;
    }

    if (zForJudge > TRIGGER_MAX) {
      lastTriggerAt = now;
      onPass();
      return;
    }
  };

  return {
    getLocalWords,
    fetchWords,
    startMotion,
    stopMotion,
    handleTilt
  };
}
