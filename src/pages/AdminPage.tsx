import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { useWallet } from '../hooks/useWallet'
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { agentUsernameRegistryABI } from '../contracts/abis'
import { contracts } from '../contracts/addresses'
import { ArrowLeft, Shield, CheckCircle2, XCircle, UserPlus, Loader2, Search, ExternalLink, UserCheck } from 'lucide-react'

export const AdminPage: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useWallet()
  const toast = useToast()

  // State for search username
  const [searchUsername, setSearchUsername] = useState('')

  // State for add admin
  const [adminToAdd, setAdminToAdd] = useState('')

  // Check if user is admin
  const { data: isAdmin, isLoading: checkingAdmin } = useReadContract({
    address: contracts.agentUsernameRegistry.address,
    abi: agentUsernameRegistryABI,
    functionName: 'admins',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  })

  // Search username info
  const { data: usernameAddress, refetch: refetchAddress } = useReadContract({
    address: contracts.agentUsernameRegistry.address,
    abi: agentUsernameRegistryABI,
    functionName: 'getAddress',
    args: searchUsername ? [searchUsername] : undefined,
    query: {
      enabled: false, // Manual trigger
    },
  })

  const { data: isVerified, refetch: refetchVerified } = useReadContract({
    address: contracts.agentUsernameRegistry.address,
    abi: agentUsernameRegistryABI,
    functionName: 'isVerified',
    args: searchUsername && usernameAddress && usernameAddress !== '0x0000000000000000000000000000000000000000' ? [searchUsername] : undefined,
    query: {
      enabled: false, // Manual trigger
    },
  })

  // Verify username functions
  const { writeContract: verifyUser, isPending: isVerifying } = useWriteContract()
  const { isLoading: isVerifyConfirming, isSuccess: verifySuccess } = useWaitForTransactionReceipt()

  // Unverify username functions
  const { writeContract: unverifyUser, isPending: isUnverifying } = useWriteContract()
  const { isLoading: isUnverifyConfirming, isSuccess: unverifySuccess } = useWaitForTransactionReceipt()

  // Add admin functions
  const { writeContract: addAdminFunc, isPending: isAddingAdmin } = useWriteContract()
  const { isLoading: isAddAdminConfirming, isSuccess: addAdminSuccess } = useWaitForTransactionReceipt()

  // Search for username
  const handleSearch = () => {
    if (!searchUsername) {
      toast.error('Invalid', 'Please enter a username')
      return
    }
    refetchAddress()
    setTimeout(() => refetchVerified(), 100)
  }

  const handleVerify = () => {
    if (!searchUsername) {
      toast.error('Invalid', 'Please enter a username')
      return
    }

    if (!usernameAddress || usernameAddress === '0x0000000000000000000000000000000000000000') {
      toast.error('Not Found', 'Username does not exist')
      return
    }

    if (isVerified) {
      toast.info('Already Verified', 'This username is already verified')
      return
    }

    toast.loading('Verifying', `Verifying @${searchUsername}...`)

    verifyUser({
      address: contracts.agentUsernameRegistry.address,
      abi: agentUsernameRegistryABI,
      functionName: 'verifyUsername',
      args: [searchUsername],
    })
  }

  const handleUnverify = () => {
    if (!searchUsername) {
      toast.error('Invalid', 'Please enter a username')
      return
    }

    if (!isVerified) {
      toast.info('Not Verified', 'This username is not verified')
      return
    }

    toast.loading('Unverifying', `Removing verification from @${searchUsername}...`)

    unverifyUser({
      address: contracts.agentUsernameRegistry.address,
      abi: agentUsernameRegistryABI,
      functionName: 'unverifyUsername',
      args: [searchUsername],
    })
  }

  const handleAddAdmin = () => {
    if (!adminToAdd || !adminToAdd.startsWith('0x')) {
      toast.error('Invalid Address', 'Please enter a valid address')
      return
    }

    toast.loading('Adding Admin', `Adding ${adminToAdd} as admin...`)

    addAdminFunc({
      address: contracts.agentUsernameRegistry.address,
      abi: agentUsernameRegistryABI,
      functionName: 'addAdmin',
      args: [adminToAdd as `0x${string}`],
    })
  }

  React.useEffect(() => {
    if (verifySuccess) {
      toast.success('Verified!', `@${searchUsername} is now verified`)
      setTimeout(() => {
        refetchVerified()
      }, 1000)
    }
  }, [verifySuccess, searchUsername, toast, refetchVerified])

  React.useEffect(() => {
    if (unverifySuccess) {
      toast.success('Unverified!', `@${searchUsername} verification removed`)
      setTimeout(() => {
        refetchVerified()
      }, 1000)
    }
  }, [unverifySuccess, searchUsername, toast, refetchVerified])

  React.useEffect(() => {
    if (addAdminSuccess) {
      toast.success('Admin Added!', `${adminToAdd} is now an admin`)
      setAdminToAdd('')
    }
  }, [addAdminSuccess, adminToAdd, toast])

  // Not connected
  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Marketplace
        </Button>
        <Card className="py-16">
          <CardContent className="text-center">
            <Shield className="w-16 h-16 text-dark-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">Connect Wallet</h2>
            <p className="text-dark-400">Please connect your wallet to access admin panel</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Checking admin status
  if (checkingAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
        </div>
      </div>
    )
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6" leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Marketplace
        </Button>
        <Card className="py-16 border-red-500/30">
          <CardContent className="text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">Access Denied</h2>
            <p className="text-dark-400 mb-4">Your wallet is not authorized to access admin panel</p>
            <p className="text-sm text-dark-500">Contact the contract owner to be added as admin</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const usernameFound = usernameAddress && usernameAddress !== '0x0000000000000000000000000000000000000000'

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6" leftIcon={<ArrowLeft className="w-4 h-4" />}>
        Back to Marketplace
      </Button>

      {/* Header */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Admin Panel</CardTitle>
                <p className="text-sm text-dark-400">Manage verified users and admins</p>
              </div>
            </div>
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Admin Access
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {/* Search & Verify Username */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-400" />
              Verify Username
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="search" className="text-xs">Search Username</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  id="search"
                  value={searchUsername}
                  onChange={(e) => setSearchUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="username"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} size="sm" leftIcon={<Search className="w-4 h-4" />}>
                  Search
                </Button>
              </div>
            </div>

            {/* Search Results */}
            {(usernameAddress !== undefined || isVerified !== undefined) && (
              <div className="p-4 bg-dark-900 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">Username:</span>
                  <span className="text-white font-medium">@{searchUsername}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dark-400">Registered:</span>
                  {usernameFound ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Yes
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <XCircle className="w-4 h-4" /> No
                    </span>
                  )}
                </div>
                {usernameFound && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-400">Owner:</span>
                      <span className="text-white font-mono text-xs">
                        {usernameAddress?.slice(0, 10)}...{usernameAddress?.slice(-8)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-dark-400">Verified:</span>
                      {isVerified ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="default" className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Not Verified
                        </Badge>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {usernameFound && (
              <div className="flex gap-2">
                {!isVerified ? (
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying || isVerifyConfirming}
                    className="flex-1"
                    variant="primary"
                    leftIcon={isVerifying || isVerifyConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  >
                    {isVerifyConfirming ? 'Confirming...' : isVerifying ? 'Verifying...' : 'Verify Username'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleUnverify}
                    disabled={isUnverifying || isUnverifyConfirming}
                    className="flex-1"
                    variant="outline"
                    leftIcon={isUnverifying || isUnverifyConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                  >
                    {isUnverifyConfirming ? 'Confirming...' : isUnverifying ? 'Unverifying...' : 'Unverify Username'}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Admin */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-400" />
              Add Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin" className="text-xs">Admin Address</Label>
              <Input
                id="admin"
                value={adminToAdd}
                onChange={(e) => setAdminToAdd(e.target.value)}
                placeholder="0x..."
                disabled={isAddingAdmin || isAddAdminConfirming}
              />
              <p className="text-xs text-dark-500 mt-1">
                Enter the wallet address to add as admin
              </p>
            </div>

            <Button
              onClick={handleAddAdmin}
              disabled={isAddingAdmin || isAddAdminConfirming || !adminToAdd}
              className="w-full"
              variant="accent"
            >
              {isAddAdminConfirming ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Confirming...</>
              ) : isAddingAdmin ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
              ) : (
                'Add Admin'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Contract Info */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-dark-500">
        <span>Contract:</span>
        <code className="bg-dark-900 px-2 py-1 rounded">
          {contracts.agentUsernameRegistry.address.slice(0, 10)}...{contracts.agentUsernameRegistry.address.slice(-8)}
        </code>
        <a
          href={`${'https://testnet.snowtrace.io'}/address/${contracts.agentUsernameRegistry.address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-400 hover:text-primary-300"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
