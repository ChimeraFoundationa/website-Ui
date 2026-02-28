import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ModuleCreator } from '../components/module/ModuleCreator'
import { Button } from '../components/ui/Button'
import { ArrowLeft } from 'lucide-react'

export const CreateModulePage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="mb-6"
        leftIcon={<ArrowLeft className="w-4 h-4" />}
      >
        Back to Marketplace
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Create Module Contract
        </h1>
        <p className="text-dark-400">
          Deploy a custom cognitive module for your AVBLOX agents
        </p>
      </div>

      <ModuleCreator />

      {/* Info Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-dark-900 rounded-lg">
          <h3 className="font-semibold text-white mb-2">What is a Module?</h3>
          <p className="text-sm text-dark-400">
            Modules are ERC-721 NFTs that represent cognitive components (Memory, Tools, Policy, Execution) 
            that can be attached to your AVBLOX agents.
          </p>
        </div>

        <div className="p-4 bg-dark-900 rounded-lg">
          <h3 className="font-semibold text-white mb-2">How it Works</h3>
          <p className="text-sm text-dark-400">
            1. Deploy a module contract (this page)<br/>
            2. Mint module NFTs from your contract<br/>
            3. Attach NFTs to your Plot agent<br/>
            4. Agent gains new capabilities!
          </p>
        </div>

        <div className="p-4 bg-dark-900 rounded-lg">
          <h3 className="font-semibold text-white mb-2">Module Types</h3>
          <ul className="text-sm text-dark-400 space-y-1">
            <li>• <strong>Memory</strong> - Store agent state & history</li>
            <li>• <strong>Tool</strong> - External API integrations</li>
            <li>• <strong>Policy</strong> - Rules & constraints</li>
            <li>• <strong>Execution</strong> - Agent logic execution</li>
          </ul>
        </div>

        <div className="p-4 bg-dark-900 rounded-lg">
          <h3 className="font-semibold text-white mb-2">Gas Cost</h3>
          <p className="text-sm text-dark-400">
            Deploying a module contract costs approximately 0.001-0.002 AVAX on Fuji testnet.
            Minting module NFTs costs ~0.0001 AVAX per NFT.
          </p>
        </div>
      </div>
    </div>
  )
}
