import { http, createConfig } from 'wagmi'
import { avalancheFuji } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import type { EIP1193Provider } from 'viem'

declare global {
  interface Window {
    avalanche?: EIP1193Provider
    ethereum?: EIP1193Provider
  }
}

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
})
