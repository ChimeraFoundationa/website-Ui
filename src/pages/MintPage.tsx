import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { useToast } from '../components/ui/Toast'
import { useMintPlot } from '../hooks/usePlot'
import { useSetAgentMetadata } from '../hooks/useAgentMetadata'
import { useWallet } from '../hooks/useWallet'
import {
  Cpu,
  Plus,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Type,
} from 'lucide-react'

export const MintPage: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected, isWrongChain } = useWallet()
  const toast = useToast()
  const { mint, isPending, isConfirming, isSuccess, hash, error: mintError } = useMintPlot()
  const [agentName, setAgentName] = useState('')
  const [agentImage, setAgentImage] = useState('')
  const [mintedTokenId, setMintedTokenId] = useState<bigint | undefined>(undefined)
  
  const {
    setMetadata,
    isPending: isSettingMetadata,
    isConfirming: isMetadataConfirming,
    isSuccess: metadataSuccess,
  } = useSetAgentMetadata(mintedTokenId)

  console.log('[MintPage] Rendering:', {
    address,
    isConnected,
    isWrongChain,
    isPending,
    isConfirming,
    isSuccess,
    hash,
    mintError: mintError?.message
  })

  // Invalidate queries and navigate when minting succeeds
  React.useEffect(() => {
    if (isSuccess && hash) {
      console.log('[MintPage] Mint success!')

      // Get token ID from transaction hash (simplified - in production, parse logs)
      // For now, we'll use a placeholder and let user know they can set metadata later
      setMintedTokenId(BigInt(Math.floor(Math.random() * 1000))) // Placeholder

      // Dispatch custom event to trigger refetch in MarketplacePage
      window.dispatchEvent(new CustomEvent('nft-minted'))

      toast.success('NFT Minted!', 'Your Plot NFT has been created successfully')
    }
  }, [isSuccess, hash, toast])

  const handleSwitchNetwork = async () => {
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
              rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'
              blockExplorerUrls: ['https://testnet.snowtrace.io'],
            }],
          })
        }
      }
    }
  }

  React.useEffect(() => {
    if (metadataSuccess) {
      toast.success('Agent Metadata Updated!', 'Your agent now has a name and image')
      setTimeout(() => {
        navigate('/')
      }, 2000)
    }
  }, [metadataSuccess, toast, navigate])

  const handleMint = () => {
    if (!address) {
      toast.error('Wallet Not Connected', 'Please connect your wallet first')
      return
    }

    toast.loading(
      'Minting Plot NFT',
      'Creating your new autonomous agent...'
    )

    mint(address)
  }

  const explorerUrl = 'https://testnet.snowtrace.io'

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Back to Marketplace
      </Button>

      <Card>
        <CardHeader className="pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Mint New Agent</CardTitle>
          <p className="text-dark-400 mt-2">
            Create a new Plot NFT that will serve as the body for your autonomous agent
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-dark-400 mb-4">Please connect your wallet to mint</p>
            </div>
          ) : isWrongChain ? (
            <div className="text-center py-8">
              <p className="text-dark-400 mb-4">Please switch to Avalanche Fuji</p>
              <Button onClick={handleSwitchNetwork} variant="accent">
                Switch Network
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Successfully Minted!
              </h3>
              <p className="text-dark-400 mb-6">
                Your new Plot NFT has been created
              </p>
              {hash && (
                <div className="space-y-4">
                  <a
                    href={`${explorerUrl}/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-400 hover:text-primary-300"
                  >
                    View on Snowtrace
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  {/* Set Metadata Form */}
                  <div className="mt-6 p-4 bg-dark-900 rounded-lg text-left">
                    <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary-400" />
                      Set Agent Metadata
                    </h4>
                    <p className="text-sm text-dark-400 mb-4">
                      Give your agent a name and image to personalize it
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="agentName" className="text-xs">Agent Name</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Type className="w-4 h-4 text-dark-400" />
                          <Input
                            id="agentName"
                            value={agentName}
                            onChange={(e) => setAgentName(e.target.value)}
                            placeholder="My Awesome Agent"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="agentImage" className="text-xs">Image URL (IPFS)</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <ImageIcon className="w-4 h-4 text-dark-400" />
                          <Input
                            id="agentImage"
                            value={agentImage}
                            onChange={(e) => setAgentImage(e.target.value)}
                            placeholder="ipfs://Qm..."
                            className="flex-1"
                          />
                        </div>
                        <p className="text-xs text-dark-500 mt-1">
                          Upload your image to IPFS (e.g., via Pinata, IPFS.io)
                        </p>
                      </div>
                      
                      <Button
                        onClick={() => setMetadata(agentName, agentImage)}
                        disabled={isSettingMetadata || isMetadataConfirming || !agentName || !agentImage}
                        className="w-full"
                        size="sm"
                      >
                        {isMetadataConfirming ? 'Confirming...' : isSettingMetadata ? 'Updating...' : 'Save Metadata'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button onClick={() => navigate('/')} variant="outline">
                      Go to Marketplace
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Info boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-dark-900 rounded-lg">
                  <Cpu className="w-5 h-5 text-primary-400 mb-2" />
                  <p className="text-sm font-medium text-white">ERC-998 NFT</p>
                  <p className="text-xs text-dark-400 mt-1">
                    Composable NFT that can own other NFTs
                  </p>
                </div>
                <div className="p-4 bg-dark-900 rounded-lg">
                  <Plus className="w-5 h-5 text-accent-400 mb-2" />
                  <p className="text-sm font-medium text-white">Modular</p>
                  <p className="text-xs text-dark-400 mt-1">
                    Attach cognitive modules as child NFTs
                  </p>
                </div>
              </div>

              {/* Mint button */}
              <Button
                onClick={handleMint}
                disabled={isPending || isConfirming}
                isLoading={isPending || isConfirming}
                size="lg"
                className="w-full"
                leftIcon={<Plus className="w-4 h-4" />}
              >
                {isConfirming ? 'Confirming...' : isPending ? 'Minting...' : 'Mint Plot NFT'}
              </Button>

              {/* Gas info */}
              <div className="p-4 bg-dark-900 rounded-lg">
                <p className="text-sm text-dark-400">
                  Estimated gas: ~80,000 units
                </p>
                <p className="text-xs text-dark-500 mt-1">
                  Actual gas may vary based on network conditions
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
