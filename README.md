# AVBLOX Marketplace

Autonomous Agent Marketplace for AVBLOX cognitive agents on Avalanche Fuji Testnet.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Core Wallet extension or mobile app

### Installation

```bash
# Navigate to marketplace directory
cd marketplace

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

### Environment Variables

The `.env` file is pre-configured with:

```env
VITE_WALLETCONNECT_PROJECT_ID=d27815b1d09376b7e00baf6ca4ebfda9
VITE_CONTRACT_PLOT=0x292477338AC8CF0E751AD096F5e454E7B04660D1
VITE_CONTRACT_MIDDLEWARE=0x3C1Af6fD470B4A10686BE8707f1f3fF5Fa3EB352
VITE_CONTRACT_EXECUTION_ROUTER=0xA92687e007FbcF5B371ec9A2B6c60Adfe56f49bc
VITE_CONTRACT_ADAPTER=0x12F2D3fd429B2c97c8aA3a7269b47cCe9840E7d6
VITE_CHAIN_ID=43113
VITE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
VITE_EXPLORER_URL=https://testnet.snowtrace.io
```

### Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📦 Features

### 1. Wallet Connection
- Connect via Core Wallet (Coinbase Smart Wallet)
- Auto-detect Avalanche Fuji network
- Auto-switch network if needed
- Display connected wallet address

### 2. Marketplace Page
- View all Plot NFTs owned by connected wallet
- Grid card display showing:
  - Token ID
  - Owner address
  - Execution count
  - Average gas used
  - Agent status (Active/Idle)
- Quick actions: View, Execute

### 3. Agent Detail Page (`/agent/:id`)

#### Overview Tab
- Token ID and owner information
- Execution statistics
- Last execution status
- Attached modules list
- Child contracts (ERC-998)

#### Context Tab
- View Middleware context
- View Adapter context (4 context types)
- Expandable module details
- Module type and capability display

#### Execute Tab
- JSON payload input editor
- Real-time JSON validation
- Gas estimation
- Execute agent with transaction confirmation
- Transaction status and result display
- Snowtrace links

#### History Tab
- Execution history from blockchain events
- Block number, timestamp, gas used
- Transaction hash with explorer links
- Input/result data viewer

### 4. Mint Page
- Mint new Plot NFT
- Gas estimation
- Transaction confirmation
- Success state with explorer link

## 🎨 UI Features

- **Dark Theme**: AI-native aesthetic with dark colors
- **Responsive Design**: Works on desktop and mobile
- **Loading States**: Skeleton loaders for async operations
- **Toast Notifications**: Success, error, info, and loading states
- **Form Validation**: JSON payload validation before submission
- **Ownership Checks**: Execute button disabled for non-owners

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 19, Vite |
| **Language** | TypeScript |
| **Web3** | wagmi v2, viem |
| **State** | Zustand |
| **Query** | TanStack React Query |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Routing** | React Router v6 |

## 📁 Project Structure

```
marketplace/
├── src/
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   ├── cards/        # Card components
│   │   └── layout/       # Layout components
│   ├── pages/            # Page components
│   │   ├── agent/        # Agent detail tabs
│   │   ├── MarketplacePage.tsx
│   │   ├── AgentDetailPage.tsx
│   │   └── MintPage.tsx
│   ├── hooks/            # Custom React hooks
│   ├── contracts/        # Contract ABIs and addresses
│   ├── store/            # Zustand stores
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript types
│   ├── wagmi.ts          # wagmi configuration
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── .env                  # Environment variables
├── .env.example          # Environment template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## 🔗 Smart Contracts

All contracts are deployed on **Avalanche Fuji Testnet** (Chain ID: 43113):

| Contract | Address | Verified |
|----------|---------|----------|
| Plot (ERC-998) | `0x292477338AC8CF0E751AD096F5e454E7B04660D1` | ✅ |
| Middleware | `0x3C1Af6fD470B4A10686BE8707f1f3fF5Fa3EB352` | ✅ |
| ExecutionRouter | `0xA92687e007FbcF5B371ec9A2B6c60Adfe56f49bc` | ✅ |
| AVBLOX8004Adapter | `0x12F2D3fd429B2c97c8aA3a7269b47cCe9840E7d6` | ✅ |

View on [Snowtrace](https://testnet.snowtrace.io)

## 🧪 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## 🌐 Network Configuration

### Avalanche Fuji Testnet

Add to MetaMask:

```json
{
  "chainId": "0xA869",
  "chainName": "Avalanche Fuji Testnet",
  "rpcUrl": "https://api.avax-test.network/ext/bc/C/rpc",
  "blockExplorerUrl": "https://testnet.snowtrace.io",
  "nativeCurrency": {
    "name": "AVAX",
    "symbol": "AVAX",
    "decimals": 18
  }
}
```

### Get Test AVAX

Visit the [Avalanche Faucet](https://faucet.avax.network/) to get test AVAX.

## 🎯 Usage Guide

### 1. Connect Wallet
1. Click "Connect Core Wallet" button
2. Approve the connection in Core Wallet popup
3. Switch to Avalanche Fuji network when prompted

### 2. View Your Agents
- After connecting, your Plot NFTs will appear in the marketplace
- Each card shows execution stats and status

### 3. Execute an Agent
1. Click on an agent card or "View Details"
2. Navigate to the "Execute" tab
3. Enter a JSON payload (default template provided)
4. Review gas estimation
5. Click "Execute Agent"
6. Confirm transaction in Core Wallet
7. View result and Snowtrace link

### 4. Mint New Agent
1. Click "Mint New Agent" from marketplace
2. Click "Mint Plot NFT"
3. Confirm transaction in Core Wallet
4. View on Snowtrace or return to marketplace

## ⚠️ Important Notes

- **Testnet Only**: This app connects to Avalanche Fuji testnet
- **Gas Fees**: Requires test AVAX for transactions
- **Ownership**: Only Plot NFT owners can execute their agents
- **Mock Data**: Marketplace uses mock data for demonstration

## 📝 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for AVBLOX
