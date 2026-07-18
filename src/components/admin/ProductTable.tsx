import type { Dispatch, SetStateAction } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Image, Pencil, Trash2, Eye } from 'lucide-react';

export interface ProductTableRow {
  id: string;
  image: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  original_price: number | null;
  discount: number;
  in_stock: boolean;
  status: string;
  rating: number;
  created_at: string;
  featured: boolean;
  views: number;
  wishlistCount: number;
  orders: number;
  revenue: number;
}

interface ProductTableProps {
  products: ProductTableRow[];
  selectedIds: Record<string, boolean>;
  setSelectedIds: Dispatch<SetStateAction<Record<string, boolean>>>;
  onEdit: (product: ProductTableRow) => void;
  onPreview: (product: ProductTableRow) => void;
  onDelete: (id: string) => void;
}

function stockBadge(inStock: boolean, status: string) {
  if (!inStock) return <Badge variant="destructive">Out of Stock</Badge>;
  if (status === 'low-stock') return <Badge variant="secondary">Low Stock</Badge>;
  return <Badge variant="default">In Stock</Badge>;
}

export function ProductTable({ products, selectedIds, setSelectedIds, onEdit, onPreview, onDelete }: ProductTableProps) {
  const allSelected = products.length > 0 && products.every((product) => selectedIds[product.id]);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white/90 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 bg-slate-50/80 px-6 py-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Products</p>
          <p className="text-slate-700">{products.length} items in catalogue</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Export</Button>
          <Button variant="outline" className="rounded-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Change category</Button>
          <Button variant="destructive" className="rounded-full px-4 py-2 text-sm">Delete</Button>
        </div>
      </div>

      <Table className="min-w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedIds(Object.fromEntries(products.map((product) => [product.id, true])));
                  } else {
                    setSelectedIds({});
                  }
                }}
              />
            </TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>MRP</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="hover:bg-slate-50 transition-colors">
              <TableCell>
                <Checkbox
                  checked={!!selectedIds[product.id]}
                  onCheckedChange={(checked) => {
                    setSelectedIds((prev) => ({ ...prev, [product.id]: Boolean(checked) }));
                  }}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 overflow-hidden">
                    {product.image ? <img src={product.image} alt={product.name} className="h-full w-full object-cover" /> : <Image className="h-5 w-5 text-slate-400" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-950">{product.name}</p>
                    <p className="text-xs text-slate-500">{product.tags.join(', ')}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell>{product.brand}</TableCell>
              <TableCell>₹{product.price}</TableCell>
              <TableCell>₹{product.original_price ?? '-'}</TableCell>
              <TableCell>{product.discount}%</TableCell>
              <TableCell>{stockBadge(product.in_stock, product.status)}</TableCell>
              <TableCell>
                <Badge variant={product.featured ? 'secondary' : 'default'}>{product.status}</Badge>
              </TableCell>
              <TableCell>{product.rating.toFixed(1)}</TableCell>
              <TableCell>{new Date(product.created_at).toLocaleDateString('en-IN')}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="icon" onClick={() => onPreview(product)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(product.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
