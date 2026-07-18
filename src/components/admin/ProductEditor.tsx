import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Layers, FileText, Plus } from 'lucide-react';
import type { AdminProductForm } from '@/components/admin/types';

interface ProductEditorProps {
  form: AdminProductForm;
  onSave: () => void;
  imageFiles: File[];
  setImageFiles: (files: File[]) => void;
  galleryPreview: string | null;
  setGalleryPreview: (url: string | null) => void;
  setForm: React.Dispatch<React.SetStateAction<AdminProductForm>>;
  isEditing?: boolean;
}

export function ProductEditor({ form, onSave, imageFiles, setImageFiles, galleryPreview, setGalleryPreview, setForm, isEditing }: ProductEditorProps) {
  const status = useMemo(() => {
    if (!form.in_stock) return 'Out of Stock';
    return 'Active';
  }, [form.in_stock]);

  return (
    <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] max-w-4xl overflow-y-auto rounded-[2rem] border border-slate-200/70 bg-white p-4 shadow-[0_30px_80px_-45px_rgba(15,23,42,0.18)] sm:p-6">
      <DialogHeader>
        <DialogTitle className="text-xl font-semibold text-slate-950 sm:text-2xl">{isEditing ? 'Edit Product' : 'Create Product'}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-slate-700" />
                <CardTitle>Basic Information</CardTitle>
              </div>
              <CardDescription>Add product name, brand, category and tags.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
              </div>
              <div>
                <Label>Brand</Label>
                <Input value={form.zodiac_sign} onChange={(event) => setForm((prev) => ({ ...prev, zodiac_sign: event.target.value }))} />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))} />
              </div>
              <div>
                <Label>Tags</Label>
                <Input value={form.tags} onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-700" />
                <CardTitle>Description</CardTitle>
              </div>
              <CardDescription>Write a short product description for the storefront.</CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                className="min-h-[150px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
              />
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Image className="h-5 w-5 text-slate-700" />
                <CardTitle>Images</CardTitle>
              </div>
              <CardDescription>Upload product photos and choose a cover image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                {(galleryPreview ? [galleryPreview] : []).map((url) => (
                  <div key={url} className="relative h-24 w-24 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
                    <img src={url} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                ))}
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-slate-300 bg-white text-slate-500 transition hover:border-slate-500 hover:text-slate-700">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Upload</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setImageFiles((prev) => [...prev, ...files]);
                    const url = files[0] ? URL.createObjectURL(files[0]) : null;
                    if (url) setGalleryPreview(url);
                  }} />
                </label>
              </div>
              {imageFiles.length > 0 && (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="truncate max-w-full">{file.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Badge className="rounded-full px-3 py-1 text-slate-700">Status</Badge>
                <CardTitle>Inventory</CardTitle>
              </div>
              <CardDescription>Control stock level, featured state and publish status.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>Stock status</Label>
                <Input type="text" value={status} disabled className="bg-slate-100" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Price</Label>
                  <Input type="number" value={form.price} onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))} />
                </div>
                <div>
                  <Label>MRP</Label>
                  <Input type="number" value={form.original_price} onChange={(event) => setForm((prev) => ({ ...prev, original_price: event.target.value }))} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Rating</Label>
                  <Input type="number" value={form.rating} onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))} />
                </div>
                <div>
                  <Label>Featured</Label>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={form.featured} onCheckedChange={(checked) => setForm((prev) => ({ ...prev, featured: Boolean(checked) }))} />
                    <span className="text-sm text-slate-600">Mark as featured</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border border-slate-200/70 bg-slate-50/80">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-700" />
                <CardTitle>SEO</CardTitle>
              </div>
              <CardDescription>Improve discoverability on the storefront.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label>Meta title</Label>
                <Input value={form.name} onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))} />
              </div>
              <div>
                <Label>Meta description</Label>
                <textarea
                  className="min-h-[100px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                  value={form.description}
                  onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button variant="default" className="rounded-full px-5 py-3 text-sm font-semibold" onClick={onSave}>Save product</Button>
            <Button variant="outline" className="rounded-full px-5 py-3 text-sm text-slate-700">Preview</Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
