import React from 'react';

const StreakIcon = () => (
    <svg 
        className="streak-icon"
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        <defs>
            <linearGradient id="streakGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
        </defs>
        <path d="M11.9992 1.31934C7.51921 6.28934 8.78921 12.4193 11.9992 16.2993C11.9992 16.2993 11.9992 16.2993 11.9992 16.2993C15.2092 12.4193 16.4792 6.28934 11.9992 1.31934Z" stroke="url(#streakGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5099 16.429C13.2599 18.549 12.5099 20.339 12.0099 22.689C13.5699 21.819 14.8099 20.399 15.6599 18.739C16.2999 17.519 16.4199 16.199 16.1699 14.939C15.6899 15.539 15.1199 16.019 14.5099 16.429Z" stroke="url(#streakGradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const StreakCard = () => {
  return (
    <div className="card streak-card">
        <h3 className="card-title">Seri</h3>
        <StreakIcon />
        <div className="streak-days">7</div>
        <div className="streak-label">Günlük Seri</div>
    </div>
  );
};

export default StreakCard; 