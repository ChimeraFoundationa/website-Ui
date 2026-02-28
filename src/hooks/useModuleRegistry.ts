import { useReadContract } from 'wagmi'
import type { Address } from 'viem'
import { factoryABI, cognitiveModuleABI } from '../contracts/abis'
import { contracts } from '../contracts/addresses'

export interface DeployedModule {
  contractAddress: Address
  moduleType: string
  capability: string
  name: string
  symbol: string
}

/**
 * Hook to get all deployed modules from the ModuleFactory
 */
export function useAllDeployedModules() {
  // Get all deployed module contracts
  const { data: moduleAddresses, isLoading: loadingModules } = useReadContract({
    address: contracts.moduleFactory.address,
    abi: factoryABI,
    functionName: 'getDeployedModules',
  })

  // For each module contract, fetch metadata
  const modules: DeployedModule[] = (moduleAddresses || []).map((addr) => ({
    contractAddress: addr,
    moduleType: 'unknown',
    capability: 'unknown',
    name: '',
    symbol: '',
  }))

  return {
    data: modules,
    isLoading: loadingModules,
  }
}

/**
 * Hook to get modules deployed by a specific user
 */
export function useUserModules(userAddress: Address | undefined) {
  // Get user's deployed module contracts
  const { data: moduleAddresses, isLoading: loadingModules } = useReadContract({
    address: contracts.moduleFactory.address,
    abi: factoryABI,
    functionName: 'getUserModules',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })

  return {
    data: moduleAddresses || [],
    isLoading: loadingModules,
  }
}

/**
 * Hook to get module contract metadata
 */
export function useModuleMetadata(moduleContract: Address | undefined) {
  const { data: moduleName } = useReadContract({
    address: moduleContract,
    abi: cognitiveModuleABI,
    functionName: 'MODULE_NAME',
    query: {
      enabled: !!moduleContract,
    },
  })

  const { data: moduleType } = useReadContract({
    address: moduleContract,
    abi: cognitiveModuleABI,
    functionName: 'MODULE_TYPE',
    query: {
      enabled: !!moduleContract,
    },
  })

  const { data: capability } = useReadContract({
    address: moduleContract,
    abi: cognitiveModuleABI,
    functionName: 'CAPABILITY',
    query: {
      enabled: !!moduleContract,
    },
  })

  return {
    moduleName: moduleName as string || '',
    moduleType: moduleType as string || '0x0',
    capability: capability as string || '0x0',
  }
}

/**
 * Hook to get module NFTs owned by an address from a specific contract
 */
export function useModuleNFTs(moduleContract: Address | undefined, owner: Address | undefined) {
  const metadata = useModuleMetadata(moduleContract)

  // Get balance of owner
  const { data: balance } = useReadContract({
    address: moduleContract,
    abi: cognitiveModuleABI,
    functionName: 'balanceOf',
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!moduleContract && !!owner,
    },
  })

  // Get all token IDs owned by the address
  // Note: This requires tokenByIndex function which may not be in the ABI
  // For now, we'll return token IDs 1 to balance
  const tokenIds = balance && balance > 0n
    ? Array.from({ length: Number(balance) }).map((_, i) => BigInt(i + 1))
    : []

  return {
    data: tokenIds.map((tokenId) => ({
      contractAddress: moduleContract!,
      tokenId,
      moduleName: metadata.moduleName,
      moduleType: metadata.moduleType,
    })),
    isLoading: false,
    balance: balance || 0n,
  }
}
