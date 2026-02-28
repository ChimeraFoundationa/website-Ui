import React, { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { adapterABI } from '../../contracts/abis'
import { contracts } from '../../contracts/addresses'
import {
  Terminal,
  Zap,
  CheckCircle,
  XCircle,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { formatAVAX } from '../../utils/formatters'
import { toHex } from 'viem'

interface AgentExecuteTabProps {
  tokenId: bigint
  isOwner: boolean
}

export const AgentExecuteTab: React.FC<AgentExecuteTabProps> = ({
  tokenId,
  isOwner,
}) => {
  const toast = useToast()
  const [prompt, setPrompt] = useState<string>('')
  const [estimatedGas, setEstimatedGas] = useState<bigint | null>(null)

  const {
    writeContract,
    data: hash,
    isPending,
    error: writeError,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Estimate gas
  useEffect(() => {
    const estimateGas = async () => {
      if (!tokenId || !prompt) return

      try {
        setEstimatedGas(650000n) // Default estimate for execute
      } catch (error) {
        console.error('Failed to estimate gas:', error)
      }
    }

    estimateGas()
  }, [prompt, tokenId])

  const handleExecute = async () => {
    if (!prompt.trim()) {
      toast.error('Empty Prompt', 'Please enter a prompt')
      return
    }

    if (!isOwner) {
      toast.error('Not Authorized', 'Only the owner can execute this agent')
      return
    }

    try {
      toast.loading(
        'Executing Agent',
        'Submitting transaction to blockchain...'
      )

      // Convert prompt string to hex bytes
      const encoder = new TextEncoder()
      const bytes = encoder.encode(prompt)
      const hexPayload = toHex(bytes)

      console.log('=== Execute Agent ===')
      console.log('Agent ID (tokenId):', tokenId.toString())
      console.log('Adapter:', contracts.adapter.address)
      console.log('ExecutionRouter:', contracts.executionRouter.address)
      console.log('Payload (hex):', hexPayload)

      writeContract({
        address: contracts.adapter.address,
        abi: adapterABI,
        functionName: 'execute',
        args: [tokenId, hexPayload],
      })
    } catch (error) {
      console.error('Execution error:', error)
      toast.error('Execution Failed', 'An error occurred while executing')
    }
  }

  const handleClearPrompt = () => {
    setPrompt('')
  }

  const explorerUrl = 'https://testnet.snowtrace.io'

  return (
    <div className="p-6 space-y-6">
      {/* Warning if not owner */}
      {!isOwner && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-400">View Only Mode</p>
                <p className="text-sm text-amber-400/80 mt-1">
                  You are not the owner of this agent. Execution is disabled.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompt Input */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary-400" />
              Agent Prompt
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearPrompt}
              disabled={!prompt}
            >
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-40 bg-dark-900 border border-dark-700 rounded-lg p-4 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            placeholder="Enter your prompt for the agent..."
          />
          <div className="mt-3 flex items-center justify-between">
            <Badge variant={prompt.trim() ? 'success' : 'default'}>
              {prompt.trim() ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ready to Execute
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Enter a Prompt
                </>
              )}
            </Badge>
            {estimatedGas && (
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Zap className="w-4 h-4" />
                Est. Gas: {estimatedGas.toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gas Estimate */}
      {estimatedGas && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Gas Estimate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-dark-900 rounded-lg">
                <p className="text-sm text-dark-400 mb-1">Estimated Gas</p>
                <p className="text-lg font-mono text-white">
                  {estimatedGas.toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-dark-900 rounded-lg">
                <p className="text-sm text-dark-400 mb-1">Est. Cost @ 25 Gwei</p>
                <p className="text-lg font-mono text-white">
                  {formatAVAX(estimatedGas * 25_000_000_000n, 6)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Execute Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleExecute}
          disabled={!isOwner || !prompt.trim() || isPending || isConfirming}
          isLoading={isPending || isConfirming}
          size="lg"
          className="flex-1"
          leftIcon={<Terminal className="w-4 h-4" />}
        >
          {isConfirming ? 'Confirming...' : isPending ? 'Submitting...' : 'Execute Agent'}
        </Button>
      </div>

      {/* Transaction Status */}
      {(hash || writeError) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {isSuccess ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : writeError ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <Loader2 className="w-4 h-4 text-primary-400 animate-spin" />
              )}
              Transaction Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {hash && (
              <div>
                <p className="text-sm text-dark-400 mb-1">Transaction Hash</p>
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono text-white">
                    {hash.slice(0, 10)}...{hash.slice(-8)}
                  </code>
                  <a
                    href={`${explorerUrl}/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark-500 hover:text-primary-400 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {isSuccess && receipt && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-emerald-400 font-medium">Execution Successful!</p>
                <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-dark-400">Block:</span>
                    <span className="ml-2 text-white font-mono">
                      {receipt.blockNumber.toString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-dark-400">Gas Used:</span>
                    <span className="ml-2 text-white font-mono">
                      {receipt.gasUsed.toString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {writeError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 font-medium">Execution Failed</p>
                <p className="text-sm text-red-400/80 mt-1">
                  {writeError.message}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
