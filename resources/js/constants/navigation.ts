import { NavItem } from '@/types';
import { CalendarSync, LayoutGrid, Settings, UsersRound } from 'lucide-react';

export const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
        permission: ['dashboard.index'],
    },
    {
        title: 'Employee Management',
        href: '#',
        icon: UsersRound,
        permission: ['regions.index', 'branches.index', 'departments.index', 'positions.index',  'users.index'],
        items: [
            {
                title: 'Region',
                href: '/regions',
            },
            {
                title: 'Branch',
                href: '/branches',
            },
            {
                title: 'Department',
                href: '/departments',
            },
            {
                title: 'Position',
                href: '/positions',
            },
            {
                title: 'Employee',
                href: '/users',
            },
        ],
    },
    {
        title: 'Attendance',
        href: '/settings',
        icon: CalendarSync,
        permission: ['permissions.index', 'roles.index'],
        items: [
            {
                title: 'Shift',
                href: '/permissions',
            },
            {
                title: 'Schedule',
                href: '/roles',
            },
            {
                title: 'Attendance',
                href: '/users',
            },
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
            {
                title: 'User',
                href: '/users',
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
