#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contract]
pub struct SorobonProject;

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Guardian(Address),
    BirthYear(Address),
    IsUnlocked(Address),
    Balance(Address),
}

#[contractimpl]
impl SorobonProject {
    pub fn create_wallet(env: Env, child: Address, guardian: Address, birth_year: u32) {
        guardian.require_auth();

        let storage = env.storage().persistent();
        storage.set(&DataKey::Guardian(child.clone()), &guardian);
        storage.set(&DataKey::BirthYear(child.clone()), &birth_year);
        storage.set(&DataKey::IsUnlocked(child.clone()), &false);
        storage.set(&DataKey::Balance(child.clone()), &0i128);
    }

    pub fn get_wallet(env: Env, child: Address) -> (Address, u32, bool, i128) {
        let storage = env.storage().persistent();

        let guardian: Address = storage.get(&DataKey::Guardian(child.clone())).unwrap();
        let birth_year: u32 = storage.get(&DataKey::BirthYear(child.clone())).unwrap();
        let is_unlocked: bool = storage.get(&DataKey::IsUnlocked(child.clone())).unwrap();
        let balance: i128 = storage.get(&DataKey::Balance(child.clone())).unwrap();

        (guardian, birth_year, is_unlocked, balance)
    }
}
