import React from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { AgentCard as AgentCardType } from '../../types'
import { formatAddress, formatGasPrice } from '../../utils/formatters'
import { useNavigate } from 'react-router-dom'
import { Clock, Activity, Zap, ArrowRight, Cpu, Image as ImageIcon, User, CheckCircle2 } from 'lucide-react'
import { useAgentMetadata } from '../../hooks/useAgentMetadata'
import { useUsername, useIsVerified } from '../../hooks/useUsernameRegistry'

interface AgentCardProps {
  agent: AgentCardType
  currentAddress?: `0x${string}`
}

export const AgentCard: React.FC<AgentCardProps> = ({ agent, currentAddress }) => {
  const navigate = useNavigate()
  const { metadata: agentMetadata, isLoading: loadingMetadata } = useAgentMetadata(agent.tokenId)
  const { username: ownerUsername } = useUsername(agent.owner)
  const { isVerified } = useIsVerified(ownerUsername)

  const isOwner = currentAddress && agent.owner.toLowerCase() === currentAddress.toLowerCase()

  const agentName = agentMetadata?.name && agentMetadata.name.length > 0 ? agentMetadata.name : `Plot #${agent.tokenId.toString()}`
  const agentImage = agentMetadata?.image && agentMetadata.image.length > 0 ? agentMetadata.image : null

  return (
    <Card className="group" onClick={() => navigate(`/agent/${agent.tokenId}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {agentImage ? (
              <div className="w-12 h-12 rounded-xl bg-dark-800 overflow-hidden">
                <img
                  src={agentImage.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                  alt={agentName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <CardTitle className="text-white">
                {agentName}
              </CardTitle>
              <div className="flex items-center gap-1.5">
                {ownerUsername ? (
                  <div className="flex items-center gap-1 text-xs text-primary-400">
                    <User className="w-3 h-3" />
                    <span>@{ownerUsername}</span>
                    {isVerified && (
                      <CheckCircle2 className="w-3 h-3 text-blue-400" />
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-dark-400 font-mono">
                    {formatAddress(agent.owner)}
                  </p>
                )}
              </div>
            </div>
          </div>
          <Badge variant={agent.status === 'active' ? 'success' : 'default'} size="sm">
            {agent.status === 'active' ? 'Active' : 'Idle'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-dark-900/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-dark-400 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs">Executions</span>
            </div>
            <p className="text-xl font-semibold text-white">
              {agent.executionCount.toString()}
            </p>
          </div>

          <div className="bg-dark-900/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-dark-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Avg Gas</span>
            </div>
            <p className="text-sm font-semibold text-white">
              {formatGasPrice(agent.avgGasUsed)}
            </p>
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex items-center gap-2 text-dark-400 text-sm">
          <Clock className="w-4 h-4" />
          <span>
            {agent.lastExecutionTime > 0n
              ? `Last active ${formatLastActive(agent.lastExecutionTime)}`
              : 'Never executed'}
          </span>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-dark-700">
        <Button
          variant={isOwner ? 'primary' : 'secondary'}
          size="sm"
          className="w-full group/btn"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/agent/${agent.tokenId}`)
          }}
        >
          {isOwner ? 'Manage Agent' : 'View Details'}
          <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  )
}

function formatLastActive(timestamp: bigint): string {
  const now = Date.now() / 1000
  const diff = now - Number(timestamp)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}
