## Configuring a secret
In the root folder create *.env* file and fill it the following properties:<br/>
```
{
    INFURA_API_KEY=[INFURA API KEY]
    PRIVATE_KEY=[YOUR ACCOUNT's PRIVATE KEY]
}
```

## How to deploy the contract
1. From the root folder run ``` npx hardhat run --network rinkeby scripts/deploy.ts ```
2. Save the contract address for future interactions

## How to verify the contract
1. Add the following property to the *.env* file:<br/>
```
    ETHERSCAN_API_KEY=[YOUR ETHERSCAN APY KEY]
```
2. From the root folder run ``` npx hardhat verify --network rinkeby [contract address] [arguments separated by space] ```

## How to run a task
From the root folder run<br/>``` npx hardhat [task name] --network rinkeby --contract-address [contract address] --argument [argument value] ```<br/>Example:<br/>``` npx hardhat claim --network rinkeby --contract-address 0x5676B4052C04Aff5479d042C85a4cC38945Aba7C ```

## The list of available tasks
| Task name | Description                                                                               | Options                                                                                        |
|-----------|-------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| claim     | Transfers the reward tokens if any to the `msg.sender` address                            | --contract-address => An address of a contract                                                 |
| stake     | Transfers the `amount` of tokens from `msg.sender` address to the StakingContract address | --contract-address => An address of a contract <br/> --amount => The amount of tokens to stake |
| unstake   | Transfers staked tokens if any to the `msg.sender` address                                | --contract-address => An address of a contract                                                 |

## How to run tests and evaluate the coverage
From the root folder run ``` npx hardhat coverage ```
## Current test and coverage results for *i7-8550U 1.80GHz/16Gb RAM/WIN10 x64*
```
StakingContract
??? Should change total stake after staking (97ms)
??? Should not allow to unstake before the timeout has expired (107ms)
??? Should allow to unstake after the timeout has expired (96ms)
??? Should not allow to unstake if nothing at stake
??? Should not allow to claim if there is no reward
??? Should not allow for non-owner to change the reward percentage
??? Should not allow for non-owner to change the reward period
??? Should not allow for non-owner to change the stake withdrawal timeout (38ms)
??? Should allow for the owner to change the reward percentage
??? Should allow for the owner to change the reward period
??? Should allow for the owner to change the stake withdrawal timeout
??? Should not allow to set the reward percentage to zero
??? Should not allow to set the reward percentage greater than 100
??? Should not allow to set the reward period to zero
??? Should calculate the reward properly (78ms)
??? Should calculate the reward properly (78ms)
??? Should return the valid owner
??? Should return the valid stake volume (63ms)
??? Should not allow to transfer ownership to the zero address
??? Should allow to transfer ownership to the valid address
```
| File                   | % Stmts    | % Branch   | % Funcs    | % Lines    | Uncovered Lines  |
|------------------------|------------|------------|------------|------------|------------------|
| contracts\             | 100        | 100        | 100        | 100        |                  |
| ERC20Mock.sol          | 100        | 100        | 100        | 100        |                  |
| StakingContract.sol    | 100        | 100        | 100        | 100        |                  |
| ---------------------- | ---------- | ---------- | ---------- | ---------- | ---------------- |
| All files              | 100        | 100        | 100        | 100        |                  |

## Project dependencies
* @nomiclabs/ethereumjs-vm#4.2.2
* @nomiclabs/hardhat-ethers#2.0.5
* @nomiclabs/hardhat-etherscan#3.0.3
* @nomiclabs/hardhat-waffle#2.0.3
* @nomiclabs/hardhat-web3#2.0.0
* @openzeppelin/contracts#4.5.0
* @typechain/ethers-v5#9.0.0
* @typechain/hardhat#5.0.0
* @types/chai#4.3.0
* @types/mocha#9.1.0
* @types/node#17.0.22
* @typescript-eslint/eslint-plugin#5.16.0
* @typescript-eslint/parser#5.16.0
* chai#4.3.6
* dotenv#16.0.0
* eslint#8.11.0
* ethereum-waffle#4.0.0-alpha.0
* hardhat#2.9.1
* solhint#3.3.7
* solidity-coverage#0.7.20
* ts-node#10.7.0
* typechain#7.0.1
* typescript#4.6.2