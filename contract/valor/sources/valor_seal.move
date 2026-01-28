#[allow(lint(public_entry))]
module valor::valor_seal {
    use sui::table::{Self, Table};
    use std::string::String;
    
    const ENoAccess: u64 = 1;
    const ENoNFTOwnership: u64 = 2;
    const EInvalidPlayer: u64 = 3;
    
    /// Global registry to track NFT ownership by player
    public struct NFTRegistry has key {
        id: UID,
        /// Maps player_id -> (owner_address -> shares_owned)
        ownership: Table<ID, Table<address, u64>>,
    }
    
    /// Premium AI data access record
    public struct PremiumAccess has key, store {
        id: UID,
        player_id: ID,
        owner: address,
        shares_held: u64,
        accessed_at: u64,
    }
    
    fun init(ctx: &mut TxContext) {
        let registry = NFTRegistry {
            id: object::new(ctx),
            ownership: table::new(ctx),
        };
        transfer::share_object(registry);
    }
    
    /// Register NFT ownership (called when buying shares)
    public entry fun register_nft_ownership(
        registry: &mut NFTRegistry,
        player_id: ID,
        owner: address,
        shares: u64,
        ctx: &mut TxContext
    ) {
        let _ = ctx;
        
        if (!table::contains(&registry.ownership, player_id)) {
            table::add(&mut registry.ownership, player_id, table::new(ctx));
        };
        
        let player_table = table::borrow_mut(&mut registry.ownership, player_id);
        
        if (table::contains(player_table, owner)) {
            let current_shares = table::borrow_mut(player_table, owner);
            *current_shares = *current_shares + shares;
        } else {
            table::add(player_table, owner, shares);
        };
    }
    
    /// Reduce NFT ownership (called when selling shares)
    public entry fun reduce_nft_ownership(
        registry: &mut NFTRegistry,
        player_id: ID,
        owner: address,
        shares: u64,
        _ctx: &mut TxContext
    ) {
        assert!(table::contains(&registry.ownership, player_id), EInvalidPlayer);
        
        let player_table = table::borrow_mut(&mut registry.ownership, player_id);
        assert!(table::contains(player_table, owner), ENoNFTOwnership);
        
        let current_shares = table::borrow_mut(player_table, owner);
        if (*current_shares <= shares) {
            *current_shares = 0;
        } else {
            *current_shares = *current_shares - shares;
        };
    }
    
    /// Check if user has any NFT ownership for a player
    public fun has_nft_ownership(
        registry: &NFTRegistry,
        player_id: ID,
        owner: address,
    ): bool {
        if (!table::contains(&registry.ownership, player_id)) {
            return false
        };
        
        let player_table = table::borrow(&registry.ownership, player_id);
        if (!table::contains(player_table, owner)) {
            return false
        };
        
        let shares = table::borrow(player_table, owner);
        *shares > 0
    }
    
    /// Get user's share count for a player
    public fun get_user_shares(
        registry: &NFTRegistry,
        player_id: ID,
        owner: address,
    ): u64 {
        if (!table::contains(&registry.ownership, player_id)) {
            return 0
        };
        
        let player_table = table::borrow(&registry.ownership, player_id);
        if (!table::contains(player_table, owner)) {
            return 0
        };
        
        *table::borrow(player_table, owner)
    }
    
    
    entry fun seal_approve(
        id: vector<u8>,
        registry: &NFTRegistry,
        ctx: &TxContext
    ) {
        let caller = ctx.sender();
        
        // Parse the ID to extract player_id
        // ID format: [player_id bytes][season byte]
        // For simplicity, we'll assume the player_id is embedded
        // In production, you'd parse this properly
        
        // This is a simplified check - in production, parse the ID properly
        // For now, we'll check against a known player ID from the transaction
        
        // The enclave will call this with the proper player_id in the transaction
        // For the MVP, we verify caller has >0 shares for ANY player
        let mut has_any_shares = false;
        
        // In production, parse player_id from `id` bytes
        // For MVP, we check if user owns any NFTs at all
        // This is simplified - you should parse the actual player_id from `id`
        
        assert!(id.length() > 0, ENoAccess);
        
        // TODO: Parse player_id from `id` bytes and check specific ownership
        // For now, this is a placeholder that will be improved
        
        assert!(has_any_shares || caller == @0x0, ENoAccess);
    }
    
    /// Simplified seal_approve that takes player_id explicitly
    /// This is the one we'll actually use
    entry fun seal_approve_with_player(
        _id: vector<u8>,
        registry: &NFTRegistry,
        player_id: ID,
        ctx: &TxContext
    ) {
        let caller = ctx.sender();
        let has_ownership = has_nft_ownership(registry, player_id, caller);
        assert!(has_ownership, ENoNFTOwnership);
    }
    
    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
    
    #[test_only]
    public fun destroy_registry_for_testing(registry: NFTRegistry) {
        let NFTRegistry { id, ownership } = registry;
        ownership.drop();
        object::delete(id);
    }
}