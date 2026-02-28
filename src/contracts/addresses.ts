import type { Address } from 'viem'

/**
 * AVBLOX Contract Addresses - Avalanche Fuji Testnet
 * Last Deployment: March 1, 2026
 * Deployer: 0xDc9D44889eD7A98a9a2B976146B2395df25f334d
 */
export const contracts = {
  // Core Contracts
  plot: {
    address: '0xBBc8451A0d0c12861842706b11da5e343B271a23' as Address,
  },
  middleware: {
    address: '0x0CAD1b0D85E251f7fCeEE41cDB9448e0418DcDaB' as Address,
  },
  executionRouter: {
    address: '0x607DBD9BB64De688947EA9Cb7eD840510b9aaE3F' as Address,
  },
  adapter: {
    address: '0x6eE13233BC88e355cb866ee2a7E18EA951574511' as Address,
  },

  // Additional Contracts
  moduleFactory: {
    address: '0xE748c544b5B9fA1E915460886c6517996A9b014a' as Address,
  },
  agentUsernameRegistry: {
    address: '0x5b44e8f54214ebCc09276acf33119482e12cC4E7' as Address,
  },
  agentMetadataRegistry: {
    address: '0x0CFee66E4ef1815ba0f131074a79E050f252E356' as Address,
  },
} as const

/**
 * Network Configuration - Avalanche Fuji Testnet
 */
export const chainConfig = {
  id: 43113,
  name: 'Avalanche Fuji',
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorerUrl: 'https://testnet.snowtrace.io',
} as const
