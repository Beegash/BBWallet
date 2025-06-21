import React from 'react';

const WalletCard = () => {
  return (
    <div className="card wallet-card">
      <h3 className="card-title">Toplam Bakiye</h3>
      <div className="balance">
        <span className="balance-currency">TRY</span>
        1,234.56
      </div>
    </div>
  );
};

export default WalletCard; 