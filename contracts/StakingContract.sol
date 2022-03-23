// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

//todo arefev: write the comments, use the /notice/ /param/ /return/ keywords
contract StakingContract {

    IERC20 private _rewardToken;

    IERC20 private _stakingToken;

    /**
     * @dev The stakes for each stakeholder.
     */
    mapping(address => uint256) private stakes;

    /**
     * @dev Stores last stake update dates
     */
    mapping(address => uint256) private lastStakeDates;

    /**
     * @dev The reward for each stakeholder.
     */
    mapping(address => uint256) private rewards;

    /**
     * @dev Stores last dates of reward updates
     */
    mapping(address => uint256) private rewardUpdateDates;

    uint8 private _rewardPercentage;

    /**
     * @dev The reward period in seconds
     */
    uint256 private _rewardPeriod;

    /**
     * @dev The stake withdrawal timeout in seconds
     */
    uint256 private _stakeWithdrawalTimeout;

    uint256 private _totalStake;

    address private _owner;

    modifier onlyOwner() {
        require(msg.sender == _owner, 'Only the owner is allowed to perform this operation');
        _;
    }

    constructor(
        address stakingToken,
        address rewardToken,
        uint8 rewardPercentage,
        uint256 rewardRate,
        uint256 stakeWithdrawalTimeout
    ) {
        _owner = msg.sender;
        setRewardPercentage(rewardPercentage);
        setRewardRate(rewardRate);
        setStakeWithdrawalTimeout(stakeWithdrawalTimeout);
        _stakingToken = IERC20(stakingToken);
        _rewardToken = IERC20(rewardToken);
    }

    function stake(uint256 amount) external {
        _updateReward();

        stakes[msg.sender] += amount;
        _totalStake += amount;

        lastStakeDates[msg.sender] = block.timestamp;
        _stakingToken.transferFrom(msg.sender, address(this), amount);
    }

    function claim() external {
        _updateReward();

        uint256 reward = rewards[msg.sender];

        require(reward > 0, 'No reward for the caller');

        rewards[msg.sender] = 0;
        _rewardToken.transfer(msg.sender, reward);
    }

    function unstake() external {
        require(stakes[msg.sender] > 0, "The caller has nothing at stake");

        uint256 lastStakeDate = lastStakeDates[msg.sender];
        require(
            block.timestamp - lastStakeDate >= _stakeWithdrawalTimeout,
            "Stake withdrawal is not allowed due to an insufficient time passed since the last stake was made"
        );

        _updateReward();
        uint256 amount = stakes[msg.sender];
        stakes[msg.sender] = 0;
        _totalStake -= amount;
        _stakingToken.transfer(msg.sender, amount);
    }

    function setRewardPercentage(uint8 rewardPercentage) public onlyOwner {
        require(rewardPercentage > 0, "Reward percentage can not be zero");
        require(rewardPercentage < 100, "Reward percentage can not exceed 100%");
        _rewardPercentage = rewardPercentage;
    }

    function setRewardRate(uint256 rewardRate) public onlyOwner {
        require(rewardRate > 0, "Reward rate can not be zero");
        _rewardPeriod = rewardRate;
    }

    function setStakeWithdrawalTimeout(uint256 stakeWithdrawalTimeout) public onlyOwner {
        _stakeWithdrawalTimeout = stakeWithdrawalTimeout;
    }

    function getStake(address stakeholder) public view returns (uint256) {
        return stakes[stakeholder];
    }

    function transferOwnership(address to) external onlyOwner {
        require(to != address(0), 'Transferring ownership to the zero address is not allowed');
        _owner = to;
    }

    function totalStake() public view returns (uint256) {
        return _totalStake;
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function rewardPercentage() public view returns(uint8) {
        return _rewardPercentage;
    }

    function rewardPeriod() public view returns(uint256) {
        return _rewardPeriod;
    }

    function stakeWithdrawalTimeout() public view returns(uint256) {
        return _stakeWithdrawalTimeout;
    }

    function _updateReward() internal {
        if (stakes[msg.sender] == 0) {
            rewardUpdateDates[msg.sender] = block.timestamp;
            return;
        }

        uint256 rewardingPeriods = (block.timestamp - rewardUpdateDates[msg.sender]) / _rewardPeriod;
        uint256 reward = stakes[msg.sender] * rewardingPeriods * _rewardPercentage / 100;
        rewards[msg.sender] += reward;
        rewardUpdateDates[msg.sender] = block.timestamp;
    }
}
