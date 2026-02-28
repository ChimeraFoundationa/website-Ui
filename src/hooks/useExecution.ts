import { useEffect, useState } from 'react'
import { createPublicClient, http } from 'viem'
import { avalancheFuji } from 'viem/chains'
import type { Address } from 'viem'
import type { ExecutionRecord } from '../types'
import { contracts } from '../contracts/addresses'

/**
 * Hook to fetch execution count from ExecutionRouter events
 */
export function useExecutionHistoryLength(tokenId: bigint | undefined) {
  const [data, setData] = useState<bigint | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!tokenId) {
      setData(undefined)
      return
    }

    const fetchExecutionCount = async () => {
      setIsLoading(true)
      setError(null)

      const startTime = Date.now()

      try {
        const publicClient = createPublicClient({
          chain: avalancheFuji,
          transport: http(),
        })

        const currentBlock = await publicClient.getBlockNumber()
        const deploymentBlock = 52254142n // March 2026 deployment (DeployFuji.s.sol)
        const startBlock = deploymentBlock

        let count = 0n
        let toBlock = currentBlock
        let chunkCount = 0
        const MAX_BLOCKS_PER_REQUEST = 2048n

        // Track unique transaction hashes to avoid counting duplicates
        const uniqueTxHashes = new Set<string>()

        // ExecutionRecorded event signature hash
        // ExecutionRecorded(uint256 indexed plotId, address indexed caller, bytes input, bytes result, uint256 indexed timestamp, bool success)
        // Signature: keccak256("ExecutionRecorded(uint256,address,bytes,bytes,uint256,bool)")
        const EXECUTION_RECORDED_TOPIC = '0xfe2491b9a6d753b6660b3a308976e16b87e54b6e56e540a31ff3b3a0faa01f97'

        while (toBlock >= startBlock) {
          chunkCount++
          const fromBlockChunk = toBlock > MAX_BLOCKS_PER_REQUEST - 1n ? toBlock - MAX_BLOCKS_PER_REQUEST + 1n : 0n
          const actualFromBlock = fromBlockChunk < startBlock ? startBlock : fromBlockChunk

          try {
            // Fetch ExecutionRecorded events from ExecutionRouter
            const events = await publicClient.getLogs({
              address: contracts.executionRouter.address,
              fromBlock: actualFromBlock,
              toBlock: toBlock,
              topics: [
                EXECUTION_RECORDED_TOPIC,
                `0x${tokenId.toString(16).padStart(64, '0')}`, // plotId (indexed)
              ] as any, // Type assertion
            })

            // Count only unique transactions
            events.forEach(event => {
              const txHash = event.transactionHash
              if (txHash && !uniqueTxHashes.has(txHash)) {
                uniqueTxHashes.add(txHash)
                count += 1n
                console.log(`[useExecutionHistoryLength] Chunk ${chunkCount}: Found unique event, txHash: ${txHash?.slice(0, 10)}...`)
              }
            })
          } catch (err) {
            console.error('Error fetching chunk:', err)
          }

          if (actualFromBlock <= startBlock) break
          toBlock = actualFromBlock - 1n

          if (chunkCount > 50) {
            console.warn('Too many chunks, stopping')
            break
          }
        }

        const elapsed = Date.now() - startTime
        console.log(`[useExecutionHistoryLength] TokenId: ${tokenId}, Unique Count: ${count}, Current Block: ${currentBlock}, Chunks: ${chunkCount}`)
        setData(count)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
        setData(0n)
      } finally {
        setIsLoading(false)
      }
    }

    fetchExecutionCount()
  }, [tokenId])

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      setData(undefined)
    },
  }
}

/**
 * Hook to get the last execution record from ExecutionRouter events
 */
export function useLastExecutionRecord(tokenId: bigint | undefined) {
  const [data, setData] = useState<ExecutionRecord | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!tokenId) {
      setData(undefined)
      return
    }

    const fetchLastExecution = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const publicClient = createPublicClient({
          chain: avalancheFuji,
          transport: http(),
        })

        const currentBlock = await publicClient.getBlockNumber()
        const deploymentBlock = 52254142n // March 2026 deployment block
        const startBlock = deploymentBlock

        let lastEvent: any = null
        let toBlock = currentBlock
        let chunkCount = 0
        const MAX_BLOCKS_PER_REQUEST = 2048n

        // ExecutionRecorded event signature hash
        // ExecutionRecorded(uint256 indexed plotId, address indexed caller, bytes input, bytes result, uint256 indexed timestamp, bool success)
        const EXECUTION_RECORDED_TOPIC = '0xfe2491b9a6d753b6660b3a308976e16b87e54b6e56e540a31ff3b3a0faa01f97'

        // Fetch from most recent block backwards to find the last execution
        while (toBlock >= startBlock) {
          chunkCount++
          const fromBlockChunk = toBlock > MAX_BLOCKS_PER_REQUEST - 1n ? toBlock - MAX_BLOCKS_PER_REQUEST + 1n : 0n
          const actualFromBlock = fromBlockChunk < startBlock ? startBlock : fromBlockChunk

          try {
            // Fetch ExecutionRecorded events from ExecutionRouter
            const events = await publicClient.getLogs({
              address: contracts.executionRouter.address,
              fromBlock: actualFromBlock,
              toBlock: toBlock,
              topics: [
                EXECUTION_RECORDED_TOPIC,
                `0x${tokenId.toString(16).padStart(64, '0')}`, // plotId (indexed)
              ] as any, // Type assertion
            })

            if (events.length > 0) {
              // Get the most recent event (last in the chunk)
              lastEvent = events[events.length - 1]
              break
            }
          } catch (err) {
            console.error('Error fetching chunk:', err)
          }

          if (actualFromBlock <= startBlock) break
          toBlock = actualFromBlock - 1n

          if (chunkCount > 10) {
            // Limit chunks for last execution fetch
            console.warn('Too many chunks, stopping')
            break
          }
        }

        if (lastEvent) {
          // Additional verification: check if plotId matches
          const targetTopic = `0x${tokenId.toString(16).padStart(64, '0')}`
          const eventPlotId = lastEvent.topics[1]
          
          console.log(`[useLastExecutionRecord] TokenId: ${tokenId}`)
          console.log(`[useLastExecutionRecord] Expected topic: ${targetTopic}`)
          console.log(`[useLastExecutionRecord] Event topic[1]: ${eventPlotId}`)
          console.log(`[useLastExecutionRecord] Match: ${eventPlotId === targetTopic}`)
          
          if (eventPlotId !== targetTopic) {
            console.warn('[useLastExecutionRecord] PlotId mismatch, ignoring event')
            setData(undefined)
            return
          }
          
          const [block, receipt] = await Promise.all([
            publicClient.getBlock({ blockNumber: lastEvent.blockNumber }),
            publicClient.getTransactionReceipt({ hash: lastEvent.transactionHash }),
          ])

          // Decode event data (input, result, timestamp, success are in data)
          // For now, use basic info
          setData({
            plotId: tokenId,
            caller: lastEvent.topics[2] as Address,
            input: lastEvent.data || '0x',
            result: '0x',
            timestamp: BigInt(block.timestamp),
            success: true,
          })
        } else {
          console.log(`[useLastExecutionRecord] TokenId: ${tokenId}, No execution found`)
          setData(undefined)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchLastExecution()
  }, [tokenId])

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      setData(undefined)
    },
  }
}
