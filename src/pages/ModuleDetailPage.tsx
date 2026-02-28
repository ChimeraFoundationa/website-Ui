import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useWallet } from '../hooks/useWallet'
import { useModuleMetadata, useModuleNFTs } from '../hooks/useModuleRegistry'
import { useOwnedModuleNFTs } from '../hooks/useOwnedModuleNFTs'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import {
  ArrowLeft,
  Layers,
  Brain,
  Wrench,
  Shield,
  Zap,
  Cpu,
  ExternalLink,
  Plus,
  CheckCircle,
  Activity,
} from 'lucide-react'
import { formatAddress, formatDateTime } from '../utils/formatters'

export const ModuleDetailPage: React.FC = () => {
  const { address } = useParams<{ address: string }>()
  const navigate = useNavigate()
  const { address: userAddress, isConnected } = useAccount()
  const { isWrongChain, switchToFuji } = useWallet()

  const moduleAddress = address as `0x${string}` | undefined
  const metadata = useModuleMetadata(moduleAddress)
  const { data: ownedModules, balance: ownedBalance } = useOwnedModuleNFTs(
    moduleAddress,
    userAddress
  )

  const explorerUrl = 'https://testnet.snowtrace.io'

  const getTypeColor = (type: string) => {
    if (type.includes('MEMORY')) return 'emerald'
    if (type.includes('TOOL')) return 'amber'
    if (type.includes('POLICY')) return 'blue'
    if (type.includes('EXECUTION')) return 'purple'
    return 'dark'
  }

  const typeColor = getTypeColor(metadata.moduleType)

  const handleAttachToAgent = () => {
    if (!isConnected) {
      navigate('/modules/attach')
      return
    }
    navigate('/modules/attach', {
      state: {
        moduleContract: moduleAddress,
        moduleName: metadata.moduleName,
      },
    })
  }

  if (!moduleAddress) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="py-16">
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              Module Not Found
            </h2>
            <Button onClick={() => navigate('/modules')} className="mt-4">
              Back to Modules
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/modules')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Modules
        </Button>
      </div>

      {/* Module Header */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-16 h-16 rounded-xl bg-${typeColor}-500/10 flex items-center justify-center`}
              >
                {typeColor === 'emerald' && <Brain className="w-8 h-8 text-emerald-400" />}
                {typeColor === 'amber' && <Wrench className="w-8 h-8 text-amber-400" />}
                {typeColor === 'blue' && <Shield className="w-8 h-8 text-blue-400" />}
                {typeColor === 'purple' && <Zap className="w-8 h-8 text-purple-400" />}
                {typeColor === 'dark' && <Cpu className="w-8 h-8 text-dark-400" />}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  {metadata.moduleName || 'Unknown Module'}
                </h1>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="info">
                    {formatModuleTypeName(metadata.moduleType)}
                  </Badge>
                  {ownedBalance > 0n && (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Owned: {ownedBalance.toString()}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-400">
                  <code className="font-mono">
                    {formatAddress(moduleAddress, 8)}
                  </code>
                  <a
                    href={`${explorerUrl}/address/${moduleAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark-500 hover:text-primary-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(`${explorerUrl}/address/${moduleAddress}`, '_blank')}
                leftIcon={<ExternalLink className="w-4 h-4" />}
              >
                View on Explorer
              </Button>
              <Button
                onClick={handleAttachToAgent}
                leftIcon={<Plus className="w-4 h-4" />}
                disabled={ownedBalance === 0n}
              >
                {ownedBalance === 0n ? 'Not Owned' : 'Attach to Agent'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-400" />
              Module Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {formatModuleTypeName(metadata.moduleType)}
            </p>
            <p className="text-sm text-dark-400 mt-1">
              {metadata.moduleType.slice(0, 10)}...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-400" />
              Capability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {metadata.capability ? formatModuleTypeName(metadata.capability) : 'N/A'}
            </p>
            <p className="text-sm text-dark-400 mt-1">
              {metadata.capability?.slice(0, 10) || '0x0'}...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              Your Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {ownedBalance?.toString() || '0'}
            </p>
            <p className="text-sm text-dark-400 mt-1">
              {ownedBalance === 0n ? 'Not owned' : 'Module NFT(s)'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Module Info */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">About This Module</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Description</h3>
              <p className="text-sm text-dark-400">
                This is a {formatModuleTypeName(metadata.moduleType).toLowerCase()} module 
                that can be attached to AVBLOX agents to extend their capabilities.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700">
              <div>
                <p className="text-sm text-dark-400 mb-1">Contract Address</p>
                <p className="font-mono text-sm text-white">
                  {formatAddress(moduleAddress, 8)}
                </p>
              </div>
              <div>
                <p className="text-sm text-dark-400 mb-1">Module Type</p>
                <p className="font-mono text-sm text-white">
                  {metadata.moduleType.slice(0, 10)}...
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owned NFTs */}
      {ownedBalance > 0n && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Your Module NFTs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-dark-400">
                You own {ownedBalance.toString()} module NFT(s) from this contract:
              </p>
              {ownedModules?.map((module, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-dark-900 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Token #{module.tokenId.toString()}
                      </p>
                      <p className="text-xs text-dark-500">
                        {metadata.moduleName}
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAttachToAgent}
                  >
                    Attach
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Owned CTA */}
      {ownedBalance === 0n && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-dark-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              You Don't Own This Module
            </h3>
            <p className="text-dark-400 mb-6 max-w-md mx-auto">
              Mint this module NFT to attach it to your agents and unlock new capabilities.
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => navigate('/modules/create')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Similar Module
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/modules/attach')}
                leftIcon={<Layers className="w-4 h-4" />}
              >
                Browse Available Modules
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
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
