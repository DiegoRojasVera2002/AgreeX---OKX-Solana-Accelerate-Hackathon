const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AgreeX Escrow Contract - OKX DEX Integration", function () {
  let agreeXEscrow;
  let owner, employer, freelancer, supervisor, otherAccount;
  
  // Test data
  const contractId = "TEST-CONTRACT-001";
  const milestoneDescriptions = ["Design Phase", "Development", "Testing & Deployment"];
  const milestoneAmounts = [
    ethers.utils.parseEther("0.5"),
    ethers.utils.parseEther("1.0"),
    ethers.utils.parseEther("0.5")
  ];
  const totalAmount = ethers.utils.parseEther("2.0");
  
  beforeEach(async function () {
    // Get signers
    [owner, employer, freelancer, supervisor, otherAccount] = await ethers.getSigners();
    
    // Deploy contract
    const AgreeXEscrow = await ethers.getContractFactory("AgreeXEscrow");
    agreeXEscrow = await AgreeXEscrow.deploy();
    await agreeXEscrow.deployed();
  });
  
  describe("Contract Deployment", function () {
    it("Should deploy with correct OKX aggregator addresses", async function () {
      // Check Ethereum mainnet aggregator
      const ethAggregator = await agreeXEscrow.okxAggregators(1);
      expect(ethAggregator).to.equal("0x1111111254EEB25477B68fb85Ed929f73A960582");
      
      // Check Polygon aggregator
      const polygonAggregator = await agreeXEscrow.okxAggregators(137);
      expect(polygonAggregator).to.equal("0x1111111254EEB25477B68fb85Ed929f73A960582");
    });
  });
  
  describe("Contract Creation", function () {
    it("Should create a new freelance contract with ETH payment", async function () {
      await expect(
        agreeXEscrow.connect(employer).createContract(
          contractId,
          freelancer.address,
          supervisor.address,
          ethers.constants.AddressZero, // ETH payment
          milestoneDescriptions,
          milestoneAmounts,
          { value: totalAmount }
        )
      ).to.emit(agreeXEscrow, "ContractCreated")
        .withArgs(contractId, employer.address, freelancer.address, totalAmount, 31337); // Hardhat chainId
      
      // Verify contract details
      const contract = await agreeXEscrow.getContract(contractId);
      expect(contract.employer).to.equal(employer.address);
      expect(contract.freelancer).to.equal(freelancer.address);
      expect(contract.supervisor).to.equal(supervisor.address);
      expect(contract.totalAmount).to.equal(totalAmount);
      expect(contract.state).to.equal(0); // Pending
    });
    
    it("Should fail if contract ID already exists", async function () {
      // Create first contract
      await agreeXEscrow.connect(employer).createContract(
        contractId,
        freelancer.address,
        supervisor.address,
        ethers.constants.AddressZero,
        milestoneDescriptions,
        milestoneAmounts,
        { value: totalAmount }
      );
      
      // Try to create duplicate
      await expect(
        agreeXEscrow.connect(employer).createContract(
          contractId,
          freelancer.address,
          supervisor.address,
          ethers.constants.AddressZero,
          milestoneDescriptions,
          milestoneAmounts,
          { value: totalAmount }
        )
      ).to.be.revertedWith("Contract ID already exists");
    });
    
    it("Should fail with incorrect payment amount", async function () {
      await expect(
        agreeXEscrow.connect(employer).createContract(
          contractId,
          freelancer.address,
          supervisor.address,
          ethers.constants.AddressZero,
          milestoneDescriptions,
          milestoneAmounts,
          { value: ethers.utils.parseEther("1.0") } // Incorrect amount
        )
      ).to.be.revertedWith("Incorrect payment amount");
    });
  });
  
  describe("Milestone Completion", function () {
    beforeEach(async function () {
      // Create a contract
      await agreeXEscrow.connect(employer).createContract(
        contractId,
        freelancer.address,
        supervisor.address,
        ethers.constants.AddressZero,
        milestoneDescriptions,
        milestoneAmounts,
        { value: totalAmount }
      );
    });
    
    it("Should allow supervisor to complete milestone", async function () {
      const freelancerBalanceBefore = await freelancer.getBalance();
      
      await expect(
        agreeXEscrow.connect(supervisor).completeMilestone(contractId, 0)
      ).to.emit(agreeXEscrow, "MilestoneCompleted")
        .withArgs(contractId, 0, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1));
      
      // Check payment was released
      const freelancerBalanceAfter = await freelancer.getBalance();
      expect(freelancerBalanceAfter.sub(freelancerBalanceBefore)).to.equal(milestoneAmounts[0]);
      
      // Check milestone status
      const milestones = await agreeXEscrow.getMilestones(contractId);
      expect(milestones[0].completed).to.be.true;
      expect(milestones[0].paid).to.be.true;
    });
    
    it("Should fail if non-supervisor tries to complete milestone", async function () {
      await expect(
        agreeXEscrow.connect(employer).completeMilestone(contractId, 0)
      ).to.be.revertedWith("Only supervisor can perform this action");
    });
    
    it("Should fail if milestone already completed", async function () {
      await agreeXEscrow.connect(supervisor).completeMilestone(contractId, 0);
      
      await expect(
        agreeXEscrow.connect(supervisor).completeMilestone(contractId, 0)
      ).to.be.revertedWith("Milestone already completed");
    });
    
    it("Should update contract state to Completed when all milestones done", async function () {
      // Complete all milestones
      await agreeXEscrow.connect(supervisor).completeMilestone(contractId, 0);
      await agreeXEscrow.connect(supervisor).completeMilestone(contractId, 1);
      await agreeXEscrow.connect(supervisor).completeMilestone(contractId, 2);
      
      // Check contract state
      const contract = await agreeXEscrow.getContract(contractId);
      expect(contract.state).to.equal(3); // Completed
    });
  });
  
  describe("Contract Cancellation", function () {
    beforeEach(async function () {
      await agreeXEscrow.connect(employer).createContract(
        contractId,
        freelancer.address,
        supervisor.address,
        ethers.constants.AddressZero,
        milestoneDescriptions,
        milestoneAmounts,
        { value: totalAmount }
      );
    });
    
    it("Should allow supervisor to cancel contract and refund employer", async function () {
      const employerBalanceBefore = await employer.getBalance();
      
      await expect(
        agreeXEscrow.connect(supervisor).cancelContract(contractId)
      ).to.emit(agreeXEscrow, "ContractCancelled")
        .withArgs(contractId, totalAmount);
      
      // Check refund
      const employerBalanceAfter = await employer.getBalance();
      expect(employerBalanceAfter.sub(employerBalanceBefore)).to.be.closeTo(
        totalAmount,
        ethers.utils.parseEther("0.01") // Account for gas
      );
      
      // Check contract state
      const contract = await agreeXEscrow.getContract(contractId);
      expect(contract.state).to.equal(4); // Cancelled
    });
    
    it("Should calculate partial refund if some milestones were paid", async function () {
      // Complete first milestone
      await agreeXEscrow.connect(supervisor).completeMilestone(contractId, 0);
      
      const employerBalanceBefore = await employer.getBalance();
      const expectedRefund = milestoneAmounts[1].add(milestoneAmounts[2]);
      
      await expect(
        agreeXEscrow.connect(supervisor).cancelContract(contractId)
      ).to.emit(agreeXEscrow, "ContractCancelled")
        .withArgs(contractId, expectedRefund);
      
      // Check partial refund
      const employerBalanceAfter = await employer.getBalance();
      expect(employerBalanceAfter.sub(employerBalanceBefore)).to.be.closeTo(
        expectedRefund,
        ethers.utils.parseEther("0.01")
      );
    });
  });
  
  describe("OKX DEX Swap Integration", function () {
    beforeEach(async function () {
      await agreeXEscrow.connect(employer).createContract(
        contractId,
        freelancer.address,
        supervisor.address,
        ethers.constants.AddressZero,
        milestoneDescriptions,
        milestoneAmounts,
        { value: totalAmount }
      );
      
      // Complete milestone but don't pay yet
      // Note: In real implementation, we'd need to modify the contract
      // to separate completion from payment for testing swapAndPay
    });
    
    it("Should emit OKXSwapExecuted event when swapping payment", async function () {
      // This test would require mocking OKX DEX aggregator
      // In a real test environment, you'd deploy a mock aggregator
      
      // Example of what the test would look like:
      /*
      const mockUSDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
      const minReturn = ethers.utils.parseUnits("950", 6);
      const pools = ["0x..."];
      const swapData = "0x...";
      
      await expect(
        agreeXEscrow.connect(supervisor).swapAndPay(
          contractId,
          0,
          mockUSDC,
          minReturn,
          pools,
          swapData
        )
      ).to.emit(agreeXEscrow, "OKXSwapExecuted");
      */
    });
  });
  
  describe("View Functions", function () {
    beforeEach(async function () {
      // Create multiple contracts
      await agreeXEscrow.connect(employer).createContract(
        "CONTRACT-1",
        freelancer.address,
        supervisor.address,
        ethers.constants.AddressZero,
        milestoneDescriptions,
        milestoneAmounts,
        { value: totalAmount }
      );
      
      await agreeXEscrow.connect(employer).createContract(
        "CONTRACT-2",
        freelancer.address,
        supervisor.address,
        ethers.constants.AddressZero,
        milestoneDescriptions,
        milestoneAmounts,
        { value: totalAmount }
      );
    });
    
    it("Should return contracts by employer", async function () {
      const contracts = await agreeXEscrow.getContractsByEmployer(employer.address);
      expect(contracts.length).to.equal(2);
      expect(contracts).to.include("CONTRACT-1");
      expect(contracts).to.include("CONTRACT-2");
    });
    
    it("Should return contracts by freelancer", async function () {
      const contracts = await agreeXEscrow.getContractsByFreelancer(freelancer.address);
      expect(contracts.length).to.equal(2);
    });
    
    it("Should return contracts by supervisor", async function () {
      const contracts = await agreeXEscrow.getContractsBySupervisor(supervisor.address);
      expect(contracts.length).to.equal(2);
    });
  });
}); 