import { MetadataJson } from '@metaplex/js';
import * as anchor from '@project-serum/anchor';
import { AccountInfo as TokenAccount } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';

export interface Jungle {
  key: PublicKey;
  owner: PublicKey;
  escrow: PublicKey;
  mint: PublicKey;
  rewardsAccount: PublicKey;
  animalsStaked: anchor.BN;
  maximumRarity: anchor.BN;
  maximumRarityMultiplier: anchor.BN;
  weeklyMultiplier: anchor.BN;
  holdingsMultiplier: anchor.BN;
  baseWeeklyEmissions: anchor.BN;
  root: number[];
}

export interface Animal {
  mint: PublicKey;
  uriData: any;
  metadata: MetadataJson;
  emissionsPerDay: number;
  faction: string;
  lastClaim?: Date;
  stakedAt?: Date;
}

export interface StakerInfo {
  holdings: number;
}

export interface ContextValues {
  jungle?: Jungle;
  animals: Animal[];
  stakedAnimals: Animal[];
  userAccount?: TokenAccount;
  getRarityMultiplier: (animal: Animal) => number | undefined;
  getPendingStakingRewards: (
    animal: Animal,
    since: Date
  ) => {
    rewards: number;
    multipliers: {
      total: number;
      holdingsMultiplier: number;
      weeklyMultiplier: number;
    };
  };
  fetchAnimal: (mint: PublicKey) => Promise<Animal | undefined>;
  refreshAnimals: () => Promise<void>;
  fetchUserAccount: () => Promise<void>;
  createAccount: () => Promise<void>;
  stakeAnimal: (animal: Animal) => Promise<void>;
  unstakeAnimal: (animal: Animal) => Promise<void>;
  claimStakingRewards: (animal: Animal) => Promise<void>;
  claimAllStakingRewards: () => Promise<void>;
  stakedAnimalsStatus: any;
  animalsStatus: any;
  avaliableStakedAnimals: Animal[];
  setAvaliableStakedAnimals: (
    _avaliableStakedAnimals?: Animal[]
  ) => Promise<void>;
}
