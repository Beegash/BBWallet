import React, { useState } from 'react';
import './App.css';
import albedo from '@albedo-link/intent';
import WalletCard from './components/WalletCard';
import ProfileCard from './components/ProfileCard';
import ActionsCard from './components/ActionsCard';
import StreakCard from './components/StreakCard';

function App() {
  const [publicKey, setPublicKey] = useState('');
  const [error, setError] = useState('');

  const handleConnect = async () => {
    setError('');
    try {
      const result = await albedo.publicKey({});
      setPublicKey(result.pubkey);
    } catch (e: any) {
      console.error(e);
      if (e.message.includes('cancelled')) {
        setError('Cüzdan bağlantısı kullanıcı tarafından iptal edildi.');
      } else {
        setError('Cüzdan bağlanamadı. Lütfen tekrar deneyin.');
      }
    }
  };

  if (error) {
    return (
        <div className="connect-wallet-container">
            <div className="connect-wallet-box">
                <h1>Bir Sorun Oluştu</h1>
                <p>{error}</p>
                <button onClick={() => setError('')} className="connect-wallet-button">
                    Tekrar Dene
                </button>
            </div>
        </div>
    );
  }

  if (!publicKey) {
    return (
      <div className="connect-wallet-container">
          <div className="connect-wallet-box">
              <h1>Cüzdanınızı Bağlayın</h1>
              <p>Başlamak için lütfen Albedo cüzdanınızı bağlayın.</p>
              <button onClick={handleConnect} className="connect-wallet-button">
                  Albedo ile Bağlan
              </button>
          </div>
      </div>
    );
  }

  return (
    <div className="App">
      <main className="dashboard">
        <header className="dashboard-header">
          <h1>Kontrol Paneli</h1>
        </header>
        <WalletCard />
        <ProfileCard />
        <ActionsCard />
        <StreakCard />
      </main>
    </div>
  );
}

export default App;
