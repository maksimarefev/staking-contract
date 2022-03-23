import { ethers } from "hardhat";
import { Signer, Contract, ContractFactory } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function main() {
  const stakingToken: string = '0xacfe81d7c4504dea81043f33269c986fac7d00e5';
  const rewardToken: string = '0xEB493B155cADDf961268A7417F6bcf90eCcE1645';
  const rewardPercentage: number = 20; //20%
  const rewardPeriod: number = 10 * 60; //10 min
  const stakeWithdrawalTimeout: number = 20 * 60; //20 min

  const accounts: SignerWithAddress[] = await ethers.getSigners();

  if (accounts.length == 0) {
    throw new Error('No accounts were provided');
  }

  console.log("Deploying contracts with the account:", accounts[0].address);

  const StakingContract: ContractFactory = await ethers.getContractFactory("StakingContract");
  const stakingContract: Contract = await StakingContract.deploy(
        stakingToken, rewardToken, rewardPercentage, rewardPeriod, stakeWithdrawalTimeout
  );

  await stakingContract.deployed();

  console.log("StakingContract deployed to:", stakingContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });