import hre from "hardhat";
import {
  getGasPrices,
  sendTransaction,
  simulateServerSigning,
} from "./DeploymentUtils";
import {
  ContractTransactionResponse,
  SignatureLike,
  TransactionResponse,
} from "ethers";

type Ethers = typeof hre.ethers;
interface KeyInfo {
  description: string;
  alias: string;
  roles_allowed_to_use: string[];
}

interface Key {
  id: string;
  key_info: KeyInfo;
  address: string;
}
interface GetKeysResponse {
  keys: Key[];
}
export type SignedTxResponse = {
  signedTx: string;
  nonce: number;
  from: string;
  to: string | null;
};

export type SignTxRequest = {
  message: {
    key_id: string;
    message_hash: string;
    chain_id: number;
  };
};
type TxRequest = {
  to: string | null;
  from: string;
  gas: bigint;
  maxFeePerGas: string;
  maxPriorityFeePerGas: string;
  value: string;
  data: string;
  nonce: number;
  chainId: bigint;
  type: string;
};
interface CreateKeyResponse {
  key: Key;
}
export class SignerUtil {
  apiURL: string;
  apiKey: string;
  ethers: Ethers;
  test: Boolean = false;

  constructor(apiURL: string, apiKey: string, test: boolean, ethers: Ethers) {
    this.apiURL = apiURL;
    this.apiKey = apiKey;
    this.ethers = ethers;
    this.test = test;
  }

  // function to get a list of keys from the signer
  async getKeys(): Promise<GetKeysResponse> {
    const getResponse = await fetch(`${this.apiURL}api/v1/key`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!getResponse.ok) {
      throw new Error(`Failed to fetch keys: ${getResponse.statusText}`);
    }

    return getResponse.json();
  }
  // create key args interface

  // function to create a key in the signer
  async createKey(keyInfo: KeyInfo): Promise<CreateKeyResponse> {
    const createResponse = await fetch(`${this.apiURL}api/v1/key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        key_info: keyInfo,
      }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create key: ${createResponse.statusText}`);
    }

    return createResponse.json();
  }

  // function to get the key id
  async getKeyIDFromAddress(address: string): Promise<string> {
    const keysResponse = await this.getKeys();
    const key = keysResponse.keys.find(
      (key) => key.address.toLowerCase() === address.toLowerCase()
    );
    if (!key) {
      throw new Error(`Key with address ${address} not found`);
    }
    return key.id;
  }

  // function to get the key address from the alias of the key
  async getKeyAddressFromAlias(alias: string): Promise<string> {
    const keysResponse = await this.getKeys();
    const key = keysResponse.keys.find((key) => key.key_info.alias === alias);
    if (!key) {
      throw new Error(`Key with alias ${alias} not found`);
    }
    return key.address;
  }

  // async getUnsignedTxHash(nonce: bigint, gas: number, to: string, value: bigint, data: string, gasLimit: number type: number, )

  async callSigningServer(
    to: string | null,
    from: string,
    nonce: number,
    value: bigint,
    gas: bigint,
    maxFeePerGas: bigint,
    maxPriorityFeePerGas: bigint,
    data: string
  ): Promise<SignedTxResponse> {
    const chainID: bigint = (await this.ethers.provider.getNetwork()).chainId;
    const tx = new this.ethers.Transaction();
    tx.chainId = chainID;
    tx.nonce = nonce;
    tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
    tx.maxFeePerGas = maxFeePerGas;
    tx.gasLimit = gas;
    tx.to = to;
    tx.value = value;
    tx.data = data;
    tx.accessList = [];
    tx.type = 2;
    const messageHash = tx.unsignedHash;
    if (!messageHash) {
      throw new Error("Failed to hash transaction");
    }
    const keyID = await this.getKeyIDFromAddress(from);
    const requestBody: SignTxRequest = {
      message: {
        key_id: keyID,
        message_hash: messageHash,
        chain_id: Number(chainID),
      },
    };

    try {
      // create a post request to the signing server with auth token
      const signResponse = await fetch(`${this.apiURL}api/v1/sign`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (signResponse.status === 200) {
        const response = await signResponse.json();
        const signature: SignatureLike = {
          v: response.signature.v,
          r: response.signature.r,
          s: response.signature.s,
        };
        tx.signature = signature;
        const signedTx = tx.serialized;
        return {
          signedTx: signedTx,
          nonce: nonce,
          from: from,
          to: to,
        };
      } else {
        throw new Error(
          `Failed to sign transaction: ${signResponse.statusText}`
        );
      }
    } catch (error) {
      console.error("error calling signing server", error);
      throw error;
    }
  }

  async sendValue(
    to: string,
    from: string,
    value: bigint
  ): Promise<TransactionResponse> {
    // calculate gas
    const gas = await this.ethers.provider.estimateGas({
      to: to,
      value: value,
      from: from,
      data: "0x",
    });
    const gasPrices = await getGasPrices(this.ethers);
    const signedTxRes = await this.signTransaction(
      to,
      from,
      value,
      gas,
      gasPrices.maxPriorityFeePerGas,
      gasPrices.maxFeePerGas,
      "0x"
    );
    const txRes = (await sendTransaction(
      signedTxRes.signedTx,
      this.ethers
    )) as TransactionResponse;
    return txRes;
  }

  async signTransaction(
    to: string | null,
    from: string,
    value: bigint,
    gas: bigint,
    maxPriorityFeePerGas: bigint,
    maxFeePerGas: bigint,
    data: string
  ): Promise<SignedTxResponse> {
    let signedTxResponse: SignedTxResponse;
    const chainID = (await this.ethers.provider.getNetwork()).chainId;
    const nonce = await this.ethers.provider.getTransactionCount(from);
    // const simulate = chainID === BigInt(1337);
    if (this.test) {
      signedTxResponse = await simulateServerSigning(
        to,
        from,
        value,
        gas,
        maxFeePerGas,
        data,
        chainID,
        this.ethers
      );
    } else {
      signedTxResponse = await this.callSigningServer(
        to,
        from,
        nonce,
        value,
        gas,
        maxFeePerGas,
        maxPriorityFeePerGas,
        data
      );
    }
    return signedTxResponse;
  }

  /**
   *
   * @param to address of smart contract to send transaction to
   * @param from address of sender
   * @param value value to send the transaction with
   * @param data transaction data
   * @param gas gas to send the transaction with
   * @returns a transaction response that can be used to get the receipt
   */
  async sendRawTxWithData(
    to: string,
    from: string,
    value: bigint,
    data: string,
    gas: bigint
  ): Promise<ContractTransactionResponse> {
    const gasPrices = await getGasPrices(this.ethers);
    const signedTxRes = await this.signTransaction(
      to,
      from,
      value,
      gas,
      gasPrices.maxPriorityFeePerGas,
      gasPrices.maxFeePerGas,
      data
    );
    const txRes = (await sendTransaction(
      signedTxRes.signedTx,
      this.ethers
    )) as ContractTransactionResponse;
    return txRes;
  }

  async serializeTx() {}

  async callContract(
    contractName: string,
    contractAddress: string,
    functionName: string,
    args: any[],
    txSenderAddress: string
  ): Promise<ContractTransactionResponse> {
    const contractBase = await this.ethers.getContractFactory(contractName);
    const callData = contractBase.interface.encodeFunctionData(
      functionName,
      args
    );
    const gas = await this.ethers.provider.estimateGas({
      data: callData,
      to: contractAddress,
      from: txSenderAddress,
    });
    // const gas = 10000000;
    return this.sendRawTxWithData(
      contractAddress,
      txSenderAddress,
      BigInt(0),
      callData,
      gas
    );
  }
}
