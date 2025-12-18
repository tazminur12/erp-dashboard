# 🏢 ERP Dashboard

একটি আধুনিক, responsive ERP (Enterprise Resource Planning) ড্যাশবোর্ড যা React, TailwindCSS, এবং React Router ব্যবহার করে তৈরি করা হয়েছে।

## ✨ বৈশিষ্ট্যসমূহ

### 🎨 UI/UX
- **Modern Design**: Clean, professional, এবং minimal design
- **Responsive**: Desktop, tablet, এবং mobile সব ডিভাইসে responsive
- **Dark Mode**: Light/Dark mode support
- **Bengali Language**: সব UI text বাংলায়
- **Hind Siliguri Font**: বাংলা text এর জন্য optimized font

### 🏗️ Architecture
- **Component-Based**: Reusable components
- **State Management**: Zustand store
- **Routing**: React Router DOM
- **Icons**: Lucide React icons
- **Styling**: TailwindCSS

### 📱 Layout Components
- **Sidebar**: Collapsible navigation with dropdowns
- **TopBar**: Search, notifications, user menu
- **DashboardLayout**: Main app shell
- **Responsive**: Mobile-first design

### 🔧 Common Components
- **CardWidget**: Dashboard statistics widgets
- **SmallStat**: Compact statistics display
- **DataTable**: Searchable, sortable, paginated tables
- **FilterBar**: Advanced filtering options
- **Modal**: Reusable modal dialogs

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd erp-dashboard

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── components/
│   ├── common/           # Reusable components
│   │   ├── CardWidget.jsx
│   │   ├── SmallStat.jsx
│   │   ├── DataTable.jsx
│   │   ├── FilterBar.jsx
│   │   └── Modal.jsx
│   └── layout/           # Layout components
│       ├── Sidebar.jsx
│       ├── TopBar.jsx
│       └── DashboardLayout.jsx
├── pages/                # Page components
│   ├── Dashboard/
│   ├── Customers/
│   ├── Transactions/
│   ├── Vendors/
│   ├── HajjUmrah/
│   ├── AirTicketing/
│   ├── Personal/
│   ├── OtherBusiness/
│   ├── OfficeManagement/
│   ├── MoneyExchange/
│   ├── Settings/
│   └── Profile/
├── routes/               # Routing configuration
│   └── AppRoutes.jsx
├── constants/            # Constants and configuration
│   └── nav.js
├── store/                # State management
│   ├── ui.js
│   └── settings.js
├── lib/                  # Utility functions
│   ├── format.js
│   └── mock.js
└── assets/               # Static assets
```

## 🧭 Navigation Structure

### Main Sections
1. **Dashboard** - Overview and statistics
2. **Customers** - Customer management
3. **Transactions** - Financial transactions
4. **Vendors** - Vendor management
5. **Hajj & Umrah** - Religious travel services
6. **Air Ticketing** - Flight booking system
7. **Personal** - Personal finance tracking
8. **Other Business** - Additional business ventures
9. **Office Management** - Office expenses and management
10. **Money Exchange** - Currency exchange operations
11. **Settings** - System configuration
12. **Profile** - User profile management

### Sub-sections
Each main section contains relevant sub-sections:
- List views (with search, filter, pagination)
- Add/Edit forms
- Reports and analytics
- Payment management

## 🎯 Key Features

### Dashboard
- **Statistics Widgets**: Key metrics display
- **Recent Activities**: Latest system activities
- **Quick Actions**: Common task shortcuts
- **System Status**: Service health monitoring

### Data Management
- **Search & Filter**: Advanced data filtering
- **Pagination**: Efficient data browsing
- **Export**: CSV export functionality
- **Sorting**: Multi-column sorting

### Forms
- **Validation**: Client-side form validation
- **Responsive**: Mobile-friendly form design
- **Grouped Fields**: Logical field grouping
- **Error Handling**: User-friendly error messages

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool
- **TailwindCSS**: Utility-first CSS framework
- **React Router DOM**: Client-side routing

### State Management
- **Zustand**: Lightweight state management
- **Local Storage**: Persistent settings storage

### Icons & UI
- **Lucide React**: Beautiful, consistent icons
- **Custom Components**: Tailored for ERP needs

## 🎨 Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale

### Typography
- **English Font**: Google Sans
- **Bengali Font**: Kalpurush
- **Sizes**: Responsive text sizing
- **Weights**: 300, 400, 500, 600, 700

### Spacing
- **Compact**: Small, efficient spacing
- **Consistent**: 4px grid system
- **Responsive**: Adaptive spacing

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Features
- **Mobile Sidebar**: Collapsible mobile navigation
- **Touch Friendly**: Optimized for touch devices
- **Adaptive Layout**: Responsive grid systems

## 🔧 Configuration

### Environment Variables
```env
# Firebase Configuration (if needed)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### TailwindCSS
- **Dark Mode**: Class-based dark mode
- **Custom Colors**: Extended color palette
- **Custom Fonts**: Google Sans & Kalpurush integration

## 🚀 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Code Style
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Consistent**: Following React best practices

## 📊 Mock Data

The application includes comprehensive mock data for:
- **Customers**: Sample customer records
- **Transactions**: Financial transaction examples
- **Vendors**: Vendor information
- **Tickets**: Air ticket examples
- **Dashboard Stats**: Sample statistics

## 🔮 Future Enhancements

### Planned Features
- **Real-time Updates**: WebSocket integration
- **Advanced Analytics**: Charts and graphs
- **Multi-language**: Additional language support
- **Advanced Filters**: Complex filtering options
- **Export Options**: Multiple export formats
- **Print Support**: Print-friendly layouts

### Technical Improvements
- **Performance**: Code splitting and lazy loading
- **Testing**: Unit and integration tests
- **Documentation**: Component documentation
- **Accessibility**: ARIA labels and keyboard navigation

## 🤝 Contributing

### Development Guidelines
1. **Code Style**: Follow existing patterns
2. **Components**: Create reusable components
3. **Testing**: Test new features
4. **Documentation**: Update relevant docs

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **TailwindCSS**: For the excellent CSS framework
- **Lucide**: For beautiful icons
- **React Community**: For amazing tools and libraries
- **Bengali Community**: For language support inspiration

---

**আপনার ERP ব্যবসার জন্য একটি আধুনিক এবং efficient ড্যাশবোর্ড!** 🚀✨
