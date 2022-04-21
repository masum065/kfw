import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import * as anchor from '@project-serum/anchor';
import {
  AccountInfo as TokenAccount,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import relativeTime from 'dayjs/plugin/relativeTime'; // import plugin
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import constants from '../../constants';
import idl from '../../constants/idls/mainnet.jungle.json';
import {
  IDL as JundleIdl,
  Jungle as JungleProgram,
} from '../../constants/types/jungle';
import { buildLeaves, factionToNumber } from '../../utils';
import { MerkleTree } from '../../utils/merkleTree';
import { StackContext } from './Context';
import {
  Animal,
  Jungle,
  Multipliers,
  StakedMetaData,
  StakerInfo,
} from './types';

const kfwComboEncoding: any = require('../../constants/kfwComboEncoding.json');

dayjs.extend(relativeTime); // use plugin
dayjs.locale('en'); // use locale

// Program Id
const programID = new PublicKey(idl.metadata.address);

const check_combo_distinct = (
  value: number,
  combo_values: number[],
  combo: number[]
): number[] => {
  let index = combo_values.indexOf(value);
  let check_exist = combo.indexOf(value);

  if (check_exist > -1) {
    if (index > -1) {
      combo.push(combo_values[index]);
    }
  }
  return combo;
};

const check_combo = (
  value: number,
  combo_values: number[],
  combo: number[]
): number[] => {
  let index = combo_values.indexOf(value);
  if (index > -1) {
    combo.push(combo_values[index]);
  }
  return combo;
};

const check_multiplier = (
  combo_count: number,
  limit1: number,
  multiplier1: number,
  limit2: number,
  multiplier2: number
): number => {
  if (combo_count > limit2) {
    return multiplier2;
  } else if (combo_count > limit1) {
    return multiplier1;
  }
  return 0.0;
};

export interface Props {
  children: ReactNode;
  connection: anchor.web3.Connection;
}

// Staking Provider Main
export const StakingProvider = (props: Props) => {
  const wallet = useWallet();
  const [userAccount, setUserAccount] = useState<TokenAccount>();
  const [animals, setAnimals] = useState<Animal[]>();
  const [jungle, setJungle] = useState<Jungle>();
  const [stakerInfo, setStakerInfo] = useState<StakerInfo>();
  const [stakedAnimals, setStakedAnimals] = useState<Animal[]>();
  const [animalsStatus, setAnimalsStatus] = useState<any>({
    loading: false,
    loadingEnd: true,
    finish: true,
  });
  const [stakedAnimalsStatus, setStakedAnimalsStatus] = useState<any>({
    loading: false,
    loadingEnd: true,
    finish: true,
  });
  const [avaliableStakedAnimals, setStateAvaliableStakedAnimals] = useState<
    Animal[]
  >([]);

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }
    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    };
  }, [wallet]);

  // confirmed provider
  const provider = useMemo(() => {
    if (!props.connection) return;
    return new anchor.Provider(props.connection, wallet as any, {
      preflightCommitment: 'confirmed',
    });
  }, [props.connection, wallet]);

  const tree = useMemo(() => {
    const leaves = buildLeaves(
      //@ts-ignore
      constants.metadata.map((e, i) => ({
        mint: new PublicKey(e.mint),
        emissionsPerDay: e.emissionsPerDay,
        faction: factionToNumber(e.faction),
      }))
    );
    return new MerkleTree(leaves);
  }, []);

  // fetch own animals
  const fetchAnimals = useCallback(async () => {
    if (!props.connection || !wallet.publicKey) return;
    try {
      setAnimalsStatus({
        loading: true,
        loadingEnd: false,
        finish: false,
      });
      const owned = await Metadata.findDataByOwner(
        props.connection,
        wallet.publicKey
      );
      const collectionMints = constants.metadata.map((e) => e.mint);

      const data = owned
        .map((e) => e.mint)
        .filter((e) => collectionMints.includes(e))
        .map((e) => {
          const metadataItem = constants.metadata.filter(
            (f) => f.mint === e
          )[0];
          return {
            mint: new PublicKey(e),
            metadata: metadataItem.arweave,
            uriData: metadataItem.metadata,
            emissionsPerDay: metadataItem.emissionsPerDay,
            faction: metadataItem.faction,
          };
        })
        .sort((a, b) => {
          const na = Number(a.metadata.name.split('#')[1]);
          const nb = Number(b.metadata.name.split('#')[1]);
          return na - nb;
        });
      setAnimals(data);
    } catch (err) {
      console.log('Failed fetching owned tokens', err);
    } finally {
      setAnimalsStatus({
        loading: false,
        loadingEnd: true,
        finish: true,
      });
    }
  }, [wallet, props.connection]);

  useEffect(() => {
    fetchAnimals();
  }, [anchorWallet, fetchAnimals]);

  // Fetches the animals staked by the user
  const fetchStakedAnimals = useCallback(async () => {
    if (!props.connection || !wallet.publicKey) return;
    setStakedAnimalsStatus({
      loading: true,
      loadingEnd: false,
      finish: false,
    });
    const program = new anchor.Program(idl as anchor.Idl, programID, provider);

    try {
      const staked = await program.account.animal.all([
        {
          memcmp: {
            offset: 42, // Bumps + mint
            bytes: wallet.publicKey.toString(),
          },
        },
      ]);
      const collectionMints = constants.metadata.map((e) => e.mint);
      const data = staked
        .map((e) => e.account.mint.toString())
        .filter((e) => collectionMints.includes(e))
        .map((e) => {
          const metadataItem = constants.metadata.filter(
            (f) => f.mint === e
          )[0];
          return {
            mint: new PublicKey(e),
            metadata: metadataItem.arweave,
            uriData: metadataItem.metadata,
            emissionsPerDay: metadataItem.emissionsPerDay,
            faction: metadataItem.faction,
          };
        })
        .sort((a, b) => {
          const na = Number(a.metadata.name.split('#')[1]);
          const nb = Number(b.metadata.name.split('#')[1]);
          return na - nb;
        });
      setStakedAnimals(data);
    } catch (err) {
      console.log('Failed fetching owned tokens', err);
    } finally {
      setStakedAnimalsStatus({
        loading: false,
        loadingEnd: true,
        finish: true,
      });
    }
  }, [provider, wallet, props.connection]);

  useEffect(() => {
    fetchStakedAnimals();
  }, [anchorWallet, fetchStakedAnimals]);

  // Fetch jungle
  const fetchJungle = useCallback(async () => {
    if (!provider) return;
    const program = new anchor.Program<JungleProgram>(
      JundleIdl,
      programID,
      provider
    );

    const [jungleAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('jungle'), constants.jungleKey.toBuffer()],
      programID
    );

    const fetchedJungle = await program.account.jungle.fetch(jungleAddress);
    setJungle({
      key: fetchedJungle.key,
      owner: fetchedJungle.owner,
      escrow: fetchedJungle.escrow,
      mint: fetchedJungle.mint,
      rewardsAccount: fetchedJungle.rewardsAccount,
      animalsStaked: fetchedJungle.animalsStaked,
      maximumRarity: fetchedJungle.maximumRarity,
      maximumRarityMultiplier: fetchedJungle.maximumRarityMultiplier,
      weeklyMultiplier: fetchedJungle.weeklyMultiplier,
      holdingsMultiplier: fetchedJungle.holdingsMultiplier,
      baseWeeklyEmissions: fetchedJungle.baseWeeklyEmissions,
      root: fetchedJungle.root,
    });
  }, [provider]);

  useEffect(() => {
    fetchJungle();
  }, [anchorWallet, fetchJungle]);

  // Fetches the staking rewards account

  const fetchUserAccount = useCallback(async () => {
    if (!jungle || !props.connection || !wallet || !wallet.publicKey) return;

    try {
      const associatedAddress = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        jungle.mint,
        wallet.publicKey
      );

      const token = new Token(
        props.connection,
        jungle.mint,
        TOKEN_PROGRAM_ID,
        wallet as any
      );
      setUserAccount(await token.getAccountInfo(associatedAddress));
    } catch (err) {
      console.log('User has no account yet');
    }
  }, [props.connection, jungle, wallet]);

  useEffect(() => {
    fetchUserAccount();
  }, [fetchUserAccount]);

  // fetch staker info
  const fetchStakerInfo = useCallback(async () => {
    if (
      !jungle ||
      !props.connection ||
      !wallet ||
      !wallet.publicKey ||
      !provider
    )
      return;
    try {
      const program = new anchor.Program<JungleProgram>(
        JundleIdl,
        programID,
        provider
      );

      const [jungleAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('jungle', 'utf8'), jungle.key.toBuffer()],
        program.programId
      );

      const [stakerInfo] = await PublicKey.findProgramAddress(
        [
          Buffer.from('staker', 'utf8'),
          jungleAddress.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const stakerInfoAccount = await program.account.stakerInfo.fetch(
        stakerInfo
      );
      const holdings = stakerInfoAccount.holdings.toNumber();
      const staked: any = stakerInfoAccount.staked;
      console.log('Holdings: ', holdings);
      console.log('Staked', staked);

      setStakerInfo({ holdings, staked });
    } catch (e) {
      console.log('Staker Info Account not Created Yet!');
    }
  }, [props.connection, jungle, wallet, provider]);
  useEffect(() => {
    fetchStakerInfo();
  }, [fetchStakerInfo]);

  const createAccount = useCallback(async () => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signTransaction ||
      !jungle ||
      !anchor.Provider
    )
      return;
    try {
      fetchUserAccount();
    } catch (err) {
      console.log(err);
    } finally {
      console.log('finish');
    }
  }, [jungle, wallet, fetchUserAccount]);

  const getRarityMultiplier = useCallback(
    (animal: Animal) => {
      if (!jungle) return;

      return (
        ((Math.min(
          jungle.maximumRarity.toNumber(),
          animal.emissionsPerDay || animal.emissionsPerDay
        ) /
          jungle.maximumRarity.toNumber()) *
          (jungle.maximumRarityMultiplier.toNumber() - 10000) +
          10000) /
        10000
      );
    },
    [jungle]
  );

  const getMultipliers = useCallback((): Multipliers => {
    if (!stakerInfo || !jungle)
      return {
        total: 1,
        list: {},
      };

    // Total Multipliers
    let totalMultipliers = 1.0;
    let allMultipliers: any = {};

    // Fetch amount of animals staked from StakerInfo
    const holdings = stakerInfo.holdings;
    let holdingsMultiplier =
      holdings * jungle.holdingsMultiplier.toNumber() -
      jungle.holdingsMultiplier.toNumber();

    if (holdings > 20) {
      holdingsMultiplier += 2.0;
    } else if (holdings >= 16) {
      holdingsMultiplier += 1.5;
    } else if (holdings >= 11) {
      holdingsMultiplier += 0.9;
    } else if (holdings >= 6) {
      holdingsMultiplier += 0.5;
    } else if (holdings >= 1) {
      holdingsMultiplier += 0.2;
    }
    totalMultipliers += holdingsMultiplier;
    allMultipliers['holdingsMultiplier'] = holdingsMultiplier;

    // Calculating Combo Multipliers

    // Legendary Backgrounds Combo
    let legendary_bg_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Hong Kong Combo
    let hk_combo_values = [11, 12, 13];
    let hk_combo: number[] = [];

    // Full Elemental Combo
    let full_element_combo_values = [14, 15, 16, 17, 18, 19];
    let full_element_combo: number[] = [];

    // Basic Elemental Combo
    let basic_element_combo_values = [14, 20, 21, 22, 23, 24];
    let basic_element_combo: number[] = [];

    // Back Accessory Combo
    let back_accessory_combo_values = [0, 1, 2, 3];
    let back_accessory_combo: number[] = [];

    // Skin Combo: Water Spirit Combo
    let skin_combo_1_values = [0];
    let skin_combo_1: number[] = [];

    // Skin Combo: Alien Combo
    let skin_combo_2_values = [1];
    let skin_combo_2: number[] = [];

    // Clothing Combo: Armor Combo
    let clothing_combo_1_values = [0, 1, 2, 3, 4, 5];
    let clothing_combo_1: number[] = [];

    // Clothing Combo: Ninja Combo
    let clothing_combo_2_values = [6, 7, 8, 9];
    let clothing_combo_2: number[] = [];

    // Clothing Combo: Superhero Combo
    let clothing_combo_3_values = [10, 11, 12];
    let clothing_combo_3: number[] = [];

    // Clothing Combo: KF Hero Combo
    let clothing_combo_4_values = [13, 14, 15];
    let clothing_combo_4: number[] = [];

    // Clothing Combo: Street Karate Combo
    let clothing_combo_5_values = [16, 17, 18, 19, 20, 21, 22, 23, 24];
    let clothing_combo_5: number[] = [];

    // Clothing Combo: Anime Combo
    let clothing_combo_6_values = [
      25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    ];
    let clothing_combo_6: number[] = [];

    // Front Accessory Combo
    let front_accessory_combo_values = [0, 1, 2, 3];
    let front_accessory_combo: number[] = [];

    // Hair Combo: Legendary Hair Combo
    let hair_combo_1_values = [0, 1, 2, 3, 4];
    let hair_combo_1 = [0, 0, 0, 0, 0];

    // Hair Combo: Super Fire Combo
    let hair_combo_2_values = [5, 6, 7, 8];
    let hair_combo_2: number[] = [];

    // Hair Combo: Lu Fu Combo
    let hair_combo_3_values = [9, 10, 11, 12, 13];
    let hair_combo_3: number[] = [];

    // Hair Combo: Mask Combo
    let hair_combo_4_values = [14, 15, 16, 17, 18, 19, 20];
    let hair_combo_4: number[] = [];

    // Hair Accessory Combo
    let hair_accessory_combo_values = [0, 1, 2, 3, 4, 5, 6, 7];
    let hair_accessory_combo = [0, 0, 0, 0, 0, 0, 0, 0];

    // Mouth Accessory Combo
    let mouth_accessory_combo_values = [0, 1];
    let mouth_accessory_combo = [0, 0];

    // Eye Combo: Laser Combo
    let eye_combo_1_values = [0];
    let eye_combo_1: number[] = [];

    // Eye Combo: Large Eye Combo
    let eye_combo_2_values = [1, 2, 3];
    let eye_combo_2: number[] = [];

    // Eyewear Combo: Cyclops Combo
    let eyewear_combo_1_values = [0, 1, 2, 3, 4];
    let eyewear_combo_1: number[] = [];

    // Eyewear Combo: Solana Combo
    let eyewear_combo_2_values = [5, 6, 7, 8];
    let eyewear_combo_2: number[] = [];

    // Eyewear Combo: VR Combo
    let eyewear_combo_3_values = [9, 10, 11];
    let eyewear_combo_3: number[] = [];

    stakerInfo.staked.forEach((animal: StakedMetaData) => {
      // Animal Attributes
      let background = animal.background;
      let back_accessory = animal.backAccessory;
      let skin = animal.skin;
      let clothing = animal.clothing;
      let front_accessory = animal.frontAccessory;
      let hair = animal.hair;
      let hair_accessory = animal.hairAccessory;
      let mouth_accessory = animal.mouthAccessory;
      let eyes = animal.eyes;
      let eyewear = animal.eyewear;

      // BACKGROUND
      allMultipliers['background'] = {};

      // Adding to Multiplier if any animal has legendary background
      let index = legendary_bg_values.indexOf(background);
      allMultipliers['background']['legendaryCombo'] = 0;
      if (index > -1) {
        totalMultipliers += 0.4;
        allMultipliers['background']['legendaryCombo'] += 0.4;
      }

      // Checking for Hong Kong Background Combo
      check_combo_distinct(background, hk_combo_values, hk_combo);

      // Checking for Full Element Background Combo
      check_combo_distinct(
        background,
        full_element_combo_values,
        full_element_combo
      );

      // Checking for Basic Element Background Combo
      check_combo_distinct(
        background,
        basic_element_combo_values,
        basic_element_combo
      );

      // Checking for Back Accessory Combo
      check_combo(
        back_accessory,
        back_accessory_combo_values,
        back_accessory_combo
      );

      // Checking for Skin Combo 1
      check_combo(skin, skin_combo_1_values, skin_combo_1);

      // Checking for Skin Combo 2
      check_combo(skin, skin_combo_2_values, skin_combo_2);

      // Checking for Clothing Combo 1
      check_combo(clothing, clothing_combo_1_values, clothing_combo_1);

      // Checking for Clothing Combo 2
      check_combo(clothing, clothing_combo_2_values, clothing_combo_2);

      // Checking for Clothing Combo 3
      check_combo(clothing, clothing_combo_3_values, clothing_combo_3);

      // Checking for Clothing Combo 4
      check_combo(clothing, clothing_combo_4_values, clothing_combo_4);

      // // Checking for Clothing Combo 5
      check_combo(clothing, clothing_combo_5_values, clothing_combo_5);

      // Checking for Clothing Combo 6
      check_combo(clothing, clothing_combo_6_values, clothing_combo_6);

      // Checking for Front Accessory Combo
      check_combo(
        front_accessory,
        front_accessory_combo_values,
        front_accessory_combo
      );

      // Checking for Hair Combo 1
      if (hair == hair_combo_1_values[0]) {
        hair_combo_1[0] += 1;
      } else if (hair == hair_combo_1_values[1]) {
        hair_combo_1[1] += 1;
      } else if (hair == hair_combo_1_values[2]) {
        hair_combo_1[2] += 1;
      } else if (hair == hair_combo_1_values[3]) {
        hair_combo_1[3] += 1;
      } else if (hair == hair_combo_1_values[4]) {
        hair_combo_1[4] += 1;
      }

      // Checking for Hair Combo 2
      check_combo(hair, hair_combo_2_values, hair_combo_2);

      // Checking for Hair Combo 3
      check_combo(hair, hair_combo_3_values, hair_combo_3);

      // Checking for Hair Combo 4
      check_combo(hair, hair_combo_4_values, hair_combo_4);

      // Checking for Hair Accessory Combo
      if (hair_accessory == hair_accessory_combo_values[0]) {
        hair_accessory_combo[0] += 1;
      } else if (hair_accessory == hair_accessory_combo_values[1]) {
        hair_accessory_combo[1] += 1;
      } else if (hair_accessory == hair_accessory_combo_values[2]) {
        hair_accessory_combo[2] += 1;
      } else if (hair_accessory == hair_accessory_combo_values[3]) {
        hair_accessory_combo[3] += 1;
      } else if (hair_accessory == hair_accessory_combo_values[4]) {
        hair_accessory_combo[4] += 1;
      } else if (hair_accessory == hair_accessory_combo_values[5]) {
        hair_accessory_combo[5] += 1;
      } else if (hair_accessory == hair_accessory_combo_values[6]) {
        hair_accessory_combo[6] += 1;
      } else if (hair_accessory == hair_accessory_combo_values[7]) {
        hair_accessory_combo[7] += 1;
      }

      // Checking for Mouth Accessory Combo
      if (mouth_accessory == mouth_accessory_combo_values[0]) {
        mouth_accessory_combo[0] += 1;
      } else if (mouth_accessory == mouth_accessory_combo_values[1]) {
        mouth_accessory_combo[1] += 1;
      }

      // Checking for Eye Combo 1
      check_combo(eyes, eye_combo_1_values, eye_combo_1);

      // Checking for Eye Combo 2
      check_combo(eyes, eye_combo_2_values, eye_combo_2);

      // Checking for Eyewear Combo 1
      check_combo(eyewear, eyewear_combo_1_values, eyewear_combo_1);

      // Checking for Eyewear Combo 2
      check_combo(eyewear, eyewear_combo_2_values, eyewear_combo_2);

      // Checking for Eyewear Combo 3
      check_combo(eyewear, eyewear_combo_3_values, eyewear_combo_3);
    });

    // Adding Hong Kong Combo Multiplier
    allMultipliers['background']['hongKongCombo'] = 0;
    if (hk_combo.length == hk_combo_values.length) {
      totalMultipliers += 0.3;
      allMultipliers['background']['hongKongCombo'] += 0.3;
    }

    // Adding Full Element Combo Multiplier
    allMultipliers['background']['fullElementalCombo'] = 0;
    if (full_element_combo.length >= full_element_combo_values.length - 1) {
      totalMultipliers += 0.3;
      allMultipliers['background']['fullElementalCombo'] += 0.3;
    }

    // Adding Basic Element Combo Multiplier
    allMultipliers['background']['basicElementalCombo'] = 0;
    if (basic_element_combo.length >= basic_element_combo_values.length - 1) {
      totalMultipliers += 0.3;
      allMultipliers['background']['basicElementalCombo'] += 0.3;
    }

    // BACK_ACCESSORY
    allMultipliers['backAccessory'] = {};
    // Adding Back Accessory Combo Multiplier
    let capeMasterCombo = check_multiplier(
      back_accessory_combo.length,
      3,
      0.1,
      5,
      0.2
    );
    totalMultipliers += capeMasterCombo;
    allMultipliers['backAccessory']['capeMasterCombo'] = capeMasterCombo;

    // SKIN
    allMultipliers['skin'] = {};
    // Adding Skin Combo 1 Multiplier
    let waterSpiritCombo = check_multiplier(
      skin_combo_1.length,
      3,
      0.1,
      5,
      0.2
    );
    totalMultipliers += waterSpiritCombo;
    allMultipliers['skin']['fullElementalCombo'] = waterSpiritCombo;

    // Adding Skin Combo 2 Multiplier
    let alienCombo = check_multiplier(skin_combo_2.length, 3, 0.1, 5, 0.2);
    totalMultipliers += alienCombo;
    allMultipliers['skin']['alienCombo'] = alienCombo;

    // CLOTHING
    allMultipliers['clothing'] = {};
    // Adding Clothing Combo 1 Multiplier
    let armorCombo = check_multiplier(
      clothing_combo_1.length,
      3,
      0.25,
      5,
      0.35
    );
    totalMultipliers += armorCombo;
    allMultipliers['clothing']['armorCombo'] = armorCombo;

    // Adding Clothing Combo 2 Multiplier
    let ninjaCombo = check_multiplier(
      clothing_combo_2.length,
      3,
      0.25,
      5,
      0.35
    );
    totalMultipliers += ninjaCombo;
    allMultipliers['clothing']['ninjaCombo'] = ninjaCombo;

    // Adding Clothing Combo 3 Multiplier
    let superHeroCombo = check_multiplier(
      clothing_combo_3.length,
      3,
      0.25,
      5,
      0.35
    );
    totalMultipliers += superHeroCombo;
    allMultipliers['clothing']['superHeroCombo'] = superHeroCombo;

    // Adding Clothing Combo 4 Multiplier
    let kfHeroCombo = check_multiplier(
      clothing_combo_4.length,
      3,
      0.25,
      5,
      0.35
    );
    totalMultipliers += kfHeroCombo;
    allMultipliers['clothing']['kfHeroCombo'] = kfHeroCombo;

    // Adding Clothing Combo 5 Multiplier
    let streetKarateCombo = check_multiplier(
      clothing_combo_5.length,
      3,
      0.15,
      5,
      0.25
    );
    totalMultipliers += streetKarateCombo;
    allMultipliers['clothing']['streetKarateCombo'] = streetKarateCombo;

    // Adding Clothing Combo 6 Multiplier
    let animeCombo = check_multiplier(clothing_combo_6.length, 3, 0.1, 5, 0.2);
    totalMultipliers += animeCombo;
    allMultipliers['clothing']['animeCombo'] = animeCombo;

    // FRONT_ACCESSORY
    allMultipliers['frontAccessory'] = {};
    // Adding Front Accessory Combo Multiplier
    let fighterCombo = check_multiplier(
      front_accessory_combo.length,
      3,
      0.1,
      5,
      0.2
    );
    totalMultipliers += fighterCombo;
    allMultipliers['frontAccessory']['fighterCombo'] = fighterCombo;

    // HAIR
    allMultipliers['hair'] = {};
    // Adding Hair Combo 1 Multiplier
    let legendaryHairCombo = 0;
    legendaryHairCombo += check_multiplier(hair_combo_1[0], 2, 0.25, 4, 0.35);
    legendaryHairCombo += check_multiplier(hair_combo_1[1], 2, 0.25, 4, 0.35);
    legendaryHairCombo += check_multiplier(hair_combo_1[2], 2, 0.25, 4, 0.35);
    legendaryHairCombo += check_multiplier(hair_combo_1[3], 2, 0.25, 4, 0.35);
    legendaryHairCombo += check_multiplier(hair_combo_1[4], 2, 0.25, 4, 0.35);
    totalMultipliers += legendaryHairCombo;
    allMultipliers['hair']['legendary'] = legendaryHairCombo;

    // Adding Hair Combo 2 Multiplier
    let superFireCombo = check_multiplier(
      hair_combo_2.length,
      3,
      0.25,
      5,
      0.35
    );
    totalMultipliers += superFireCombo;
    allMultipliers['hair']['superFireCombo'] = superFireCombo;

    // Adding Hair Combo 3 Multiplier
    let luFuCombo = check_multiplier(hair_combo_3.length, 3, 0.25, 5, 0.35);
    totalMultipliers += luFuCombo;
    allMultipliers['hair']['luFuCombo'] = luFuCombo;

    // Adding Hair Combo 4 Multiplier
    let maskCombo = check_multiplier(hair_combo_4.length, 3, 0.15, 5, 0.25);
    totalMultipliers += maskCombo;
    allMultipliers['hair']['maskCombo'] = maskCombo;

    // HAIR_ACCESSORY
    allMultipliers['hairAccessory'] = {};
    // Adding Hair Accessory Combo Multiplier
    let legendaryHairAccessory = 0;
    legendaryHairAccessory += check_multiplier(
      hair_accessory_combo[0],
      3,
      0.25,
      5,
      0.35
    );
    legendaryHairAccessory += check_multiplier(
      hair_accessory_combo[1],
      3,
      0.25,
      5,
      0.35
    );
    legendaryHairAccessory += check_multiplier(
      hair_accessory_combo[2],
      3,
      0.25,
      5,
      0.35
    );
    legendaryHairAccessory += check_multiplier(
      hair_accessory_combo[3],
      3,
      0.25,
      5,
      0.35
    );
    legendaryHairAccessory += check_multiplier(
      hair_accessory_combo[4],
      3,
      0.25,
      5,
      0.35
    );
    legendaryHairAccessory += check_multiplier(
      hair_accessory_combo[5],
      3,
      0.25,
      5,
      0.35
    );
    legendaryHairAccessory += check_multiplier(
      hair_accessory_combo[6],
      3,
      0.25,
      5,
      0.35
    );
    legendaryHairAccessory += check_multiplier(
      hair_accessory_combo[7],
      3,
      0.25,
      5,
      0.35
    );
    totalMultipliers += legendaryHairAccessory;
    allMultipliers['hairAccessory']['legendary'] = legendaryHairAccessory;

    // MOUTH_ACCESSORY
    allMultipliers['mouthAccessory'] = {};
    // Adding Mouth Accessory Combo Multiplier
    let legendaryMouthAccessory = 0;
    legendaryMouthAccessory += check_multiplier(
      mouth_accessory_combo[0],
      2,
      0.25,
      4,
      0.35
    );
    legendaryMouthAccessory += check_multiplier(
      mouth_accessory_combo[1],
      2,
      0.25,
      4,
      0.35
    );
    totalMultipliers += legendaryMouthAccessory;
    allMultipliers['mouthAccessory']['legendary'] = legendaryMouthAccessory;

    // EYES
    allMultipliers['eyes'] = {};
    // Adding Eye Combo 1 Multiplier
    let laserCombo = check_multiplier(eye_combo_1.length, 3, 0.25, 5, 0.35);
    totalMultipliers += laserCombo;
    allMultipliers['eyes']['laserCombo'] = laserCombo;

    // Adding Eye Combo 2 Multiplier
    let largeEyeCombo = check_multiplier(eye_combo_2.length, 3, 0.25, 5, 0.35);
    totalMultipliers += largeEyeCombo;
    allMultipliers['eyes']['largeEyeCombo'] = largeEyeCombo;

    // EYEWEAR
    allMultipliers['eyewear'] = {};
    // Adding Eyewear Combo 1 Multiplier
    let CyclopsCombo = check_multiplier(
      eyewear_combo_1.length,
      3,
      0.25,
      5,
      0.35
    );
    totalMultipliers += CyclopsCombo;
    allMultipliers['eyewear']['CyclopsCombo'] = CyclopsCombo;

    // Adding Eyewear Combo 2 Multiplier
    let solanaCombo = check_multiplier(
      eyewear_combo_2.length,
      3,
      0.25,
      5,
      0.35
    );
    totalMultipliers += solanaCombo;
    allMultipliers['eyewear']['solanaCombo'] = solanaCombo;

    // Adding Eyewear Combo 3 Multiplier
    let VRCombo = check_multiplier(eyewear_combo_3.length, 3, 0.25, 5, 0.35);
    totalMultipliers += VRCombo;
    allMultipliers['eyewear']['VRCombo'] = VRCombo;

    return {
      total: totalMultipliers,
      list: allMultipliers,
    };
  }, [stakerInfo, jungle]);

  const getPendingStakingRewards = useCallback(
    (animal: Animal, end: Date) => {
      if (
        !jungle ||
        !stakerInfo ||
        !animal.lastClaim ||
        end < animal.lastClaim ||
        !animal.stakedAt ||
        end < animal.stakedAt
      )
        return {
          baseRewards: 0,
          pendingRewards: 0,
        };

      const elapsed = (end.valueOf() - animal.lastClaim.valueOf()) / 1000;
      let pendingRewards =
        (parseFloat((animal.emissionsPerDay || animal.emissionsPerDay) as any) /
          86400) *
        elapsed;
      pendingRewards /= 10 ** 9;

      const baseRewards = pendingRewards;

      // Get all universal multipliers
      const multipliers = getMultipliers();

      //   Calculate the total amount of tokens staked
      const weekDifference = Math.round(
        (end.valueOf() - animal.stakedAt.valueOf()) / 1000 / 60 / 60 / 24 / 7
      );
      const weeklyMultiplier =
        weekDifference * jungle.weeklyMultiplier.toNumber();

      pendingRewards *= multipliers.total + weeklyMultiplier;

      return {
        baseRewards,
        pendingRewards,
      };
    },
    [jungle, stakerInfo, getMultipliers]
  );

  // stake animal
  const stakeAnimal = useCallback(
    async (animal: Animal) => {
      if (!wallet || !wallet.publicKey || !jungle || !provider) return;
      const joinToast = toast.loading(`${animal.metadata.name} is Staking..`);
      const program = new anchor.Program<JungleProgram>(
        JundleIdl,
        programID,
        provider
      );

      const [jungleAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('jungle', 'utf8'), jungle.key.toBuffer()],
        program.programId
      );
      const [animalAddress, animalBump] = await PublicKey.findProgramAddress(
        [Buffer.from('animal', 'utf8'), animal.mint.toBuffer()],
        program.programId
      );
      const [deposit, depositBump] = await PublicKey.findProgramAddress(
        [Buffer.from('deposit', 'utf8'), animal.mint.toBuffer()],
        program.programId
      );
      const [stakerInfo, stakerInfoBumps] = await PublicKey.findProgramAddress(
        [
          Buffer.from('staker', 'utf8'),
          jungleAddress.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const bumps = {
        animal: animalBump,
        deposit: depositBump,
      };

      const stakerAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        animal.mint,
        wallet.publicKey
      );

      const instructions: TransactionInstruction[] = [];

      try {
        new Token(
          provider.connection,
          animal.mint,
          TOKEN_PROGRAM_ID,
          Keypair.generate()
        ).getAccountInfo(stakerAccount);
      } catch (err) {
        instructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            animal.mint,
            stakerAccount,
            wallet.publicKey,
            wallet.publicKey
          )
        );
      }

      const indexStaked = constants.metadata.findIndex(
        (e) => e.mint === animal.mint.toString()
      );

      try {
        try {
          await program.account.stakerInfo.fetch(stakerInfo);
        } catch (err) {
          instructions.push(
            program.instruction.initStaker(stakerInfoBumps, {
              accounts: {
                jungle: jungleAddress,
                stakerInfo: stakerInfo,
                staker: wallet.publicKey,
                systemProgram: SystemProgram.programId,
              },
            })
          );
        }

        const attributes = animal.uriData.attributes;

        const background: string = attributes?.find(
          (x: any) => x.trait_type.toLowerCase() === 'Background'.toLowerCase()
        )?.value;
        const back_accessory: string = attributes?.find(
          (x: any) =>
            x.trait_type.toLowerCase() ===
            'Body accessories (Back)'.toLowerCase()
        )?.value;
        const skin: string = attributes?.find(
          (x: any) => x.trait_type.toLowerCase() === 'Body'.toLowerCase()
        )?.value;
        const clothing: string = attributes?.find(
          (x: any) => x.trait_type.toLowerCase() === 'Clothes'.toLowerCase()
        )?.value;
        const front_accessory: string = attributes?.find(
          (x: any) =>
            x.trait_type.toLowerCase() ===
            'Body accessories (Front)'.toLowerCase()
        )?.value;
        const hair: string = attributes?.find(
          (x: any) => x.trait_type.toLowerCase() === 'Hair'.toLowerCase()
        )?.value;
        const hair_accessory: string = attributes?.find(
          (x: any) =>
            x.trait_type.toLowerCase() === 'Hair accessories'.toLowerCase()
        )?.value;
        const mouth_accessory: string = attributes?.find(
          (x: any) =>
            x.trait_type.toLowerCase() === 'Mouth accessories'.toLowerCase()
        )?.value;
        const eyes: string = attributes?.find(
          (x: any) => x.trait_type.toLowerCase() === 'Eyes'.toLowerCase()
        )?.value;
        const eyewear: string = attributes?.find(
          (x: any) => x.trait_type.toLowerCase() === 'Eyewear'.toLowerCase()
        )?.value;

        const metadata: StakedMetaData = {
          mint: animal.mint,
          background: kfwComboEncoding.background[background] ?? 255,
          backAccessory: kfwComboEncoding.back_accessory[back_accessory] ?? 255,
          skin: kfwComboEncoding.skin[skin] ?? 255,
          clothing: kfwComboEncoding.clothing[clothing] ?? 255,
          frontAccessory:
            kfwComboEncoding.front_accessory[front_accessory] ?? 255,
          hair: kfwComboEncoding.hair[hair] ?? 255,
          hairAccessory: kfwComboEncoding.hair_accessory[hair_accessory] ?? 255,
          mouthAccessory:
            kfwComboEncoding.mouth_accessory[mouth_accessory] ?? 255,
          eyes: kfwComboEncoding.eyes[eyes] ?? 255,
          eyewear: kfwComboEncoding.eyewear[eyewear] ?? 255,
        };

        await program.rpc.stakeAnimal(
          bumps,
          tree.getProofArray(indexStaked),
          new anchor.BN(animal.emissionsPerDay),
          new anchor.BN(factionToNumber(animal.faction)),
          metadata,
          {
            accounts: {
              jungle: jungleAddress,
              escrow: jungle.escrow,
              animal: animalAddress,
              stakerInfo: stakerInfo,
              staker: wallet.publicKey,
              mint: animal.mint,
              stakerAccount: stakerAccount,
              depositAccount: deposit,
              tokenProgram: TOKEN_PROGRAM_ID,
              clock: SYSVAR_CLOCK_PUBKEY,
              rent: SYSVAR_RENT_PUBKEY,
              systemProgram: SystemProgram.programId,
            },
            instructions: instructions,
          }
        );

        console.log(stakerInfo.toString());

        fetchStakerInfo();

        toast.update(joinToast, {
          render: `${animal.metadata.name} is successfully Staked!`,
          type: 'success',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
          autoClose: 4000,
        });
        fetchAnimals();
        fetchStakedAnimals();
      } catch (err) {
        toast.update(joinToast, {
          render: `Staking Failed!`,
          type: 'error',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
          autoClose: 4000,
        });
        console.log('Staking Failed!', err);
      }
    },
    [
      jungle,
      provider,
      tree,
      wallet,
      fetchAnimals,
      fetchStakedAnimals,
      fetchStakerInfo,
    ]
  );

  // Unstakes an animal.
  // It also creates all used account if they do not exist and claims rewards

  const unstakeAnimal = useCallback(
    async (animal: Animal) => {
      if (!wallet || !wallet.publicKey || !jungle || !provider) return;

      const unStakeToast = toast.loading(
        `${animal.metadata.name} is Unstaking..`
      );
      const program = new anchor.Program<JungleProgram>(
        JundleIdl,
        programID,
        provider
      );
      const [jungleAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('jungle', 'utf8'), jungle.key.toBuffer()],
        program.programId
      );
      const [rewardsAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from('rewards', 'utf8'),
          jungle.key.toBuffer(),
          jungle.mint.toBuffer(),
        ],
        program.programId
      );
      const [animalAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('animal', 'utf8'), animal.mint.toBuffer()],
        program.programId
      );

      const [deposit] = await PublicKey.findProgramAddress(
        [Buffer.from('deposit', 'utf8'), animal.mint.toBuffer()],
        program.programId
      );

      const [stakerInfo] = await PublicKey.findProgramAddress(
        [
          Buffer.from('staker', 'utf8'),
          jungleAddress.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const rewardsStakerAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        jungle.mint,
        wallet.publicKey
      );
      const animalStakerAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        animal.mint,
        wallet.publicKey
      );

      const instructions: TransactionInstruction[] = [];

      if (!userAccount)
        instructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            jungle.mint,
            rewardsStakerAccount,
            wallet.publicKey,
            wallet.publicKey
          )
        );

      try {
        new Token(
          provider.connection,
          animal.mint,
          TOKEN_PROGRAM_ID,
          Keypair.generate()
        ).getAccountInfo(animalStakerAccount);
      } catch (err) {
        instructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            animal.mint,
            animalStakerAccount,
            wallet.publicKey,
            wallet.publicKey
          )
        );
      }

      instructions.push(
        program.instruction.claimStaking({
          accounts: {
            jungle: jungleAddress,
            escrow: jungle.escrow,
            animal: animalAddress,
            stakerInfo: stakerInfo,
            staker: wallet.publicKey,
            mint: jungle.mint,
            stakerAccount: rewardsStakerAccount,
            rewardsAccount: rewardsAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
        })
      );

      try {
        await program.rpc.unstakeAnimal({
          accounts: {
            jungle: jungleAddress,
            escrow: jungle.escrow,
            animal: animalAddress,
            stakerInfo: stakerInfo,
            staker: wallet.publicKey,
            mint: animal.mint,
            stakerAccount: animalStakerAccount,
            depositAccount: deposit,
            tokenProgram: TOKEN_PROGRAM_ID,
            // clock: SYSVAR_CLOCK_PUBKEY,
          },
          instructions: instructions,
        });

        fetchStakerInfo();

        toast.update(unStakeToast, {
          render: `${animal.metadata.name} has successfully Unstaked`,
          type: 'success',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
          autoClose: 4000,
        });

        fetchAnimals();
        await fetchStakedAnimals();
        fetchUserAccount();
      } catch (err) {
        toast.update(unStakeToast, {
          render: `Failed to Unstake!`,
          type: 'error',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
          autoClose: 4000,
        });
        console.error(err);
        console.log(err);
      }
    },
    [
      jungle,
      provider,
      userAccount,
      wallet,
      fetchAnimals,
      fetchStakedAnimals,
      fetchUserAccount,
      fetchStakerInfo,
    ]
  );

  // Fetches a staking account
  const fetchAnimal = useCallback(
    async (mint: PublicKey) => {
      if (!props.connection) return;

      const program = new anchor.Program(
        idl as anchor.Idl,
        programID,
        provider
      );
      const [animalAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('animal'), mint.toBuffer()],
        programID
      );

      const metadataItem = constants.metadata.filter(
        (e) => e.mint === mint.toString()
      )[0];
      try {
        const fetchedAnimal = await program.account.animal.fetch(animalAddress);
        return {
          mint: mint,
          metadata: metadataItem.arweave,
          uriData: metadataItem.metadata,
          emissionsPerDay: fetchedAnimal.emissionsPerDay.toString(),
          faction: metadataItem.faction,
          lastClaim: new Date(fetchedAnimal.lastClaim.toNumber() * 1000),
          stakedAt: new Date(fetchedAnimal.stakedAt.toNumber() * 1000),
        };
      } catch (err) {
        return {
          mint: mint,
          metadata: metadataItem.arweave,
          uriData: metadataItem.metadata,
          emissionsPerDay: metadataItem.emissionsPerDay,
          faction: metadataItem.faction,
        };
      }
    },
    [props.connection, provider]
  );

  const getAvaliableStakedAnimals = useCallback(async () => {
    let updatedAvaliableAnimals: Animal[] = [];
    const result = stakedAnimals?.map(async (augmentedAnimal) => {
      try {
        const animal = await fetchAnimal(augmentedAnimal.mint);
        if (animal) return animal;
        else return augmentedAnimal;
      } catch (e) {
        console.log(e);
        return augmentedAnimal;
      }
    });

    updatedAvaliableAnimals = await Promise.all(result || []);
    setStateAvaliableStakedAnimals(updatedAvaliableAnimals);
  }, [fetchAnimal, stakedAnimals]);

  const setAvaliableStakedAnimals = useCallback(
    async (_avaliableStakedAnimals?: Animal[]) => {
      if (_avaliableStakedAnimals)
        setStateAvaliableStakedAnimals(_avaliableStakedAnimals);
      else await getAvaliableStakedAnimals();
    },
    [getAvaliableStakedAnimals]
  );

  const claimStakingRewards = useCallback(
    async (animal: Animal) => {
      if (!wallet || !wallet.publicKey || !wallet.publicKey || !jungle) return;

      const claimToast = toast.loading('Claiming Earnings...');

      const program = new anchor.Program<JungleProgram>(
        JundleIdl,
        programID,
        provider
      );
      const [jungleAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('jungle', 'utf8'), jungle.key.toBuffer()],
        program.programId
      );
      const [rewardsAccount] = await PublicKey.findProgramAddress(
        [
          Buffer.from('rewards', 'utf8'),
          jungle.key.toBuffer(),
          jungle.mint.toBuffer(),
        ],
        program.programId
      );
      const [animalAddress] = await PublicKey.findProgramAddress(
        [Buffer.from('animal', 'utf8'), animal.mint.toBuffer()],
        program.programId
      );

      const [stakerInfo] = await PublicKey.findProgramAddress(
        [
          Buffer.from('staker', 'utf8'),
          jungleAddress.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        program.programId
      );

      const stakerAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        jungle.mint,
        wallet.publicKey
      );

      try {
        // Create an reward account if the user does not have one
        const instructions = userAccount
          ? []
          : [
              Token.createAssociatedTokenAccountInstruction(
                ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                jungle.mint,
                stakerAccount,
                wallet.publicKey,
                wallet.publicKey
              ),
            ];

        const txid = await program.rpc.claimStaking({
          accounts: {
            jungle: jungleAddress,
            escrow: jungle.escrow,
            animal: animalAddress,
            stakerInfo: stakerInfo,
            staker: wallet.publicKey,
            mint: jungle.mint,
            stakerAccount: stakerAccount,
            rewardsAccount: rewardsAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: SYSVAR_CLOCK_PUBKEY,
            rent: SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
          instructions: instructions,
        });

        console.log(txid);

        toast.update(claimToast, {
          render: 'Claiming successful',
          type: 'success',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
          autoClose: 4000,
        });

        fetchAnimals();
        fetchStakedAnimals();
        fetchUserAccount();
      } catch (err) {
        toast.update(claimToast, {
          render: 'Failed to Claim Earnings',
          type: 'error',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
          autoClose: 4000,
        });
        throw new Error();
      }
    },
    [
      jungle,
      provider,
      userAccount,
      wallet,
      fetchAnimals,
      fetchStakedAnimals,
      fetchUserAccount,
    ]
  );

  // claim all Staking Rewards
  const claimAllStakingRewards = useCallback(async () => {
    //@ts-ignore
    const claimList = JSON.parse(sessionStorage.getItem('claimItemList'));

    if (!stakedAnimals) return;
    if (!wallet || !wallet.publicKey || !jungle || !provider) return;

    const claimItems = stakedAnimals.filter((animal, index) =>
      claimList.includes(animal.metadata.name)
    );

    const feePayer = wallet.publicKey;

    const claimToast = toast.loading('Claiming All Earnings...');

    const program = new anchor.Program<JungleProgram>(
      JundleIdl,
      programID,
      provider
    );
    const [jungleAddress] = await PublicKey.findProgramAddress(
      [Buffer.from('jungle', 'utf8'), jungle.key.toBuffer()],
      program.programId
    );
    const [rewardsAccount] = await PublicKey.findProgramAddress(
      [
        Buffer.from('rewards', 'utf8'),
        jungle.key.toBuffer(),
        jungle.mint.toBuffer(),
      ],
      program.programId
    );

    const [stakerAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('staker', 'utf8'),
        jungleAddress.toBuffer(),
        wallet.publicKey.toBuffer(),
      ],
      program.programId
    );

    const stakerAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      jungle.mint,
      wallet.publicKey
    );
    const transaction = new Transaction({ feePayer });

    if (!userAccount)
      transaction.add(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          jungle.mint,
          stakerAccount,
          wallet.publicKey,
          wallet.publicKey
        )
      );

    await Promise.all(
      claimItems.map(async (animal) => {
        const [animalAddress] = await PublicKey.findProgramAddress(
          [Buffer.from('animal', 'utf8'), animal.mint.toBuffer()],
          program.programId
        );
        transaction.add(
          program.instruction.claimStaking({
            accounts: {
              jungle: jungleAddress,
              escrow: jungle.escrow,
              animal: animalAddress,
              stakerInfo: stakerAddress,
              staker: feePayer,
              mint: jungle.mint,
              stakerAccount: stakerAccount,
              rewardsAccount: rewardsAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
              clock: SYSVAR_CLOCK_PUBKEY,
              rent: SYSVAR_RENT_PUBKEY,
              systemProgram: SystemProgram.programId,
            },
          })
        );
      })
    );

    try {
      const signature = await wallet.sendTransaction(
        transaction,
        props.connection
      );

      await props.connection.confirmTransaction(signature, 'processed');

      toast.update(claimToast, {
        render: 'Claiming successful',
        type: 'success',
        isLoading: false,
        closeOnClick: true,
        closeButton: true,
        autoClose: 4000,
      });

      fetchUserAccount();
      fetchAnimals();
      setTimeout(() => {
        fetchStakedAnimals();
      }, 20000);
    } catch (err) {
      toast.update(claimToast, {
        render: 'Failed to Claim Earnings',
        type: 'error',
        isLoading: false,
        closeOnClick: true,
        closeButton: true,
        autoClose: 4000,
      });
      console.log(err);
      throw new Error();
    }
  }, [
    stakedAnimals,
    wallet,
    jungle,
    provider,
    userAccount,
    avaliableStakedAnimals,
    props.connection,
    fetchAnimals,
    fetchStakedAnimals,
    fetchUserAccount,
  ]);

  const refreshAnimals = useCallback(async () => {
    setAnimals([]);
    setStakedAnimals([]);
    getMultipliers();
    await fetchJungle();
    await fetchAnimals();
    await fetchStakedAnimals();
  }, [fetchJungle, fetchStakedAnimals, fetchAnimals]);

  useEffect(() => {
    refreshAnimals();
  }, [anchorWallet, refreshAnimals]);

  return (
    <StackContext.Provider
      value={{
        jungle,
        animals: animals || [],
        stakedAnimals: stakedAnimals || [],
        userAccount,
        getRarityMultiplier,
        getMultipliers,
        getPendingStakingRewards,
        fetchAnimal,
        refreshAnimals,
        fetchUserAccount,
        createAccount,
        stakeAnimal,
        unstakeAnimal,
        claimStakingRewards,
        claimAllStakingRewards,
        animalsStatus,
        stakedAnimalsStatus,
        avaliableStakedAnimals,
        setAvaliableStakedAnimals,
      }}
    >
      {props.children}

      <div>
        <ToastContainer
          position='bottom-left'
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </StackContext.Provider>
  );
};
