import { useState, useEffect, useCallback } from 'react';
import logo from './logo.svg';
import './App.css';
import WalletProvider from './components/wallet-provider.jsx';
import { useWallet } from '@txnlab/use-wallet';
import {
  govDistributor7,
  getDistributorLogicSig,
  prepareRegisterEscrowOfflineTransaction,
  prepareRegisterEscrowOnlineTransaction,
} from 'folks-finance-js-sdk';
import algosdk from 'algosdk';

const algodClient = new algosdk.Algodv2('', "https://mainnet-api.algonode.cloud", 443);

function abbrev(str = '') {
  return str.slice(0, 6) + '...' + str.slice(-6);
}

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

function Page() {
  const { activeAccount, providers, disconnect } = useWallet();

  return <div>
    <h2>Folks Finance Consensus Participation</h2>
    <hr/>
    <div className="small">
      <p>
        This microsite allows you to issue "keyreg" transactions through your Folks Finance escrow account, which enables your Algorand node to participate in consensus using your Folks Finance commitment.
      </p>
      <p>
        See the <a href="https://docs.folks.finance/developer/official-sdks/participating-in-consensus">Folks Finance documentation on Consensus participation</a> for details.
      </p>
      <p>By <a href="https://twitter.com/d13_co">@D13_co</a></p>
    </div>
    <hr/>
    <Account />
    { activeAccount ? <Folks /> : null }
  </div>
}

function Folks() {
  const { activeAccount, signTransactions, sendTransactions } = useWallet();
  const address = activeAccount?.address ?? '';
  const [counter, setCounter] = useState(0);
  const [dsig, setDsig] = useState('');
  const [status, setStatus] = useState('Loading');
  const [balance, setBalance] = useState('?');

  const [votekey, setVotekey] = useState('');
  const [selectionkey, setSelectionkey] = useState('');
  const [stateproofkey, setStateproofkey] = useState('');
  const [firstround, setFirstround] = useState('');
  const [lastround, setLastround] = useState('');
  const [dilution, setDilution] = useState('');

  const goOnline = useCallback(() => {
    (async() => {
      const params = await algodClient.getTransactionParams().do();
      const txn = await prepareRegisterEscrowOnlineTransaction(
        govDistributor7,
        address,
        b64toAlgoB32(votekey),
        b64toAlgoB32(selectionkey),
        Buffer.from(stateproofkey, 'base64'),
        Number(firstround),
        Number(lastround),
        Number(dilution),
        params,
      );
      try {
        const signed = await signTransactions([
          algosdk.encodeUnsignedTransaction(txn)
        ]);
        await sendTransactions(signed);
        setCounter(counter => counter + 1);
      } catch(e) {
        alert(e.message);
      }
    })()
  }, [address, dsig, votekey, selectionkey, stateproofkey, firstround, lastround, dilution]);

  const goOffline = useCallback(() => {
    (async() => {
      const params = await algodClient.getTransactionParams().do();
      const txn = await prepareRegisterEscrowOfflineTransaction(
        govDistributor7,
        address,
        params,
      );
      try {
        const signed = await signTransactions([
          algosdk.encodeUnsignedTransaction(txn)
        ]);
        await sendTransactions(signed);
        alert('Success!');
        setTimeout(() => setCounter(c => c + 1), 1000);
      } catch(e) {
        alert(e.message);
      }
    })()
  }, [dsig]);

  useEffect(() => {
    (async() => {
      if (address) {
        const lsig = await getDistributorLogicSig(address);
        const dsig = lsig.address();
        const { status = 'Does not exist', amount = 0 } = (await algodClient.accountInformation(dsig).do()) ?? {};
        setBalance((amount / (10 ** 6)).toLocaleString());
        setDsig(dsig);
        setStatus(status);
      } else {
        setDsig();
      }
    })()
  }, [address, counter]);

  return address ? <div>
    <hr />
    <div>Escrow account: {abbrev(dsig)} <a href="#" onClick={() => navigator.clipboard.writeText(dsig)}>Copy</a></div>
    <div>Balance: {balance}</div>
    <hr />
    <div>Consensus status: {status}</div>
    <hr />
    { status === "Online" ? <div>
      <p>Your account is online!</p>
      <button onClick={goOffline}>Go Offline</button>
    </div> :
    <div style={{display: 'flex', justifyContent: 'center'}}>
      <table>

        <tr><td>
          Selection Key
        </td><td>
          <input onChange={({ target: { value }}) => setSelectionkey(value?.trim())} value={selectionkey} />
        </td></tr>

        <tr><td>
          Vote Key
        </td><td>
          <input onChange={({ target: { value }}) => setVotekey(value?.trim())} value={votekey} />
        </td></tr>

        <tr><td>
          State Proof Key
        </td><td>
          <input onChange={({ target: { value }}) => setStateproofkey(value?.trim())} value={stateproofkey} />
        </td></tr>

        <tr><td>
          First Round
        </td><td>
          <input onChange={({ target: { value }}) => setFirstround(value?.trim())} value={firstround} />
        </td></tr>

        <tr><td>
          Last Round
        </td><td>
          <input onChange={({ target: { value }}) => setLastround(value?.trim())} value={lastround} />
        </td></tr>

        <tr><td>
          Key Dilution
        </td><td>
          <input onChange={({ target: { value }}) => setDilution(value?.trim())} value={dilution} />
        </td></tr>

        <tr><td colSpan="2">
          <button onClick={goOnline}>Register Online</button>
        </td></tr>

      </table>
    </div>}
  </div> : null;
}

function Account() {
  const { activeAccount, providers, disconnect } = useWallet();

  const activeProvider = providers?.find(
    (provider) => provider.metadata.id === activeAccount?.providerId
  )

  useEffect(() => {
    console.log("active account", activeAccount);
  }, [activeAccount]);

  useEffect(() => {
    console.log("active provider", activeProvider);
  }, [activeProvider]);

  return activeAccount ? <>Connected: {abbrev(activeAccount?.address)} ({activeProvider?.metadata?.name}) <button onClick={activeProvider?.disconnect}>Disconnect</button></> :
            <>{providers?.map((provider) => (
        <div key={provider.metadata.id}>
          <h4>
            <img
              width={30}
              height={30}
              alt={`${provider.metadata.name} icon`}
              src={provider.metadata.icon}
            />
            {provider.metadata.name} {provider.isActive && '[active]'}
          </h4>

          <div>
            <button type="button" onClick={provider.connect} disabled={provider.isConnected}>
              Connect
            </button>
            <button type="button" onClick={provider.disconnect} disabled={!provider.isConnected}>
              Disconnect
            </button>
            <button
              type="button"
              onClick={provider.setActiveProvider}
              disabled={!provider.isConnected || provider.isActive}
            >
              Set Active
            </button>

            <div>
              {provider.isActive && provider.accounts.length && (
                <select
                  value={activeAccount?.address}
                  onChange={(e) => provider.setActiveAccount(e.target.value)}
                >
                  {provider.accounts.map((account) => (
                    <option key={account.address} value={account.address}>
                      {account.address}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      ))}
    </>;
}

function b64toAlgoB32(str) {
  return algosdk.encodeAddress(
    Buffer.from(str, 'base64')
  );
}
