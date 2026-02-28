import React from 'react'
import { cn } from '../../utils/cn'

export interface CardProps {
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  hover?: boolean
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  onClick,
  hover = true,
}) => {
  return (
    <div
      className={cn(
        'bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl overflow-hidden',
        hover && 'transition-all duration-300 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export const CardHeader: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div className={cn('px-6 py-4 border-b border-dark-700', className)}>
    {children}
  </div>
)

export const CardTitle: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => (
  <h3 className={cn('text-lg font-semibold text-white', className)}>
    {children}
  </h3>
)

export const CardContent: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
)

export const CardFooter: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div className={cn('px-6 py-4 border-t border-dark-700 bg-dark-800/30', className)}>
    {children}
  </div>
)

export const CardDescription: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children,
}) => (
  <p className={cn('text-sm text-dark-400', className)}>
    {children}
  </p>
)
