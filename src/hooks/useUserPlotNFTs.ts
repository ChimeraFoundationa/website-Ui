import { useReadContract } from 'wagmi'
import { plotABI } from '../contracts/abis'
import { contracts } from '../contracts/addresses'
import type { Address } from 'viem'

/**
 * Hook to get user's Plot NFT balance
 */
export function useUserPlotBalance(address: Address | undefined) {
  const { data: balance, isLoading, error } = useReadContract({
    address: contracts.plot.address,
    abi: plotABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchInterval: 5000, // Refetch every 5 seconds
    },
  })

  return {
    balance: balance || 0n,
    data: balance, // Return raw data for checking undefined vs 0
    isLoading,
    error,
  }
}

/**
 * Hook to get owner of a specific token
 */
export function useTokenOwner(tokenId: bigint | undefined) {
  return useReadContract({
    address: contracts.plot.address,
    abi: plotABI,
    functionName: 'ownerOf',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
      staleTime: 3000,
    },
  })
}
