import React from 'react';

interface NavigationProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isRegistered: boolean;
  userRole?: string; // Add role support
}

const Navigation: React.FC<NavigationProps> = ({ currentPage, onNavigate, isRegistered, userRole }) => {
  // Define menu items based on roles
  const getMenuItems = () => {
    const items = [];

    if (!isRegistered) {
      items.push(
        {
          id: 'connect',
          label: 'Connect Wallet',
          visible: true
        },
        {
          id: 'register',
          label: 'Register',
          visible: true
        }
      );
    } else {
      items.push(
        {
          id: 'dashboard',
          label: 'Dashboard',
          visible: true
        },
        {
          id: 'transactions',
          label: 'Transactions',
          visible: true
        },
        {
          id: 'profile',
          label: 'Profile',
          visible: true
        }
      );

      // Add admin-specific menu items
      if (userRole === 'admin') {
        items.push({
          id: 'admin',
          label: 'Admin Panel',
          visible: true
        });
      }
    }

    return items;
  };

  return (
    <nav className="navigation">
      {getMenuItems().map(item => (
        item.visible && (
          <button 
            key={item.id}
            className={`nav-button ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        )
      ))}
    </nav>
  );
};

export default Navigation;