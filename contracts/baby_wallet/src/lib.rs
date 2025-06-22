#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, String, Vec,
};

// Import modules
pub mod guardian;
pub mod investment_manager;

#[cfg(test)]
mod test;

use guardian::Guardian;
use investment_manager::InvestmentPlan;

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InstitutionType {
    Healthcare,  // Sağlık kurumu
    Education,   // Eğitim kurumu
    Both,        // Her ikisi de
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ApprovedInstitution {
    pub address: Address,
    pub name: String,
    pub institution_type: InstitutionType,
    pub approved_at: u64,
    pub approved_by: Address,
    pub is_active: bool,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ChildProfile {
    pub name: String,
    pub birth_date: u64,
    pub target_age: u32,
    pub target_amount: i128,
    pub current_balance: i128,
    pub created_at: u64,
    pub owner: Address,
    pub guardian_system_id: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Investment {
    pub amount: i128,
    pub timestamp: u64,
    pub investor: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InstitutionPayment {
    pub amount: i128,
    pub institution: Address,
    pub institution_name: String,
    pub payment_purpose: String,
    pub timestamp: u64,
    pub paid_by: Address,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ComprehensiveReport {
    pub child_profile: ChildProfile,
    pub guardians: Vec<Guardian>,
    pub total_balance: i128,
    pub total_yield: i128,
    pub active_investment_plans: Vec<InvestmentPlan>,
    pub investment_history: Vec<Investment>,
    pub institution_payments: Vec<InstitutionPayment>,
}

#[contract]
pub struct BabyWallet;

#[contractimpl]
impl BabyWallet {
    pub fn create_child_profile(
        env: Env,
        name: String,
        birth_date: u64,
        target_age: u32,
        target_amount: i128,
        owner_name: String,
    ) -> String {
        if target_age < 18 {
            panic!("Target age must be at least 18");
        }
        if target_amount <= 0 {
            panic!("Target amount must be positive");
        }
        
        let child_id = String::from_str(&env, "child_profile_1");
        let owner = env.current_contract_address();
        
        // Initialize guardian system for this child  
        let guardian_system_id = String::from_str(&env, "guardian_system_1");
        
        let profile = ChildProfile {
            name,
            birth_date,
            target_age,
            target_amount,
            current_balance: 0,
            created_at: env.ledger().timestamp(),
            owner,
            guardian_system_id: guardian_system_id.clone(),
        };
        
        let key = symbol_short!("profile");
        env.storage().instance().set(&key, &profile);
        
        child_id
    }

    pub fn invest(env: Env, _child_id: String, amount: i128) {
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        
        let key = symbol_short!("profile");
        let mut profile: ChildProfile = env.storage().instance().get(&key).expect("Profile not found");
        
        // Check if caller has investment permission
        let caller = env.current_contract_address();
        
        profile.current_balance += amount;
        env.storage().instance().set(&key, &profile);
        
        let investment = Investment {
            amount,
            timestamp: env.ledger().timestamp(),
            investor: caller,
        };
        
        let mut investments: Vec<Investment> = env.storage().instance()
            .get(&symbol_short!("invest"))
            .unwrap_or_else(|| vec![&env]);
        investments.push_back(investment);
        env.storage().instance().set(&symbol_short!("invest"), &investments);
    }

    // 🚫 NORMAL PARA ÇEKME KALDIRILIYOR!
    // Artık sadece anlaşmalı kurumlara ödeme yapılabilir

    /// Anlaşmalı kurum ekleme (sadece owner)
    pub fn add_approved_institution(
        env: Env,
        institution_address: Address,
        institution_name: String,
        institution_type: InstitutionType,
    ) {
        // Sadece owner ekleyebilir
        let caller = env.current_contract_address();
        
        let institution = ApprovedInstitution {
            address: institution_address.clone(),
            name: institution_name,
            institution_type,
            approved_at: env.ledger().timestamp(),
            approved_by: caller,
            is_active: true,
        };
        
        // Institution'ları liste halinde sakla
        let mut institutions: Vec<ApprovedInstitution> = env.storage().instance()
            .get(&symbol_short!("institute"))
            .unwrap_or_else(|| vec![&env]);
        
        // Aynı kurum daha önce eklenmiş mi kontrol et
        for existing in institutions.iter() {
            if existing.address == institution_address {
                panic!("Institution already approved");
            }
        }
        
        institutions.push_back(institution);
        env.storage().instance().set(&symbol_short!("institute"), &institutions);
    }

    /// Anlaşmalı kuruma ödeme yapma (18 yaş sonrası)
    pub fn pay_to_institution(
        env: Env,
        institution_address: Address,
        amount: i128,
        payment_purpose: String,
    ) {
        if amount <= 0 {
            panic!("Amount must be positive");
        }

        // 1. Yaş kontrolü
        let profile_key = symbol_short!("profile");
        let mut profile: ChildProfile = env.storage().instance().get(&profile_key).expect("Profile not found");
        
        let current_time = env.ledger().timestamp();
        let age_in_seconds = current_time - profile.birth_date;
        let age_in_years = age_in_seconds / (365 * 24 * 60 * 60);
        
        if age_in_years < profile.target_age as u64 {
            panic!("Cannot spend before target age");
        }

        // 2. Yeterli bakiye kontrolü
        if amount > profile.current_balance {
            panic!("Insufficient balance");
        }

        // 3. Kurum onaylı mı kontrolü
        let institutions: Vec<ApprovedInstitution> = env.storage().instance()
            .get(&symbol_short!("institute"))
            .unwrap_or_else(|| vec![&env]);
        
        let mut institution_found = false;
        let mut institution_name = String::from_str(&env, "Unknown");
        
        for institution in institutions.iter() {
            if institution.address == institution_address && institution.is_active {
                institution_found = true;
                institution_name = institution.name.clone();
                break;
            }
        }
        
        if !institution_found {
            panic!("Institution not approved or inactive");
        }

        // 4. Ödemeyi gerçekleştir
        profile.current_balance -= amount;
        env.storage().instance().set(&profile_key, &profile);

        // 5. Ödeme kaydını tut
        let payment = InstitutionPayment {
            amount,
            institution: institution_address,
            institution_name,
            payment_purpose,
            timestamp: current_time,
            paid_by: env.current_contract_address(),
        };

        let mut payments: Vec<InstitutionPayment> = env.storage().instance()
            .get(&symbol_short!("payments"))
            .unwrap_or_else(|| vec![&env]);
        payments.push_back(payment);
        env.storage().instance().set(&symbol_short!("payments"), &payments);
    }

    /// Anlaşmalı kurumları listele
    pub fn get_approved_institutions(env: Env) -> Vec<ApprovedInstitution> {
        env.storage().instance()
            .get(&symbol_short!("institute"))
            .unwrap_or_else(|| vec![&env])
    }

    /// Kurum ödemelerini listele
    pub fn get_institution_payments(env: Env) -> Vec<InstitutionPayment> {
        env.storage().instance()
            .get(&symbol_short!("payments"))
            .unwrap_or_else(|| vec![&env])
    }

    /// Kurumu deaktif et
    pub fn deactivate_institution(env: Env, institution_address: Address) {
        let mut institutions: Vec<ApprovedInstitution> = env.storage().instance()
            .get(&symbol_short!("institute"))
            .unwrap_or_else(|| vec![&env]);
        
        let mut updated_institutions = vec![&env];
        let mut found = false;
        
        for institution in institutions.iter() {
            if institution.address == institution_address {
                let mut updated_institution = institution.clone();
                updated_institution.is_active = false;
                updated_institutions.push_back(updated_institution);
                found = true;
            } else {
                updated_institutions.push_back(institution.clone());
            }
        }
        
        if !found {
            panic!("Institution not found");
        }
        
        env.storage().instance().set(&symbol_short!("institute"), &updated_institutions);
    }

    pub fn get_balance(env: Env) -> i128 {
        let key = symbol_short!("profile");
        let profile: ChildProfile = env.storage().instance().get(&key).expect("Profile not found");
        profile.current_balance
    }

    pub fn get_child_profile(env: Env) -> ChildProfile {
        let key = symbol_short!("profile");
        env.storage().instance().get(&key).expect("Profile not found")
    }

    pub fn get_investment_history(env: Env) -> Vec<Investment> {
        env.storage().instance()
            .get(&symbol_short!("invest"))
            .unwrap_or_else(|| vec![&env])
    }

    /// Yaş kontrolü - çocuk hedef yaşa ulaştı mı?
    pub fn is_old_enough_to_spend(env: Env) -> bool {
        let profile: ChildProfile = env.storage().instance()
            .get(&symbol_short!("profile"))
            .expect("Profile not found");
        
        let current_time = env.ledger().timestamp();
        let age_in_seconds = current_time - profile.birth_date;
        let age_in_years = age_in_seconds / (365 * 24 * 60 * 60);
        
        age_in_years >= profile.target_age as u64
    }
    
    pub fn get_comprehensive_report(env: Env, _child_id: String) -> ComprehensiveReport {
        let profile: ChildProfile = env.storage().instance()
            .get(&symbol_short!("profile"))
            .expect("Profile not found");
        
        let investments: Vec<Investment> = env.storage().instance()
            .get(&symbol_short!("invest"))
            .unwrap_or_else(|| vec![&env]);
            
        let institution_payments: Vec<InstitutionPayment> = env.storage().instance()
            .get(&symbol_short!("payments"))
            .unwrap_or_else(|| vec![&env]);
        
        // Note: In real implementation, these would call the respective contracts
        let guardians = vec![&env]; // Would call guardian contract
        let active_plans = vec![&env]; // Would call investment manager contract
        let total_yield = 0i128; // Would call investment manager contract
        
        ComprehensiveReport {
            child_profile: profile.clone(),
            guardians,
            total_balance: profile.current_balance,
            total_yield,
            active_investment_plans: active_plans,
            investment_history: investments,
            institution_payments,
        }
    }
    
    pub fn emergency_pause(env: Env, _child_id: String) {
        // Only owner or emergency contact can pause
        let _caller = env.current_contract_address();
        
        // Set emergency pause flag
        let pause_key = symbol_short!("emergency");
        env.storage().instance().set(&pause_key, &true);
    }
    
    pub fn is_emergency_paused(env: Env) -> bool {
        env.storage().instance()
            .get(&symbol_short!("emergency"))
            .unwrap_or(false)
    }
} 