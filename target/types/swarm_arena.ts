export type SwarmArena = {
  "version": "0.1.0",
  "name": "swarm_arena",
  "instructions": [
    {
      "name": "initializeConfig",
      "accounts": [
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
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
          "name": "protocolFeeBps",
          "type": "u16"
        },
        {
          "name": "minDeposit",
          "type": "u64"
        },
        {
          "name": "maxDeposit",
          "type": "u64"
        },
        {
          "name": "minExposure",
          "type": "u8"
        },
        {
          "name": "maxExposure",
          "type": "u8"
        },
        {
          "name": "cycleDuration",
          "type": "u64"
        },
        {
          "name": "exposureCooldown",
          "type": "u64"
        }
      ]
    },
    {
      "name": "registerPlayer",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setExposure",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newExposure",
          "type": "u8"
        }
      ]
    },
    {
      "name": "resolveCycle",
      "accounts": [
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cycleState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "resolver",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimRedistribution",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cycleState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
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
          "name": "cycleNumber",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "protocolFeeBps",
            "type": "u16"
          },
          {
            "name": "minDeposit",
            "type": "u64"
          },
          {
            "name": "maxDeposit",
            "type": "u64"
          },
          {
            "name": "minExposure",
            "type": "u8"
          },
          {
            "name": "maxExposure",
            "type": "u8"
          },
          {
            "name": "cycleDuration",
            "type": "u64"
          },
          {
            "name": "exposureCooldown",
            "type": "u64"
          },
          {
            "name": "treasuryVault",
            "type": "publicKey"
          },
          {
            "name": "totalFeesCollected",
            "type": "u64"
          },
          {
            "name": "totalCycles",
            "type": "u64"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currentCycle",
            "type": "u64"
          },
          {
            "name": "cycleStartSlot",
            "type": "u64"
          },
          {
            "name": "cycleEndSlot",
            "type": "u64"
          },
          {
            "name": "totalValueLocked",
            "type": "u64"
          },
          {
            "name": "totalExposedValue",
            "type": "u64"
          },
          {
            "name": "activePlayers",
            "type": "u32"
          },
          {
            "name": "cycleResolved",
            "type": "bool"
          },
          {
            "name": "lastUpdateSlot",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "cycleState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cycleNumber",
            "type": "u64"
          },
          {
            "name": "startSlot",
            "type": "u64"
          },
          {
            "name": "endSlot",
            "type": "u64"
          },
          {
            "name": "resolvedSlot",
            "type": "u64"
          },
          {
            "name": "totalValueLocked",
            "type": "u64"
          },
          {
            "name": "totalExposedValue",
            "type": "u64"
          },
          {
            "name": "totalRedistributed",
            "type": "u64"
          },
          {
            "name": "feesCollected",
            "type": "u64"
          },
          {
            "name": "participants",
            "type": "u32"
          },
          {
            "name": "winners",
            "type": "u32"
          },
          {
            "name": "resolved",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "playerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "publicKey"
          },
          {
            "name": "totalDeposited",
            "type": "u64"
          },
          {
            "name": "totalWithdrawn",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "exposure",
            "type": "u8"
          },
          {
            "name": "exposedValue",
            "type": "u64"
          },
          {
            "name": "lastExposureChangeSlot",
            "type": "u64"
          },
          {
            "name": "lastActionSlot",
            "type": "u64"
          },
          {
            "name": "cyclesParticipated",
            "type": "u64"
          },
          {
            "name": "totalRedistributed",
            "type": "i64"
          },
          {
            "name": "participatingInCycle",
            "type": "bool"
          },
          {
            "name": "registeredSlot",
            "type": "u64"
          },
          {
            "name": "score",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "treasuryVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "totalCollected",
            "type": "u64"
          },
          {
            "name": "totalWithdrawn",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "lastWithdrawalSlot",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAuthority",
      "msg": "Invalid authority for this operation"
    },
    {
      "code": 6001,
      "name": "AccountNotInitialized",
      "msg": "Account not initialized"
    }
  ]
};

export const IDL: SwarmArena = {
  "version": "0.1.0",
  "name": "swarm_arena",
  "instructions": [
    {
      "name": "initializeConfig",
      "accounts": [
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
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
          "name": "protocolFeeBps",
          "type": "u16"
        },
        {
          "name": "minDeposit",
          "type": "u64"
        },
        {
          "name": "maxDeposit",
          "type": "u64"
        },
        {
          "name": "minExposure",
          "type": "u8"
        },
        {
          "name": "maxExposure",
          "type": "u8"
        },
        {
          "name": "cycleDuration",
          "type": "u64"
        },
        {
          "name": "exposureCooldown",
          "type": "u64"
        }
      ]
    },
    {
      "name": "registerPlayer",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deposit",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setExposure",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "newExposure",
          "type": "u8"
        }
      ]
    },
    {
      "name": "resolveCycle",
      "accounts": [
        {
          "name": "config",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cycleState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "treasuryVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "resolver",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "claimRedistribution",
      "accounts": [
        {
          "name": "config",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "cycleState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerState",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "player",
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
          "name": "cycleNumber",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "globalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "protocolFeeBps",
            "type": "u16"
          },
          {
            "name": "minDeposit",
            "type": "u64"
          },
          {
            "name": "maxDeposit",
            "type": "u64"
          },
          {
            "name": "minExposure",
            "type": "u8"
          },
          {
            "name": "maxExposure",
            "type": "u8"
          },
          {
            "name": "cycleDuration",
            "type": "u64"
          },
          {
            "name": "exposureCooldown",
            "type": "u64"
          },
          {
            "name": "treasuryVault",
            "type": "publicKey"
          },
          {
            "name": "totalFeesCollected",
            "type": "u64"
          },
          {
            "name": "totalCycles",
            "type": "u64"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gameState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currentCycle",
            "type": "u64"
          },
          {
            "name": "cycleStartSlot",
            "type": "u64"
          },
          {
            "name": "cycleEndSlot",
            "type": "u64"
          },
          {
            "name": "totalValueLocked",
            "type": "u64"
          },
          {
            "name": "totalExposedValue",
            "type": "u64"
          },
          {
            "name": "activePlayers",
            "type": "u32"
          },
          {
            "name": "cycleResolved",
            "type": "bool"
          },
          {
            "name": "lastUpdateSlot",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "cycleState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "cycleNumber",
            "type": "u64"
          },
          {
            "name": "startSlot",
            "type": "u64"
          },
          {
            "name": "endSlot",
            "type": "u64"
          },
          {
            "name": "resolvedSlot",
            "type": "u64"
          },
          {
            "name": "totalValueLocked",
            "type": "u64"
          },
          {
            "name": "totalExposedValue",
            "type": "u64"
          },
          {
            "name": "totalRedistributed",
            "type": "u64"
          },
          {
            "name": "feesCollected",
            "type": "u64"
          },
          {
            "name": "participants",
            "type": "u32"
          },
          {
            "name": "winners",
            "type": "u32"
          },
          {
            "name": "resolved",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "playerState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "publicKey"
          },
          {
            "name": "totalDeposited",
            "type": "u64"
          },
          {
            "name": "totalWithdrawn",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "exposure",
            "type": "u8"
          },
          {
            "name": "exposedValue",
            "type": "u64"
          },
          {
            "name": "lastExposureChangeSlot",
            "type": "u64"
          },
          {
            "name": "lastActionSlot",
            "type": "u64"
          },
          {
            "name": "cyclesParticipated",
            "type": "u64"
          },
          {
            "name": "totalRedistributed",
            "type": "i64"
          },
          {
            "name": "participatingInCycle",
            "type": "bool"
          },
          {
            "name": "registeredSlot",
            "type": "u64"
          },
          {
            "name": "score",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "treasuryVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "totalCollected",
            "type": "u64"
          },
          {
            "name": "totalWithdrawn",
            "type": "u64"
          },
          {
            "name": "balance",
            "type": "u64"
          },
          {
            "name": "lastWithdrawalSlot",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidAuthority",
      "msg": "Invalid authority for this operation"
    },
    {
      "code": 6001,
      "name": "AccountNotInitialized",
      "msg": "Account not initialized"
    }
  ]
};
