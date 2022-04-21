import { useCallback, useEffect, useMemo, useState } from 'react';
import { Animal } from '../../../contexts/Staking/types';
import { useStack } from '../../../hooks/useStaking';

interface Props {
  token: Animal;
  isStaked?: boolean;
  redeemableReward?: (coin: Number | String | any) => void;
  // activeBulk?: boolean;
  // limitOfSelection?: boolean;
}

export const NftCard = ({
  token,
  isStaked,
  redeemableReward,
}: // activeBulk,
// limitOfSelection,
Props) => {
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

  const [multipliers, setMultipliers] = useState<{
    total: number;
    holdingsMultiplier: number;
    weeklyMultiplier: number;
  }>({ total: 1, holdingsMultiplier: 0, weeklyMultiplier: 0 });

  const extraMultiplier = useMemo(
    () => (multipliers?.total > 1 ? multipliers?.total : false),
    [multipliers]
  );

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
    console.log(augmentedAnimal);
    if (!augmentedAnimal) return;
    await claimStakingRewards(augmentedAnimal);
    console.log('claim');
    fetchAnimalStats();
  }, [augmentedAnimal, claimStakingRewards, fetchAnimalStats]);

  // pending rewords
  // useEffect(() => {
  //   if (!augmentedAnimal?.lastClaim || !stakingPeriod) return;
  //   if (augmentedAnimal?.lastClaim && isStaked) {
  //     const redeem = getPendingStakingRewards(augmentedAnimal, stakingPeriod);

  //     return () => {
  //       setRedeemable(redeem);
  //     };
  //   }
  // }, [augmentedAnimal, stakingPeriod, getPendingStakingRewards]);

  useEffect(() => {
    if (!augmentedAnimal?.lastClaim || !stakingPeriod) return;
    if (augmentedAnimal?.lastClaim && isStaked) {
      const { pendingRewards: rewards, multipliers } = getPendingStakingRewards(
        augmentedAnimal,
        stakingPeriod
      );
      setRedeemable(rewards);
      setMultipliers(multipliers);
      // console.log(rewards);
      //@ts-ignore
      redeemableReward(rewards);

      return () => {};
    }
  }, [augmentedAnimal, stakingPeriod, getPendingStakingRewards, isStaked]);
  return (
    <div>
      <div className='warriorTabContentBox'>
        {/* {activeBulk ? ( */}
        {/* <SelectNFT disabled={limitOfSelection} value={token.metadata.name}> */}
        {/* <img src={token.uriData.image} alt='' /> */}
        {/* </SelectNFT> */}
        {/* ) : ( */}
        <img src={token.metadata.image} alt='' />
        {/* )} */}
        <span>{token.metadata.name}</span>
        {extraMultiplier && (
          <div>
            <h6>Extra Multiplier:</h6>
            <p>{extraMultiplier}X</p>
          </div>
        )}

        {augmentedAnimal?.lastClaim && isStaked ? (
          <div style={{ display: 'flex', gap: 10 }}>
            <button className='generalGreenBtn small' onClick={handleUnstake}>
              Unstake
            </button>
            <button className='generalGreenBtn small' onClick={handleClaim}>
              Claim
            </button>
          </div>
        ) : (
          <button className='generalGreenBtn small' onClick={handleStake}>
            Stake
          </button>
        )}

        {/* <div className='multiplier-box'>
          <span>Earning Per Day</span>{' '}
          <span>
            <span style={{ fontSize: 10, textTransform: 'lowercase' }}>x</span>
            {(token?.emissionsPerDay || 0) / 10 ** 9}
          </span>
        </div> */}

        {/* {augmentedAnimal?.lastClaim && isStaked ? (
          <div className='multiplier-box'>
            <span>Pending Earnings</span>{' '}
            <span>{redeemable.toPrecision(5)}</span>
          </div>
        ) : (
          ''
        )} */}
      </div>

      {/* <ButtonGroup>
        {augmentedAnimal?.lastClaim && isStaked ? (
          <>
            <button onClick={handleClaim}>Claim Earning</button>
            <button onClick={handleUnstake}>Unstake</button>
          </>
        ) : (
          <button onClick={handleStake}>Stake</button>
        )}
      </ButtonGroup> */}
    </div>
  );
};
