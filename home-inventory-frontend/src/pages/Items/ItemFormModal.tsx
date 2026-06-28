import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createItem, updateItem } from "@/api/items.api";
import { fetchCategories } from "@/api/categories.api";
import { fetchLocations } from "@/api/locations.api";
import type { Item } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormValues {
  name: string;
  brand: string;
  model_number: string;
  serial_number: string;
  condition: string;
  quantity: string;
  notes: string;
  location_id: string;
  category_id: string;
  purchase_price: string;
  purchased_from: string;
}

interface ItemFormModalProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialData?: Item | null;
}

export default function ItemFormModal({ open, onOpenChange, initialData }: ItemFormModalProps) {
  const qc = useQueryClient();
  const isEdit = !!initialData;

  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: locations = [] } = useQuery({ queryKey: ["locations"], queryFn: fetchLocations });

  const {
    register, handleSubmit, reset, setValue, watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: { quantity: "1", condition: "", category_id: "", location_id: "" },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          brand: initialData.brand ?? "",
          model_number: initialData.model_number ?? "",
          serial_number: initialData.serial_number ?? "",
          condition: initialData.condition ?? "",
          quantity: String(initialData.quantity),
          notes: initialData.notes ?? "",
          location_id: initialData.location_id ?? "",
          category_id: initialData.category_id ?? "",
          purchase_price: "",
          purchased_from: "",
        });
      } else {
        reset({ name: "", brand: "", model_number: "", serial_number: "", condition: "", quantity: "1", notes: "", location_id: "", category_id: "", purchase_price: "", purchased_from: "" });
      }
    }
  }, [open, initialData, reset]);

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      toast.success("Item created");
      qc.invalidateQueries({ queryKey: ["items"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to create item"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createItem>[0]) => updateItem(initialData!.id, payload),
    onSuccess: () => {
      toast.success("Item updated");
      qc.invalidateQueries({ queryKey: ["items"] });
      qc.invalidateQueries({ queryKey: ["item", initialData!.id] });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to update item"),
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      brand: values.brand || undefined,
      model_number: values.model_number || undefined,
      serial_number: values.serial_number || undefined,
      condition: values.condition || undefined,
      quantity: values.quantity ? Number(values.quantity) : 1,
      notes: values.notes || undefined,
      location_id: values.location_id || null,
      category_id: values.category_id || null,
      purchase_price: values.purchase_price ? Number(values.purchase_price) : null,
      purchased_from: values.purchased_from || null,
    };
    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const FieldWrapper = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
    <div>
      <Label className="mb-1 block">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Item" : "Add Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <FieldWrapper label="Name *" error={errors.name?.message}>
                <Input
                  placeholder="e.g. Sony Headphones"
                  {...register("name", { required: "Name is required" })}
                />
              </FieldWrapper>
            </div>
            <FieldWrapper label="Brand">
              <Input placeholder="e.g. Sony" {...register("brand")} />
            </FieldWrapper>
            <FieldWrapper label="Model">
              <Input placeholder="e.g. WH-1000XM4" {...register("model_number")} />
            </FieldWrapper>
            <FieldWrapper label="Serial Number">
              <Input placeholder="Serial #" {...register("serial_number")} />
            </FieldWrapper>
            <FieldWrapper label="Quantity">
              <Input type="number" min="0" {...register("quantity")} />
            </FieldWrapper>
            <FieldWrapper label="Condition">
              <Select value={watch("condition")} onValueChange={(v) => setValue("condition", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {["Excellent", "Good", "Fair", "Poor"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Category">
              <Select value={watch("category_id")} onValueChange={(v) => setValue("category_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Location">
              <Select value={watch("location_id")} onValueChange={(v) => setValue("location_id", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((l) => (
                    <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldWrapper>
            <FieldWrapper label="Purchase Price">
              <Input type="number" step="0.01" placeholder="0.00" {...register("purchase_price")} />
            </FieldWrapper>
            <FieldWrapper label="Purchased From">
              <Input placeholder="e.g. Amazon" {...register("purchased_from")} />
            </FieldWrapper>
            <div className="col-span-2">
              <FieldWrapper label="Notes">
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Any additional notes..."
                  {...register("notes")}
                />
              </FieldWrapper>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
