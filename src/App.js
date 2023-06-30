import { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import WalletProvider from './components/wallet-provider.jsx';
import { useWallet } from '@txnlab/use-wallet';
import algosdk from 'algosdk';
import Page from './components/Page.jsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <WalletProvider>
          <Page />
        </WalletProvider>
      </header>
    </div>
  );
}

export default App;
