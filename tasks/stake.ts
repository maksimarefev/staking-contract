import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

//todo arefev: fix desc
task("stake", "Allows `spender` to withdraw from caller's account multiple times, up to the `tokens` amount.")
    .addParam("contractAddress", "An address of a contract")
    .addParam("amount", "Address which should receive an approval to spend caller's tokens") //todo fix desc
    .setAction(async function (taskArgs, hre) {
        const StakingContract: ContractFactory = await hre.ethers.getContractFactory("StakingContract");
        const stakingContract: Contract = await StakingContract.attach(taskArgs.contractAddress);

        const stakeTx = await stakingContract.approve(taskArgs.spender, taskArgs.tokens);
        const stakeTxReceipt = await stakeTx.wait();
        const transferEvent: Event = stakeTxReceipt.events[0];

        console.log("Successfully staked %d tokens from %s",transferEvent.args.tokens.toNumber(),transferEvent.args.from);
        console.log("Gas used: %d", stakeTxReceipt.gasUsed.toNumber() * stakeTxReceipt.effectiveGasPrice.toNumber());
    });
