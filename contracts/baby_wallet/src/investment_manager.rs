use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, vec, Address, Env, String, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InvestmentType {
    OneTime,
    Weekly,
    Monthly,
    Quarterly,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum InvestmentStatus {
    Active,
    Paused,
    Completed,
    Cancelled,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InvestmentPlan {
    pub id: String,
    pub child_id: String,
    pub investor: Address,
    pub plan_type: InvestmentType,
    pub amount_per_period: i128,
    pub total_periods: u32,
    pub completed_periods: u32,
    pub next_payment_date: u64,
    pub status: InvestmentStatus,
    pub created_at: u64,
    pub last_payment: u64,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct YieldRecord {
    pub child_id: String,
    pub yield_amount: i128,
    pub yield_rate: i128, // Basis points (100 = 1%)
    pub generated_at: u64,
    pub source: String, // DeFi protocol name
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct InvestmentStrategy {
    pub child_id: String,
    pub stablecoin_allocation: u32, // Percentage
    pub defi_allocation: u32, // Percentage
    pub auto_compound: bool,
    pub risk_level: u32, // 1-5 scale
    pub preferred_protocols: Vec<String>,
}

#[contract]
pub struct InvestmentManager;

#[contractimpl]
impl InvestmentManager {
    pub fn create_investment_plan(
        env: Env,
        child_id: String,
        plan_type: InvestmentType,
        amount_per_period: i128,
        total_periods: u32,
    ) -> String {
        if amount_per_period <= 0 {
            panic!("Amount must be positive");
        }
        if total_periods == 0 {
            panic!("Total periods must be greater than 0");
        }
        
        let plan_id = String::from_str(&env, "investment_plan_1");
        let current_time = env.ledger().timestamp();
        
        let next_payment = match plan_type {
            InvestmentType::OneTime => current_time,
            InvestmentType::Weekly => current_time + (7 * 24 * 60 * 60),
            InvestmentType::Monthly => current_time + (30 * 24 * 60 * 60),
            InvestmentType::Quarterly => current_time + (90 * 24 * 60 * 60),
        };
        
        let plan = InvestmentPlan {
            id: plan_id.clone(),
            child_id,
            investor: env.current_contract_address(),
            plan_type,
            amount_per_period,
            total_periods,
            completed_periods: 0,
            next_payment_date: next_payment,
            status: InvestmentStatus::Active,
            created_at: current_time,
            last_payment: 0,
        };
        
        env.storage().instance().set(&symbol_short!("plan"), &plan);
        
        // Add to plans list
        let mut plans: Vec<String> = env.storage().instance()
            .get(&symbol_short!("plans"))
            .unwrap_or_else(|| vec![&env]);
        plans.push_back(plan_id.clone());
        env.storage().instance().set(&symbol_short!("plans"), &plans);
        
        plan_id
    }
    
    pub fn execute_scheduled_payment(env: Env, plan_id: String) {
        let plan_key = symbol_short!("plan");
        let mut plan: InvestmentPlan = env.storage().instance()
            .get(&plan_key)
            .expect("Investment plan not found");
        
        if plan.id != plan_id {
            panic!("Plan ID mismatch");
        }
        
        if plan.status != InvestmentStatus::Active {
            panic!("Plan is not active");
        }
        
        let current_time = env.ledger().timestamp();
        if current_time < plan.next_payment_date {
            panic!("Payment not due yet");
        }
        
        if plan.completed_periods >= plan.total_periods {
            plan.status = InvestmentStatus::Completed;
        } else {
            plan.completed_periods += 1;
            plan.last_payment = current_time;
            
            // Calculate next payment date
            plan.next_payment_date = match plan.plan_type {
                InvestmentType::OneTime => 0,
                InvestmentType::Weekly => current_time + (7 * 24 * 60 * 60),
                InvestmentType::Monthly => current_time + (30 * 24 * 60 * 60),
                InvestmentType::Quarterly => current_time + (90 * 24 * 60 * 60),
            };
            
            if plan.completed_periods >= plan.total_periods {
                plan.status = InvestmentStatus::Completed;
            }
        }
        
        env.storage().instance().set(&plan_key, &plan);
    }
    
    pub fn set_investment_strategy(
        env: Env,
        child_id: String,
        stablecoin_allocation: u32,
        defi_allocation: u32,
        auto_compound: bool,
        risk_level: u32,
        preferred_protocols: Vec<String>,
    ) {
        if stablecoin_allocation + defi_allocation != 100 {
            panic!("Allocations must sum to 100%");
        }
        if risk_level == 0 || risk_level > 5 {
            panic!("Risk level must be between 1-5");
        }
        
        let strategy = InvestmentStrategy {
            child_id: child_id.clone(),
            stablecoin_allocation,
            defi_allocation,
            auto_compound,
            risk_level,
            preferred_protocols,
        };
        
        let key = symbol_short!("strategy");
        env.storage().instance().set(&key, &strategy);
    }
    
    pub fn record_yield(
        env: Env,
        child_id: String,
        yield_amount: i128,
        yield_rate: i128,
        source: String,
    ) {
        if yield_amount <= 0 {
            panic!("Yield amount must be positive");
        }
        
        let yield_record = YieldRecord {
            child_id: child_id.clone(),
            yield_amount,
            yield_rate,
            generated_at: env.ledger().timestamp(),
            source,
        };
        
        // Add to yield history
        let mut yields: Vec<YieldRecord> = env.storage().instance()
            .get(&symbol_short!("yields"))
            .unwrap_or_else(|| vec![&env]);
        yields.push_back(yield_record);
        env.storage().instance().set(&symbol_short!("yields"), &yields);
    }
    
    pub fn get_total_yield(env: Env, child_id: String) -> i128 {
        let yields: Vec<YieldRecord> = env.storage().instance()
            .get(&symbol_short!("yields"))
            .unwrap_or_else(|| vec![&env]);
        
        let mut total = 0i128;
        for yield_record in yields.iter() {
            if yield_record.child_id == child_id {
                total += yield_record.yield_amount;
            }
        }
        total
    }
    
    pub fn get_investment_plan(env: Env, plan_id: String) -> InvestmentPlan {
        let plans: Vec<String> = env.storage().instance()
            .get(&symbol_short!("plans"))
            .unwrap_or_else(|| vec![&env]);
        
        for stored_plan_id in plans.iter() {
            if stored_plan_id == plan_id {
                return env.storage().instance()
                    .get(&symbol_short!("plan"))
                    .expect("Plan not found");
            }
        }
        panic!("Investment plan not found");
    }
    
    pub fn get_active_plans(env: Env, child_id: String) -> Vec<InvestmentPlan> {
        let plans: Vec<String> = env.storage().instance()
            .get(&symbol_short!("plans"))
            .unwrap_or_else(|| vec![&env]);
        
        let mut active_plans = vec![&env];
        for _plan_id in plans.iter() {
            // Simple version - would need proper plan retrieval logic
            if let Some(plan) = env.storage().instance().get::<_, InvestmentPlan>(&symbol_short!("plan")) {
                if plan.child_id == child_id && plan.status == InvestmentStatus::Active {
                    active_plans.push_back(plan);
                }
            }
        }
        active_plans
    }
    
    pub fn pause_investment_plan(env: Env, plan_id: String) {
        let plan_key = symbol_short!("plan");
        let mut plan: InvestmentPlan = env.storage().instance()
            .get(&plan_key)
            .expect("Investment plan not found");
        
        if plan.id != plan_id {
            panic!("Plan ID mismatch");
        }
        
        if plan.status != InvestmentStatus::Active {
            panic!("Plan is not active");
        }
        
        plan.status = InvestmentStatus::Paused;
        env.storage().instance().set(&plan_key, &plan);
    }
    
    pub fn resume_investment_plan(env: Env, plan_id: String) {
        let plan_key = symbol_short!("plan");
        let mut plan: InvestmentPlan = env.storage().instance()
            .get(&plan_key)
            .expect("Investment plan not found");
        
        if plan.id != plan_id {
            panic!("Plan ID mismatch");
        }
        
        if plan.status != InvestmentStatus::Paused {
            panic!("Plan is not paused");
        }
        
        plan.status = InvestmentStatus::Active;
        env.storage().instance().set(&plan_key, &plan);
    }
    
    pub fn get_investment_strategy(env: Env, _child_id: String) -> InvestmentStrategy {
        env.storage().instance()
            .get(&symbol_short!("strategy"))
            .expect("Investment strategy not found")
    }
    
    pub fn get_yield_history(env: Env, child_id: String) -> Vec<YieldRecord> {
        let yields: Vec<YieldRecord> = env.storage().instance()
            .get(&symbol_short!("yields"))
            .unwrap_or_else(|| vec![&env]);
        
        let mut child_yields = vec![&env];
        for yield_record in yields.iter() {
            if yield_record.child_id == child_id {
                child_yields.push_back(yield_record.clone());
            }
        }
        child_yields
    }
} 