// Baby Wallet - Main JavaScript File

// Global variables
let currentTheme = 'light';
let confettiInstance = null;

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main application state
const AppState = {
    isLoggedIn: false,
    authToken: null,
    currentUser: null,
};

// Initialize the application
async function initializeApp() {
    setupThemeToggle();
    setupNavigation();
    setupModals();
    setupFAQ();
    setupInvestmentForm();
    setupCharts();
    setupWalletConnection();
    setupContractCreation();
    setupLogout();
    loadTheme();
    setupAddChild();
    setupProfileNavigation();
    
    // Check if user is already logged in
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        AppState.authToken = authToken;
        AppState.isLoggedIn = true;
        await fetchUserInfo();
        await fetchChildren();
    } else {
        // Redirect to login page if not logged in
        window.location.href = '/login/';
        return;
    }
}

// Theme Management
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            toggleTheme();
        });
    }
}

function toggleTheme() {
    const body = document.body;
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');

    if (body.classList.contains('light')) {
        // Switch to dark theme
        body.classList.remove('light');
        body.classList.add('dark');
        currentTheme = 'dark';
        if (moonIcon) moonIcon.classList.add('hidden');
        if (sunIcon) sunIcon.classList.remove('hidden');
    } else {
        // Switch to light theme
        body.classList.remove('dark');
        body.classList.add('light');
        currentTheme = 'light';
        if (moonIcon) moonIcon.classList.remove('hidden');
        if (sunIcon) sunIcon.classList.add('hidden');
    }

    localStorage.setItem('theme', currentTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const body = document.body;
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');

    currentTheme = savedTheme;

    if (savedTheme === 'dark') {
        body.classList.remove('light');
        body.classList.add('dark');
        if (moonIcon) moonIcon.classList.add('hidden');
        if (sunIcon) sunIcon.classList.remove('hidden');
    } else {
        body.classList.remove('dark');
        body.classList.add('light');
        if (moonIcon) moonIcon.classList.remove('hidden');
        if (sunIcon) sunIcon.classList.add('hidden');
    }
}

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            
            if (targetId === 'profiles') {
                showProfilesPage();
            } else {
                showPage(targetId);
            }
            updateActiveNavLink(this);
        });
    });
}

function showPage(pageId) {
    // Hide all pages
    const pages = ['dashboard', 'investment', 'profiles', 'faq'];
    pages.forEach(page => {
        const element = document.getElementById(page);
        if (element) {
            element.classList.add('hidden');
        }
    });

    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.remove('hidden');
        if (pageId === 'profiles') {
            // Default to list view when showing profiles page
            document.getElementById('child-list-view').classList.remove('hidden');
            document.getElementById('child-detail-view').classList.add('hidden');
        } else if (pageId === 'investment') {
            // Load investment history when showing investment page
            loadInvestmentHistory();
            targetPage.classList.add('slide-in');
        } else {
             targetPage.classList.add('slide-in');
        }
    }
}

function updateActiveNavLink(activeLink) {
    // Remove active class from all nav links
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.classList.remove('nav-active');
        link.classList.add('nav-inactive');
    });

    // Add active class to clicked link
    activeLink.classList.remove('nav-inactive');
    activeLink.classList.add('nav-active');
}

// Modal Management
function setupModals() {
    // Wallet Modal
    const walletButtons = document.querySelectorAll('#connect-wallet-sidebar, button[class*="connect"]');
    const walletModal = document.getElementById('wallet-modal');
    const closeWalletModal = document.getElementById('close-wallet-modal');

    walletButtons.forEach(button => {
        button.addEventListener('click', function() {
            walletModal.classList.remove('hidden');
        });
    });

    closeWalletModal.addEventListener('click', function() {
        walletModal.classList.add('hidden');
    });

    // Contract Modal
    const contractModal = document.getElementById('contract-modal');
    const closeContractModal = document.getElementById('close-contract-modal');

    closeContractModal.addEventListener('click', function() {
        contractModal.classList.add('hidden');
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === walletModal) {
            walletModal.classList.add('hidden');
        }
        if (e.target === contractModal) {
            contractModal.classList.add('hidden');
        }
        if (e.target === document.getElementById('add-child-modal')) {
            document.getElementById('add-child-modal').classList.add('hidden');
        }
    });
}

// FAQ Accordion
function setupFAQ() {
    const faqToggles = document.querySelectorAll('.faq-toggle');
    
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const content = document.getElementById(targetId);
            const arrow = this.querySelector('.faq-arrow');
            
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                arrow.style.transform = 'rotate(180deg)';
            } else {
                content.classList.add('hidden');
                arrow.style.transform = 'rotate(0deg)';
            }
        });
    });
}

// Investment Form
function setupInvestmentForm() {
    const investmentTypeRadios = document.querySelectorAll('input[name="investment-type"]');
    const recurringOptions = document.getElementById('recurring-options');
    const createContractBtn = document.getElementById('create-contract-btn');
    const contractModal = document.getElementById('contract-modal');
    const investmentForm = document.querySelector('#investment form');

    investmentTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'recurring' || this.id === 'recurring') {
                recurringOptions.classList.remove('hidden');
            } else {
                recurringOptions.classList.add('hidden');
            }
        });
    });

    // Investment form submit handler
    if (investmentForm) {
        investmentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleInvestmentSubmit();
        });
    }

    createContractBtn.addEventListener('click', function() {
        contractModal.classList.remove('hidden');
    });

    // Investment estimator sliders
    const investmentAmountSlider = document.getElementById('investment-amount');
    const yearsSlider = document.getElementById('years');
    
    if (investmentAmountSlider) {
        investmentAmountSlider.addEventListener('input', updateInvestmentEstimate);
    }
    
    if (yearsSlider) {
        yearsSlider.addEventListener('input', updateInvestmentEstimate);
    }

    // Load children for dropdown
    loadChildrenForInvestment();
}

async function handleInvestmentSubmit() {
    const childSelect = document.getElementById('child-select');
    const amountInput = document.getElementById('amount');
    const investmentTypeRadios = document.querySelectorAll('input[name="investment-type"]');
    const frequencySelect = document.getElementById('frequency');
    
    // Get form values
    const childId = childSelect.value;
    const amount = parseFloat(amountInput.value);
    let investmentType = 'one_time';
    let frequency = null;
    
    // Get selected investment type
    investmentTypeRadios.forEach(radio => {
        if (radio.checked) {
            investmentType = radio.id === 'recurring' ? 'recurring' : 'one_time';
        }
    });
    
    // Get frequency if recurring
    if (investmentType === 'recurring') {
        frequency = frequencySelect.value.toLowerCase();
    }
    
    // Validate form
    if (!childId || !amount || amount <= 0) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    try {
        // Show loading state
        const submitBtn = document.getElementById('submit-investment-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating Investment...';
        submitBtn.disabled = true;
        
        // Prepare investment data
        const investmentData = {
            child: parseInt(childId),
            amount: amount.toString(),
            investment_type: investmentType,
            start_date: new Date().toISOString().split('T')[0]
        };
        
        if (frequency) {
            investmentData.frequency = frequency;
        }
        
        console.log('Sending investment data:', investmentData);
        
        // Submit to API
        const response = await fetchWithAuth('/api/investments/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(investmentData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Failed to create investment');
        }
        
        const result = await response.json();
        
        // Show success message
        showNotification('Investment created successfully!', 'success');
        
        // Reset form
        document.querySelector('#investment form').reset();
        
        // Update dashboard stats and investment history
        await loadDashboardStats();
        await loadInvestmentHistory();
        await loadTransactionHistory();
        
        // Show contract modal for blockchain interaction
        const contractModal = document.getElementById('contract-modal');
        if (contractModal) {
            contractModal.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('Investment creation failed:', error);
        showNotification(error.message || 'Failed to create investment', 'error');
    } finally {
        // Reset button state
        const submitBtn = document.getElementById('submit-investment-btn');
        submitBtn.textContent = 'Create Investment';
        submitBtn.disabled = false;
    }
}

async function loadChildrenForInvestment() {
    try {
        const response = await fetchWithAuth('/api/children/');
        if (!response.ok) {
            throw new Error('Failed to fetch children');
        }
        
        const children = await response.json();
        const childSelect = document.getElementById('child-select');
        
        if (childSelect && children.length > 0) {
            // Clear existing options
            childSelect.innerHTML = '';
            
            // Add children as options
            children.forEach(child => {
                const option = document.createElement('option');
                option.value = child.id;
                option.textContent = `${child.name} (${child.age} years)`;
                childSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Failed to load children for investment:', error);
    }
}

function updateInvestmentEstimate() {
    const amount = document.getElementById('investment-amount')?.value || 100;
    const years = document.getElementById('years')?.value || 13;
    
    // Simple compound interest calculation (monthly contributions)
    const monthlyRate = 0.005; // 6% annual return / 12 months
    const months = years * 12;
    const monthlyContribution = parseFloat(amount);
    
    let futureValue = 0;
    for (let i = 0; i < months; i++) {
        futureValue = (futureValue + monthlyContribution) * (1 + monthlyRate);
    }
    
    const estimateElement = document.querySelector('.text-2xl.font-bold.text-accent-primary');
    if (estimateElement) {
        estimateElement.textContent = `$${Math.round(futureValue).toLocaleString()}`;
    }
}

// Charts
function setupCharts() {
    const ctx = document.getElementById('growthChart');
    if (!ctx) return;

    // Setup chart time period buttons
    const chartButtons = document.querySelectorAll('.chart-btn-active, .chart-btn-inactive');
    chartButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all chart buttons
            chartButtons.forEach(btn => {
                btn.classList.remove('chart-btn-active');
                btn.classList.add('chart-btn-inactive');
            });
            
            // Add active class to clicked button
            this.classList.remove('chart-btn-inactive');
            this.classList.add('chart-btn-active');
            
            // Here you could also update the chart data based on the selected period
            console.log('Chart period changed to:', this.textContent);
        });
    });

    // Initialize Chart.js
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Balance',
                data: [800, 850, 900, 950, 1100, 1250],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#6b7280'
                    }
                },
                y: {
                    grid: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--border-color') || '#e5e7eb'
                    },
                    ticks: {
                        color: getComputedStyle(document.documentElement).getPropertyValue('--text-secondary') || '#6b7280',
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Wallet Connection
function setupWalletConnection() {
    const walletButtons = document.querySelectorAll('#wallet-modal button');
    
    walletButtons.forEach(button => {
        button.addEventListener('click', function() {
            const walletName = this.querySelector('span').textContent;
            connectWallet(walletName);
        });
    });
}

function connectWallet(walletName) {
    // Simulate wallet connection
    console.log(`Connecting to ${walletName}...`);
    
    // Show success message
    showNotification(`Successfully connected to ${walletName}!`, 'success');
    
    // Close modal
    document.getElementById('wallet-modal').classList.add('hidden');
    
    // Update UI to show connected state
    updateWalletConnectionStatus(true, walletName);
}

function updateWalletConnectionStatus(connected, walletName = '') {
    const connectButtons = document.querySelectorAll('#connect-wallet-sidebar, button[class*="connect"]');
    
    connectButtons.forEach(button => {
        if (connected) {
            button.textContent = `Connected: ${walletName}`;
            button.classList.remove('bg-accent-primary', 'hover:bg-accent-secondary');
            button.classList.add('bg-green-500', 'hover:bg-green-600');
        } else {
            button.textContent = 'Connect Wallet';
            button.classList.remove('bg-green-500', 'hover:bg-green-600');
            button.classList.add('bg-accent-primary', 'hover:bg-accent-secondary');
        }
    });
}

// Contract Creation
function setupContractCreation() {
    const confirmContractBtn = document.getElementById('confirm-contract');
    
    if (confirmContractBtn) {
        confirmContractBtn.addEventListener('click', function() {
            createSmartContract();
        });
    }
}

function createSmartContract() {
    // Simulate contract creation
    console.log('Creating smart contract...');
    
    // Show loading state
    const confirmBtn = document.getElementById('confirm-contract');
    const originalText = confirmBtn.textContent;
    confirmBtn.textContent = 'Creating...';
    confirmBtn.disabled = true;
    
    // Simulate blockchain transaction
    setTimeout(() => {
        // Close modal
        document.getElementById('contract-modal').classList.add('hidden');
        
        // Reset button
        confirmBtn.textContent = originalText;
        confirmBtn.disabled = false;
        
        // Show success message and confetti
        showNotification('Smart contract created successfully!', 'success');
        triggerConfetti();
        
        // Update dashboard
        updateDashboardAfterContract();
    }, 2000);
}

function updateDashboardAfterContract() {
    // Update total savings
    const totalSavings = document.querySelector('.text-3xl.font-bold.text-text-primary');
    if (totalSavings) {
        const currentAmount = parseInt(totalSavings.textContent);
        totalSavings.textContent = `${currentAmount + 100} USDC`;
    }
    
    // Update child progress
    const emmaProgress = document.querySelector('.child-card:first-child .bg-accent-primary');
    if (emmaProgress) {
        const currentWidth = parseInt(emmaProgress.style.width);
        emmaProgress.style.width = `${Math.min(currentWidth + 5, 100)}%`;
    }
}

// Confetti Effect
function triggerConfetti() {
    const confettiContainer = document.getElementById('confetti-container');
    
    if (!confettiInstance) {
        confettiContainer.style.display = 'block';
        confettiInstance = new ConfettiGenerator({
            target: 'confetti-container',
            max: 80,
            size: 1.2,
            animate: true,
            duration: 3000,
            colors: ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']
        });
    }
    
    confettiInstance.render();
    
    setTimeout(() => {
        confettiContainer.style.display = 'none';
    }, 3000);
}

// Notifications
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full`;
    
    // Set colors based on type
    if (type === 'success') {
        notification.classList.add('bg-green-500', 'text-white');
    } else if (type === 'error') {
        notification.classList.add('bg-red-500', 'text-white');
    } else {
        notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Utility Functions
function formatCurrency(amount, currency = 'USDC') {
    return `${parseFloat(amount).toLocaleString()} ${currency}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Export functions for global access
window.BabyWallet = {
    showNotification,
    formatCurrency,
    formatDate,
    connectWallet,
    createSmartContract
};

// Fetch current user information
async function fetchUserInfo() {
    console.log('🔍 fetchUserInfo called');
    try {
        const response = await fetchWithAuth('/api/users/');
        console.log('📡 API Response status:', response.status);
        if (response.ok) {
            const data = await response.json();
            console.log('📊 API Data:', data);
            if (data.results && data.results.length > 0) {
                const user = data.results[0]; // Get first user (current user)
                console.log('👤 User found:', user);
                AppState.currentUser = user;
                updateUserUI(user);
            } else {
                console.log('❌ No users in results');
            }
        } else {
            console.error('❌ Failed to fetch user info, status:', response.status);
        }
    } catch (error) {
        console.error('💥 Error fetching user info:', error);
    }
}

// Update UI with user information
function updateUserUI(user) {
    console.log('🔄 updateUserUI called with:', user);
    const displayName = user.first_name || user.username;
    console.log('📝 Display name will be:', displayName);
    
    // Update header username
    const headerUsername = document.getElementById('header-username');
    if (headerUsername) {
        console.log('✅ Updating header username');
        headerUsername.textContent = displayName;
    } else {
        console.log('❌ Header username element not found');
    }
    
    // Update welcome message
    const welcomeUsername = document.getElementById('welcome-username');
    if (welcomeUsername) {
        console.log('✅ Updating welcome username');
        welcomeUsername.textContent = displayName;
    } else {
        console.log('❌ Welcome username element not found');
    }
}

// Fetch and render children data
async function fetchChildren() {
    try {
        const response = await fetchWithAuth('/api/children/');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        renderChildren(data);
        await loadDashboardStats();
        await loadTransactionHistory();
    } catch (error) {
        console.error('Failed to fetch children:', error);
        showNotification('Could not load child profiles.', 'error');
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetchWithAuth('/api/dashboard-stats/');
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }
        const data = await response.json();
        updateDashboardUI(data);
    } catch (error) {
        console.error('Failed to load dashboard stats:', error);
        showNotification('Could not load dashboard statistics.', 'error');
    }
}

// Update dashboard UI with real data
function updateDashboardUI(stats) {
    // Update total savings
    const totalSavingsElement = document.querySelector('[data-stat="total-savings"]');
    if (totalSavingsElement) {
        totalSavingsElement.textContent = formatCurrency(stats.total_savings);
    }
    
    // Update percentage change
    const percentageChangeElement = document.querySelector('[data-stat="percentage-change"]');
    if (percentageChangeElement) {
        const percentageValue = stats.percentage_change;
        const isPositive = percentageValue >= 0;
        const percentageText = `${isPositive ? '+' : ''}${percentageValue.toFixed(1)}%`;
        
        // Update the text content of the percentage span
        const textNode = percentageChangeElement.childNodes[percentageChangeElement.childNodes.length - 1];
        if (textNode && textNode.nodeType === Node.TEXT_NODE) {
            textNode.textContent = percentageText;
        }
        
        // Update color based on positive/negative
        if (isPositive) {
            percentageChangeElement.className = 'ml-2 text-sm font-medium text-green-500 flex items-center';
        } else {
            percentageChangeElement.className = 'ml-2 text-sm font-medium text-red-500 flex items-center';
        }
    }
    
    console.log('Dashboard stats loaded:', stats);
}

function renderChildren(children) {
    const container = document.querySelector('.carousel-container');
    if (!container) return;

    // Clear existing static cards but keep the 'Add Child' card
    const existingCards = container.querySelectorAll('.child-card:not(:last-child)');
    existingCards.forEach(card => card.remove());

    const addChildCard = container.querySelector('.child-card:last-child');

    children.forEach(child => {
        const card = document.createElement('div');
        card.className = 'child-card flex-shrink-0 w-full sm:w-80 bg-card-bg shadow-lg rounded-2xl p-5 theme-transition border border-border-color';
        card.innerHTML = `
            <div class="flex items-center mb-4">
                <div class="h-16 w-16 rounded-full bg-${child.color_theme}-100 flex items-center justify-center">
                    <svg class="h-10 w-10 text-${child.color_theme}-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                </div>
                <div class="ml-4">
                    <h3 class="text-lg font-medium text-text-primary">${child.name}</h3>
                    <p class="text-sm text-text-secondary">Age: ${child.age}</p>
                </div>
            </div>
            <div class="mb-4">
                <div class="flex justify-between mb-1">
                    <span class="text-sm font-medium text-text-secondary">Savings Progress</span>
                    <span class="text-sm font-medium text-accent-primary">${Math.round(child.progress_percentage)}%</span>
                </div>
                <div class="w-full bg-bg-secondary rounded-full h-2.5">
                    <div class="bg-accent-primary h-2.5 rounded-full" style="width: ${child.progress_percentage}%"></div>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <div>
                    <p class="text-sm text-text-secondary">Current Balance</p>
                    <p class="text-lg font-bold text-text-primary">${formatCurrency(child.current_balance)}</p>
                </div>
                <button data-child-id="${child.id}" class="view-details-btn px-3 py-1 bg-accent-primary text-white rounded-lg text-sm">View Details</button>
            </div>
        `;
        // Insert the new card before the 'Add Child' card
        container.insertBefore(card, addChildCard);
    });

    document.addEventListener('click', function(e) {
        const viewDetailsButton = e.target.closest('.view-details-btn');
        if (viewDetailsButton) {
            const childId = viewDetailsButton.dataset.childId;
            if (childId) {
                fetchAndShowChildProfile(childId);
            }
        }
    });
}

async function fetchAndShowChildProfile(childId) {
    try {
        const response = await fetchWithAuth(`/api/children/${childId}/`);
        if (!response.ok) {
            throw new Error('Could not fetch child details.');
        }
        const child = await response.json();

        // Populate profile page with data
        document.getElementById('profile-name').textContent = child.name;
        document.getElementById('profile-age').textContent = `Age: ${child.age} years`;
        document.getElementById('profile-progress-percent').textContent = `${Math.round(child.progress_percentage)}%`;
        document.getElementById('profile-progress-bar').style.width = `${child.progress_percentage}%`;
        document.getElementById('profile-balance').textContent = formatCurrency(child.current_balance);
        document.getElementById('profile-target').textContent = formatCurrency(child.target_amount);
        document.getElementById('profile-projected-value').textContent = formatCurrency(child.projected_value_at_18);
        document.getElementById('profile-years-left-text').textContent = child.years_until_unlock;

        // Update avatar color
        const avatar = document.getElementById('profile-avatar');
        avatar.className = `h-20 w-20 rounded-full flex items-center justify-center bg-${child.color_theme}-100`;
        avatar.querySelector('svg').className = `h-12 w-12 text-${child.color_theme}-500`;

        // This is static for now, can be dynamic later
        document.getElementById('profile-nft-name').textContent = `${child.name}'s Future Fund`;

        // Show the profile page and the detail view
        showPage('profiles');
        document.getElementById('child-list-view').classList.add('hidden');
        document.getElementById('child-detail-view').classList.remove('hidden');
        
        // Update the active nav link
        const profileLink = document.querySelector('a[href="#profiles"]');
        updateActiveNavLink(profileLink);

    } catch (error) {
        console.error('Error fetching child profile:', error);
        showNotification(error.message, 'error');
    }
}

// --- Authentication ---
async function login(username, password) {
    try {
        const response = await fetch('/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        AppState.authToken = data.token;
        AppState.isLoggedIn = true;
        localStorage.setItem('authToken', data.token); // Store token
        showNotification('Login successful!', 'success');
        // We can update UI elements here, e.g., show username
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Login failed. Please check credentials.', 'error');
    }
}

function getAuthToken() {
    return localStorage.getItem('authToken');
}

async function fetchWithAuth(url, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }

    return fetch(url, { ...options, headers });
}

function setupLogout() {
    const logoutButton = document.getElementById('logout-btn');
    
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            logout();
        });
    }
}

function logout() {
    AppState.authToken = null;
    AppState.isLoggedIn = false;
    localStorage.removeItem('authToken');
    showNotification('Logged out successfully!', 'success');
    window.location.href = '/login/';
}

// Add Child Functionality
function setupAddChild() {
    const addChildCard = document.getElementById('add-child-card');
    const addChildModal = document.getElementById('add-child-modal');
    const closeAddChildModal = document.getElementById('close-add-child-modal');
    const addChildForm = document.getElementById('add-child-form');

    if (addChildCard) {
        addChildCard.addEventListener('click', () => {
            addChildModal.classList.remove('hidden');
        });
    }

    if (closeAddChildModal) {
        closeAddChildModal.addEventListener('click', () => {
            addChildModal.classList.add('hidden');
        });
    }

    if (addChildForm) {
        addChildForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitButton = addChildForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Creating...';
            submitButton.disabled = true;

            const formData = new FormData(addChildForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetchWithAuth('/api/children/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(JSON.stringify(errorData));
                }

                showNotification('Child profile created successfully!', 'success');
                addChildModal.classList.add('hidden');
                addChildForm.reset();
                await fetchChildren(); // Refresh the children list

            } catch (error) {
                console.error('Failed to create child:', error);
                showNotification(`Error: ${error.message}`, 'error');
            } finally {
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
}

async function showProfilesPage() {
    showPage('profiles');
    try {
        const response = await fetchWithAuth('/api/children/');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const children = await response.json();
        renderProfileList(children);
    } catch (error) {
        console.error('Failed to fetch children for profiles page:', error);
        showNotification('Could not load child profiles.', 'error');
    }
}

function renderProfileList(children) {
    const container = document.getElementById('child-profile-list-container');
    if (!container) return;
    container.innerHTML = ''; // Clear previous list

    children.forEach(child => {
        const card = document.createElement('div');
        card.className = 'bg-card-bg shadow-lg rounded-2xl p-5 theme-transition border border-border-color text-center';
        card.innerHTML = `
            <div class="h-20 w-20 rounded-full bg-${child.color_theme}-100 flex items-center justify-center mx-auto mb-4">
                <svg class="h-12 w-12 text-${child.color_theme}-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
            </div>
            <h3 class="text-lg font-medium text-text-primary">${child.name}</h3>
            <p class="text-sm text-text-secondary mb-4">Age: ${child.age}</p>
            <button data-child-id="${child.id}" class="view-profile-btn w-full px-3 py-2 bg-accent-primary text-white rounded-lg text-sm">View Profile</button>
        `;
        container.appendChild(card);
    });
}

function setupProfileNavigation() {
    // Listener for all "View Profile" or "View Details" buttons
    document.addEventListener('click', function(e) {
        const viewButton = e.target.closest('.view-details-btn, .view-profile-btn');
        if (viewButton) {
            const childId = viewButton.dataset.childId;
            if (childId) {
                fetchAndShowChildProfile(childId);
            }
        }
    });

    // Listener for the "Back to All Profiles" button
    const backToProfilesBtn = document.getElementById('back-to-profiles-btn');
    if(backToProfilesBtn) {
        backToProfilesBtn.addEventListener('click', () => {
            document.getElementById('child-detail-view').classList.add('hidden');
            document.getElementById('child-list-view').classList.remove('hidden');
        });
    }
}

// Load transaction chart data
async function loadTransactionChart(period = '6m') {
    try {
        const response = await fetchWithAuth(`/api/transaction-stats/?period=${period}`);
        if (!response.ok) {
            throw new Error('Failed to fetch transaction stats');
        }
        const data = await response.json();
        updateChart(data.chart_data);
    } catch (error) {
        console.error('Failed to load transaction chart:', error);
    }
}

// Load and display transaction history
async function loadTransactionHistory() {
    try {
        const response = await fetchWithAuth('/api/transactions/');
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        
        const transactions = await response.json();
        displayTransactionHistory(transactions.results || transactions);
    } catch (error) {
        console.error('Failed to load transaction history:', error);
        showNotification('Failed to load transaction history', 'error');
    }
}

function displayTransactionHistory(transactions) {
    const transactionTableBody = document.querySelector('#dashboard tbody');
    
    if (!transactionTableBody) return;
    
    // Clear existing rows
    transactionTableBody.innerHTML = '';
    
    if (!transactions || transactions.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" class="px-6 py-4 text-center text-text-secondary">
                No transactions found
            </td>
        `;
        transactionTableBody.appendChild(row);
        return;
    }
    
    // Display latest 10 transactions
    transactions.slice(0, 10).forEach(transaction => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-bg-secondary';
        
        const statusColor = getStatusColor(transaction.status);
        const date = new Date(transaction.created_at).toLocaleDateString();
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                ${date}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                ${transaction.token || 'USDC'}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                ${transaction.transaction_type === 'investment' ? '+' : ''}$${parseFloat(transaction.amount).toFixed(2)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColor}">
                    ${transaction.status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-text-primary">
                ${transaction.child_name || transaction.child?.name || 'N/A'}
            </td>
        `;
        
        transactionTableBody.appendChild(row);
    });
}

function getStatusColor(status) {
    switch (status) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'failed':
            return 'bg-red-100 text-red-800';
        case 'cancelled':
            return 'bg-gray-100 text-gray-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Load investment history for a specific child
async function loadChildInvestments(childId) {
    try {
        const response = await fetchWithAuth(`/api/investments/?child=${childId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch child investments');
        }
        
        const investments = await response.json();
        return investments.results || investments;
    } catch (error) {
        console.error('Failed to load child investments:', error);
        return [];
    }
}

// Load transaction history for a specific child
async function loadChildTransactions(childId) {
    try {
        const response = await fetchWithAuth(`/api/transactions/?child=${childId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch child transactions');
        }
        
        const transactions = await response.json();
        return transactions.results || transactions;
    } catch (error) {
        console.error('Failed to load child transactions:', error);
        return [];
    }
}

// Load and display all user investments
async function loadInvestmentHistory() {
    try {
        const response = await fetchWithAuth('/api/investments/');
        if (!response.ok) {
            throw new Error('Failed to fetch investments');
        }
        
        const investments = await response.json();
        displayInvestmentHistory(investments.results || investments);
    } catch (error) {
        console.error('Failed to load investment history:', error);
        displayInvestmentHistory([]);
    }
}

function displayInvestmentHistory(investments) {
    const container = document.getElementById('investment-history-container');
    
    if (!container) return;
    
    if (!investments || investments.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <svg class="mx-auto h-12 w-12 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 class="mt-2 text-sm font-medium text-text-primary">No investments yet</h3>
                <p class="mt-1 text-sm text-text-secondary">Create your first investment using the form above.</p>
            </div>
        `;
        return;
    }
    
    const investmentCards = investments.map(investment => {
        const statusColor = getInvestmentStatusColor(investment.status);
        const date = new Date(investment.created_at).toLocaleDateString();
        const frequencyText = investment.frequency ? ` (${investment.frequency})` : '';
        
        return `
            <div class="border border-border-color rounded-lg p-4 hover:bg-bg-secondary transition-colors">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <h4 class="font-medium text-text-primary">${investment.child_name}</h4>
                        <p class="text-sm text-text-secondary">${investment.investment_type}${frequencyText}</p>
                    </div>
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusColor}">
                        ${investment.status}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span class="text-text-secondary">Amount:</span>
                        <span class="font-medium text-text-primary ml-1">$${parseFloat(investment.amount).toFixed(2)}</span>
                    </div>
                    <div>
                        <span class="text-text-secondary">Contributed:</span>
                        <span class="font-medium text-text-primary ml-1">$${parseFloat(investment.total_contributed).toFixed(2)}</span>
                    </div>
                    <div>
                        <span class="text-text-secondary">Created:</span>
                        <span class="font-medium text-text-primary ml-1">${date}</span>
                    </div>
                    <div>
                        <span class="text-text-secondary">Transactions:</span>
                        <span class="font-medium text-text-primary ml-1">${investment.transactions ? investment.transactions.length : 0}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div class="space-y-4">
            ${investmentCards}
        </div>
    `;
}

function getInvestmentStatusColor(status) {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'paused':
            return 'bg-yellow-100 text-yellow-800';
        case 'completed':
            return 'bg-blue-100 text-blue-800';
        case 'cancelled':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
} 
