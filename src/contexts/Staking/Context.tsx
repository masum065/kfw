import { PublicKey } from '@solana/web3.js';
import { createContext } from 'react';
import { ContextValues } from './types';

export const StackContext = createContext<ContextValues>({
  animals: [],
  stakedAnimals: [],
  getRarityMultiplier: () => 0,
  getPendingStakingRewards: () => 0,
  fetchAnimal: (mint: PublicKey) => new Promise(() => {}),
  refreshAnimals: () => new Promise(() => {}),
  fetchUserAccount: () => new Promise(() => {}),
  createAccount: () => new Promise(() => {}),
  stakeAnimal: () => new Promise(() => {}),
  unstakeAnimal: () => new Promise(() => {}),
  claimStakingRewards: () => new Promise(() => {}),
  claimAllStakingRewards: () => new Promise(() => {}),
  status: {},
});
