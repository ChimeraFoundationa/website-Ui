import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { useToast } from '../components/ui/Toast'
import { useAttachModule } from '../hooks/usePlot'
import { useOwnedNFTs } from '../hooks/useOwnedNFTs'
import { usePlotOwner } from '../hooks/usePlot'
import { ArrowLeft, Link, CheckCircle, Loader2, Info } from 'lucide-react'
import { contracts } from '../contracts/addresses'

export const AttachModuleManualPage: React.FC = () => {
  const navigate = useNavigate()
  const { address } = useAccount()
  const toast = useToast()
  
  const queryParams = new URLSearchParams(window.location.search)
  const queryAgentId = queryParams.get('agentId')
  
  const [agentId, setAgentId] = useState(queryAgentId || '')
  const [moduleContract, setModuleContract] = useState('')
  const [moduleTokenId, setModuleTokenId] = useState('')

  const { approvePlot, attachModule, isPending, isConfirming, isSuccess, error } = useAttachModule(address)
  const { ownedTokenIds } = useOwnedNFTs(address)
  const { data: agentOwner } = usePlotOwner(agentId ? BigInt(agentId) : undefined)
  const isOwner = address && agentOwner && address.toLowerCase() === agentOwner.toLowerCase()
  
  const [isApproved, setIsApproved] = useState(false)

  const handleAttach = () => {
    if (!address) {
      toast.error('Wallet Not Connected', 'Please connect your wallet first')
      return
    }

    if (!agentId || !moduleContract || !moduleTokenId) {
      toast.error('Missing Information', 'Please fill in all fields')
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
        `Approving module #${moduleTokenId} for transfer...`
      )

      approvePlot(
        moduleContract as `0x${string}`,
        contracts.plot.address,
        BigInt(moduleTokenId)
      )
    } else {
      // Step 2: Transfer via receiveChild
      toast.loading(
        'Attaching Module',
        `Attaching module #${moduleTokenId} to agent #${agentId}...`
      )

      attachModule(
        contracts.plot.address,
        BigInt(agentId),
        moduleContract as `0x${string}`,
        BigInt(moduleTokenId)
      )
    }
  }

  // Watch for approval success
  React.useEffect(() => {
    if (isSuccess && !isApproved) {
      setIsApproved(true)
      toast.success('Module Approved!', 'Now click Attach again to transfer')
    }
  }, [isSuccess, isApproved, toast])

  // Reset approval state when inputs change
  React.useEffect(() => {
    setIsApproved(false)
  }, [moduleContract, moduleTokenId, agentId])

  React.useEffect(() => {
    if (isSuccess && isApproved && agentId) {
      toast.success('Module Attached!', 'Your module has been attached to the agent')
      navigate(`/agent/${agentId}`)
    }
  }, [isSuccess, isApproved, toast, navigate, agentId])

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/modules/attach')}
          className="mb-4"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Back to Attach Module
        </Button>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-lg shadow-accent-500/20">
            <Link className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              Manual Module Attachment
            </h1>
            <p className="text-dark-400">
              Enter module contract details manually
            </p>
          </div>
        </div>
      </div>

      {/* Success State */}
      {isSuccess ? (
        <Card>
          <CardContent className="py-16 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Module Attached Successfully!
            </h2>
            <p className="text-dark-400 mb-6">
              Your module NFT has been transferred to your agent
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => navigate(`/agent/${agentId}`)}>
                View Agent
              </Button>
              <Button variant="secondary" onClick={() => {
                setAgentId('')
                setModuleContract('')
                setModuleTokenId('')
              }}>
                Attach Another Module
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Module Details</CardTitle>
            <CardDescription>
              Enter the contract address and token ID of the module NFT you want to attach
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Agent Selection */}
            <div className="space-y-3">
              <Label htmlFor="agentId">Agent (Plot) Token ID</Label>
              <Input
                id="agentId"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="1"
                type="number"
              />
              {ownedTokenIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-sm text-dark-400">Your agents:</span>
                  {ownedTokenIds.map((id) => (
                    <button
                      key={id.toString()}
                      onClick={() => setAgentId(id.toString())}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        agentId === id.toString()
                          ? 'bg-primary-500 text-white'
                          : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
                      }`}
                    >
                      #{id.toString()}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Module Contract */}
            <div className="space-y-3">
              <Label htmlFor="moduleContract">Module Contract Address</Label>
              <Input
                id="moduleContract"
                value={moduleContract}
                onChange={(e) => setModuleContract(e.target.value)}
                placeholder="0x..."
              />
              <p className="text-xs text-dark-400">
                The address of the deployed module contract (ERC-721)
              </p>
            </div>

            {/* Module Token ID */}
            <div className="space-y-3">
              <Label htmlFor="moduleTokenId">Module Token ID</Label>
              <Input
                id="moduleTokenId"
                value={moduleTokenId}
                onChange={(e) => setModuleTokenId(e.target.value)}
                placeholder="1"
                type="number"
              />
              <p className="text-xs text-dark-400">
                The token ID of the module NFT you want to attach
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                <strong>Error:</strong> {error.message}
              </div>
            )}

            {/* Action Button */}
            <Button
              onClick={handleAttach}
              disabled={isPending || isConfirming || !agentId || !moduleContract || !moduleTokenId || !isOwner}
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
              ) : !isOwner && agentId ? (
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

            {/* Info Box */}
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                <Info className="w-4 h-4" />
                How to find module contract address
              </h3>
              <ul className="text-sm text-dark-400 space-y-1">
                <li>• Go to Snowtrace and find your module deployment transaction</li>
                <li>• Or check the "Create Module" page after deployment</li>
                <li>• The contract address will be shown after successful deployment</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
