// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title AgreeX Escrow Contract for OKX DEX
 * @notice Smart contract for freelance agreements with OKX DEX integration
 * @dev Integrates with OKX DEX Aggregator for cross-chain payments
 */

interface IOKXDEXAggregator {
    function swap(
        address fromToken,
        address toToken,
        uint256 amount,
        uint256 minReturn,
        address[] calldata pools,
        bytes calldata data
    ) external payable returns (uint256 returnAmount);
    
    function getRate(
        address fromToken,
        address toToken,
        uint256 amount
    ) external view returns (uint256 rate);
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract AgreeXEscrow {
    // OKX DEX Aggregator address on different chains
    mapping(uint256 => address) public okxAggregators;
    
    // Contract states
    enum ContractState { Pending, InProgress, UnderReview, Completed, Cancelled }
    
    // Milestone structure
    struct Milestone {
        string description;
        uint256 amount;
        bool completed;
        bool paid;
        uint256 completedAt;
    }
    
    // Contract structure
    struct FreelanceContract {
        string id;
        address employer;
        address freelancer;
        address supervisor;
        address paymentToken; // Token address (0x0 for native)
        uint256 totalAmount;
        uint256 createdAt;
        ContractState state;
        Milestone[] milestones;
        bool fundsDeposited;
        uint256 chainId;
    }
    
    // Storage
    mapping(string => FreelanceContract) public contracts;
    mapping(address => string[]) public contractsByEmployer;
    mapping(address => string[]) public contractsByFreelancer;
    mapping(address => string[]) public contractsBySupervisor;
    
    // OKX DEX integration settings
    address public constant OKX_AGGREGATOR_ETH = 0x1111111254EEB25477B68fb85Ed929f73A960582;
    address public constant OKX_AGGREGATOR_POLYGON = 0x1111111254EEB25477B68fb85Ed929f73A960582;
    address public constant OKX_AGGREGATOR_ARBITRUM = 0x1111111254EEB25477B68fb85Ed929f73A960582;
    
    // Events
    event ContractCreated(
        string indexed contractId,
        address indexed employer,
        address indexed freelancer,
        uint256 totalAmount,
        uint256 chainId
    );
    
    event MilestoneCompleted(
        string indexed contractId,
        uint256 milestoneIndex,
        uint256 timestamp
    );
    
    event PaymentReleased(
        string indexed contractId,
        uint256 milestoneIndex,
        address freelancer,
        uint256 amount,
        address token
    );
    
    event ContractCancelled(
        string indexed contractId,
        uint256 refundAmount
    );
    
    event OKXSwapExecuted(
        address fromToken,
        address toToken,
        uint256 amountIn,
        uint256 amountOut
    );
    
    // Modifiers
    modifier onlyEmployer(string memory contractId) {
        require(
            contracts[contractId].employer == msg.sender,
            "Only employer can perform this action"
        );
        _;
    }
    
    modifier onlySupervisor(string memory contractId) {
        require(
            contracts[contractId].supervisor == msg.sender,
            "Only supervisor can perform this action"
        );
        _;
    }
    
    modifier contractExists(string memory contractId) {
        require(
            contracts[contractId].createdAt != 0,
            "Contract does not exist"
        );
        _;
    }
    
    constructor() {
        // Initialize OKX aggregators for different chains
        okxAggregators[1] = OKX_AGGREGATOR_ETH; // Ethereum
        okxAggregators[137] = OKX_AGGREGATOR_POLYGON; // Polygon
        okxAggregators[42161] = OKX_AGGREGATOR_ARBITRUM; // Arbitrum
        okxAggregators[10] = OKX_AGGREGATOR_ETH; // Optimism
        okxAggregators[43114] = OKX_AGGREGATOR_ETH; // Avalanche
        okxAggregators[56] = OKX_AGGREGATOR_ETH; // BSC
    }
    
    /**
     * @notice Create a new freelance contract with escrow
     * @param contractId Unique identifier for the contract
     * @param freelancer Address of the freelancer
     * @param supervisor Address of the supervisor/verifier
     * @param paymentToken Token for payment (address(0) for native)
     * @param milestoneDescriptions Array of milestone descriptions
     * @param milestoneAmounts Array of amounts for each milestone
     */
    function createContract(
        string memory contractId,
        address freelancer,
        address supervisor,
        address paymentToken,
        string[] memory milestoneDescriptions,
        uint256[] memory milestoneAmounts
    ) external payable {
        require(
            contracts[contractId].createdAt == 0,
            "Contract ID already exists"
        );
        require(
            milestoneDescriptions.length == milestoneAmounts.length,
            "Milestone data mismatch"
        );
        require(
            freelancer != address(0) && supervisor != address(0),
            "Invalid addresses"
        );
        
        uint256 totalAmount = 0;
        for (uint i = 0; i < milestoneAmounts.length; i++) {
            totalAmount += milestoneAmounts[i];
        }
        
        // Handle payment deposit
        if (paymentToken == address(0)) {
            // Native token payment
            require(msg.value == totalAmount, "Incorrect payment amount");
        } else {
            // ERC20 token payment
            require(
                IERC20(paymentToken).transferFrom(msg.sender, address(this), totalAmount),
                "Token transfer failed"
            );
        }
        
        // Create contract
        FreelanceContract storage newContract = contracts[contractId];
        newContract.id = contractId;
        newContract.employer = msg.sender;
        newContract.freelancer = freelancer;
        newContract.supervisor = supervisor;
        newContract.paymentToken = paymentToken;
        newContract.totalAmount = totalAmount;
        newContract.createdAt = block.timestamp;
        newContract.state = ContractState.Pending;
        newContract.fundsDeposited = true;
        newContract.chainId = block.chainid;
        
        // Add milestones
        for (uint i = 0; i < milestoneDescriptions.length; i++) {
            newContract.milestones.push(Milestone({
                description: milestoneDescriptions[i],
                amount: milestoneAmounts[i],
                completed: false,
                paid: false,
                completedAt: 0
            }));
        }
        
        // Update indexes
        contractsByEmployer[msg.sender].push(contractId);
        contractsByFreelancer[freelancer].push(contractId);
        contractsBySupervisor[supervisor].push(contractId);
        
        emit ContractCreated(
            contractId,
            msg.sender,
            freelancer,
            totalAmount,
            block.chainid
        );
    }
    
    /**
     * @notice Mark a milestone as completed (supervisor only)
     * @param contractId The contract identifier
     * @param milestoneIndex Index of the milestone
     */
    function completeMilestone(
        string memory contractId,
        uint256 milestoneIndex
    ) external contractExists(contractId) onlySupervisor(contractId) {
        FreelanceContract storage freelanceContract = contracts[contractId];
        require(
            milestoneIndex < freelanceContract.milestones.length,
            "Invalid milestone index"
        );
        require(
            !freelanceContract.milestones[milestoneIndex].completed,
            "Milestone already completed"
        );
        require(
            freelanceContract.state != ContractState.Cancelled &&
            freelanceContract.state != ContractState.Completed,
            "Contract is not active"
        );
        
        // Mark milestone as completed
        freelanceContract.milestones[milestoneIndex].completed = true;
        freelanceContract.milestones[milestoneIndex].completedAt = block.timestamp;
        
        // Update contract state if needed
        if (freelanceContract.state == ContractState.Pending) {
            freelanceContract.state = ContractState.InProgress;
        }
        
        emit MilestoneCompleted(contractId, milestoneIndex, block.timestamp);
        
        // Automatically release payment for completed milestone
        _releaseMilestonePayment(contractId, milestoneIndex);
    }
    
    /**
     * @notice Release payment for a completed milestone
     * @param contractId The contract identifier
     * @param milestoneIndex Index of the milestone
     */
    function _releaseMilestonePayment(
        string memory contractId,
        uint256 milestoneIndex
    ) internal {
        FreelanceContract storage freelanceContract = contracts[contractId];
        Milestone storage milestone = freelanceContract.milestones[milestoneIndex];
        
        require(milestone.completed, "Milestone not completed");
        require(!milestone.paid, "Milestone already paid");
        
        milestone.paid = true;
        
        // Execute payment
        if (freelanceContract.paymentToken == address(0)) {
            // Native token transfer
            (bool success, ) = freelanceContract.freelancer.call{value: milestone.amount}("");
            require(success, "Native token transfer failed");
        } else {
            // ERC20 token transfer
            require(
                IERC20(freelanceContract.paymentToken).transfer(
                    freelanceContract.freelancer,
                    milestone.amount
                ),
                "Token transfer failed"
            );
        }
        
        emit PaymentReleased(
            contractId,
            milestoneIndex,
            freelanceContract.freelancer,
            milestone.amount,
            freelanceContract.paymentToken
        );
        
        // Check if all milestones are completed
        bool allCompleted = true;
        for (uint i = 0; i < freelanceContract.milestones.length; i++) {
            if (!freelanceContract.milestones[i].completed) {
                allCompleted = false;
                break;
            }
        }
        
        if (allCompleted) {
            freelanceContract.state = ContractState.Completed;
        }
    }
    
    /**
     * @notice Execute a swap using OKX DEX before payment
     * @param contractId The contract identifier
     * @param milestoneIndex Index of the milestone
     * @param toToken Target token address
     * @param minReturn Minimum expected return
     */
    function swapAndPay(
        string memory contractId,
        uint256 milestoneIndex,
        address toToken,
        uint256 minReturn,
        address[] calldata pools,
        bytes calldata swapData
    ) external contractExists(contractId) onlySupervisor(contractId) {
        FreelanceContract storage freelanceContract = contracts[contractId];
        Milestone storage milestone = freelanceContract.milestones[milestoneIndex];
        
        require(milestone.completed && !milestone.paid, "Invalid milestone state");
        
        // Get OKX aggregator for current chain
        address aggregator = okxAggregators[block.chainid];
        require(aggregator != address(0), "OKX not supported on this chain");
        
        milestone.paid = true;
        
        // Execute swap through OKX DEX
        uint256 returnAmount;
        if (freelanceContract.paymentToken == address(0)) {
            // Swap native token
            returnAmount = IOKXDEXAggregator(aggregator).swap{value: milestone.amount}(
                address(0),
                toToken,
                milestone.amount,
                minReturn,
                pools,
                swapData
            );
        } else {
            // Approve and swap ERC20
            IERC20(freelanceContract.paymentToken).approve(aggregator, milestone.amount);
            returnAmount = IOKXDEXAggregator(aggregator).swap(
                freelanceContract.paymentToken,
                toToken,
                milestone.amount,
                minReturn,
                pools,
                swapData
            );
        }
        
        // Transfer swapped tokens to freelancer
        if (toToken == address(0)) {
            (bool success, ) = freelanceContract.freelancer.call{value: returnAmount}("");
            require(success, "Native token transfer failed");
        } else {
            require(
                IERC20(toToken).transfer(freelanceContract.freelancer, returnAmount),
                "Token transfer failed"
            );
        }
        
        emit OKXSwapExecuted(
            freelanceContract.paymentToken,
            toToken,
            milestone.amount,
            returnAmount
        );
        
        emit PaymentReleased(
            contractId,
            milestoneIndex,
            freelanceContract.freelancer,
            returnAmount,
            toToken
        );
    }
    
    /**
     * @notice Cancel contract and refund employer
     * @param contractId The contract identifier
     */
    function cancelContract(
        string memory contractId
    ) external contractExists(contractId) onlySupervisor(contractId) {
        FreelanceContract storage freelanceContract = contracts[contractId];
        
        require(
            freelanceContract.state != ContractState.Completed &&
            freelanceContract.state != ContractState.Cancelled,
            "Contract cannot be cancelled"
        );
        
        // Calculate refund amount
        uint256 refundAmount = 0;
        for (uint i = 0; i < freelanceContract.milestones.length; i++) {
            if (!freelanceContract.milestones[i].paid) {
                refundAmount += freelanceContract.milestones[i].amount;
            }
        }
        
        freelanceContract.state = ContractState.Cancelled;
        
        // Process refund
        if (refundAmount > 0) {
            if (freelanceContract.paymentToken == address(0)) {
                (bool success, ) = freelanceContract.employer.call{value: refundAmount}("");
                require(success, "Refund failed");
            } else {
                require(
                    IERC20(freelanceContract.paymentToken).transfer(
                        freelanceContract.employer,
                        refundAmount
                    ),
                    "Token refund failed"
                );
            }
        }
        
        emit ContractCancelled(contractId, refundAmount);
    }
    
    // View functions
    function getContract(string memory contractId) 
        external 
        view 
        returns (FreelanceContract memory) 
    {
        return contracts[contractId];
    }
    
    function getMilestones(string memory contractId) 
        external 
        view 
        returns (Milestone[] memory) 
    {
        return contracts[contractId].milestones;
    }
    
    function getContractsByEmployer(address employer) 
        external 
        view 
        returns (string[] memory) 
    {
        return contractsByEmployer[employer];
    }
    
    function getContractsByFreelancer(address freelancer) 
        external 
        view 
        returns (string[] memory) 
    {
        return contractsByFreelancer[freelancer];
    }
    
    function getContractsBySupervisor(address supervisor) 
        external 
        view 
        returns (string[] memory) 
    {
        return contractsBySupervisor[supervisor];
    }
} 