import { expect } from "chai";
import { ethers, artifacts, network } from "hardhat";
import { Signer, Contract, ContractFactory, Event, BigNumber } from "ethers";
import { StakingContract, StakingContract__factory, ERC20Mock, ERC20Mock__factory } from '../typechain-types';

describe("StakingContract", function () {
    const initialSupply: number = 1_000_000_000_000
    const rewardPercentage: number = 20;
    const rewardingPeriod: number = 10;
    const stakeWithdrawalTimeout: number = 10;

    let bob: Signer;
    let alice: Signer;
    let rewardToken: ERC20Mock;
    let stakingToken: ERC20Mock;
    let stakingContract: StakingContract;

    beforeEach(async function () {
        [alice, bob] = await ethers.getSigners();

        const ERC20MockFactory: ERC20Mock__factory = (await ethers.getContractFactory("ERC20Mock")) as ERC20Mock__factory;

        rewardToken = await ERC20MockFactory.deploy('Reward', 'RWD', initialSupply)
        stakingToken = await ERC20MockFactory.deploy('Staking', 'STK', initialSupply);

        const rewardTokenAddress: string = rewardToken.address;
        const stakingTokenAddress: string = stakingToken.address;

        const StakingContractFactory: StakingContract__factory =
            (await ethers.getContractFactory("StakingContract")) as StakingContract__factory;
        stakingContract = await StakingContractFactory.deploy(
             stakingTokenAddress, rewardTokenAddress, rewardPercentage, rewardingPeriod, stakeWithdrawalTimeout
         );

         await rewardToken.transfer(stakingContract.address, initialSupply);
    })

    function assertTransferEvent(event: Event, from: string, to: string, value: number) {
        expect("Transfer").to.equal(event.event);
        expect(from).to.equal(event.args.from);
        expect(to).to.equal(event.args.to);
        expect(value).to.equal(event.args.tokens.toNumber());
    }

    it("Should change total stake after staking", async () => {
        const tokensToStake: number = 100;
        const totalStakeBefore: BigNumber = await stakingContract.totalStake();
        const aliceAddress: string = await alice.getAddress();
        await stakingToken.approve(stakingContract.address, tokensToStake);
        await stakingContract.stake(tokensToStake);

        const totalStakeAfter: BigNumber = await stakingContract.totalStake();

        expect(tokensToStake).to.equal(totalStakeAfter.toNumber() - totalStakeBefore.toNumber());
    })

    it("Should not allow to unstake before the timeout has expired", async () => {
        const tokensToStake: number = 100;
        const aliceAddress: string = await alice.getAddress();
        await stakingToken.approve(stakingContract.address, tokensToStake);
        await stakingContract.stake(tokensToStake);

        const unstakeTxPromise: Promise<any> = stakingContract.unstake();

        await expect(unstakeTxPromise)
          .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Timeout is not met'");
    })

    it("Should allow to unstake after the timeout has expired", async () => {
        const tokensToStake: number = 100;
        const aliceAddress: string = await alice.getAddress();
        await stakingToken.approve(stakingContract.address, tokensToStake);
        await stakingContract.stake(tokensToStake);

        await network.provider.send("evm_increaseTime", [stakeWithdrawalTimeout])

        const aliceBalanceBeforeUnstaking: BigNumber = await stakingToken.balanceOf(aliceAddress);
        await stakingContract.unstake();
        const aliceBalanceAfterUnstaking: BigNumber = await stakingToken.balanceOf(aliceAddress);

        expect(tokensToStake).to.equal(aliceBalanceAfterUnstaking.toNumber() - aliceBalanceBeforeUnstaking.toNumber());
    })

    it("Should not allow to unstake if nothing at stake", async () => {
        const unstakeTxPromise: Promise<any> = stakingContract.unstake();

        await expect(unstakeTxPromise)
          .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'The caller has nothing at stake'");
    })

    it("Should not allow to claim if there is no reward", async () => {
        const claimTxPromise: Promise<any> = stakingContract.claim();

        await expect(claimTxPromise)
          .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'No reward for the caller'");
    })

     it("Should not allow for non-owner to change the reward percentage", async () => {
         const aNewRewardPercentage: number = 50;

         const setRewardPercentageTxPromise: Promise<any> =
            stakingContract.connect(bob).setRewardPercentage(aNewRewardPercentage);

         await expect(setRewardPercentageTxPromise)
           .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Caller is not the owner'");
     })

    it("Should not allow for non-owner to change the reward period", async () => {
        const aNewRewardPeriod: number = 50;

        const setRewardPeriodTxPromise: Promise<any> = stakingContract.connect(bob).setRewardPeriod(aNewRewardPeriod);

        await expect(setRewardPeriodTxPromise)
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Caller is not the owner'");
    })

    it("Should not allow for non-owner to change the stake withdrawal timeout", async () => {
        const aNewstakeWithdrawalTimeout: number = 50;

        const setStakeWithdrawalTimeoutTxPromise: Promise<any> =
            stakingContract.connect(bob).setStakeWithdrawalTimeout(aNewstakeWithdrawalTimeout);

        await expect(setStakeWithdrawalTimeoutTxPromise)
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Caller is not the owner'");
    })

    it("Should allow for the owner to change the reward percentage", async () => {
         const aNewRewardPercentage: number = 50;

         await stakingContract.setRewardPercentage(aNewRewardPercentage);

         const rewardPercentage: number = await stakingContract.rewardPercentage();
         expect(aNewRewardPercentage).to.equal(rewardPercentage);
     })

    it("Should allow for the owner to change the reward period", async () => {
        const aNewRewardPeriod: number = 50;

        await stakingContract.setRewardPeriod(aNewRewardPeriod);

        const rewardPeriod: BigNumber = await stakingContract.rewardPeriod();
        expect(aNewRewardPeriod).to.equal(rewardPeriod);
    })

    it("Should allow for the owner to change the stake withdrawal timeout", async () => {
        const aNewStakeWithdrawalTimeout: number = 50;

        await stakingContract.setStakeWithdrawalTimeout(aNewStakeWithdrawalTimeout);

        const stakeWithdrawalTimeout: BigNumber = await stakingContract.stakeWithdrawalTimeout();
        expect(aNewStakeWithdrawalTimeout).to.equal(stakeWithdrawalTimeout);
    })

    it("Should not allow to set the reward percentage to zero", async () => {
        const aNewRewardPercentage = 0;

        const setRewardPercentageTxPromise: Promise<any> = stakingContract.setRewardPercentage(aNewRewardPercentage);

        await expect(setRewardPercentageTxPromise)
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Percentage can not be 0'");
    })

     it("Should not allow to set the reward percentage greater than 100", async () => {
        const aNewRewardPercentage = 101;

        const setRewardPercentageTxPromise: Promise<any> =
            stakingContract.setRewardPercentage(aNewRewardPercentage);

        await expect(setRewardPercentageTxPromise)
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Percentage can not exceed 100%'");
     })

     it("Should not allow to set the reward period to zero", async () => {
         const aNewRewardPeriod = 0;

         const setRewardPeriodTxPromise: Promise<any> = stakingContract.setRewardPeriod(aNewRewardPeriod);

         await expect(setRewardPeriodTxPromise)
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'Reward period can not be zero'");
     })

    it("Should calculate the reward properly", async () => {
        const tokensToStake: number = 100;
        const aliceAddress: string = await alice.getAddress();
        await stakingToken.approve(stakingContract.address, tokensToStake);
        await stakingContract.stake(tokensToStake);

        await network.provider.send("evm_increaseTime", [rewardingPeriod])

        const aliceRewardBalanceBeforeClaim: BigNumber = await rewardToken.balanceOf(aliceAddress);
        await stakingContract.claim();
        const aliceRewardBalanceAfterClaim: BigNumber = await rewardToken.balanceOf(aliceAddress);
        const expectedReward = tokensToStake * rewardPercentage / 100;

        expect(expectedReward).to.equal(aliceRewardBalanceAfterClaim.toNumber() - aliceRewardBalanceBeforeClaim.toNumber());
    })

    it("Should calculate the reward properly", async () => {
        const tokensToStake: number = 100;
        const aliceAddress: string = await alice.getAddress();
        await stakingToken.approve(stakingContract.address, tokensToStake);
        await stakingContract.stake(tokensToStake);

        await network.provider.send("evm_increaseTime", [rewardingPeriod])

        const aliceRewardBalanceBeforeClaim: BigNumber = await rewardToken.balanceOf(aliceAddress);
        await stakingContract.claim();
        const aliceRewardBalanceAfterClaim: BigNumber = await rewardToken.balanceOf(aliceAddress);
        const expectedReward = tokensToStake * rewardPercentage / 100;

        expect(expectedReward).to.equal(aliceRewardBalanceAfterClaim.toNumber() - aliceRewardBalanceBeforeClaim.toNumber());
    })

    it("Should return the valid owner", async () => {
        const aliceAddress: string = await alice.getAddress();

        const theOwner: string = await stakingContract.owner();

        expect(theOwner).to.equal(aliceAddress);
    })

    it("Should return the valid stake volume", async () => {
        const tokensToStake: number = 100;
        const aliceStakeBefore: BigNumber = await stakingContract.totalStake();
        const aliceAddress: string = await alice.getAddress();
        await stakingToken.approve(stakingContract.address, tokensToStake);
        await stakingContract.stake(tokensToStake);

        const aliceStakeAfter: BigNumber = await stakingContract.getStake(aliceAddress);

        expect(tokensToStake).to.equal(aliceStakeAfter.toNumber() - aliceStakeBefore.toNumber());
    })

    it("Should not allow to transfer ownership to the zero address", async () => {
        await expect(stakingContract.transferOwnership(ethers.constants.AddressZero))
            .to.be.revertedWith("VM Exception while processing transaction: reverted with reason string 'The zero address is not allowed'");
    })

    it("Should allow to transfer ownership to the valid address", async () => {
        const bobAddress: string = await bob.getAddress();

        await stakingContract.transferOwnership(bobAddress);

        const theOwner: string = await stakingContract.owner();
        expect(bobAddress).to.equal(theOwner);
    })
});
