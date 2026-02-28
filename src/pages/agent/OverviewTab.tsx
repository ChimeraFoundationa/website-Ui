import React from 'react'
import type { Address } from 'viem'
import type { ExecutionRecord } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import {
  Cpu,
  Wallet,
  History,
  Layers,
  ExternalLink,
  CheckCircle,
  XCircle,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react'
import { formatAddress, formatDateTime, formatRelativeTime } from '../../utils/formatters'
import { contracts } from '../../contracts/addresses'
import { useReadContract } from 'wagmi'
import { cognitiveModuleABI } from '../../contracts/abis'
import { useAgentMetadata } from '../../hooks/useAgentMetadata'

interface ModuleCardProps {
  contractAddress: `0x${string}`
  explorerUrl: string
}

function ModuleCard({ contractAddress, explorerUrl }: ModuleCardProps) {
  // Fetch module metadata from contract
  const { data: moduleName } = useReadContract({
    address: contractAddress,
    abi: cognitiveModuleABI,
    functionName: 'MODULE_NAME',
    query: {
      enabled: !!contractAddress,
    },
  })

  const { data: moduleType } = useReadContract({
    address: contractAddress,
    abi: cognitiveModuleABI,
    functionName: 'MODULE_TYPE',
    query: {
      enabled: !!contractAddress,
    },
  })

  const { data: moduleDescription } = useReadContract({
    address: contractAddress,
    abi: cognitiveModuleABI,
    functionName: 'MODULE_DESCRIPTION',
    query: {
      enabled: !!contractAddress,
    },
  })

  const displayName = moduleName ? String(moduleName) : formatModuleTypeName(moduleType || '0x0')

  return (
    <div className="p-4 bg-dark-900 rounded-lg border border-dark-700">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <h4 className="font-medium text-white truncate">{displayName}</h4>
          </div>
          {moduleDescription && (
            <p className="text-sm text-dark-400 truncate">{String(moduleDescription)}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <code className="text-xs font-mono text-dark-500">
              {formatAddress(contractAddress, 8)}
            </code>
            <a
              href={`${explorerUrl}/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-dark-500 hover:text-primary-400 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

interface AgentOverviewTabProps {
  tokenId: bigint
  owner: Address | undefined
  lastExecution: ExecutionRecord | undefined
  moduleTypes: string[] | undefined
  childContracts: `0x${string}`[] | undefined
  onRefresh?: () => void
}

export const AgentOverviewTab: React.FC<AgentOverviewTabProps> = ({
  tokenId,
  owner,
  lastExecution,
  moduleTypes,
  childContracts,
  onRefresh,
}) => {
  const explorerUrl = 'https://testnet.snowtrace.io'
  const { metadata: agentMetadata } = useAgentMetadata(tokenId)
  
  const agentName = agentMetadata?.name && agentMetadata.name.length > 0 ? agentMetadata.name : `Plot #${tokenId.toString()}`
  const agentImage = agentMetadata?.image && agentMetadata.image.length > 0 ? agentMetadata.image : null

  return (
    <div className="p-6 space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-primary-400" />
              Agent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Agent Image */}
            {agentImage ? (
              <div className="p-4 bg-dark-900 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-accent-400" />
                  <span className="text-sm text-dark-400">Agent Image</span>
                </div>
                <div className="w-full h-48 rounded-lg bg-dark-800 overflow-hidden">
                  <img
                    src={agentImage.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                    alt={agentName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs text-dark-500 mt-2 truncate">{agentImage}</p>
              </div>
            ) : (
              <div className="p-4 bg-dark-900 rounded-lg text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-3">
                  <Cpu className="w-12 h-12 text-white" />
                </div>
                <p className="text-sm text-dark-400">No custom image set</p>
                <p className="text-xs text-dark-500 mt-1">Click "Edit Metadata" to add an image</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-dark-400 mb-1">Agent Name</p>
              <p className="text-lg font-medium text-white">{agentName}</p>
            </div>
            <div>
              <p className="text-sm text-dark-400 mb-1">Token ID</p>
              <p className="text-lg font-mono text-white">{tokenId.toString()}</p>
            </div>
            <div>
              <p className="text-sm text-dark-400 mb-1">Owner</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-mono text-white">
                  {owner ? formatAddress(owner, 8) : 'Not minted'}
                </p>
                {owner && (
                  <a
                    href={`${explorerUrl}/address/${owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark-500 hover:text-primary-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-dark-400 mb-1">Contract</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-white">
                  {formatAddress(contracts.plot.address, 8)}
                </p>
                <a
                  href={`${explorerUrl}/address/${contracts.plot.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-dark-500 hover:text-primary-400 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4 text-accent-400" />
              Execution Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-dark-400 mb-1">Last Execution</p>
              {lastExecution?.timestamp ? (
                <div className="space-y-1">
                  <p className="text-white">
                    {formatRelativeTime(lastExecution.timestamp)}
                  </p>
                  <p className="text-sm text-dark-500">
                    {formatDateTime(lastExecution.timestamp)}
                  </p>
                </div>
              ) : (
                <p className="text-dark-500">No executions yet</p>
              )}
            </div>
            <div>
              <p className="text-sm text-dark-400 mb-1">Last Status</p>
              {lastExecution ? (
                <Badge variant={lastExecution.success ? 'success' : 'error'}>
                  {lastExecution.success ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <XCircle className="w-3 h-3 mr-1" />
                  )}
                  {lastExecution.success ? 'Success' : 'Failed'}
                </Badge>
              ) : (
                <Badge>N/A</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Attached Modules
            </div>
            {onRefresh && (
              <Button variant="ghost" size="sm" onClick={onRefresh}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {childContracts && childContracts.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-dark-400">
                {childContracts.length} module(s) attached:
              </p>
              {childContracts.map((contract, index) => (
                <ModuleCard 
                  key={index} 
                  contractAddress={contract} 
                  explorerUrl={explorerUrl}
                />
              ))}
            </div>
          ) : moduleTypes && moduleTypes.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {moduleTypes.map((moduleType, index) => (
                <Badge key={index} variant="info">
                  {formatModuleTypeName(moduleType)}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-dark-500">No modules attached</p>
          )}
        </CardContent>
      </Card>

      {/* Child Contracts */}
      {childContracts && childContracts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-4 h-4 text-amber-400" />
              Child Contracts (ERC-998)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {childContracts.map((contract, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-dark-900 rounded-lg"
                >
                  <code className="text-sm font-mono text-dark-300">
                    {formatAddress(contract, 12)}
                  </code>
                  <a
                    href={`${explorerUrl}/address/${contract}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark-500 hover:text-primary-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
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
