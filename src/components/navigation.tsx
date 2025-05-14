import { cn } from '@/lib/utils';
import { ChefHat, LayoutList } from 'lucide-react';

export default function Navigation() {
    return (
        <div className='max-md:border-b w-full pt-6 md:py-8 md:flex items-end'>
            <NavItem href='/' className='text-2xl'>
                {' '}
                🍉 Food Tracker
            </NavItem>
            <NavItem href='/'>
                {' '}
                <LayoutList size='16' className='my-auto mr-1' /> Daily
                Tracker{' '}
            </NavItem>
            <NavItem href='/recipes'>
                {' '}
                <ChefHat size='16' className='my-auto mr-1' /> All Recipes{' '}
            </NavItem>
        </div>
    );
}

function NavItem({
    children,
    href,
    className,
}: {
    children: React.ReactNode;
    href: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                'py-auto md:px-4 my-2 font-semibold break-words',
                className,
            )}>
            <a href={href} className='flex'>
                {children}
            </a>
        </div>
    );
}
