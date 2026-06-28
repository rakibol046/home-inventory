import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash, ChevronRight, MapPin, Calendar, Image as ImageIcon, Plus, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { fetchItemById, deleteItem, uploadItemImage, deleteItemImage } from "@/api/items.api";
import type { ItemDetail } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import ItemFormModal from "../Items/ItemFormModal";

export default function ItemDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, isError } = useQuery<ItemDetail>({
    queryKey: ["item", id],
    queryFn: () => fetchItemById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(id!),
    onSuccess: () => {
      toast.success("Item deleted");
      qc.invalidateQueries({ queryKey: ["items"] });
      navigate("/items");
    },
    onError: () => toast.error("Failed to delete item"),
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => deleteItemImage(id!, imageId),
    onSuccess: () => {
      toast.success("Image removed");
      qc.invalidateQueries({ queryKey: ["item", id] });
    },
    onError: () => toast.error("Failed to remove image"),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadItemImage(id!, file);
      toast.success("Image uploaded");
      qc.invalidateQueries({ queryKey: ["item", id] });
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-screen flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4">
          <Skeleton className="h-8 w-64" />
        </header>
        <div className="flex-1 overflow-auto px-8 py-6 space-y-6">
          <Skeleton className="h-10 w-96" />
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-slate-700">Item not found</p>
          <Link to="/items" className="text-primary text-sm mt-2 inline-block hover:underline">
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage = selectedImage ?? data.images.find((i) => i.is_primary)?.url ?? data.images[0]?.url;
  const warrantyActive = data.warranty?.is_active;

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/items" className="text-slate-600 hover:underline">Items</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-slate-900 font-medium truncate max-w-xs">{data.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-red-200 text-red-600 hover:bg-red-50"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash className="w-4 h-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        {/* Title + labels */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{data.name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {data.labels.map((l) => (
              <span
                key={l.id}
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ backgroundColor: l.color_bg, color: l.color_text }}
              >
                {l.name}
              </span>
            ))}
            {warrantyActive && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Active Warranty
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Images */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex gap-4">
              <div className="flex-1 bg-slate-50 rounded-lg flex items-center justify-center min-h-[240px]">
                {primaryImage ? (
                  <img
                    src={`http://localhost:8080${primaryImage}`}
                    alt={data.name}
                    className="max-w-full max-h-[280px] object-contain rounded"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <ImageIcon className="w-12 h-12" />
                    <span className="text-sm">No image</span>
                  </div>
                )}
              </div>
              {data.images.length > 0 && (
                <div className="flex flex-col gap-2">
                  {data.images.map((img) => (
                    <div key={img.id} className="relative group">
                      <div
                        className={`w-20 h-16 rounded-lg border-2 overflow-hidden cursor-pointer transition-colors ${
                          (selectedImage ?? data.images.find((i) => i.is_primary)?.url ?? data.images[0]?.url) === img.url
                            ? "border-primary"
                            : "border-slate-200 hover:border-slate-400"
                        }`}
                        onClick={() => setSelectedImage(img.url)}
                      >
                        <img
                          src={`http://localhost:8080${img.url}`}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 hidden group-hover:flex items-center justify-center"
                        onClick={() => deleteImageMutation.mutate(img.id)}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                <span className="inline-flex items-center gap-1.5 text-sm text-primary border border-primary rounded-md px-3 py-1.5 hover:bg-blue-50 transition-colors">
                  <Plus className="w-4 h-4" />
                  {uploading ? "Uploading..." : "Add Image"}
                </span>
              </label>
            </div>
          </div>

          {/* Key Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Key Details</h3>
            <div className="space-y-3 text-sm">
              {data.location && (
                <div>
                  <p className="text-slate-500 font-medium mb-1">Location</p>
                  <p className="text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {data.location.room?.name && `${data.location.room.name} → `}{data.location.name}
                  </p>
                </div>
              )}
              <div className="flex gap-6">
                <div>
                  <p className="text-slate-500 font-medium mb-1">Quantity</p>
                  <p className="text-slate-900 font-medium">{data.quantity}</p>
                </div>
                {data.condition && (
                  <div>
                    <p className="text-slate-500 font-medium mb-1">Condition</p>
                    <Badge variant="outline">{data.condition}</Badge>
                  </div>
                )}
              </div>
              {data.purchase_record && (
                <>
                  {data.purchase_record.purchase_date && (
                    <div>
                      <p className="text-slate-500 font-medium mb-1">Purchase Date</p>
                      <p className="text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        {new Date(data.purchase_record.purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {data.purchase_record.purchase_price != null && (
                    <div>
                      <p className="text-slate-500 font-medium mb-1">Purchase Price</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {data.purchase_record.currency} {data.purchase_record.purchase_price.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {data.purchase_record.purchased_from && (
                    <div>
                      <p className="text-slate-500 font-medium mb-1">Purchased From</p>
                      <p className="text-slate-900">{data.purchase_record.purchased_from}</p>
                    </div>
                  )}
                </>
              )}
              {data.warranty && (
                <div>
                  <p className="text-slate-500 font-medium mb-1">Warranty</p>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      data.warranty.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {data.warranty.is_active ? "Active" : "Expired"}
                    {data.warranty.end_date && ` until ${new Date(data.warranty.end_date).toLocaleDateString()}`}
                  </span>
                </div>
              )}
              {data.notes && (
                <div>
                  <p className="text-slate-500 font-medium mb-1">Notes</p>
                  <p className="text-slate-700 leading-relaxed">{data.notes}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <Tabs defaultValue="details">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="warranty">Warranty</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Product Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {[
                  { label: "Brand", value: data.brand },
                  { label: "Model", value: data.model_number },
                  { label: "Serial Number", value: data.serial_number },
                  { label: "Color", value: data.color },
                  { label: "Condition", value: data.condition },
                  {
                    label: "Last Updated",
                    value: new Date(data.updated_at).toLocaleDateString(),
                  },
                ]
                  .filter((f) => f.value)
                  .map((field) => (
                    <div key={field.label}>
                      <span className="text-slate-500">{field.label}</span>
                      <p className="text-slate-900 font-medium mt-0.5">{field.value}</p>
                    </div>
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="warranty" className="mt-4">
              {data.warranty ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {[
                    { label: "Provider", value: data.warranty.provider },
                    { label: "Type", value: data.warranty.warranty_type },
                    {
                      label: "Start Date",
                      value: data.warranty.start_date
                        ? new Date(data.warranty.start_date).toLocaleDateString()
                        : null,
                    },
                    {
                      label: "End Date",
                      value: data.warranty.end_date
                        ? new Date(data.warranty.end_date).toLocaleDateString()
                        : null,
                    },
                    { label: "Notes", value: data.warranty.notes },
                  ]
                    .filter((f) => f.value)
                    .map((field) => (
                      <div key={field.label}>
                        <span className="text-slate-500">{field.label}</span>
                        <p className="text-slate-900 font-medium mt-0.5">{field.value}</p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No warranty information recorded.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <ItemFormModal open={editOpen} onOpenChange={setEditOpen} initialData={data} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete item?"
        description={`"${data.name}" will be permanently deleted. This cannot be undone.`}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
