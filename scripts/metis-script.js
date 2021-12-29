const hre = require("hardhat");

async function main() {
  const CollectNFT = await hre.ethers.getContractFactory("CollectNFTV2");
  const collectNFT = await CollectNFT.deploy();

  await collectNFT.deployed();

  console.log("CollectNFTV2 deployed to:", collectNFT.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
