import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { adapterABI } from '../contracts/abis'
import { contracts } from '../contracts/addresses'
import { useToast } from '../components/ui/Toast'

/**
 * Hook to get context from AVBLOX8004Adapter
 */
export function useAdapterContext(tokenId: bigint | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.adapter.address,
    abi: adapterABI,
    functionName: 'getContext',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })

  return {
    data: data as {
      memoryCtx: string
      toolCtx: string
      policyCtx: string
      executionCtx: string
    } | undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get module count by type
 */
export function useModuleCountByType(
  tokenId: bigint | undefined,
  moduleType: string
) {
  return useReadContract({
    address: contracts.adapter.address,
    abi: adapterABI,
    functionName: 'getModuleCountByType',
    args: tokenId && moduleType ? [tokenId, moduleType as `0x${string}`] : undefined,
    query: {
      enabled: !!tokenId && !!moduleType,
    },
  })
}

/**
 * Hook to get agent module types
 */
export function useAgentModuleTypes(tokenId: bigint | undefined) {
  return useReadContract({
    address: contracts.adapter.address,
    abi: adapterABI,
    functionName: 'getAgentModuleTypes',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook to check if agent has required modules
 */
export function useHasRequiredModules(
  tokenId: bigint | undefined,
  requiredTypes: string[]
) {
  return useReadContract({
    address: contracts.adapter.address,
    abi: adapterABI,
    functionName: 'hasRequiredModules',
    args: tokenId && requiredTypes.length > 0
      ? [tokenId, requiredTypes.map(t => t as `0x${string}`)]
      : undefined,
    query: {
      enabled: !!tokenId && requiredTypes.length > 0,
    },
  })
}

/**
 * Hook to execute an agent
 */
export function useExecuteAgent() {
  const toast = useToast()
  
  const {
    writeContract,
    data: hash,
    isPending,
    error,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  })

  const execute = async (tokenId: bigint, input: string) => {
    try {
      // Validate JSON input
      JSON.parse(input)
      
      toast.loading(
        'Executing Agent',
        'Submitting transaction to blockchain...'
      )

      // Use function selector approach for execute with bytes parameter
      writeContract({
        address: contracts.adapter.address,
        abi: adapterABI,
        functionName: 'execute',
        args: [tokenId, input as `0x${string}`],
      } as const)

      return true
    } catch (err) {
      toast.error('Invalid JSON', 'Please enter a valid JSON payload')
      return false
    }
  }

  return {
    execute,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    receipt,
  }
}
