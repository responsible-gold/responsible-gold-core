import { task } from "hardhat/config";
import { getEnvVar } from "./Config";
import { SignerUtil } from "./SignerUtil";
import * as jwt from "jsonwebtoken";

interface KeyInfo {
  description: string;
  alias: string;
  chain_id: number;
  roles_allowed_to_use: string[];
}

interface Key {
  id: string;
  key_info: KeyInfo;
  address: string;
}

interface KeysResponse {
  keys: Key[];
}
interface CreateKeyResponse {
  key: Key;
}
task("create-key", "Create new keys on the signer")
  .addParam("description", "Description of the key")
  .addParam("alias", "Alias of the key")
  .addParam(
    "environment",
    "Environment to deploy the key from, ie: dev, prod, staging, or local"
  )
  .addVariadicPositionalParam(
    "rolesAllowed",
    "list of roles allowed to use key, ie: 'MAIN_DEPLOYER', 'RESPONSIBLE_GOLD_ASSET_NFT_MINTER', 'RESPONSIBLE_GOLD_ASSET_NFT_BURNER', 'RESPONSIBLE_GOLD_ADMIN', 'G_COIN_FEE_COLLECTOR', 'RESPONSIBLE_GOLD_METADATA_OPERATOR', 'TRADE_BOT', 'KEY_CREATOR', 'KEY_VIEWER', 'KEY_IMPORTER'"
  )
  .setAction(async (args, hre) => {
    // Get the signer API endpoint from .env
    const signerAPI = getEnvVar(args.environment, "SIGNER_API_ENDPOINT");
    // Get the signer create API key from .env
    const signerCreatorAPIKey = getEnvVar(
      args.environment,
      "SIGNER_API_KEY_CREATOR"
    );

    // Create a new instance of SignerUtil
    const signerUtil = new SignerUtil(
      signerAPI,
      signerCreatorAPIKey,
      false,
      hre.ethers
    );

    // Check if there is already a key with the same alias
    const keysResponse = await signerUtil.getKeys();
    const existingKey = keysResponse.keys.find(
      (key) => key.key_info.alias === args.alias
    );
    if (existingKey) {
      console.log(`Key with alias ${args.alias} already exists`);
      return;
    }
    if (args.rolesAllowed.length === 0) {
      console.log("Roles allowed to use the key cannot be empty");
      return;
    }
    // Create the key if it does not exist
    const keyInfo: KeyInfo = {
      description: args.description,
      alias: args.alias,
      chain_id: args.chain_id,
      roles_allowed_to_use: args.rolesAllowed,
    };
    const keyResponse = await signerUtil.createKey(keyInfo);

    // Log the key details
    console.log(
      `Key created with id: ${keyResponse.key.id}, address: ${keyResponse.key.address}, alias: ${keyResponse.key.key_info.alias}`
    );
    console.log(`Description: ${keyResponse.key.key_info.description}`);
    console.log(
      `Roles allowed to use: ${keyResponse.key.key_info.roles_allowed_to_use}`
    );
  });

task("list-keys", "List all keys on the signer")
  .addParam("environment", "Environment to deploy the key from")
  .setAction(async (args, hre) => {
    // Get the signer API endpoint from .env
    const signerAPI = getEnvVar(args.environment, "SIGNER_API_ENDPOINT");

    // Get the signer create API key from .env
    const signerCreatorAPIKey = getEnvVar(
      args.environment,
      "SIGNER_API_KEY_VIEWER"
    );

    // create a new instance of SignerUtil
    const signerUtil = new SignerUtil(
      signerAPI,
      signerCreatorAPIKey,
      false,
      hre.ethers
    );

    const keysResponse = await signerUtil.getKeys();

    // Log the key details
    keysResponse.keys.forEach((key) => {
      console.log(
        `Key id: ${key.id}, alias: ${key.key_info.alias}, address: ${key.address}`
      );
      console.log(`Description: ${key.key_info.description}`);
      console.log(`Roles allowed to use: ${key.key_info.roles_allowed_to_use}`);
    });
  });

task("create-dev-jwt", "Create a JWT for the dev environment")
  .addVariadicPositionalParam("roles", "Roles to assign to the JWT")
  .setAction(async (args, hre) => {
    const jwtPrivateKey = process.env.DEV_SIGNER_JWT_PRIVATEKEY;
    if (!jwtPrivateKey) {
      throw new Error("DEV_SIGNER_JWT_PRIVATEKEY not set in .env");
    }
    const iat = Date.now();
    // JWT expires in one year
    const exp = iat + 365 * 24 * 60 * 60 * 1000;
    const payload = {
      roles: args.roles,
      name: "test",
      exp: exp,
      iat: iat,
      admin: false,
    };

    const signOptions: jwt.SignOptions = {
      algorithm: "RS256",
    };

    const jwtToken = jwt.sign(payload, jwtPrivateKey, signOptions);
    console.log(jwtToken);
  });
