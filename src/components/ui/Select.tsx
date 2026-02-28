import React from 'react'
import { cn } from '../../utils/cn'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  className?: string
  placeholder?: string
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  className,
  placeholder = 'Select an option',
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'flex h-10 w-full appearance-none items-center justify-between rounded-lg border border-dark-700 bg-dark-900 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-dark-900">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400 pointer-events-none" />
    </div>
  )
}
