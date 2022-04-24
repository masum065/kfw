import { useCallback, useEffect, useState } from 'react';
import { useStack } from '../../../hooks/useStaking';
import { camelCaseToText } from '../../../utils';
import { NftCard } from '../NftCard/NftCard';
import './collections.scss';

export const Collections = () => {
  const [activeTab, setActiveTab] = useState<number>(1);
  const [ready, setReady] = useState(false);
  const [redeemableRewards, setRedeemableRewards] = useState<number[]>([]);
  const [checkBoxValues, setCheckboxValues] = useState<string[]>([]);
  const [bulk, setBulk] = useState(false);

  const {
    animals,
    stakedAnimals,
    refreshAnimals,
    unstakeAnimal,
    claimAllStakingRewards,
    multipliers,
  } = useStack();

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
        if (checkBoxValues.length >= 2) return;
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
    window.sessionStorage.removeItem('claimItemList');
  };

  const onSetClaimListOnStorage = () => {
    if (stakedAnimals.length <= 2) {
      const autoClaimList = stakedAnimals.map((token) => {
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

  // console.log(stakedAnimals[0]);
  return (
    <div className='contentContainer position-relative'>
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
                    {stakedAnimals.length ? (
                      <>
                        <span>
                          Currently all of your Warriors are on Training.
                        </span>
                      </>
                    ) : (
                      <>
                        {' '}
                        <span>You currenty have no Warriors.</span>
                        <a
                          href='https://www.magiceden.io/marketplace/kfw'
                          className='generalGreenBtn'
                        >
                          Buy now
                        </a>
                      </>
                    )}
                  </>
                )}
              </div>

              <div
                style={{ display: activeTab === 2 ? 'block' : 'none' }}
                className='warriorsTrainingTabContent'
              >
                <div className='row'>
                  {stakedAnimals.length ? (
                    stakedAnimals.map((token, index) => (
                      <div key={index} className='col-md-3'>
                        <NftCard
                          redeemableReward={(coin) =>
                            updateValue(Number(coin), index)
                          }
                          onSelect={() => handleCheckbox(token.metadata.name)}
                          token={token}
                          isStaked={true}
                          activeBulk={bulk}
                          limitOfSelection={checkBoxValues.length >= 2}
                        />
                      </div>
                    ))
                  ) : (
                    <span className='alert'>No warrior trained yet.</span>
                  )}
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
                    {!stakedAnimals.length ? (
                      ''
                    ) : stakedAnimals.length >= 2 ? (
                      <>
                        {bulk ? (
                          <>
                            <button
                              style={{ margin: 0 }}
                              className='generalGreenBtn'
                              onClick={claimAllStakingRewards}
                            >
                              Claim {checkBoxValues.length}/10
                            </button>
                            <button
                              style={{ margin: 0 }}
                              className='generalGreenBtn'
                              onClick={() => {
                                setBulk(false);
                                handleClearClaimList();
                              }}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button
                            style={{ margin: 0 }}
                            className='generalGreenBtn'
                            onClick={() => setBulk(true)}
                          >
                            Bulk Claim (max 10)
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        style={{ margin: 0 }}
                        className='generalGreenBtn'
                        onClick={handleClaimAll}
                      >
                        Claim All
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='multipliers-card'>
        <ul>
          {Object.entries(multipliers.list).map((group, index) => {
            const entries = Object.entries(group);
            //@ts-ignore
            const [name, value]: [string, any] = [entries[0][1], entries[1][1]];
            return (
              <li key={index}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <b>
                    {camelCaseToText(name)}{' '}
                    {camelCaseToText(name).split(' ')[1] != 'Multiplier' &&
                      'Combos'}
                    :
                  </b>
                  {typeof value === 'number' && <span>{value}</span>}
                </div>
                <ul className='inner-list'>
                  {typeof value !== 'number' &&
                    Object.entries(value).map((combo) => {
                      const entries = Object.entries(combo);
                      const [name, value]: [string, any] = [
                        //@ts-ignore
                        entries[0][1],
                        entries[1][1],
                      ];
                      if (value !== 0) {
                        return (
                          <li>
                            <span>{camelCaseToText(name)}:</span>{' '}
                            <span>{value}</span>
                          </li>
                        );
                      } else {
                        return;
                      }
                    })}
                </ul>
              </li>
            );
          })}
          <li
            style={{
              borderTop: '1px solid black',
              marginTop: '5px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <b>Total:</b>
            <span>
              1(base) + {Math.round((multipliers.total - 1) * 100) / 100}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
