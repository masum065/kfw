import { PublicKey } from '@solana/web3.js';
import { createContext } from 'react';
import { Animal, ContextValues } from './types';

export const StackContext = createContext<ContextValues>({
  animals: [],
  stakedAnimals: [],
  getRarityMultiplier: () => 0,
  getMultipliers: () => ({ total: 0, list: 0 }),
  getPendingStakingRewards: () => ({ baseRewards: 0, pendingRewards: 0 }),
  fetchAnimal: (mint: PublicKey) => new Promise(() => {}),
  refreshAnimals: () => new Promise(() => {}),
  fetchUserAccount: () => new Promise(() => {}),
  createAccount: () => new Promise(() => {}),
  stakeAnimal: () => new Promise(() => {}),
  unstakeAnimal: () => new Promise(() => {}),
  claimStakingRewards: () => new Promise(() => {}),
  claimAllStakingRewards: () => new Promise(() => {}),
  stakedAnimalsStatus: {},
  animalsStatus: {},
  avaliableStakedAnimals: [],
  setAvaliableStakedAnimals: (_avaliableStakedAnimals?: Animal[]) =>
    new Promise(() => {}),
});
