import { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { Customer, PaginatedData } from '@/types';

type Props = {
    customers: PaginatedData<Customer> | Customer[];
    filters: {
        search?: string;
    };
};

export default function CustomersIndex({ customers, filters = {} }: Props) {
    const page = usePage();
    const prefix = '';

    const customerList = Array.isArray(customers) ? customers : (customers?.data || []);
    const totalCustomers = Array.isArray(customers) ? customers.length : (customers?.total ?? 0);

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

    const columns = [
        'Customer',
        'Contact & Location',
        'Total Orders',
        'Lifetime Spend',
        'Status',
        { header: 'Actions', className: 'text-right' },
    ];

    return (
        <>
            <Head title="Customers Management" />

            <DataTable<Customer>
                title="Customers"
                totalCount={totalCustomers}
                countLabel="Shoppers"
                search={search}
                onSearchChange={handleSearch}
                searchPlaceholder="Search by customer name, email, city..."
                columns={columns}
                items={customerList}
                emptyMessage="No customers found."
                paginationData={customers}
                renderRow={(c) => (
                    <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors dark:hover:bg-neutral-800/40">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs dark:bg-rose-950 dark:text-rose-300">
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
                )}
            />

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
                                className="w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-primary focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
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
                            <Button type="submit" disabled={editForm.processing} className="bg-primary hover:bg-[var(--primary-hover)] shadow-[0_2px_4px_rgba(var(--primary-rgb),0.4)] text-white">
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
        </>
    );
}

CustomersIndex.layout = () => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Customers',
            href: '/admin/customers',
        },
    ],
});
