import React, { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../hooks/useWallet'
import { useOwnedNFTs } from '../hooks/useOwnedNFTs'
import { AgentCard } from '../components/cards/AgentCard'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Cpu, Wallet, TrendingUp, Activity, Plus, Sparkles } from 'lucide-react'
import { AgentCard as AgentCardType } from '../types'
import { formatAVAX } from '../utils/formatters'
import { useGasPrice } from '../hooks/useWallet'

export const MarketplacePage: React.FC = () => {
  const { address, isConnected, isWrongChain, switchToFuji } = useWallet()
  const { ownedTokenIds, isLoading, balance, error, refetch } = useOwnedNFTs(address)
  const { gasPrice } = useGasPrice()
  const navigate = useNavigate()

  // Listen for mint event
  useEffect(() => {
    const handleMintEvent = () => {
      refetch()
    }

    window.addEventListener('nft-minted', handleMintEvent)
    return () => window.removeEventListener('nft-minted', handleMintEvent)
  }, [refetch])

  const nfts: AgentCardType[] = ownedTokenIds.map((id) => ({
    tokenId: id,
    owner: address!,
    executionCount: 0n,
    avgGasUsed: 0n,
    lastExecutionTime: 0n,
    status: 'idle' as const,
  }))

  const stats = useMemo(() => {
    if (!ownedTokenIds.length) return null

    return {
      totalAgents: ownedTokenIds.length,
      totalExecutions: 0,
      activeAgents: 0,
      avgGas: 0n,
    }
  }, [ownedTokenIds.length])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Agents
            </h1>
            <p className="text-dark-400">
              Manage and execute your AVBLOX cognitive agents
            </p>
          </div>
          {isConnected && !isWrongChain && (
            <Button onClick={() => navigate('/mint')} leftIcon={<Plus className="w-4 h-4" />}>
              Mint New Agent
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        {isConnected && !isWrongChain && stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">My Agents</p>
                    <p className="text-2xl font-bold text-white">{stats.totalAgents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Total Executions</p>
                    <p className="text-2xl font-bold text-white">{stats.totalExecutions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Active Agents</p>
                    <p className="text-2xl font-bold text-white">{stats.activeAgents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm text-dark-400">Avg Gas</p>
                    <p className="text-lg font-bold text-white">{formatAVAX(stats.avgGas, 6)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gas Price Indicator */}
        {gasPrice && (
          <div className="flex items-center gap-2 mb-6">
            <Badge variant="info" size="sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              Gas: {(Number(gasPrice) / 1e9).toFixed(2)} Gwei
            </Badge>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <Card className="py-16 mb-8">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Error Loading NFTs
            </h2>
            <p className="text-dark-400 mb-4">{error}</p>
            <Button onClick={refetch}>Retry</Button>
          </CardContent>
        </Card>
      )}

      {/* Connection State */}
      {!isConnected ? (
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-dark-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Connect Your Wallet
            </h2>
            <p className="text-dark-400 mb-6 max-w-md mx-auto">
              Connect your wallet to view and manage your AVBLOX agents on Avalanche Fuji
              testnet.
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
      ) : isLoading ? (
        /* Loading State */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-8">
                <div className="h-32 bg-dark-800 rounded-lg" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : nfts.length === 0 ? (
        /* Empty State */
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-8 h-8 text-dark-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              No Agents Yet
            </h2>
            <p className="text-dark-400 mb-6">
              Mint your first Plot NFT to start creating autonomous agents.
            </p>
            <Button onClick={() => navigate('/mint')} leftIcon={<Plus className="w-4 h-4" />}>
              Mint Your First Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* NFT Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nfts.map((agent) => (
            <AgentCard key={agent.tokenId.toString()} agent={agent} currentAddress={address} />
          ))}
        </div>
      )}
    </div>
  )
}
