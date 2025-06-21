import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [publicKey, setPublicKey] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Freighter'ın yüklenmesi için küçük bir gecikme sonrası kontrol et
    const timer = setTimeout(() => {
      if (window.freighterApi) {
        checkConnection();
      } else {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    try {
      const connected = await window.freighterApi!.isConnected();
      if (connected) {
        const key = await window.freighterApi!.getPublicKey();
        setPublicKey(key);
        setIsConnected(true);
      }
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    setError('');
    setLoading(true);
    try {
      if (window.freighterApi) {
        await window.freighterApi.connect();
        await checkConnection();
      } else {
        setError('Freighter eklentisi bulunamadı. Lütfen kurup sayfayı yenileyin.');
      }
    } catch (e: any) {
      setError(e.message || 'Bağlantı isteği reddedildi.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="container">
          <h1>Freighter Kontrol Ediliyor...</h1>
          <div className="loader"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="App">
      <div className="container">
        <header className="App-header">
          <h1>Freighter Cüzdan Bağlantısı</h1>
          <p>Stellar cüzdanınızı güvenle bağlayın.</p>
        </header>

        {isConnected ? (
          <div className="wallet-info">
            <h2>Bağlantı Başarılı! ✅</h2>
            <p><strong>Cüzdan Adresiniz:</strong></p>
            <div className="public-key">{publicKey}</div>
          </div>
        ) : (
          <div className="connect-wallet">
            <h2>Cüzdanınızı Bağlayın</h2>
            <p>Devam etmek için lütfen Freighter cüzdanınıza bağlanın.</p>
            <button onClick={connectWallet} className="connect-button">
              🔗 Freighter ile Bağlan
            </button>
            {!window.freighterApi && (
              <p className="install-freighter">
                Freighter yüklü değil mi? <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer">Hemen yükleyin</a>.
              </p>
            )}
          </div>
        )}

        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default App;
