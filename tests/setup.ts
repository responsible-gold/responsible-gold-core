import { ethers } from "hardhat";
import { GenericToken__factory, MockERC20HookLogic } from "../typechain-types";
import { GenericTokenConfigStruct } from "../typechain-types/contracts/ERC20/GenericToken";
import { DeploymentUtils } from "../scripts/DeploymentUtils";
import { HARDHAT_CHAIN_ID } from "./constants";
import { GenericFactory } from "../typechain-types/contracts/libraries/factory/GenericFactory";
export async function deployGenericToken(
  contractName: string,
  tokenConfig?: GenericTokenConfigStruct
) {
  const GenericToken = (await ethers.getContractFactory(
    contractName
  )) as GenericToken__factory;
  let genericToken = await GenericToken.deploy();
  genericToken = await genericToken.waitForDeployment();
  //initialize contract
  if (tokenConfig !== undefined) {
    const tx = await genericToken.initialize(tokenConfig);
    await tx.wait();
  }
  return genericToken;
}

export async function deployExternalFactories(deployerAddress: string) {
  const deployer = new DeploymentUtils(
    true,
    ethers,
    undefined,
    true,
    undefined,
    deployerAddress
  );
  // deploy rgFactory
  await deployer.deployRGFactory(deployerAddress);
  // deploy ERC20Factory
  await deployer.deployERC20Factory(deployerAddress);
}

export async function deployInternalFactories(deployerAddress: string) {
  const deployer = new DeploymentUtils(
    true,
    ethers,
    undefined,
    true,
    undefined,
    deployerAddress
  );
  // deploy rgFactory
  await deployer.deployRGFactory(deployerAddress);
  // deploy ERC20Factory
  await deployer.deployERC20Factory(deployerAddress);
  // deploy ERC721Factory
  await deployer.deployERC721Factory(deployerAddress);
  return deployer;
}

export async function deployMockERC20HookLogic(
  token: string
): Promise<MockERC20HookLogic> {
  const erc20HookLogicBase = await ethers.getContractFactory(
    "MockERC20HookLogic"
  );
  return await erc20HookLogicBase.deploy(token);
}
