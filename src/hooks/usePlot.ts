import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import type { Address } from 'viem'
import { plotABI, cognitiveModuleABI } from '../contracts/abis'
import { contracts } from '../contracts/addresses'

/**
 * Hook to get the owner of a Plot NFT
 */
export function usePlotOwner(tokenId: bigint | undefined) {
  return useReadContract({
    address: contracts.plot.address,
    abi: plotABI,
    functionName: 'ownerOf',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook to get the total supply of Plot NFTs
 */
export function usePlotTotalSupply() {
  return useReadContract({
    address: contracts.plot.address,
    abi: plotABI,
    functionName: 'totalSupply',
  })
}

/**
 * Hook to get the balance of Plot NFTs for an address
 */
export function usePlotBalance(address: Address | undefined) {
  return useReadContract({
    address: contracts.plot.address,
    abi: plotABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })
}

/**
 * Hook to mint a new Plot NFT
 */
export function useMintPlot() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 1_000, // Poll every 1 second (faster for testnet)
    confirmations: 1, // Only wait for 1 confirmation instead of default
  })

  const mint = (to: Address) => {
    writeContract({
      address: contracts.plot.address,
      abi: plotABI,
      functionName: 'mint',
      args: [to],
    })
  }

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  }
}

/**
 * Hook to get child contracts for a Plot
 */
export function useChildContracts(tokenId: bigint | undefined) {
  return useReadContract({
    address: contracts.plot.address,
    abi: plotABI,
    functionName: 'getChildContracts',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  })
}

/**
 * Hook to get child tokens for a Plot
 */
export function useChildTokens(
  tokenId: bigint | undefined,
  childContract: Address | undefined
) {
  return useReadContract({
    address: contracts.plot.address,
    abi: plotABI,
    functionName: 'getChildTokens',
    args: tokenId && childContract ? [tokenId, childContract] : undefined,
    query: {
      enabled: !!tokenId && !!childContract,
    },
  })
}

/**
 * Hook to attach a child NFT (module) to a Plot (agent)
 * This transfers the module NFT to the Plot contract using receiveChild
 * 
 * Process:
 * 1. First call approvePlot() to approve Plot contract to spend the module NFT
 * 2. Then call attachModule() which calls receiveChild on the Plot contract
 */
export function useAttachModule(userAddress?: Address) {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    pollingInterval: 2_000,
    confirmations: 1,
  })

  // Separate state for approve transaction
  const { 
    writeContract: writeApprove,
    data: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useWriteContract()
  
  const { 
    isSuccess: isApproveSuccess,
    isLoading: isApproveConfirming,
  } = useWaitForTransactionReceipt({
    hash: approveHash,
    pollingInterval: 2_000,
    confirmations: 1,
  })

  // Step 1: Approve Plot contract to spend the module NFT
  const approvePlot = (
    moduleContract: Address,
    plotContract: Address,
    moduleTokenId: bigint
  ) => {
    if (!userAddress) {
      console.error('User address not provided')
      return
    }

    console.log('Approving module:', {
      moduleContract,
      plotContract,
      moduleTokenId: moduleTokenId.toString(),
      userAddress,
    })

    writeApprove({
      address: moduleContract,
      abi: cognitiveModuleABI,
      functionName: 'approve',
      args: [
        plotContract,
        moduleTokenId,
      ],
    })
    console.log('Approval transaction sent')
  }

  // Step 2: Call receiveChild on the Plot contract
  const attachModule = (
    plotContract: Address,
    plotTokenId: bigint,
    moduleContract: Address,
    moduleTokenId: bigint
  ) => {
    if (!userAddress) {
      console.error('User address not provided')
      return
    }

    console.log('Attaching module via receiveChild:', {
      plotContract,
      plotTokenId: plotTokenId.toString(),
      moduleContract,
      moduleTokenId: moduleTokenId.toString(),
      userAddress,
    })

    try {
      writeContract({
        address: plotContract,
        abi: plotABI,
        functionName: 'receiveChild',
        args: [
          plotTokenId,
          moduleContract,
          moduleTokenId,
        ],
      })
      console.log('Transaction sent successfully')
    } catch (err) {
      console.error('Error attaching module:', err)
      throw err
    }
  }

  return {
    approvePlot,
    attachModule,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    // Approval specific state
    isApproveSuccess,
    isApprovePending,
    isApproveConfirming,
    approveError,
  }
}
