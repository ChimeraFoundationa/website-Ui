import React from 'react'
import { cn } from '../../utils/cn'

export interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
}

export interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={cn('border-b border-dark-700', className)}>
      <div className="flex space-x-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap cursor-pointer',
              activeTab === tab.id
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-dark-400 hover:text-dark-200 hover:border-dark-600'
            )}
            type="button"
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'ml-2 px-2 py-0.5 rounded-full text-xs',
                  activeTab === tab.id
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'bg-dark-700 text-dark-400'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export const TabContent: React.FC<{
  activeTab: string
  tabId: string
  children: React.ReactNode
  className?: string
}> = ({ activeTab, tabId, children, className }) => {
  if (activeTab !== tabId) return null

  return (
    <div className={cn('animate-in fade-in duration-200', className)}>
      {children}
    </div>
  )
}
