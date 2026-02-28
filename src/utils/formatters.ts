import type { Address } from 'viem'
import { hexToString, isHex } from 'viem'

/**
 * Format an Ethereum address with ellipsis
 */
export function formatAddress(address: Address, length: number = 4): string {
  if (!address) return ''
  return `${address.slice(0, 2 + length)}...${address.slice(-length)}`
}

/**
 * Format a full address for display
 */
export function formatFullAddress(address: Address): string {
  return address
}

/**
 * Format gas price from wei to Gwei
 */
export function formatGasPrice(wei: bigint | number): string {
  const gwei = typeof wei === 'bigint' ? Number(wei) / 1e9 : wei / 1e9
  if (gwei >= 1000) {
    return `${(gwei / 1000).toFixed(2)}k Gwei`
  }
  return `${gwei.toFixed(2)} Gwei`
}

/**
 * Format AVAX amount
 */
export function formatAVAX(wei: bigint | number, decimals: number = 4): string {
  const avax = typeof wei === 'bigint' ? Number(wei) / 1e18 : wei / 1e18
  return `${avax.toFixed(decimals)} AVAX`
}

/**
 * Format token ID for display
 */
export function formatTokenId(id: bigint | number | string): string {
  return id.toString()
}

/**
 * Format timestamp to relative time
 */
export function formatRelativeTime(timestamp: bigint | number): string {
  const now = Date.now() / 1000
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp
  const diff = now - ts

  if (diff < 0) return 'in the future'
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return `${Math.floor(diff / 604800)}w ago`
}

/**
 * Format timestamp to readable date
 */
export function formatDateTime(timestamp: bigint | number): string {
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) * 1000 : timestamp
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format bytes32 to readable string
 */
export function formatBytes32(bytes32: string): string {
  // Try to decode as UTF-8 using viem
  try {
    if (isHex(bytes32)) {
      const str = hexToString(bytes32 as `0x${string}`).replace(/\0/g, '')
      if (str) return str
    }
  } catch {
    // Ignore decoding errors
  }
  
  // Return truncated hex
  return `${bytes32.slice(0, 10)}...${bytes32.slice(-8)}`
}

/**
 * Format module type from bytes32
 */
export function formatModuleType(bytes32: string): string {
  try {
    if (isHex(bytes32)) {
      const str = hexToString(bytes32 as `0x${string}`).replace(/\0/g, '')
      if (str) return str
    }
  } catch {
    // Ignore decoding errors
  }
  
  // Common module types
  const typeMap: Record<string, string> = {
    '0x4d454d4f52595f4d4f44554c4500000000000000000000000000000000000000': 'MEMORY_MODULE',
    '0x544f4f4c5f4d4f44554c45000000000000000000000000000000000000000000': 'TOOL_MODULE',
    '0x504f4c4943595f4d4f44554c4500000000000000000000000000000000000000': 'POLICY_MODULE',
    '0x455845435554494f4e5f4d4f44554c4500000000000000000000000000000000': 'EXECUTION_MODULE',
    '0x4245484156494f525f4d4f44554c450000000000000000000000000000000000': 'BEHAVIOR_MODULE',
  }
  
  return typeMap[bytes32] || formatBytes32(bytes32)
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Calculate percentage
 */
export function formatPercentage(value: number, total: number): string {
  if (total === 0) return '0%'
  return `${((value / total) * 100).toFixed(2)}%`
}
