import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useWallet } from '../hooks/useWallet'
import { useAllDeployedModules, useModuleMetadata } from '../hooks/useModuleRegistry'
import { useOwnedModuleNFTs } from '../hooks/useOwnedModuleNFTs'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import {
  Layers,
  Cpu,
  Zap,
  Shield,
  Brain,
  Wrench,
  ExternalLink,
  Plus,
  CheckCircle,
  TrendingUp,
  Activity,
  ShoppingCart,
  Loader2,
} from 'lucide-react'
import { formatAddress } from '../utils/formatters'
import { cognitiveModuleABI } from '../contracts/abis'
import { formatAVAX } from '../utils/formatters'
import { useReadContract } from 'wagmi'

export const ModuleMarketplacePage: React.FC = () => {
  const { address, isConnected, isWrongChain, switchToFuji } = useWallet()
  const { data: allModules, isLoading: loadingModules } = useAllDeployedModules()
  const navigate = useNavigate()

  // Group modules by type
  const modulesByType = useMemo(() => {
    const grouped: Record<string, typeof allModules> = {
      MEMORY: [],
      TOOL: [],
      POLICY: [],
      EXECUTION: [],
      OTHER: [],
    }

    allModules?.forEach((module) => {
      const type = module.moduleType
      if (type.includes('MEMORY')) grouped.MEMORY.push(module)
      else if (type.includes('TOOL')) grouped.TOOL.push(module)
      else if (type.includes('POLICY')) grouped.POLICY.push(module)
      else if (type.includes('EXECUTION')) grouped.EXECUTION.push(module)
      else grouped.OTHER.push(module)
    })

    return grouped
  }, [allModules])

  const stats = useMemo(() => {
    return {
      totalModules: allModules?.length || 0,
      memoryModules: modulesByType.MEMORY.length,
      toolModules: modulesByType.TOOL.length,
      policyModules: modulesByType.POLICY.length,
      executionModules: modulesByType.EXECUTION.length,
    }
  }, [allModules, modulesByType])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Module Marketplace
            </h1>
            <p className="text-dark-400">
              Browse and discover cognitive modules for your AVBLOX agents
            </p>
          </div>
          {isConnected && !isWrongChain && (
            <Button
              onClick={() => navigate('/modules/create')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Module
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Total Modules</p>
                  <p className="text-2xl font-bold text-white">{stats.totalModules}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Memory</p>
                  <p className="text-2xl font-bold text-white">{stats.memoryModules}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Tools</p>
                  <p className="text-2xl font-bold text-white">{stats.toolModules}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Policy</p>
                  <p className="text-2xl font-bold text-white">{stats.policyModules}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-dark-400">Execution</p>
                  <p className="text-2xl font-bold text-white">{stats.executionModules}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Connection State */}
      {!isConnected ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-dark-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-dark-400 mb-6 max-w-md mx-auto">
              Connect your wallet to mint and manage cognitive modules on Avalanche Fuji testnet.
            </p>
          </CardContent>
        </Card>
      ) : isWrongChain ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Wrong Network
            </h2>
            <p className="text-dark-400 mb-6">
              Please switch to Avalanche Fuji testnet to continue.
            </p>
            <Button onClick={switchToFuji} variant="accent">
              Switch to Fuji
            </Button>
          </CardContent>
        </Card>
      ) : loadingModules ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-8">
                <div className="h-32 bg-dark-800 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : allModules?.length === 0 ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-dark-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No Modules Deployed
            </h2>
            <p className="text-dark-400 mb-6">
              Be the first to deploy a cognitive module!
            </p>
            <Button
              onClick={() => navigate('/modules/create')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {modulesByType.MEMORY.length > 0 && (
            <ModuleSection title="Memory Modules" icon={<Brain className="w-5 h-5 text-emerald-400" />} modules={modulesByType.MEMORY} userAddress={address} />
          )}
          {modulesByType.TOOL.length > 0 && (
            <ModuleSection title="Tool Modules" icon={<Wrench className="w-5 h-5 text-amber-400" />} modules={modulesByType.TOOL} userAddress={address} />
          )}
          {modulesByType.POLICY.length > 0 && (
            <ModuleSection title="Policy Modules" icon={<Shield className="w-5 h-5 text-blue-400" />} modules={modulesByType.POLICY} userAddress={address} />
          )}
          {modulesByType.EXECUTION.length > 0 && (
            <ModuleSection title="Execution Modules" icon={<Zap className="w-5 h-5 text-purple-400" />} modules={modulesByType.EXECUTION} userAddress={address} />
          )}
          {modulesByType.OTHER.length > 0 && (
            <ModuleSection title="Other Modules" icon={<Cpu className="w-5 h-5 text-dark-400" />} modules={modulesByType.OTHER} userAddress={address} />
          )}
        </div>
      )}
    </div>
  )
}

interface ModuleSectionProps {
  title: string
  icon: React.ReactNode
  modules: any[]
  userAddress: `0x${string}` | undefined
}

const ModuleSection: React.FC<ModuleSectionProps> = ({ title, icon, modules, userAddress }) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <Badge variant="info">{modules.length}</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.contractAddress} module={module} userAddress={userAddress} />
        ))}
      </div>
    </div>
  )
}

interface ModuleCardProps {
  module: {
    contractAddress: `0x${string}`
    moduleType: string
    capability: string
    name: string
    symbol: string
  }
  userAddress: `0x${string}` | undefined
}

const ModuleCard: React.FC<ModuleCardProps> = ({ module, userAddress }) => {
  const toast = useToast()
  const navigate = useNavigate()
  const metadata = useModuleMetadata(module.contractAddress)
  const { data: ownedModules, balance: ownedBalance } = useOwnedModuleNFTs(module.contractAddress, userAddress)
  const [mintQuantity, setMintQuantity] = useState(1)
  const [showMintInput, setShowMintInput] = useState(false)

  // Fetch mint price from contract
  const { data: mintPrice } = useReadContract({
    address: module.contractAddress,
    abi: cognitiveModuleABI,
    functionName: 'mintPrice',
    query: {
      enabled: !!module.contractAddress,
    },
  })

  const { writeContract: mintModule, isPending: isMinting } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: mintSuccess } = useWaitForTransactionReceipt()
  const explorerUrl = 'https://testnet.snowtrace.io'

  const getTypeColor = (type: string) => {
    if (type.includes('MEMORY')) return 'emerald'
    if (type.includes('TOOL')) return 'amber'
    if (type.includes('POLICY')) return 'blue'
    if (type.includes('EXECUTION')) return 'purple'
    return 'dark'
  }

  const typeColor = getTypeColor(metadata.moduleType)

  const handleMint = () => {
    if (!userAddress) {
      toast.error('Not Connected', 'Please connect your wallet first')
      return
    }

    const totalPrice = mintPrice || 0n

    toast.loading('Minting Module NFT', `Minting ${mintQuantity} NFT(s)...`)

    // Mint one at a time for simplicity
    for (let i = 0; i < mintQuantity; i++) {
      mintModule({
        address: module.contractAddress,
        abi: cognitiveModuleABI,
        functionName: 'mint',
        args: [userAddress],
        value: totalPrice,
      } as any)
    }
  }

  React.useEffect(() => {
    if (mintSuccess) {
      toast.success('Mint Successful!', `Successfully minted ${mintQuantity} module NFT(s)`)
      setShowMintInput(false)
      setMintQuantity(1)
    }
  }, [mintSuccess, mintQuantity, toast])

  const handleAttachToAgent = () => {
    if (!userAddress) {
      toast.error('Not Connected', 'Please connect your wallet first')
      return
    }
    navigate('/modules/attach', {
      state: {
        moduleContract: module.contractAddress,
        moduleName: metadata.moduleName,
      },
    })
  }

  const handleViewDetails = () => {
    navigate(`/modules/${module.contractAddress}`)
  }

  const isMintingOrConfirming = isMinting || isConfirming
  const hasOwned = ownedBalance !== undefined && ownedBalance > 0n

  return (
    <Card className="overflow-hidden hover:border-dark-600 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              typeColor === 'emerald' ? 'bg-emerald-500/10' :
              typeColor === 'amber' ? 'bg-amber-500/10' :
              typeColor === 'blue' ? 'bg-blue-500/10' :
              typeColor === 'purple' ? 'bg-purple-500/10' :
              'bg-dark-500/10'
            }`}>
              {typeColor === 'emerald' && <Brain className="w-6 h-6 text-emerald-400" />}
              {typeColor === 'amber' && <Wrench className="w-6 h-6 text-amber-400" />}
              {typeColor === 'blue' && <Shield className="w-6 h-6 text-blue-400" />}
              {typeColor === 'purple' && <Zap className="w-6 h-6 text-purple-400" />}
              {typeColor === 'dark' && <Cpu className="w-6 h-6 text-dark-400" />}
            </div>
            <div>
              <CardTitle className="text-base text-white">
                {metadata.moduleName || 'Unknown Module'}
              </CardTitle>
              <p className="text-sm text-dark-400">{formatModuleTypeName(metadata.moduleType)}</p>
            </div>
          </div>
          {hasOwned && (
            <Badge variant="success" size="sm">
              <CheckCircle className="w-3 h-3 mr-1" />
              Owned: {ownedBalance.toString()}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Display */}
        <div className="p-3 bg-dark-900 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-dark-400">Price per NFT</span>
            <Badge variant="info" size="sm">
              {mintPrice !== undefined ? formatAVAX(mintPrice, 6) : '...'} AVAX
            </Badge>
          </div>
        </div>

        {/* Mint Input */}
        {showMintInput && (
          <div className="p-3 bg-dark-900 rounded-lg space-y-2">
            <div>
              <Label htmlFor="mint-qty" className="text-xs text-dark-400">Quantity</Label>
              <Input
                id="mint-qty"
                type="number"
                min="1"
                max="10"
                value={mintQuantity}
                onChange={(e) => setMintQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="h-8 text-sm"
              />
            </div>
            {mintPrice !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-dark-400">Total</span>
                <span className="text-white font-medium">
                  {formatAVAX(mintPrice * BigInt(mintQuantity), 6)} AVAX
                </span>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1"
                onClick={handleMint}
                disabled={isMintingOrConfirming || !userAddress}
                leftIcon={isMintingOrConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              >
                {isConfirming ? 'Confirming...' : isMinting ? 'Minting...' : `Mint (${mintQuantity})`}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowMintInput(false)
                  setMintQuantity(1)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleViewDetails}
            leftIcon={<ExternalLink className="w-4 h-4" />}
          >
            Details
          </Button>
          {!showMintInput && (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => hasOwned ? handleAttachToAgent() : setShowMintInput(true)}
              leftIcon={hasOwned ? <Plus className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
              variant={hasOwned ? 'primary' : 'accent'}
            >
              {hasOwned ? 'Attach to Agent' : 'Mint NFT'}
            </Button>
          )}
        </div>

        <div className="pt-3 border-t border-dark-700">
          <a
            href={`${explorerUrl}/address/${module.contractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-dark-500 hover:text-primary-400 transition-colors flex items-center gap-1"
          >
            View on Explorer
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}

function formatModuleTypeName(moduleType: string): string {
  try {
    const hex = moduleType.replace(/^0x/, '')
    const bytes = Buffer.from(hex, 'hex')
    const str = bytes.toString('utf-8').replace(/\0/g, '')
    if (str) return str.replace('_MODULE', '')
  } catch {
    // Ignore
  }
  return `Module ${moduleType.slice(2, 6)}`
}
