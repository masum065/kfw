import { useCallback, useEffect, useMemo, useState } from "react";
import ReactTooltip from "react-tooltip";
import { Animal, Rewards } from "../../../contexts/Staking/types";
import { useStack } from "../../../hooks/useStaking";

interface Props {
  token: Animal;
  isStaked?: boolean;
  redeemableReward?: (coin: Number | String | any) => void;
  activeBulk?: boolean;
  limitOfSelection?: boolean;
  onSelect?: () => void;
}

export const NftCard = ({
  token,
  isStaked,
  redeemableReward,
  activeBulk,
  limitOfSelection,
  onSelect,
}: Props) => {
  const {
    getCombos,
    getPendingStakingRewards,
    fetchAnimal,
    stakeAnimal,
    unstakeAnimal,
    claimStakingRewards,
  } = useStack();

  const [augmentedAnimal, setAugmentedAnimal] = useState<Animal>();
  const [stakingPeriod, setStakingPeriod] = useState<Date>(new Date());
  const [combos, setCombos] = useState<{ attribute: string; value: string }[]>(
    []
  );
  const [redeemable, setRedeemable] = useState<Rewards>({
    baseRewards: 0,
    pendingRewards: 0,
  });

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
    console.log("claim");
    fetchAnimalStats();
  }, [augmentedAnimal, claimStakingRewards, fetchAnimalStats]);

  // pending rewords
  useEffect(() => {
    if (!augmentedAnimal?.lastClaim || !stakingPeriod) return;
    if (augmentedAnimal?.lastClaim && isStaked) {
      const redeemable = getPendingStakingRewards(
        augmentedAnimal,
        new Date()
      );
      console.log(redeemable)
      setRedeemable(redeemable);
      setMultipliers(multipliers);
      //@ts-ignore
      redeemableReward(redeemable.baseRewards);

      return () => {};
    }
  }, [augmentedAnimal, stakingPeriod, getPendingStakingRewards, isStaked]);

  useEffect(() => {
    const combos = Object.entries(getCombos(token)).map(
      ([key, value]) => value && { attribute: key, value }
    ) as { attribute: string; value: string }[];
    setCombos(combos.filter((elem) => elem != undefined));
  }, [setCombos, getCombos]);

  //@ts-ignore
  const claimList = JSON.parse(sessionStorage.getItem("claimItemList"));

  return (
    <div>
      <div className="warriorTabContentBox">
        {activeBulk ? (
          <div
            onClick={onSelect}
            className={`token-image ${
              activeBulk && claimList.includes(token.metadata.name)
                ? "selected"
                : "active-select"
            } ${
              limitOfSelection && !claimList.includes(token.metadata.name)
                ? "selection-disabled"
                : "selection-allowed "
            }`}
          >
            <img src={token.metadata.image} alt="" />
          </div>
        ) : (
          <div
            className={`token-image`}
            data-tip
            data-for={token.metadata.name}
          >
            <img src={token.metadata.image} alt="" />
          </div>
        )}
        <span>{token.metadata.name}</span>
        {extraMultiplier && (
          <div>
            <h6>Extra Multiplier:</h6>
            <p>{extraMultiplier}X</p>
          </div>
        )}
        <div className="counter-box">
          <h6>Daily Emission:</h6>
          <p>{(token?.emissionsPerDay || 0) / 10 ** 9}X</p>
        </div>

        {augmentedAnimal?.lastClaim && isStaked && (
          <div className="counter-box">
            <h6>Redeemable:</h6>
            <p>{redeemable.pendingRewards.toFixed(5)}</p>
          </div>
        )}

        {augmentedAnimal?.lastClaim && isStaked ? (
          <div
            style={{ display: "grid", gap: 5, gridTemplateColumns: "1fr 1fr" }}
          >
            <button className="generalGreenBtn small" onClick={handleUnstake}>
              Unstake
            </button>
            <button className="generalGreenBtn small" onClick={handleClaim}>
              Claim
            </button>
          </div>
        ) : (
          <button className="generalGreenBtn small" onClick={handleStake}>
            Stake
          </button>
        )}

        <ReactTooltip
          id={token.metadata.name}
          place="top"
          type="light"
          effect="solid"
        >
          <div className="combo-box">
            <h5>Eligible Attributes for Combos</h5>
            {combos.length > 0 ? (
              <ul className="combo-list">
                {combos.map((combo) => (
                  <li key={combo.attribute}>
                    <b style={{ textTransform: "capitalize" }}>
                      {combo.attribute}:
                    </b>{" "}
                    {combo.value}
                  </li>
                ))}
              </ul>
            ) : (
              "No Attribute is eligible for combo."
            )}
          </div>
        </ReactTooltip>
      </div>
    </div>
  );
};
