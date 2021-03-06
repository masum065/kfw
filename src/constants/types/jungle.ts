export type Jungle = {
  "version": "0.0.0",
  "name": "jungle",
  "instructions": [
    {
      "name": "initializeJungle",
      "accounts": [
        {
          "name": "jungleKey",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumps",
          "type": {
            "defined": "InitializeJungleBumps"
          }
        },
        {
          "name": "maxRarity",
          "type": "u64"
        },
        {
          "name": "maxMultiplier",
          "type": "u64"
        },
        {
          "name": "maximumWeeklyMultiplier",
          "type": "u64"
        },
        {
          "name": "weeklyMultiplier",
          "type": "u64"
        },
        {
          "name": "maximumHoldingsMultiplier",
          "type": "u64"
        },
        {
          "name": "holdingsMultiplier",
          "type": "u64"
        },
        {
          "name": "baseWeeklyEmissions",
          "type": "u64"
        },
        {
          "name": "start",
          "type": "i64"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "setJungle",
      "accounts": [
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxRarity",
          "type": "u64"
        },
        {
          "name": "maxMultiplier",
          "type": "u64"
        },
        {
          "name": "maximumWeeklyMultiplier",
          "type": "u64"
        },
        {
          "name": "weeklyMultiplier",
          "type": "u64"
        },
        {
          "name": "maximumHoldingsMultiplier",
          "type": "u64"
        },
        {
          "name": "holdingsMultiplier",
          "type": "u64"
        },
        {
          "name": "baseWeeklyEmissions",
          "type": "u64"
        },
        {
          "name": "start",
          "type": "i64"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "withdrawRewards",
      "accounts": [
        {
          "name": "jungle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "ownerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initStaker",
      "accounts": [
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumps",
          "type": "u8"
        }
      ]
    },
    {
      "name": "stakeAnimal",
      "accounts": [
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "animal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumps",
          "type": {
            "defined": "StakeAnimalBumps"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "emissionsPerDay",
          "type": "u64"
        },
        {
          "name": "faction",
          "type": "u64"
        },
        {
          "name": "metadata",
          "type": {
            "defined": "MetaData"
          }
        }
      ]
    },
    {
      "name": "unstakeAnimal",
      "accounts": [
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "animal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimStaking",
      "accounts": [
        {
          "name": "jungle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "animal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "jungle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "InitializeJungleBumps"
            }
          },
          {
            "name": "escrow",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "rewardsAccount",
            "type": "publicKey"
          },
          {
            "name": "animalsStaked",
            "type": "u64"
          },
          {
            "name": "maximumRarity",
            "type": "u64"
          },
          {
            "name": "maximumRarityMultiplier",
            "type": "u64"
          },
          {
            "name": "maximumWeeklyMultiplier",
            "type": "u64"
          },
          {
            "name": "weeklyMultiplier",
            "type": "u64"
          },
          {
            "name": "maximumHoldingsMultiplier",
            "type": "u64"
          },
          {
            "name": "holdingsMultiplier",
            "type": "u64"
          },
          {
            "name": "baseWeeklyEmissions",
            "type": "u64"
          },
          {
            "name": "start",
            "type": "i64"
          },
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "animal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bumps",
            "type": {
              "defined": "StakeAnimalBumps"
            }
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "staker",
            "type": "publicKey"
          },
          {
            "name": "emissionsPerDay",
            "type": "u64"
          },
          {
            "name": "faction",
            "type": "u8"
          },
          {
            "name": "lastClaim",
            "type": "i64"
          },
          {
            "name": "stakedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "stakerInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bumps",
            "type": "u8"
          },
          {
            "name": "staker",
            "type": "publicKey"
          },
          {
            "name": "holdings",
            "type": "u64"
          },
          {
            "name": "staked",
            "type": {
              "vec": {
                "defined": "MetaData"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitializeJungleBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "jungle",
            "type": "u8"
          },
          {
            "name": "escrow",
            "type": "u8"
          },
          {
            "name": "rewards",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "StakeAnimalBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "animal",
            "type": "u8"
          },
          {
            "name": "deposit",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "MetaData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "background",
            "type": "u8"
          },
          {
            "name": "backAccessory",
            "type": "u8"
          },
          {
            "name": "skin",
            "type": "u8"
          },
          {
            "name": "clothing",
            "type": "u8"
          },
          {
            "name": "frontAccessory",
            "type": "u8"
          },
          {
            "name": "hair",
            "type": "u8"
          },
          {
            "name": "hairAccessory",
            "type": "u8"
          },
          {
            "name": "mouthAccessory",
            "type": "u8"
          },
          {
            "name": "eyes",
            "type": "u8"
          },
          {
            "name": "eyewear",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 300,
      "name": "InvalidMultiplier",
      "msg": "Invalid multiplier, must be greater than 10000"
    },
    {
      "code": 301,
      "name": "TooEarly",
      "msg": "Too early to stake"
    },
    {
      "code": 302,
      "name": "InvalidProof",
      "msg": "Merkle proof is invalid"
    }
  ]
};

export const IDL: Jungle = {
  "version": "0.0.0",
  "name": "jungle",
  "instructions": [
    {
      "name": "initializeJungle",
      "accounts": [
        {
          "name": "jungleKey",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumps",
          "type": {
            "defined": "InitializeJungleBumps"
          }
        },
        {
          "name": "maxRarity",
          "type": "u64"
        },
        {
          "name": "maxMultiplier",
          "type": "u64"
        },
        {
          "name": "maximumWeeklyMultiplier",
          "type": "u64"
        },
        {
          "name": "weeklyMultiplier",
          "type": "u64"
        },
        {
          "name": "maximumHoldingsMultiplier",
          "type": "u64"
        },
        {
          "name": "holdingsMultiplier",
          "type": "u64"
        },
        {
          "name": "baseWeeklyEmissions",
          "type": "u64"
        },
        {
          "name": "start",
          "type": "i64"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "setJungle",
      "accounts": [
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "newOwner",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "maxRarity",
          "type": "u64"
        },
        {
          "name": "maxMultiplier",
          "type": "u64"
        },
        {
          "name": "maximumWeeklyMultiplier",
          "type": "u64"
        },
        {
          "name": "weeklyMultiplier",
          "type": "u64"
        },
        {
          "name": "maximumHoldingsMultiplier",
          "type": "u64"
        },
        {
          "name": "holdingsMultiplier",
          "type": "u64"
        },
        {
          "name": "baseWeeklyEmissions",
          "type": "u64"
        },
        {
          "name": "start",
          "type": "i64"
        },
        {
          "name": "root",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "withdrawRewards",
      "accounts": [
        {
          "name": "jungle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rewardsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "ownerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initStaker",
      "accounts": [
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumps",
          "type": "u8"
        }
      ]
    },
    {
      "name": "stakeAnimal",
      "accounts": [
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "animal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "bumps",
          "type": {
            "defined": "StakeAnimalBumps"
          }
        },
        {
          "name": "proof",
          "type": {
            "vec": {
              "array": [
                "u8",
                32
              ]
            }
          }
        },
        {
          "name": "emissionsPerDay",
          "type": "u64"
        },
        {
          "name": "faction",
          "type": "u64"
        },
        {
          "name": "metadata",
          "type": {
            "defined": "MetaData"
          }
        }
      ]
    },
    {
      "name": "unstakeAnimal",
      "accounts": [
        {
          "name": "jungle",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "animal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "depositAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimStaking",
      "accounts": [
        {
          "name": "jungle",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "escrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "animal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerInfo",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "staker",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "stakerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "rewardsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "clock",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "jungle",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "bumps",
            "type": {
              "defined": "InitializeJungleBumps"
            }
          },
          {
            "name": "escrow",
            "type": "publicKey"
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "rewardsAccount",
            "type": "publicKey"
          },
          {
            "name": "animalsStaked",
            "type": "u64"
          },
          {
            "name": "maximumRarity",
            "type": "u64"
          },
          {
            "name": "maximumRarityMultiplier",
            "type": "u64"
          },
          {
            "name": "maximumWeeklyMultiplier",
            "type": "u64"
          },
          {
            "name": "weeklyMultiplier",
            "type": "u64"
          },
          {
            "name": "maximumHoldingsMultiplier",
            "type": "u64"
          },
          {
            "name": "holdingsMultiplier",
            "type": "u64"
          },
          {
            "name": "baseWeeklyEmissions",
            "type": "u64"
          },
          {
            "name": "start",
            "type": "i64"
          },
          {
            "name": "root",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "animal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bumps",
            "type": {
              "defined": "StakeAnimalBumps"
            }
          },
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "staker",
            "type": "publicKey"
          },
          {
            "name": "emissionsPerDay",
            "type": "u64"
          },
          {
            "name": "faction",
            "type": "u8"
          },
          {
            "name": "lastClaim",
            "type": "i64"
          },
          {
            "name": "stakedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "stakerInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bumps",
            "type": "u8"
          },
          {
            "name": "staker",
            "type": "publicKey"
          },
          {
            "name": "holdings",
            "type": "u64"
          },
          {
            "name": "staked",
            "type": {
              "vec": {
                "defined": "MetaData"
              }
            }
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "InitializeJungleBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "jungle",
            "type": "u8"
          },
          {
            "name": "escrow",
            "type": "u8"
          },
          {
            "name": "rewards",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "StakeAnimalBumps",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "animal",
            "type": "u8"
          },
          {
            "name": "deposit",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "MetaData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "publicKey"
          },
          {
            "name": "background",
            "type": "u8"
          },
          {
            "name": "backAccessory",
            "type": "u8"
          },
          {
            "name": "skin",
            "type": "u8"
          },
          {
            "name": "clothing",
            "type": "u8"
          },
          {
            "name": "frontAccessory",
            "type": "u8"
          },
          {
            "name": "hair",
            "type": "u8"
          },
          {
            "name": "hairAccessory",
            "type": "u8"
          },
          {
            "name": "mouthAccessory",
            "type": "u8"
          },
          {
            "name": "eyes",
            "type": "u8"
          },
          {
            "name": "eyewear",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 300,
      "name": "InvalidMultiplier",
      "msg": "Invalid multiplier, must be greater than 10000"
    },
    {
      "code": 301,
      "name": "TooEarly",
      "msg": "Too early to stake"
    },
    {
      "code": 302,
      "name": "InvalidProof",
      "msg": "Merkle proof is invalid"
    }
  ]
};
