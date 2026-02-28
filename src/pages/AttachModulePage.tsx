import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useToast } from '../components/ui/Toast'
import { useAttachModule } from '../hooks/usePlot'
import { useOwnedNFTs } from '../hooks/useOwnedNFTs'
import { usePlotOwner } from '../hooks/usePlot'
import { Badge } from '../components/ui/Badge'
import { ArrowLeft, Link, CheckCircle, Loader2, Cpu, Layers, Plus } from 'lucide-react'
import { contracts } from '../contracts/addresses'
import { useUserModules } from '../hooks/useModuleRegistry'
import { useOwnedModuleNFTs } from '../hooks/useOwnedModuleNFTs'
import { cn } from '../utils/cn'

interface ModuleInfo {
  contractAddress: `0x${string}`
  tokenId: bigint
  name?: string
  symbol?: string
}

export const AttachModulePage: React.FC = () => {
  const navigate = useNavigate()
  const { address } = useAccount()
  const toast = useToast()

  // Get agentId from query param if available
  const queryParams = new URLSearchParams(window.location.search)
  const queryAgentId = queryParams.get('agentId')

  const [selectedAgentId, setSelectedAgentId] = useState<bigint | null>(
    queryAgentId ? BigInt(queryAgentId) : null
  )
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null)

  const { approvePlot, attachModule, isApproveSuccess, isApprovePending, isApproveConfirming, approveError, isPending, isConfirming, isSuccess, error } = useAttachModule(address)
  const { ownedTokenIds: ownedPlotIds } = useOwnedNFTs(address)

  // Track approval state
  const [isApproved, setIsApproved] = useState(false)

  // Get user's Plot ownership
  const { data: agentOwner } = usePlotOwner(selectedAgentId || undefined)
  const isOwner = address && agentOwner && address.toLowerCase() === agentOwner.toLowerCase()

  // Get user's module contracts
  const { data: userModuleContracts, isLoading: loadingUserModules } = useUserModules(address)

  // Get owned module NFTs from each contract
  const allOwnedModules: ModuleInfo[] = []
  
  if (userModuleContracts && address) {
    for (const contractAddr of userModuleContracts) {
      // Hook can't be used in loop, so we'll use a different approach
      // For now, collect contracts and let user select token ID
      allOwnedModules.push({
        contractAddress: contractAddr,
        tokenId: 0n, // Will be updated by user
        name: 'Module NFT',
        symbol: 'MODULE',
      })
    }
  }

  // Watch for approval success
  React.useEffect(() => {
    if (isSuccess && !isApproved) {
      setIsApproved(true)
      toast.success('Module Approved!', 'Now click "Attach Module" again to confirm')
    }
  }, [isSuccess, isApproved, toast])

  // Reset approval state when module changes
  React.useEffect(() => {
    setIsApproved(false)
  }, [selectedModule])

  // Navigate after successful attach
  React.useEffect(() => {
    if (isSuccess && isApproved && selectedAgentId) {
      toast.success('Module Attached!', 'Your module has been attached to the agent')
      
      // Dispatch event to refresh agent data
      window.dispatchEvent(new CustomEvent('module-attached', { 
        detail: { plotId: selectedAgentId.toString() } 
      }))
      
      navigate(`/agent/${selectedAgentId.toString()}`)
    }
  }, [isSuccess, isApproved, toast, navigate, selectedAgentId])

  // Watch for approval success
  React.useEffect(() => {
    if (isApproveSuccess && !isApproved) {
      setIsApproved(true)
      toast.success('Module Approved!', 'Now click "Attach Module" again to confirm')
    }
  }, [isApproveSuccess, isApproved, toast])

  // Watch for transaction state changes
  React.useEffect(() => {
    console.log('Approve state:', { isApprovePending, isApproveConfirming, isApproveSuccess, approveError: approveError?.message })
    console.log('Attach state:', { isPending, isConfirming, isSuccess, error: error?.message })

    if (approveError) {
      toast.error('Approve Error', approveError.message)
    }
    if (error) {
      toast.error('Attach Error', error.message)
    }
  }, [isApprovePending, isApproveConfirming, isApproveSuccess, approveError, isPending, isConfirming, isSuccess, error, toast])

  const handleAttach = () => {
    if (!address) {
      toast.error('Wallet Not Connected', 'Please connect your wallet first')
      return
    }

    if (!selectedAgentId) {
      toast.error('No Agent Selected', 'Please select an agent')
      return
    }

    if (!selectedModule) {
      toast.error('No Module Selected', 'Please select a module to attach')
      return
    }

    if (!isOwner) {
      toast.error('Not Agent Owner', 'You must own this agent to attach modules')
      return
    }

    if (!isApproved) {
      // Step 1: Approve
      toast.loading(
        'Approving Module',
        `Approving module #${selectedModule.tokenId.toString()} for transfer...`
      )

      approvePlot(
        selectedModule.contractAddress,
        contracts.plot.address,
        selectedModule.tokenId
      )
    } else {
      // Step 2: Transfer via receiveChild
      toast.loading(
        'Attaching Module',
        `Attaching module #${selectedModule.tokenId.toString()} to agent #${selectedAgentId.toString()}...`
      )

      attachModule(
        contracts.plot.address,
        selectedAgentId,
        selectedModule.contractAddress,
        selectedModule.tokenId
      )
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
            <Link className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Attach Module to Agent
            </h1>
            <p className="text-dark-400">
              Select a module NFT from your wallet to attach to your agent
            </p>
          </div>
        </div>
      </div>

      {/* Success State */}
      {isSuccess && isApproved ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Module Attached Successfully!
            </h2>
            <p className="text-dark-400 mb-6">
              Your module NFT has been transferred to your agent
            </p>
            <Button onClick={() => navigate(`/agent/${selectedAgentId?.toString()}`)}>
              View Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Step 1: Select Agent */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-primary-400" />
                Step 1: Select Your Agent
              </CardTitle>
              <CardDescription>
                Choose the Plot NFT (agent) to attach the module to
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ownedPlotIds.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-dark-400 mb-4">You don't own any agents yet</p>
                  <Button onClick={() => navigate('/mint')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Mint Your First Agent
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ownedPlotIds.map((id) => {
                    const isSelected = selectedAgentId === id
                    return (
                      <button
                        key={id.toString()}
                        onClick={() => {
                          setSelectedAgentId(id)
                          setSelectedModule(null)
                          setIsApproved(false)
                        }}
                        className={cn(
                          'p-4 rounded-xl border transition-all',
                          isSelected
                            ? 'border-primary-500 bg-primary-500/10 ring-2 ring-primary-500/20'
                            : 'border-dark-700 bg-dark-900 hover:border-dark-500'
                        )}
                      >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-2">
                          <Cpu className="w-5 h-5 text-white" />
                        </div>
                        <p className="font-medium text-white">#{id.toString()}</p>
                        {isSelected && (
                          <Badge variant="success" size="sm" className="mt-2">
                            Selected
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Select Module */}
          {selectedAgentId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-accent-400" />
                  Step 2: Select Module to Attach
                </CardTitle>
                <CardDescription>
                  {loadingUserModules ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading your modules...
                    </span>
                  ) : (
                    'Choose a module NFT from your deployed contracts'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUserModules ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-dark-500 animate-spin" />
                  </div>
                ) : !userModuleContracts || userModuleContracts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-dark-400 mb-2">No module contracts found</p>
                    <p className="text-dark-500 text-sm mb-4">
                      You haven't deployed any module contracts yet
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={() => navigate('/modules/create')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Module
                      </Button>
                      <Button variant="outline" onClick={() => navigate('/modules/attach/manual')}>
                        Manual Entry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-dark-400">
                      Select your module contract and enter the token ID:
                    </p>
                    {userModuleContracts.map((contractAddr) => (
                      <div key={contractAddr} className="border border-dark-700 rounded-lg p-4">
                        <p className="font-mono text-sm text-primary-400 mb-3 break-all">
                          {contractAddr}
                        </p>
                        <div className="flex gap-2 items-center">
                          <input
                            type="number"
                            placeholder="Token ID (e.g., 0)"
                            min="0"
                            className="flex-1 bg-dark-900 border border-dark-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-primary-500"
                            onChange={(e) => {
                              const tokenId = e.target.value ? BigInt(e.target.value) : null
                              if (tokenId !== null) {
                                setSelectedModule({
                                  contractAddress: contractAddr,
                                  tokenId,
                                  name: 'Module NFT',
                                  symbol: 'MODULE',
                                })
                                setIsApproved(false)
                              } else {
                                setSelectedModule(null)
                              }
                            }}
                          />
                          <Button
                            variant={selectedModule?.contractAddress === contractAddr ? 'primary' : 'secondary'}
                            onClick={() => {
                              // Default to token ID 0 (first mint)
                              setSelectedModule({
                                contractAddress: contractAddr,
                                tokenId: 0n,
                                name: 'Module NFT',
                                symbol: 'MODULE',
                              })
                              setIsApproved(false)
                            }}
                          >
                            Select ID 0
                          </Button>
                        </div>
                        <p className="text-xs text-dark-400 mt-2">
                          💡 Token ID starts from 0. If you minted 1 NFT, use ID 0.
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirm & Attach */}
          {selectedAgentId && selectedModule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-emerald-400" />
                  Step 3: Confirm Attachment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
                  <span className="text-dark-400">Agent:</span>
                  <span className="font-medium text-white">#{selectedAgentId.toString()}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
                  <span className="text-dark-400">Module Contract:</span>
                  <span className="font-mono text-dark-300 text-sm break-all">
                    {selectedModule.contractAddress}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-dark-900 rounded-lg">
                  <span className="text-dark-400">Module Token ID:</span>
                  <span className="font-medium text-white">
                    #{selectedModule.tokenId.toString()}
                  </span>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                    Error: {error.message}
                  </div>
                )}

                <Button
                  onClick={handleAttach}
                  disabled={isPending || isConfirming || !isOwner}
                  className="w-full"
                  size="lg"
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Confirming Transaction...
                    </>
                  ) : isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Waiting for Confirmation...
                    </>
                  ) : !isOwner ? (
                    "You don't own this agent"
                  ) : !isApproved ? (
                    <>
                      <Link className="w-5 h-5 mr-2" />
                      Step 1: Approve Module Transfer
                    </>
                  ) : (
                    <>
                      <Link className="w-5 h-5 mr-2" />
                      Step 2: Confirm Attach to Agent
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Manual Entry Option */}
          <Card>
            <CardContent className="py-4">
              <div className="text-center">
                <p className="text-dark-400 text-sm mb-3">
                  Can't find your module? Enter details manually
                </p>
                <Button variant="outline" onClick={() => navigate('/modules/attach/manual')}>
                  Manual Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
