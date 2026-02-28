import React, { useState } from 'react'
import type { AgentContext } from '../../types'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { CodeBlock } from '../../components/ui/CodeBlock'
import {
  FileText,
  Cpu,
  RefreshCw,
  Layers,
  Zap,
  Shield,
  Brain,
} from 'lucide-react'
import { formatModuleType } from '../../utils/formatters'

interface AgentContextTabProps {
  tokenId: bigint
  middlewareContext: AgentContext | undefined
  adapterContext:
    | {
        memoryCtx: string
        toolCtx: string
        policyCtx: string
        executionCtx: string
      }
    | undefined
  isLoading: boolean
}

export const AgentContextTab: React.FC<AgentContextTabProps> = ({
  middlewareContext,
  adapterContext,
  isLoading,
}) => {
  const [activeSource, setActiveSource] = useState<'middleware' | 'adapter'>('middleware')
  const [expandedModule, setExpandedModule] = useState<number | null>(null)

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center py-16">
        <RefreshCw className="w-8 h-8 text-dark-500 animate-spin" />
      </div>
    )
  }

  // Check if adapter context has any actual data
  const hasAdapterData = adapterContext && (
    adapterContext.memoryCtx || 
    adapterContext.toolCtx || 
    adapterContext.policyCtx || 
    adapterContext.executionCtx
  )

  // Show message if no context available from either source
  if (!middlewareContext && !adapterContext) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
          <p className="text-dark-400 mb-4">
            No context available for this agent
          </p>
          <p className="text-dark-500 text-sm">
            This agent may not have any modules attached yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Source Selector - show if at least one context exists */}
      {(middlewareContext || adapterContext) && (
        <div className="flex items-center gap-2 mb-4 p-4 bg-dark-900 rounded-lg">
          {middlewareContext && (
            <Button
              variant={activeSource === 'middleware' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveSource('middleware')}
              type="button"
            >
              <Layers className="w-4 h-4 mr-2" />
              Middleware Context
            </Button>
          )}
          {adapterContext && (
            <Button
              variant={activeSource === 'adapter' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setActiveSource('adapter')}
              type="button"
            >
              <Cpu className="w-4 h-4 mr-2" />
              Adapter Context
            </Button>
          )}
          <span className="text-sm text-dark-400 ml-2">
            Active: <span className="text-white font-medium">{activeSource}</span>
          </span>
        </div>
      )}

      {activeSource === 'middleware' && (
        <>
          {!middlewareContext ? (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 mb-4">
                  No middleware context available
                </p>
                <p className="text-dark-500 text-sm">
                  This agent may not have modules attached through the middleware contract
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Context Summary */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary-400" />
                    Context Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-dark-900 rounded-lg">
                      <p className="text-sm text-dark-400 mb-1">Plot ID</p>
                      <p className="text-lg font-mono text-white">
                        {middlewareContext.plotId.toString()}
                      </p>
                    </div>
                    <div className="p-4 bg-dark-900 rounded-lg">
                      <p className="text-sm text-dark-400 mb-1">Total Modules</p>
                      <p className="text-lg font-mono text-white">
                        {middlewareContext.modules.length}
                      </p>
                    </div>
                    <div className="p-4 bg-dark-900 rounded-lg">
                      <p className="text-sm text-dark-400 mb-1">Module Types</p>
                      <p className="text-lg font-mono text-white">
                        {middlewareContext.moduleTypes.length}
                      </p>
                    </div>
                    <div className="p-4 bg-dark-900 rounded-lg">
                      <p className="text-sm text-dark-400 mb-1">Capabilities</p>
                      <p className="text-lg font-mono text-white">
                        {middlewareContext.capabilities.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modules List */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Layers className="w-4 h-4 text-accent-400" />
                    Attached Modules ({middlewareContext.modules.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {middlewareContext.modules.length === 0 ? (
                    <p className="text-dark-500 text-center py-8">
                      No modules attached to this agent
                    </p>
                  ) : (
                    middlewareContext.modules.map((module, index) => (
                      <div
                        key={index}
                        className="border border-dark-700 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedModule(expandedModule === index ? null : index)
                          }
                          className="w-full p-4 flex items-center justify-between hover:bg-dark-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary-500/10 flex items-center justify-center">
                              {getModuleIcon(module.moduleType)}
                            </div>
                            <div className="text-left">
                              <p className="font-medium text-white">
                                {formatModuleType(module.moduleType)}
                              </p>
                              <p className="text-sm text-dark-400 font-mono">
                                {module.moduleContract.slice(0, 10)}...
                              </p>
                            </div>
                          </div>
                          <Badge variant="info">
                            Token #{module.moduleTokenId.toString()}
                          </Badge>
                        </button>

                        {expandedModule === index && (
                          <div className="px-4 pb-4 border-t border-dark-700 pt-4 space-y-3">
                            <div>
                              <p className="text-sm text-dark-400 mb-1">Module Type</p>
                              <CodeBlock
                                code={module.moduleType}
                                language="bytes32"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <p className="text-sm text-dark-400 mb-1">Capability</p>
                              <CodeBlock
                                code={module.capability}
                                language="bytes32"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <p className="text-sm text-dark-400 mb-1">Contract Address</p>
                              <CodeBlock
                                code={module.moduleContract}
                                language="address"
                                className="text-sm"
                              />
                            </div>
                            <div>
                              <p className="text-sm text-dark-400 mb-1">Token ID</p>
                              <p className="font-mono text-white">
                                {module.moduleTokenId.toString()}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}

      {activeSource === 'adapter' && (
        <>
          {!hasAdapterData ? (
            <Card>
              <CardContent className="py-16 text-center">
                <Cpu className="w-12 h-12 text-dark-600 mx-auto mb-4" />
                <p className="text-dark-400 mb-4">
                  No adapter context data available
                </p>
                <p className="text-dark-500 text-sm">
                  This agent has not been executed yet or has no context data
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {adapterContext.memoryCtx && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary-400" />
                      Memory Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      code={adapterContext.memoryCtx}
                      language="bytes"
                      maxLines={10}
                    />
                  </CardContent>
                </Card>
              )}

              {adapterContext.toolCtx && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Zap className="w-4 h-4 text-accent-400" />
                      Tool Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      code={adapterContext.toolCtx}
                      language="bytes"
                      maxLines={10}
                    />
                  </CardContent>
                </Card>
              )}

              {adapterContext.policyCtx && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      Policy Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      code={adapterContext.policyCtx}
                      language="bytes"
                      maxLines={10}
                    />
                  </CardContent>
                </Card>
              )}

              {adapterContext.executionCtx && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-amber-400" />
                      Execution Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CodeBlock
                      code={adapterContext.executionCtx}
                      language="bytes"
                      maxLines={10}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function getModuleIcon(moduleType: string) {
  const type = formatModuleType(moduleType).toLowerCase()
  if (type.includes('memory')) return <Brain className="w-5 h-5 text-primary-400" />
  if (type.includes('tool')) return <Zap className="w-5 h-5 text-accent-400" />
  if (type.includes('policy')) return <Shield className="w-5 h-5 text-emerald-400" />
  if (type.includes('execution')) return <Cpu className="w-5 h-5 text-amber-400" />
  return <Layers className="w-5 h-5 text-dark-400" />
}
