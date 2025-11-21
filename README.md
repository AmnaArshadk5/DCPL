
# P2P Loan DApp – Assignment 3

This project is an extension of **Assignment 2**, where we implemented a P2P lending smart contract. In this assignment, the smart contract is **deployed using Truffle Suite** and tested on a local blockchain using **Ganache**, giving hands-on experience with real blockchain development environments.

---

## 📝 Assignment Objectives

* Deploy a Solidity smart contract using **Truffle** instead of Remix.
* Interact with a **local blockchain** (Ganache) programmatically via **Web3.js**.
* Understand migration scripts, contract compilation, and deployment workflows.
* Extend frontend interaction from Assignment 2 to communicate with the deployed contract.

---

## 📂 Folder Structure

```
Assignment_3/
│
├── contracts/
│   └── P2PLoan.sol             # Solidity smart contract
│
├── migrations/
│   └── 1_deploy_loan.js        # Deployment script
│
├── src/                        # Frontend folder
│   ├── index.html
│   ├── script.js
│   └── style.css (optional)
│
├── truffle-config.js           # Truffle configuration for Ganache
├── package.json
├── README.md
└── screenshots/                # Compilation, migration, and frontend screenshots
```

---

## ⚡ Features

* **Borrowers:** Request loans with collateral and interest rates.
* **Lenders:** Fund loans and claim collateral if defaulted.
* **Repayment:** Borrowers can repay loans including interest.
* **Loan Tracking:** View real-time loan status (Pending, Active, Repaid, Defaulted) in the frontend.
* **MetaMask Integration:** Connect and interact with Ethereum locally.

---

## 🛠 Tech Stack

* **Blockchain & Smart Contract:** Ethereum, Solidity, Truffle, Ganache
* **Frontend:** HTML, CSS, JavaScript
* **Web3 Integration:** Web3.js, MetaMask

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
npm install -g truffle
npm install
```

* Install **Ganache** desktop app from [here](https://trufflesuite.com/ganache/).
* Install **MetaMask** browser extension.

### 2. Initialize Project (if not already)

```bash
truffle init
```

### 3. Add Smart Contract

* Copy your `P2PLoan.sol` (from Assignment 2) into `contracts/` folder.

### 4. Write Migration Script

* Example: `migrations/1_deploy_loan.js`

```javascript
const P2PLoan = artifacts.require("P2PLoan");

module.exports = function (deployer) {
  deployer.deploy(P2PLoan);
};
```

### 5. Configure Truffle

* Edit `truffle-config.js` to connect to Ganache:

```javascript
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (Ganache default)
      port: 7545,            // Ganache default port
      network_id: "5777",       // Match any network id
    }
  },
  compilers: {
    solc: {
      version: "0.8.19",    // <-- This is the crucial update
      settings: {
        optimizer: {
          enabled: false,
          runs: 200
        }
      }
    }
  }
};
```

### 6. Compile & Deploy Contracts

```bash
truffle compile
truffle migrate --network development
```

* Copy the deployed contract address from the migration output.

### 7. Connect Frontend

* Open `src/script.js` and set:

```javascript
const CONTRACT_ADDRESS = "0xE4773AF224672D49d5B43D03f3f3454ACa3AD772";
const CONTRACT_ABI =   [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "loans",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address payable",
          "name": "borrower",
          "type": "address"
        },
        {
          "internalType": "address payable",
          "name": "lender",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "principal",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "collateralAmount",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "interestRate",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "totalRepayment",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "termEnd",
          "type": "uint256"
        },
        {
          "internalType": "enum P2PLoan.LoanStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [],
      "name": "nextLoanId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function",
      "constant": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_principal",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_interestRate",
          "type": "uint256"
        }
      ],
      "name": "requestLoan",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_loanId",
          "type": "uint256"
        }
      ],
      "name": "fundLoan",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_loanId",
          "type": "uint256"
        }
      ],
      "name": "repayLoan",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function",
      "payable": true
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_loanId",
          "type": "uint256"
        }
      ],
      "name": "claimCollateral",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
   

* Open `index.html` in browser and connect MetaMask.

---

## 📷 Screenshots

Include the following in the `screenshots/` folder:

* Contract compilation output
* Contract deployment transaction in Ganache
* Frontend interaction with MetaMask

---

## 🧪 Testing the Project

1. Start Ganache and ensure the blockchain is running.
2. Compile and deploy the contract via Truffle.
3. Open frontend in browser.
4. Connect MetaMask to the Ganache network.
5. Interact with the dApp: request loans, fund loans, repay, and claim collateral.

---

## 🔗 References

* [Truffle Pet Shop Tutorial](https://archive.trufflesuite.com/guides/pet-shop/)
* [Web3.js Documentation](https://web3js.readthedocs.io/)
* [Ganache](https://trufflesuite.com/ganache/)

---

## 📜 Deliverables

* `contracts/` – Solidity smart contract
* `migrations/` – Deployment scripts
* `src/` – Frontend files
* `truffle-config.js` – Truffle configuration
* `screenshots/` – Proof of compilation, migration, and UI
* `README.md` – Setup instructions and usage

---

## ⚖️ License

MIT License © [Amna Arshad](https://github.com/AmnaArshadk5/DCPL)



