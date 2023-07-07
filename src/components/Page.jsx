import { useWallet } from '@txnlab/use-wallet';
import Account from './Account.jsx';
import Folks from './Folks.jsx';

export default function Page() {
  const { activeAccount } = useWallet();

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
      <hr />
      <p><strong>
        The Folks Finance site now supports these transactions, so you should not need to use this site.</strong>
      </p>
      <p>
        Check the <a href="https://app.folks.finance/algo-liquid-governance">Algo Liquid Governance</a> page ➡ Your Commitment ➡ Consensus (top right)
      </p>
      <p>By <a href="https://twitter.com/d13_co">@D13_co</a></p>
    </div>
    <hr/>
    <Account />
    { activeAccount ? <Folks /> : null }
  </div>
}


