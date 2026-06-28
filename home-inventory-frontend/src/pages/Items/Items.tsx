import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Download, Plus, MoreHorizontal, ChevronLeft, ChevronRight, ArrowUpNarrowWide } from "lucide-react";
import { Link } from "react-router";
import { toast } from "sonner";

import { fetchItems, deleteItem, exportItems } from "@/api/items.api";
import type { Item } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ErrorState } from "@/components/ErrorState";
import ItemFormModal from "./ItemFormModal";

export default function Items() {
  const qc = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const PAGE_SIZE = 10;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["items", { page: currentPage, page_size: PAGE_SIZE, search: debouncedSearch }],
    queryFn: () => fetchItems({ page: currentPage, page_size: PAGE_SIZE, search: debouncedSearch || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteItem(id),
    onSuccess: () => {
      toast.success("Item deleted");
      qc.invalidateQueries({ queryKey: ["items"] });
      setDeleteTarget(null);
    },
    onError: () => toast.error("Failed to delete item"),
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    clearTimeout((handleSearch as any)._t);
    (handleSearch as any)._t = setTimeout(() => setDebouncedSearch(value), 400);
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h2 className="text-2xl font-bold">Items</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 min-w-80 bg-white border border-slate-300"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 border-slate-300" onClick={exportItems}>
              <Download className="w-4 h-4" />
              <span>Export</span>
            </Button>
            <Button
              className="flex items-center gap-2 bg-primary text-white"
              onClick={() => { setEditItem(null); setModalOpen(true); }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 px-8 py-3 flex items-center justify-between">
        <span className="text-sm text-slate-500">{total} items</span>
        <Button variant="outline" className="flex items-center gap-2 border-slate-300 text-slate-600" size="sm">
          <ArrowUpNarrowWide className="w-4 h-4" />
          <span>Sort: Updated</span>
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isError ? (
            <ErrorState message="Failed to load items." onRetry={refetch} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left w-10">
                      <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Labels</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Qty</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-4 w-12" />
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-t border-slate-200">
                          <td className="px-6 py-4"><Skeleton className="w-4 h-4" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-10 w-48" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-6 w-32" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                          <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                          <td className="px-6 py-4" />
                        </tr>
                      ))
                    : items.map((item, index) => (
                        <tr key={item.id} className={index === 0 ? "" : "border-t border-slate-200"}>
                          <td className="px-6 py-4">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300" />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              {item.primary_image_url && (
                                <img
                                  src={`http://localhost:8080${item.primary_image_url}`}
                                  alt={item.name}
                                  className="w-12 h-12 rounded border border-slate-200 object-cover"
                                />
                              )}
                              <div>
                                <Link to={`/items/${item.id}`} className="font-medium hover:text-primary">
                                  {item.name}
                                </Link>
                                {item.brand && (
                                  <p className="text-sm text-slate-500">{item.brand} {item.model_number}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">{item.location_id ? "—" : "—"}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1.5">
                              {item.labels.map((label) => (
                                <span
                                  key={label.id}
                                  className="text-xs font-medium px-2.5 py-1 rounded"
                                  style={{ backgroundColor: label.color_bg, color: label.color_text }}
                                >
                                  {label.name}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-slate-900">{item.quantity}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-500">
                              {new Date(item.updated_at).toLocaleDateString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-slate-400 hover:text-slate-600">
                                  <MoreHorizontal className="w-5 h-5" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => { setEditItem(item); setModalOpen(true); }}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeleteTarget(item)}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
              {!isLoading && items.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <p className="text-lg font-medium">No items yet</p>
                  <p className="text-sm mt-1">Add your first item to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <footer className="bg-white border-t border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {items.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(currentPage * PAGE_SIZE, total)} of {total} items
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const page = i + 1;
              return (
                <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? "bg-primary text-white" : "border-slate-300"}>
                  {page}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </footer>

      <ItemFormModal
        open={modalOpen}
        onOpenChange={(v) => { setModalOpen(v); if (!v) setEditItem(null); }}
        initialData={editItem}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete item?"
        description={`"${deleteTarget?.name}" will be permanently deleted.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
