import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import {
    Check,
    CheckSquare,
    Key,
    Lock,
    Pencil,
    Plus,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Trash2,
    Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { Role, RolePermission } from '@/types';

type Props = {
    roles: Role[];
    groupedPermissions: Record<string, RolePermission[]>;
};

export default function RolesIndex({ roles = [], groupedPermissions = {} }: Props) {
    const page = usePage();
    const prefix = '';

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [deletingRole, setDeletingRole] = useState<Role | null>(null);

    // Form for creating a role
    const createForm = useForm({
        name: '',
        description: '',
        permissions: [] as number[],
    });

    // Form for updating a role
    const editForm = useForm({
        name: '',
        description: '',
        permissions: [] as number[],
    });

    // Form for deleting a role
    const deleteForm = useForm({});

    const handleOpenEdit = (role: Role) => {
        setEditingRole(role);
        editForm.setData({
            name: role.name,
            description: role.description || '',
            permissions: role.permissions.map((p) => p.id),
        });
    };

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post(`${prefix}/admin/roles`, {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRole) return;
        editForm.put(`${prefix}/admin/roles/${editingRole.id}`, {
            onSuccess: () => {
                setEditingRole(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingRole) return;
        deleteForm.delete(`${prefix}/admin/roles/${deletingRole.id}`, {
            onSuccess: () => {
                setDeletingRole(null);
            },
        });
    };

    const togglePermissionInCreate = (id: number) => {
        const current = createForm.data.permissions;
        if (current.includes(id)) {
            createForm.setData('permissions', current.filter((pId) => pId !== id));
        } else {
            createForm.setData('permissions', [...current, id]);
        }
    };

    const togglePermissionInEdit = (id: number) => {
        const current = editForm.data.permissions;
        if (current.includes(id)) {
            editForm.setData('permissions', current.filter((pId) => pId !== id));
        } else {
            editForm.setData('permissions', [...current, id]);
        }
    };

    const toggleGroupInCreate = (groupPerms: RolePermission[]) => {
        const groupIds = groupPerms.map((p) => p.id);
        const allSelected = groupIds.every((id) => createForm.data.permissions.includes(id));
        if (allSelected) {
            createForm.setData(
                'permissions',
                createForm.data.permissions.filter((id) => !groupIds.includes(id)),
            );
        } else {
            const combined = Array.from(new Set([...createForm.data.permissions, ...groupIds]));
            createForm.setData('permissions', combined);
        }
    };

    const toggleGroupInEdit = (groupPerms: RolePermission[]) => {
        const groupIds = groupPerms.map((p) => p.id);
        const allSelected = groupIds.every((id) => editForm.data.permissions.includes(id));
        if (allSelected) {
            editForm.setData(
                'permissions',
                editForm.data.permissions.filter((id) => !groupIds.includes(id)),
            );
        } else {
            const combined = Array.from(new Set([...editForm.data.permissions, ...groupIds]));
            editForm.setData('permissions', combined);
        }
    };

    return (
        <>
            <Head title="Role & Permission Management" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header Section */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Roles & Access Control
                            </h1>
                            <Badge className="bg-primary/10 text-primary border-primary/20 dark:bg-rose-950/40 dark:text-rose-300">
                                RBAC System
                            </Badge>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white flex items-center gap-1.5"
                    >
                        <Plus className="size-4" />
                        <span>Create New Role</span>
                    </Button>
                </div>

                {/* Role Cards Grid */}
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {roles.map((role) => (
                        <Card
                            key={role.id}
                            className="flex flex-col justify-between border-neutral-200 shadow-sm transition-all hover:border-neutral-300 dark:border-neutral-800 dark:hover:border-neutral-700"
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                                                {role.name}
                                            </CardTitle>
                                            {role.is_system && (
                                                <Badge variant="outline" className="text-[10px] bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                                    <Lock className="mr-1 size-2.5" /> System
                                                </Badge>
                                            )}
                                        </div>
                                        <CardDescription className="text-xs line-clamp-2">
                                            {role.description || 'No description provided.'}
                                        </CardDescription>
                                    </div>
                                    <div className="rounded-lg bg-primary/10 p-2 text-primary dark:bg-rose-950 dark:text-rose-400">
                                        <ShieldCheck className="size-5" />
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-1">
                                <div className="flex items-center justify-between text-xs text-neutral-500 border-y border-neutral-100 py-2.5 dark:border-neutral-800">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="size-3.5 text-neutral-400" />
                                        <span>
                                            <strong className="text-neutral-900 dark:text-neutral-100">{role.users_count}</strong> Assigned Staff
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Key className="size-3.5 text-neutral-400" />
                                        <span>
                                            <strong className="text-neutral-900 dark:text-neutral-100">{role.permissions.length}</strong> Permissions
                                        </span>
                                    </div>
                                </div>

                                {/* Permissions Preview Chips */}
                                <div className="space-y-1.5">
                                    <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                                        Granted Permissions
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                                        {role.slug === 'super-admin' ? (
                                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] dark:bg-emerald-950/40 dark:text-emerald-300">
                                                ★ Full Administrative Privileges
                                            </Badge>
                                        ) : role.permissions.length === 0 ? (
                                            <span className="text-xs text-neutral-400 italic">No permissions assigned yet</span>
                                        ) : (
                                            role.permissions.slice(0, 6).map((perm) => (
                                                <Badge
                                                    key={perm.id}
                                                    variant="secondary"
                                                    className="text-[10px] font-normal"
                                                >
                                                    {perm.name}
                                                </Badge>
                                            ))
                                        )}
                                        {role.permissions.length > 6 && role.slug !== 'super-admin' && (
                                            <Badge variant="outline" className="text-[10px] font-medium text-neutral-500">
                                                +{role.permissions.length - 6} more
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleOpenEdit(role)}
                                        className="h-8 text-xs flex items-center gap-1.5"
                                    >
                                        <Pencil className="size-3" />
                                        <span>Edit Permissions</span>
                                    </Button>

                                    {!role.is_system && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setDeletingRole(role)}
                                            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                        >
                                            <Trash2 className="size-3" />
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Create Role Dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Create New Role</DialogTitle>
                            <DialogDescription>
                                Set a name, description, and check the specific capabilities this role should possess.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-5 pt-2">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="create-role-name">Role Name *</Label>
                                    <Input
                                        id="create-role-name"
                                        placeholder="e.g. Inventory Specialist"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-xs text-red-600">{createForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="create-role-desc">Description</Label>
                                    <Input
                                        id="create-role-desc"
                                        placeholder="e.g. Manages inventory & dispatch"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Permission Groups */}
                            <div className="space-y-4">
                                <Label className="text-sm font-semibold">Assign Permissions by Module</Label>

                                {Object.entries(groupedPermissions).map(([group, perms]) => {
                                    const allSelected = perms.every((p) =>
                                        createForm.data.permissions.includes(p.id),
                                    );
                                    return (
                                        <div
                                            key={group}
                                            className="rounded-lg border border-neutral-200 p-3.5 space-y-2.5 dark:border-neutral-800"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                                                    {group}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleGroupInCreate(perms)}
                                                    className="h-6 text-[11px] text-primary hover:opacity-80"
                                                >
                                                    {allSelected ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            </div>

                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {perms.map((p) => {
                                                    const isChecked = createForm.data.permissions.includes(p.id);
                                                    return (
                                                        <label
                                                            key={p.id}
                                                            className={`flex items-start gap-2.5 rounded-md border p-2 text-xs cursor-pointer transition-colors ${isChecked
                                                                ? 'border-primary bg-primary/10 dark:border-rose-900 dark:bg-rose-950/20'
                                                                : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => togglePermissionInCreate(p.id)}
                                                                className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary"
                                                            />
                                                            <div className="space-y-0.5">
                                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                                    {p.name}
                                                                </div>
                                                                {p.description && (
                                                                    <div className="text-[11px] text-neutral-500">
                                                                        {p.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <DialogFooter className="pt-2">
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
                                    className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white"
                                >
                                    {createForm.processing ? 'Creating...' : 'Create Role'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Role Dialog */}
                <Dialog open={!!editingRole} onOpenChange={(open) => !open && setEditingRole(null)}>
                    <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Edit Role: {editingRole?.name}</DialogTitle>
                            <DialogDescription>
                                Modify role details and reconfigure assigned permissions.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleEditSubmit} className="space-y-5 pt-2">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-role-name">Role Name *</Label>
                                    <Input
                                        id="edit-role-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-xs text-red-600">{editForm.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="edit-role-desc">Description</Label>
                                    <Input
                                        id="edit-role-desc"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Permission Groups */}
                            <div className="space-y-4">
                                <Label className="text-sm font-semibold">Configured Permissions</Label>

                                {Object.entries(groupedPermissions).map(([group, perms]) => {
                                    const allSelected = perms.every((p) =>
                                        editForm.data.permissions.includes(p.id),
                                    );
                                    return (
                                        <div
                                            key={group}
                                            className="rounded-lg border border-neutral-200 p-3.5 space-y-2.5 dark:border-neutral-800"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 uppercase tracking-wide">
                                                    {group}
                                                </span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleGroupInEdit(perms)}
                                                    className="h-6 text-[11px] text-primary hover:opacity-80"
                                                >
                                                    {allSelected ? 'Deselect All' : 'Select All'}
                                                </Button>
                                            </div>

                                            <div className="grid gap-2 sm:grid-cols-2">
                                                {perms.map((p) => {
                                                    const isChecked = editForm.data.permissions.includes(p.id);
                                                    return (
                                                        <label
                                                            key={p.id}
                                                            className={`flex items-start gap-2.5 rounded-md border p-2 text-xs cursor-pointer transition-colors ${isChecked
                                                                ? 'border-primary bg-primary/10 dark:border-rose-900 dark:bg-rose-950/20'
                                                                : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => togglePermissionInEdit(p.id)}
                                                                className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary"
                                                            />
                                                            <div className="space-y-0.5">
                                                                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                                                    {p.name}
                                                                </div>
                                                                {p.description && (
                                                                    <div className="text-[11px] text-neutral-500">
                                                                        {p.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setEditingRole(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={!!deletingRole} onOpenChange={(open) => !open && setDeletingRole(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600 flex items-center gap-2">
                                <ShieldAlert className="size-5" /> Delete Role
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete the role <strong>{deletingRole?.name}</strong>? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-3">
                            <Button variant="outline" onClick={() => setDeletingRole(null)}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteSubmit}
                                disabled={deleteForm.processing}
                            >
                                {deleteForm.processing ? 'Deleting...' : 'Confirm Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

RolesIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Roles & Permissions',
            href: '/admin/roles',
        },
    ],
});
