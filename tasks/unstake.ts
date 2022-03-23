import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

//todo arefev: fix a description
task("unstake", "Allows `spender` to withdraw from caller's account multiple times, up to the `tokens` amount.")
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
