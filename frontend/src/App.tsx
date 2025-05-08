import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

declare global {
  interface Window {
    ethereum: any;
  }
}

// Add contract ABI
const contractABI = [
  "function register(string memory _username, string memory _userId) public",
  "function deposit() public payable",
  "function withdraw(uint256 amount) public",
  "function getBalance() public view returns (uint256)",
  "function users(address) public view returns (string memory username, string memory userId, uint256 balance, bool registered)"
]

interface UserData {
  username: string;
  userId: string;
  role?: string;  // Add this line
}

interface Transaction {
  type: 'deposit' | 'withdraw';
  amount: string;
  timestamp: number;
}

import Navigation from './components/Navigation';

function App() {
  // Add this new state
  const [currentPage, setCurrentPage] = useState<string>('connect');
  const [account, setAccount] = useState<string>('')
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const [showRegistration, setShowRegistration] = useState<boolean>(false)
  const [userData, setUserData] = useState<UserData>({
    username: '',
    userId: ''
  })
  const [balance, setBalance] = useState<string>('0')
  const [amount, setAmount] = useState<string>('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    checkWalletConnection()

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          checkRegistrationStatus(accounts[0])
        } else {
          resetState()
        }
      })

      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {})
        window.ethereum.removeListener('chainChanged', () => {})
      }
    }
  }, [])

  const resetState = () => {
    setAccount('')
    setIsRegistered(false)
    setShowRegistration(false)
    setBalance('0')
    setTransactions([])
    setContract(null)
  }

  const checkRegistrationStatus = async (address: string) => {
    if (!contract) return
    try {
      const user = await contract.users(address)
      setIsRegistered(user.registered)
      if (user.registered) {
        setShowRegistration(false)
        updateBalance()
      }
    } catch (error) {
      console.error('Error checking registration status:', error)
    }
  }

  const updateBalance = async () => {
    if (!contract || !account) return
    try {
      const balanceWei = await contract.getBalance()
      const balanceEth = ethers.utils.formatEther(balanceWei)
      setBalance(balanceEth)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  const checkWalletConnection = async (): Promise<void> => {
    if (!window.ethereum) return
    
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      })
      if (accounts.length > 0) {
        setAccount(accounts[0])
        initializeContract(accounts[0])
      }
    } catch (error) {
      console.error('Error checking wallet connection:', error)
    }
  }

  const initializeContract = async (address: string) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3' // Update this with your deployed contract address
      const walletContract = new ethers.Contract(contractAddress, contractABI, signer)
      setContract(walletContract)
      await checkRegistrationStatus(address)
    } catch (error) {
      console.error('Error initializing contract:', error)
    }
  }

  const connectWallet = async (): Promise<void> => {
    if (!window.ethereum) {
      alert('Please install MetaMask!')
      return
    }

    setIsLoading(true)
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])
      await initializeContract(accounts[0])
      setShowRegistration(true)
    } catch (error) {
      console.error('Error connecting wallet:', error)
      alert('Failed to connect wallet')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (): Promise<void> => {
    if (!userData.username || !userData.userId || !contract) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Add gas estimation
      const gasEstimate = await contract.estimateGas.register(userData.username, userData.userId);
      
      const tx = await contract.register(userData.username, userData.userId, {
        gasLimit: Math.ceil(gasEstimate.toNumber() * 1.2) // Add 20% buffer
      });
      
      // Wait for confirmation and add more specific error handling
      const receipt = await tx.wait();
      if (receipt.status === 1) {
        setIsRegistered(true);
        setShowRegistration(false);
        await updateBalance();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      // More specific error message
      if (error.code === 'INSUFFICIENT_FUNDS') {
        alert('Registration failed: Insufficient funds for gas');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        alert('Registration failed: Contract error - please check your inputs');
      } else {
        alert(`Registration failed: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Add this function at the top level of your App component
  const [originalTransactions, setOriginalTransactions] = useState<Transaction[]>([])

  // Modify your handleTransaction function to update both transaction states
  const handleTransaction = async (type: 'deposit' | 'withdraw'): Promise<void> => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !contract) {
      alert('Please enter a valid amount')
      return
    }

    setIsLoading(true)
    try {
      let tx;
      const amountInWei = ethers.utils.parseEther(amount)

      if (type === 'deposit') {
        tx = await contract.deposit({ value: amountInWei })
      } else {
        tx = await contract.withdraw(amountInWei)
      }
      
      await tx.wait()
      await updateBalance()
      
      const newTransaction: Transaction = {
        type,
        amount,
        timestamp: Date.now()
      }
      setTransactions(prev => [...prev, newTransaction])
      setOriginalTransactions(prev => [...prev, newTransaction])
      setAmount('')
    } catch (error) {
      console.error(`Error during ${type}:`, error)
      alert(`${type} failed. Please make sure you have enough balance and the amount is valid.`)
    } finally {
      setIsLoading(false)
    }
  }

  const renderWalletConnection = () => (
    <div className="container">
      <h1>Simple Wallet Balance Tracker</h1>
      <button onClick={connectWallet} disabled={isLoading}>
        {isLoading ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  )

  const renderRegistration = () => (
    <div className="container">
      <h1>Registration</h1>
      <div className="registration-form">
        <input
          type="text"
          placeholder="Username"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
          disabled={isLoading}
        />
        <input
          type="text"
          placeholder="User ID"
          value={userData.userId}
          onChange={(e) => setUserData({ ...userData, userId: e.target.value })}
          disabled={isLoading}
        />
        <button onClick={handleRegister} disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </div>
  )

  const renderDashboard = () => (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="logo">
          <h1>Financial</h1>
        </div>
        <nav className="main-nav">
          <button className="nav-item active">Dashboard</button>
          <button className="nav-item">Wallet</button>
          <button className="nav-item">Transactions</button>
          <button className="nav-item">Profile</button>
        </nav>
        <div className="user-menu">
          <span className="user-name">{userData.username}</span>
        </div>
      </header>
    
      <div className="dashboard-content">
        <div className="announcement-card">
          <span className="tag">Announcement</span>
          <h2>Welcome to your Financial Wallet Dashboard</h2>
          <p>Track your Wallet assets and transactions in one place</p>
        </div>
    
        <div className="main-account-card">
          <div className="account-info">
            <h3>Main Account</h3>
            <div className="account-number">**** **** **** {account.slice(-4)}</div>
            <div className="balance-large">{balance} ETH</div>
          </div>
          <div className="account-stats">
            <div className="stat-item income">
              <span className="stat-label">Income</span>
              <span className="stat-value">↓ {transactions.filter(t => t.type === 'deposit').reduce((acc, t) => acc + parseFloat(t.amount), 0).toFixed(2)} ETH</span>
            </div>
            <div className="stat-item expense">
              <span className="stat-label">Expense</span>
              <span className="stat-value">↑ {transactions.filter(t => t.type === 'withdraw').reduce((acc, t) => acc + parseFloat(t.amount), 0).toFixed(2)} ETH</span>
            </div>
          </div>
        </div>
    
        <div className="cards-row">
          <div className="action-card">
            <div className="transaction-input-group">
              <input
                type="number"
                placeholder="Enter amount in ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.001"
                className="transaction-input"
              />
              <button 
                onClick={() => handleTransaction('deposit')} 
                disabled={isLoading}
                className="transaction-button deposit"
              >
                {isLoading ? 'Processing...' : 'Deposit'}
              </button>
            </div>
          </div>
          <div className="action-card">
            <div className="transaction-input-group">
              <input
                type="number"
                placeholder="Enter amount in ETH"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.001"
                className="transaction-input"
              />
              <button 
                onClick={() => handleTransaction('withdraw')} 
                disabled={isLoading}
                className="transaction-button withdraw"
              >
                {isLoading ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
          <div className="action-card">
            <button 
              onClick={exportTransactions} 
              disabled={transactions.length === 0}
              className="transaction-button export"
            >
              Export History
            </button>
          </div>
        </div>
    
        <div className="transactions-section">
          <div className="section-header">
            <h3>Latest transactions</h3>
            <button className="see-all">See all →</button>
          </div>
          <div className="transaction-list">
            {transactions.length === 0 ? (
              <p className="no-transactions">No transactions yet</p>
            ) : (
              transactions.map((tx, index) => (
                <div key={index} className="transaction-item">
                  <div className="transaction-icon">
                    {tx.type === 'deposit' ? '↓' : '↑'}
                  </div>
                  <div className="transaction-details">
                    <span className="transaction-type">
                      {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                    </span>
                    <span className="transaction-date">
                      {new Date(tx.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`transaction-amount ${tx.type}`}>
                    {tx.type === 'deposit' ? '+' : '-'} {tx.amount} ETH
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Add these new components to your dashboard render function
  const renderTransactionFilters = () => (
    <div className="transaction-filters">
      <select 
        onChange={(e) => {
          if (e.target.value === 'all') {
            setTransactions(originalTransactions);
          } else {
            const filtered = originalTransactions.filter(tx => tx.type === e.target.value);
            setTransactions(filtered);
          }
        }}
        className="transaction-filter"
      >
        <option value="all">All Transactions</option>
        <option value="deposit">Deposits Only</option>
        <option value="withdraw">Withdrawals Only</option>
      </select>
      <input
        type="text"
        placeholder="Search transactions..."
        onChange={(e) => {
          const searchTerm = e.target.value.toLowerCase();
          if (!searchTerm) {
            setTransactions(originalTransactions);
            return;
          }
          const filtered = originalTransactions.filter(tx => 
            tx.amount.toLowerCase().includes(searchTerm) ||
            tx.type.toLowerCase().includes(searchTerm) ||
            new Date(tx.timestamp).toLocaleString().toLowerCase().includes(searchTerm)
          );
          setTransactions(filtered);
        }}
        className="transaction-search"
      />
    </div>
  )

  const exportTransactions = () => {
    const csvContent = transactions.map(tx => 
      `${tx.type},${tx.amount},${new Date(tx.timestamp).toISOString()}`
    ).join('\n');
    
    const blob = new Blob([`Type,Amount,Date\n${csvContent}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  }

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    if (!account) return renderWalletConnection();
    if (showRegistration) return renderRegistration();
    if (isRegistered) return renderDashboard();
    return null;
  };

  return (
    <div className="app-container">
      {renderContent()}
    </div>
  );
}

export default App;