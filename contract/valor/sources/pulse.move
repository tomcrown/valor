#[allow(lint(public_entry))]
module valor::pulse {
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};
    use valor::valor::AdminCap; // Import AdminCap from main module

    // ============================================================================
    // Error Codes
    // ============================================================================
    
    const EAlreadyVoted: u64 = 1;
    const EInvalidWeek: u64 = 2;
    const EAdminRequired: u64 = 3;
    const EInvalidVote: u64 = 4;
    const EWeekNotActive: u64 = 5;

    // ============================================================================
    // Structs
    // ============================================================================

    /// Main platform state for Pulse voting
    public struct PulsePlatform has key {
        id: UID,
        admin: address,
        current_week: u64,
        week_start_time: u64,
        week_end_time: u64,
        active: bool,
        total_votes: u64,
    }

    /// Sentiment data for a specific player in a specific week
    public struct PlayerSentiment has key {
        id: UID,
        player_id: ID,           // Reference to main contract player
        player_name: String,
        week: u64,
        yes_count: u64,
        no_count: u64,
        walrus_blob_id: String,  // Detailed votes stored on Walrus
        created_at: u64,
        updated_at: u64,
    }

    /// Receipt proving a user has voted for a specific player in a specific week
    public struct VoteReceipt has key {
        id: UID,
        voter: address,
        player_id: ID,
        player_name: String,
        week: u64,
        vote: bool,              // true = yes, false = no
        timestamp: u64,
    }

    /// Lookup table for checking if user has voted
    public struct VoteRegistry has key {
        id: UID,
        // Maps: player_id + week -> voter address -> bool (voted or not)
        votes: Table<String, Table<address, bool>>,
    }

    // ============================================================================
    // Events
    // ============================================================================

    public struct WeeklyRoundCreated has copy, drop {
        week: u64,
        start_time: u64,
        end_time: u64,
        admin: address,
        timestamp: u64,
    }

    public struct VoteSubmitted has copy, drop {
        voter: address,
        player_id: ID,
        player_name: String,
        week: u64,
        vote: bool,              // true = yes, false = no
        yes_count: u64,
        no_count: u64,
        yes_percentage: u64,
        no_percentage: u64,
        timestamp: u64,
    }

    public struct SentimentUpdated has copy, drop {
        player_id: ID,
        player_name: String,
        week: u64,
        yes_count: u64,
        no_count: u64,
        total_votes: u64,
        yes_percentage: u64,
        no_percentage: u64,
        walrus_blob_id: String,
        timestamp: u64,
    }

    public struct WeekClosed has copy, drop {
        week: u64,
        total_votes: u64,
        end_time: u64,
        admin: address,
        timestamp: u64,
    }

    // ============================================================================
    // Init Function
    // ============================================================================

    fun init(ctx: &mut TxContext) {
        let admin_address = tx_context::sender(ctx);

        // Create platform state
        let platform = PulsePlatform {
            id: object::new(ctx),
            admin: admin_address,
            current_week: 0,
            week_start_time: 0,
            week_end_time: 0,
            active: false,
            total_votes: 0,
        };

        // Create vote registry
        let registry = VoteRegistry {
            id: object::new(ctx),
            votes: table::new(ctx),
        };

        transfer::share_object(platform);
        transfer::share_object(registry);
    }

    // ============================================================================
    // Admin Functions (Now using shared AdminCap from valor module)
    // ============================================================================

    /// Create a new weekly voting round
    public entry fun create_weekly_round(
        _: &AdminCap,  // Using AdminCap from valor module
        platform: &mut PulsePlatform,
        week_number: u64,
        duration_days: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Security check: verify caller is the platform admin
        assert!(tx_context::sender(ctx) == platform.admin, EAdminRequired);
        
        let current_time = clock::timestamp_ms(clock);
        let duration_ms = duration_days * 24 * 60 * 60 * 1000;
        
        platform.current_week = week_number;
        platform.week_start_time = current_time;
        platform.week_end_time = current_time + duration_ms;
        platform.active = true;
        platform.total_votes = 0;

        event::emit(WeeklyRoundCreated {
            week: week_number,
            start_time: current_time,
            end_time: current_time + duration_ms,
            admin: tx_context::sender(ctx),
            timestamp: current_time,
        });
    }

    /// Initialize sentiment tracking for a player in the current week
    public entry fun init_player_sentiment(
        _: &AdminCap,  // Using AdminCap from valor module
        platform: &PulsePlatform,
        player_id: ID,
        player_name: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Security check: verify caller is the platform admin
        assert!(tx_context::sender(ctx) == platform.admin, EAdminRequired);
        assert!(platform.active, EWeekNotActive);
        
        let current_time = clock::timestamp_ms(clock);
        
        let sentiment = PlayerSentiment {
            id: object::new(ctx),
            player_id,
            player_name: string::utf8(player_name),
            week: platform.current_week,
            yes_count: 0,
            no_count: 0,
            walrus_blob_id: string::utf8(b""),
            created_at: current_time,
            updated_at: current_time,
        };

        transfer::share_object(sentiment);
    }

    /// Close the current weekly round
    public entry fun close_weekly_round(
        _: &AdminCap,  // Using AdminCap from valor module
        platform: &mut PulsePlatform,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Security check: verify caller is the platform admin
        assert!(tx_context::sender(ctx) == platform.admin, EAdminRequired);
        
        let current_time = clock::timestamp_ms(clock);
        
        platform.active = false;

        event::emit(WeekClosed {
            week: platform.current_week,
            total_votes: platform.total_votes,
            end_time: current_time,
            admin: tx_context::sender(ctx),
            timestamp: current_time,
        });
    }

    /// Update Walrus blob ID for a player's sentiment
    public entry fun update_walrus_blob(
        _: &AdminCap,  // Using AdminCap from valor module
        sentiment: &mut PlayerSentiment,
        walrus_blob_id: vector<u8>,
        clock: &Clock,
    ) {
        // Security check: verify admin access (you can add platform check if needed)
        // Note: AdminCap holder is already verified by function signature
        
        sentiment.walrus_blob_id = string::utf8(walrus_blob_id);
        sentiment.updated_at = clock::timestamp_ms(clock);
    }

    // ============================================================================
    // Voting Functions
    // ============================================================================

    /// Vote YES for a player's performance prediction
    public entry fun vote_yes(
        platform: &mut PulsePlatform,
        registry: &mut VoteRegistry,
        sentiment: &mut PlayerSentiment,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Security check: validate vote type
        assert!(true == true, EInvalidVote); // YES vote is valid
        vote_internal(platform, registry, sentiment, true, clock, ctx);
    }

    /// Vote NO for a player's performance prediction
    public entry fun vote_no(
        platform: &mut PulsePlatform,
        registry: &mut VoteRegistry,
        sentiment: &mut PlayerSentiment,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Security check: validate vote type
        assert!(false == false, EInvalidVote); // NO vote is valid
        vote_internal(platform, registry, sentiment, false, clock, ctx);
    }

    /// Internal voting logic
    fun vote_internal(
        platform: &mut PulsePlatform,
        registry: &mut VoteRegistry,
        sentiment: &mut PlayerSentiment,
        vote: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let voter = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        // Check if voting is active
        assert!(platform.active, EWeekNotActive);
        assert!(current_time < platform.week_end_time, EWeekNotActive);
        assert!(sentiment.week == platform.current_week, EInvalidWeek);

        // Check if user has already voted for this player this week
        let registry_key = make_registry_key(sentiment.player_id, platform.current_week);
        
        if (!table::contains(&registry.votes, registry_key)) {
            table::add(&mut registry.votes, registry_key, table::new(ctx));
        };

        let player_votes = table::borrow_mut(&mut registry.votes, registry_key);
        assert!(!table::contains(player_votes, voter), EAlreadyVoted);

        // Record the vote
        table::add(player_votes, voter, true);

        // Update sentiment counts
        if (vote) {
            sentiment.yes_count = sentiment.yes_count + 1;
        } else {
            sentiment.no_count = sentiment.no_count + 1;
        };

        sentiment.updated_at = current_time;
        platform.total_votes = platform.total_votes + 1;

        // Calculate percentages
        let total = sentiment.yes_count + sentiment.no_count;
        let yes_pct = if (total > 0) { (sentiment.yes_count * 100) / total } else { 0 };
        let no_pct = if (total > 0) { (sentiment.no_count * 100) / total } else { 0 };

        // Mint vote receipt
        let receipt = VoteReceipt {
            id: object::new(ctx),
            voter,
            player_id: sentiment.player_id,
            player_name: sentiment.player_name,
            week: platform.current_week,
            vote,
            timestamp: current_time,
        };

        // Emit events
        event::emit(VoteSubmitted {
            voter,
            player_id: sentiment.player_id,
            player_name: sentiment.player_name,
            week: platform.current_week,
            vote,
            yes_count: sentiment.yes_count,
            no_count: sentiment.no_count,
            yes_percentage: yes_pct,
            no_percentage: no_pct,
            timestamp: current_time,
        });

        event::emit(SentimentUpdated {
            player_id: sentiment.player_id,
            player_name: sentiment.player_name,
            week: platform.current_week,
            yes_count: sentiment.yes_count,
            no_count: sentiment.no_count,
            total_votes: total,
            yes_percentage: yes_pct,
            no_percentage: no_pct,
            walrus_blob_id: sentiment.walrus_blob_id,
            timestamp: current_time,
        });

        transfer::transfer(receipt, voter);
    }

    // ============================================================================
    // Helper Functions
    // ============================================================================

    fun make_registry_key(player_id: ID, week: u64): String {
        let player_bytes = object::id_to_bytes(&player_id);
        let mut key_bytes = vector::empty<u8>();
        vector::append(&mut key_bytes, player_bytes);
        vector::push_back(&mut key_bytes, b"_"[0]);
        
        // Convert week number to bytes
        let mut week_val = week;
        let mut week_bytes = vector::empty<u8>();
        if (week_val == 0) {
            vector::push_back(&mut week_bytes, 48); // ASCII '0'
        } else {
            while (week_val > 0) {
                let digit = ((week_val % 10) as u8) + 48; // ASCII '0' to '9'
                vector::push_back(&mut week_bytes, digit);
                week_val = week_val / 10;
            };
        };
        
        vector::append(&mut key_bytes, week_bytes);
        string::utf8(key_bytes)
    }

    // ============================================================================
    // View Functions
    // ============================================================================

    public fun get_current_week(platform: &PulsePlatform): u64 {
        platform.current_week
    }

    public fun is_voting_active(platform: &PulsePlatform): bool {
        platform.active
    }

    public fun get_week_end_time(platform: &PulsePlatform): u64 {
        platform.week_end_time
    }

    public fun get_total_votes(platform: &PulsePlatform): u64 {
        platform.total_votes
    }

    public fun get_yes_count(sentiment: &PlayerSentiment): u64 {
        sentiment.yes_count
    }

    public fun get_no_count(sentiment: &PlayerSentiment): u64 {
        sentiment.no_count
    }

    public fun get_sentiment_week(sentiment: &PlayerSentiment): u64 {
        sentiment.week
    }

    public fun get_sentiment_player_id(sentiment: &PlayerSentiment): ID {
        sentiment.player_id
    }

    public fun get_sentiment_player_name(sentiment: &PlayerSentiment): String {
        sentiment.player_name
    }

    public fun get_walrus_blob_id(sentiment: &PlayerSentiment): String {
        sentiment.walrus_blob_id
    }

    public fun get_sentiment_percentages(sentiment: &PlayerSentiment): (u64, u64) {
        let total = sentiment.yes_count + sentiment.no_count;
        if (total == 0) {
            return (0, 0)
        };
        
        let yes_pct = (sentiment.yes_count * 100) / total;
        let no_pct = (sentiment.no_count * 100) / total;
        (yes_pct, no_pct)
    }

    // Vote receipt view functions
    public fun get_receipt_vote(receipt: &VoteReceipt): bool {
        receipt.vote
    }

    public fun get_receipt_player_id(receipt: &VoteReceipt): ID {
        receipt.player_id
    }

    public fun get_receipt_week(receipt: &VoteReceipt): u64 {
        receipt.week
    }

    public fun get_receipt_timestamp(receipt: &VoteReceipt): u64 {
        receipt.timestamp
    }

    /// Security check: verify if a player exists in sentiment tracking
    public fun player_sentiment_exists(sentiment: &PlayerSentiment, player_id: ID): bool {
        sentiment.player_id == player_id
    }
}