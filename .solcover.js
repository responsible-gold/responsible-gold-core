module.exports = {
  configureYulOptimizer: true,
  skipFiles: [
    "test",
    "mocks/**/*.sol",
    "node_modules",
    "interfaces/",
    "mocks/UUPSProxy/MockUUPSLogic.sol",
    "mocks/bridge/MockBridgePool.sol",
    "mocks/bridge/MockBridgePool.sol",
    "mocks/ERC20Token/MockGenericToken.sol",
    "mocks/ERC20Token/MockERC20HookLogic.sol",
    "mocks/ERC20Token/ERC20Mock.sol",
    "mocks/ERC721/MockAssetNFT.sol",
    "mocks/ERC721/MockERC721Receiver.sol",
    "mocks/UUPSProxy/MockUUPSLogic.sol",
    "mocks/UUPSProxy/MockUUPSLogicV2.sol",
    "mocks/common/targets/hook/MockERC20HookTarget.sol",
    "mocks/Pause/MockPausable.sol",
    "mocks/ERC20Hook/MockERC20HookLogic.sol",
    "contracts/mocks/nonce/MockNonceTracker.sol",
    "mocks/common/ERC20/MockGenericTokenMiddleware.sol",
    "mocks/common/targets/hook/MockERC20HookTarget.sol",
    "mocks/ERC20Token/MockGenericToken.sol",
    "mocks/nonce/MockNonceTracker.sol",
    "mocks/UUPSProxy/MockUUPSLogicV2.sol",
    "mocks/UUPSProxy/MockUUPSLogic.sol",
    "libraries/ERC20Hook/ERC20HookLogic.sol",
  ],
  mocha: {
    grep: "@skip-on-coverage", // Find everything with this tag
    invert: true, // Run the grep's inverse set.
  },
  //   solcOptimizerDetails: {
  //     peephole: false,
  //     inliner: false,
  //     jumpdestRemover: false,
  //     orderLiterals: true, // <-- TRUE! Stack too deep when false
  //     deduplicate: false,
  //     cse: false,
  //     constantOptimizer: false,
  //     yul: true,
  //   },
};
