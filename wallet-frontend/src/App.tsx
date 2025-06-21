import React, { useState } from 'react';
import albedo from '@albedo-link/intent';
import './App.css';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState('1,234.56'); // Örnek bakiye

  const connectWallet = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await albedo.publicKey({});
      
      if (result.pubkey) {
        setPublicKey(result.pubkey);
        setIsConnected(true);
      } else {
        throw new Error('Public key alınamadı.');
      }
    } catch (e: any) {
      if (e.message.includes('User rejected')) {
        setError('Bağlantı isteği reddedildi.');
      } else {
        setError('Cüzdan bağlanamadı.');
      }
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setPublicKey('');
  };

  return (
    <div className="App">
      <div className="wallet-container">
        {!isConnected ? (
          <>
            <h1>Stellar Cüzdan</h1>
            {error && <p className="error-message">{error}</p>}
            <button
              onClick={connectWallet}
              disabled={loading}
              className="action-button connect-button"
            >
              {loading ? 'Bağlanıyor...' : 'Cüzdanı Bağla'}
            </button>
          </>
        ) : (
          <div className="wallet-card">
            <div className="card-header">
              <h3>Hesabım</h3>
              <button onClick={disconnectWallet} className="disconnect-button-icon" title="Bağlantıyı Kes">
                &#x2715; 
              </button>
            </div>

            <div className="balance-section">
              <p className="balance-label">Toplam Bakiye</p>
              <p className="balance-amount">
                <span>$</span>{balance}
              </p>
            </div>

            <div className="wallet-actions">
              <button className="action-button action-button-secondary">
                Para Yatır
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
