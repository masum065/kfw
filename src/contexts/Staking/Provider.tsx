import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
// import { Box } from '@mui/system';
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
import idl from '../../constants/idls/jungle.json';
import {
  IDL as JundleIdl,
  Jungle as JungleProgram,
} from '../../constants/types/jungle';
import { buildLeaves, factionToNumber } from '../../utils';
import { MerkleTree } from '../../utils/merkleTree';
import { StackContext } from './Context';
import { Animal, Jungle, StakerInfo } from './types';

dayjs.extend(relativeTime); // use plugin
dayjs.locale('en'); // use locale

// Program Id
const programID = new PublicKey(idl.metadata.address);

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
            offset: 43, // Bumps + mint
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

      setStakerInfo({ holdings });
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

  const getStakingMultiplier = useCallback(
    (animal: Animal, end: Date) => {
      if (!jungle || !animal.stakedAt)
        return { total: 1, holdingsMultiplier: 0, weeklyMultiplier: 0 };

      const weekDifference = Math.round(
        (end.getTime() - animal.stakedAt.getTime()) / 1000 / 60 / 60 / 24 / 7
      );
      const weeklyMultiplier =
        weekDifference < 13 ? 0 : weekDifference < 25 ? 1 : 2.833333333333333;

      const holdings = stakerInfo?.holdings || stakedAnimals?.length || 1;
      let holdingsMultiplier =
        holdings * jungle.holdingsMultiplier.toNumber() -
        jungle.holdingsMultiplier.toNumber();

      let totalMultiplier = 1 + weeklyMultiplier + holdingsMultiplier;
      if (totalMultiplier > jungle.maximumRarityMultiplier.toNumber()) {
        totalMultiplier = jungle.maximumRarityMultiplier.toNumber();
      }

      return { total: totalMultiplier, holdingsMultiplier, weeklyMultiplier };
    },
    [jungle, stakerInfo, stakedAnimals]
  );
  const getPendingStakingRewards = useCallback(
    (animal: Animal, end: Date) => {
      if (!jungle || (animal.lastClaim && end < animal.lastClaim)) {
        return {
          rewards: 0,
          multipliers: { total: 1, holdingsMultiplier: 0, weeklyMultiplier: 0 },
        };
      }
      const lastClaim = animal.lastClaim || animal.stakedAt || new Date();
      let multipliers = getStakingMultiplier(animal, end);

      const elapsed = (end.getTime() - lastClaim.getTime()) / 1000;
      let pendingRewards =
        (parseFloat(animal.emissionsPerDay as any) / 86400) * elapsed;

      pendingRewards *= multipliers.total;

      return {
        rewards: pendingRewards / 10 ** 3,
        multipliers,
      };
    },
    [jungle, stakerInfo, getStakingMultiplier]
  );

  // stake animal
  const stakeAnimal = useCallback(
    async (animal: Animal) => {
      if (!wallet || !wallet.publicKey || !jungle || !provider) return;
      const joinToast = toast.loading(
        `${animal.metadata.name} Joining For Meditation..`
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
        staker_info: stakerInfoBumps,
      };

      const stakerAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        animal.mint,
        wallet.publicKey
      );

      const instructions: TransactionInstruction[] = [];

      try {
        await new Token(
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
      try {
        console.log({
          jungle: jungleAddress.toString(),
          escrow: jungle.escrow.toString(),
          animal: animalAddress.toString(),
          stakerInfo: stakerInfo.toString(),
          staker: wallet.publicKey.toString(),
          mint: animal.mint.toString(),
          stakerAccount: stakerAccount.toString(),
          depositAccount: deposit.toString(),
          tokenProgram: TOKEN_PROGRAM_ID.toString(),
        });
        await program.rpc.stakeAnimal(
          bumps,
          tree.getProofArray(indexStaked),
          new anchor.BN(animal.emissionsPerDay),
          new anchor.BN(factionToNumber(animal.faction)),
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

        fetchStakerInfo();

        toast.update(joinToast, {
          render: `${animal.metadata.name} has successfully Joined in Meditation!`,
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
          render: `${animal.metadata.name} is failed to Join in the Meditation!`,
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
        `${animal.metadata.name} is Leaving the Meditation`
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
        await new Token(
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
          render: `${animal.metadata.name} has successfully left the Meditating`,
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
          render: `Failed to leave the Meditating!`,
          type: 'error',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
          autoClose: 4000,
        });
        console.error(err);
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

  const claimAllStakingRewards = useCallback(async () => {
    //@ts-ignore
    const claimList = JSON.parse(sessionStorage.getItem('claimItemList'));

    if (!stakedAnimals || !claimList) return;

    const claimItems = stakedAnimals.filter((animal, index) =>
      claimList.includes(animal.metadata.name + '~' + index)
    );

    if (!wallet || !wallet.publicKey || !jungle || !provider) return;
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

    const [stakerAddress] = await PublicKey.findProgramAddress(
      [
        Buffer.from('staker', 'utf8'),
        jungleAddress.toBuffer(),
        wallet.publicKey.toBuffer(),
      ],
      program.programId
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
      });
    }
  }, [
    stakedAnimals,
    jungle,
    provider,
    tree,
    wallet,
    fetchAnimals,
    fetchStakedAnimals,
  ]);

  const refreshAnimals = useCallback(async () => {
    setAnimals([]);
    setStakedAnimals([]);
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
      <div
      // sx={{
      //   '& .Toastify__toast': {
      //     backgroundColor: '#7abfa7',
      //     backdropFilter: 'blur(8px)',
      //     color: 'rgb(233, 233, 233)',
      //   },
      //   '& .Toastify__close-button': {
      //     color: '#fff !important',
      //   },
      // }}
      >
        {' '}
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
