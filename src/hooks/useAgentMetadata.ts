import { useState } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { agentMetadataRegistryABI } from '../contracts/abis'
import { contracts } from '../contracts/addresses'
import type { Address } from 'viem'

export interface AgentMetadata {
  name: string
  image: string
}

/**
 * Hook to get agent metadata (name and image)
 */
export function useAgentMetadata(tokenId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.agentMetadataRegistry.address,
    abi: agentMetadataRegistryABI,
    functionName: 'getAgentMetadata',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })

  return {
    metadata: data ? {
      name: data[0] as string,
      image: data[1] as string,
    } : undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to check if agent has metadata
 */
export function useHasAgentMetadata(tokenId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.agentMetadataRegistry.address,
    abi: agentMetadataRegistryABI,
    functionName: 'hasMetadata',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })

  return {
    hasMetadata: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to set agent metadata
 */
export function useSetAgentMetadata(tokenId: bigint | undefined) {
  const [metadata, setMetadataState] = useState<AgentMetadata | null>(null)
  
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const setMetadata = (name: string, image: string) => {
    if (!tokenId) return
    
    setMetadataState({ name, image })
    
    writeContract({
      address: contracts.agentMetadataRegistry.address,
      abi: agentMetadataRegistryABI,
      functionName: 'setAgentMetadata',
      args: [tokenId, name, image],
    })
  }

  return {
    setMetadata,
    isPending,
    isConfirming,
    isSuccess,
    error,
    metadata,
  }
}
