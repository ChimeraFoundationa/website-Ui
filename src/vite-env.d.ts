/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_CONTRACT_PLOT: string
  readonly VITE_CONTRACT_MIDDLEWARE: string
  readonly VITE_CONTRACT_EXECUTION_ROUTER: string
  readonly VITE_CONTRACT_ADAPTER: string
  readonly VITE_CHAIN_ID: string
  readonly VITE_RPC_URL: string
  readonly VITE_EXPLORER_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
