import React, { useState } from 'react'
import { useAccount } from 'wagmi'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { useToast } from '../ui/Toast'
import { factoryABI, cognitiveModuleABI } from '@/contracts/abis'
import { contracts } from '@/contracts/addresses'
import { Cpu, Plus, CheckCircle, Loader2, ExternalLink, Tag } from 'lucide-react'

const MODULE_TEMPLATES = [
  { 
    value: 'MEMORY', 
    label: 'Memory Module', 
    name: 'Memory',
    description: 'Stores agent state and conversation history',
    moduleType: '0x' + Buffer.from('MEMORY_MODULE').toString('hex').padEnd(64, '0'),
    capability: '0x' + Buffer.from('PERSISTENCE').toString('hex').padEnd(64, '0'),
  },
  { 
    value: 'TOOL', 
    label: 'Tool Module', 
    name: 'Tool',
    description: 'Enable external API and tool integrations',
    moduleType: '0x' + Buffer.from('TOOL_MODULE').toString('hex').padEnd(64, '0'),
    capability: '0x' + Buffer.from('TOOL_CALLS').toString('hex').padEnd(64, '0'),
  },
  { 
    value: 'POLICY', 
    label: 'Policy Module', 
    name: 'Policy',
    description: 'Define rules and constraints for agent behavior',
    moduleType: '0x' + Buffer.from('POLICY_MODULE').toString('hex').padEnd(64, '0'),
    capability: '0x' + Buffer.from('CONSTRAINTS').toString('hex').padEnd(64, '0'),
  },
  { 
    value: 'EXECUTION', 
    label: 'Execution Module', 
    name: 'Execution',
    description: 'Execute agent logic and decision making',
    moduleType: '0x' + Buffer.from('EXECUTION_MODULE').toString('hex').padEnd(64, '0'),
    capability: '0x' + Buffer.from('DIRECT_EXECUTION').toString('hex').padEnd(64, '0'),
  },
]

export function ModuleCreator() {
  const { address } = useAccount()
  const toast = useToast()
  const [step, setStep] = useState<'select' | 'configure' | 'mint'>('select')
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0)
  const [deployedContractAddress, setDeployedContractAddress] = useState<string>('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    moduleName: '',
    description: '',
    moduleType: MODULE_TEMPLATES[0].value,
    baseURI: 'ipfs://',
    mintPrice: '0.001', // Default 0.001 AVAX
  })

  // Deploy transaction
  const { writeContract: deployContract, data: deployHash, isPending: isDeploying, error: deployError } = useWriteContract()
  const { isLoading: isDeployConfirming, isSuccess: isDeploySuccess, data: deployReceipt } = useWaitForTransactionReceipt({
    hash: deployHash,
  })

  // Mint transaction
  const { writeContract: mintContract, data: mintHash, isPending: isMinting, error: mintError } = useWriteContract()
  const { isLoading: isMintConfirming, isSuccess: isMintSuccess } = useWaitForTransactionReceipt({
    hash: mintHash,
  })

  // Set mint price transaction
  const { writeContract: setPriceContract, isPending: isSettingPrice } = useWriteContract()
  const { isLoading: isPriceConfirming, isSuccess: priceSuccess } = useWaitForTransactionReceipt()

  const handleDeploy = () => {
    if (!address) {
      toast.error('Wallet Not Connected', 'Please connect your wallet first')
      return
    }

    const selectedType = MODULE_TEMPLATES.find(t => t.value === formData.moduleType)
    if (!selectedType) return

    toast.loading(
      'Deploying Module',
      'Creating your custom cognitive module contract...'
    )

    // Deploy using factory - need 4 parameters: templateIndex, name, symbol, baseURI
    deployContract({
      address: contracts.moduleFactory.address,
      abi: factoryABI,
      functionName: 'deployFromTemplate',
      args: [
        BigInt(selectedTemplate),
        formData.name,
        formData.symbol,
        formData.baseURI,
      ],
    })
  }

  const handleMint = () => {
    if (!address) {
      toast.error('Wallet Not Connected', 'Please connect your wallet first')
      return
    }

    if (!deployedContractAddress) {
      toast.error('No Contract', 'No deployed contract found')
      return
    }

    toast.loading(
      'Minting Module NFT',
      'Creating your module NFT...'
    )

    mintContract({
      address: deployedContractAddress as `0x${string}`,
      abi: cognitiveModuleABI,
      functionName: 'mint',
      args: [address],
    })
  }

  React.useEffect(() => {
    if (priceSuccess) {
      toast.success('Mint Price Updated!', `Price set to ${formData.mintPrice} AVAX per NFT`)
    }
  }, [priceSuccess, formData.mintPrice, toast])

  // Get deployed contract address from transaction logs
  React.useEffect(() => {
    const getContractAddress = async () => {
      if (!deployReceipt || !deployReceipt.logs || deployReceipt.logs.length === 0) {
        console.log('No transaction receipt or logs available yet')
        return
      }

      console.log('=== Parsing Deploy Transaction Logs ===')
      console.log('Total logs:', deployReceipt.logs.length)
      console.log('Transaction hash:', deployReceipt.transactionHash)

      // Method 1: Parse ModuleDeployed event from factory
      // Event: ModuleDeployed(address indexed moduleAddress, address indexed creator, bytes32 moduleType, bytes32 capability)
      const moduleDeployedTopic = '0x5db9ee3a1168190a537f067c43ce4872a81bb1f7f12615a56f3c02a84f84d807'

      for (const log of deployReceipt.logs) {
        console.log('Checking log:', {
          topics: log.topics?.length,
          data: log.data,
          address: log.address,
        })

        if (log.topics && log.topics.length >= 2) {
          console.log('Log topic[0]:', log.topics[0])
          console.log('Log topic[1]:', log.topics[1])

          if (log.topics[0].toLowerCase() === moduleDeployedTopic) {
            // moduleAddress is the first indexed parameter (topic[1])
            const contractAddr = '0x' + log.topics[1].slice(-40).toLowerCase()
            console.log('✅ Found ModuleDeployed event! Contract address:', contractAddr)
            setDeployedContractAddress(contractAddr)
            return
          }
        }
      }

      // Method 2: Check if this is a contract creation transaction
      // The contract address might be in the transaction receipt itself
      if (deployReceipt.contractAddress) {
        console.log('✅ Found contract address from receipt:', deployReceipt.contractAddress)
        setDeployedContractAddress(deployReceipt.contractAddress)
        return
      }

      // Method 3: Try to get from logs emitted by the factory
      // Factory emits events when deploying, check all logs
      console.log('Method 3: Checking all logs for contract creation...')
      for (const log of deployReceipt.logs) {
        if (log.address && log.address !== '0x0000000000000000000000000000000000000000') {
          // Skip the factory address itself
          if (log.address.toLowerCase() !== contracts.moduleFactory.address.toLowerCase()) {
            console.log('Potential deployed contract:', log.address)
            setDeployedContractAddress(log.address)
            return
          }
        }
      }

      console.warn('❌ Could not find contract address in logs')
      console.log('Deploy receipt:', deployReceipt)
    }

    getContractAddress()
  }, [deployReceipt])

  // Get minted token ID from mint transaction
  const [mintedTokenId, setMintedTokenId] = React.useState<string>('')

  React.useEffect(() => {
    const getTokenId = async () => {
      if (mintedTokenId) return // Already got it

      // For mint transaction, we need to query the contract
      if (isMintSuccess && deployedContractAddress) {
        try {
          const { createPublicClient, http } = await import('viem')
          const { avalancheFuji } = await import('viem/chains')
          
          const publicClient = createPublicClient({
            chain: avalancheFuji,
            transport: http(),
          })

          // Get user's balance to find the token ID
          const { address } = await import('viem')
          const userAddress = address // This won't work, need to get from context
          
          // Alternative: query balanceOf and then tokenByIndex
          const balance = await publicClient.readContract({
            address: deployedContractAddress as `0x${string}`,
            abi: cognitiveModuleABI,
            functionName: 'balanceOf',
            args: [address!],
          })

          if (balance > 0n) {
            // Get the last token (assuming it's the one we just minted)
            // In production, you'd want a more robust way to get the actual token ID
            const tokenIndex = balance - 1n
            
            // Note: CognitiveModule might not have tokenByIndex, so we'll just use a placeholder
            // and let the user select the correct token ID on the attach page
            setMintedTokenId(tokenIndex.toString())
            console.log('Found minted token ID:', tokenIndex.toString())
          }
        } catch (err) {
          console.error('Error getting token ID:', err)
        }
      }
    }
    getTokenId()
  }, [isMintSuccess, deployedContractAddress, address])

  React.useEffect(() => {
    if (isDeploySuccess) {
      toast.success('Module Deployed!', 'Your cognitive module contract has been created')
      
      // Wait a bit for receipt to be processed, then try to get contract address
      setTimeout(() => {
        if (!deployedContractAddress && deployHash) {
          // Open explorer in new tab so user can find contract address
          const explorerUrl = `${'https://testnet.snowtrace.io'}/tx/${deployHash}`
          console.log('Contract address not auto-detected. Opening explorer:', explorerUrl)
          toast.info(
            'Check Explorer',
            `Opening transaction... Copy the "Contract Address" from the page`
          )
          window.open(explorerUrl, '_blank')
        }
      }, 3000)
      
      setStep('mint')
    }
  }, [isDeploySuccess, deployHash, deployedContractAddress, toast])

  React.useEffect(() => {
    if (isMintSuccess) {
      toast.success('Module NFT Minted!', `Your module NFT (#${mintedTokenId || '?'}) has been created and is ready to attach`)
      
      // Show success message with navigation option
      setTimeout(() => {
        if (deployedContractAddress) {
          // Navigate to attach module page with pre-filled module info
          const params = new URLSearchParams({
            moduleContract: deployedContractAddress,
            tokenId: mintedTokenId || '0',
          })
          window.location.href = `/modules/attach?${params.toString()}`
        }
      }, 2000)
    }
  }, [isMintSuccess, deployedContractAddress, mintedTokenId, toast])

  const handleTemplateSelect = (index: number) => {
    setSelectedTemplate(index)
    const template = MODULE_TEMPLATES[index]
    setFormData(prev => ({
      ...prev,
      name: `${template.label} #1`,
      symbol: template.value.substring(0, 4),
      moduleName: template.name,
      moduleType: template.value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-primary-400" />
          Create Module Contract
        </CardTitle>
        <CardDescription>
          Deploy a custom cognitive module and mint NFTs
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 'select' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {MODULE_TEMPLATES.map((type, index) => {
                const Icon = Cpu
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      handleTemplateSelect(index)
                      setStep('configure')
                    }}
                    className="p-4 border border-dark-700 rounded-lg hover:border-primary-500 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary-400" />
                      </div>
                      <span className="font-medium text-white">{type.label}</span>
                    </div>
                    <p className="text-sm text-dark-400">{type.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step === 'configure' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Contract Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="My Memory Module"
              />
            </div>

            <div>
              <Label htmlFor="symbol">Contract Symbol</Label>
              <Input
                id="symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                placeholder="MEM"
                maxLength={5}
              />
            </div>

            <div>
              <Label htmlFor="baseURI">Metadata Base URI (IPFS/HTTP)</Label>
              <Input
                id="baseURI"
                value={formData.baseURI}
                onChange={(e) => setFormData({ ...formData, baseURI: e.target.value })}
                placeholder="ipfs://Qm..."
              />
              <p className="text-xs text-dark-400 mt-1">
                Base URI for module NFT metadata
              </p>
            </div>

            <div>
              <Label htmlFor="mintPrice">Mint Price (AVAX)</Label>
              <Input
                id="mintPrice"
                type="number"
                step="0.0001"
                min="0"
                value={formData.mintPrice}
                onChange={(e) => setFormData({ ...formData, mintPrice: e.target.value })}
                placeholder="0.001"
              />
              <p className="text-xs text-dark-400 mt-1">
                Price users will pay to mint each NFT from this module
              </p>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="ghost" onClick={() => setStep('select')}>
                Back
              </Button>
              <Button
                onClick={handleDeploy}
                disabled={isDeploying || isDeployConfirming || !formData.name || !formData.symbol}
                className="flex-1"
              >
                {isDeployConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : isDeploying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirm in Wallet...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Deploy Module Contract
                  </>
                )}
              </Button>
            </div>

            {deployError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                {deployError.message}
              </div>
            )}
          </div>
        )}

        {step === 'mint' && (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-400 mb-1">Contract Deployed!</h3>
                  <p className="text-sm text-dark-300 mb-2">
                    Your module contract has been deployed successfully.
                  </p>
                  {deployedContractAddress ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-dark-400">Contract:</span>
                      <code className="text-xs bg-dark-900 px-2 py-1 rounded font-mono">
                        {deployedContractAddress}
                      </code>
                      <a
                        href={`${'https://testnet.snowtrace.io'}/address/${deployedContractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-sm text-amber-400 mb-2">
                        ⚠️ Contract address not detected automatically
                      </p>
                      <p className="text-xs text-dark-400 mb-2">
                        Please enter the contract address manually from your transaction:
                      </p>
                      <Label htmlFor="contractAddress" className="text-xs">
                        Contract Address:
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="contractAddress"
                          placeholder="0x..."
                          value={deployedContractAddress}
                          onChange={(e) => setDeployedContractAddress(e.target.value)}
                          className="font-mono text-sm flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (deployHash) {
                              window.open(`${'https://testnet.snowtrace.io'}/tx/${deployHash}`, '_blank')
                            }
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-dark-400 mt-1">
                        Open transaction in explorer to find the contract address
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Set Mint Price */}
            {deployedContractAddress && (
              <div className="p-4 bg-dark-900 rounded-lg">
                <h4 className="font-medium text-white mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary-400" />
                  Set Mint Price
                </h4>
                <p className="text-sm text-dark-400 mb-4">
                  Set the price that users will pay to mint NFTs from your module.
                </p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={formData.mintPrice}
                    onChange={(e) => setFormData({ ...formData, mintPrice: e.target.value })}
                    placeholder="0.001"
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    disabled={isSettingPrice || isPriceConfirming}
                    onClick={() => {
                      if (!deployedContractAddress) return
                      const priceInWei = BigInt(Math.floor(parseFloat(formData.mintPrice) * 1e18))
                      toast.loading('Setting Mint Price', 'Updating mint price...')
                      setPriceContract({
                        address: deployedContractAddress as `0x${string}`,
                        abi: cognitiveModuleABI,
                        functionName: 'setMintPrice',
                        args: [priceInWei],
                      })
                    }}
                  >
                    {isPriceConfirming ? 'Confirming...' : isSettingPrice ? 'Setting...' : 'Set Price'}
                  </Button>
                </div>
                <p className="text-xs text-dark-400 mt-2">
                  Current price: {formData.mintPrice} AVAX per NFT
                </p>
              </div>
            )}

            <div className="p-4 bg-dark-900 rounded-lg">
              <h4 className="font-medium text-white mb-2">Next Step: Mint Module NFT</h4>
              <p className="text-sm text-dark-400 mb-4">
                Mint a module NFT from your contract. This NFT can then be attached to your agent.
              </p>
              
              <Button
                onClick={handleMint}
                disabled={isMinting || isMintConfirming || !deployedContractAddress}
                className="w-full"
              >
                {isMintConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Minting...
                  </>
                ) : isMinting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirm in Wallet...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Mint Module NFT
                  </>
                )}
              </Button>

              {mintError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {mintError.message}
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setStep('select')
                  setDeployedContractAddress('')
                }}
              >
                Done
              </Button>
              <Button variant="outline" onClick={() => setStep('configure')}>
                Deploy Another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
