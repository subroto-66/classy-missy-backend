import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    CheckCircle2,
    Mail,
    Pencil,
    Phone,
    Plus,
    Search,
    Shield,
    Trash2,
    UserCheck,
    UserX,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminUser, Role } from '@/types';

type Props = {
    users: AdminUser[];
    roles: Array<{ id: number; name: string; slug: string }>;
};

export default function UsersIndex({ users = [], roles = [] }: Props) {
    const page = usePage();
    const teamSlug = (page.props.currentTeam as { slug?: string } | undefined)?.slug || '';
    const prefix = teamSlug ? `/${teamSlug}` : '';
    const currentAuthUserId = (page.props.auth?.user as { id?: number } | undefined)?.id;

    const [search, setSearch] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

    const createForm = useForm({
        name: '',
        email: '',
        phone: '',
        role_id: roles[0]?.id || 1,
        password: '',
        is_active: true,
    });

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        role_id: roles[0]?.id || 1,
        password: '',
        is_active: true,
    });

    const deleteForm = useForm({});

    const handleOpenEdit = (user: AdminUser) => {
        setEditingUser(user);
        editForm.setData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            role_id: user.role?.id || roles[0]?.id || 1,
            password: '',
            is_active: user.is_active,
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(`${prefix}/admin/users`, {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(`${prefix}/admin/users/${editingUser.id}`, {
            onSuccess: () => {
                setEditingUser(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingUser) return;
        deleteForm.delete(`${prefix}/admin/users/${deletingUser.id}`, {
            onSuccess: () => {
                setDeletingUser(null);
            },
        });
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()) ||
            (u.phone && u.phone.includes(search));
        const matchesRole =
            selectedRoleFilter === 'all' || u.role?.slug === selectedRoleFilter;
        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (slug?: string, name?: string) => {
        switch (slug) {
            case 'super-admin':
                return <Badge className="bg-[#7367f0]/10 text-[#7367F0] border-[#7367f0]/20 dark:bg-rose-950/40 dark:text-rose-300">Super Admin</Badge>;
            case 'admin':
                return <Badge className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300">Administrator</Badge>;
            case 'store-manager':
                return <Badge className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">Store Manager</Badge>;
            case 'content-editor':
                return <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">Content Editor</Badge>;
            default:
                return <Badge variant="secondary">{name || 'Staff'}</Badge>;
        }
    };

    return (
        <>
            <Head title="Staff & User Management" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Staff & User Management
                            </h1>
                            <Badge variant="outline" className="text-xs">
                                {users.length} Active Accounts
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Assign roles, control login access, and onboard new team members to Classy Missy.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white flex items-center gap-1.5"
                    >
                        <Plus className="size-4" />
                        <span>Add Staff Member</span>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                        <Input
                            placeholder="Search staff by name, email, or phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 text-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-500">Filter Role:</span>
                        <select
                            value={selectedRoleFilter}
                            onChange={(e) => setSelectedRoleFilter(e.target.value)}
                            className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-800 shadow-sm focus:border-[#7367f0] focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                        >
                            <option value="all">All Roles</option>
                            {roles.map((r) => (
                                <option key={r.id} value={r.slug}>
                                    {r.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Users Table */}
                <Card className="border-neutral-200 shadow-sm dark:border-neutral-800">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-900/50">
                                    <tr>
                                        <th className="px-6 py-3.5">Staff Member</th>
                                        <th className="px-6 py-3.5">Assigned Role</th>
                                        <th className="px-6 py-3.5">Contact</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5">Joined</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-sm text-neutral-500">
                                                No staff members found matching your search.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors dark:hover:bg-neutral-800/40">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[#7367F0] font-semibold text-xs dark:bg-rose-950 dark:text-rose-300">
                                                            {u.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                                                                {u.name}
                                                                {u.id === currentAuthUserId && (
                                                                    <Badge variant="outline" className="text-[10px] bg-neutral-100 dark:bg-neutral-800">
                                                                        You
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-neutral-400">
                                                                {u.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getRoleBadge(u.role?.slug, u.role?.name)}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-neutral-600 dark:text-neutral-300">
                                                    {u.phone ? (
                                                        <div className="flex items-center gap-1 text-neutral-600 dark:text-neutral-400">
                                                            <Phone className="size-3 text-neutral-400" />
                                                            <span>{u.phone}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-neutral-400 italic">No phone</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {u.is_active ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                                            <CheckCircle2 className="size-3.5" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-neutral-400">
                                                            <UserX className="size-3.5" /> Inactive
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-xs text-neutral-500">
                                                    {u.created_at}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(u)}
                                                            className="h-8 px-2.5 text-xs flex items-center gap-1"
                                                        >
                                                            <Pencil className="size-3" />
                                                            <span>Edit</span>
                                                        </Button>

                                                        {u.id !== currentAuthUserId && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDeletingUser(u)}
                                                                className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                            >
                                                                <Trash2 className="size-3" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Add Staff Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Staff Member</DialogTitle>
                            <DialogDescription>
                                Create an account and assign a role to give access to the Classy Missy dashboard.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="user-name">Full Name *</Label>
                                <Input
                                    id="user-name"
                                    placeholder="e.g. Jessica Taylor"
                                    value={createForm.data.name}
                                    onChange={(e) => createForm.setData('name', e.target.value)}
                                    required
                                />
                                {createForm.errors.name && (
                                    <p className="text-xs text-red-600">{createForm.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="user-email">Email Address *</Label>
                                <Input
                                    id="user-email"
                                    type="email"
                                    placeholder="jessica@classymissy.com"
                                    value={createForm.data.email}
                                    onChange={(e) => createForm.setData('email', e.target.value)}
                                    required
                                />
                                {createForm.errors.email && (
                                    <p className="text-xs text-red-600">{createForm.errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="user-phone">Phone Number</Label>
                                <Input
                                    id="user-phone"
                                    placeholder="+8801700000000"
                                    value={createForm.data.phone}
                                    onChange={(e) => createForm.setData('phone', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="user-role">Assigned Role *</Label>
                                <select
                                    id="user-role"
                                    value={createForm.data.role_id}
                                    onChange={(e) => createForm.setData('role_id', Number(e.target.value))}
                                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-[#7367f0] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="user-password">Initial Password *</Label>
                                <Input
                                    id="user-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={createForm.data.password}
                                    onChange={(e) => createForm.setData('password', e.target.value)}
                                    required
                                />
                                {createForm.errors.password && (
                                    <p className="text-xs text-red-600">{createForm.errors.password}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="user-active"
                                    type="checkbox"
                                    checked={createForm.data.is_active}
                                    onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                    className="rounded border-neutral-300 text-[#7367F0] focus:ring-[#7367f0]"
                                />
                                <Label htmlFor="user-active" className="text-xs cursor-pointer">
                                    Account is active (can sign in immediately)
                                </Label>
                            </div>

                            <DialogFooter className="pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={createForm.processing}
                                    className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white"
                                >
                                    {createForm.processing ? 'Creating...' : 'Create Staff'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Staff Dialog */}
                <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Staff: {editingUser?.name}</DialogTitle>
                            <DialogDescription>
                                Update role assignment, contact details, or credentials.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-user-name">Full Name *</Label>
                                <Input
                                    id="edit-user-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                                {editForm.errors.name && (
                                    <p className="text-xs text-red-600">{editForm.errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-user-email">Email Address *</Label>
                                <Input
                                    id="edit-user-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    required
                                />
                                {editForm.errors.email && (
                                    <p className="text-xs text-red-600">{editForm.errors.email}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-user-phone">Phone Number</Label>
                                <Input
                                    id="edit-user-phone"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-user-role">Assigned Role *</Label>
                                <select
                                    id="edit-user-role"
                                    value={editForm.data.role_id}
                                    onChange={(e) => editForm.setData('role_id', Number(e.target.value))}
                                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-[#7367f0] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    {roles.map((r) => (
                                        <option key={r.id} value={r.id}>
                                            {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="edit-user-password">New Password (leave blank to keep current)</Label>
                                <Input
                                    id="edit-user-password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={editForm.data.password}
                                    onChange={(e) => editForm.setData('password', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    id="edit-user-active"
                                    type="checkbox"
                                    checked={editForm.data.is_active}
                                    onChange={(e) => editForm.setData('is_active', e.target.checked)}
                                    className="rounded border-neutral-300 text-[#7367F0] focus:ring-[#7367f0]"
                                />
                                <Label htmlFor="edit-user-active" className="text-xs cursor-pointer">
                                    Account is active
                                </Label>
                            </div>

                            <DialogFooter className="pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingUser(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Staff Dialog */}
                <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">Remove Staff Member</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{deletingUser?.name}</strong>? They will lose all access to the admin dashboard.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-3">
                            <Button variant="outline" onClick={() => setDeletingUser(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteSubmit}
                                disabled={deleteForm.processing}
                            >
                                {deleteForm.processing ? 'Removing...' : 'Confirm Remove'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

UsersIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/dashboard',
        },
        {
            title: 'Staff & Users',
            href: props.currentTeam ? `/${props.currentTeam.slug}/admin/users` : '/admin/users',
        },
    ],
});
