import { useAccount } from 'wagmi'
import { avalancheFuji } from 'wagmi/chains'
import { useState, useEffect } from 'react'
import { chainConfig } from '../contracts/addresses'

export function useWallet() {
  const account = useAccount()
  const chainId = account.chainId

  const isConnected = account.isConnected && chainId === avalancheFuji.id
  const isWrongChain = account.isConnected && chainId !== avalancheFuji.id

  return {
    address: account.address,
    chainId,
    isConnected,
    isWrongChain,
    isConnecting: false,
    switchToFuji: async () => {
      if (typeof window !== 'undefined' && window.avalanche) {
        try {
          await window.avalanche.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xA869' }],
          })
        } catch (error) {
          if ((error as { code?: number })?.code === 4902 && window.avalanche) {
            await window.avalanche.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xA869',
                chainName: 'Avalanche Fuji Testnet',
                nativeCurrency: {
                  name: 'AVAX',
                  symbol: 'AVAX',
                  decimals: 18,
                },
                rpcUrls: [chainConfig.rpcUrl],
                blockExplorerUrls: [chainConfig.explorerUrl],
              }],
            })
          }
        }
      }
    },
  }
}

export function useGasPrice() {
  const [gasPrice, setGasPrice] = useState<bigint | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    setGasPrice(25_000_000_000n)
    setIsLoading(false)
  }, [])

  return {
    gasPrice,
    isLoading,
  }
}
