import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './App.css';

function App() {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Connect to MetaMask
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        setAccount(accounts[0]);
        
        // Get initial balance
        const balance = await web3.eth.getBalance(accounts[0]);
        setBalance(web3.utils.fromWei(balance, 'ether'));
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
    }
  };

  // Get transaction history
  const getTransactionHistory = async () => {
    setIsLoading(true);
    try {
      const web3 = new Web3(window.ethereum);
      const blockNumber = await web3.eth.getBlockNumber();
      const history = [];
      
      // Get last 10 blocks of transactions
      for (let i = 0; i < 10; i++) {
        const block = await web3.eth.getBlock(blockNumber - i, true);
        const txs = block.transactions.filter(tx => 
          tx.from.toLowerCase() === account.toLowerCase() || 
          tx.to?.toLowerCase() === account.toLowerCase()
        );
        history.push(...txs);
      }
      
      setTransactions(history);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
    }
    setIsLoading(false);
  };

  // Export transactions to CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Transaction Hash', 'From', 'To', 'Value (ETH)', 'Block Number', 'Timestamp'],
      ...transactions.map(tx => [
        tx.hash,
        tx.from,
        tx.to,
        Web3.utils.fromWei(tx.value, 'ether'),
        tx.blockNumber,
        new Date(tx.timestamp * 1000).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  // Send ETH
  const sendTransaction = async (to, amount) => {
    try {
      const web3 = new Web3(window.ethereum);
      const value = web3.utils.toWei(amount, 'ether');
      
      await web3.eth.sendTransaction({
        from: account,
        to,
        value
      });
      
      // Update balance after transaction
      const newBalance = await web3.eth.getBalance(account);
      setBalance(web3.utils.fromWei(newBalance, 'ether'));
    } catch (error) {
      console.error('Error sending transaction:', error);
    }
  };

  return (
    <div className="container">
      <h1>Wallet Balance Tracker</h1>
      
      {!account ? (
        <button onClick={connectWallet}>Connect MetaMask</button>
      ) : (
        <>
          <div className="account-info">
            <p>Account: {account}</p>
            <p>Balance: {balance} ETH</p>
          </div>

          <div className="transaction-form">
            <h2>Send ETH</h2>
            <input type="text" placeholder="Recipient Address" id="recipient" />
            <input type="number" placeholder="Amount in ETH" id="amount" />
            <button onClick={() => {
              const to = document.getElementById('recipient').value;
              const amount = document.getElementById('amount').value;
              sendTransaction(to, amount);
            }}>Send</button>
          </div>

          <div className="button-group">
            <button onClick={getTransactionHistory}>Get History</button>
            <button onClick={exportToCSV}>Export to CSV</button>
          </div>

          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            <div className="transactions">
              {transactions.map(tx => (
                <div key={tx.hash} className="transaction-item">
                  <span>From: {tx.from}</span>
                  <span>To: {tx.to}</span>
                  <span>Value: {Web3.utils.fromWei(tx.value, 'ether')} ETH</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;