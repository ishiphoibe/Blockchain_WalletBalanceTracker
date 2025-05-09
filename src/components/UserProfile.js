import { ethers } from 'ethers';
import { useState, useEffect } from 'react';

const UserProfile = ({ walletAddress }) => {
  const [balance, setBalance] = useState('0');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Check if window.ethereum is available
        if (!window.ethereum) {
          throw new Error('Please install MetaMask or another Web3 provider');
        }

        // Create a provider
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Fetch the balance
        const balanceWei = await provider.getBalance(walletAddress);
        
        // Convert balance from Wei to ETH
        const balanceEth = ethers.utils.formatEther(balanceWei);
        
        setBalance(balanceEth);
      } catch (err) {
        console.error('Error fetching balance:', err);
        setError(err.message);
      }
    };

    if (walletAddress) {
      fetchBalance();
    }
  }, [walletAddress]);

  return (
    <div className="user-profile">
      <h1>User Profile</h1>
      <div className="profile-details">
        <div className="field">
          <label>Username</label>
          <div>Phoibe</div>
        </div>
        <div className="field">
          <label>User ID</label>
          <div>8</div>
        </div>
        <div className="field">
          <label>Wallet Address</label>
          <div>{walletAddress}</div>
        </div>
        <div className="field">
          <label>Current Balance</label>
          <div>{error ? 'Error loading balance' : `${balance} ETH`}</div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;