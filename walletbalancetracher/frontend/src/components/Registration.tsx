import React from 'react';

interface UserData {
  username: string;
  userId: string;
}

interface RegistrationProps {
  userData: UserData;
  setUserData: (data: UserData) => void;
  handleRegister: () => Promise<void>;
  isLoading: boolean;
}

const Registration: React.FC<RegistrationProps> = ({
  userData,
  setUserData,
  handleRegister,
  isLoading
}) => {
  return (
    <div className="registration-section">
      <div className="registration-form">
        <h1>Register Your Account</h1>
        <input
          type="text"
          placeholder="Username"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
        />
        <input
          type="text"
          placeholder="User ID"
          value={userData.userId}
          onChange={(e) => setUserData({ ...userData, userId: e.target.value })}
        />
        <button
          onClick={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </div>
    </div>
  );
};

export default Registration;