Wallet Balance Tracker

# Blockchain Wallet Balance Tracker

A decentralized wallet balance tracker that enables users to register, deposit and withdraw Ether, and view their transaction history. The app also displays a list of all registered users on the blockchain. Built using Solidity, Hardhat, Ethers.js, and React.

🚀 Features

- ✅ Register wallet with a unique username
- 💰 Deposit & withdraw ETH using MetaMask
- 📊 View transaction history (deposit/withdrawal)
- 👤 Display wallet balance
- 🌐 List all registered users

---

## 🛠️ Technologies Used

- Smart Contract:Solidity
- Frontend:React + TypeScript
- Blockchain Interaction:Ethers.js
- Development Tools:Hardhat, MetaMask
- Routing:React Router DOM

---

 📦 Installation

1. Clone the Repository
```bash
git clone https://github.com/yourusername/blockchain-wallet-balance-tracker.git
cd blockchain-wallet-balance-tracker

2. Install Dependencies
npm install

3. Compile and Deploy Smart Contract
Make sure you have Hardhat installed and setup:
npx hardhat compile
npx hardhat run scripts/deploy.js --network <your-network>

cd frontend
npm install
npm run dev

PROJECT STRUCTURE
Blockchain_WalletBalanceTracker/
├── contracts/
│   └── WalletBalanceTracker.sol    # Main smart contract
├── frontend/
│   ├── src/
│   │   └── components/             # React components
│   │       ├── Navigation.tsx      # Navigation component
│   │       ├── Profile.tsx         # User profile component
│   │       └── UserList.tsx        # User listing component
│   └── package.json                # Frontend dependencies
└── hardhat.config.js               # Hardhat configuration
└── README.md

🦊 MetaMask Integration
Ensure MetaMask is installed in your browser. When performing any action (register, deposit, withdraw), MetaMask will prompt you to confirm the transaction.

Acknowledgments
Ethers.js

Hardhat

React

Solidity
