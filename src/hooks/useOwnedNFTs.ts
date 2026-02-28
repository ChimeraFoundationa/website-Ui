import { useEffect, useState, useMemo } from 'react'
import { useReadContracts } from 'wagmi'
import { plotABI } from '../contracts/abis'
import { contracts } from '../contracts/addresses'

interface UseOwnedNFTsResult {
  ownedTokenIds: bigint[]
  isLoading: boolean
  error: string | null
  balance: bigint
  refetch: () => void
}

export function useOwnedNFTs(address: `0x${string}` | undefined): UseOwnedNFTsResult {
  const [ownedTokenIds, setOwnedTokenIds] = useState<bigint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fixed: Check first 100 token IDs (covers most cases)
  const MAX_TOKENS = 100

  // Create contracts array for batch reading
  const contractsArray = useMemo(() => 
    Array.from({ length: MAX_TOKENS }, (_, i) => ({
      address: contracts.plot.address,
      abi: plotABI,
      functionName: 'ownerOf',
      args: [BigInt(i)] as const,
    })),
    []
  )

  // Batch read all ownerOf calls
  const { data: ownersData, isLoading: ownersLoading, refetch } = useReadContracts({
    contracts: contractsArray,
    query: {
      enabled: !!address,
      staleTime: 5000,
    },
  })

  // Get balance separately
  const { data: balanceData } = useReadContracts({
    contracts: [{
      address: contracts.plot.address,
      abi: plotABI,
      functionName: 'balanceOf',
      args: address ? [address] : undefined,
    }],
    query: {
      enabled: !!address,
    },
  })

  const balance = balanceData?.[0]?.result || 0n

  // Process ownership results
  useEffect(() => {
    if (!address) {
      setOwnedTokenIds([])
      setIsLoading(false)
      return
    }

    if (ownersLoading) {
      setIsLoading(true)
      return
    }

    if (!ownersData || ownersData.length === 0) {
      setOwnedTokenIds([])
      setIsLoading(false)
      return
    }

    const owned: bigint[] = []
    const userAddressLower = address.toLowerCase()

    ownersData.forEach((result, index) => {
      if (result.status === 'success' && result.result) {
        const owner = (result.result as string).toLowerCase()
        if (owner === userAddressLower) {
          owned.push(BigInt(index))
        }
      }
    })

    setOwnedTokenIds(owned)
    setIsLoading(false)
  }, [address, ownersData, ownersLoading, balance, refreshKey])

  const handleRefetch = () => {
    setRefreshKey((prev) => prev + 1)
    refetch()
  }

  return {
    ownedTokenIds,
    isLoading,
    error,
    balance,
    refetch: handleRefetch,
  }
}
