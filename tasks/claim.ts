import "@nomiclabs/hardhat-web3";
import "@nomiclabs/hardhat-ethers";
import { task } from 'hardhat/config';
import { Contract, ContractFactory, Event } from "ethers";

//todo arefev: fix a description
task("calim", "Allows `spender` to withdraw from caller's account multiple times, up to the `tokens` amount.")
    .addParam("contractAddress", "An address of a contract")
    .setAction(async function (taskArgs, hre) {
        const StakingContract: ContractFactory = await hre.ethers.getContractFactory("StakingContract");
        const stakingContract: Contract = await StakingContract.attach(taskArgs.contractAddress);

        const claimTx = await stakingContract.claim();
        const claimTxReceipt = await claimTx.wait();
        const transferEvent: Event = claimTxReceipt.events[0];

        console.log(
            "Successfully claimed for %d tokens from %s",
            transferEvent.args.to,
            transferEvent.args.tokens.toNumber()
        );
        console.log("Gas used: %d", claimTxReceipt.gasUsed.toNumber() * claimTxReceipt.effectiveGasPrice.toNumber());
    });
