import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { useWallet } from '../hooks/useWallet'
import { useUsername, useIsVerified } from '../hooks/useUsernameRegistry'
import { useOwnedNFTs } from '../hooks/useOwnedNFTs'
import { useUserModules } from '../hooks/useModuleRegistry'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import {
  User,
  Cpu,
  Layers,
  CheckCircle2,
  TrendingUp,
  Activity,
  Plus,
  ArrowRight,
  ExternalLink,
  Wallet,
  RefreshCw,
} from 'lucide-react'
import { formatAddress } from '../utils/formatters'

export const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected, isWrongChain, switchToFuji } = useWallet()
  const { username, isLoading: loadingUsername, refetch: refetchUsername } = useUsername(address)
  const { isVerified } = useIsVerified(username)
  const { ownedTokenIds, balance: agentCount } = useOwnedNFTs(address)
  const { data: userModules } = useUserModules(address)

  const explorerUrl = 'https://testnet.snowtrace.io'

  const handleRefresh = () => {
    refetchUsername()
    // Force re-render by navigating away and back
    window.location.reload()
  }

  // Not connected
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="py-16">
          <CardContent className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-10 h-10 text-dark-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Welcome to AVBLOX
            </h1>
            <p className="text-dark-400 mb-8 max-w-md mx-auto">
              Connect your wallet to access your dashboard and manage your autonomous agents
            </p>
            <Button size="lg" onClick={() => navigate('/')} leftIcon={<Wallet className="w-4 h-4" />}>
              Go to Marketplace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Wrong chain
  if (isWrongChain) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="py-16 border-amber-500/30">
          <CardContent className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Wrong Network
            </h1>
            <p className="text-dark-400 mb-8">
              Please switch to Avalanche Fuji testnet to continue
            </p>
            <Button size="lg" variant="accent" onClick={switchToFuji}>
              Switch to Fuji
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back{username ? `, @${username}` : ''}!
            </h1>
            <p className="text-dark-400">
              Manage your agents and modules from one place
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isVerified && (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/username')}
              leftIcon={<User className="w-4 h-4" />}
            >
              {username ? 'Update Username' : 'Register Username'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              title="Refresh data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Username Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4 text-primary-400" />
              Username
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUsername ? (
              <div className="h-8 bg-dark-800 rounded animate-pulse" />
            ) : username ? (
              <div>
                <p className="text-2xl font-bold text-white">@{username}</p>
                <p className="text-xs text-dark-400 mt-1">
                  {formatAddress(address!)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-dark-400">Not registered</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto mt-1"
                  onClick={() => navigate('/username')}
                >
                  Register now →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Agents Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-400" />
              My Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {agentCount.toString()}
            </p>
            <p className="text-xs text-dark-400 mt-1">
              ERC-998 NFTs owned
            </p>
          </CardContent>
        </Card>

        {/* Modules Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              My Modules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-white">
              {userModules?.length || 0}
            </p>
            <p className="text-xs text-dark-400 mt-1">
              Module contracts deployed
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/mint')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Mint Agent
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => navigate('/modules/create')}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Create Module
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Agents */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Cpu className="w-4 h-4 text-primary-400" />
                Your Agents
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {ownedTokenIds.length === 0 ? (
              <div className="text-center py-8">
                <Cpu className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 mb-4">No agents yet</p>
                <Button
                  onClick={() => navigate('/mint')}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Mint Your First Agent
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {ownedTokenIds.slice(0, 5).map((tokenId) => (
                  <div
                    key={tokenId.toString()}
                    className="flex items-center justify-between p-3 bg-dark-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <Cpu className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Plot #{tokenId.toString()}
                        </p>
                        <p className="text-xs text-dark-500">
                          Agent NFT
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/agent/${tokenId}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deployed Modules */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Your Modules
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/modules')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!userModules || userModules.length === 0 ? (
              <div className="text-center py-8">
                <Layers className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                <p className="text-dark-400 mb-4">No modules deployed</p>
                <Button
                  onClick={() => navigate('/modules/create')}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Deploy Your First Module
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {userModules.slice(0, 5).map((moduleAddress) => (
                  <div
                    key={moduleAddress}
                    className="flex items-center justify-between p-3 bg-dark-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          Module Contract
                        </p>
                        <p className="text-xs text-dark-500 font-mono">
                          {formatAddress(moduleAddress)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/modules/${moduleAddress}`)}
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* External Links */}
      <div className="mt-8 flex items-center justify-center gap-6 text-sm text-dark-500">
        <a
          href={`${explorerUrl}/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary-400 transition-colors"
        >
          View on Explorer
          <ExternalLink className="w-3 h-3" />
        </a>
        <a
          href="https://docs.avblox.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-primary-400 transition-colors"
        >
          Documentation
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
