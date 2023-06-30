import { useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet';
import { abbrev } from '../util.js';

export default function Account() {
  const { activeAccount, providers } = useWallet();

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
