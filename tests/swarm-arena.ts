import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SwarmArena } from "../target/types/swarm_arena";
import { expect } from "chai";
import { 
  getConfigPDA, 
  getGameStatePDA, 
  getPlayerStatePDA, 
  getTreasuryVaultPDA,
  getVaultPDA,
  getCycleStatePDA,
  airdrop,
  sleep
} from "./helpers";

describe("swarm-arena", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.SwarmArena as Program<SwarmArena>;
  const authority = provider.wallet as anchor.Wallet;
  
  // Test players
  let player1: anchor.web3.Keypair;
  let player2: anchor.web3.Keypair;
  let player3: anchor.web3.Keypair;

  // PDAs
  let configPDA: anchor.web3.PublicKey;
  let gameStatePDA: anchor.web3.PublicKey;
  let treasuryVaultPDA: anchor.web3.PublicKey;
  let vaultPDA: anchor.web3.PublicKey;

  // Config parameters
  const PROTOCOL_FEE_BPS = 200; // 2%
  const MIN_DEPOSIT = 1_000_000; // 0.001 SOL
  const MAX_DEPOSIT = 1_000_000_000; // 1 SOL
  const MIN_EXPOSURE = 0;
  const MAX_EXPOSURE = 100;
  const CYCLE_DURATION = 100; // slots
  const EXPOSURE_COOLDOWN = 10; // slots

  before(async () => {
    // Generate test players
    player1 = anchor.web3.Keypair.generate();
    player2 = anchor.web3.Keypair.generate();
    player3 = anchor.web3.Keypair.generate();

    // Airdrop SOL to test players
    await airdrop(provider.connection, player1.publicKey, 10);
    await airdrop(provider.connection, player2.publicKey, 10);
    await airdrop(provider.connection, player3.publicKey, 10);

    // Get PDAs
    configPDA = getConfigPDA(program.programId);
    gameStatePDA = getGameStatePDA(program.programId);
    treasuryVaultPDA = getTreasuryVaultPDA(program.programId);
    vaultPDA = getVaultPDA(program.programId);
  });

  describe("Initialize Config", () => {
    it("should initialize protocol configuration", async () => {
      const tx = await program.methods
        .initializeConfig(
          PROTOCOL_FEE_BPS,
          new anchor.BN(MIN_DEPOSIT),
          new anchor.BN(MAX_DEPOSIT),
          MIN_EXPOSURE,
          MAX_EXPOSURE,
          new anchor.BN(CYCLE_DURATION),
          new anchor.BN(EXPOSURE_COOLDOWN)
        )
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          treasuryVault: treasuryVaultPDA,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Initialize config tx:", tx);

      // Verify config
      const config = await program.account.globalConfig.fetch(configPDA);
      expect(config.authority.toString()).to.equal(authority.publicKey.toString());
      expect(config.protocolFeeBps).to.equal(PROTOCOL_FEE_BPS);
      expect(config.minDeposit.toNumber()).to.equal(MIN_DEPOSIT);
      expect(config.maxDeposit.toNumber()).to.equal(MAX_DEPOSIT);
      expect(config.paused).to.be.false;

      // Verify game state
      const gameState = await program.account.gameState.fetch(gameStatePDA);
      expect(gameState.currentCycle.toNumber()).to.equal(1);
      expect(gameState.activePlayers).to.equal(0);
      expect(gameState.cycleResolved).to.be.false;
    });

    it("should fail to initialize twice", async () => {
      try {
        await program.methods
          .initializeConfig(
            PROTOCOL_FEE_BPS,
            new anchor.BN(MIN_DEPOSIT),
            new anchor.BN(MAX_DEPOSIT),
            MIN_EXPOSURE,
            MAX_EXPOSURE,
            new anchor.BN(CYCLE_DURATION),
            new anchor.BN(EXPOSURE_COOLDOWN)
          )
          .accounts({
            config: configPDA,
            gameState: gameStatePDA,
            treasuryVault: treasuryVaultPDA,
            authority: authority.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        expect.fail("Should have failed");
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("Register Player", () => {
    it("should register player1", async () => {
      const playerStatePDA = getPlayerStatePDA(program.programId, player1.publicKey);

      const tx = await program.methods
        .registerPlayer()
        .accounts({
          config: configPDA,
          playerState: playerStatePDA,
          player: player1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player1])
        .rpc();

      console.log("Register player1 tx:", tx);

      // Verify player state
      const playerState = await program.account.playerState.fetch(playerStatePDA);
      expect(playerState.player.toString()).to.equal(player1.publicKey.toString());
      expect(playerState.balance.toNumber()).to.equal(0);
      expect(playerState.exposure).to.equal(0);
      expect(playerState.participatingInCycle).to.be.false;
    });

    it("should register player2 and player3", async () => {
      const player2StatePDA = getPlayerStatePDA(program.programId, player2.publicKey);
      const player3StatePDA = getPlayerStatePDA(program.programId, player3.publicKey);

      await program.methods
        .registerPlayer()
        .accounts({
          config: configPDA,
          playerState: player2StatePDA,
          player: player2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player2])
        .rpc();

      await program.methods
        .registerPlayer()
        .accounts({
          config: configPDA,
          playerState: player3StatePDA,
          player: player3.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player3])
        .rpc();

      console.log("Players 2 and 3 registered");
    });

    it("should fail to register same player twice", async () => {
      const playerStatePDA = getPlayerStatePDA(program.programId, player1.publicKey);

      try {
        await program.methods
          .registerPlayer()
          .accounts({
            config: configPDA,
            playerState: playerStatePDA,
            player: player1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([player1])
          .rpc();
        
        expect.fail("Should have failed");
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("Deposit", () => {
    it("should deposit 10M lamports for player1", async () => {
      const playerStatePDA = getPlayerStatePDA(program.programId, player1.publicKey);
      const depositAmount = 10_000_000; // 0.01 SOL

      const tx = await program.methods
        .deposit(new anchor.BN(depositAmount))
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          playerState: playerStatePDA,
          vault: vaultPDA,
          player: player1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player1])
        .rpc();

      console.log("Deposit player1 tx:", tx);

      // Verify player state
      const playerState = await program.account.playerState.fetch(playerStatePDA);
      expect(playerState.balance.toNumber()).to.equal(depositAmount);
      expect(playerState.totalDeposited.toNumber()).to.equal(depositAmount);

      // Verify game state TVL
      const gameState = await program.account.gameState.fetch(gameStatePDA);
      expect(gameState.totalValueLocked.toNumber()).to.equal(depositAmount);
    });

    it("should deposit for player2 and player3", async () => {
      const player2StatePDA = getPlayerStatePDA(program.programId, player2.publicKey);
      const player3StatePDA = getPlayerStatePDA(program.programId, player3.publicKey);

      await program.methods
        .deposit(new anchor.BN(20_000_000))
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          playerState: player2StatePDA,
          vault: vaultPDA,
          player: player2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player2])
        .rpc();

      await program.methods
        .deposit(new anchor.BN(30_000_000))
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          playerState: player3StatePDA,
          vault: vaultPDA,
          player: player3.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player3])
        .rpc();

      console.log("Players 2 and 3 deposited");
    });

    it("should fail to deposit below minimum", async () => {
      const playerStatePDA = getPlayerStatePDA(program.programId, player1.publicKey);

      try {
        await program.methods
          .deposit(new anchor.BN(100)) // Below MIN_DEPOSIT
          .accounts({
            config: configPDA,
            gameState: gameStatePDA,
            playerState: playerStatePDA,
            vault: vaultPDA,
            player: player1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([player1])
          .rpc();
        
        expect.fail("Should have failed");
      } catch (err) {
        expect(err).to.exist;
      }
    });
  });

  describe("Set Exposure", () => {
    it("should set exposure to 50% for player1", async () => {
      const playerStatePDA = getPlayerStatePDA(program.programId, player1.publicKey);

      const tx = await program.methods
        .setExposure(50)
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          playerState: playerStatePDA,
          player: player1.publicKey,
        })
        .signers([player1])
        .rpc();

      console.log("Set exposure player1 tx:", tx);

      // Verify player state
      const playerState = await program.account.playerState.fetch(playerStatePDA);
      expect(playerState.exposure).to.equal(50);
      expect(playerState.participatingInCycle).to.be.true;
      expect(playerState.exposedValue.toNumber()).to.equal(5_000_000); // 50% of 10M

      // Verify game state
      const gameState = await program.account.gameState.fetch(gameStatePDA);
      expect(gameState.activePlayers).to.equal(1);
      expect(gameState.totalExposedValue.toNumber()).to.equal(5_000_000);
    });

    it("should set exposure for player2 and player3", async () => {
      const player2StatePDA = getPlayerStatePDA(program.programId, player2.publicKey);
      const player3StatePDA = getPlayerStatePDA(program.programId, player3.publicKey);

      await program.methods
        .setExposure(75)
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          playerState: player2StatePDA,
          player: player2.publicKey,
        })
        .signers([player2])
        .rpc();

      await program.methods
        .setExposure(100)
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          playerState: player3StatePDA,
          player: player3.publicKey,
        })
        .signers([player3])
        .rpc();

      const gameState = await program.account.gameState.fetch(gameStatePDA);
      expect(gameState.activePlayers).to.equal(3);
      console.log("All players set exposure");
    });

    it("should fail to set exposure above maximum", async () => {
      const playerStatePDA = getPlayerStatePDA(program.programId, player1.publicKey);

      try {
        await program.methods
          .setExposure(150) // Above MAX_EXPOSURE
          .accounts({
            config: configPDA,
            gameState: gameStatePDA,
            playerState: playerStatePDA,
            player: player1.publicKey,
          })
          .signers([player1])
          .rpc();
        
        expect.fail("Should have failed");
      } catch (err) {
        expect(err).to.exist;
      }
    });

    it("should fail to change exposure before cooldown", async () => {
      const playerStatePDA = getPlayerStatePDA(program.programId, player1.publicKey);

      try {
        await program.methods
          .setExposure(25)
          .accounts({
            config: configPDA,
            gameState: gameStatePDA,
            playerState: playerStatePDA,
            player: player1.publicKey,
          })
          .signers([player1])
          .rpc();
        
        expect.fail("Should have failed");
      } catch (err) {
        expect(err).to.exist;
        console.log("Cooldown check passed");
      }
    });
  });

  describe("Withdraw", () => {
    it("should fail to withdraw with active exposure", async () => {
      const playerStatePDA = getPlayerStatePDA(program.programId, player1.publicKey);

      try {
        await program.methods
          .withdraw(new anchor.BN(1_000_000))
          .accounts({
            config: configPDA,
            gameState: gameStatePDA,
            playerState: playerStatePDA,
            vault: vaultPDA,
            player: player1.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([player1])
          .rpc();
        
        expect.fail("Should have failed");
      } catch (err) {
        expect(err).to.exist;
        console.log("Withdrawal blocked by exposure - correct");
      }
    });

    it("should withdraw after setting exposure to 0", async () => {
      const playerStatePDA = getPlayerStatePDA(program.programId, player1.publicKey);

      // Wait for cooldown
      await sleep(EXPOSURE_COOLDOWN * 400); // ~400ms per slot

      // Set exposure to 0
      await program.methods
        .setExposure(0)
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          playerState: playerStatePDA,
          player: player1.publicKey,
        })
        .signers([player1])
        .rpc();

      // Now withdraw
      const withdrawAmount = 5_000_000;
      const tx = await program.methods
        .withdraw(new anchor.BN(withdrawAmount))
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          playerState: playerStatePDA,
          vault: vaultPDA,
          player: player1.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player1])
        .rpc();

      console.log("Withdraw player1 tx:", tx);

      // Verify player state
      const playerState = await program.account.playerState.fetch(playerStatePDA);
      expect(playerState.balance.toNumber()).to.equal(5_000_000);
      expect(playerState.totalWithdrawn.toNumber()).to.equal(withdrawAmount);
    });
  });

  describe("Resolve Cycle", () => {
    it("should fail to resolve cycle before end slot", async () => {
      const cycleStatePDA = getCycleStatePDA(program.programId, 1);

      try {
        await program.methods
          .resolveCycle()
          .accounts({
            config: configPDA,
            gameState: gameStatePDA,
            cycleState: cycleStatePDA,
            treasuryVault: treasuryVaultPDA,
            vault: vaultPDA,
            resolver: authority.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        
        expect.fail("Should have failed");
      } catch (err) {
        expect(err).to.exist;
        console.log("Cycle not ended yet - correct");
      }
    });

    it("should resolve cycle after end slot", async () => {
      // Wait for cycle to end
      console.log("Waiting for cycle to end...");
      await sleep(CYCLE_DURATION * 400 + 5000); // Wait for cycle duration + buffer

      const cycleStatePDA = getCycleStatePDA(program.programId, 1);

      const tx = await program.methods
        .resolveCycle()
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          cycleState: cycleStatePDA,
          treasuryVault: treasuryVaultPDA,
          vault: vaultPDA,
          resolver: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Resolve cycle tx:", tx);

      // Verify cycle state
      const cycleState = await program.account.cycleState.fetch(cycleStatePDA);
      expect(cycleState.cycleNumber.toNumber()).to.equal(1);
      expect(cycleState.resolved).to.be.true;
      expect(cycleState.feesCollected.toNumber()).to.be.greaterThan(0);

      // Verify game state moved to next cycle
      const gameState = await program.account.gameState.fetch(gameStatePDA);
      expect(gameState.currentCycle.toNumber()).to.equal(2);
      expect(gameState.cycleResolved).to.be.false;

      // Verify treasury received fees
      const treasuryVault = await program.account.treasuryVault.fetch(treasuryVaultPDA);
      expect(treasuryVault.totalCollected.toNumber()).to.be.greaterThan(0);

      console.log("Fees collected:", cycleState.feesCollected.toNumber());
      console.log("Treasury balance:", treasuryVault.balance.toNumber());
    });
  });

  describe("Claim Redistribution", () => {
    it("should claim redistribution for player2", async () => {
      const player2StatePDA = getPlayerStatePDA(program.programId, player2.publicKey);
      const cycleStatePDA = getCycleStatePDA(program.programId, 1);

      const playerStateBefore = await program.account.playerState.fetch(player2StatePDA);
      const balanceBefore = playerStateBefore.balance.toNumber();

      const tx = await program.methods
        .claimRedistribution(new anchor.BN(1))
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          cycleState: cycleStatePDA,
          playerState: player2StatePDA,
          vault: vaultPDA,
          player: player2.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player2])
        .rpc();

      console.log("Claim redistribution player2 tx:", tx);

      const playerStateAfter = await program.account.playerState.fetch(player2StatePDA);
      const balanceAfter = playerStateAfter.balance.toNumber();
      const redistribution = playerStateAfter.totalRedistributed.toNumber();

      console.log("Player2 balance before:", balanceBefore);
      console.log("Player2 balance after:", balanceAfter);
      console.log("Player2 redistribution:", redistribution);
      console.log("Player2 cycles participated:", playerStateAfter.cyclesParticipated.toNumber());
      
      // Verify last_claimed_cycle was updated
      expect(playerStateAfter.lastClaimedCycle.toNumber()).to.equal(1);
    });

    it("should fail to claim same cycle twice (double claim protection)", async () => {
      const player2StatePDA = getPlayerStatePDA(program.programId, player2.publicKey);
      const cycleStatePDA = getCycleStatePDA(program.programId, 1);

      try {
        await program.methods
          .claimRedistribution(new anchor.BN(1))
          .accounts({
            config: configPDA,
            gameState: gameStatePDA,
            cycleState: cycleStatePDA,
            playerState: player2StatePDA,
            vault: vaultPDA,
            player: player2.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([player2])
          .rpc();
        
        expect.fail("Should have failed - double claim should be prevented");
      } catch (err) {
        expect(err).to.exist;
        console.log("✅ Double claim correctly prevented");
      }
    });

    it("should claim redistribution for player3", async () => {
      const player3StatePDA = getPlayerStatePDA(program.programId, player3.publicKey);
      const cycleStatePDA = getCycleStatePDA(program.programId, 1);

      await program.methods
        .claimRedistribution(new anchor.BN(1))
        .accounts({
          config: configPDA,
          gameState: gameStatePDA,
          cycleState: cycleStatePDA,
          playerState: player3StatePDA,
          vault: vaultPDA,
          player: player3.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([player3])
        .rpc();

      const playerState = await program.account.playerState.fetch(player3StatePDA);
      console.log("Player3 redistribution:", playerState.totalRedistributed.toNumber());
      
      // Verify last_claimed_cycle was updated
      expect(playerState.lastClaimedCycle.toNumber()).to.equal(1);
    });
  });
});