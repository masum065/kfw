import { useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useState } from 'react';
import { Animal } from '../../../contexts/Staking/types';
import { useStack } from '../../../hooks/useStaking';
import { NftCard } from '../NftCard/NftCard';
import './collections.scss';

export const Collections = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const wallet = useWallet();
  const [selected, setSelected] = useState('');
  const [ready, setReady] = useState(false);
  const [meditation, setMeditation] = useState('');
  const [redeemableRewards, setRedeemableRewards] = useState<number[]>([]);
  const [augment, setAugment] = useState<Animal | null>(null);
  const [checkBoxValues, setCheckboxValues] = useState<string[]>([]);
  const [bulk, setBulk] = useState(false);

  const {
    animals,
    stakedAnimals,
    refreshAnimals,
    userAccount,
    stakeAnimal,
    unstakeAnimal,
    claimStakingRewards,
    claimAllStakingRewards,
  } = useStack();

  const handleClickAway = () => {
    setSelected('');
    setCheckboxValues([]);
    setAugment(null);
  };

  const handleStake = useCallback(async () => {
    if (!augment) return;
    await stakeAnimal(augment);
    setSelected('');
    setAugment(null);
  }, [augment, stakeAnimal]);

  const handleUnStake = useCallback(async () => {
    if (!augment) return;
    await unstakeAnimal(augment);
    setSelected('');
    setAugment(null);
  }, [augment, unstakeAnimal]);

  const handleClaim = useCallback(async () => {
    console.log('claim', augment);
    if (!augment) return;
    await claimStakingRewards(augment);
    setSelected('');
    setAugment(null);
  }, [augment, unstakeAnimal]);

  const handleClaimAll = useCallback(async () => {
    onSetClaimListOnStorage();
    await claimAllStakingRewards();
  }, [unstakeAnimal]);

  // loading state and check has animals
  useEffect(() => {
    setReady(false);
    if (animals.length) {
      setReady(false);
      return;
    }
    if (!animals.length && !ready) {
      const timeoutID = window.setTimeout(() => {
        setReady(true);
      }, 1000);
      return () => window.clearTimeout(timeoutID);
    }
  }, [refreshAnimals, animals.length]);

  useEffect(() => {
    if (ready && animals.length) {
      setReady(false);
    }
  }, [ready, animals]);

  const handleRefresh = async () => {
    await refreshAnimals();
  };

  const updateValue = (coin: number, index: number) => {
    if (!coin) return;
    let redeem: number[] = redeemableRewards.slice(0, stakedAnimals.length);
    redeem[index] = Number(coin.toString().split('e')[0]);
    setRedeemableRewards([...redeem]);
  };

  const handleCheckbox = (name: string) => {
    if (!bulk) {
      setCheckboxValues([name]);
      return;
    } else {
      if (checkBoxValues.includes(name)) {
        const newList = checkBoxValues.filter((value) => value !== name);
        setCheckboxValues(newList);
      } else {
        if (checkBoxValues.length >= 10) return;
        setCheckboxValues([...checkBoxValues, name]);
      }
    }
  };

  useEffect(() => {
    window.sessionStorage.setItem(
      'claimItemList',
      JSON.stringify(checkBoxValues)
    );
  }, [checkBoxValues]);

  const handleClearClaimList = () => {
    setCheckboxValues([]);
    setSelected('');
    window.sessionStorage.removeItem('claimItemList');
  };

  const onSetClaimListOnStorage = () => {
    if (stakedAnimals.length <= 10) {
      const autoClaimList = stakedAnimals.map((token, index) => {
        return `${token.metadata.name}`;
      });
      window.sessionStorage.setItem(
        'claimItemList',
        JSON.stringify(autoClaimList)
      );
    }
  };
  useEffect(() => {
    onSetClaimListOnStorage();
  }, [stakedAnimals]);
  // console.log(animalsStatus);

  // console.log('Staked NFTs', stakedAnimals);

  return (
    <div className='contentContainer'>
      <div className='aboutContainerWrap'>
        <div className='container'>
          <div className='warriorTrainingTabs'>
            <div className='tab-buttons'>
              <button
                onClick={() => setActiveTab(1)}
                className={activeTab === 1 ? 'tab-link active' : 'tab-link'}
              >
                My Warriors
              </button>
              <button
                onClick={() => setActiveTab(2)}
                className={activeTab === 2 ? 'tab-link active' : 'tab-link'}
              >
                Warriors in Training
              </button>
            </div>
            <div className='tab-content' id='myTabContent'>
              <div
                style={{ display: activeTab === 1 ? 'flex' : 'none' }}
                className={
                  animals.length
                    ? 'warriorsTrainingTabContent'
                    : 'myWarriorsTextWrap '
                }
              >
                {animals.length ? (
                  <div className='row'>
                    {animals.map((token, index) => (
                      <div key={index} className='col-md-2'>
                        <NftCard token={token} isStaked={false} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <span>You currenty have no Warriors.</span>
                    <a
                      href='https://www.magiceden.io/marketplace/kfw'
                      className='generalGreenBtn'
                    >
                      Buy now
                    </a>
                  </>
                )}
              </div>

              <div
                style={{ display: activeTab === 2 ? 'block' : 'none' }}
                className='warriorsTrainingTabContent'
              >
                <div className='row'>
                  {stakedAnimals.map((token, index) => (
                    <div key={index} className='col-md-2'>
                      <NftCard
                        redeemableReward={(coin) =>
                          updateValue(Number(coin), index)
                        }
                        token={token}
                        isStaked={true}
                      />
                    </div>
                  ))}
                </div>
                <div className='bottomBoxesWrap'>
                  <div className='box1'>
                    <span>Your earnings:</span>
                  </div>
                  <div className='box2'>
                    <span>
                      {redeemableRewards
                        ?.reduce((a, b) => a + b, 0)
                        .toFixed(3) || '000'}{' '}
                      KFWT
                    </span>
                  </div>
                  <div className='box3'>
                    <button
                      onClick={handleClaimAll}
                      style={{ margin: 0 }}
                      className='generalGreenBtn'
                    >
                      Claim all
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
