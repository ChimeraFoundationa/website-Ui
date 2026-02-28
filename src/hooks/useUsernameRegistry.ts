import { useState } from 'react'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { agentUsernameRegistryABI } from '../contracts/abis'
import { contracts } from '../contracts/addresses'
import type { Address } from 'viem'

/**
 * Hook to get username for an address
 */
export function useUsername(address: Address | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.agentUsernameRegistry.address,
    abi: agentUsernameRegistryABI,
    functionName: 'getUsername',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      staleTime: 2000, // Consider data fresh for 2 seconds
    },
  })

  return {
    username: data as string | undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to check if username is verified
 */
export function useIsVerified(username: string | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.agentUsernameRegistry.address,
    abi: agentUsernameRegistryABI,
    functionName: 'isVerified',
    args: username ? [username] : undefined,
    query: {
      enabled: !!username,
    },
  })

  return {
    isVerified: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to get address for a username
 */
export function useAddressForUsername(username: string | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.agentUsernameRegistry.address,
    abi: agentUsernameRegistryABI,
    functionName: 'getAddress',
    args: username ? [username] : undefined,
    query: {
      enabled: !!username,
    },
  })

  return {
    address: data as Address | undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to check if username is registered
 */
export function useIsUsernameRegistered(username: string | undefined) {
  const { data, isLoading, error, refetch } = useReadContract({
    address: contracts.agentUsernameRegistry.address,
    abi: agentUsernameRegistryABI,
    functionName: 'isUsernameRegistered',
    args: username ? [username] : undefined,
    query: {
      enabled: !!username,
    },
  })

  return {
    isRegistered: data as boolean | undefined,
    isLoading,
    error,
    refetch,
  }
}

/**
 * Hook to register a username
 */
export function useRegisterUsername() {
  const [username, setUsername] = useState<string | null>(null)
  
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const register = (newUsername: string) => {
    setUsername(newUsername)
    writeContract({
      address: contracts.agentUsernameRegistry.address,
      abi: agentUsernameRegistryABI,
      functionName: 'registerUsername',
      args: [newUsername],
    })
  }

  return {
    register,
    isPending,
    isConfirming,
    isSuccess,
    error,
    username,
  }
}

/**
 * Hook to update username
 */
export function useUpdateUsername() {
  const [newUsername, setNewUsername] = useState<string | null>(null)
  
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  const update = (username: string) => {
    setNewUsername(username)
    writeContract({
      address: contracts.agentUsernameRegistry.address,
      abi: agentUsernameRegistryABI,
      functionName: 'updateUsername',
      args: [username],
    })
  }

  return {
    update,
    isPending,
    isConfirming,
    isSuccess,
    error,
    newUsername,
  }
}
