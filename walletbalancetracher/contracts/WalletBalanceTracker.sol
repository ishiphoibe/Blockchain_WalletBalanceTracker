// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract WalletTracker {
    struct User {
        string username;
        string userId;
        uint256 balance;
        bool registered;
    }

    mapping(address => User) public users;
    mapping(address => string[]) public transactions;

    modifier onlyRegistered() {
        require(users[msg.sender].registered, "Not registered");
        _;
    }

    function register(string memory _username, string memory _userId) public {
        require(!users[msg.sender].registered, "Already registered");
        users[msg.sender] = User(_username, _userId, 0, true);
        transactions[msg.sender].push("Registered");
    }

    function deposit() public payable onlyRegistered {
        users[msg.sender].balance += msg.value;
        transactions[msg.sender].push("Deposit");
    }

    function withdraw(uint256 amount) public onlyRegistered {
        require(users[msg.sender].balance >= amount, "Insufficient balance");
        users[msg.sender].balance -= amount;
        payable(msg.sender).transfer(amount);
        transactions[msg.sender].push("Withdraw");
    }

    function getBalance() public view onlyRegistered returns (uint256) {
        return users[msg.sender].balance;
    }

    function getTransactions() public view onlyRegistered returns (string[] memory) {
        return transactions[msg.sender];
    }
}
