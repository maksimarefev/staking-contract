import 'solidity-coverage';
import "./tasks/claim.ts";
import "./tasks/stake.ts";
import "./tasks/unstake.ts";
import "@nomiclabs/hardhat-etherscan";
import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import { HardhatUserConfig } from "hardhat/config";
import 'dotenv/config';

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

const config: HardhatUserConfig = {
    solidity: "0.8.0",
    networks: {
        rinkeby: {
          url: "https://rinkeby.infura.io/v3/" + INFURA_API_KEY,
          accounts: [`0x${PRIVATE_KEY}`]
        },
        kovan: {
            url: "https://kovan.infura.io/v3/" + INFURA_API_KEY,
            accounts: [`0x${PRIVATE_KEY}`]
        }
    },
    etherscan: {
        apiKey: {
          rinkeby: ETHERSCAN_API_KEY,
          kovan: ETHERSCAN_API_KEY
        }
    }
};

export default config;