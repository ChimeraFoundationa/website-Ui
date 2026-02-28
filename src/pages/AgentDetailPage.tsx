import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Tabs, TabContent } from '../components/ui/Tabs'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { EditAgentMetadataModal } from '../components/ui/EditAgentMetadataModal'
import { AgentOverviewTab } from './agent/OverviewTab'
import { AgentContextTab } from './agent/ContextTab'
import { AgentExecuteTab } from './agent/ExecuteTab'
import { AgentHistoryTab } from './agent/HistoryTab'
import { usePlotOwner, useChildContracts } from '../hooks/usePlot'
import { useMiddlewareContext } from '../hooks/useMiddleware'
import { useAdapterContext, useAgentModuleTypes } from '../hooks/useAdapter'
import { useLastExecutionRecord } from '../hooks/useExecution'
import { useAgentMetadata } from '../hooks/useAgentMetadata'
import {
  ArrowLeft,
  Cpu,
  FileText,
  Terminal,
  History,
  ExternalLink,
  Copy,
  Check,
  Link,
  Edit,
} from 'lucide-react'
import { formatAddress } from '../utils/formatters'
import { contracts } from '../contracts/addresses'

export const AgentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { address } = useAccount()
  const toast = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [copied, setCopied] = useState(false)
  const [showEditMetadata, setShowEditMetadata] = useState(false)

  const tokenId = id ? BigInt(id) : undefined

  // Fetch agent metadata
  const { metadata: agentMetadata, refetch: refetchMetadata } = useAgentMetadata(tokenId)

  // Fetch agent data - prioritize childContracts from Plot contract
  const { data: owner } = usePlotOwner(tokenId)
  const { data: middlewareContext, isLoading: loadingMiddleware } = useMiddlewareContext(tokenId)
  const { data: adapterContext, isLoading: loadingAdapter } = useAdapterContext(tokenId)
  const { data: moduleTypes } = useAgentModuleTypes(tokenId)
  const { data: lastExecution } = useLastExecutionRecord(tokenId)
  const { data: childContracts, refetch: refetchChildContracts } = useChildContracts(tokenId)

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()

  // Refresh function
  const refreshAgentData = () => {
    refetchChildContracts()
    refetchMetadata()
  }

  // Listen for module attach event and refresh data
  React.useEffect(() => {
    const handleModuleAttached = (event: Event) => {
      const customEvent = event as CustomEvent<{ plotId?: string }>
      const plotId = customEvent.detail?.plotId
      // Only refresh if this is the current agent
      if (plotId === tokenId?.toString()) {
        refetchChildContracts()
      }
    }

    window.addEventListener('module-attached', handleModuleAttached)
    return () => window.removeEventListener('module-attached', handleModuleAttached)
  }, [tokenId, refetchChildContracts])

  const tabs = React.useMemo(() => [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Cpu className="w-4 h-4" />,
    },
    {
      id: 'context',
      label: 'Context',
      icon: <FileText className="w-4 h-4" />,
      badge: moduleTypes?.length,
    },
    {
      id: 'execute',
      label: 'Execute',
      icon: <Terminal className="w-4 h-4" />,
    },
    {
      id: 'history',
      label: 'History',
      icon: <History className="w-4 h-4" />,
    },
  ], [moduleTypes?.length])

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleCopyAddress = () => {
    if (owner) {
      navigator.clipboard.writeText(owner)
      setCopied(true)
      toast.success('Address Copied', 'Owner address copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!tokenId) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="py-16">
          <CardContent className="text-center">
            <h2 className="text-xl font-semibold text-white mb-2">
              Invalid Agent ID
            </h2>
            <Button variant="ghost" onClick={() => navigate('/')}>
              Back to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-4"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Marketplace
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
              <Cpu className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {agentMetadata?.name && agentMetadata.name.length > 0 ? agentMetadata.name : `Plot #${tokenId.toString()}`}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-dark-400 text-sm font-mono">
                  {formatAddress(owner || '0x0000000000000000000000000000000000000000', 8)}
                </span>
                <button
                  onClick={handleCopyAddress}
                  className="text-dark-500 hover:text-primary-400 transition-colors"
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {owner && (
                  <a
                    href={`${'https://testnet.snowtrace.io'}/address/${owner}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark-500 hover:text-primary-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isOwner && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowEditMetadata(true)}
                  leftIcon={<Edit className="w-4 h-4" />}
                >
                  Edit Metadata
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/modules/attach?agentId=${id}`)}
                  leftIcon={<Link className="w-4 h-4" />}
                >
                  Attach Module
                </Button>
              </>
            )}
            <Badge variant={isOwner ? 'success' : 'default'}>
              {isOwner ? 'Your Agent' : 'View Only'}
            </Badge>
            {lastExecution?.success && (
              <Badge variant="success">Last Execution: Success</Badge>
            )}
            {lastExecution && !lastExecution.success && (
              <Badge variant="error">Last Execution: Failed</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
        
        <CardContent className="p-0">
          <TabContent activeTab={activeTab} tabId="overview">
            <AgentOverviewTab
              tokenId={tokenId}
              owner={owner}
              lastExecution={lastExecution}
              moduleTypes={moduleTypes as string[] | undefined}
              childContracts={childContracts as `0x${string}`[] | undefined}
              onRefresh={refreshAgentData}
            />
          </TabContent>

          <TabContent activeTab={activeTab} tabId="context">
            <AgentContextTab
              tokenId={tokenId}
              middlewareContext={middlewareContext}
              adapterContext={adapterContext}
              isLoading={loadingMiddleware || loadingAdapter}
            />
          </TabContent>

          <TabContent activeTab={activeTab} tabId="execute">
            <AgentExecuteTab
              tokenId={tokenId}
              isOwner={!!isOwner}
            />
          </TabContent>

          <TabContent activeTab={activeTab} tabId="history">
            <AgentHistoryTab tokenId={tokenId} />
          </TabContent>
        </CardContent>
      </Card>

      {/* Edit Metadata Modal */}
      {showEditMetadata && (
        <EditAgentMetadataModal
          tokenId={tokenId!}
          currentName={agentMetadata?.name || ''}
          currentImage={agentMetadata?.image || ''}
          onClose={() => setShowEditMetadata(false)}
          onSuccess={() => {
            refetchMetadata()
            refreshAgentData()
          }}
        />
      )}
    </div>
  )
}
