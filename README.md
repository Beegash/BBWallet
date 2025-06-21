# Baby Wallet Project

A comprehensive blockchain-based savings platform designed to secure your child's financial future through smart contracts and automated investment strategies.

## 🎯 Project Overview

Baby Wallet is a full-stack web application that allows parents to:
- Create secure savings accounts for their children
- Set up automated investment strategies
- Track progress with visual dashboards
- Leverage blockchain technology for transparency and security
- Generate NFTs for milestone achievements

## 🏗️ Architecture

This project consists of two main components:

### 1. Frontend (Static HTML/CSS/JS)
- **Location**: `baby_wallet_backend/templates/` and `baby_wallet_backend/static/`
- **Technology**: HTML5, Tailwind CSS, Vanilla JavaScript
- **Features**: Responsive design, dark/light theme, interactive dashboards

### 2. Backend (Django)
- **Location**: `baby_wallet_backend/`
- **Technology**: Django 5.1.4, Django REST Framework
- **Features**: RESTful API, authentication, database management

## 🚀 Quick Start

### Option 1: Full Stack (Recommended)
Navigate to the Django backend and follow the setup instructions:

```bash
cd baby_wallet_backend
python manage.py runserver
```

Visit: http://127.0.0.1:8000/

### Option 2: Frontend Only
For development and testing of the frontend only:

```bash
cd baby_wallet_backend
python -m http.server 8000
```

## 📁 Project Structure

```
project/
├── baby_wallet_backend/          # Django backend application
│   ├── accounts/                 # User authentication & profiles
│   ├── investments/              # Investment management
│   ├── blockchain/               # Blockchain integration
│   ├── templates/                # HTML templates
│   │   ├── front.html            # Main dashboard
│   │   └── login.html            # Login page
│   ├── static/                   # Static files
│   │   └── script.js             # Frontend JavaScript
│   ├── baby_wallet_backend/      # Django project settings
│   ├── manage.py                 # Django management
│   ├── requirements.txt          # Python dependencies
│   ├── package.json              # Project metadata
│   └── README.md                 # Backend documentation
└── README.md                     # This file
```

## 🎨 Features

### User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Theme Support**: Dark and light mode with smooth transitions
- **Interactive Elements**: Modals, tooltips, and animations
- **Real-time Updates**: Live data updates and notifications

### Authentication
- **Secure Login**: Token-based authentication
- **Session Management**: Automatic session handling
- **User Profiles**: Personalized dashboard experience

### Dashboard
- **Child Profiles**: Manage multiple children's accounts
- **Savings Tracking**: Visual progress indicators
- **Investment Overview**: Portfolio performance metrics
- **Growth Charts**: Interactive charts and analytics

### Investment Features
- **Multiple Types**: One-time and recurring investments
- **Automated Calculations**: Smart investment recommendations
- **Risk Assessment**: Age-appropriate investment strategies
- **Progress Tracking**: Milestone achievements and rewards

### Blockchain Integration
- **Smart Contracts**: Automated savings execution
- **NFT Generation**: Milestone achievement tokens
- **Transparency**: Public blockchain verification
- **Security**: Immutable transaction records

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup and structure
- **Tailwind CSS**: Utility-first CSS framework
- **Vanilla JavaScript**: Modern ES6+ features
- **Chart.js**: Interactive data visualization
- **Confetti.js**: Celebration animations

### Backend
- **Django 5.1.4**: Web framework
- **Django REST Framework**: API development
- **SQLite**: Database (development)
- **Token Authentication**: Secure API access
- **CORS Headers**: Cross-origin request handling

### Blockchain
- **Ethereum**: Smart contract platform
- **Sepolia Testnet**: Development network
- **Web3.py**: Python Ethereum integration
- **Solidity**: Smart contract language

## 🔧 Development

### Prerequisites
- Python 3.8+
- Node.js (optional, for frontend development)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Backend Setup**
   ```bash
   cd baby_wallet_backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py create_test_data
   python manage.py runserver
   ```

3. **Access the Application**
   - Main App: http://127.0.0.1:8000/
   - Login: http://127.0.0.1:8000/login/
   - Admin: http://127.0.0.1:8000/admin/

### Test Users
- **Username**: `parent1`, **Password**: `test123`
- **Username**: `parent2`, **Password**: `test123`

## 📊 API Documentation

The backend provides a comprehensive REST API:

### Authentication
- `POST /api/login/` - User authentication
- `GET /api/children/` - Get user's children
- `POST /api/children/` - Create child profile

### Investments
- `GET /api/investments/` - Get investments
- `POST /api/investments/` - Create investment

### Blockchain
- `GET /api/contracts/` - Get smart contracts
- `POST /api/contracts/` - Deploy contract

## 🎯 Roadmap

### Phase 1: Core Features ✅
- [x] User authentication system
- [x] Child profile management
- [x] Basic dashboard interface
- [x] Investment tracking

### Phase 2: Enhanced Features 🚧
- [ ] Advanced investment strategies
- [ ] Real-time market data integration
- [ ] Automated portfolio rebalancing
- [ ] Tax optimization features

### Phase 3: Blockchain Integration 🔮
- [ ] Smart contract deployment
- [ ] NFT milestone system
- [ ] DeFi protocol integration
- [ ] Cross-chain compatibility

### Phase 4: Advanced Analytics 📈
- [ ] Machine learning predictions
- [ ] Risk assessment algorithms
- [ ] Performance benchmarking
- [ ] Social features and sharing

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Documentation**: Check the `baby_wallet_backend/README.md` for detailed setup instructions
- **Issues**: Create an issue in the repository
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🙏 Acknowledgments

- Django community for the excellent web framework
- Tailwind CSS team for the utility-first CSS framework
- Ethereum community for blockchain infrastructure
- All contributors and supporters of this project

---

**Made with ❤️ for the future of children's financial education** 
