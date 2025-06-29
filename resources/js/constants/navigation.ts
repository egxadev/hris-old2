import { NavItem } from '@/types';
import { CalendarCheck, CalendarSync, FileText, LayoutGrid, Settings, UsersRound } from 'lucide-react';

export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        permission: ['dashboard.index'],
    },
    {
        title: 'Attendance',
        href: '#',
        icon: CalendarCheck,
        permission: ['user.attendances.checkin', 'user.attendances.checkout', 'user.attendances.history'],
        items: [
            {
                title: 'Check In',
                href: '/user/attendances/checkin',
            },
            {
                title: 'Check Out',
                href: '/user/attendances/checkout',
            },
            {
                title: 'History',
                href: '/user/attendances/history',
            },
        ],
    },
    {
        title: 'Employee Management',
        href: '#',
        icon: UsersRound,
        permission: ['admin.regions.index', 'admin.branches.index', 'admin.departments.index', 'admin.positions.index', 'admin.employees.index'],
        items: [
            {
                title: 'Region',
                href: '/admin/regions',
            },
            {
                title: 'Branch',
                href: '/admin/branches',
            },
            {
                title: 'Department',
                href: '/admin/departments',
            },
            {
                title: 'Position',
                href: '/admin/positions',
            },
            {
                title: 'Employee',
                href: '/admin/employees',
            },
        ],
    },
    {
        title: 'Attendance',
        href: '#',
        icon: CalendarSync,
        permission: ['admin.shifts.index', 'admin.schedules.index', 'admin.attendances.index'],
        items: [
            {
                title: 'Shift',
                href: '/admin/shifts',
            },
            {
                title: 'Schedule',
                href: '/admin/schedules',
            },
            {
                title: 'Attendance',
                href: '/admin/attendances',
            },
        ],
    },
    {
        title: 'Report',
        href: '#',
        icon: FileText,
        permission: ['admin.reports.attendance'],
        items: [
            {
                title: 'Attendance',
                href: '/admin/reports/attendance',
            }
        ],
    },
    {
        title: 'User Settings',
        href: '/settings',
        icon: Settings,
        permission: ['permissions.index', 'roles.index'],
        items: [
            {
                title: 'Permission',
                href: '/permissions',
            },
            {
                title: 'Role',
                href: '/roles',
            },
        ],
    },
];

export const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits',
    //     icon: BookOpen,
    // },
];

export const settingsNavItems: NavItem[] = [
    {
        title: 'Profile',
        href: '/settings/profile',
        icon: null,
    },
    {
        title: 'Password',
        href: '/settings/password',
        icon: null,
    },
    {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: null,
    },
];
