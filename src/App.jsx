import { useState, useEffect, useCallback } from 'react';
import './App.css';

const APIS = [
  { id: 'chatbot', name: 'Unicharge Chatbot', url: 'https://unicharge-chatbot-24.onrender.com' },
  { id: 'resumyzer', name: 'Resumyzer', url: 'https://resumyzer-24.onrender.com' },
  { id: 'spam', name: 'Spam Classifier', url: 'https://sms-spam-classifier-24.onrender.com' },
  { id: 'wallet', name: 'Personalised Wallet', url: 'https://unicharge-wallet-24.onrender.com/' },
];

function App() {
  const [statuses, setStatuses] = useState({}); // { id: 'idle' | 'waking' | 'done' | 'error' }
  const [isAuto, setIsAuto] = useState(false);

  const wakeApi = useCallback(async (api) => {
    setStatuses(prev => ({ ...prev, [api.id]: 'waking' }));
    try {
      // Using no-cors to avoid CORS errors since we just want to trigger the wake-up
      await fetch(api.url, { mode: 'no-cors' });
      setStatuses(prev => ({ ...prev, [api.id]: 'done' }));
    } catch (error) {
      console.error(`Error waking ${api.name}:`, error);
      setStatuses(prev => ({ ...prev, [api.id]: 'error' }));
    }
  }, []);

  const wakeAll = () => {
    APIS.forEach(api => {
      if (statuses[api.id] !== 'done' && statuses[api.id] !== 'waking') {
        wakeApi(api);
      }
    });
  };

  useEffect(() => {
    let interval;
    if (isAuto) {
      const runAutoWake = () => {
        APIS.forEach(api => wakeApi(api));
      };

      runAutoWake(); // Run immediately when enabled
      interval = setInterval(runAutoWake, 180000); // 3 minutes
    }
    return () => clearInterval(interval);
  }, [isAuto, wakeApi]);

  return (
    <div className="container">
      <header>
        <h1>API Waker</h1>
        <p>Wake up your Render services instantly.</p>
      </header>

      <div className="actions">
        <button className="wake-all-btn" onClick={wakeAll}>
          Wake All APIs 🚀
        </button>
      </div>

      <div className="controls">
        <label className="auto-switch">
          <input
            type="checkbox"
            checked={isAuto}
            onChange={(e) => setIsAuto(e.target.checked)}
          />
          <span className="slider"></span>
          <span className="label-text">Keep Alive (Every 3m)</span>
        </label>
      </div>

      <div className="api-list">
        {APIS.map(api => {
          const status = statuses[api.id] || 'idle';
          return (
            <div key={api.id} className={`api-card ${status}`}>
              <div className="api-info">
                <h2>{api.name}</h2>
                <span className="status-badge">
                  {status === 'idle' && 'Sleeping zzz'}
                  {status === 'waking' && 'Waking up...'}
                  {status === 'done' && 'Active ✅'}
                  {status === 'error' && 'Error ❌'}
                </span>
              </div>
              <button
                className="wake-btn"
                onClick={() => wakeApi(api)}
                disabled={status === 'waking'}
              >
                {status === 'waking' ? '...' : 'Start'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
