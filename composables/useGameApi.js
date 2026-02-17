const API_BASE_URL = 'https://sgit-api.bdgamer.org';

export function useGameApi() {
  // Register new player with username and password
  const register = (username, password, onSuccess, onError) => {
    uni.request({
      url: `${API_BASE_URL}/api/register`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: {
        username: username.trim(),
        password: password
      },
      success: (res) => {
        if (res.statusCode === 200 || res.statusCode === 201) {
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

  // Login with username and password
  const login = (username, password, onSuccess, onError) => {
    uni.request({
      url: `${API_BASE_URL}/api/login`,
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      data: {
        username: username.trim(),
        password: password
      },
      success: (res) => {
        if (res.statusCode === 200) {
          onSuccess(res.data);
        } else {
          onError(res.data.error || '用户名或密码错误');
        }
      },
      fail: (err) => {
        console.error('Login error:', err);
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
  const fetchWordBank = (category, options = {}, onSuccess, onError) => {
    const { limit = 320, excludeIds = [] } = options;
    const params = [];
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    params.push(`limit=${encodeURIComponent(String(limit))}`);
    if (Array.isArray(excludeIds) && excludeIds.length) {
      params.push(`exclude=${encodeURIComponent(excludeIds.join(','))}`);
    }
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
    login,
    fetchHistory,
    submitScore,
    fetchWordBank
  };
}
