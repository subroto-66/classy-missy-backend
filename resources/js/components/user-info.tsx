import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
    team = null,
}: {
    user: User & { role?: { name?: string } };
    showEmail?: boolean;
    team?: unknown;
}) {
    const getInitials = useInitials();
    const showAvatar = Boolean(user.avatar && user.avatar !== '');
    const roleName = user.role?.name || 'Super Admin';

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-lg">
                {showAvatar ? (
                    <AvatarImage src={user.avatar} alt={user.name} />
                ) : null}
                <AvatarFallback className="rounded-lg bg-gradient-to-tr from-primary to-[var(--primary-hover)] text-white font-bold text-xs">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-[#444050] dark:text-[#cfcde4]">{user.name}</span>
                <span className="truncate text-xs text-[#82808b] dark:text-[#a5a3ae]">
                    {showEmail ? user.email : roleName}
                </span>
            </div>
        </>
    );
}
