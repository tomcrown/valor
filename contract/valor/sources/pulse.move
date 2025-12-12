
#[allow(lint(public_entry))]
module valor::pulse {
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};

    
    const EAlreadyVoted: u64 = 1;
    const EInvalidWeek: u64 = 2;
    const EWeekNotActive: u64 = 3;

    public struct PulseAdminCap has key, store {
        id: UID,
    }

    public struct PulsePlatform has key {
        id: UID,
        admin: address,
        current_week: u64,
        week_start_time: u64,
        week_end_time: u64,
        active: bool,
        total_votes: u64,
    }

    public struct PlayerSentiment has key {
        id: UID,
        player_id: ID,
        player_name: String,
        week: u64,
        yes_count: u64,
        no_count: u64,
        walrus_blob_id: String,
        created_at: u64,
        updated_at: u64,
    }

    public struct VoteReceipt has key {
        id: UID,
        voter: address,
        player_id: ID,
        player_name: String,
        week: u64,
        vote: bool,
        timestamp: u64,
    }

    public struct VoteRegistry has key {
        id: UID,
         votes: Table<ID, Table<u64, Table<address, bool>>>,
    }

    public struct WeeklyRoundCreated has copy, drop {
        week: u64,
        start_time: u64,
        end_time: u64,
        admin: address,
        timestamp: u64,
    }

    public struct SentimentCreated has copy, drop {
        sentiment_id: ID,        
        player_id: ID,
        player_name: String,
        week: u64,
        timestamp: u64,
    }

    public struct VoteSubmitted has copy, drop {
        sentiment_id: ID,        
        voter: address,
        player_id: ID,
        player_name: String,
        week: u64,
        vote: bool,
        yes_count: u64,
        no_count: u64,
        yes_percentage: u64,
        no_percentage: u64,
        timestamp: u64,
    }

    public struct SentimentUpdated has copy, drop {
        sentiment_id: ID,        
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

    fun init(ctx: &mut TxContext) {
        let admin_address = tx_context::sender(ctx);
        
        let admin_cap = PulseAdminCap {
            id: object::new(ctx),
        };

        let platform = PulsePlatform {
            id: object::new(ctx),
            admin: admin_address,
            current_week: 0,
            week_start_time: 0,
            week_end_time: 0,
            active: false,
            total_votes: 0,
        };

        let registry = VoteRegistry {
            id: object::new(ctx),
            votes: table::new(ctx),
        };

        transfer::transfer(admin_cap, admin_address);
        transfer::share_object(platform);
        transfer::share_object(registry);
    }


    public entry fun create_weekly_round(
        _: &PulseAdminCap,
        platform: &mut PulsePlatform,
        week_number: u64,
        duration_days: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
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

    public entry fun init_player_sentiment(
        _: &PulseAdminCap,
        platform: &PulsePlatform,
        player_id: ID,
        player_name: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(platform.active, EWeekNotActive);
        
        let current_time = clock::timestamp_ms(clock);
        let player_name_str = string::utf8(player_name);
        
        let sentiment = PlayerSentiment {
            id: object::new(ctx),
            player_id,
            player_name: player_name_str,
            week: platform.current_week,
            yes_count: 0,
            no_count: 0,
            walrus_blob_id: string::utf8(b""),
            created_at: current_time,
            updated_at: current_time,
        };

        let sentiment_id = object::id(&sentiment);

        event::emit(SentimentCreated {
            sentiment_id,
            player_id,
            player_name: player_name_str,
            week: platform.current_week,
            timestamp: current_time,
        });

        transfer::share_object(sentiment);
    }

    public entry fun close_weekly_round(
        _: &PulseAdminCap,
        platform: &mut PulsePlatform,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
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

    public entry fun update_walrus_blob(
        _: &PulseAdminCap,
        sentiment: &mut PlayerSentiment,
        walrus_blob_id: vector<u8>,
        clock: &Clock,
    ) {
        sentiment.walrus_blob_id = string::utf8(walrus_blob_id);
        sentiment.updated_at = clock::timestamp_ms(clock);
    }

    public entry fun vote_yes(
        platform: &mut PulsePlatform,
        registry: &mut VoteRegistry,
        sentiment: &mut PlayerSentiment,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        vote_internal(platform, registry, sentiment, true, clock, ctx);
    }

    public entry fun vote_no(
        platform: &mut PulsePlatform,
        registry: &mut VoteRegistry,
        sentiment: &mut PlayerSentiment,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        vote_internal(platform, registry, sentiment, false, clock, ctx);
    }

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
        let sentiment_id = object::id(sentiment);

        assert!(platform.active, EWeekNotActive);
        assert!(current_time < platform.week_end_time, EWeekNotActive);
        assert!(sentiment.week == platform.current_week, EInvalidWeek);

        let player_id = sentiment.player_id;
        let week = platform.current_week;

        if (!table::contains(&registry.votes, player_id)) {
            table::add(&mut registry.votes, player_id, table::new(ctx));
        };

        let player_table = table::borrow_mut(&mut registry.votes, player_id);

        if (!table::contains(player_table, week)) {
            table::add(player_table, week, table::new(ctx));
        };

        let week_table = table::borrow_mut(player_table, week);

        assert!(!table::contains(week_table, voter), EAlreadyVoted);

        table::add(week_table, voter, true);

        if (vote) {
            sentiment.yes_count = sentiment.yes_count + 1;
        } else {
            sentiment.no_count = sentiment.no_count + 1;
        };

        sentiment.updated_at = current_time;
        platform.total_votes = platform.total_votes + 1;

        let total = sentiment.yes_count + sentiment.no_count;
        let yes_pct = if (total > 0) { (sentiment.yes_count * 100) / total } else { 0 };
        let no_pct = if (total > 0) { (sentiment.no_count * 100) / total } else { 0 };

        let receipt = VoteReceipt {
            id: object::new(ctx),
            voter,
            player_id: sentiment.player_id,
            player_name: sentiment.player_name,
            week: platform.current_week,
            vote,
            timestamp: current_time,
        };

        event::emit(VoteSubmitted {
            sentiment_id,
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
            sentiment_id,
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

    fun make_registry_key(player_id: ID, week: u64): String {
        let player_bytes = object::id_to_bytes(&player_id);
        let mut key_bytes = vector::empty<u8>();
        vector::append(&mut key_bytes, player_bytes);
        vector::push_back(&mut key_bytes, b"_"[0]);
        
        let mut week_val = week;
        let mut week_bytes = vector::empty<u8>();
        if (week_val == 0) {
            vector::push_back(&mut week_bytes, 48);
        } else {
            while (week_val > 0) {
                let digit = ((week_val % 10) as u8) + 48;
                vector::push_back(&mut week_bytes, digit);
                week_val = week_val / 10;
            };
        };
        
        vector::append(&mut key_bytes, week_bytes);
        string::utf8(key_bytes)
    }


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
}