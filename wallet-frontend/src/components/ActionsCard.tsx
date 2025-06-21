import React from 'react';

// SVG İkonları
const DepositIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14" />
    <path d="m19 12-7 7-7-7" />
  </svg>
);

const WithdrawIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </svg>
);

const ActionsCard = () => {
  return (
    <div className="card actions-card">
      <button className="action-button deposit-button">
        <DepositIcon />
        Para Yatır
      </button>
      <button className="action-button withdraw-button">
        <WithdrawIcon />
        Para Çek
      </button>
    </div>
  );
};

export default ActionsCard; 