import { useContext } from 'react';
import { StackContext } from '../contexts/Staking/Context';

export const useStack = () => {
  return {
    ...useContext(StackContext),
  };
};
