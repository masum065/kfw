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

export const FACTIONS = [{ name: 'student' }, { name: 'icecream' }];

const devnetConstants = {
  mainnet: MAINNET,
  network: WalletAdapterNetwork.Devnet,
  ticker: 'ANIMAL',
  wrappedSol: new anchor.web3.PublicKey(
    'So11111111111111111111111111111111111111112'
  ),
  jungleKey: new anchor.web3.PublicKey(
    '7QoMyJ9wyA2YioxsPnuQCeCEZX2oCqz7J2pPLBjxPqAq'
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
    '7QoMyJ9wyA2YioxsPnuQCeCEZX2oCqz7J2pPLBjxPqAq'
  ),

  metadata: mainnetMetadata as any as StaticMetadata[],
};

const constants = MAINNET ? mainnetConstants : devnetConstants;
constants.metadata.forEach((mint) => {
  mint.emissionsPerDay = mint.emissionsPerDay * 10 ** 9;
});
export default constants;

// Program ID: 1rRJRs5bN9WmfLGD5TXdy763Y43GssV3ox46aDz1eci
// Jungle key: 7pfBoh7crcCLEzBsL9r4G8hSESUXxJPbkZEsNv83oD9U
// Owner: Guh2LryMmKBL6zgSbABftS3p2Do6ZhEg78qXyYLjeaUY
// Jungle: HVjoeMdteUui9jpMDTRtoYrwFrCy65SHJTh8bviwZyr8
// Escrow: CuCBdkDTvSys2BgFfyxTaAM1fwnM7KnkBBiAYny9KZM8

// Jungle key: 7QoMyJ9wyA2YioxsPnuQCeCEZX2oCqz7J2pPLBjxPqAq
// Owner: DbcjAUdsKWqpzjxC3785M6w4LDdtJEjs9gKUpgs8v9mB
// Program ID: 1rRJRs5bN9WmfLGD5TXdy763Y43GssV3ox46aDz1eci
// Jungle: 4emntnnUJ8KReC4hwC9dkjKmScuEVKRBKjYHAis6jLaE
// Escrow: 2UKxxUdyF2k6D8JEDZTmrQXDi9wkERhqPRdFDaDoxYWS
