import { useReadContract } from 'wagmi'
import type { Address } from 'viem'
import { cognitiveModuleABI } from '../contracts/abis'

export interface OwnedModuleNFT {
  contractAddress: Address
  tokenId: bigint
}

/**
 * Hook to get all module NFTs owned by an address from a specific contract
 * Checks token IDs 0-99 (reasonable range for most users)
 */
export function useOwnedModuleNFTs(
  moduleContract: Address | undefined,
  owner: Address | undefined
) {
  // Get balance first
  const { data: balance } = useReadContract({
    address: moduleContract,
    abi: cognitiveModuleABI,
    functionName: 'balanceOf',
    args: owner ? [owner] : undefined,
    query: {
      enabled: !!moduleContract && !!owner,
    },
  })

  // Get token IDs based on balance
  const ownedNFTs: OwnedModuleNFT[] = []
  
  if (balance && owner && moduleContract) {
    for (let i = 0; i < Number(balance); i++) {
      ownedNFTs.push({
        contractAddress: moduleContract,
        tokenId: BigInt(i),
      })
    }
  }

  return {
    data: ownedNFTs,
    balance: balance || 0n,
    isLoading: false,
  }
}

/**
 * Hook to check if a specific token is owned by an address
 */
export function useIsModuleOwner(
  moduleContract: Address | undefined,
  tokenId: bigint | undefined,
  expectedOwner: Address | undefined
) {
  const { data: actualOwner, isLoading } = useReadContract({
    address: moduleContract,
    abi: cognitiveModuleABI,
    functionName: 'ownerOf',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!moduleContract && tokenId !== undefined,
    },
  })

  return {
    isOwner: actualOwner?.toLowerCase() === expectedOwner?.toLowerCase(),
    actualOwner,
    isLoading,
  }
}
