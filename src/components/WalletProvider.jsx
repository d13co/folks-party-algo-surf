import { DeflyWalletConnect } from '@blockshake/defly-connect'
import { DaffiWalletConnect } from '@daffiwallet/connect'
import { WalletConnectModalSign } from '@walletconnect/modal-sign-html'
import { WalletProvider, useInitializeProviders, PROVIDER_ID } from '@txnlab/use-wallet';
import { PeraWalletConnect } from '@perawallet/connect'
import algosdk from 'algosdk';

export const NODE_NETWORK = 'mainnet';
export const NODE_URL = 'https://mainnet-api.algonode.cloud';
export const NODE_TOKEN = '';
export const NODE_PORT = 443;

export default function MyWalletProvider({ children }) {
    const walletProviders = useInitializeProviders({
    providers: [
      { id: PROVIDER_ID.DEFLY, clientStatic: DeflyWalletConnect },
      { id: PROVIDER_ID.PERA, clientStatic: PeraWalletConnect },
      { id: PROVIDER_ID.DAFFI, clientStatic: DaffiWalletConnect },
      { id: PROVIDER_ID.EXODUS },
      {
        id: PROVIDER_ID.WALLETCONNECT,
        clientStatic: WalletConnectModalSign,
        clientOptions: {
          projectId: 'd71e931986d008c18d6bdedb8b5938a5',
          // relayUrl: process.env.NEXT_PUBLIC_WC2_RELAY_URL,
          metadata: {
            name: 'Folks Party (cipation tool)',
            description: 'Folks Finance Consensus participation tool (unofficial)',
            url: 'https://folks-party.algo.surf',
            icons: ['https://next-use-wallet.vercel.app/nfd.svg']
          },
          modalOptions: {
            explorerRecommendedWalletIds: [
              // Fireblocks desktop wallet
              '5864e2ced7c293ed18ac35e0db085c09ed567d67346ccb6f58a0327a75137489'
            ]
          }
        }
      }
    ],
    nodeConfig: {
      network: NODE_NETWORK,
      nodeServer: NODE_URL,
      nodePort: NODE_PORT,
      nodeToken: NODE_TOKEN
    },
    algosdkStatic: algosdk,
    debug: true
  })

  return <WalletProvider value={walletProviders}>
    {children}
  </WalletProvider>
}
