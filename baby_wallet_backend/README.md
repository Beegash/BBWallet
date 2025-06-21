# Baby Wallet Backend

A Django-based backend for Baby Wallet - a secure blockchain savings platform for children's financial future.

## 🚀 Features

- **User Authentication**: Custom token-based authentication system
- **Child Profile Management**: Create and manage children's savings accounts
- **Investment Tracking**: Monitor savings progress and growth
- **Blockchain Integration**: Smart contract management for secure transactions
- **RESTful API**: Complete API for frontend integration
- **Admin Panel**: Django admin interface for data management

## 🛠️ Tech Stack

- **Backend**: Django 5.1.4
- **API**: Django REST Framework 3.14.0
- **Database**: SQLite (development)
- **Authentication**: Token-based authentication
- **CORS**: django-cors-headers for cross-origin requests

## 📁 Project Structure

```
baby_wallet_backend/
├── accounts/                 # User authentication and profiles
│   ├── models.py            # User and Child models
│   ├── views.py             # API views and authentication
│   ├── serializers.py       # Data serialization
│   └── urls.py              # Account-related URLs
├── investments/             # Investment management
│   ├── models.py            # Investment and Transaction models
│   ├── views.py             # Investment API views
│   └── urls.py              # Investment URLs
├── blockchain/              # Blockchain integration
│   ├── models.py            # SmartContract and NFT models
│   ├── views.py             # Blockchain API views
│   └── urls.py              # Blockchain URLs
├── templates/               # HTML templates
│   ├── front.html           # Main dashboard
│   └── login.html           # Login page
├── static/                  # Static files
│   └── script.js            # Frontend JavaScript
├── baby_wallet_backend/     # Django project settings
│   ├── settings.py          # Project configuration
│   └── urls.py              # Main URL configuration
└── manage.py                # Django management script
```

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- pip

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd baby_wallet_backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run migrations**
   ```bash
   python manage.py migrate
   ```

4. **Create test data**
   ```bash
   python manage.py create_test_data
   ```

5. **Collect static files**
   ```bash
   python manage.py collectstatic --noinput
   ```

6. **Start the development server**
   ```bash
   python manage.py runserver
   ```

7. **Access the application**
   - Main Dashboard: http://127.0.0.1:8000/
   - Login Page: http://127.0.0.1:8000/login/
   - Admin Panel: http://127.0.0.1:8000/admin/

### Test Users

- **Username**: `parent1`, **Password**: `test123`
- **Username**: `parent2`, **Password**: `test123`

## 🔧 API Endpoints

### Authentication
- `POST /api/login/` - User login
- `GET /api/children/` - Get user's children (authenticated)
- `POST /api/children/` - Create new child (authenticated)

### Investment
- `GET /api/investments/` - Get investments (authenticated)
- `POST /api/investments/` - Create investment (authenticated)

### Blockchain
- `GET /api/contracts/` - Get smart contracts (authenticated)
- `POST /api/contracts/` - Create smart contract (authenticated)

## 🎯 Key Features

### User Authentication
- Custom User model with username-based authentication
- Token-based API authentication
- Secure password handling
- Session management

### Child Profile Management
- Create and manage multiple children
- Track individual savings progress
- Age-based investment recommendations
- Visual progress indicators

### Investment System
- Multiple investment types (one-time, recurring)
- Automated savings calculations
- Growth projections
- Risk assessment

### Blockchain Integration
- Smart contract deployment
- NFT generation for milestones
- Secure transaction handling
- Ethereum network integration (Sepolia testnet)

## 🔒 Security Features

- CSRF protection
- Token-based authentication
- Input validation
- SQL injection prevention
- XSS protection

## 🧪 Testing

Run the test suite:
```bash
python manage.py test
```

## 📊 Database Models

### User Model
- Custom user model extending AbstractUser
- Username-based authentication
- Email verification (optional)

### Child Model
- Name, age, and profile information
- Savings goals and progress tracking
- Color theme for UI customization

### Investment Model
- Investment type and amount
- Recurring schedule (if applicable)
- Status tracking
- User and child relationships

### SmartContract Model
- Contract address and network
- Deployment status
- Transaction history
- User ownership

## 🚀 Deployment

### Production Setup

1. **Environment Variables**
   ```bash
   export DEBUG=False
   export SECRET_KEY=your-secret-key
   export DATABASE_URL=your-database-url
   ```

2. **Database Migration**
   ```bash
   python manage.py migrate
   ```

3. **Static Files**
   ```bash
   python manage.py collectstatic --noinput
   ```

4. **Web Server**
   - Use Gunicorn or uWSGI
   - Configure Nginx for static files
   - Set up SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🔄 Version History

- **v1.0.0** - Initial release with basic authentication and child management
- **v1.1.0** - Added investment tracking and blockchain integration
- **v1.2.0** - Enhanced UI and user experience improvements 
