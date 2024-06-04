import env from "hardhat";

/**
 *
 * @param environment - the environment to get the environment variable for, dev, prod, staging, or local
 * @param key - the key of the environment variable
 * @returns the value of the environment variable
 */
export function getEnvVar(environment: string, key: string): string {
  let envKey: string;
  if (environment === "dev") {
    envKey = "DEV_" + key;
  } else if (environment === "prod") {
    envKey = "PROD_" + key;
  } else if (environment === "staging") {
    envKey = "STAGING_" + key;
  } else {
    envKey = "LOCAL_" + key;
  }
  // get the value of the environment variable
  const envVar = process.env[envKey];
  if (!envVar) {
    throw new Error(`Environment variable ${envKey} is not set`);
  }
  return envVar;
}
