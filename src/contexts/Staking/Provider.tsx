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
import { Animal, Jungle } from './types';

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
  const [stakedAnimals, setStakedAnimals] = useState<Animal[]>();
  const [status, setStatus] = useState<any>({
    animals: {
      loading: false,
      loadingEnd: true,
      finish: true,
    },
    stakedAnimals: {
      loading: false,
      loadingEnd: true,
      finish: true,
    },
  });

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
      setStatus({
        ...status,
        animals: {
          loading: true,
          loadingEnd: false,
          finish: false,
        },
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
    }

    setStatus({
      ...status,
      animals: {
        ...status.animals,
        loading: false,
        finish: true,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, props.connection]);

  useEffect(() => {
    if (!animals) fetchAnimals();
  }, [fetchAnimals, animals]);

  // Fetches the animals staked by the user

  const fetchStakedAnimals = useCallback(async () => {
    if (!props.connection || !wallet.publicKey) return;

    setStatus({
      ...status,
      stakedAnimals: {
        loading: true,
        loadingEnd: false,
        finish: false,
      },
    });
    const program = new anchor.Program(idl as anchor.Idl, programID, provider);

    try {
      const staked = await program.account.animal.all([
        {
          memcmp: {
            offset: 42, // Bumps + mint
            bytes: wallet.publicKey?.toString(),
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
    }
    setStatus({
      ...status,
      stakedAnimals: {
        ...status.stakedAnimals,
        loading: false,
        finish: true,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, wallet, props.connection]);

  useEffect(() => {
    if (!stakedAnimals) fetchStakedAnimals();
  }, [stakedAnimals, fetchStakedAnimals]);

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
      baseWeeklyEmissions: fetchedJungle.baseWeeklyEmissions,
      root: fetchedJungle.root,
    });
  }, [provider]);

  useEffect(() => {
    fetchJungle();
  }, [fetchJungle]);

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

  const getPendingStakingRewards = useCallback(
    (animal: Animal, end: Date) => {
      if (!jungle || !animal.lastClaim || end < animal.lastClaim) return 0;

      const elapsed = (end.valueOf() - animal.lastClaim.valueOf()) / 1000;
      const pendingRewards =
        (parseFloat((animal.emissionsPerDay || animal.emissionsPerDay) as any) /
          86400) *
        elapsed;

      return pendingRewards / 10 ** 9;
    },
    [jungle, getRarityMultiplier]
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

        toast.update(joinToast, {
          render: `${animal.metadata.name} is successfully Staked!`,
          type: 'success',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
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
        });
        console.log('Staking Failed!', err);
      }
    },
    [jungle, provider, tree, wallet, fetchAnimals, fetchStakedAnimals]
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
            staker: wallet.publicKey,
            mint: animal.mint,
            stakerAccount: animalStakerAccount,
            depositAccount: deposit,
            tokenProgram: TOKEN_PROGRAM_ID,
            clock: SYSVAR_CLOCK_PUBKEY,
          },
          instructions: instructions,
        });

        toast.update(unStakeToast, {
          render: `${animal.metadata.name} has successfully Unstaked`,
          type: 'success',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
        });

        fetchAnimals();
        fetchStakedAnimals();
        fetchUserAccount();
      } catch (err) {
        toast.update(unStakeToast, {
          render: `Failed to Unstake!`,
          type: 'error',
          isLoading: false,
          closeOnClick: true,
          closeButton: true,
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

        await program.rpc.claimStaking({
          accounts: {
            jungle: jungleAddress,
            escrow: jungle.escrow,
            animal: animalAddress,
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

    if (!stakedAnimals || !claimList) return;

    const claimItems = stakedAnimals.filter((animal) =>
      claimList.includes(animal.metadata.name)
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
      refreshAnimals();
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
  }, [
    fetchJungle,
    fetchStakedAnimals,
    fetchAnimals,
    setAnimals,
    setStakedAnimals,
  ]);

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
        status,
      }}
    >
      {props.children}

      <div>
        <ToastContainer
          position='bottom-left'
          autoClose={5000}
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
