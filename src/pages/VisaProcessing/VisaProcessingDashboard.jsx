import React from 'react';
import { Link } from 'react-router-dom';
import { Users, FileCheck, CreditCard, FileText, BarChart3 } from 'lucide-react';

const VisaProcessingDashboard = () => {
    const stats = [
        {
            name: 'Total Applicants',
            value: '1,234',
            change: '+12%',
            changeType: 'increase',
            icon: Users,
        },
        {
            name: 'Pending Applications',
            value: '89',
            change: '+5%',
            changeType: 'increase',
            icon: FileCheck,
        },
        {
            name: 'Completed Visas',
            value: '456',
            change: '+18%',
            changeType: 'increase',
            icon: FileText,
        },
        {
            name: 'Pending Payments',
            value: '23',
            change: '-8%',
            changeType: 'decrease',
            icon: CreditCard,
        },
    ];

    const quickActions = [
        {
            name: 'Manage Applicants',
            description: 'Add, edit, and view visa applicants',
            href: '/visa-processing/applicants',
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            name: 'Track Applications',
            description: 'Monitor visa application status',
            href: '/visa-processing/tracking',
            icon: FileCheck,
            color: 'bg-green-500',
        },
        {
            name: 'Process Payments',
            description: 'Handle visa payment processing',
            href: '/visa-processing/payment',
            icon: CreditCard,
            color: 'bg-yellow-500',
        },
        {
            name: 'Manage Documents',
            description: 'Upload and organize visa documents',
            href: '/visa-processing/documents',
            icon: FileText,
            color: 'bg-purple-500',
        },
    ];

    return (
        <div className="space-y-6 p-10">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Visa Processing Dashboard
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage visa applications, track progress, and process payments
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="relative overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 py-5 shadow sm:px-6"
                    >
                        <dt>
                            <div className="absolute rounded-md bg-blue-500 p-3">
                                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                                {stat.name}
                            </p>
                        </dt>
                        <dd className="ml-16 flex items-baseline">
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                                {stat.value}
                            </p>
                            <p
                                className={`ml-2 flex items-baseline text-sm font-semibold ${
                                    stat.changeType === 'increase'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}
                            >
                                {stat.change}
                            </p>
                        </dd>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {quickActions.map((action) => (
                        <Link
                            key={action.name}
                            to={action.href}
                            className="relative block rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-center">
                                <div className={`rounded-lg ${action.color} p-3`}>
                                    <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                        {action.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        {action.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Recent Activity
                </h2>
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                No recent activity
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Recent visa processing activities will appear here.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VisaProcessingDashboard;