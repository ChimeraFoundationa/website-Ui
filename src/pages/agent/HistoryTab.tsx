import React, { useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { avalancheFuji } from 'viem/chains'
import { Card, CardContent } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { CodeBlock } from '../../components/ui/CodeBlock'
import { Button } from '../../components/ui/Button'
import { contracts } from '../../contracts/addresses'
import type { ExecutionHistoryEntry } from '../../types'
import {
  History,
  RefreshCw,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  FileText,
} from 'lucide-react'
import { formatDateTime } from '../../utils/formatters'

interface AgentHistoryTabProps {
  tokenId: bigint
}

export const AgentHistoryTab: React.FC<AgentHistoryTabProps> = ({ tokenId }) => {
  const [history, setHistory] = React.useState<ExecutionHistoryEntry[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchExecutionHistory = async () => {
    setIsLoading(true)
    setError(null)

    const startTime = Date.now()

    try {
      const publicClient = createPublicClient({
        chain: avalancheFuji,
        transport: http(),
      })

      const currentBlock = await publicClient.getBlockNumber()
      const deploymentBlock = 52248714n // Block when contracts were deployed (March 2026)
      const startBlock = deploymentBlock

      const allEvents: any[] = []

      // Fetch ExecutionRecorded events from ExecutionRouter
      let toBlock = currentBlock
      let chunkCount = 0
      const MAX_BLOCKS_PER_REQUEST = 2048n

      // ExecutionRecorded event signature hash
      // ExecutionRecorded(uint256 indexed plotId, address indexed caller, bytes input, bytes result, uint256 indexed timestamp, bool success)
      const EXECUTION_RECORDED_TOPIC = '0xfe2491b9a6d753b6660b3a308976e16b87e54b6e56e540a31ff3b3a0faa01f97'

      while (toBlock >= startBlock) {
        chunkCount++
        const fromBlockChunk = toBlock > MAX_BLOCKS_PER_REQUEST - 1n ? toBlock - MAX_BLOCKS_PER_REQUEST + 1n : 0n
        const actualFromBlock = fromBlockChunk < startBlock ? startBlock : fromBlockChunk

        try {
          // Fetch ExecutionRecorded events with topic filter
          const events = await publicClient.getLogs({
            address: contracts.executionRouter.address,
            fromBlock: actualFromBlock,
            toBlock: toBlock,
            topics: [
              EXECUTION_RECORDED_TOPIC,
              `0x${tokenId.toString(16).padStart(64, '0')}`, // plotId (indexed)
            ] as any,
          })

          allEvents.push(...events)
        } catch (err) {
          console.error(`Error fetching chunk ${chunkCount}:`, err)
        }

        if (actualFromBlock <= startBlock) break
        toBlock = actualFromBlock - 1n

        if (chunkCount > 50) {
          console.warn('Too many chunks, stopping')
          break
        }
      }

      const elapsed = Date.now() - startTime
      console.log(`[HistoryTab] Fetched ${allEvents.length} events in ${elapsed}ms for TokenId: ${tokenId}`)
      console.log(`[HistoryTab] Using topic filter: 0x${tokenId.toString(16).padStart(64, '0')}`)

      // Parse events and remove duplicates
      if (allEvents.length > 0) {
        // Additional filter: verify plotId matches tokenId
        const targetTopic = `0x${tokenId.toString(16).padStart(64, '0')}`
        const filteredEvents = allEvents.filter(event => {
          const eventPlotId = event.topics[1]
          return eventPlotId === targetTopic
        })

        console.log(`[HistoryTab] After plotId filter: ${allEvents.length} -> ${filteredEvents.length} events`)

        // Remove duplicate events by txHash
        const uniqueEventsMap = new Map<string, any>()
        filteredEvents.forEach(event => {
          const txHash = event.transactionHash
          if (!uniqueEventsMap.has(txHash)) {
            uniqueEventsMap.set(txHash, event)
          }
        })

        const uniqueEvents = Array.from(uniqueEventsMap.values())
        console.log(`[HistoryTab] Removed duplicates: ${filteredEvents.length} -> ${uniqueEvents.length} unique events`)

        const historyEntries: ExecutionHistoryEntry[] = uniqueEvents.map((event) => {
          try {
            const input = event.data || '0x'
            
            return {
              blockNumber: event.blockNumber || 0n,
              timestamp: BigInt(Math.floor(Date.now() / 1000)),
              gasUsed: 0n,
              txHash: event.transactionHash,
              success: true,
              input,
              result: '0x',
            }
          } catch (err) {
            console.error('Error parsing event:', err)
            return null
          }
        }).filter((e): e is ExecutionHistoryEntry => e !== null)

        // Fetch timestamps and gas
        const historyWithDetails = await Promise.all(
          historyEntries.map(async (entry) => {
            try {
              const [block, receipt] = await Promise.all([
                publicClient.getBlock({ blockNumber: entry.blockNumber }),
                publicClient.getTransactionReceipt({ hash: entry.txHash as `0x${string}` }),
              ])
              return {
                ...entry,
                timestamp: BigInt(block.timestamp),
                gasUsed: receipt.gasUsed || 0n,
              }
            } catch {
              return { ...entry, timestamp: BigInt(Math.floor(Date.now() / 1000)), gasUsed: 0n }
            }
          })
        )

        // Sort by block (most recent first)
        const sorted = historyWithDetails.sort((a, b) =>
          b.blockNumber > a.blockNumber ? 1 : b.blockNumber < a.blockNumber ? -1 : 0
        )

        setHistory(sorted)
      } else {
        setHistory([])
      }
    } catch (err) {
      console.error('Failed to fetch execution history:', err)
      setError(`Failed to load execution history: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchExecutionHistory()
  }, [tokenId])

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center py-16">
        <RefreshCw className="w-8 h-8 text-dark-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-dark-400" />
          <span className="text-dark-400">
            {history.length} execution{history.length !== 1 ? 's' : ''} found
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchExecutionHistory}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* History List */}
      {history.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Clock className="w-12 h-12 text-dark-600 mx-auto mb-4" />
            <p className="text-dark-400">No execution history found</p>
            <p className="text-sm text-dark-500 mt-1">
              Executions will appear here after the agent is executed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((entry, index) => (
            <ExecutionHistoryItem
              key={`${entry.txHash}-${index}`}
              entry={entry}
              explorerUrl={'https://testnet.snowtrace.io'}
            />
          ))}
        </div>
      )}

      {error && (
        <Card className="border-red-500/30">
          <CardContent className="py-4">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface ExecutionHistoryItemProps {
  entry: ExecutionHistoryEntry
  explorerUrl: string
}

const ExecutionHistoryItem: React.FC<ExecutionHistoryItemProps> = ({
  entry,
  explorerUrl,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  return (
    <Card className="overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-dark-800/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                entry.success
                  ? 'bg-emerald-500/10'
                  : 'bg-red-500/10'
              }`}
            >
              {entry.success ? (
                <CheckCircle className="w-5 h-5 text-emerald-400" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">
                  Block #{entry.blockNumber.toString()}
                </span>
                <Badge variant={entry.success ? 'success' : 'error'} size="sm">
                  {entry.success ? 'Success' : 'Failed'}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-dark-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDateTime(entry.timestamp)}
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {entry.gasUsed > 0n ? entry.gasUsed.toString() : '~650k'} gas
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`${explorerUrl}/tx/${entry.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-dark-500 hover:text-primary-400 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-dark-700 px-4 pb-4 space-y-4">
          <div>
            <p className="text-sm text-dark-400 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Input
            </p>
            <CodeBlock code={entry.input} language="bytes" maxLines={5} />
          </div>
          <div>
            <p className="text-sm text-dark-400 mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Result
            </p>
            <CodeBlock code={entry.result} language="bytes" maxLines={5} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700">
            <div>
              <p className="text-sm text-dark-400 mb-1">Transaction</p>
              <p className="font-mono text-sm text-white">
                {entry.txHash.slice(0, 10)}...{entry.txHash.slice(-8)}
              </p>
            </div>
            <div>
              <p className="text-sm text-dark-400 mb-1">Block</p>
              <p className="font-mono text-sm text-white">
                {entry.blockNumber.toString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
