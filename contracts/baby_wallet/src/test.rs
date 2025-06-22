#![cfg(test)]

use super::*;
use soroban_sdk::{Env, String, Address};

#[test]
fn test_basic_functionality() {
    let env = Env::default();
    let contract_id = env.register_contract(None, BabyWallet);
    let client = BabyWalletClient::new(&env, &contract_id);

    let child_name = String::from_str(&env, "Test Child");
    let birth_date = 1000000000u64;
    let target_age = 18u32;
    let target_amount = 100000i128;
    let owner_name = String::from_str(&env, "Test Parent");

    // Test child profile creation
    let _child_id = client.create_child_profile(
        &child_name,
        &birth_date,
        &target_age,
        &target_amount,
        &owner_name,
    );

    // Test getting the profile
    let profile = client.get_child_profile();
    assert_eq!(profile.name, child_name);
    assert_eq!(profile.birth_date, birth_date);
    assert_eq!(profile.target_age, target_age);
    assert_eq!(profile.target_amount, target_amount);
    assert_eq!(profile.current_balance, 0);
}

#[test]
fn test_balance_operations() {
    let env = Env::default();
    let contract_id = env.register_contract(None, BabyWallet);
    let client = BabyWalletClient::new(&env, &contract_id);

    let child_name = String::from_str(&env, "Test Child");
    let child_id = client.create_child_profile(
        &child_name,
        &1000000000u64,
        &18u32,
        &100000i128,
        &String::from_str(&env, "Owner"),
    );

    // Initial balance should be 0
    assert_eq!(client.get_balance(), 0);

    // Test investment
    client.invest(&child_id, &1000i128);
    assert_eq!(client.get_balance(), 1000);

    // Test another investment
    client.invest(&child_id, &500i128);
    assert_eq!(client.get_balance(), 1500);
}

#[test]
fn test_institution_management() {
    let env = Env::default();
    let contract_id = env.register_contract(None, BabyWallet);
    let client = BabyWalletClient::new(&env, &contract_id);

    let child_name = String::from_str(&env, "Test Child");
    let _child_id = client.create_child_profile(
        &child_name,
        &1000000000u64,
        &18u32,
        &100000i128,
        &String::from_str(&env, "Owner"),
    );

    // Test adding approved institution
    let hospital_address = Address::generate(&env);
    let hospital_name = String::from_str(&env, "Test Hospital");
    
    client.add_approved_institution(
        &hospital_address,
        &hospital_name,
        &InstitutionType::Healthcare,
    );

    // Check institutions list
    let institutions = client.get_approved_institutions();
    assert_eq!(institutions.len(), 1);
    assert_eq!(institutions.get(0).unwrap().name, hospital_name);
}

#[test]
fn test_age_check() {
    let env = Env::default();
    let contract_id = env.register_contract(None, BabyWallet);
    let client = BabyWalletClient::new(&env, &contract_id);

    let child_name = String::from_str(&env, "Test Child");
    
    // Create child profile with birth date that makes them under 18
    let recent_birth = env.ledger().timestamp() - (10 * 365 * 24 * 60 * 60); // 10 years old
    
    let _child_id = client.create_child_profile(
        &child_name,
        &recent_birth,
        &18u32,
        &100000i128,
        &String::from_str(&env, "Owner"),
    );

    // Child should not be old enough to spend
    assert!(!client.is_old_enough_to_spend());
}

#[test]
fn test_emergency_functions() {
    let env = Env::default();
    let contract_id = env.register_contract(None, BabyWallet);
    let client = BabyWalletClient::new(&env, &contract_id);

    let child_name = String::from_str(&env, "Test Child");
    let child_id = client.create_child_profile(
        &child_name,
        &1000000000u64,
        &18u32,
        &100000i128,
        &String::from_str(&env, "Owner"),
    );

    // Initially not paused
    assert!(!client.is_emergency_paused());

    // Test emergency pause
    client.emergency_pause(&child_id);
    assert!(client.is_emergency_paused());
} 