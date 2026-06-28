import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Tag } from "lucide-react";
import { toast } from "sonner";

import { fetchLabels, createLabel, updateLabel, deleteLabel } from "@/api/labels.api";
import type { Label } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label as UILabel } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/ConfirmDialog";

const PRESET_COLORS: { bg: string; text: string; label: string }[] = [
  { bg: "#DBEAFE", text: "#1D4ED8", label: "Blue" },
  { bg: "#DCFCE7", text: "#15803D", label: "Green" },
  { bg: "#FEF9C3", text: "#A16207", label: "Yellow" },
  { bg: "#FEE2E2", text: "#B91C1C", label: "Red" },
  { bg: "#F3E8FF", text: "#7E22CE", label: "Purple" },
  { bg: "#FFEDD5", text: "#C2410C", label: "Orange" },
  { bg: "#E0F2FE", text: "#0369A1", label: "Sky" },
  { bg: "#F1F5F9", text: "#475569", label: "Slate" },
];

type LabelForm = { name: string; color_bg: string; color_text: string };

function LabelModal({
  open, onOpenChange, initial, onSubmit, loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Label | null;
  onSubmit: (v: LabelForm) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<LabelForm>({ name: "", color_bg: PRESET_COLORS[0].bg, color_text: PRESET_COLORS[0].text });

  const handleOpen = (v: boolean) => {
    if (v) setForm({ name: initial?.name ?? "", color_bg: initial?.color_bg ?? PRESET_COLORS[0].bg, color_text: initial?.color_text ?? PRESET_COLORS[0].text });
    onOpenChange(v);
  };

  const selectPreset = (p: typeof PRESET_COLORS[0]) => setForm({ ...form, color_bg: p.bg, color_text: p.text });

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Label" : "Add Label"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <UILabel>Name *</UILabel>
            <Input placeholder="e.g. Electronics" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <UILabel className="mb-2 block">Color</UILabel>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((p) => (
                <button
                  key={p.bg}
                  type="button"
                  onClick={() => selectPreset(p)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                    form.color_bg === p.bg ? "border-slate-900 scale-105" : "border-transparent"
                  }`}
                  style={{ backgroundColor: p.bg, color: p.text }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <UILabel className="mb-1 block">Preview</UILabel>
            <span className="text-sm font-medium px-3 py-1.5 rounded-full" style={{ backgroundColor: form.color_bg, color: form.color_text }}>
              {form.name || "Label preview"}
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={loading || !form.name.trim()}>
            {loading ? "Saving..." : initial ? "Save" : "Add Label"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Labels() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editLabel, setEditLabel] = useState<Label | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Label | null>(null);

  const { data: labels = [], isLoading } = useQuery({ queryKey: ["labels"], queryFn: fetchLabels });

  const createMutation = useMutation({
    mutationFn: createLabel,
    onSuccess: () => { toast.success("Label added"); qc.invalidateQueries({ queryKey: ["labels"] }); setModalOpen(false); },
    onError: () => toast.error("Failed to create label"),
  });
  const updateMutation = useMutation({
    mutationFn: (v: LabelForm) => updateLabel(editLabel!.id, v),
    onSuccess: () => { toast.success("Label updated"); qc.invalidateQueries({ queryKey: ["labels"] }); setEditLabel(null); setModalOpen(false); },
    onError: () => toast.error("Failed to update label"),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteLabel(id),
    onSuccess: () => { toast.success("Label deleted"); qc.invalidateQueries({ queryKey: ["labels"] }); setDeleteTarget(null); },
    onError: () => toast.error("Failed to delete label"),
  });

  const loading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Labels</h2>
          <Button onClick={() => { setEditLabel(null); setModalOpen(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Add Label
          </Button>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : labels.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Tag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium">No labels yet</p>
            <p className="text-sm mt-1">Create labels to organize your items.</p>
            <Button className="mt-4" onClick={() => { setEditLabel(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Label
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {labels.map((label) => (
              <div
                key={label.id}
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-medium px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: label.color_bg, color: label.color_text }}
                  >
                    {label.name}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => { setEditLabel(label); setModalOpen(true); }}>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(label)}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </div>

      <LabelModal
        open={modalOpen}
        onOpenChange={(v) => { setModalOpen(v); if (!v) setEditLabel(null); }}
        initial={editLabel}
        onSubmit={(v) => editLabel ? updateMutation.mutate(v) : createMutation.mutate(v)}
        loading={loading}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Delete label?"
        description={`"${deleteTarget?.name}" will be removed. Items using this label won't be deleted.`}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
