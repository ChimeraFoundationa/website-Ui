import { useReadContract } from 'wagmi'
import type { AgentContext } from '../types'
import { middlewareABI } from '../contracts/abis'
import { contracts } from '../contracts/addresses'

/**
 * Hook to get the context for a Plot from Middleware
 */
export function useMiddlewareContext(tokenId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.middleware.address,
    abi: middlewareABI,
    functionName: 'getContext',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })

  return {
    data: data as unknown as AgentContext | undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get modules by type
 */
export function useModulesByType(
  tokenId: bigint | undefined,
  moduleType: string
) {
  const { data, isLoading, error } = useReadContract({
    address: contracts.middleware.address,
    abi: middlewareABI,
    functionName: 'getModulesByType',
    args: tokenId && moduleType ? [tokenId, moduleType as `0x${string}`] : undefined,
    query: {
      enabled: !!tokenId && !!moduleType,
    },
  })

  return {
    data,
    isLoading,
    error,
  }
}

/**
 * Hook to get module count
 */
export function useModuleCount(tokenId: bigint | undefined) {
  return useReadContract({
    address: contracts.middleware.address,
    abi: middlewareABI,
    functionName: 'getModuleCount',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook to check if Plot has required modules
 */
export function useHasRequiredModules(
  tokenId: bigint | undefined,
  requiredTypes: string[]
) {
  return useReadContract({
    address: contracts.middleware.address,
    abi: middlewareABI,
    functionName: 'hasRequiredModules',
    args: tokenId && requiredTypes.length > 0 
      ? [tokenId, requiredTypes.map(t => t as `0x${string}`)] 
      : undefined,
    query: {
      enabled: !!tokenId && requiredTypes.length > 0,
    },
  })
}
