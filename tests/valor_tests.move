#[test_only]
module valor::valor_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::clock::{Self, Clock};
    use valor::valor::{Self, Platform, AdminCap, PlayerShares, UpdateCapability};
    use std::string;
    use std::vector;

    // Test constants
    const ADMIN: address = @0xAD;
    const USER1: address = @0x1;
    const USER2: address = @0x2;
    const AI_WORKER: address = @0xAI;

    const MESSI_BASE_VALUE: u64 = 1_000_000_000; // 1 SUI
    const RONALDO_BASE_VALUE: u64 = 900_000_000; // 0.9 SUI
    const TOTAL_SHARES: u64 = 1000;
    const INITIAL_LIQUIDITY: u64 = 100_000_000_000; // 100 SUI

    // ======== HELPER FUNCTIONS ========

    fun setup_platform(scenario: &mut Scenario) {
        ts::next_tx(scenario, ADMIN);
        {
            valor::init_for_testing(ts::ctx(scenario));
        };
    }

    fun add_initial_liquidity(scenario: &mut Scenario, amount: u64) {
        ts::next_tx(scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(scenario);
            let mut platform = ts::take_shared<Platform>(scenario);
            let payment = coin::mint_for_testing<SUI>(amount, ts::ctx(scenario));

            valor::add_liquidity(&admin_cap, &mut platform, payment, ts::ctx(scenario));

            ts::return_to_sender(scenario, admin_cap);
            ts::return_shared(platform);
        };
    }

    fun register_test_player(
        scenario: &mut Scenario, 
        name: vector<u8>,
        team: vector<u8>,
        position: vector<u8>,
        base_value: u64
    ) {
        ts::next_tx(scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(scenario);
            let mut platform = ts::take_shared<Platform>(scenario);

            valor::register_player(
                &admin_cap,
                &mut platform,
                name,
                team,
                position,
                base_value,
                TOTAL_SHARES,
                ts::ctx(scenario)
            );

            ts::return_to_sender(scenario, admin_cap);
            ts::return_shared(platform);
        };
    }

    fun get_player_id_from_cap(scenario: &mut Scenario, sender: address): ID {
        ts::next_tx(scenario, sender);
        let cap = ts::take_from_sender<UpdateCapability>(scenario);
        let player_id = valor::get_cap_player_id(&cap);
        ts::return_to_sender(scenario, cap);
        player_id
    }

    // ======== TEST 1: Platform Initialization ========
    #[test]
    fun test_platform_init() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            
            assert!(valor::get_player_count(&platform) == 0, 0);
            assert!(valor::get_total_volume(&platform) == 0, 1);
            assert!(!valor::is_paused(&platform), 2);
            assert!(valor::get_liquidity_balance(&platform) == 0, 3);
            assert!(valor::get_curve_steepness(&platform) == 1000, 4);

            ts::return_shared(platform);
        };

        // Admin should have AdminCap
        assert!(ts::has_most_recent_for_sender<AdminCap>(&scenario), 5);

        ts::end(scenario);
    }

    // ======== TEST 2: Add Liquidity ========
    #[test]
    fun test_add_liquidity() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            assert!(valor::get_liquidity_balance(&platform) == INITIAL_LIQUIDITY, 0);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 3: Register Player ========
    #[test]
    fun test_register_player() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        register_test_player(&mut scenario, b"Lionel Messi", b"Inter Miami", b"Forward", MESSI_BASE_VALUE);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            assert!(valor::get_player_count(&platform) == 1, 0);
            ts::return_shared(platform);

            // Admin should have UpdateCapability
            assert!(ts::has_most_recent_for_sender<UpdateCapability>(&scenario), 1);
        };

        ts::end(scenario);
    }

    // ======== TEST 4: Bonding Curve Math - Zero Circulating ========
    #[test]
    fun test_bonding_curve_zero_circulating() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            
            let market_price = valor::get_market_price(&platform, player_id);
            let base_value = valor::get_base_value(&platform, player_id);
            
            // With 0 circulating, market price = base value
            assert!(market_price == base_value, 0);
            assert!(market_price == MESSI_BASE_VALUE, 1);
            assert!(valor::get_circulating_shares(&platform, player_id) == 0, 2);

            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 5: Buy Shares - Price Increases ========
    #[test]
    fun test_buy_shares_price_increase() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // Get initial market price
        ts::next_tx(&mut scenario, USER1);
        let initial_price = {
            let platform = ts::take_shared<Platform>(&scenario);
            let price = valor::get_market_price(&platform, player_id);
            ts::return_shared(platform);
            price
        };

        // User1 buys 500 shares (50% of supply)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            let shares_to_buy = 500;
            let payment_amount = 600_000_000_000; // Overpay for safety
            let payment = coin::mint_for_testing<SUI>(payment_amount, ts::ctx(&mut scenario));

            valor::buy_shares(
                &mut platform,
                player_id,
                shares_to_buy,
                2_000_000_000, // max 2 SUI per share
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);

            assert!(ts::has_most_recent_for_sender<PlayerShares>(&scenario), 0);
        };

        // Check market price increased
        ts::next_tx(&mut scenario, USER1);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            let new_price = valor::get_market_price(&platform, player_id);
            
            // Price should have increased
            assert!(new_price > initial_price, 0);
            
            // With 500/1000 circulating: utilization = 50%
            // Premium = 50% × 10% = 5%
            // Market price = base × 1.05
            let expected_price = (MESSI_BASE_VALUE * 10500) / 10000;
            assert!(new_price == expected_price, 1);

            // Check circulating shares
            assert!(valor::get_circulating_shares(&platform, player_id) == 500, 2);

            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 6: Sell Shares - Price Decreases ========
    #[test]
    fun test_sell_shares_price_decrease() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // User1 buys 500 shares
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(600_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(
                &mut platform,
                player_id,
                500,
                2_000_000_000,
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        // Get price before selling
        ts::next_tx(&mut scenario, USER1);
        let price_before_sell = {
            let platform = ts::take_shared<Platform>(&scenario);
            let price = valor::get_market_price(&platform, player_id);
            ts::return_shared(platform);
            price
        };

        // User1 sells 200 shares
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let shares_obj = ts::take_from_sender<PlayerShares>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            valor::sell_shares(
                &mut platform,
                shares_obj,
                200,
                0, // Accept any price
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        // Check price decreased
        ts::next_tx(&mut scenario, USER1);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            let price_after_sell = valor::get_market_price(&platform, player_id);
            
            assert!(price_after_sell < price_before_sell, 0);
            assert!(valor::get_circulating_shares(&platform, player_id) == 300, 1);

            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 7: Sell All Shares - Object Deleted ========
    #[test]
    fun test_sell_all_shares() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // Buy shares
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(200_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(&mut platform, player_id, 100, 2_000_000_000, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        // Sell all shares
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let shares_obj = ts::take_from_sender<PlayerShares>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            valor::sell_shares(&mut platform, shares_obj, 100, 0, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        // Should have no PlayerShares object
        ts::next_tx(&mut scenario, USER1);
        {
            assert!(!ts::has_most_recent_for_sender<PlayerShares>(&scenario), 0);
        };

        ts::end(scenario);
    }

    // ======== TEST 8: Update Base Value ========
    #[test]
    fun test_update_base_value() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // Transfer UpdateCap to AI_WORKER
        ts::next_tx(&mut scenario, ADMIN);
        {
            let update_cap = ts::take_from_sender<UpdateCapability>(&scenario);
            valor::transfer_update_capability(update_cap, AI_WORKER);
        };

        // AI updates base value
        ts::next_tx(&mut scenario, AI_WORKER);
        {
            let update_cap = ts::take_from_sender<UpdateCapability>(&scenario);
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            clock::increment_for_testing(&mut clock, 86400001); // 24 hours + 1ms

            valor::update_base_value(
                &mut platform,
                &update_cap,
                1_200_000_000, // 1.2 SUI (20% increase)
                850,
                3,
                2,
                90,
                b"walrus_blob_xyz123",
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, update_cap);
            ts::return_shared(platform);
        };

        // Verify update
        ts::next_tx(&mut scenario, AI_WORKER);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            let new_base = valor::get_base_value(&platform, player_id);
            let blob_id = valor::get_walrus_blob_id(&platform, player_id);
            
            assert!(new_base == 1_200_000_000, 0);
            assert!(blob_id == string::utf8(b"walrus_blob_xyz123"), 1);

            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 9: Slippage Protection Buy ========
    #[test]
    #[expected_failure(abort_code = valor::valor::EPriceSlippage)]
    fun test_slippage_protection_buy() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(100_000_000_000, ts::ctx(&mut scenario));

            // Try to buy with unrealistically low max price
            valor::buy_shares(
                &mut platform,
                player_id,
                100,
                500_000_000, // Max 0.5 SUI per share (too low!)
                payment,
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 10: Rate Limiting ========
    #[test]
    #[expected_failure(abort_code = valor::valor::ETooSoon)]
    fun test_rate_limiting() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // First update
        ts::next_tx(&mut scenario, ADMIN);
        {
            let update_cap = ts::take_from_sender<UpdateCapability>(&scenario);
            let mut platform = ts::take_shared<Platform>(&scenario);
            let mut clock = clock::create_for_testing(ts::ctx(&mut scenario));
            
            clock::increment_for_testing(&mut clock, 86400001);

            valor::update_base_value(
                &mut platform,
                &update_cap,
                1_100_000_000,
                800,
                2,
                1,
                85,
                b"blob1",
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, update_cap);
            ts::return_shared(platform);
        };

        // Second update immediately (should fail)
        ts::next_tx(&mut scenario, ADMIN);
        {
            let update_cap = ts::take_from_sender<UpdateCapability>(&scenario);
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            valor::update_base_value(
                &mut platform,
                &update_cap,
                1_200_000_000,
                850,
                3,
                2,
                90,
                b"blob2",
                &clock,
                ts::ctx(&mut scenario)
            );

            clock::destroy_for_testing(clock);
            ts::return_to_sender(&scenario, update_cap);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 11: Merge Shares ========
    #[test]
    fun test_merge_shares() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // Buy twice
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(150_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(&mut platform, player_id, 100, 2_000_000_000, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(200_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(&mut platform, player_id, 100, 2_000_000_000, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        // Merge
        ts::next_tx(&mut scenario, USER1);
        {
            let ids = ts::ids_for_sender<PlayerShares>(&scenario);
            let mut shares1 = ts::take_from_sender_by_id<PlayerShares>(&scenario, *vector::borrow(&ids, 0));
            let shares2 = ts::take_from_sender_by_id<PlayerShares>(&scenario, *vector::borrow(&ids, 1));

            valor::merge_shares(&mut shares1, shares2);

            assert!(valor::get_share_count(&shares1) == 200, 0);

            ts::return_to_sender(&scenario, shares1);
        };

        ts::end(scenario);
    }

    // ======== TEST 12: Split Shares ========
    #[test]
    fun test_split_shares() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // Buy shares
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(300_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(&mut platform, player_id, 200, 2_000_000_000, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        // Split
        ts::next_tx(&mut scenario, USER1);
        {
            let mut shares_obj = ts::take_from_sender<PlayerShares>(&scenario);

            valor::split_shares(&mut shares_obj, 80, ts::ctx(&mut scenario));

            assert!(valor::get_share_count(&shares_obj) == 120, 0);

            ts::return_to_sender(&scenario, shares_obj);
        };

        // Check we have 2 objects
        ts::next_tx(&mut scenario, USER1);
        {
            let ids = ts::ids_for_sender<PlayerShares>(&scenario);
            assert!(vector::length(&ids) == 2, 0);
        };

        ts::end(scenario);
    }

    // ======== TEST 13: Transfer Shares ========
    #[test]
    fun test_transfer_shares() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // User1 buys
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(200_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(&mut platform, player_id, 100, 2_000_000_000, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        // Transfer to USER2
        ts::next_tx(&mut scenario, USER1);
        {
            let shares_obj = ts::take_from_sender<PlayerShares>(&scenario);
            valor::transfer_shares(shares_obj, USER2, ts::ctx(&mut scenario));
        };

        // USER2 has shares
        ts::next_tx(&mut scenario, USER2);
        {
            assert!(ts::has_most_recent_for_sender<PlayerShares>(&scenario), 0);
            let shares = ts::take_from_sender<PlayerShares>(&scenario);
            assert!(valor::get_share_count(&shares) == 100, 1);
            ts::return_to_sender(&scenario, shares);
        };

        ts::end(scenario);
    }

    // ======== TEST 14: Pause Platform ========
    #[test]
    #[expected_failure(abort_code = valor::valor::EUnauthorized)]
    fun test_pause_platform() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // Admin pauses
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut platform = ts::take_shared<Platform>(&scenario);

            valor::set_pause(&admin_cap, &mut platform, true, ts::ctx(&mut scenario));

            assert!(valor::is_paused(&platform), 0);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(platform);
        };

        // User tries to buy (should fail)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(200_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(&mut platform, player_id, 100, 2_000_000_000, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 15: Valuation Gap ========
    #[test]
    fun test_valuation_gap() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // Buy 500 shares (50% utilization)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(600_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(&mut platform, player_id, 500, 2_000_000_000, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        // Check valuation (market should be 5% above base due to curve)
        ts::next_tx(&mut scenario, USER1);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            let (gap, is_undervalued) = valor::get_valuation_gap(&platform, player_id);
            
            // Market is 5% above base (overvalued)
            assert!(gap == 5, 0); // 5% premium
            assert!(!is_undervalued, 1); // false = overvalued

            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 16: Multiple Players ========
    #[test]
    fun test_multiple_players() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, 200_000_000_000);
        
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);
        let messi_id = get_player_id_from_cap(&mut scenario, ADMIN);

        register_test_player(&mut scenario, b"Ronaldo", b"Al Nassr", b"Forward", RONALDO_BASE_VALUE);
        let ronaldo_id = get_player_id_from_cap(&mut scenario, ADMIN);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            
            assert!(valor::get_player_count(&platform) == 2, 0);
            assert!(valor::get_base_value(&platform, messi_id) == MESSI_BASE_VALUE, 1);
            assert!(valor::get_base_value(&platform, ronaldo_id) == RONALDO_BASE_VALUE, 2);

            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 17: Curve Steepness Update ========
    #[test]
    fun test_curve_steepness_update() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut platform = ts::take_shared<Platform>(&scenario);

            valor::update_curve_steepness(&admin_cap, &mut platform, 2000, ts::ctx(&mut scenario));

            assert!(valor::get_curve_steepness(&platform) == 2000, 0);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 18: Insufficient Liquidity ========
    #[test]
    #[expected_failure(abort_code = valor::valor::EInsufficientLiquidity)]
    fun test_insufficient_liquidity() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, 100_000_000); // Only 0.1 SUI
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // Buy shares (adds to pool)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(200_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(&mut platform, player_id, 100, 2_000_000_000, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        // Try to sell (should fail - not enough in pool)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let shares_obj = ts::take_from_sender<PlayerShares>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));

            valor::sell_shares(&mut platform, shares_obj, 100, 0, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 19: Bonding Curve Math ========
    #[test]
    fun test_bonding_curve_math() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        ts::next_tx(&mut scenario, ADMIN);
        {
            let platform = ts::take_shared<Platform>(&scenario);
            
            // Test different utilization levels
            let base = MESSI_BASE_VALUE;
            
            // 0% circulating
            let price_0 = valor::calculate_market_price(base, 1000, 0, 1000);
            assert!(price_0 == base, 0);
            
            // 25% circulating: premium = 25% × 10% = 2.5%
            let price_25 = valor::calculate_market_price(base, 1000, 250, 1000);
            let expected_25 = (base * 10250) / 10000;
            assert!(price_25 == expected_25, 1);
            
            // 50% circulating: premium = 50% × 10% = 5%
            let price_50 = valor::calculate_market_price(base, 1000, 500, 1000);
            let expected_50 = (base * 10500) / 10000;
            assert!(price_50 == expected_50, 2);
            
            // 100% circulating: premium = 100% × 10% = 10%
            let price_100 = valor::calculate_market_price(base, 1000, 1000, 1000);
            let expected_100 = (base * 11000) / 10000;
            assert!(price_100 == expected_100, 3);

            ts::return_shared(platform);
        };

        ts::end(scenario);
    }

    // ======== TEST 20: Player Deactivation ========
    #[test]
    #[expected_failure(abort_code = valor::valor::EUnauthorized)]
    fun test_player_deactivation() {
        let mut scenario = ts::begin(ADMIN);
        setup_platform(&mut scenario);
        add_initial_liquidity(&mut scenario, INITIAL_LIQUIDITY);
        register_test_player(&mut scenario, b"Messi", b"Miami", b"Forward", MESSI_BASE_VALUE);

        let player_id = get_player_id_from_cap(&mut scenario, ADMIN);

        // Deactivate player
        ts::next_tx(&mut scenario, ADMIN);
        {
            let admin_cap = ts::take_from_sender<AdminCap>(&scenario);
            let mut platform = ts::take_shared<Platform>(&scenario);

            valor::deactivate_player(&admin_cap, &mut platform, player_id, ts::ctx(&mut scenario));

            assert!(!valor::is_player_active(&platform, player_id), 0);

            ts::return_to_sender(&scenario, admin_cap);
            ts::return_shared(platform);
        };

        // Try to buy (should fail)
        ts::next_tx(&mut scenario, USER1);
        {
            let mut platform = ts::take_shared<Platform>(&scenario);
            let clock = clock::create_for_testing(ts::ctx(&mut scenario));
            let payment = coin::mint_for_testing<SUI>(200_000_000_000, ts::ctx(&mut scenario));

            valor::buy_shares(&mut platform, player_id, 100, 2_000_000_000, payment, &clock, ts::ctx(&mut scenario));

            clock::destroy_for_testing(clock);
            ts::return_shared(platform);
        };

        ts::end(scenario);
    }
}