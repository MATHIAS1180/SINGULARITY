import * as anchor from "@coral-xyz/anchor";

/**
 * Get Config PDA
 */
export function getConfigPDA(programId: anchor.web3.PublicKey): anchor.web3.PublicKey {
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    programId
  );
  return pda;
}

/**
 * Get GameState PDA
 */
export function getGameStatePDA(programId: anchor.web3.PublicKey): anchor.web3.PublicKey {
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("game_state")],
    programId
  );
  return pda;
}

/**
 * Get PlayerState PDA
 */
export function getPlayerStatePDA(
  programId: anchor.web3.PublicKey,
  player: anchor.web3.PublicKey
): anchor.web3.PublicKey {
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("player"), player.toBuffer()],
    programId
  );
  return pda;
}

/**
 * Get TreasuryVault PDA
 */
export function getTreasuryVaultPDA(programId: anchor.web3.PublicKey): anchor.web3.PublicKey {
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("treasury")],
    programId
  );
  return pda;
}

/**
 * Get Vault PDA
 */
export function getVaultPDA(programId: anchor.web3.PublicKey): anchor.web3.PublicKey {
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("vault")],
    programId
  );
  return pda;
}

/**
 * Get CycleState PDA
 */
export function getCycleStatePDA(
  programId: anchor.web3.PublicKey,
  cycleNumber: number
): anchor.web3.PublicKey {
  const cycleBuffer = Buffer.alloc(8);
  cycleBuffer.writeBigUInt64LE(BigInt(cycleNumber));
  
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("cycle"), cycleBuffer],
    programId
  );
  return pda;
}

/**
 * Airdrop SOL to an address
 */
export async function airdrop(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey,
  amount: number
): Promise<void> {
  const signature = await connection.requestAirdrop(
    address,
    amount * anchor.web3.LAMPORTS_PER_SOL
  );
  
  const latestBlockhash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    signature,
    ...latestBlockhash,
  });
  
  console.log(`Airdropped ${amount} SOL to ${address.toString()}`);
}

/**
 * Sleep for a given number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get account balance in lamports
 */
export async function getBalance(
  connection: anchor.web3.Connection,
  address: anchor.web3.PublicKey
): Promise<number> {
  return await connection.getBalance(address);
}

/**
 * Format lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / anchor.web3.LAMPORTS_PER_SOL;
}

/**
 * Format SOL to lamports
 */
export function solToLamports(sol: number): number {
  return sol * anchor.web3.LAMPORTS_PER_SOL;
}