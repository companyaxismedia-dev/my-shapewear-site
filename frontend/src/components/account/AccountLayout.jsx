    import { useState } from 'react';
    import AccountSidebar from './AccountSidebar';
    import OrderHistory from './OrderHistory';
    import MyCoupons from './MyCoupons';
    import PersonalInfo from './PersonalInfo';
    import MyWallet from './MyWallet';
    import MyBankDetails from './MyBankDetails';
    import MyAddressBook from './MyAddressBook';
    import ManageNotifications from './ManageNotifications';

    export default function AccountLayout() {
    const [activeSection, setActiveSection] = useState('order-history');

    const renderContent = () => {
        switch (activeSection) {
        case 'order-history':
            return <OrderHistory />;
        case 'coupons':
            return <MyCoupons />;
        case 'personal-info':
            return <PersonalInfo />;
        case 'wallet':
            return <MyWallet />;
        case 'bank-details':
            return <MyBankDetails />;
        case 'address-book':
            return <MyAddressBook />;
        case 'notifications':
            return <ManageNotifications />;
        default:
            return <OrderHistory />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            </div>
        </header>

        <div className="flex flex-col md:flex-row">
            {/* Sidebar */}
            <AccountSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8">
            <div className="max-w-4xl">
                {renderContent()}
            </div>
            </main>
        </div>
        </div>
    );
    }
