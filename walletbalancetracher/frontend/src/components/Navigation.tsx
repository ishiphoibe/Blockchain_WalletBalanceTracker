import React from 'react';

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isRegistered: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, setCurrentPage, isRegistered }) => {
  return (
    <nav className="welcome-nav">
      <button
        className={`nav-button ${currentPage === 'connect' ? 'active' : ''}`}
        onClick={() => setCurrentPage('connect')}
      >
        Connect
      </button>
      {isRegistered && (
        <>
          <button
            className={`nav-button ${currentPage === 'profile' ? 'active' : ''}`}
            onClick={() => setCurrentPage('profile')}
          >
            Profile
          </button>
          <button
            className={`nav-button ${currentPage === 'transactions' ? 'active' : ''}`}
            onClick={() => setCurrentPage('transactions')}
          >
            Transactions
          </button>
        </>
      )}
    </nav>
  );
};

export default Navigation;