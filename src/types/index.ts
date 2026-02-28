import type { Address } from 'viem'

export interface ModuleInfo {
  moduleType: string
  capability: string
  moduleContract: Address
  moduleTokenId: bigint
}

export interface AgentContext {
  plotId: bigint
  modules: ModuleInfo[]
  moduleTypes: string[]
  capabilities: string[]
  moduleContracts: Address[]
  moduleTokenIds: bigint[]
}

export interface ExecutionRecord {
  plotId: bigint
  caller: Address
  input: string
  result: string
  timestamp: bigint
  success: boolean
}

export interface AgentCard {
  tokenId: bigint
  owner: Address
  executionCount: bigint
  avgGasUsed: bigint
  lastExecutionTime: bigint
  status: 'active' | 'idle'
}

export interface ExecutePayload {
  version?: number
  intentType?: 'DIRECT' | 'TOOL_CALL'
  toolId?: string | null
  parameters?: Record<string, unknown>
  expectedOutcome?: string
  reasoning?: string
  timestamp?: number
}

export interface ExecutionHistoryEntry {
  blockNumber: bigint
  timestamp: bigint
  gasUsed: bigint
  txHash: string
  success: boolean
  input: string
  result: string
}

export type TabType = 'overview' | 'context' | 'execute' | 'history'
