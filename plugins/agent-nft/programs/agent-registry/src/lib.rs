use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

declare_id!("AgntREGisTrYxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

#[program]
pub mod agent_registry {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        registry.admin = ctx.accounts.admin.key();
        registry.agent_count = 0;
        Ok(())
    }

    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        dna_sequence: String,
        nft_mint: Pubkey,
        ordinals_id: Option<String>,
        metadata_uri: String,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;
        let agent = &mut ctx.accounts.agent;
        let clock = Clock::get()?;

        // Hash the DNA sequence
        let dna_hash = hash(dna_sequence.as_bytes()).to_bytes();

        // Initialize agent record
        agent.owner = ctx.accounts.owner.key();
        agent.dna_hash = dna_hash;
        agent.nft_mint = nft_mint;
        agent.ordinals_id = ordinals_id;
        agent.metadata_uri = metadata_uri;
        agent.generation = 0;
        agent.created_at = clock.unix_timestamp;
        agent.updated_at = clock.unix_timestamp;
        agent.parent = None;
        agent.children = Vec::new();
        agent.evolution_count = 0;

        // Update registry
        registry.agent_count = registry.agent_count.checked_add(1).unwrap();

        emit!(AgentRegistered {
            agent: agent.key(),
            owner: agent.owner,
            dna_hash,
            nft_mint,
            ordinals_id: ordinals_id.clone(),
            generation: 0,
        });

        Ok(())
    }

    pub fn evolve_agent(
        ctx: Context<EvolveAgent>,
        new_dna_sequence: String,
        new_nft_mint: Pubkey,
        new_ordinals_id: Option<String>,
        new_metadata_uri: String,
    ) -> Result<()> {
        let parent = &mut ctx.accounts.parent_agent;
        let child = &mut ctx.accounts.child_agent;
        let clock = Clock::get()?;

        // Hash the new DNA sequence
        let new_dna_hash = hash(new_dna_sequence.as_bytes()).to_bytes();

        // Initialize child agent
        child.owner = ctx.accounts.owner.key();
        child.dna_hash = new_dna_hash;
        child.nft_mint = new_nft_mint;
        child.ordinals_id = new_ordinals_id;
        child.metadata_uri = new_metadata_uri;
        child.generation = parent.generation.checked_add(1).unwrap();
        child.created_at = clock.unix_timestamp;
        child.updated_at = clock.unix_timestamp;
        child.parent = Some(parent.key());
        child.children = Vec::new();
        child.evolution_count = 0;

        // Update parent
        parent.children.push(child.key());
        parent.evolution_count = parent.evolution_count.checked_add(1).unwrap();
        parent.updated_at = clock.unix_timestamp;

        emit!(AgentEvolved {
            parent: parent.key(),
            child: child.key(),
            owner: child.owner,
            new_dna_hash,
            new_nft_mint,
            new_ordinals_id: new_ordinals_id.clone(),
            generation: child.generation,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = admin,
        space = Registry::LEN
    )]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(mut)]
    pub registry: Account<'info, Registry>,
    #[account(
        init,
        payer = owner,
        space = AgentRecord::LEN
    )]
    pub agent: Account<'info, AgentRecord>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct EvolveAgent<'info> {
    #[account(mut)]
    pub registry: Account<'info, Registry>,
    #[account(mut)]
    pub parent_agent: Account<'info, AgentRecord>,
    #[account(
        init,
        payer = owner,
        space = AgentRecord::LEN
    )]
    pub child_agent: Account<'info, AgentRecord>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Registry {
    pub admin: Pubkey,
    pub agent_count: u64,
}

#[account]
pub struct AgentRecord {
    pub owner: Pubkey,
    pub dna_hash: [u8; 32],
    pub nft_mint: Pubkey,
    pub ordinals_id: Option<String>,
    pub metadata_uri: String,
    pub generation: u32,
    pub created_at: i64,
    pub updated_at: i64,
    pub parent: Option<Pubkey>,
    pub children: Vec<Pubkey>,
    pub evolution_count: u32,
}

#[event]
pub struct AgentRegistered {
    pub agent: Pubkey,
    pub owner: Pubkey,
    pub dna_hash: [u8; 32],
    pub nft_mint: Pubkey,
    pub ordinals_id: Option<String>,
    pub generation: u32,
}

#[event]
pub struct AgentEvolved {
    pub parent: Pubkey,
    pub child: Pubkey,
    pub owner: Pubkey,
    pub new_dna_hash: [u8; 32],
    pub new_nft_mint: Pubkey,
    pub new_ordinals_id: Option<String>,
    pub generation: u32,
}

impl Registry {
    pub const LEN: usize = 8 + // discriminator
        32 + // admin
        8;   // agent_count
}

impl AgentRecord {
    pub const LEN: usize = 8 + // discriminator
        32 + // owner
        32 + // dna_hash
        32 + // nft_mint
        (4 + 64) + // ordinals_id (Option<String>)
        (4 + 128) + // metadata_uri
        4 + // generation
        8 + // created_at
        8 + // updated_at
        (1 + 32) + // parent (Option<Pubkey>)
        (4 + (32 * 10)) + // children (Vec<Pubkey>) with max 10 children
        4;  // evolution_count
}
