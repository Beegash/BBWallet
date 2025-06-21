import React from 'react';

const ProfileCard = () => {
  return (
    <div className="card profile-card">
      <img 
        src="https://i.pravatar.cc/150?img=32" 
        alt="Profil Resmi" 
        className="profile-pic" 
      />
      <h4 className="profile-name">Ayşe Yılmaz</h4>
      <p className="profile-age">12 yaşında</p>
    </div>
  );
};

export default ProfileCard; 