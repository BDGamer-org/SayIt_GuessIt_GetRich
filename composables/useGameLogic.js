import idiomData from '@/static/data/idioms.js';

export function useGameLogic() {
  // Prepare shuffled word list
  const fetchWords = () => {
    const allWords = [...idiomData];
    return allWords.sort(() => Math.random() - 0.5);
  };

  // Start accelerometer monitoring
  const startMotion = (onTilt) => {
    if (uni.stopAccelerometer) uni.stopAccelerometer();

    uni.startAccelerometer({
      interval: 'game',
      success: () => {
        uni.onAccelerometerChange((res) => {
          onTilt(res);
        });
      },
      fail: (err) => {
        console.error('Failed to start accelerometer', err);
      }
    });
  };

  // Stop accelerometer
  const stopMotion = () => {
    if (uni.stopAccelerometer) {
      uni.stopAccelerometer();
    }
  };

  // Handle accelerometer data
  const handleTilt = (res, isLocked, onCorrect, onPass, onReset) => {
    const z = res.z;
    const CORRECT_THRESHOLD = -5;
    const PASS_THRESHOLD = 7;
    const RESET_MIN = -2;
    const RESET_MAX = 5;

    if (isLocked) {
      if (z > RESET_MIN && z < RESET_MAX) {
        onReset();
      }
      return;
    }

    if (z < CORRECT_THRESHOLD) {
      onCorrect();
    } else if (z > PASS_THRESHOLD) {
      onPass();
    }
  };

  return {
    fetchWords,
    startMotion,
    stopMotion,
    handleTilt
  };
}
