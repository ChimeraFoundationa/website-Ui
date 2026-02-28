import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Badge } from '../components/ui/Badge'
import { useToast } from '../components/ui/Toast'
import { useWallet } from '../hooks/useWallet'
import { useUsername, useRegisterUsername, useIsUsernameRegistered } from '../hooks/useUsernameRegistry'
import { ArrowLeft, User, CheckCircle, XCircle, Loader2, Search } from 'lucide-react'

export const RegisterUsernamePage: React.FC = () => {
  const navigate = useNavigate()
  const { address, isConnected } = useWallet()
  const toast = useToast()
  const [usernameInput, setUsernameInput] = useState('')
  
  const { username: currentUsername, refetch: refetchUsername } = useUsername(address)
  const { register, isPending, isConfirming, isSuccess } = useRegisterUsername()
  const { isRegistered: isUsernameTaken, isLoading: checkingAvailability } = useIsUsernameRegistered(usernameInput)

  const handleSubmit = () => {
    if (!isConnected) {
      toast.error('Wallet Not Connected', 'Please connect your wallet first')
      return
    }

    if (usernameInput.length < 3) {
      toast.error('Invalid Username', 'Username must be at least 3 characters')
      return
    }

    if (isUsernameTaken) {
      toast.error('Username Taken', 'This username is already registered')
      return
    }

    toast.loading('Registering Username', `Registering @${usernameInput}...`)
    register(usernameInput)
  }

  React.useEffect(() => {
    if (isSuccess) {
      // Refetch username to update UI
      refetchUsername()
      toast.success('Username Registered!', `@${usernameInput} has been registered`)
      
      // Navigate to home after delay
      setTimeout(() => {
        navigate('/')
      }, 2000)
    }
  }, [isSuccess, usernameInput, toast, navigate, refetchUsername])

  const isValidUsername = usernameInput.length >= 3 && !isUsernameTaken && !checkingAvailability

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Back to Marketplace
      </Button>

      <Card>
        <CardHeader className="pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Register Username</CardTitle>
          <p className="text-dark-400 mt-2">
            Get a unique username for your agent address
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {!isConnected ? (
            <div className="text-center py-8">
              <p className="text-dark-400 mb-4">Please connect your wallet to register a username</p>
            </div>
          ) : currentUsername ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                You already have a username!
              </h3>
              <p className="text-dark-400 mb-4">
                Your username: <span className="font-mono text-primary-400">@{currentUsername}</span>
              </p>
              <p className="text-sm text-dark-500">
                Each address can only have one username
              </p>
            </div>
          ) : (
            <>
              {/* Username Input */}
              <div>
                <Label htmlFor="username" className="text-base">Choose Your Username</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-dark-400">@</span>
                  <Input
                    id="username"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="yourname"
                    className="flex-1"
                    disabled={isPending || isConfirming}
                  />
                </div>
                <p className="text-xs text-dark-500 mt-2">
                  3-30 characters, lowercase letters, numbers, and underscores only
                </p>
              </div>

              {/* Availability Check */}
              {usernameInput.length > 0 && (
                <div className="p-4 bg-dark-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    {checkingAvailability ? (
                      <Loader2 className="w-5 h-5 text-dark-400 animate-spin" />
                    ) : isUsernameTaken ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : isValidUsername ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : null}
                    <span className={
                      checkingAvailability ? 'text-dark-400' :
                      isUsernameTaken ? 'text-red-400' :
                      isValidUsername ? 'text-emerald-400' :
                      'text-dark-400'
                    }>
                      {checkingAvailability ? 'Checking availability...' :
                       isUsernameTaken ? 'This username is already taken' :
                       isValidUsername ? 'This username is available!' :
                       'Username must be at least 3 characters'}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                onClick={handleSubmit}
                disabled={isPending || isConfirming || !isValidUsername}
                isLoading={isPending || isConfirming}
                size="lg"
                className="w-full"
                leftIcon={<User className="w-4 h-4" />}
              >
                {isConfirming ? 'Confirming...' : isPending ? 'Registering...' : 'Register Username'}
              </Button>

              {/* Info */}
              <div className="p-4 bg-dark-900 rounded-lg space-y-3">
                <h4 className="font-medium text-white">Username Benefits</h4>
                <ul className="text-sm text-dark-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Easier to remember than wallet addresses</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Search for agents by owner username</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Unique across the entire AVBLOX ecosystem</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
