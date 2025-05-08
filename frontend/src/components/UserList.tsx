import React from 'react';

interface UserListProps {
  users: Array<{
    address: string;
    username: string;
    userId: string;
  }>;
  onBack: () => void;
}

const UserList: React.FC<UserListProps> = ({ users, onBack }) => {
  return (
    <div className="user-list-container">
      <div className="user-list-header">
        <h2>Registered Users</h2>
        <button onClick={onBack} className="back-button">
          ← Back
        </button>
      </div>
      <div className="user-list">
        {users.map((user, index) => (
          <div key={index} className="user-item">
            <div className="user-avatar">{user.username[0].toUpperCase()}</div>
            <div className="user-details">
              <h3>{user.username}</h3>
              <p className="user-id">ID: {user.userId}</p>
              <p className="user-address">{user.address.slice(0, 6)}...{user.address.slice(-4)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList;