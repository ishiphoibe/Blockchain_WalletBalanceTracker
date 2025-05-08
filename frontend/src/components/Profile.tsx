import React from 'react';
import './Profile.css';

interface ProfileProps {
  account: string;
  userData: {
    username: string;
    userId: string;
  };
}

const Profile: React.FC<ProfileProps> = ({ account, userData }) => {
  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Profile Details</h1>
          <div className="profile-avatar">
            {userData.username.charAt(0).toUpperCase()}
          </div>
        </div>
        
        <div className="profile-content">
          <div className="profile-item">
            <label>Account Address</label>
            <div className="profile-value account-address">
              {account}
            </div>
          </div>
          
          <div className="profile-item">
            <label>Username</label>
            <div className="profile-value">
              {userData.username}
            </div>
          </div>
          
          <div className="profile-item">
            <label>User ID</label>
            <div className="profile-value">
              {userData.userId}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;