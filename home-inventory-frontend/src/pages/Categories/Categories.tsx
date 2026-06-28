import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, FolderOpen } from "lucide-react";
import { toast } from "sonner";

import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/api/categories.api";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const PRESET_COLORS = ["#3B82F6", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#F97316", "#EC4899"];

type CategoryForm = { name: string; color: string; icon: string; description: string };

function CategoryModal({
  open, onOpenChange, initial, onSubmit, loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Category | null;
  onSubmit: (v: CategoryForm) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<CategoryForm>({ name: "", color: PRESET_COLORS[0], icon: "", description: "" });

  const handleOpen = (v: boolean) => {
    if (v) setForm({ name: initial?.name ?? "", color: initial?.color ?? PRESET_COLORS[0], icon: initial?.icon ?? "", description: initial?.description ?? "" });
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Category" : "Add Category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Name *</Label>
            <Input placeholder="e.g. Electronics" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${form.color === c ? "border-slate-900 scale-110" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <Label>Icon (Lucide name)</Label>
            <Input placeholder="e.g. laptop, sofa, car" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Input placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={loading || !form.name.trim()}>
            {loading ? "Saving..." : initial ? "Save" : "Add Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Categories() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const { data: categories = [], isLoading } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { toast.success("Category added"); qc.invalidateQueries({ queryKey: ["categories"] }); setModalOpen(false); },
    onError: () => toast.error("Failed to create category"),
  });
  const updateMutation = useMutation({
    mutationFn: (v: CategoryForm) => updateCategory(editCategory!.id, v),
    onSuccess: () => { toast.success("Category updated"); qc.invalidateQueries({ queryKey: ["categories"] }); setEditCategory(null); setModalOpen(false); },
    onError: () => toast.error("Failed to update category"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => { toast.success("Category deleted"); qc.invalidateQueries({ queryKey: ["categories"] }); setDeleteTarget(null); },
    onError: () => toast.error("Failed to delete category"),
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Categories</h2>
          <Button onClick={() => { setEditCategory(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Category
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium">No categories yet</p>
            <p className="text-sm mt-1">Create categories to organize your items.</p>
            <Button className="mt-4" onClick={() => { setEditCategory(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Category
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                    style={{ backgroundColor: cat.color ?? "#3B82F6" }}
                  >
                    {cat.icon ? cat.icon[0].toUpperCase() : cat.name[0].toUpperCase()}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-slate-400 hover:text-slate-600 p-1 rounded">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditCategory(cat); setModalOpen(true); }}>Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(cat)}>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="font-semibold text-slate-900">{cat.name}</p>
                {cat.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{cat.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <CategoryModal
        open={modalOpen}
        onOpenChange={(v) => { setModalOpen(v); if (!v) setEditCategory(null); }}
        initial={editCategory}
        onSubmit={(v) => editCategory ? updateMutation.mutate(v) : createMutation.mutate(v)}
        loading={loading}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete category?"
        description={`"${deleteTarget?.name}" will be removed. Items using this category won't be deleted.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
