import { MetadataJson } from '@metaplex/js';
import * as anchor from '@project-serum/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import devnetMetadata from './devnetMetadata.json';
import mainnetMetadata from './mainnetMetadata.json';

const MAINNET = true;

export type StaticMetadata = {
  metadata: {
    name: string;
    symbol: string;
    uri: string;
    seller_fee_basis_points: number;
    creators: {
      address: string;
      share: number;
    }[];
  };
  arweave: MetadataJson;
  mint: string;
  emissionsPerDay: number;
  faction: string;
};

export const COLLECTION_CLAIM_DELAY = new anchor.BN(86400);

export const FACTIONS = [{ name: 'fractures' }, { name: 'main' }];

const devnetConstants = {
  mainnet: MAINNET,
  network: WalletAdapterNetwork.Devnet,
  ticker: 'ANIMAL',
  wrappedSol: new anchor.web3.PublicKey(
    'So11111111111111111111111111111111111111112'
  ),
  jungleKey: new anchor.web3.PublicKey(
    '9eKszppHauTFEvsytb21t9c1JcGSy8QkT3tTnYZ5rari'
  ),

  metadata: devnetMetadata as any as StaticMetadata[],
};

const mainnetConstants = {
  mainnet: MAINNET,
  network: WalletAdapterNetwork.Mainnet,
  ticker: 'ANIMAL',
  wrappedSol: new anchor.web3.PublicKey(
    'So11111111111111111111111111111111111111112'
  ),
  jungleKey: new anchor.web3.PublicKey(
    '9eKszppHauTFEvsytb21t9c1JcGSy8QkT3tTnYZ5rari'
  ),

  metadata: mainnetMetadata as any as StaticMetadata[],
};

const constants = MAINNET ? mainnetConstants : devnetConstants;
constants.metadata.forEach((mint) => {
  mint.emissionsPerDay = mint.emissionsPerDay * 10 ** 3;
});
export default constants;
