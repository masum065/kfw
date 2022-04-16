import * as anchor from '@project-serum/anchor';
import { WalletModalProvider } from '@solana/wallet-adapter-ant-design';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import 'antd/dist/antd.min.css';
import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { StakingProvider } from './contexts/Staking/Provider';
import { Gallery } from './pages/Gallery';
import Staking from './pages/Staking';
import './styles/global.scss';
require('@solana/wallet-adapter-ant-design/styles.css');
const network = process.env.REACT_APP_SOLANA_NETWORK as WalletAdapterNetwork;

export const App = () => {
  const [rpcHost, setRpcHost] = useState<string>(
    localStorage.getItem('rpc') as string
  );

  useEffect(() => {
    if (localStorage.getItem('rpc')) {
      setRpcHost(localStorage.getItem('rpc') as string);
    }
  }, []);

  const connection = new anchor.web3.Connection(
    rpcHost ? rpcHost : anchor.web3.clusterApiUrl('mainnet-beta')
  );
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network }),
    ],
    [network]
  );
  return (
    <BrowserRouter>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className='mainWrapper'>
              <Routes>
                <Route
                  path='/'
                  element={
                    <StakingProvider connection={connection}>
                      <Staking />
                    </StakingProvider>
                  }
                />
                <Route path='/gallery' element={<Gallery />} />
              </Routes>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  );
};
