// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const {ethers} = require("hardhat");
require("dotenv").config({path:".env"});
 const {WHITELIST_CONTRACT_ADDRESS, abi} = require("../constants");
async function main() {
  const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
  // console.log(">>>>>>>>>>>>>>>", whitelistContract);
  const ABI = abi;
// console.log("######",ABI);
  const CryptoDevsContract = await ethers.getContractFactory("CryptoDevs");
  // console.log("&&&&&&&&&&&&",CryptoDevsContract);
  const deployCryptoDevsContract = await CryptoDevsContract.deploy( "ABI",   whitelistContract );
  // await deployCryptoDevsContract.deployed();

  console.log("Crypto Devs Contract Address",deployCryptoDevsContract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
.then(() => process.exit(0))
.catch((error) => { console.error(error);
process.exit(1); });
