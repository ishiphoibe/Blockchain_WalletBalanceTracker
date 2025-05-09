import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './Profile.css';

interface ProfileProps {
  account: string;
  balance: string;
  username?: string;
  userId?: string;
}

const Profile: React.FC<ProfileProps> = ({ account, balance, username, userId }) => {
  const [formattedBalance, setFormattedBalance] = useState<string>(balance);

  useEffect(() => {
    // Format the balance to show max 6 decimal places
    const formatBalance = () => {
      try {
        const balanceNum = parseFloat(balance);
        if (isNaN(balanceNum)) {
          setFormattedBalance('0.00');
        } else {
          setFormattedBalance(balanceNum.toFixed(6));
        }
      } catch {
        setFormattedBalance('0.00');
      }
    };

    formatBalance();
  }, [balance]);

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>User Profile</h1>
          <div className="profile-avatar">
            {username ? username[0].toUpperCase() : 'U'}
          </div>
        </div>
        <div className="profile-content">
          <div className="profile-item">
            <label>Username</label>
            <div className="profile-value">{username || 'Not set'}</div>
          </div>
          <div className="profile-item">
            <label>User ID</label>
            <div className="profile-value">{userId || 'Not set'}</div>
          </div>
          <div className="profile-item">
            <label>Wallet Address</label>
            <div className="profile-value account-address">
              {account}
            </div>
          </div>
          <div className="profile-item">
            <label>Current Balance</label>
            <div className="profile-value">
              {formattedBalance} ETH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;