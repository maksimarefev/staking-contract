import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

task("calim", "Transfers the reward tokens if any to the `msg.sender` address")
    .addParam("contractAddress", "An address of a contract")
    .setAction(async function (taskArgs, hre) {
        const StakingContract: ContractFactory = await hre.ethers.getContractFactory("StakingContract");
        const stakingContract: Contract = await StakingContract.attach(taskArgs.contractAddress);

        const claimTx = await stakingContract.claim();
        const claimTxReceipt = await claimTx.wait();
        const transferEvent: Event = claimTxReceipt.events[0];

        console.log(
            "Successfully claimed for %d tokens to %s",
            transferEvent.args.to,
            transferEvent.args.tokens.toNumber()
        );
        console.log("Gas used: %d", claimTxReceipt.gasUsed.toNumber() * claimTxReceipt.effectiveGasPrice.toNumber());
    });
