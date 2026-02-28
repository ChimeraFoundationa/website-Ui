# AVBLOX Marketplace - Core Wallet Connection Guide

## 🚀 Quick Start: Connect with Core Wallet

### Step 1: Install Core Wallet

**Browser Extension (Chrome/Brave/Edge):**
1. Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/coinbase-wallet-extension/hnfanknocfeofbddgcijnmhnfnkdnaad)
2. Click "Add to Chrome"
3. Follow the setup wizard to create or import your wallet

**Mobile App (iOS/Android):**
1. Download "Core - Coinbase Wallet" from App Store or Google Play
2. Create a new wallet or import existing one
3. Enable browser extension sync if using mobile

### Step 2: Add Avalanche Fuji Network to Core Wallet

**Option A: Automatic (Recommended)**
1. Click "Connect Core Wallet" in the app
2. If you're on the wrong network, click "Switch to Fuji"
3. Approve the network switch in Core Wallet

**Option B: Manual Addition**
1. Open Core Wallet extension
2. Click the network dropdown (top of the popup)
3. Click "Add network"
4. Enter these details:

```
Network Name: Avalanche Fuji Testnet
RPC URL: https://api.avax-test.network/ext/bc/C/rpc
Chain ID: 43113
Currency Symbol: AVAX
Block Explorer URL: https://testnet.snowtrace.io
```

5. Click "Save"

### Step 3: Get Test AVAX
Visit the [Avalanche Faucet](https://faucet.avax.network/) to get test AVAX for gas fees.

---

## 🔧 Troubleshooting

### Issue: "Core Wallet not detected"
**Solutions:**
1. Make sure Core Wallet extension is installed and unlocked
2. Refresh the page
3. Check if extension is enabled in browser settings
4. Try restarting your browser

### Issue: "Network switch failed"
**Solutions:**
1. Open Core Wallet
2. Manually add Avalanche Fuji network (see Step 2)
3. Refresh the page
4. Try connecting again

### Issue: "User rejected the request"
**Solution:** Approve the connection request in Core Wallet popup.

### Issue: Transaction fails
**Solutions:**
1. Make sure you have enough test AVAX for gas
2. Check that you're on Avalanche Fuji network
3. Verify the contract addresses are correct
4. Try increasing gas limit in Core Wallet settings

---

## 🌐 Browser Console Debugging

Open browser DevTools (F12) and check the Console tab for errors:

```javascript
// Check if Core Wallet is detected
console.log(window.ethereum)

// Check current chain ID
window.ethereum.request({ method: 'eth_chainId' })
  .then(console.log)
  .catch(console.error)
```

Expected chain ID for Fuji: `0xa869` (43113 in decimal)

---

## 📱 Using Core Wallet Mobile

1. Open the app and tap the browser icon
2. Navigate to the marketplace URL
3. Tap "Connect Core Wallet"
4. Approve connection in the app
5. Transactions will prompt for approval in the mobile app

---

## 🔗 Useful Links

- [Core Wallet Download](https://www.coinbase.com/wallet/downloads)
- [Core Wallet Support](https://help.coinbase.com/en/wallet)
- [Avalanche Fuji Faucet](https://faucet.avax.network/)
- [Snowtrace Explorer](https://testnet.snowtrace.io/)
- [AVBLOX GitHub](https://github.com/avblox)

---

## 📋 Network Configuration Summary

```
Chain ID: 43113 (0xA869)
Network Name: Avalanche Fuji Testnet
RPC URL: https://api.avax-test.network/ext/bc/C/rpc
Explorer: https://testnet.snowtrace.io
Currency: AVAX
```

---

**Need more help?** Check the browser console for detailed error messages or visit Core Wallet support.
