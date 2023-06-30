import { useState, useEffect, useCallback } from 'react';
import {
  govDistributor7,
  getDistributorLogicSig,
  prepareRegisterEscrowOfflineTransaction,
  prepareRegisterEscrowOnlineTransaction,
} from 'folks-finance-js-sdk';
import { useWallet } from '@txnlab/use-wallet';
import algosdk from 'algosdk';
import { abbrev, b64toAlgoB32 } from '../util.js';
import Copyable from './Copyable.jsx';

const algodClient = new algosdk.Algodv2('', "https://mainnet-api.algonode.cloud", 443);

// goal account addpartkey -a DTHIRTEENNLSYGLSEXTXC6X4SVDWMFRCPAOAUCXWIXJRCVBWIIGLYARNQE --roundFirstValid=24057090 --roundLastValid=24707090 --keyDilution=806

export default function Folks() {
  const { activeAccount, signTransactions, sendTransactions } = useWallet();
  const address = activeAccount?.address ?? '';
  const [counter, setCounter] = useState(0);
  const [dsig, setDsig] = useState('');
  const [status, setStatus] = useState('Loading');
  const [balance, setBalance] = useState('?');
  const [currentRound, setCurrentRound] = useState(0);

  const [votekey, setVotekey] = useState('');
  const [selectionkey, setSelectionkey] = useState('');
  const [stateproofkey, setStateproofkey] = useState('');
  const [firstround, setFirstround] = useState('');
  const [lastround, setLastround] = useState('');
  const [dilution, setDilution] = useState('');

  useEffect(() => {
    (async() => {
      const { "last-round": rnd } = (await algodClient.status().do()) ?? {};
      if (rnd) {
        setCurrentRound(rnd);
      }
    })()
  }, []);

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
  }, [address, votekey, selectionkey, stateproofkey, firstround, lastround, dilution, sendTransactions, signTransactions]);

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

  const [showInst, setShowInst] = useState(false);
  const toggleInstructions = useCallback(() => setShowInst(e => !e), []);

  return <div>
    <hr />
    <div>Escrow account: <Copyable value={dsig}>{abbrev(dsig)}</Copyable></div>
    <div>Balance: {balance}</div>
    <hr />
    <div style={{marginBottom: '0.5rem'}}>Consensus status: {status}</div>
    { status === "Offline" ? <div className="small">
      {showInst ? <>
        <p>You can generate a participation key for your escrow account using an Algorand node.</p>
        <p>To generate a key valid for 2 million rounds (~76 days at 3.3s round times) you can use:</p>
        <Copyable className="terminal">goal account addpartkey -a {dsig} --roundFirstValid={currentRound} --roundLastValid={currentRound + 2_000_000} --keyDilution={Math.floor(Math.sqrt(2_000_000))}</Copyable>
        <p>See algo: <a href="https://developer.algorand.org/docs/run-a-node/participate/generate_keys/">Algorand Documentation: Generate Keys</a></p>
        </>
      : null }
      <button onClick={() => toggleInstructions()}>{!showInst ? 'Show' : 'Hide'} Part. Key Generation Instructions</button>
    </div> : null }
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
  </div>;
}


