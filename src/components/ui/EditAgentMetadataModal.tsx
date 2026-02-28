import React, { useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Label } from '../ui/Label'
import { useToast } from '../ui/Toast'
import { useSetAgentMetadata } from '../../hooks/useAgentMetadata'
import { X, Image, Type, Loader2 } from 'lucide-react'

interface EditAgentMetadataModalProps {
  tokenId: bigint
  currentName: string
  currentImage: string
  onClose: () => void
  onSuccess: () => void
}

export const EditAgentMetadataModal: React.FC<EditAgentMetadataModalProps> = ({
  tokenId,
  currentName,
  currentImage,
  onClose,
  onSuccess,
}) => {
  const toast = useToast()
  const [name, setName] = useState(currentName || '')
  const [image, setImage] = useState(currentImage || '')
  
  const { setMetadata, isPending, isConfirming, isSuccess } = useSetAgentMetadata(tokenId)

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Invalid Name', 'Please enter an agent name')
      return
    }

    if (!image.trim()) {
      toast.error('Invalid Image', 'Please enter an IPFS image URI')
      return
    }

    if (!image.startsWith('ipfs://') && !image.startsWith('http')) {
      toast.error('Invalid IPFS URI', 'Image URI should start with ipfs:// or http://')
      return
    }

    toast.loading('Saving Metadata', 'Updating agent metadata...')

    setMetadata(name.trim(), image.trim())
  }

  React.useEffect(() => {
    if (isSuccess) {
      toast.success('Metadata Updated!', 'Your agent metadata has been saved')
      onSuccess()
      onClose()
    }
  }, [isSuccess, toast, onSuccess, onClose])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-900 rounded-xl border border-dark-700 max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Edit Agent Metadata</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Name Input */}
        <div>
          <Label htmlFor="name" className="text-sm flex items-center gap-2">
            <Type className="w-4 h-4 text-primary-400" />
            Agent Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="My Awesome Agent"
            className="mt-1"
          />
          <p className="text-xs text-dark-400 mt-1">
            A unique name for your agent (max 100 characters)
          </p>
        </div>

        {/* Image Input */}
        <div>
          <Label htmlFor="image" className="text-sm flex items-center gap-2">
            <Image className="w-4 h-4 text-accent-400" />
            Image URI (IPFS)
          </Label>
          <Input
            id="image"
            value={image}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setImage(e.target.value)}
            placeholder="ipfs://Qm..."
            className="mt-1"
          />
          <p className="text-xs text-dark-400 mt-1">
            Upload image to <a href="https://pinata.cloud" target="_blank" className="text-primary-400 hover:underline">Pinata</a> or <a href="https://ipfs.io" target="_blank" className="text-primary-400 hover:underline">IPFS.io</a>
          </p>
        </div>

        {/* Preview */}
        {image && (
          <div className="p-3 bg-dark-950 rounded-lg">
            <p className="text-xs text-dark-400 mb-2">Preview:</p>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-lg bg-dark-800 overflow-hidden flex-shrink-0">
                {image.startsWith('ipfs://') ? (
                  <img
                    src={image.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="text-xs text-dark-400 truncate">
                {image}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-dark-700">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending || isConfirming || !name || !image}
            className="flex-1"
            leftIcon={isPending || isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
          >
            {isConfirming ? 'Confirming...' : isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
