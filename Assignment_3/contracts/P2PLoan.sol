// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract P2PLoan {
    enum LoanStatus { Pending, Active, Repaid, Defaulted }

    struct Loan {
        uint id;
        address payable borrower;
        address payable lender;
        uint principal;
        uint collateralAmount;
        uint interestRate;
        uint totalRepayment;
        uint termEnd;
        LoanStatus status;
    }

    uint public nextLoanId = 1;
    mapping(uint => Loan) public loans;
    uint private constant LOAN_TERM = 7 days; 

    function requestLoan(
        uint _principal,
        uint _interestRate
    ) public payable returns (uint) {
        require(msg.value > _principal, "Collateral must exceed the principal amount.");
        require(_interestRate > 0 && _interestRate <= 100, "Invalid interest rate (0-100%).");
        
        uint totalInterest = (_principal * _interestRate) / 100;
        uint totalRepayment = _principal + totalInterest;

        loans[nextLoanId] = Loan({
            id: nextLoanId,
            borrower: payable(msg.sender),
            lender: payable(address(0)),
            principal: _principal,
            collateralAmount: msg.value,
            interestRate: _interestRate,
            totalRepayment: totalRepayment,
            termEnd: 0, 
            status: LoanStatus.Pending
        });
        return nextLoanId++;
    }

    function fundLoan(uint _loanId) public payable {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Pending, "Loan is not pending funding.");
        require(msg.value == loan.principal, "Must send exactly the principal amount to fund.");

        (bool successBorrower, ) = loan.borrower.call{value: loan.principal}("");
        require(successBorrower, "Principal transfer to borrower failed.");

        loan.lender = payable(msg.sender);
        loan.termEnd = block.timestamp + LOAN_TERM;
        loan.status = LoanStatus.Active;
    }
    
    function repayLoan(uint _loanId) public payable {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Loan is not active.");
        require(msg.sender == loan.borrower, "Only the borrower can repay.");
        require(msg.value >= loan.totalRepayment, "Insufficient repayment amount.");

        (bool successLender, ) = loan.lender.call{value: loan.totalRepayment}("");
        require(successLender, "Repayment transfer to lender failed.");

        uint excess = loan.collateralAmount;
        (bool successBorrower, ) = loan.borrower.call{value: excess}("");
        require(successBorrower, "Collateral return failed.");
        
        loan.status = LoanStatus.Repaid;
    }

    function claimCollateral(uint _loanId) public {
        Loan storage loan = loans[_loanId];
        require(loan.status == LoanStatus.Active, "Loan is not active.");
        require(msg.sender == loan.lender, "Only the lender can claim collateral.");
        require(block.timestamp > loan.termEnd, "Loan term has not yet expired.");

        uint collateral = loan.collateralAmount;
        (bool success, ) = loan.lender.call{value: collateral}("");
        require(success, "Collateral transfer failed.");

        loan.status = LoanStatus.Defaulted;
    }
}
