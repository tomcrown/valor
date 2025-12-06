#[allow(lint(public_entry), unused_const)]
module valor::valor {

    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};

    //Error codes

    const EInvalidPrice: u64 = 1;
    const EInsufficientShares: u64 = 2;
    const EUnauthorized: u64 = 3;
    const EPlayerNotFound: u64 = 4;
    const EInvalidPerformanceScore: u64 = 5;
    const EInvalidShareAmount: u64 = 6;
    const ETooSoon: u64 = 7;
    const EInvalidBlobId: u64 = 8;
    const EInsufficientPayment: u64 = 9;
    const EInsufficientLiquidity: u64 = 10;
    const EOverflow: u64 = 11;
    const EPriceSlippage: u64 = 12;
    const EInvalidCurveParameter: u64 = 13;

    //consts
    const MIN_UPDATE_INTERVAL_MS: u64 = 86400000; // 24 hours
    const MAX_PERFORMANCE_SCORE: u64 = 1000;
    const CURVE_STEEPNESS: u64 = 1000; // 10% impact per 100% of supply
    const MAX_CURVE_STEEPNESS: u64 = 5000; // Max 50%
    const BASIS_POINTS: u64 = 10000;
    const MAX_SLIPPAGE_BPS: u64 = 1000; // 10% max slippage protection
    const MIN_BASE_VALUE: u64 = 1000; // 0.000001 SUI minimum
    const MAX_BASE_VALUE: u64 = 1000000000000; // 1M SUI maximum

    public struct AdminCap has key, store {
        id: UID,
    }

    public struct Platform has key {
        id: UID,
        admin: address,
        players: Table<ID, PlayerInfo>,
        liquidity_pool: Balance<SUI>,
        total_volume: u64,
        player_count: u64,
        curve_steepness: u64,
        paused: bool,
    }

    public struct PlayerInfo has store {
        player_id: ID,
        name: String,
        team: String,
        position: String,
        base_value: u64,  
        total_shares: u64,
        circulating_shares: u64, 
        performance_history: vector<PerformanceRecord>,
        last_update_timestamp: u64,
        walrus_blob_id: String,
        active: bool,
    }

    public struct PerformanceRecord has store, copy, drop {
        timestamp: u64,
        score: u64,
        goals: u64,
        assists: u64,
        rating: u64,
        walrus_blob_id: String,
    }

    public struct PlayerShares has key, store {
        id: UID,
        player_id: ID,
        player_name: String,
        shares: u64,
        purchase_price: u64,  
    }

    public struct UpdateCapability has key, store {
        id: UID,
        player_id: ID,
        player_name: String,
    }


    public struct PlayerRegistered has copy, drop {
        player_id: ID,
        name: String,
        team: String,
        position: String,
        base_value: u64,
        total_shares: u64,
    }

    public struct SharesPurchased has copy, drop {
        buyer: address,
        player_id: ID,
        player_name: String,
        shares: u64,
        base_value: u64,
        market_price: u64,
        total_paid: u64,
        new_circulating: u64,
        timestamp: u64,
    }

    public struct SharesSold has copy, drop {
        seller: address,
        player_id: ID,
        player_name: String,
        shares: u64,
        base_value: u64,
        market_price: u64,
        total_received: u64,
        profit_loss: u64,
        new_circulating: u64,
        timestamp: u64,
    }

    public struct BaseValueUpdated has copy, drop {
        player_id: ID,
        player_name: String,
        old_base_value: u64,
        new_base_value: u64,
        old_market_price: u64,
        new_market_price: u64,
        change_percent: u64,
        performance_score: u64,
        goals: u64,
        assists: u64,
        rating: u64,
        walrus_blob_id: String,
        timestamp: u64,
    }

    public struct SharesTransferred has copy, drop {
        from: address,
        to: address,
        player_id: ID,
        shares: u64,
    }

    public struct PlatformPaused has copy, drop {
        paused: bool,
        admin: address,
    }

    public struct LiquidityAdded has copy, drop {
        amount: u64,
        new_total: u64,
    }

    public struct CurveParameterUpdated has copy, drop {
        old_steepness: u64,
        new_steepness: u64,
        admin: address,
    }


    fun init(ctx: &mut TxContext) {
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        let platform = Platform {
            id: object::new(ctx),
            admin: tx_context::sender(ctx),
            players: table::new(ctx),
            liquidity_pool: balance::zero(),
            total_volume: 0,
            player_count: 0,
            curve_steepness: CURVE_STEEPNESS,
            paused: false,
        };

        transfer::transfer(admin_cap, tx_context::sender(ctx));
        transfer::share_object(platform);
    }


    public fun calculate_market_price(
        base_value: u64,
        total_shares: u64,
        circulating_shares: u64,
        curve_steepness: u64
    ): u64 {
        if (total_shares == 0) return base_value;
        if (circulating_shares == 0) return base_value;
        if (circulating_shares > total_shares) return base_value; // Should never happen, but safe
        
        let utilization_bps = (circulating_shares * BASIS_POINTS) / total_shares;
        
        let premium_bps = (utilization_bps * curve_steepness) / BASIS_POINTS;
        
        // Calculate final price: base_value * (10000 + premium_bps) / 10000
        // Protected from overflow by checking if multiplication would overflow
        let multiplier = BASIS_POINTS + premium_bps;
        
        // Safe multiplication check: if base_value * multiplier would overflow
        // We use: (base_value * multiplier) / BASIS_POINTS
        // To prevent overflow: base_value must be < MAX_U64 / multiplier
        // Since multiplier <= 15000 (10000 + 5000 max premium), this is safe for reasonable base_values
        (base_value * multiplier) / BASIS_POINTS
    }


    public fun calculate_buy_cost(
        platform: &Platform,
        player: &PlayerInfo,
        shares_to_buy: u64
    ): u64 {
        // Get current market price
        let current_price = calculate_market_price(
            player.base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        );
        
        let new_circulating = player.circulating_shares + shares_to_buy;
        let future_price = calculate_market_price(
            player.base_value,
            player.total_shares,
            new_circulating,
            platform.curve_steepness
        );
        
        let avg_price = (current_price + future_price) / 2;
        avg_price * shares_to_buy
    }

    public fun calculate_sell_payout(
        platform: &Platform,
        player: &PlayerInfo,
        shares_to_sell: u64
    ): u64 {
        let current_price = calculate_market_price(
            player.base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        );
        
        let new_circulating = player.circulating_shares - shares_to_sell;
        let future_price = calculate_market_price(
            player.base_value,
            player.total_shares,
            new_circulating,
            platform.curve_steepness
        );
        
        let avg_price = (current_price + future_price) / 2;
        avg_price * shares_to_sell
    }

    public entry fun add_liquidity(
        _: &AdminCap,
        platform: &mut Platform,
        payment: Coin<SUI>,
        _ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        let liquidity = coin::into_balance(payment);
        balance::join(&mut platform.liquidity_pool, liquidity);

        event::emit(LiquidityAdded {
            amount,
            new_total: balance::value(&platform.liquidity_pool),
        });
    }

    public entry fun update_curve_steepness(
        _: &AdminCap,
        platform: &mut Platform,
        new_steepness: u64,
        ctx: &mut TxContext
    ) {
        assert!(new_steepness <= MAX_CURVE_STEEPNESS, EInvalidCurveParameter);
        
        let old_steepness = platform.curve_steepness;
        platform.curve_steepness = new_steepness;

        event::emit(CurveParameterUpdated {
            old_steepness,
            new_steepness,
            admin: tx_context::sender(ctx),
        });
    }

    public entry fun register_player(
        _: &AdminCap,
        platform: &mut Platform,
        name: vector<u8>,
        team: vector<u8>,
        position: vector<u8>,
        base_value: u64,
        total_shares: u64,
        ctx: &mut TxContext
    ) {
        assert!(base_value >= MIN_BASE_VALUE, EInvalidPrice);
        assert!(base_value <= MAX_BASE_VALUE, EInvalidPrice);
        assert!(total_shares > 0, EInvalidShareAmount);
        assert!(total_shares <= 1000000000, EInvalidShareAmount); // Max 1B shares

        let player_uid = object::new(ctx);
        let player_id = object::uid_to_inner(&player_uid);
        object::delete(player_uid);

        let player_name = string::utf8(name);

        let player_info = PlayerInfo {
            player_id,
            name: player_name,
            team: string::utf8(team),
            position: string::utf8(position),
            base_value,
            total_shares,
            circulating_shares: 0, // Start with 0 circulating
            performance_history: vector::empty(),
            last_update_timestamp: 0,
            walrus_blob_id: string::utf8(b""),
            active: true,
        };

        table::add(&mut platform.players, player_id, player_info);
        platform.player_count = platform.player_count + 1;

        let update_cap = UpdateCapability {
            id: object::new(ctx),
            player_id,
            player_name,
        };

        event::emit(PlayerRegistered {
            player_id,
            name: player_name,
            team: string::utf8(team),
            position: string::utf8(position),
            base_value,
            total_shares,
        });

        transfer::transfer(update_cap, tx_context::sender(ctx));
    }

    public entry fun set_pause(
        _: &AdminCap,
        platform: &mut Platform,
        paused: bool,
        ctx: &mut TxContext
    ) {
        platform.paused = paused;
        event::emit(PlatformPaused { paused, admin: tx_context::sender(ctx) });
    }

    public entry fun deactivate_player(
        _: &AdminCap,
        platform: &mut Platform,
        player_id: ID,
        _ctx: &mut TxContext
    ) {
        assert!(table::contains(&platform.players, player_id), EPlayerNotFound);
        let player = table::borrow_mut(&mut platform.players, player_id);
        player.active = false;
    }

    public entry fun activate_player(
        _: &AdminCap,
        platform: &mut Platform,
        player_id: ID,
        _ctx: &mut TxContext
    ) {
        assert!(table::contains(&platform.players, player_id), EPlayerNotFound);
        let player = table::borrow_mut(&mut platform.players, player_id);
        player.active = true;
    }


    public entry fun update_base_value(
        platform: &mut Platform,
        update_cap: &UpdateCapability,
        new_base_value: u64,
        performance_score: u64,
        goals: u64,
        assists: u64,
        rating: u64,
        walrus_blob_id: vector<u8>,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        assert!(!platform.paused, EUnauthorized);
        assert!(new_base_value >= MIN_BASE_VALUE, EInvalidPrice);
        assert!(new_base_value <= MAX_BASE_VALUE, EInvalidPrice);
        assert!(performance_score <= MAX_PERFORMANCE_SCORE, EInvalidPerformanceScore);
        assert!(vector::length(&walrus_blob_id) > 0, EInvalidBlobId);

        let player_id = update_cap.player_id;
        assert!(table::contains(&platform.players, player_id), EPlayerNotFound);

        let player = table::borrow_mut(&mut platform.players, player_id);
        assert!(player.active, EUnauthorized);

        let current_time = clock::timestamp_ms(clock);
        assert!(
            current_time >= player.last_update_timestamp + MIN_UPDATE_INTERVAL_MS,
            ETooSoon
        );

        let old_base_value = player.base_value;
        let old_market_price = calculate_market_price(
            old_base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        );

        // Calculate percentage change
        let change_percent = if (old_base_value > 0) {
            if (new_base_value > old_base_value) {
                ((new_base_value - old_base_value) * 100) / old_base_value
            } else {
                ((old_base_value - new_base_value) * 100) / old_base_value
            }
        } else {
            0
        };

        // Update player data
        player.base_value = new_base_value;
        player.last_update_timestamp = current_time;
        player.walrus_blob_id = string::utf8(walrus_blob_id);

        let new_market_price = calculate_market_price(
            new_base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        );

        let record = PerformanceRecord {
            timestamp: current_time,
            score: performance_score,
            goals,
            assists,
            rating,
            walrus_blob_id: string::utf8(walrus_blob_id),
        };
        vector::push_back(&mut player.performance_history, record);

        event::emit(BaseValueUpdated {
            player_id,
            player_name: player.name,
            old_base_value,
            new_base_value,
            old_market_price,
            new_market_price,
            change_percent,
            performance_score,
            goals,
            assists,
            rating,
            walrus_blob_id: string::utf8(walrus_blob_id),
            timestamp: current_time,
        });
    }

    public entry fun buy_shares(
        platform: &mut Platform,
        player_id: ID,
        shares: u64,
        max_price_per_share: u64, 
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!platform.paused, EUnauthorized);
        assert!(shares > 0, EInvalidShareAmount);
        assert!(table::contains(&platform.players, player_id), EPlayerNotFound);

        let player = table::borrow(&platform.players, player_id);
        assert!(player.active, EUnauthorized);
        
        let available = player.total_shares - player.circulating_shares;
        assert!(available >= shares, EInsufficientShares);

        let total_cost = calculate_buy_cost(platform, player, shares);

        let player = table::borrow_mut(&mut platform.players, player_id);
        let avg_price = total_cost / shares;

        // Slippage protection
        assert!(avg_price <= max_price_per_share, EPriceSlippage);
        assert!(coin::value(&payment) >= total_cost, EInsufficientPayment);

        // Get market price before trade for event
        let market_price_before = calculate_market_price(
            player.base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        );

        player.circulating_shares = player.circulating_shares + shares;

        let mut payment_balance = coin::into_balance(payment);
        let cost_balance = balance::split(&mut payment_balance, total_cost);
        balance::join(&mut platform.liquidity_pool, cost_balance);

        if (balance::value(&payment_balance) > 0) {
            let return_coin = coin::from_balance(payment_balance, ctx);
            transfer::public_transfer(return_coin, tx_context::sender(ctx));
        } else {
            balance::destroy_zero(payment_balance);
        };

        let player_shares = PlayerShares {
            id: object::new(ctx),
            player_id,
            player_name: player.name,
            shares,
            purchase_price: avg_price,
        };

        platform.total_volume = platform.total_volume + total_cost;

        event::emit(SharesPurchased {
            buyer: tx_context::sender(ctx),
            player_id,
            player_name: player.name,
            shares,
            base_value: player.base_value,
            market_price: market_price_before,
            total_paid: total_cost,
            new_circulating: player.circulating_shares,
            timestamp: clock::timestamp_ms(clock),
        });

        transfer::transfer(player_shares, tx_context::sender(ctx));
    }

    public entry fun sell_shares(
        platform: &mut Platform,
        shares_obj: PlayerShares,
        shares_to_sell: u64,
        min_price_per_share: u64, 
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!platform.paused, EUnauthorized);

        let PlayerShares { id, player_id, player_name, shares, purchase_price } = shares_obj;

        assert!(shares >= shares_to_sell, EInsufficientShares);
        assert!(shares_to_sell > 0, EInvalidShareAmount);
        assert!(table::contains(&platform.players, player_id), EPlayerNotFound);

        let player = table::borrow(&platform.players, player_id);

        let total_payout = calculate_sell_payout(platform, player, shares_to_sell);
        
        let player = table::borrow_mut(&mut platform.players, player_id);
        let avg_price = total_payout / shares_to_sell;

        assert!(avg_price >= min_price_per_share, EPriceSlippage);
        assert!(balance::value(&platform.liquidity_pool) >= total_payout, EInsufficientLiquidity);

        let market_price_before = calculate_market_price(
            player.base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        );

        player.circulating_shares = player.circulating_shares - shares_to_sell;

        let payout_balance = balance::split(&mut platform.liquidity_pool, total_payout);
        let payout_coin = coin::from_balance(payout_balance, ctx);
        transfer::public_transfer(payout_coin, tx_context::sender(ctx));

        let cost_basis = purchase_price * shares_to_sell;
        let profit_loss = if (total_payout > cost_basis) {
            total_payout - cost_basis
        } else {
            cost_basis - total_payout
        };

        platform.total_volume = platform.total_volume + total_payout;

        event::emit(SharesSold {
            seller: tx_context::sender(ctx),
            player_id,
            player_name,
            shares: shares_to_sell,
            base_value: player.base_value,
            market_price: market_price_before,
            total_received: total_payout,
            profit_loss,
            new_circulating: player.circulating_shares,
            timestamp: clock::timestamp_ms(clock),
        });

        let remaining = shares - shares_to_sell;
        if (remaining > 0) {
            let new_id = object::new(ctx);
            let remaining_shares = PlayerShares {
                id: new_id,
                player_id,
                player_name,
                shares: remaining,
                purchase_price,
            };
            object::delete(id);
            transfer::transfer(remaining_shares, tx_context::sender(ctx));
        } else {
            object::delete(id);
        };
    }

    public entry fun transfer_shares(
        shares_obj: PlayerShares,
        recipient: address,
        ctx: &mut TxContext
    ) {
        event::emit(SharesTransferred {
            from: tx_context::sender(ctx),
            to: recipient,
            player_id: shares_obj.player_id,
            shares: shares_obj.shares,
        });

        transfer::public_transfer(shares_obj, recipient);
    }

    public entry fun merge_shares(
        shares1: &mut PlayerShares,
        shares2: PlayerShares,
    ) {
        let PlayerShares { id, player_id, player_name: _, shares, purchase_price } = shares2;
        assert!(shares1.player_id == player_id, EPlayerNotFound);

        let total_shares = shares1.shares + shares;
        let total_cost = (shares1.shares * shares1.purchase_price) + (shares * purchase_price);
        shares1.purchase_price = total_cost / total_shares;
        shares1.shares = total_shares;

        object::delete(id);
    }

    public entry fun split_shares(
        shares_obj: &mut PlayerShares,
        split_amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(shares_obj.shares > split_amount, EInsufficientShares);
        assert!(split_amount > 0, EInvalidShareAmount);

        shares_obj.shares = shares_obj.shares - split_amount;

        let new_shares = PlayerShares {
            id: object::new(ctx),
            player_id: shares_obj.player_id,
            player_name: shares_obj.player_name,
            shares: split_amount,
            purchase_price: shares_obj.purchase_price,
        };

        transfer::transfer(new_shares, tx_context::sender(ctx));
    }

    public fun get_market_price(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        calculate_market_price(
            player.base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        )
    }

    public fun get_base_value(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.base_value
    }

    public fun get_valuation_gap(platform: &Platform, player_id: ID): (u64, bool) {
        let player = table::borrow(&platform.players, player_id);
        let market_price = calculate_market_price(
            player.base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        );
        
        if (market_price > player.base_value) {
            // Overvalued: return premium percentage and false
            let premium = ((market_price - player.base_value) * 100) / player.base_value;
            (premium, false)
        } else if (player.base_value > market_price) {
            // Undervalued: return discount percentage and true
            let discount = ((player.base_value - market_price) * 100) / player.base_value;
            (discount, true)
        } else {
            // Fairly valued
            (0, true)
        }
    }

    public fun get_player_name(platform: &Platform, player_id: ID): String {
        let player = table::borrow(&platform.players, player_id);
        player.name
    }

    public fun get_circulating_shares(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.circulating_shares
    }

    public fun get_total_shares(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.total_shares
    }

    public fun get_available_shares(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.total_shares - player.circulating_shares
    }

    public fun get_total_volume(platform: &Platform): u64 {
        platform.total_volume
    }

    public fun get_player_count(platform: &Platform): u64 {
        platform.player_count
    }

    public fun is_paused(platform: &Platform): bool {
        platform.paused
    }

    public fun is_player_active(platform: &Platform, player_id: ID): bool {
        let player = table::borrow(&platform.players, player_id);
        player.active
    }

    public fun get_liquidity_balance(platform: &Platform): u64 {
        balance::value(&platform.liquidity_pool)
    }

    public fun get_last_update_time(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.last_update_timestamp
    }

    public fun get_walrus_blob_id(platform: &Platform, player_id: ID): String {
        let player = table::borrow(&platform.players, player_id);
        player.walrus_blob_id
    }

    public fun get_curve_steepness(platform: &Platform): u64 {
        platform.curve_steepness
    }

    public fun get_share_count(shares: &PlayerShares): u64 {
        shares.shares
    }

    public fun get_share_player_id(shares: &PlayerShares): ID {
        shares.player_id
    }

    public fun get_share_purchase_price(shares: &PlayerShares): u64 {
        shares.purchase_price
    }

    public fun get_share_player_name(shares: &PlayerShares): String {
        shares.player_name
    }


    public entry fun transfer_update_capability(
        cap: UpdateCapability,
        recipient: address,
    ) {
        transfer::public_transfer(cap, recipient);
    }

    public entry fun burn_update_capability(cap: UpdateCapability) {
        let UpdateCapability { id, player_id: _, player_name: _ } = cap;
        object::delete(id);
    }

    public fun get_cap_player_id(cap: &UpdateCapability): ID {
        cap.player_id
    }
}