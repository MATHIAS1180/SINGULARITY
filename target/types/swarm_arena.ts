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
      "name": "GlobalConfig",
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
      "name": "GameState",
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
      "name": "CycleState",
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
      "name": "PlayerState",
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
      "name": "TreasuryVault",
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
  "events": [
    {
      "name": "ConfigInitialized",
      "fields": [
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "protocolFeeBps",
          "type": "u16",
          "index": false
        },
        {
          "name": "minDeposit",
          "type": "u64",
          "index": false
        },
        {
          "name": "maxDeposit",
          "type": "u64",
          "index": false
        },
        {
          "name": "cycleDuration",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "PlayerRegistered",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "slot",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "DepositMade",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "newBalance",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "slot",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "WithdrawMade",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "newBalance",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "slot",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "ExposureUpdated",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "oldExposure",
          "type": "u8",
          "index": false
        },
        {
          "name": "newExposure",
          "type": "u8",
          "index": false
        },
        {
          "name": "exposedValue",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        },
        {
          "name": "slot",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "CycleResolved",
      "fields": [
        {
          "name": "cycleNumber",
          "type": "u64",
          "index": false
        },
        {
          "name": "startSlot",
          "type": "u64",
          "index": false
        },
        {
          "name": "endSlot",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalValueLocked",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalExposedValue",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalRedistributed",
          "type": "u64",
          "index": false
        },
        {
          "name": "feesCollected",
          "type": "u64",
          "index": false
        },
        {
          "name": "participants",
          "type": "u32",
          "index": false
        },
        {
          "name": "winners",
          "type": "u32",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "RewardDistributed",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "cycleNumber",
          "type": "u64",
          "index": false
        },
        {
          "name": "redistributionAmount",
          "type": "i64",
          "index": false
        },
        {
          "name": "newBalance",
          "type": "u64",
          "index": false
        },
        {
          "name": "newScore",
          "type": "i64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "FeeCollected",
      "fields": [
        {
          "name": "cycleNumber",
          "type": "u64",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        },
        {
          "name": "totalFees",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ParticipationChanged",
      "fields": [
        {
          "name": "player",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "cycleNumber",
          "type": "u64",
          "index": false
        },
        {
          "name": "participating",
          "type": "bool",
          "index": false
        },
        {
          "name": "exposedValue",
          "type": "u64",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
    },
    {
      "name": "ProtocolStatusChanged",
      "fields": [
        {
          "name": "paused",
          "type": "bool",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "timestamp",
          "type": "i64",
          "index": false
        }
      ]
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
    },
    {
      "code": 6002,
      "name": "InvalidAccount",
      "msg": "Invalid account provided"
    },
    {
      "code": 6003,
      "name": "InvalidVault",
      "msg": "Invalid vault account"
    },
    {
      "code": 6004,
      "name": "InconsistentState",
      "msg": "State is inconsistent or corrupted"
    },
    {
      "code": 6005,
      "name": "PlayerAlreadyRegistered",
      "msg": "Player already registered"
    },
    {
      "code": 6006,
      "name": "PlayerNotRegistered",
      "msg": "Player not registered"
    },
    {
      "code": 6007,
      "name": "InsufficientBalance",
      "msg": "Player has insufficient balance"
    },
    {
      "code": 6008,
      "name": "InvalidDepositAmount",
      "msg": "Deposit amount is invalid or zero"
    },
    {
      "code": 6009,
      "name": "InvalidWithdrawalAmount",
      "msg": "Withdrawal amount exceeds available balance"
    },
    {
      "code": 6010,
      "name": "WithdrawalBlockedByExposure",
      "msg": "Withdrawal not allowed during active exposure"
    },
    {
      "code": 6011,
      "name": "DepositBelowMinimum",
      "msg": "Minimum deposit requirement not met"
    },
    {
      "code": 6012,
      "name": "ExposureOutOfRange",
      "msg": "Exposure value is out of allowed range"
    },
    {
      "code": 6013,
      "name": "InsufficientBalanceForExposure",
      "msg": "Cannot set exposure with insufficient balance"
    },
    {
      "code": 6014,
      "name": "ExposureCooldownActive",
      "msg": "Exposure change too frequent, cooldown not elapsed"
    },
    {
      "code": 6015,
      "name": "CycleNotEnded",
      "msg": "Cycle has not ended yet"
    },
    {
      "code": 6016,
      "name": "CycleAlreadyResolved",
      "msg": "Cycle already resolved"
    },
    {
      "code": 6017,
      "name": "InvalidCycleState",
      "msg": "Invalid cycle state"
    },
    {
      "code": 6018,
      "name": "InvalidRoundDuration",
      "msg": "Round duration invalid"
    },
    {
      "code": 6019,
      "name": "OperationTooFrequent",
      "msg": "Operation called too frequently"
    },
    {
      "code": 6020,
      "name": "CooldownNotElapsed",
      "msg": "Cooldown period not elapsed"
    },
    {
      "code": 6021,
      "name": "Unauthorized",
      "msg": "Operation not authorized for this user"
    },
    {
      "code": 6022,
      "name": "AdminOnly",
      "msg": "Admin privileges required"
    },
    {
      "code": 6023,
      "name": "ArithmeticOverflow",
      "msg": "Arithmetic overflow occurred"
    },
    {
      "code": 6024,
      "name": "ArithmeticUnderflow",
      "msg": "Arithmetic underflow occurred"
    },
    {
      "code": 6025,
      "name": "DivisionByZero",
      "msg": "Division by zero attempted"
    },
    {
      "code": 6026,
      "name": "MalformedData",
      "msg": "Malformed or invalid data provided"
    },
    {
      "code": 6027,
      "name": "InvalidConfiguration",
      "msg": "Invalid configuration parameters"
    },
    {
      "code": 6028,
      "name": "InvalidTimestamp",
      "msg": "Timestamp is invalid or in the past"
    },
    {
      "code": 6029,
      "name": "FeeCalculationFailed",
      "msg": "Protocol fee calculation failed"
    },
    {
      "code": 6030,
      "name": "InvalidPoolValue",
      "msg": "Total pool value is zero or invalid"
    },
    {
      "code": 6031,
      "name": "NoActivePlayers",
      "msg": "No active players in the cycle"
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
        {"name": "config", "isMut": false, "isSigner": false},
        {"name": "gameState", "isMut": true, "isSigner": false},
        {"name": "playerState", "isMut": true, "isSigner": false},
        {"name": "vault", "isMut": true, "isSigner": false},
        {"name": "player", "isMut": true, "isSigner": true},
        {"name": "systemProgram", "isMut": false, "isSigner": false}
      ],
      "args": [{"name": "amount", "type": "u64"}]
    },
    {
      "name": "withdraw",
      "accounts": [
        {"name": "config", "isMut": false, "isSigner": false},
        {"name": "gameState", "isMut": true, "isSigner": false},
        {"name": "playerState", "isMut": true, "isSigner": false},
        {"name": "vault", "isMut": true, "isSigner": false},
        {"name": "player", "isMut": true, "isSigner": true},
        {"name": "systemProgram", "isMut": false, "isSigner": false}
      ],
      "args": [{"name": "amount", "type": "u64"}]
    },
    {
      "name": "setExposure",
      "accounts": [
        {"name": "config", "isMut": false, "isSigner": false},
        {"name": "gameState", "isMut": true, "isSigner": false},
        {"name": "playerState", "isMut": true, "isSigner": false},
        {"name": "player", "isMut": true, "isSigner": true}
      ],
      "args": [{"name": "newExposure", "type": "u8"}]
    },
    {
      "name": "resolveCycle",
      "accounts": [
        {"name": "config", "isMut": true, "isSigner": false},
        {"name": "gameState", "isMut": true, "isSigner": false},
        {"name": "cycleState", "isMut": true, "isSigner": false},
        {"name": "treasuryVault", "isMut": true, "isSigner": false},
        {"name": "vault", "isMut": true, "isSigner": false},
        {"name": "resolver", "isMut": true, "isSigner": true},
        {"name": "systemProgram", "isMut": false, "isSigner": false}
      ],
      "args": []
    },
    {
      "name": "claimRedistribution",
      "accounts": [
        {"name": "config", "isMut": false, "isSigner": false},
        {"name": "gameState", "isMut": true, "isSigner": false},
        {"name": "cycleState", "isMut": true, "isSigner": false},
        {"name": "playerState", "isMut": true, "isSigner": false},
        {"name": "vault", "isMut": true, "isSigner": false},
        {"name": "player", "isMut": true, "isSigner": true},
        {"name": "systemProgram", "isMut": false, "isSigner": false}
      ],
      "args": [{"name": "cycleNumber", "type": "u64"}]
    }
  ],
  "accounts": [
    {
      "name": "GlobalConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "publicKey"},
          {"name": "protocolFeeBps", "type": "u16"},
          {"name": "minDeposit", "type": "u64"},
          {"name": "maxDeposit", "type": "u64"},
          {"name": "minExposure", "type": "u8"},
          {"name": "maxExposure", "type": "u8"},
          {"name": "cycleDuration", "type": "u64"},
          {"name": "exposureCooldown", "type": "u64"},
          {"name": "treasuryVault", "type": "publicKey"},
          {"name": "totalFeesCollected", "type": "u64"},
          {"name": "totalCycles", "type": "u64"},
          {"name": "paused", "type": "bool"},
          {"name": "bump", "type": "u8"}
        ]
      }
    },
    {
      "name": "GameState",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "currentCycle", "type": "u64"},
          {"name": "cycleStartSlot", "type": "u64"},
          {"name": "cycleEndSlot", "type": "u64"},
          {"name": "totalValueLocked", "type": "u64"},
          {"name": "totalExposedValue", "type": "u64"},
          {"name": "activePlayers", "type": "u32"},
          {"name": "cycleResolved", "type": "bool"},
          {"name": "lastUpdateSlot", "type": "u64"},
          {"name": "bump", "type": "u8"}
        ]
      }
    },
    {
      "name": "CycleState",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "cycleNumber", "type": "u64"},
          {"name": "startSlot", "type": "u64"},
          {"name": "endSlot", "type": "u64"},
          {"name": "resolvedSlot", "type": "u64"},
          {"name": "totalValueLocked", "type": "u64"},
          {"name": "totalExposedValue", "type": "u64"},
          {"name": "totalRedistributed", "type": "u64"},
          {"name": "feesCollected", "type": "u64"},
          {"name": "participants", "type": "u32"},
          {"name": "winners", "type": "u32"},
          {"name": "resolved", "type": "bool"},
          {"name": "bump", "type": "u8"}
        ]
      }
    },
    {
      "name": "PlayerState",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "player", "type": "publicKey"},
          {"name": "totalDeposited", "type": "u64"},
          {"name": "totalWithdrawn", "type": "u64"},
          {"name": "balance", "type": "u64"},
          {"name": "exposure", "type": "u8"},
          {"name": "exposedValue", "type": "u64"},
          {"name": "lastExposureChangeSlot", "type": "u64"},
          {"name": "lastActionSlot", "type": "u64"},
          {"name": "cyclesParticipated", "type": "u64"},
          {"name": "totalRedistributed", "type": "i64"},
          {"name": "participatingInCycle", "type": "bool"},
          {"name": "registeredSlot", "type": "u64"},
          {"name": "score", "type": "i64"},
          {"name": "bump", "type": "u8"}
        ]
      }
    },
    {
      "name": "TreasuryVault",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "authority", "type": "publicKey"},
          {"name": "totalCollected", "type": "u64"},
          {"name": "totalWithdrawn", "type": "u64"},
          {"name": "balance", "type": "u64"},
          {"name": "lastWithdrawalSlot", "type": "u64"},
          {"name": "bump", "type": "u8"}
        ]
      }
    }
  ],
  "events": [
    {"name": "ConfigInitialized", "fields": [{"name": "authority", "type": "publicKey", "index": false}, {"name": "protocolFeeBps", "type": "u16", "index": false}, {"name": "minDeposit", "type": "u64", "index": false}, {"name": "maxDeposit", "type": "u64", "index": false}, {"name": "cycleDuration", "type": "u64", "index": false}, {"name": "timestamp", "type": "i64", "index": false}]},
    {"name": "PlayerRegistered", "fields": [{"name": "player", "type": "publicKey", "index": false}, {"name": "timestamp", "type": "i64", "index": false}, {"name": "slot", "type": "u64", "index": false}]},
    {"name": "DepositMade", "fields": [{"name": "player", "type": "publicKey", "index": false}, {"name": "amount", "type": "u64", "index": false}, {"name": "newBalance", "type": "u64", "index": false}, {"name": "timestamp", "type": "i64", "index": false}, {"name": "slot", "type": "u64", "index": false}]},
    {"name": "WithdrawMade", "fields": [{"name": "player", "type": "publicKey", "index": false}, {"name": "amount", "type": "u64", "index": false}, {"name": "newBalance", "type": "u64", "index": false}, {"name": "timestamp", "type": "i64", "index": false}, {"name": "slot", "type": "u64", "index": false}]},
    {"name": "ExposureUpdated", "fields": [{"name": "player", "type": "publicKey", "index": false}, {"name": "oldExposure", "type": "u8", "index": false}, {"name": "newExposure", "type": "u8", "index": false}, {"name": "exposedValue", "type": "u64", "index": false}, {"name": "timestamp", "type": "i64", "index": false}, {"name": "slot", "type": "u64", "index": false}]},
    {"name": "CycleResolved", "fields": [{"name": "cycleNumber", "type": "u64", "index": false}, {"name": "startSlot", "type": "u64", "index": false}, {"name": "endSlot", "type": "u64", "index": false}, {"name": "totalValueLocked", "type": "u64", "index": false}, {"name": "totalExposedValue", "type": "u64", "index": false}, {"name": "totalRedistributed", "type": "u64", "index": false}, {"name": "feesCollected", "type": "u64", "index": false}, {"name": "participants", "type": "u32", "index": false}, {"name": "winners", "type": "u32", "index": false}, {"name": "timestamp", "type": "i64", "index": false}]},
    {"name": "RewardDistributed", "fields": [{"name": "player", "type": "publicKey", "index": false}, {"name": "cycleNumber", "type": "u64", "index": false}, {"name": "redistributionAmount", "type": "i64", "index": false}, {"name": "newBalance", "type": "u64", "index": false}, {"name": "newScore", "type": "i64", "index": false}, {"name": "timestamp", "type": "i64", "index": false}]},
    {"name": "FeeCollected", "fields": [{"name": "cycleNumber", "type": "u64", "index": false}, {"name": "amount", "type": "u64", "index": false}, {"name": "totalFees", "type": "u64", "index": false}, {"name": "timestamp", "type": "i64", "index": false}]},
    {"name": "ParticipationChanged", "fields": [{"name": "player", "type": "publicKey", "index": false}, {"name": "cycleNumber", "type": "u64", "index": false}, {"name": "participating", "type": "bool", "index": false}, {"name": "exposedValue", "type": "u64", "index": false}, {"name": "timestamp", "type": "i64", "index": false}]},
    {"name": "ProtocolStatusChanged", "fields": [{"name": "paused", "type": "bool", "index": false}, {"name": "authority", "type": "publicKey", "index": false}, {"name": "timestamp", "type": "i64", "index": false}]}
  ],
  "errors": [
    {"code": 6000, "name": "InvalidAuthority", "msg": "Invalid authority for this operation"},
    {"code": 6001, "name": "AccountNotInitialized", "msg": "Account not initialized"},
    {"code": 6002, "name": "InvalidAccount", "msg": "Invalid account provided"},
    {"code": 6003, "name": "InvalidVault", "msg": "Invalid vault account"},
    {"code": 6004, "name": "InconsistentState", "msg": "State is inconsistent or corrupted"},
    {"code": 6005, "name": "PlayerAlreadyRegistered", "msg": "Player already registered"},
    {"code": 6006, "name": "PlayerNotRegistered", "msg": "Player not registered"},
    {"code": 6007, "name": "InsufficientBalance", "msg": "Player has insufficient balance"},
    {"code": 6008, "name": "InvalidDepositAmount", "msg": "Deposit amount is invalid or zero"},
    {"code": 6009, "name": "InvalidWithdrawalAmount", "msg": "Withdrawal amount exceeds available balance"},
    {"code": 6010, "name": "WithdrawalBlockedByExposure", "msg": "Withdrawal not allowed during active exposure"},
    {"code": 6011, "name": "DepositBelowMinimum", "msg": "Minimum deposit requirement not met"},
    {"code": 6012, "name": "ExposureOutOfRange", "msg": "Exposure value is out of allowed range"},
    {"code": 6013, "name": "InsufficientBalanceForExposure", "msg": "Cannot set exposure with insufficient balance"},
    {"code": 6014, "name": "ExposureCooldownActive", "msg": "Exposure change too frequent, cooldown not elapsed"},
    {"code": 6015, "name": "CycleNotEnded", "msg": "Cycle has not ended yet"},
    {"code": 6016, "name": "CycleAlreadyResolved", "msg": "Cycle already resolved"},
    {"code": 6017, "name": "InvalidCycleState", "msg": "Invalid cycle state"},
    {"code": 6018, "name": "InvalidRoundDuration", "msg": "Round duration invalid"},
    {"code": 6019, "name": "OperationTooFrequent", "msg": "Operation called too frequently"},
    {"code": 6020, "name": "CooldownNotElapsed", "msg": "Cooldown period not elapsed"},
    {"code": 6021, "name": "Unauthorized", "msg": "Operation not authorized for this user"},
    {"code": 6022, "name": "AdminOnly", "msg": "Admin privileges required"},
    {"code": 6023, "name": "ArithmeticOverflow", "msg": "Arithmetic overflow occurred"},
    {"code": 6024, "name": "ArithmeticUnderflow", "msg": "Arithmetic underflow occurred"},
    {"code": 6025, "name": "DivisionByZero", "msg": "Division by zero attempted"},
    {"code": 6026, "name": "MalformedData", "msg": "Malformed or invalid data provided"},
    {"code": 6027, "name": "InvalidConfiguration", "msg": "Invalid configuration parameters"},
    {"code": 6028, "name": "InvalidTimestamp", "msg": "Timestamp is invalid or in the past"},
    {"code": 6029, "name": "FeeCalculationFailed", "msg": "Protocol fee calculation failed"},
    {"code": 6030, "name": "InvalidPoolValue", "msg": "Total pool value is zero or invalid"},
    {"code": 6031, "name": "NoActivePlayers", "msg": "No active players in the cycle"}
  ]
};
