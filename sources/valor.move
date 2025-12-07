#[allow(lint(public_entry), unused_const)]
module valor::valor {

    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use sui::event;
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};
    use sui::hash;
    use sui::bcs;

    ///Error Codes
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
    const EPriceSlippage: u64 = 12;
    const EInvalidCurveParameter: u64 = 13;
    const ECircuitBreakerTriggered: u64 = 14;
    const ETooManyHistoryRecords: u64 = 20;
    const EMaxPurchaseExceeded: u64 = 22;
    const EBlobAlreadyUsed: u64 = 24;
    const EInvalidDataHash: u64 = 25;
    const EPlayerAlreadyExists: u64 = 26;const MIN_UPDATE_INTERVAL_MS: u64 = 604800000; // 7 days (weekly updates)
    const MAX_PERFORMANCE_SCORE: u64 = 1000; // 0-1000 scale for AI scoring
    const CURVE_STEEPNESS: u64 = 1000; // 10% premium at 100% utilization
    const MAX_CURVE_STEEPNESS: u64 = 5000; // Max 50% premium
    const BASIS_POINTS: u64 = 10000; // For percentage calculations
    const MAX_SLIPPAGE_BPS: u64 = 1000; // 10% max slippage
    const MIN_BASE_VALUE: u64 = 1000000; // 0.001 SUI minimum
    const MAX_BASE_VALUE: u64 = 1000000000000; // 1M SUI maximum
    const MAX_HISTORY_RECORDS: u64 = 104; // 2 years of weekly data
    const CIRCUIT_BREAKER_THRESHOLD_BPS: u64 = 5000; // 50% change triggers halt
    const CIRCUIT_BREAKER_COOLDOWN_MS: u64 = 3600000; // 1 hour cooldown
    const MAX_PURCHASE_PERCENT: u64 = 2000; // Max 20% of total supply per tx
    
    public struct AdminCap has key, store {
        id: UID,
    }

    public struct Platform has key {
        id: UID,
        admin: address,
        players: Table<ID, PlayerInfo>,
        player_names: Table<String, ID>, 
        liquidity_pool: Balance<SUI>, 
        total_volume: u64,
        player_count: u64,
        curve_steepness: u64,
        paused: bool,
        circuit_breaker_active: bool,
        circuit_breaker_until: u64,
        used_blob_ids: VecSet<String>, 
        version: u64, 
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
        lifetime_volume: u64,
        all_time_high: u64,
        all_time_low: u64,
    }

    
    public struct PerformanceRecord has store, copy, drop {
        timestamp: u64,
        score: u64,
        goals: u64,           
        assists: u64,         
        rating: u64,          
        minutes_played: u64,  
        clean_sheets: u64,    
        walrus_blob_id: String,
        data_hash: vector<u8>,
    }

    
    public struct PlayerShares has key, store {
        id: UID,
        player_id: ID,
        player_name: String,
        shares: u64,
        purchase_price: u64,  
        purchase_timestamp: u64,
    }
    
    public struct UpdateCapability has key, store {
        id: UID,
        player_id: ID,
        player_name: String,
    }

    //EVents
    public struct PlayerRegistered has copy, drop {
        player_id: ID,
        name: String,
        team: String,
        position: String,
        base_value: u64,
        total_shares: u64,
        timestamp: u64,
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
        data_hash: vector<u8>,
        timestamp: u64,
    }

    public struct SharesTransferred has copy, drop {
        from: address,
        to: address,
        player_id: ID,
        shares: u64,
        timestamp: u64,
    }

    public struct PlatformPaused has copy, drop {
        paused: bool,
        admin: address,
        timestamp: u64,
    }

    public struct CircuitBreakerTriggered has copy, drop {
        player_id: ID,
        player_name: String,
        old_price: u64,
        new_price: u64,
        change_percent: u64,
        cooldown_until: u64,
        timestamp: u64,
    }

    public struct LiquidityAdded has copy, drop {
        amount: u64,
        new_total: u64,
        source: address,
        timestamp: u64,
    }

    public struct CurveParameterUpdated has copy, drop {
        old_steepness: u64,
        new_steepness: u64,
        admin: address,
        timestamp: u64,
    }

    public struct WalrusBlobVerified has copy, drop {
        blob_id: String,
        player_id: ID,
        data_hash: vector<u8>,
        verified: bool,
        timestamp: u64,
    }


    fun init(ctx: &mut TxContext) {
        let admin_address = tx_context::sender(ctx);
        
        let admin_cap = AdminCap {
            id: object::new(ctx),
        };

        let platform = Platform {
            id: object::new(ctx),
            admin: admin_address,
            players: table::new(ctx),
            player_names: table::new(ctx),
            liquidity_pool: balance::zero(),
            total_volume: 0,
            player_count: 0,
            curve_steepness: CURVE_STEEPNESS,
            paused: false,
            circuit_breaker_active: false,
            circuit_breaker_until: 0,
            used_blob_ids: vec_set::empty(),
            version: 1,
        };

        transfer::transfer(admin_cap, admin_address);
        transfer::share_object(platform);
    }
    
    
    //bond curve
    public fun calculate_market_price(
        base_value: u64,
        total_shares: u64,
        circulating_shares: u64,
        curve_steepness: u64
    ): u64 {
        if (total_shares == 0) return base_value;
        if (circulating_shares == 0) return base_value;
        if (circulating_shares > total_shares) return base_value;
        let utilization_bps = (circulating_shares * BASIS_POINTS) / total_shares;
        let premium_bps = (utilization_bps * curve_steepness) / BASIS_POINTS;
        let multiplier = BASIS_POINTS + premium_bps;
        (base_value * multiplier) / BASIS_POINTS
    }

    public fun calculate_buy_cost(
        platform: &Platform,
        player: &PlayerInfo,
        shares_to_buy: u64
    ): u64 {
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
    
    
    //walrus verification
    public fun create_data_hash(
        player_id: ID,
        performance_score: u64,
        goals: u64,
        assists: u64,
        rating: u64,
        timestamp: u64
    ): vector<u8> {
        let mut data = vector::empty<u8>();
        vector::append(&mut data, bcs::to_bytes(&player_id));
        vector::append(&mut data, bcs::to_bytes(&performance_score));
        vector::append(&mut data, bcs::to_bytes(&goals));
        vector::append(&mut data, bcs::to_bytes(&assists));
        vector::append(&mut data, bcs::to_bytes(&rating));
        vector::append(&mut data, bcs::to_bytes(&timestamp));
        
        hash::keccak256(&data)
    }

    public entry fun add_liquidity(
        _: &AdminCap,
        platform: &mut Platform,
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let amount = coin::value(&payment);
        let liquidity = coin::into_balance(payment);
        balance::join(&mut platform.liquidity_pool, liquidity);

        event::emit(LiquidityAdded {
            amount,
            new_total: balance::value(&platform.liquidity_pool),
            source: tx_context::sender(ctx),
            timestamp: clock::timestamp_ms(clock),
        });
    }

    public entry fun update_curve_steepness(
        _: &AdminCap,
        platform: &mut Platform,
        new_steepness: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(new_steepness <= MAX_CURVE_STEEPNESS, EInvalidCurveParameter);
        
        let old_steepness = platform.curve_steepness;
        platform.curve_steepness = new_steepness;

        event::emit(CurveParameterUpdated {
            old_steepness,
            new_steepness,
            admin: tx_context::sender(ctx),
            timestamp: clock::timestamp_ms(clock),
        });
    }

    public entry fun set_pause(
        _: &AdminCap,
        platform: &mut Platform,
        paused: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        platform.paused = paused;
        event::emit(PlatformPaused { 
            paused, 
            admin: tx_context::sender(ctx),
            timestamp: clock::timestamp_ms(clock),
        });
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


    public entry fun register_player(
        _: &AdminCap,
        platform: &mut Platform,
        name: vector<u8>,
        team: vector<u8>,
        position: vector<u8>,
        base_value: u64,         
        total_shares: u64,       
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(base_value >= MIN_BASE_VALUE, EInvalidPrice);
        assert!(base_value <= MAX_BASE_VALUE, EInvalidPrice);
        assert!(total_shares > 0, EInvalidShareAmount);
        assert!(total_shares <= 1000000000, EInvalidShareAmount);

        let player_name = string::utf8(name);
        assert!(!table::contains(&platform.player_names, player_name), EPlayerAlreadyExists);

        let player_uid = object::new(ctx);
        let player_id = object::uid_to_inner(&player_uid);
        object::delete(player_uid);

        let player_info = PlayerInfo {
            player_id,
            name: player_name,
            team: string::utf8(team),
            position: string::utf8(position),
            base_value,
            total_shares,
            circulating_shares: 0, 
            performance_history: vector::empty(),
            last_update_timestamp: 0,
            walrus_blob_id: string::utf8(b""),
            active: true,
            lifetime_volume: 0,
            all_time_high: base_value,
            all_time_low: base_value,
        };

        table::add(&mut platform.players, player_id, player_info);
        table::add(&mut platform.player_names, player_name, player_id);
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
            timestamp: clock::timestamp_ms(clock),
        });

        transfer::transfer(update_cap, tx_context::sender(ctx));
    }

    //performance update
    public entry fun update_base_value(
        platform: &mut Platform,
        update_cap: &UpdateCapability,
        new_base_value: u64,      // AI's new valuation
        performance_score: u64,    
        goals: u64,
        assists: u64,
        rating: u64,
        minutes_played: u64,
        clean_sheets: u64,
        walrus_blob_id: vector<u8>,  
        data_hash: vector<u8>,        
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        assert!(!platform.paused, EUnauthorized);
        assert!(
            !platform.circuit_breaker_active || 
            clock::timestamp_ms(clock) >= platform.circuit_breaker_until, 
            ECircuitBreakerTriggered
        );
        
        assert!(new_base_value >= MIN_BASE_VALUE, EInvalidPrice);
        assert!(new_base_value <= MAX_BASE_VALUE, EInvalidPrice);
        assert!(performance_score <= MAX_PERFORMANCE_SCORE, EInvalidPerformanceScore);
        assert!(vector::length(&walrus_blob_id) > 0, EInvalidBlobId);
        assert!(vector::length(&data_hash) == 32, EInvalidDataHash);

        let player_id = update_cap.player_id;
        assert!(table::contains(&platform.players, player_id), EPlayerNotFound);

        let blob_id_string = string::utf8(walrus_blob_id);
        
        
        assert!(!vec_set::contains(&platform.used_blob_ids, &blob_id_string), EBlobAlreadyUsed);

        let player = table::borrow_mut(&mut platform.players, player_id);
        assert!(player.active, EUnauthorized);

        let current_time = clock::timestamp_ms(clock);
        assert!(
            current_time >= player.last_update_timestamp + MIN_UPDATE_INTERVAL_MS,
            ETooSoon
        );

        let expected_hash = create_data_hash(
            player_id,
            performance_score,
            goals,
            assists,
            rating,
            current_time
        );
        assert!(data_hash == expected_hash, EInvalidDataHash);

        let old_base_value = player.base_value;
        let old_market_price = calculate_market_price(
            old_base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        );

        let change_percent = if (old_base_value > 0) {
            if (new_base_value > old_base_value) {
                ((new_base_value - old_base_value) * BASIS_POINTS) / old_base_value
            } else {
                ((old_base_value - new_base_value) * BASIS_POINTS) / old_base_value
            }
        } else {
            0
        };

        if (change_percent > CIRCUIT_BREAKER_THRESHOLD_BPS) {
            platform.circuit_breaker_active = true;
            platform.circuit_breaker_until = current_time + CIRCUIT_BREAKER_COOLDOWN_MS;
            
            event::emit(CircuitBreakerTriggered {
                player_id,
                player_name: player.name,
                old_price: old_base_value,
                new_price: new_base_value,
                change_percent: change_percent / 100,
                cooldown_until: platform.circuit_breaker_until,
                timestamp: current_time,
            });
            
            return // Don't apply update, just trigger circuit breaker
        };

        player.base_value = new_base_value;
        player.last_update_timestamp = current_time;
        player.walrus_blob_id = blob_id_string;

        if (new_base_value > player.all_time_high) {
            player.all_time_high = new_base_value;
        };
        if (new_base_value < player.all_time_low || player.all_time_low == 0) {
            player.all_time_low = new_base_value;
        };

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
            minutes_played,
            clean_sheets,
            walrus_blob_id: blob_id_string,
            data_hash,
        };

        if (vector::length(&player.performance_history) >= MAX_HISTORY_RECORDS) {
            vector::remove(&mut player.performance_history, 0);
        };
        vector::push_back(&mut player.performance_history, record);

        vec_set::insert(&mut platform.used_blob_ids, blob_id_string);

        event::emit(WalrusBlobVerified {
            blob_id: blob_id_string,
            player_id,
            data_hash,
            verified: true,
            timestamp: current_time,
        });

        event::emit(BaseValueUpdated {
            player_id,
            player_name: player.name,
            old_base_value,
            new_base_value,
            old_market_price,
            new_market_price,
            change_percent: change_percent / 100,
            performance_score,
            goals,
            assists,
            rating,
            walrus_blob_id: blob_id_string,
            data_hash,
            timestamp: current_time,
        });
    }

    //Market
    public entry fun buy_shares(
        platform: &mut Platform,
        player_id: ID,
        shares: u64,
        max_price_per_share: u64,  // Slippage protection
        payment: Coin<SUI>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!platform.paused, EUnauthorized);
        assert!(
            !platform.circuit_breaker_active || 
            clock::timestamp_ms(clock) >= platform.circuit_breaker_until, 
            ECircuitBreakerTriggered
        );
        assert!(shares > 0, EInvalidShareAmount);
        assert!(table::contains(&platform.players, player_id), EPlayerNotFound);

        let player = table::borrow(&platform.players, player_id);
        assert!(player.active, EUnauthorized);
        
        let max_purchase = (player.total_shares * MAX_PURCHASE_PERCENT) / BASIS_POINTS;
        assert!(shares <= max_purchase, EMaxPurchaseExceeded);
        
        let available = player.total_shares - player.circulating_shares;
        assert!(available >= shares, EInsufficientShares);

        let total_cost = calculate_buy_cost(platform, player, shares);
        
        let player = table::borrow_mut(&mut platform.players, player_id);
        let avg_price = total_cost / shares;

        assert!(avg_price <= max_price_per_share, EPriceSlippage);
        assert!(coin::value(&payment) >= total_cost, EInsufficientPayment);

        let market_price_before = calculate_market_price(
            player.base_value,
            player.total_shares,
            player.circulating_shares,
            platform.curve_steepness
        );
        player.circulating_shares = player.circulating_shares + shares;
        player.lifetime_volume = player.lifetime_volume + total_cost;
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
            purchase_timestamp: clock::timestamp_ms(clock),
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
        min_price_per_share: u64,  // Slippage protection
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!platform.paused, EUnauthorized);
        assert!(
            !platform.circuit_breaker_active || 
            clock::timestamp_ms(clock) >= platform.circuit_breaker_until, 
            ECircuitBreakerTriggered
        );

        let PlayerShares { 
            id, 
            player_id, 
            player_name, 
            shares, 
            purchase_price,
            purchase_timestamp: _
        } = shares_obj;

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
        player.lifetime_volume = player.lifetime_volume + total_payout;

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
                purchase_timestamp: clock::timestamp_ms(clock),
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
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        event::emit(SharesTransferred {
            from: tx_context::sender(ctx),
            to: recipient,
            player_id: shares_obj.player_id,
            shares: shares_obj.shares,
            timestamp: clock::timestamp_ms(clock),
        });

        transfer::public_transfer(shares_obj, recipient);
    }

    public entry fun merge_shares(
        shares1: &mut PlayerShares,
        shares2: PlayerShares,
    ) {
        let PlayerShares { 
            id, 
            player_id, 
            player_name: _, 
            shares, 
            purchase_price,
            purchase_timestamp: _
        } = shares2;
        
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
            purchase_timestamp: shares_obj.purchase_timestamp,
        };

        transfer::transfer(new_shares, tx_context::sender(ctx));
    }

    // View real-time values and weekly change

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
            let premium = ((market_price - player.base_value) * 100) / player.base_value;
            (premium, false) // Overvalued
        } else if (player.base_value > market_price) {
            let discount = ((player.base_value - market_price) * 100) / player.base_value;
            (discount, true) // Undervalued - BUY signal
        } else {
            (0, true) // Fair value
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

    public fun get_player_lifetime_volume(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.lifetime_volume
    }

    public fun get_player_ath(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.all_time_high
    }

    public fun get_player_atl(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.all_time_low
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

    public fun is_circuit_breaker_active(platform: &Platform): bool {
        platform.circuit_breaker_active
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

    public fun get_performance_history(
        platform: &Platform, 
        player_id: ID,
        limit: u64
    ): vector<PerformanceRecord> {
        let player = table::borrow(&platform.players, player_id);
        let history_len = vector::length(&player.performance_history);
        
        if (history_len == 0) {
            return vector::empty()
        };
        
        let start_idx = if (history_len > limit) {
            history_len - limit
        } else {
            0
        };
        
        let mut result = vector::empty();
        let mut i = start_idx;
        while (i < history_len) {
            let record = *vector::borrow(&player.performance_history, i);
            vector::push_back(&mut result, record);
            i = i + 1;
        };
        
        result
    }

    public fun get_latest_performance(platform: &Platform, player_id: ID): PerformanceRecord {
        let player = table::borrow(&platform.players, player_id);
        let len = vector::length(&player.performance_history);
        assert!(len > 0, EPlayerNotFound);
        *vector::borrow(&player.performance_history, len - 1)
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

    public fun get_share_purchase_timestamp(shares: &PlayerShares): u64 {
        shares.purchase_timestamp
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