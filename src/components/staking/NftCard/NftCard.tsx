import { useCallback, useEffect, useState } from 'react';
import { Animal } from '../../../contexts/Staking/types';
import { useStack } from '../../../hooks/useStaking';
import { ButtonGroup, SelectNFT, StyledNftItem } from './styles';

interface Props {
  token: Animal;
  isStaked?: boolean;
  activeBulk?: boolean;
  limitOfSelection?: boolean;
}

export const NftCard = ({
  token,
  isStaked,
  activeBulk,
  limitOfSelection,
}: Props) => {
  const {
    getPendingStakingRewards,
    fetchAnimal,
    stakeAnimal,
    unstakeAnimal,
    claimStakingRewards,
  } = useStack();

  const [augmentedAnimal, setAugmentedAnimal] = useState<Animal>();
  const [stakingPeriod, setStakingPeriod] = useState<Date>(new Date());
  const [redeemable, setRedeemable] = useState<number>(0);

  const fetchAnimalStats = useCallback(async () => {
    setAugmentedAnimal(await fetchAnimal(token.mint));
  }, [token, fetchAnimal]);

  useEffect(() => {
    if (!token.lastClaim) fetchAnimalStats();
  }, [token, fetchAnimalStats]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (augmentedAnimal) setStakingPeriod(new Date());
    }, 500);
    return () => clearInterval(interval);
  }, [augmentedAnimal, getPendingStakingRewards, setStakingPeriod]);

  // handle Stake Nft
  const handleStake = useCallback(async () => {
    if (!augmentedAnimal) return;
    await stakeAnimal(augmentedAnimal);
  }, [augmentedAnimal, stakeAnimal]);

  // handle Unstake NFt
  const handleUnstake = useCallback(async () => {
    if (!augmentedAnimal) return;
    await unstakeAnimal(augmentedAnimal);
  }, [augmentedAnimal, unstakeAnimal]);

  // handle Claim Earning
  const handleClaim = useCallback(async () => {
    if (!augmentedAnimal) return;
    await claimStakingRewards(augmentedAnimal);
    fetchAnimalStats();
  }, [augmentedAnimal, claimStakingRewards, fetchAnimalStats]);

  // pending rewords
  useEffect(() => {
    if (!augmentedAnimal?.lastClaim || !stakingPeriod) return;
    if (augmentedAnimal?.lastClaim && isStaked) {
      const redeem = getPendingStakingRewards(augmentedAnimal, stakingPeriod);

      return () => {
        setRedeemable(redeem);
      };
    }
  }, [augmentedAnimal, stakingPeriod, getPendingStakingRewards]);
  return (
    <StyledNftItem>
      <div className='token-info'>
        {activeBulk ? (
          <SelectNFT disabled={limitOfSelection} value={token.metadata.name}>
            <img src={token.uriData.image} alt='' />
          </SelectNFT>
        ) : (
          <img src={token.uriData.image} alt='' />
        )}
        <p className='name'>{token.uriData.name}</p>

        <div className='multiplier-box'>
          <span>Earning Per Day</span>{' '}
          <span>
            <span style={{ fontSize: 10, textTransform: 'lowercase' }}>x</span>
            {(token?.emissionsPerDay || 0) / 10 ** 9}
          </span>
        </div>

        {augmentedAnimal?.lastClaim && isStaked ? (
          <div className='multiplier-box'>
            <span>Pending Earnings</span>{' '}
            <span>{redeemable.toPrecision(5)}</span>
          </div>
        ) : (
          ''
        )}
      </div>

      <ButtonGroup>
        {augmentedAnimal?.lastClaim && isStaked ? (
          <>
            <button onClick={handleClaim}>Claim Earning</button>
            <button onClick={handleUnstake}>Unstake</button>
          </>
        ) : (
          <button onClick={handleStake}>Stake</button>
        )}
      </ButtonGroup>
    </StyledNftItem>
  );
};
