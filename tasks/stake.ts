import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

task("stake", "Transfers the `amount` of tokens from `msg.sender` address to the StakingContract address")
    .addParam("contractAddress", "An address of a contract")
    .addParam("amount", "The amount of tokens to stake")
    .setAction(async function (taskArgs, hre) {
        const StakingContract: ContractFactory = await hre.ethers.getContractFactory("StakingContract");
        const stakingContract: Contract = await StakingContract.attach(taskArgs.contractAddress);

        const stakeTx = await stakingContract.approve(taskArgs.spender, taskArgs.tokens);
        const stakeTxReceipt = await stakeTx.wait();
        const transferEvent: Event = stakeTxReceipt.events[0];

        console.log("Successfully staked %d tokens from %s", transferEvent.args.tokens.toNumber(), transferEvent.args.from);
        console.log("Gas used: %d", stakeTxReceipt.gasUsed.toNumber() * stakeTxReceipt.effectiveGasPrice.toNumber());
    });
