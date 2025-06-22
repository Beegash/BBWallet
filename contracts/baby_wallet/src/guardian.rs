use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, String, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum GuardianRole {
    Owner,
    Viewer,
    Investor,
    Withdrawer,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Guardian {
    pub address: Address,
    pub name: String,
    pub role: GuardianRole,
    pub added_at: u64,
    pub added_by: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct GuardianSystem {
    pub child_id: String,
    pub guardians: Vec<Guardian>,
    pub required_approvals: u32,
}

#[contract]
pub struct GuardianContract;

#[contractimpl]
impl GuardianContract {
    pub fn initialize(env: Env, child_id: String, owner: Address, owner_name: String) {
        let owner_guardian = Guardian {
            address: owner.clone(),
            name: owner_name,
            role: GuardianRole::Owner,
            added_at: env.ledger().timestamp(),
            added_by: owner.clone(),
        };
        
        let system = GuardianSystem {
            child_id: child_id.clone(),
            guardians: vec![&env, owner_guardian],
            required_approvals: 1,
        };
        
        env.storage().instance().set(&symbol_short!("system"), &system);
    }
    
    pub fn add_guardian(
        env: Env,
        guardian_address: Address,
        guardian_name: String,
        role: GuardianRole,
    ) {
        let caller = env.current_contract_address();
        Self::require_owner_permission(&env, &caller);
        
        let mut system: GuardianSystem = env.storage().instance()
            .get(&symbol_short!("system"))
            .expect("Guardian system not initialized");
        
        // Check if guardian already exists
        for guardian in system.guardians.iter() {
            if guardian.address == guardian_address {
                panic!("Guardian already exists");
            }
        }
        
        let new_guardian = Guardian {
            address: guardian_address,
            name: guardian_name,
            role,
            added_at: env.ledger().timestamp(),
            added_by: caller,
        };
        
        system.guardians.push_back(new_guardian);
        env.storage().instance().set(&symbol_short!("system"), &system);
    }
    
    pub fn remove_guardian(env: Env, guardian_address: Address) {
        let caller = env.current_contract_address();
        Self::require_owner_permission(&env, &caller);
        
        let mut system: GuardianSystem = env.storage().instance()
            .get(&symbol_short!("system"))
            .expect("Guardian system not initialized");
        
        let mut found_index = None;
        for (i, guardian) in system.guardians.iter().enumerate() {
            if guardian.address == guardian_address {
                // Cannot remove owner
                if matches!(guardian.role, GuardianRole::Owner) {
                    panic!("Cannot remove owner");
                }
                found_index = Some(i);
                break;
            }
        }
        
        if let Some(index) = found_index {
            system.guardians.remove(index as u32);
            env.storage().instance().set(&symbol_short!("system"), &system);
        } else {
            panic!("Guardian not found");
        }
    }
    
    pub fn update_guardian_role(env: Env, guardian_address: Address, new_role: GuardianRole) {
        let caller = env.current_contract_address();
        Self::require_owner_permission(&env, &caller);
        
        let mut system: GuardianSystem = env.storage().instance()
            .get(&symbol_short!("system"))
            .expect("Guardian system not initialized");
        
        let mut found = false;
        let mut updated_guardians = vec![&env];
        
        for guardian in system.guardians.iter() {
            if guardian.address == guardian_address {
                // Cannot change owner role
                if matches!(guardian.role, GuardianRole::Owner) {
                    panic!("Cannot change owner role");
                }
                let mut updated_guardian = guardian.clone();
                updated_guardian.role = new_role.clone();
                updated_guardians.push_back(updated_guardian);
                found = true;
            } else {
                updated_guardians.push_back(guardian.clone());
            }
        }
        
        if !found {
            panic!("Guardian not found");
        }
        
        system.guardians = updated_guardians;
        env.storage().instance().set(&symbol_short!("system"), &system);
    }
    
    pub fn check_permission(env: Env, address: Address, required_role: GuardianRole) -> bool {
        let system: GuardianSystem = env.storage().instance()
            .get(&symbol_short!("system"))
            .expect("Guardian system not initialized");
        
        for guardian in system.guardians.iter() {
            if guardian.address == address {
                return match (&guardian.role, &required_role) {
                    (GuardianRole::Owner, _) => true,
                    (GuardianRole::Withdrawer, GuardianRole::Withdrawer) => true,
                    (GuardianRole::Investor, GuardianRole::Investor) => true,
                    (GuardianRole::Investor, GuardianRole::Viewer) => true,
                    (GuardianRole::Withdrawer, GuardianRole::Viewer) => true,
                    (GuardianRole::Withdrawer, GuardianRole::Investor) => true,
                    (GuardianRole::Viewer, GuardianRole::Viewer) => true,
                    _ => false,
                };
            }
        }
        false
    }
    
    pub fn get_guardians(env: Env) -> Vec<Guardian> {
        let system: GuardianSystem = env.storage().instance()
            .get(&symbol_short!("system"))
            .expect("Guardian system not initialized");
        system.guardians
    }
    
    pub fn set_required_approvals(env: Env, required: u32) {
        let caller = env.current_contract_address();
        Self::require_owner_permission(&env, &caller);
        
        let mut system: GuardianSystem = env.storage().instance()
            .get(&symbol_short!("system"))
            .expect("Guardian system not initialized");
        
        if required == 0 || required > system.guardians.len() as u32 {
            panic!("Invalid required approvals count");
        }
        
        system.required_approvals = required;
        env.storage().instance().set(&symbol_short!("system"), &system);
    }
    
    fn require_owner_permission(env: &Env, caller: &Address) {
        let system: GuardianSystem = env.storage().instance()
            .get(&symbol_short!("system"))
            .expect("Guardian system not initialized");
        
        for guardian in system.guardians.iter() {
            if guardian.address == *caller && matches!(guardian.role, GuardianRole::Owner) {
                return;
            }
        }
        panic!("Only owner can perform this action");
    }
} 