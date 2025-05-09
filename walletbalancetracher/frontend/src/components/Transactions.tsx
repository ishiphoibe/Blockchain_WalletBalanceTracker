import React from 'react';

interface Transaction {
  type: 'deposit' | 'withdraw';
  amount: string;
  timestamp: number;
}

interface TransactionsProps {
  transactions: Transaction[];
  amount: string;
  setAmount: (amount: string) => void;
  handleTransaction: (type: 'deposit' | 'withdraw') => Promise<void>;
  isLoading: boolean;
}

const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  amount,
  setAmount,
  handleTransaction,
  isLoading
}) => {
  return (
    <div className="transactions-section">
      <div className="transaction-actions">
        <div className="transaction-form">
          <div className="transaction-input-group">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in ETH"
              className="transaction-input"
            />
            <button
              className="transaction-button deposit"
              onClick={() => handleTransaction('deposit')}
              disabled={isLoading}
            >
              Deposit
            </button>
            <button
              className="transaction-button withdraw"
              onClick={() => handleTransaction('withdraw')}
              disabled={isLoading}
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="transaction-list">
        {transactions.map((tx, index) => (
          <div key={index} className="transaction-item">
            <div className={`transaction-icon ${tx.type}`}>
              {tx.type === 'deposit' ? '↓' : '↑'}
            </div>
            <div className="transaction-details">
              <span className="transaction-type">
                {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
              </span>
              <span className="transaction-date">
                {new Date(tx.timestamp).toLocaleString()}
              </span>
            </div>
            <span className={`transaction-amount ${tx.type}`}>
              {tx.type === 'deposit' ? '+' : '-'}{tx.amount} ETH
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;