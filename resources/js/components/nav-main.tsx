import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import hasAnyPermission from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const cleanup = useMobileNavigation();

    // Helper function to check if a URL matches the current page
    const isUrlActive = (url: string) => {
        // Extract the path part from the current page URL
        const currentPath = page.url.split('?')[0];
        
        // Check if the URL matches exactly
        if (currentPath === url) {
            return true;
        }
        
        // Extract the base resource path from the URL (e.g., "admin/regions" from "/admin/regions")
        const urlParts = url.split('/').filter(Boolean);
        const baseResourcePath = urlParts.join('/');
        
        // Check if the current path starts with the base resource path
        // This handles cases like "/admin/regions/create" or "/admin/regions/1/edit"
        if (baseResourcePath && currentPath.startsWith(`/${baseResourcePath}`)) {
            // Check if the remaining part is a create or edit action
            const remainingPath = currentPath.substring(baseResourcePath.length + 1);
            if (remainingPath === '' || 
                remainingPath === '/create' || 
                remainingPath.endsWith('/edit') || 
                /^\/\d+\/edit$/.test(remainingPath) || 
                /^\/\d+$/.test(remainingPath)) {
                return true;
            }
        }
        
        return false;
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) =>
                    item.permission && hasAnyPermission(item.permission) ? (
                        item.items && item.items.length > 0 ? (
                            state === 'collapsed' ? (
                                <SidebarMenuItem>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <SidebarMenuButton
                                                isActive={item.items?.some(subItem => isUrlActive(subItem.href))}
                                                tooltip={{ children: item.title }}
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                                            align={isMobile ? 'end' : state === 'collapsed' ? 'start' : 'end'}
                                            side={isMobile ? 'bottom' : state === 'collapsed' ? 'left' : 'bottom'}
                                        >
                                            {item.items?.map((subItem) => (
                                                <DropdownMenuItem asChild>
                                                    <Link className="block w-full" href={subItem.href} as="button" onClick={cleanup}>
                                                        <span>{subItem.title}</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SidebarMenuItem>
                            ) : (
                                <Collapsible
                                    key={item.title}
                                    asChild
                                    defaultOpen={item.items?.some(subItem => isUrlActive(subItem.href))}
                                    className="group/collapsible"
                                >
                                    <SidebarMenuItem>
                                        <CollapsibleTrigger asChild>
                                            <SidebarMenuButton>
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                            </SidebarMenuButton>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent>
                                            <SidebarMenuSub>
                                                {item.items?.map((subItem) => (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton 
                                                            asChild 
                                                            isActive={isUrlActive(subItem.href)}>
                                                            <Link href={subItem.href} prefetch>
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                ))}
                                            </SidebarMenuSub>
                                        </CollapsibleContent>
                                    </SidebarMenuItem>
                                </Collapsible>
                            )
                        ) : (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton asChild isActive={isUrlActive(item.href)} tooltip={{ children: item.title }}>
                                    <Link href={item.href} prefetch>
                                        {item.icon && <item.icon />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    ) : null,
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
