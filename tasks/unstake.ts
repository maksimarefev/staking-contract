import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

task("unstake", "Transfers staked tokens if any to the `msg.sender` address")
    .addParam("contractAddress", "An address of a contract")
    .setAction(async function (taskArgs, hre) {
        const StakingContract: ContractFactory = await hre.ethers.getContractFactory("StakingContract");
        const stakingContract: Contract = await StakingContract.attach(taskArgs.contractAddress);

        const unstakeTx = await stakingContract.unstake();
        const unstakeTxReceipt = await unstakeTx.wait();
        const transferEvent: Event = unstakeTxReceipt.events[0];

        console.log(
            "Successfully unstaken for %d tokens to %s",
            transferEvent.args.to,
            transferEvent.args.tokens.toNumber()
        );
        console.log("Gas used: %d", unstakeTxReceipt.gasUsed.toNumber() * unstakeTxReceipt.effectiveGasPrice.toNumber());
    });
