import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Mail, MapPin, Pencil, Phone, Search, ShoppingBag, Trash2, UserCheck, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import type { Customer } from '@/types';

type Props = {
    customers: Customer[];
    filters: {
        search?: string;
    };
};

export default function CustomersIndex({ customers = [], filters = {} }: Props) {
    const page = usePage();
    const teamSlug = (page.props.currentTeam as { slug?: string } | undefined)?.slug || '';
    const prefix = teamSlug ? `/${teamSlug}` : '';

    const [search, setSearch] = useState(filters.search || '');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);

    const editForm = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        status: 'active',
    });

    const deleteForm = useForm({});

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(`${prefix}/admin/customers`, { search: value }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleOpenEdit = (c: Customer) => {
        setEditingCustomer(c);
        editForm.setData({
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            address: c.address || '',
            city: c.city || '',
            status: c.status,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCustomer) return;
        editForm.put(`${prefix}/admin/customers/${editingCustomer.id}`, {
            onSuccess: () => {
                setEditingCustomer(null);
                editForm.reset();
            },
        });
    };

    const handleDeleteSubmit = () => {
        if (!deletingCustomer) return;
        deleteForm.delete(`${prefix}/admin/customers/${deletingCustomer.id}`, {
            onSuccess: () => {
                setDeletingCustomer(null);
            },
        });
    };

    return (
        <>
            <Head title="Customers Management" />

            <div className="flex flex-1 flex-col gap-6 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                                Customers
                            </h1>
                            <Badge variant="outline" className="text-xs">
                                {customers.length} Shoppers
                            </Badge>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Registered clients, total spend, address directory, and purchase activity.
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-2.5 size-4 text-neutral-400" />
                    <Input
                        placeholder="Search by customer name, email, city..."
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9 text-xs"
                    />
                </div>

                {/* Customers Table */}
                <Card className="border-neutral-200 shadow-sm dark:border-neutral-800">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-semibold text-neutral-500 uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-900/50">
                                    <tr>
                                        <th className="px-6 py-3.5">Customer</th>
                                        <th className="px-6 py-3.5">Contact & Location</th>
                                        <th className="px-6 py-3.5">Total Orders</th>
                                        <th className="px-6 py-3.5">Lifetime Spend</th>
                                        <th className="px-6 py-3.5">Status</th>
                                        <th className="px-6 py-3.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                                    {customers.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-sm text-neutral-500">
                                                No customers found.
                                            </td>
                                        </tr>
                                    ) : (
                                        customers.map((c) => (
                                            <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors dark:hover:bg-neutral-800/40">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[#7367F0] font-semibold text-xs dark:bg-rose-950 dark:text-rose-300">
                                                            {c.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                                                                {c.name}
                                                            </div>
                                                            <div className="text-xs text-neutral-400">
                                                                {c.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-neutral-600 dark:text-neutral-400">
                                                    <div>{c.phone || 'No phone'}</div>
                                                    <div className="text-[11px] text-neutral-400">{c.city || 'Dhaka'}, Bangladesh</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="secondary" className="text-xs">
                                                        {c.total_orders ?? c.orders_count ?? 0} Orders
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-neutral-900 dark:text-neutral-100">
                                                    ৳{Number(c.total_spent).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {c.status === 'active' ? (
                                                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] dark:bg-emerald-950/40 dark:text-emerald-300">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px]">
                                                            {c.status}
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenEdit(c)}
                                                            className="h-8 px-2.5 text-xs flex items-center gap-1"
                                                        >
                                                            <Pencil className="size-3" />
                                                            <span>Edit</span>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDeletingCustomer(c)}
                                                            className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40"
                                                        >
                                                            <Trash2 className="size-3" />
                                                        </Button>
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

                {/* Edit Customer Dialog */}
                <Dialog open={!!editingCustomer} onOpenChange={(open) => !open && setEditingCustomer(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Customer: {editingCustomer?.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="c-edit-name">Customer Name *</Label>
                                <Input
                                    id="c-edit-name"
                                    value={editForm.data.name}
                                    onChange={(e) => editForm.setData('name', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c-edit-email">Email Address *</Label>
                                <Input
                                    id="c-edit-email"
                                    type="email"
                                    value={editForm.data.email}
                                    onChange={(e) => editForm.setData('email', e.target.value)}
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c-edit-phone">Phone Number</Label>
                                <Input
                                    id="c-edit-phone"
                                    value={editForm.data.phone}
                                    onChange={(e) => editForm.setData('phone', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c-edit-city">City</Label>
                                <Input
                                    id="c-edit-city"
                                    value={editForm.data.city}
                                    onChange={(e) => editForm.setData('city', e.target.value)}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="c-edit-status">Account Status</Label>
                                <select
                                    id="c-edit-status"
                                    value={editForm.data.status}
                                    onChange={(e) => editForm.setData('status', e.target.value)}
                                    className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-[#7367f0] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>

                            <DialogFooter className="pt-2">
                                <Button type="button" variant="outline" onClick={() => setEditingCustomer(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing} className="bg-[#7367F0] hover:bg-[#685dd8] shadow-[0_2px_4px_rgba(115,103,240,0.4)] text-white">
                                    {editForm.processing ? 'Saving...' : 'Save Customer'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Customer Dialog */}
                <Dialog open={!!deletingCustomer} onOpenChange={(open) => !open && setDeletingCustomer(null)}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-red-600">Delete Customer Record</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to remove <strong>{deletingCustomer?.name}</strong>?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="pt-2">
                            <Button variant="outline" onClick={() => setDeletingCustomer(null)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteSubmit} disabled={deleteForm.processing}>
                                {deleteForm.processing ? 'Deleting...' : 'Confirm Delete'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

CustomersIndex.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? `/${props.currentTeam.slug}/dashboard` : '/dashboard',
        },
        {
            title: 'Customers',
            href: props.currentTeam ? `/${props.currentTeam.slug}/admin/customers` : '/admin/customers',
        },
    ],
});
