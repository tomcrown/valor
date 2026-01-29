#[allow(lint(public_entry))]
module valor::pulse_points {
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};

    // Error codes
    const EInsufficientPoints: u64 = 1;
    const EInvalidAmount: u64 = 2;
    const EUnauthorized: u64 = 3;

    // Point rewards
    const VOTE_POINTS: u64 = 1;
    const CORRECT_PREDICTION_POINTS: u64 = 5;
    const NFT_SHARE_POINTS: u64 = 3;
    const AI_UNLOCK_THRESHOLD: u64 = 10;

    // Admin capability
    public struct PointsAdminCap has key, store {
        id: UID,
    }

    // Main points platform
    public struct PointsPlatform has key {
        id: UID,
        admin: address,
        total_points_minted: u64,
        total_users: u64,
        user_points: Table<address, u64>,
        active: bool,
    }

    // User's point balance NFT (transferable)
    public struct PointsBalance has key, store {
        id: UID,
        owner: address,
        points: u64,
        lifetime_points: u64,
        votes_count: u64,
        correct_predictions: u64,
        nft_shares_owned: u64,
        last_updated: u64,
    }

    // Events
    public struct PointsMinted has copy, drop {
        user: address,
        amount: u64,
        reason: String,
        new_balance: u64,
        timestamp: u64,
    }

    public struct PointsSpent has copy, drop {
        user: address,
        amount: u64,
        purpose: String,
        remaining_balance: u64,
        timestamp: u64,
    }

    public struct AchievementUnlocked has copy, drop {
        user: address,
        achievement: String,
        bonus_points: u64,
        timestamp: u64,
    }

    fun init(ctx: &mut TxContext) {
        let admin_address = tx_context::sender(ctx);
        
        let admin_cap = PointsAdminCap {
            id: object::new(ctx),
        };

        let platform = PointsPlatform {
            id: object::new(ctx),
            admin: admin_address,
            total_points_minted: 0,
            total_users: 0,
            user_points: table::new(ctx),
            active: true,
        };

        transfer::transfer(admin_cap, admin_address);
        transfer::share_object(platform);
    }

    // Mint points for voting
    public entry fun mint_vote_points(
        platform: &mut PointsPlatform,
        balance: &mut PointsBalance,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(platform.active, EUnauthorized);
        let user = tx_context::sender(ctx);
        assert!(balance.owner == user, EUnauthorized);

        mint_points_internal(
            platform,
            balance,
            VOTE_POINTS,
            b"Vote Submission",
            clock,
            ctx
        );

        balance.votes_count = balance.votes_count + 1;

        // Achievement: First vote
        if (balance.votes_count == 1) {
            emit_achievement(user, b"First Vote!", 2, clock);
        };

        // Achievement: 10 votes
        if (balance.votes_count == 10) {
            emit_achievement(user, b"Active Voter", 5, clock);
            mint_points_internal(platform, balance, 5, b"Achievement Bonus", clock, ctx);
        };

        // Achievement: 100 votes
        if (balance.votes_count == 100) {
            emit_achievement(user, b"Pulse Champion", 20, clock);
            mint_points_internal(platform, balance, 20, b"Achievement Bonus", clock, ctx);
        };
    }

    // Mint points for correct prediction
    public entry fun mint_prediction_points(
        _: &PointsAdminCap,
        platform: &mut PointsPlatform,
        balance: &mut PointsBalance,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(platform.active, EUnauthorized);
        let user = tx_context::sender(ctx);
        assert!(balance.owner == user, EUnauthorized);

        mint_points_internal(
            platform,
            balance,
            CORRECT_PREDICTION_POINTS,
            b"Correct Prediction",
            clock,
            ctx
        );

        balance.correct_predictions = balance.correct_predictions + 1;

        // Achievement: First correct prediction
        if (balance.correct_predictions == 1) {
            emit_achievement(user, b"Oracle Awakened", 3, clock);
        };

        // Achievement: 10 correct predictions
        if (balance.correct_predictions == 10) {
            emit_achievement(user, b"Prediction Master", 10, clock);
            mint_points_internal(platform, balance, 10, b"Achievement Bonus", clock, ctx);
        };
    }

    // Mint points for NFT ownership (called when user buys shares)
    public entry fun mint_nft_points(
        platform: &mut PointsPlatform,
        balance: &mut PointsBalance,
        shares_amount: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(platform.active, EUnauthorized);
        assert!(shares_amount > 0, EInvalidAmount);
        let user = tx_context::sender(ctx);
        assert!(balance.owner == user, EUnauthorized);

        let points_to_mint = shares_amount * NFT_SHARE_POINTS;

        mint_points_internal(
            platform,
            balance,
            points_to_mint,
            b"NFT Share Purchase",
            clock,
            ctx
        );

        balance.nft_shares_owned = balance.nft_shares_owned + shares_amount;

        // Achievement: First NFT
        if (balance.nft_shares_owned == shares_amount) {
            emit_achievement(user, b"First Investment", 5, clock);
        };

        // Achievement: 10 NFTs
        if (balance.nft_shares_owned >= 10 && balance.nft_shares_owned - shares_amount < 10) {
            emit_achievement(user, b"Collector", 15, clock);
            mint_points_internal(platform, balance, 15, b"Achievement Bonus", clock, ctx);
        };
    }

    // Spend points to unlock AI insights
    public entry fun spend_points_for_ai(
        platform: &mut PointsPlatform,
        balance: &mut PointsBalance,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(platform.active, EUnauthorized);
        let user = tx_context::sender(ctx);
        assert!(balance.owner == user, EUnauthorized);
        assert!(balance.points >= AI_UNLOCK_THRESHOLD, EInsufficientPoints);

        balance.points = balance.points - AI_UNLOCK_THRESHOLD;
        balance.last_updated = clock::timestamp_ms(clock);

        // Update platform table
        if (table::contains(&platform.user_points, user)) {
            let user_total = table::borrow_mut(&mut platform.user_points, user);
            *user_total = balance.points;
        };

        event::emit(PointsSpent {
            user,
            amount: AI_UNLOCK_THRESHOLD,
            purpose: string::utf8(b"AI Insight Unlock"),
            remaining_balance: balance.points,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // Initialize points balance for new user
    public entry fun initialize_balance(
        platform: &mut PointsPlatform,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let user = tx_context::sender(ctx);
        
        // Check if user already has balance in platform
        if (!table::contains(&platform.user_points, user)) {
            table::add(&mut platform.user_points, user, 0);
            platform.total_users = platform.total_users + 1;
        };

        let balance = PointsBalance {
            id: object::new(ctx),
            owner: user,
            points: 0,
            lifetime_points: 0,
            votes_count: 0,
            correct_predictions: 0,
            nft_shares_owned: 0,
            last_updated: clock::timestamp_ms(clock),
        };

        transfer::transfer(balance, user);
    }

    // Internal function to mint points
    fun mint_points_internal(
        platform: &mut PointsPlatform,
        balance: &mut PointsBalance,
        amount: u64,
        reason: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        balance.points = balance.points + amount;
        balance.lifetime_points = balance.lifetime_points + amount;
        balance.last_updated = clock::timestamp_ms(clock);

        platform.total_points_minted = platform.total_points_minted + amount;

        let user = tx_context::sender(ctx);

        // Update platform table
        if (table::contains(&platform.user_points, user)) {
            let user_total = table::borrow_mut(&mut platform.user_points, user);
            *user_total = balance.points;
        } else {
            table::add(&mut platform.user_points, user, balance.points);
        };

        event::emit(PointsMinted {
            user,
            amount,
            reason: string::utf8(reason),
            new_balance: balance.points,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    fun emit_achievement(
        user: address,
        achievement: vector<u8>,
        bonus: u64,
        clock: &Clock
    ) {
        event::emit(AchievementUnlocked {
            user,
            achievement: string::utf8(achievement),
            bonus_points: bonus,
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // Admin functions
    public entry fun set_active(
        _: &PointsAdminCap,
        platform: &mut PointsPlatform,
        active: bool,
        _ctx: &mut TxContext
    ) {
        platform.active = active;
    }

    // View functions
    public fun get_user_points(balance: &PointsBalance): u64 {
        balance.points
    }

    public fun get_lifetime_points(balance: &PointsBalance): u64 {
        balance.lifetime_points
    }

    public fun get_votes_count(balance: &PointsBalance): u64 {
        balance.votes_count
    }

    public fun get_correct_predictions(balance: &PointsBalance): u64 {
        balance.correct_predictions
    }

    public fun get_nft_shares_owned(balance: &PointsBalance): u64 {
        balance.nft_shares_owned
    }

    public fun can_unlock_ai(balance: &PointsBalance): bool {
        balance.points >= AI_UNLOCK_THRESHOLD
    }

    public fun get_total_points_minted(platform: &PointsPlatform): u64 {
        platform.total_points_minted
    }

    public fun get_total_users(platform: &PointsPlatform): u64 {
        platform.total_users
    }

    public fun get_ai_unlock_threshold(): u64 {
        AI_UNLOCK_THRESHOLD
    }
}
