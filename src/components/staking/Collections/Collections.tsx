import { useWallet } from '@solana/wallet-adapter-react';
import { Checkbox, Skeleton } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useStack } from '../../../hooks/useStaking';
import { StakingCounter } from '../Counter/StakingCounter';
import { NftCard } from '../NftCard/NftCard';
import {
  Root,
  RootWrapper,
  StakeTitle,
  StyledClaimActionWrapper,
  StyledNFTContainer,
  StyledStackContainer,
  StyledSubTitle,
} from './styles';

export const CollectionsV2 = () => {
  const { animals, stakedAnimals, claimAllStakingRewards, status } = useStack();
  const { connected } = useWallet();
  const [animalsReady, setAnimalsReady] = useState(false);
  const [bulk, setBulk] = useState(false);
  const [selectedNfts, setSelectedNfts] = useState<string[]>([]);
  const [stakedAnimalsReady, setStakedAnimalsReady] = useState(false);

  const handleClaimAll = useCallback(async () => {
    await claimAllStakingRewards();
  }, [stakedAnimals]);

  // loading state and check has animals
  useEffect(() => {
    setAnimalsReady(false);
    if (animals.length) {
      setAnimalsReady(false);
      return;
    }
    if (!animals.length && !animalsReady) {
      const timeoutID = window.setTimeout(() => {
        setAnimalsReady(true);
      }, 1000);
      return () => window.clearTimeout(timeoutID);
    }
  }, [animals.length]);

  useEffect(() => {
    if (animalsReady && animals.length) {
      setAnimalsReady(false);
    }
  }, [animalsReady, animals]);

  // loading state and check has staked animals
  useEffect(() => {
    setStakedAnimalsReady(false);
    if (stakedAnimals.length) {
      setStakedAnimalsReady(false);
      return;
    }
    if (!stakedAnimals.length && !stakedAnimalsReady) {
      const timeoutID = window.setTimeout(() => {
        setStakedAnimalsReady(true);
      }, 1000);
      return () => window.clearTimeout(timeoutID);
    }
  }, [stakedAnimals.length]);

  useEffect(() => {
    if (stakedAnimalsReady && stakedAnimals.length) {
      setStakedAnimalsReady(false);
    }
  }, [stakedAnimalsReady, stakedAnimals]);

  // handle bulk selection
  const onSelectChange = (checkedValues: any) => {
    console.log('checked = ', checkedValues);
    window.sessionStorage.setItem(
      'claimItemList',
      JSON.stringify(checkedValues)
    );

    setSelectedNfts(checkedValues);
  };

  useEffect(() => {
    if (stakedAnimals.length <= 10) {
      const autoClaimList = stakedAnimals.map((token) => {
        return token.metadata.name;
      });

      window.sessionStorage.setItem(
        'claimItemList',
        JSON.stringify(autoClaimList)
      );
    }
  }, [stakedAnimals]);

  // scrolling conditions

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    function watchScroll() {
      window.addEventListener('scroll', () => setScrollY(window.pageYOffset));
    }
    watchScroll();
    // Remove listener (like componentWillUnmount)
    return () => {
      window.removeEventListener('scroll', () =>
        setScrollY(window.pageYOffset)
      );
    };
  }, []);

  return (
    <Root>
      <StakeTitle style={{ height: connected ? '100%' : '40vh' }}>
        {!connected && <StakingCounter />}
        {connected ? 'STAKING' : 'Please connect your wallet first to stake'}
      </StakeTitle>

      {connected ? (
        <StyledStackContainer>
          <div>
            <StyledSubTitle>Unstaked Students</StyledSubTitle>

            <RootWrapper>
              {animalsReady && !animals.length && status.animals.loadingEnd ? (
                <>
                  {stakedAnimals.length ? (
                    <h2 className='info'>
                      All Students are Staked Get some More?{' '}
                      <a
                        href='https://magiceden.io/marketplace/solana_monkey_university'
                        target='_blank'
                      >
                        Click Here
                      </a>
                    </h2>
                  ) : (
                    <h2 className='info'>
                      You currently have no Students.
                      <a
                        href='https://magiceden.io/marketplace/solana_monkey_university'
                        target='_blank'
                      >
                        Buy Now
                      </a>
                    </h2>
                  )}
                </>
              ) : (
                <StyledNFTContainer>
                  {status.animals.loading
                    ? [...Array(3)].map((arr, i) => (
                        <Skeleton.Avatar
                          key={i}
                          active
                          shape='square'
                          size={200}
                        />
                      ))
                    : animals?.map((animal) => (
                        <NftCard
                          key={animal.uriData.image}
                          isStaked={false}
                          token={animal}
                        />
                      ))}
                </StyledNFTContainer>
              )}
            </RootWrapper>
          </div>
          <div>
            <StyledSubTitle>Staked Students</StyledSubTitle>

            <RootWrapper>
              {stakedAnimals.length || status.stakedAnimals.loading ? (
                <Checkbox.Group
                  style={{ width: '100%' }}
                  value={selectedNfts}
                  onChange={onSelectChange}
                >
                  <StyledNFTContainer>
                    {stakedAnimals.length
                      ? stakedAnimals?.map((animal) => (
                          <NftCard
                            key={animal.uriData.image}
                            isStaked={true}
                            token={animal}
                            activeBulk={bulk}
                            limitOfSelection={selectedNfts.length >= 10}
                          />
                        ))
                      : status.stakedAnimals.loading
                      ? [...Array(3)].map((arr, i) => (
                          <Skeleton.Avatar
                            key={i}
                            active
                            shape='square'
                            size={200}
                          />
                        ))
                      : ''}
                  </StyledNFTContainer>
                </Checkbox.Group>
              ) : (
                ''
              )}
              {!stakedAnimals.length && !status.stakedAnimals.loading ? (
                <h2 className='info'>No Students are Staked... yet {`;)`}</h2>
              ) : (
                ''
              )}
            </RootWrapper>
          </div>
        </StyledStackContainer>
      ) : (
        ''
      )}

      <StyledClaimActionWrapper
        style={{ bottom: scrollY > 20 ? '3%' : '-20%' }}
      >
        {!stakedAnimals.length ? (
          ''
        ) : stakedAnimals.length > 10 ? (
          <>
            {bulk ? (
              <>
                <button onClick={claimAllStakingRewards}>
                  Claim {selectedNfts.length} Reward
                </button>
                <button
                  onClick={() => {
                    setBulk(false);
                    onSelectChange(null);
                    setSelectedNfts([]);
                    window.sessionStorage.removeItem('claimItemList');
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setBulk(!bulk);
                  setSelectedNfts([]);
                  window.sessionStorage.removeItem('claimItemList');
                }}
              >
                Bulk Claim (max 10)
              </button>
            )}
          </>
        ) : (
          <button onClick={handleClaimAll}>Claim All Earnings</button>
        )}
      </StyledClaimActionWrapper>
    </Root>
  );
};
