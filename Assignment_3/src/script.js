// script.js - DCPL frontend with Galaxy background injection + Web3 interactions

// ---------------------------
// Contract info
// ---------------------------
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

const STATUS_MAP = ["Pending", "Active", "Repaid", "Defaulted"];

// ---------------------------
// DOM refs
// ---------------------------
const connectBtn = document.getElementById('connectButton');
const accountDisplay = document.getElementById('accountDisplay');
const messageDisplay = document.getElementById('messageDisplay');
const requestBtn = document.getElementById('requestButton');
const fundBtn = document.getElementById('fundButton');
const claimBtn = document.getElementById('claimButton');
const repayBtn = document.getElementById('repayButton');
const refreshBtn = document.getElementById('refreshButton');
const refreshTop = document.getElementById('refreshButtonTop');

const principalInput = document.getElementById('principalInput');
const collateralInput = document.getElementById('collateralInput');
const interestRateInput = document.getElementById('interestRateInput');
const loanIdLender = document.getElementById('loanIdLender');
const loanIdRepay = document.getElementById('loanIdRepay');

const loansList = document.getElementById('loansList');

// ---------------------------
// Web3 state
// ---------------------------
let web3;
let account = null;
let contractInstance = null;

// ---------------------------
// Helper functions
// ---------------------------
function setMessage(text, type = 'info') {
  messageDisplay.innerText = text;
  messageDisplay.className = type === 'error' ? 'msg error' : 'msg info';
}

function enableAll(enable) {
  [requestBtn, fundBtn, claimBtn, repayBtn, refreshBtn, refreshTop].forEach(b => {
    if (b) b.disabled = !enable;
  });
}

function toWei(eth) { return web3.utils.toWei(String(eth), 'ether'); }
function fromWei(wei) { return web3.utils.fromWei(String(wei), 'ether'); }

// ---------------------------
// Space UI
// ---------------------------
function injectSpaceUI() {
  if (document.querySelector('.space-gradient-1')) return;
  const s1 = document.createElement('div'); s1.className = 'space-gradient-1';
  const s2 = document.createElement('div'); s2.className = 'space-gradient-2';
  document.body.appendChild(s1); document.body.appendChild(s2);

  for (let i = 1; i <= 3; i++) {
    const cb = document.createElement('div'); cb.className = `cosmic-blob cb${i}`;
    document.body.appendChild(cb);
  }

  const starfield = document.createElement('div'); starfield.className = 'starfield'; starfield.id = 'starfield';
  document.body.appendChild(starfield);

  generateStars();
}

function generateStars(count = 180) {
  const container = document.getElementById('starfield');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.top = Math.random() * 100 + '%';
    s.style.left = Math.random() * 100 + '%';
    s.style.opacity = (0.2 + Math.random() * 0.9).toString();
    s.style.animationDelay = (Math.random() * 3).toFixed(2) + 's';
    container.appendChild(s);
  }
}

// ---------------------------
// MetaMask connection
// ---------------------------
async function connectMetaMask() {
  if (!window.ethereum) {
    setMessage('MetaMask not detected — install extension.', 'error');
    return;
  }

  try {
    web3 = new Web3(window.ethereum);
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = accounts[0];
    accountDisplay.innerText = account;
    contractInstance = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
    setMessage('Connected ✅ — ready.', 'info');
    enableAll(true);
    connectBtn.style.display = 'none';

    window.ethereum.on('accountsChanged', accts => {
      account = accts[0] || null;
      accountDisplay.innerText = account || 'N/A';
      if (!account) enableAll(false);
      else loadLoans();
    });

    window.ethereum.on('chainChanged', () => {
      setMessage('Network changed — reloading...', 'info');
      setTimeout(() => window.location.reload(), 800);
    });

    loadLoans();
  } catch (err) {
    console.error('connect error', err);
    setMessage('Connection failed. See console.', 'error');
  }
}

// ---------------------------
// Contract actions
// ---------------------------
async function requestLoan() {
  if (!contractInstance || !account) { setMessage('Connect MetaMask first', 'error'); return; }
  const principal = principalInput.value;
  const collateral = collateralInput.value;
  const rate = interestRateInput.value;
  if (!principal || !collateral) return setMessage('Enter principal and collateral', 'error');
  if (BigInt(toWei(collateral)) <= BigInt(toWei(principal))) return setMessage('Collateral must be > principal', 'error');

  setMessage('Requesting loan — confirm transaction...', 'info');
  try {
    const tx = await contractInstance.methods.requestLoan(toWei(principal), Number(rate)).send({
      from: account,
      value: toWei(collateral),
      gas: 300000
    });
    console.log('requestLoan tx', tx);
    setMessage('Loan requested ✅ Tx: ' + tx.transactionHash, 'info');
    loadLoans();
  } catch (err) {
    console.error(err);
    setMessage('Request failed. Check console.', 'error');
  }
}

async function fundLoan() {
  if (!contractInstance || !account) { setMessage('Connect MetaMask first', 'error'); return; }
  const id = loanIdLender.value;
  if (!id) return setMessage('Enter loan ID to fund', 'error');

  setMessage(`Funding loan #${id}...`, 'info');
  try {
    const loan = await contractInstance.methods.loans(id).call();
    if (!loan || loan.borrower === '0x0000000000000000000000000000000000000000') return setMessage('Loan does not exist', 'error');

    const principalWei = loan.principal;
    const tx = await contractInstance.methods.fundLoan(id).send({
      from: account,
      value: principalWei,
      gas: 300000
    });
    console.log('fundLoan tx', tx);
    setMessage('Loan funded ✅', 'info');
    loadLoans();
  } catch (err) {
    console.error(err);
    setMessage('Funding failed. See console.', 'error');
  }
}

async function repayLoan() {
  if (!contractInstance || !account) { setMessage('Connect MetaMask first', 'error'); return; }
  const id = loanIdRepay.value;
  if (!id) return setMessage('Enter loan ID to repay', 'error');

  setMessage(`Repaying loan #${id}...`, 'info');
  try {
    const loan = await contractInstance.methods.loans(id).call();
    if (!loan || loan.borrower === '0x0000000000000000000000000000000000000000') return setMessage('Loan does not exist', 'error');

    const repayWei = loan.totalRepayment;
    const tx = await contractInstance.methods.repayLoan(id).send({
      from: account,
      value: repayWei,
      gas: 300000
    });
    console.log('repay tx', tx);
    setMessage('Loan repaid ✅', 'info');
    loadLoans();
  } catch (err) {
    console.error(err);
    setMessage('Repay failed. See console.', 'error');
  }
}

async function claimCollateral() {
  if (!contractInstance || !account) { setMessage('Connect MetaMask first', 'error'); return; }
  const id = loanIdLender.value;
  if (!id) return setMessage('Enter loan ID to claim', 'error');

  setMessage(`Claiming collateral for loan #${id}...`, 'info');
  try {
    const tx = await contractInstance.methods.claimCollateral(id).send({
      from: account,
      gas: 300000
    });
    console.log('claim tx', tx);
    setMessage('Collateral claimed ✅', 'info');
    loadLoans();
  } catch (err) {
    console.error(err);
    setMessage('Claim failed. See console.', 'error');
  }
}

// ---------------------------
// Load loans safely
// ---------------------------
async function loadLoans() {
  if (!contractInstance) { setMessage('Connect first to load loans', 'error'); return; }
  loansList.innerHTML = '<div class="empty small">Loading loans…</div>';

  try {
    const nextId = await contractInstance.methods.nextLoanId().call();
    loansList.innerHTML = '';

    if (Number(nextId) <= 1) {
      loansList.innerHTML = '<div class="empty small">No loans posted yet.</div>';
      return;
    }

    for (let i = Number(nextId) - 1; i >= 1; i--) {
      try {
        const loan = await contractInstance.methods.loans(i).call();
        if (!loan || loan.borrower === '0x0000000000000000000000000000000000000000') continue;

        const dueDate = loan.termEnd == 0 ? 'N/A' : new Date(Number(loan.termEnd) * 1000).toLocaleString();

        const el = document.createElement('div');
        el.className = 'loan-card';
        el.innerHTML = `
          <div>
            <h4>Loan #${loan.id}</h4>
            <div class="loan-meta">Borrower: ${loan.borrower}</div>
            <div class="loan-meta">Principal: <strong>${fromWei(loan.principal)} ETH</strong> • Repay: <strong>${fromWei(loan.totalRepayment)} ETH</strong></div>
            <div class="loan-meta">Collateral: ${fromWei(loan.collateralAmount)} ETH • Due: ${dueDate}</div>
          </div>
          <div style="text-align:right">
            <div class="status-badge">${STATUS_MAP[Number(loan.status)]}</div>
            <div style="margin-top:8px" class="loan-meta">Lender: ${loan.lender === '0x0000000000000000000000000000000000000000' ? '—' : loan.lender}</div>
          </div>
        `;
        loansList.appendChild(el);

      } catch(innerErr) {
        console.warn('Skipping loan ID', i, innerErr);
      }
    }
  } catch (err) {
    console.error('loadLoans error', err);
    loansList.innerHTML = '<div class="empty small" style="color:#ffb4b4">Error loading loans — see console.</div>';
  }
}

// ---------------------------
// Wire buttons
// ---------------------------
connectBtn.addEventListener('click', connectMetaMask);
if (requestBtn) requestBtn.addEventListener('click', requestLoan);
if (fundBtn) fundBtn.addEventListener('click', fundLoan);
if (claimBtn) claimBtn.addEventListener('click', claimCollateral);
if (repayBtn) repayBtn.addEventListener('click', repayLoan);
if (refreshBtn) refreshBtn.addEventListener('click', loadLoans);
if (refreshTop) refreshTop.addEventListener('click', loadLoans);

// ---------------------------
// Init
// ---------------------------
(function init() {
  injectSpaceUI();
  enableAll(false);
  setMessage('Click "Connect MetaMask" to begin', 'info');
})();
