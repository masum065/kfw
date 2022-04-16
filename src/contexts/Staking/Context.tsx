import { PublicKey } from '@solana/web3.js';
import { createContext } from 'react';
import { Animal, ContextValues } from './types';

export const StackContext = createContext<ContextValues>({
  animals: [],
  stakedAnimals: [],
  getRarityMultiplier: () => 0,
  getPendingStakingRewards: () => ({
    rewards: 0,
    multipliers: { total: 1, holdingsMultiplier: 0, weeklyMultiplier: 0 },
  }),
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
