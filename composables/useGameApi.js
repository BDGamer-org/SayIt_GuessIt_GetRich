const API_BASE_URL = 'https://sgit-api.bdgamer.org';

export function useGameApi() {
  // Register new player
  const register = (playerName, onSuccess, onError) => {
    uni.request({
      url: `${API_BASE_URL}/api/register`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { player_name: playerName.trim() },
      success: (res) => {
        if (res.statusCode === 200) {
          onSuccess(res.data);
        } else {
          onError(res.data.error || '注册失败');
        }
      },
      fail: (err) => {
        console.error('Register error:', err);
        onError('网络错误');
      }
    });
  };

  // Recover account by backup code
  const recover = (backupCode, onSuccess, onError) => {
    uni.request({
      url: `${API_BASE_URL}/api/recover`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: { backup_code: backupCode.trim().toUpperCase() },
      success: (res) => {
        if (res.statusCode === 200) {
          onSuccess(res.data);
        } else {
          onError(res.data.error || '无效的备份码');
        }
      },
      fail: (err) => {
        console.error('Recover error:', err);
        onError('网络错误');
      }
    });
  };

  // Get user history
  const fetchHistory = (playerId, onSuccess, onError) => {
    uni.request({
      url: `${API_BASE_URL}/api/history`,
      header: { 'X-Player-ID': playerId },
      success: (res) => {
        if (res.statusCode === 200) {
          onSuccess(res.data);
        } else {
          onError('加载失败');
        }
      },
      fail: (err) => {
        console.error('Fetch error:', err);
        onError('网络错误');
      }
    });
  };

  // Submit score
  const submitScore = (playerId, score, onSuccess, onError) => {
    uni.request({
      url: `${API_BASE_URL}/api/score`,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'X-Player-ID': playerId
      },
      data: { score },
      success: (res) => {
        if (res.statusCode === 200) {
          onSuccess();
        } else {
          onError(res.data.error || '上传失败');
        }
      },
      fail: (err) => {
        console.error('Submit error:', err);
        onError('网络错误');
      }
    });
  };

  // Fetch word bank from backend
  const fetchWordBank = (category, onSuccess, onError) => {
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    params.push('limit=10000');
    const query = params.length ? `?${params.join('&')}` : '';

    uni.request({
      url: `${API_BASE_URL}/api/words${query}`,
      success: (res) => {
        if (res.statusCode === 200 && Array.isArray(res.data)) {
          onSuccess(res.data);
          return;
        }
        onError(res.data?.error || '词库加载失败');
      },
      fail: (err) => {
        console.error('Fetch word bank error:', err);
        onError('网络错误');
      }
    });
  };

  return {
    register,
    recover,
    fetchHistory,
    submitScore,
    fetchWordBank
  };
}
