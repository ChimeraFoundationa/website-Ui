import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { Button } from '../ui/Button'
import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { avalancheFuji } from 'wagmi/chains'
import { config } from '../../wagmi'
import type { EIP1193Provider } from 'viem'
import { useReadContract } from 'wagmi'
import { agentUsernameRegistryABI } from '../../contracts/abis'
import { contracts } from '../../contracts/addresses'
import {
  Cpu,
  Wallet,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Zap,
  Shield,
  Link as LinkIcon,
  Layers,
  User,
} from 'lucide-react'
import { formatAddress } from '../../utils/formatters'
import { useToast } from '../ui/Toast'

declare global {
  interface Window {
    avalanche?: EIP1193Provider
  }
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const account = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const location = useLocation()
  const toast = useToast()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const chainId = account.chainId
  const isConnected = account.isConnected && chainId === avalancheFuji.id
  const isWrongChain = account.isConnected && chainId !== avalancheFuji.id
  
  // Check if user is admin
  const { data: isAdmin } = useReadContract({
    address: contracts.agentUsernameRegistry.address,
    abi: agentUsernameRegistryABI,
    functionName: 'admins',
    args: account.address ? [account.address] : undefined,
    query: {
      enabled: !!account.address && isConnected,
    },
  })

  const handleConnect = async () => {
    try {
      // Try Core wallet first
      if (typeof window !== 'undefined' && window.avalanche) {
        const accounts = await window.avalanche.request({ method: 'eth_requestAccounts' })
        if (accounts && accounts.length > 0) {
          toast.success('Wallet Connected', 'Core wallet connected successfully')
          return
        }
      }
      // Fallback to wagmi connect
      connect({ connector: config.connectors[0] })
    } catch (error) {
      toast.error('Connection Failed', 'Failed to connect wallet')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    toast.info('Wallet Disconnected')
  }

  const handleSwitchNetwork = async () => {
    if (typeof window !== 'undefined' && window.avalanche) {
      try {
        await window.avalanche.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0xA869' }], // 43113 in hex
        })
      } catch (error) {
        // If network doesn't exist, add it
        if ((error as { code?: number })?.code === 4902 && window.avalanche) {
          await window.avalanche.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xA869',
              chainName: 'Avalanche Fuji Testnet',
              nativeCurrency: {
                name: 'AVAX',
                symbol: 'AVAX',
                decimals: 18,
              },
              rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
              blockExplorerUrls: ['https://testnet.snowtrace.io'],
            }],
          })
        }
      }
    }
  }

  const navItems = [
    { path: '/', label: 'Home', icon: <User className="w-4 h-4" /> },
    { path: '/marketplace', label: 'Agents', icon: <Cpu className="w-4 h-4" /> },
    { path: '/modules', label: 'Marketplace', icon: <Layers className="w-4 h-4" /> },
    { path: '/username', label: 'Username', icon: <User className="w-4 h-4" /> },
    { path: '/modules/create', label: 'Create Module', icon: <Zap className="w-4 h-4" /> },
    { path: '/modules/attach', label: 'Attach Module', icon: <LinkIcon className="w-4 h-4" /> },
  ]
  
  // Add admin link if user is admin
  if (isAdmin) {
    navItems.push({
      path: '/admin',
      label: 'Admin',
      icon: <Shield className="w-4 h-4 text-blue-400" />,
    })
  }

  return (
    <div className="min-h-screen bg-dark-950 text-dark-100">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-950/20 via-dark-950 to-accent-950/20 pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-dark-800 bg-dark-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <Cpu className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
                  AVBLOX
                </h1>
                <p className="text-xs text-dark-500">Marketplace</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    location.pathname === item.path
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Chain indicator */}
              {isConnected && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-dark-300">Fuji</span>
                </div>
              )}

              {/* Connect/Disconnect button */}
              {account.isConnected ? (
                <div className="flex items-center gap-2">
                  {isWrongChain ? (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={handleSwitchNetwork}
                      className="bg-amber-600 hover:bg-amber-700"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Switch to Fuji
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleDisconnect}
                        className="hidden sm:flex"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                      <Button variant="outline" size="sm" className="font-mono">
                        <Wallet className="w-4 h-4 mr-2" />
                        {formatAddress(account.address!)}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <Button onClick={handleConnect} size="sm">
                  <Shield className="w-4 h-4 mr-2" />
                  Connect Core Wallet
                </Button>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-dark-800 bg-dark-900">
            <nav className="px-4 py-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                    location.pathname === item.path
                      ? 'bg-primary-500/10 text-primary-400'
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {isConnected && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={handleDisconnect}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                  Disconnect
                </Button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-dark-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-dark-400">
                AVBLOX Marketplace © 2026
              </span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://testnet.snowtrace.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-dark-400 hover:text-primary-400 transition-colors"
              >
                Snowtrace
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://github.com/avblox"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-dark-400 hover:text-primary-400 transition-colors"
              >
                GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
