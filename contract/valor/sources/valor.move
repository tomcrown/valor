// Enhanced Valor Contract with Nautilus Attestation Support
// This adds attestation fields WITHOUT breaking existing functionality

#[allow(lint(public_entry), unused_const)]
module valor::valor {

    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::balance::{Self, Balance};
    use sui::table::{Self, Table};
    use sui::event;
    use std::string::{Self, String};
    use sui::clock::{Self, Clock};
    use sui::url::{Self, Url};
    use sui::display;
    use sui::package;
    use valor::valor_seal;

    const EInvalidPrice: u64 = 1;
    const EInsufficientShares: u64 = 2;
    const EUnauthorized: u64 = 3;
    const EPlayerNotFound: u64 = 4;
    const EInvalidPerformanceScore: u64 = 5;
    const EInvalidShareAmount: u64 = 6;
    const EInvalidBlobId: u64 = 8;
    const EInsufficientPayment: u64 = 9;
    const EInsufficientLiquidity: u64 = 10;
    const EPriceSlippage: u64 = 12;
    const EInvalidCurveParameter: u64 = 13;
    const ECircuitBreakerTriggered: u64 = 14;
    const EMaxPurchaseExceeded: u64 = 22;
    const EPlayerAlreadyExists: u64 = 26;
    const EInvalidSeason: u64 = 27;
    const EEarlySeasonAlreadySet: u64 = 28;
    
    const MAX_PERFORMANCE_SCORE: u64 = 1000;
    const CURVE_STEEPNESS: u64 = 1000;
    const MAX_CURVE_STEEPNESS: u64 = 5000;
    const BASIS_POINTS: u64 = 10000;
    const MIN_BASE_VALUE: u64 = 1000000;
    const MAX_BASE_VALUE: u64 = 1000000000000;
    const MAX_HISTORY_RECORDS: u64 = 24;
    const CIRCUIT_BREAKER_THRESHOLD_BPS: u64 = 10000;
    const CIRCUIT_BREAKER_COOLDOWN_MS: u64 = 900000;
    const MAX_PURCHASE_PERCENT: u64 = 3000;
    
    const SEASON_EARLY: u8 = 0;
    const SEASON_MID: u8 = 1;
    const SEASON_CURRENT: u8 = 2;

    public struct VALOR has drop {}

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
        version: u64, 
    }
    
    public struct PlayerInfo has store {
        player_id: ID,
        name: String,
        team: String,
        position: String,
        image_url: String,
        nft_image_url: String,
        
        base_value: u64,
        early_season_base_value: u64,
        mid_season_base_value: u64,
        current_season_base_value: u64,
        
        early_season_walrus_blob_id: String,
        mid_season_walrus_blob_id: String,
        current_season_walrus_blob_id: String,
        walrus_blob_id: String,
        
        // 🔥 NEW: Nautilus attestation fields
        nautilus_signature: vector<u8>,
        nautilus_public_key: vector<u8>,
        nautilus_timestamp: u64,
        nautilus_verified: bool,
        
        total_shares: u64,
        circulating_shares: u64,
        performance_history: vector<PerformanceRecord>,
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
        base_value: u64,
        // 🔥 NEW: Track which updates are Nautilus-verified
        nautilus_verified: bool,
    }

    public struct PlayerSharesNFT has key, store {
        id: UID,
        player_id: ID,
        player_name: String,
        shares: u64,
        purchase_price: u64,
        purchase_timestamp: u64,
        nft_image_url: Url,
    }

    public struct PlayerRegistered has copy, drop {
        player_id: ID,
        name: String,
        team: String,
        position: String,
        image_url: String,
        nft_image_url: String,
        base_value: u64,
        total_shares: u64,
        walrus_blob_id: String,
        // 🔥 NEW: Indicate if registered with Nautilus
        nautilus_verified: bool,
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
        nft_id: ID,
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
        season: u8,
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
        // 🔥 NEW: Track Nautilus verification in events
        nautilus_verified: bool,
        timestamp: u64,
    }

    // ... (keep all your other events - SharesTransferred, PlatformPaused, etc.)
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

    public struct NFTMinted has copy, drop {
        nft_id: ID,
        player_id: ID,
        player_name: String,
        shares: u64,
        owner: address,
        timestamp: u64,
    }

    public struct NFTBurned has copy, drop {
        nft_id: ID,
        player_id: ID,
        shares: u64,
        timestamp: u64,
    }

    public struct NFTSplit has copy, drop {
        original_nft_id: ID,
        new_nft_id: ID,
        player_id: ID,
        original_shares: u64,
        split_amount: u64,
        timestamp: u64,
    }

    fun init(witness: VALOR, ctx: &mut TxContext) {
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
            version: 1,
        };

        let publisher = package::claim(witness, ctx);
        let keys = vector[
            string::utf8(b"name"),
            string::utf8(b"description"),
            string::utf8(b"image_url"),
            string::utf8(b"project_url"),
            string::utf8(b"creator")
        ];
        let values = vector[
            string::utf8(b"{player_name} Share Certificate"),
            string::utf8(b"This NFT represents {shares} shares of {player_name}. Purchase Date: {purchase_timestamp}"),
            string::utf8(b"{nft_image_url}"),
            string::utf8(b"https://valor.wal.app"),
            string::utf8(b"Valor Platform")
        ];
        let mut display = display::new_with_fields<PlayerSharesNFT>(
            &publisher, 
            keys,
            values,
            ctx
        );
        display::update_version(&mut display);
        
        transfer::public_transfer(publisher, admin_address);
        transfer::public_transfer(display, admin_address);
        transfer::transfer(admin_cap, admin_address);
        transfer::share_object(platform);
    }
    
    // ... (keep all your existing helper functions)
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

    // 🔥 ENHANCED: Standard registration (backward compatible)
    public entry fun register_player(
        _: &AdminCap,
        platform: &mut Platform,
        name: vector<u8>,
        team: vector<u8>,
        position: vector<u8>,
        image_url: vector<u8>,
        nft_image_url: vector<u8>,
        early_season_base_value: u64,
        total_shares: u64,
        walrus_blob_id: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        register_player_internal(
            platform,
            name,
            team,
            position,
            image_url,
            nft_image_url,
            early_season_base_value,
            total_shares,
            walrus_blob_id,
            vector::empty(), // empty signature
            vector::empty(), // empty public key
            false, // not Nautilus verified
            clock,
            ctx
        )
    }

    // 🔥 NEW: Register with Nautilus attestation
    public entry fun register_player_verified(
        _: &AdminCap,
        platform: &mut Platform,
        name: vector<u8>,
        team: vector<u8>,
        position: vector<u8>,
        image_url: vector<u8>,
        nft_image_url: vector<u8>,
        early_season_base_value: u64,
        total_shares: u64,
        walrus_blob_id: vector<u8>,
        nautilus_signature: vector<u8>,
        nautilus_public_key: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        register_player_internal(
            platform,
            name,
            team,
            position,
            image_url,
            nft_image_url,
            early_season_base_value,
            total_shares,
            walrus_blob_id,
            nautilus_signature,
            nautilus_public_key,
            true, // Nautilus verified
            clock,
            ctx
        )
    }

    // Internal registration function (DRY principle)
    fun register_player_internal(
        platform: &mut Platform,
        name: vector<u8>,
        team: vector<u8>,
        position: vector<u8>,
        image_url: vector<u8>,
        nft_image_url: vector<u8>,
        early_season_base_value: u64,
        total_shares: u64,
        walrus_blob_id: vector<u8>,
        nautilus_signature: vector<u8>,
        nautilus_public_key: vector<u8>,
        nautilus_verified: bool,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(early_season_base_value >= MIN_BASE_VALUE, EInvalidPrice);
        assert!(early_season_base_value <= MAX_BASE_VALUE, EInvalidPrice);
        assert!(total_shares > 0, EInvalidShareAmount);
        assert!(total_shares <= 1000000000, EInvalidShareAmount);
        assert!(vector::length(&walrus_blob_id) > 0, EInvalidBlobId);

        let blob_id_string = string::utf8(walrus_blob_id);
        let player_name = string::utf8(name);
        assert!(!table::contains(&platform.player_names, player_name), EPlayerAlreadyExists);

        let player_uid = object::new(ctx);
        let player_id = object::uid_to_inner(&player_uid);
        object::delete(player_uid);

        let nft_url_string = string::utf8(nft_image_url);

        let player_info = PlayerInfo {
            player_id,
            name: player_name,
            team: string::utf8(team),
            position: string::utf8(position),
            image_url: string::utf8(image_url),
            nft_image_url: nft_url_string,
            
            base_value: early_season_base_value,
            early_season_base_value,
            mid_season_base_value: 0,
            current_season_base_value: 0,
            
            early_season_walrus_blob_id: blob_id_string,
            mid_season_walrus_blob_id: string::utf8(b""),
            current_season_walrus_blob_id: string::utf8(b""),
            walrus_blob_id: blob_id_string,
            
            // 🔥 NEW: Store Nautilus attestation
            nautilus_signature,
            nautilus_public_key,
            nautilus_timestamp: clock::timestamp_ms(clock),
            nautilus_verified,
            
            total_shares,
            circulating_shares: 0,
            performance_history: vector::empty(),
            active: true,
            lifetime_volume: 0,
            all_time_high: early_season_base_value,
            all_time_low: early_season_base_value,
        };

        table::add(&mut platform.players, player_id, player_info);
        table::add(&mut platform.player_names, player_name, player_id);
        platform.player_count = platform.player_count + 1;

        event::emit(PlayerRegistered {
            player_id,
            name: player_name,
            team: string::utf8(team),
            position: string::utf8(position),
            image_url: string::utf8(image_url),
            nft_image_url: nft_url_string,
            base_value: early_season_base_value,
            total_shares,
            walrus_blob_id: blob_id_string,
            nautilus_verified, // 🔥 NEW
            timestamp: clock::timestamp_ms(clock),
        });
    }

    // 🔥 ENHANCED: Standard update (backward compatible)
    public entry fun update_base_value(
        _: &AdminCap,
        platform: &mut Platform,
        player_id: ID,
        season: u8,
        new_base_value: u64,
        performance_score: u64,
        goals: u64,
        assists: u64,
        rating: u64,
        minutes_played: u64,
        clean_sheets: u64,
        walrus_blob_id: vector<u8>,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        update_base_value_internal(
            platform,
            player_id,
            season,
            new_base_value,
            performance_score,
            goals,
            assists,
            rating,
            minutes_played,
            clean_sheets,
            walrus_blob_id,
            vector::empty(), // empty signature
            vector::empty(), // empty public key
            false, // not Nautilus verified
            clock
        )
    }

    // 🔥 NEW: Update with Nautilus attestation
    public entry fun update_base_value_verified(
        _: &AdminCap,
        platform: &mut Platform,
        player_id: ID,
        season: u8,
        new_base_value: u64,
        performance_score: u64,
        goals: u64,
        assists: u64,
        rating: u64,
        minutes_played: u64,
        clean_sheets: u64,
        walrus_blob_id: vector<u8>,
        nautilus_signature: vector<u8>,
        nautilus_public_key: vector<u8>,
        clock: &Clock,
        _ctx: &mut TxContext
    ) {
        update_base_value_internal(
            platform,
            player_id,
            season,
            new_base_value,
            performance_score,
            goals,
            assists,
            rating,
            minutes_played,
            clean_sheets,
            walrus_blob_id,
            nautilus_signature,
            nautilus_public_key,
            true, // Nautilus verified
            clock
        )
    }

    // Internal update function
    fun update_base_value_internal(
        platform: &mut Platform,
        player_id: ID,
        season: u8,
        new_base_value: u64,
        performance_score: u64,
        goals: u64,
        assists: u64,
        rating: u64,
        minutes_played: u64,
        clean_sheets: u64,
        walrus_blob_id: vector<u8>,
        nautilus_signature: vector<u8>,
        nautilus_public_key: vector<u8>,
        nautilus_verified: bool,
        clock: &Clock
    ) {
        assert!(!platform.paused, EUnauthorized);
        assert!(
            !platform.circuit_breaker_active || 
            clock::timestamp_ms(clock) >= platform.circuit_breaker_until, 
            ECircuitBreakerTriggered
        );
        
        assert!(season == SEASON_MID || season == SEASON_CURRENT, EInvalidSeason);
        assert!(new_base_value >= MIN_BASE_VALUE, EInvalidPrice);
        assert!(new_base_value <= MAX_BASE_VALUE, EInvalidPrice);
        assert!(performance_score <= MAX_PERFORMANCE_SCORE, EInvalidPerformanceScore);
        assert!(vector::length(&walrus_blob_id) > 0, EInvalidBlobId);
        assert!(table::contains(&platform.players, player_id), EPlayerNotFound);

        let blob_id_string = string::utf8(walrus_blob_id);
        let player = table::borrow_mut(&mut platform.players, player_id);
        assert!(player.active, EUnauthorized);

        if (season == SEASON_MID) {
            player.mid_season_base_value = new_base_value;
            player.mid_season_walrus_blob_id = blob_id_string;
        } else if (season == SEASON_CURRENT) {
            player.current_season_base_value = new_base_value;
            player.current_season_walrus_blob_id = blob_id_string;
        };

        player.base_value = new_base_value;
        player.walrus_blob_id = blob_id_string;

        // 🔥 NEW: Update Nautilus attestation
        if (nautilus_verified) {
            player.nautilus_signature = nautilus_signature;
            player.nautilus_public_key = nautilus_public_key;
            player.nautilus_timestamp = clock::timestamp_ms(clock);
            player.nautilus_verified = true;
        };

        let current_time = clock::timestamp_ms(clock);
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
            
            return
        };

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
            base_value: new_base_value,
            nautilus_verified, // 🔥 NEW
        };

        if (vector::length(&player.performance_history) >= MAX_HISTORY_RECORDS) {
            vector::remove(&mut player.performance_history, 0);
        };
        vector::push_back(&mut player.performance_history, record);

        event::emit(BaseValueUpdated {
            player_id,
            player_name: player.name,
            season,
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
            nautilus_verified, // 🔥 NEW
            timestamp: current_time,
        });
    }

    // ... (Keep ALL your existing trading functions - buy_shares, sell_shares, etc.)
    // I'll include them for completeness but they don't change

    public entry fun buy_shares(
        platform: &mut Platform,
        nft_registry: &mut valor_seal::NFTRegistry,
        player_id: ID,
        shares: u64,
        max_price_per_share: u64,
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

        let current_time = clock::timestamp_ms(clock);
        
        let nft_url = url::new_unsafe(string::to_ascii(player.nft_image_url));
        let nft = PlayerSharesNFT {
            id: object::new(ctx),
            player_id,
            player_name: player.name,
            shares,
            purchase_price: avg_price,
            purchase_timestamp: current_time,
            nft_image_url: nft_url,
        };

        let nft_id = object::id(&nft);

        platform.total_volume = platform.total_volume + total_cost;

        valor_seal::register_nft_ownership(
            nft_registry,
            player_id,
            tx_context::sender(ctx),
            shares,
            ctx
        );

        event::emit(SharesPurchased {
            buyer: tx_context::sender(ctx),
            player_id,
            player_name: player.name,
            shares,
            base_value: player.base_value,
            market_price: market_price_before,
            total_paid: total_cost,
            new_circulating: player.circulating_shares,
            nft_id,
            timestamp: current_time,
        });

        event::emit(NFTMinted {
            nft_id,
            player_id,
            player_name: player.name,
            shares,
            owner: tx_context::sender(ctx),
            timestamp: current_time,
        });

        transfer::public_transfer(nft, tx_context::sender(ctx));
    }

    public entry fun sell_shares(
        platform: &mut Platform,
        nft_registry: &mut valor_seal::NFTRegistry,
        nft: PlayerSharesNFT,
        shares_to_sell: u64,
        min_price_per_share: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!platform.paused, EUnauthorized);
        assert!(
            !platform.circuit_breaker_active || 
            clock::timestamp_ms(clock) >= platform.circuit_breaker_until, 
            ECircuitBreakerTriggered
        );

        assert!(nft.shares >= shares_to_sell, EInsufficientShares);
        assert!(shares_to_sell > 0, EInvalidShareAmount);
        assert!(table::contains(&platform.players, nft.player_id), EPlayerNotFound);

        let player = table::borrow(&platform.players, nft.player_id);
        let total_payout = calculate_sell_payout(platform, player, shares_to_sell);
        
        let player = table::borrow_mut(&mut platform.players, nft.player_id);
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

        let cost_basis = nft.purchase_price * shares_to_sell;
        let profit_loss = if (total_payout > cost_basis) {
            total_payout - cost_basis
        } else {
            cost_basis - total_payout
        };

        platform.total_volume = platform.total_volume + total_payout;

        valor_seal::reduce_nft_ownership(
            nft_registry,
            nft.player_id,
            tx_context::sender(ctx),
            shares_to_sell,
            ctx
        );

        event::emit(SharesSold {
            seller: tx_context::sender(ctx),
            player_id: nft.player_id,
            player_name: nft.player_name,
            shares: shares_to_sell,
            base_value: player.base_value,
            market_price: market_price_before,
            total_received: total_payout,
            profit_loss,
            new_circulating: player.circulating_shares,
            timestamp: clock::timestamp_ms(clock),
        });

        let remaining = nft.shares - shares_to_sell;
        if (remaining > 0) {
            let nft_url = nft.nft_image_url;
            let remaining_nft = PlayerSharesNFT {
                id: object::new(ctx),
                player_id: nft.player_id,
                player_name: nft.player_name,
                shares: remaining,
                purchase_price: nft.purchase_price,
                purchase_timestamp: nft.purchase_timestamp,
                nft_image_url: nft_url,
            };
            
            let PlayerSharesNFT { id, player_id: _, player_name: _, shares: _, purchase_price: _, purchase_timestamp: _, nft_image_url: _ } = nft;
            event::emit(NFTBurned {
                nft_id: object::uid_to_inner(&id),
                player_id: player.player_id,
                shares: shares_to_sell,
                timestamp: clock::timestamp_ms(clock),
            });
            object::delete(id);
            
            transfer::public_transfer(remaining_nft, tx_context::sender(ctx));
        } else {
            let PlayerSharesNFT { id, player_id: _, player_name: _, shares: _, purchase_price: _, purchase_timestamp: _, nft_image_url: _ } = nft;
            event::emit(NFTBurned {
                nft_id: object::uid_to_inner(&id),
                player_id: player.player_id,
                shares: shares_to_sell,
                timestamp: clock::timestamp_ms(clock),
            });
            object::delete(id);
        };
    }

    public entry fun transfer_shares(
        nft: PlayerSharesNFT,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        event::emit(SharesTransferred {
            from: tx_context::sender(ctx),
            to: recipient,
            player_id: nft.player_id,
            shares: nft.shares,
            timestamp: clock::timestamp_ms(clock),
        });

        transfer::public_transfer(nft, recipient);
    }

    public entry fun split_shares(
        nft: &mut PlayerSharesNFT,
        split_amount: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(nft.shares > split_amount, EInsufficientShares);
        assert!(split_amount > 0, EInvalidShareAmount);

        let original_shares = nft.shares;
        nft.shares = nft.shares - split_amount;

        let new_nft = PlayerSharesNFT {
            id: object::new(ctx),
            player_id: nft.player_id,
            player_name: nft.player_name,
            shares: split_amount,
            purchase_price: nft.purchase_price,
            purchase_timestamp: nft.purchase_timestamp,
            nft_image_url: nft.nft_image_url,
        };

        let new_nft_id = object::id(&new_nft);

        event::emit(NFTSplit {
            original_nft_id: object::id(nft),
            new_nft_id,
            player_id: nft.player_id,
            original_shares,
            split_amount,
            timestamp: clock::timestamp_ms(clock),
        });

        transfer::public_transfer(new_nft, tx_context::sender(ctx));
    }

    public entry fun merge_shares(
        nft1: &mut PlayerSharesNFT,
        nft2: PlayerSharesNFT,
        clock: &Clock,
    ) {
        let PlayerSharesNFT { 
            id, 
            player_id, 
            player_name: _,
            shares, 
            purchase_price,
            purchase_timestamp: _,
            nft_image_url: _
        } = nft2;
        
        assert!(nft1.player_id == player_id, EPlayerNotFound);

        let total_shares = nft1.shares + shares;
        let total_cost = (nft1.shares * nft1.purchase_price) + (shares * purchase_price);
        nft1.purchase_price = total_cost / total_shares;
        nft1.shares = total_shares;

        event::emit(NFTBurned {
            nft_id: object::uid_to_inner(&id),
            player_id,
            shares,
            timestamp: clock::timestamp_ms(clock),
        });

        object::delete(id);
    }

    // ... (Keep all your existing getter functions)
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

    public fun get_early_season_base_value(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.early_season_base_value
    }

    public fun get_mid_season_base_value(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.mid_season_base_value
    }

    public fun get_current_season_base_value(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.current_season_base_value
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
            (premium, false)
        } else if (player.base_value > market_price) {
            let discount = ((player.base_value - market_price) * 100) / player.base_value;
            (discount, true)
        } else {
            (0, true)
        }
    }

    public fun get_player_name(platform: &Platform, player_id: ID): String {
        let player = table::borrow(&platform.players, player_id);
        player.name
    }

    public fun get_player_image_url(platform: &Platform, player_id: ID): String {
        let player = table::borrow(&platform.players, player_id);
        player.image_url
    }

    public fun get_player_nft_image_url(platform: &Platform, player_id: ID): String {
        let player = table::borrow(&platform.players, player_id);
        player.nft_image_url
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

    public fun get_nft_share_count(nft: &PlayerSharesNFT): u64 {
        nft.shares
    }

    public fun get_nft_player_id(nft: &PlayerSharesNFT): ID {
        nft.player_id
    }

    public fun get_nft_purchase_price(nft: &PlayerSharesNFT): u64 {
        nft.purchase_price
    }

    public fun get_nft_player_name(nft: &PlayerSharesNFT): String {
        nft.player_name
    }

    public fun get_nft_purchase_timestamp(nft: &PlayerSharesNFT): u64 {
        nft.purchase_timestamp
    }

    public fun get_early_season_walrus_blob_id(
        platform: &Platform, 
        player_id: ID
    ): String {
        let player = table::borrow(&platform.players, player_id);
        player.early_season_walrus_blob_id
    }

    public fun get_mid_season_walrus_blob_id(
        platform: &Platform, 
        player_id: ID
    ): String {
        let player = table::borrow(&platform.players, player_id);
        player.mid_season_walrus_blob_id
    }

    public fun get_current_season_walrus_blob_id(
        platform: &Platform, 
        player_id: ID
    ): String {
        let player = table::borrow(&platform.players, player_id);
        player.current_season_walrus_blob_id
    }

    // 🔥 NEW: Nautilus attestation getter functions
    public fun is_nautilus_verified(platform: &Platform, player_id: ID): bool {
        let player = table::borrow(&platform.players, player_id);
        player.nautilus_verified
    }

    public fun get_nautilus_signature(platform: &Platform, player_id: ID): vector<u8> {
        let player = table::borrow(&platform.players, player_id);
        player.nautilus_signature
    }

    public fun get_nautilus_public_key(platform: &Platform, player_id: ID): vector<u8> {
        let player = table::borrow(&platform.players, player_id);
        player.nautilus_public_key
    }

    public fun get_nautilus_timestamp(platform: &Platform, player_id: ID): u64 {
        let player = table::borrow(&platform.players, player_id);
        player.nautilus_timestamp
    }

    // 🔥 NEW: Get full attestation data in one call
    public fun get_nautilus_attestation(
        platform: &Platform, 
        player_id: ID
    ): (bool, vector<u8>, vector<u8>, u64) {
        let player = table::borrow(&platform.players, player_id);
        (
            player.nautilus_verified,
            player.nautilus_signature,
            player.nautilus_public_key,
            player.nautilus_timestamp
        )
    }
}
