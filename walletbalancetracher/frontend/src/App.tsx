import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'
import Navigation from './components/Navigation'
import Profile from './components/Profile'
import Transactions from './components/Transactions'
import Registration from './components/Registration'

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
}

interface Transaction {
  type: 'deposit' | 'withdraw';
  amount: string;
  timestamp: number;
}

function App() {
  // Add this new state
  const [currentPage, setCurrentPage] = useState<string>('');
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
      const contractAddress = '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9' // Update this with your deployed contract address
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
  // Remove this line
  // const [originalTransactions, setOriginalTransactions] = useState<Transaction[]>([])
  
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
      // Remove this line
      // setOriginalTransactions(prev => [...prev, newTransaction])
      setAmount('')
    } catch (error) {
      console.error(`Error during ${type}:`, error)
      alert(`${type} failed. Please make sure you have enough balance and the amount is valid.`)
    } finally {
      setIsLoading(false)
    }
  }

  const renderWelcomePage = () => (
    <div className="welcome-container">
      <header className="welcome-header">
        <center><h1>Welcome to Wallet Balance Tracker</h1></center>
      </header>

      <main className="welcome-content">
        <div className="connect-section">
          <p><h2>Connect your wallet to get started</h2></p>
          <button 
            className="connect-button" 
            onClick={connectWallet} 
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
          {account && (
            <p className="account-info">
              Connected Account: {account.slice(0, 6)}...{account.slice(-4)}
            </p>
          )}
        </div>
      </main>
    </div>
  );

  return (
    <div className="app-container">
      <Navigation
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isRegistered={isRegistered}
      />
      
      {currentPage === 'connect' && renderWelcomePage()}
      
      {showRegistration && (
        <Registration
          userData={userData}
          setUserData={setUserData}
          handleRegister={handleRegister}
          isLoading={isLoading}
        />
      )}
      
      {isRegistered && currentPage === 'profile' && (
        <Profile
          account={account}
          balance={balance}
          username={userData.username}
          userId={userData.userId}
        />
      )}
      
      {isRegistered && currentPage === 'transactions' && (
        <Transactions
          transactions={transactions}
          amount={amount}
          setAmount={setAmount}
          handleTransaction={handleTransaction}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

export default App;