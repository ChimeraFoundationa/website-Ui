import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { config } from './wagmi'
import { Layout } from './components/layout/Layout'
import { ToastContainer } from './components/ui/Toast'
import { HomePage } from './pages/HomePage'
import { MarketplacePage } from './pages/MarketplacePage'
import { AgentDetailPage } from './pages/AgentDetailPage'
import { MintPage } from './pages/MintPage'
import { CreateModulePage } from './pages/CreateModulePage'
import { AttachModulePage } from './pages/AttachModulePage'
import { AttachModuleManualPage } from './pages/AttachModuleManualPage'
import { ModuleMarketplacePage } from './pages/ModuleMarketplacePage'
import { ModuleDetailPage } from './pages/ModuleDetailPage'
import { RegisterUsernamePage } from './pages/RegisterUsernamePage'
import { AdminPage } from './pages/AdminPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
})

export const App: React.FC = () => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/agent/:id" element={<AgentDetailPage />} />
              <Route path="/mint" element={<MintPage />} />
              <Route path="/modules" element={<ModuleMarketplacePage />} />
              <Route path="/modules/:address" element={<ModuleDetailPage />} />
              <Route path="/modules/create" element={<CreateModulePage />} />
              <Route path="/modules/attach" element={<AttachModulePage />} />
              <Route path="/modules/attach/manual" element={<AttachModuleManualPage />} />
              <Route path="/username" element={<RegisterUsernamePage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Layout>
          <ToastContainer />
        </BrowserRouter>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
