import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Home, MapPin, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import {
  fetchRooms,
  createRoom, updateRoom, deleteRoom,
  createLocation, updateLocation, deleteLocation,
} from "@/api/locations.api";
import type { Room, Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type RoomForm = { name: string; description: string; floor: string };
type LocationForm = { name: string; description: string; room_id: string };

function RoomModal({
  open, onOpenChange, initial,
  onSubmit, loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Room | null;
  onSubmit: (v: RoomForm) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<RoomForm>({ name: "", description: "", floor: "" });

  const handleOpen = (v: boolean) => {
    if (v) setForm({ name: initial?.name ?? "", description: initial?.description ?? "", floor: String(initial?.floor ?? "") });
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Room" : "Add Room"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Name *</Label>
            <Input placeholder="e.g. Living Room" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Input placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label>Floor</Label>
            <Input type="number" placeholder="e.g. 1" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={loading || !form.name.trim()}>
            {loading ? "Saving..." : initial ? "Save Changes" : "Add Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function LocationModal({
  open, onOpenChange, initial, rooms, onSubmit, loading,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Location | null;
  rooms: Room[];
  onSubmit: (v: LocationForm) => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<LocationForm>({ name: "", description: "", room_id: "" });

  const handleOpen = (v: boolean) => {
    if (v) setForm({ name: initial?.name ?? "", description: initial?.description ?? "", room_id: initial?.room_id ?? "" });
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Location" : "Add Location"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Room *</Label>
            <Select value={form.room_id} onValueChange={(v) => setForm({ ...form, room_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select room" /></SelectTrigger>
              <SelectContent>
                {rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Name *</Label>
            <Input placeholder="e.g. Bookshelf" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label>Description</Label>
            <Input placeholder="Optional description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={loading || !form.name.trim() || !form.room_id}>
            {loading ? "Saving..." : initial ? "Save Changes" : "Add Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Locations() {
  const qc = useQueryClient();
  const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set());
  const [roomModal, setRoomModal] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [deleteRoom_, setDeleteRoom_] = useState<Room | null>(null);
  const [locationModal, setLocationModal] = useState(false);
  const [editLocation, setEditLocation] = useState<Location | null>(null);
  const [deleteLocation_, setDeleteLocation_] = useState<Location | null>(null);
  const [prefillRoomId, setPrefillRoomId] = useState<string>("");

  const { data: rooms = [], isLoading } = useQuery({ queryKey: ["rooms"], queryFn: fetchRooms });

  const createRoomMutation = useMutation({
    mutationFn: (v: RoomForm) => createRoom({ name: v.name, description: v.description || undefined, floor: v.floor ? Number(v.floor) : undefined }),
    onSuccess: () => { toast.success("Room added"); qc.invalidateQueries({ queryKey: ["rooms"] }); setRoomModal(false); },
    onError: () => toast.error("Failed to add room"),
  });
  const updateRoomMutation = useMutation({
    mutationFn: (v: RoomForm) => updateRoom(editRoom!.id, { name: v.name, description: v.description || undefined, floor: v.floor ? Number(v.floor) : undefined }),
    onSuccess: () => { toast.success("Room updated"); qc.invalidateQueries({ queryKey: ["rooms"] }); setEditRoom(null); setRoomModal(false); },
    onError: () => toast.error("Failed to update room"),
  });
  const deleteRoomMutation = useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => { toast.success("Room deleted"); qc.invalidateQueries({ queryKey: ["rooms"] }); setDeleteRoom_(null); },
    onError: () => toast.error("Failed to delete room"),
  });

  const createLocationMutation = useMutation({
    mutationFn: (v: LocationForm) => createLocation({ room_id: v.room_id, name: v.name, description: v.description || undefined }),
    onSuccess: () => { toast.success("Location added"); qc.invalidateQueries({ queryKey: ["rooms"] }); qc.invalidateQueries({ queryKey: ["locations"] }); setLocationModal(false); },
    onError: () => toast.error("Failed to add location"),
  });
  const updateLocationMutation = useMutation({
    mutationFn: (v: LocationForm) => updateLocation(editLocation!.id, { name: v.name, description: v.description || undefined, room_id: v.room_id }),
    onSuccess: () => { toast.success("Location updated"); qc.invalidateQueries({ queryKey: ["rooms"] }); qc.invalidateQueries({ queryKey: ["locations"] }); setEditLocation(null); setLocationModal(false); },
    onError: () => toast.error("Failed to update location"),
  });
  const deleteLocationMutation = useMutation({
    mutationFn: (id: string) => deleteLocation(id),
    onSuccess: () => { toast.success("Location deleted"); qc.invalidateQueries({ queryKey: ["rooms"] }); qc.invalidateQueries({ queryKey: ["locations"] }); setDeleteLocation_(null); },
    onError: () => toast.error("Failed to delete location"),
  });

  const toggleRoom = (id: string) => {
    setExpandedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const roomLoading = createRoomMutation.isPending || updateRoomMutation.isPending;
  const locationLoading = createLocationMutation.isPending || updateLocationMutation.isPending;

  return (
    <div className="flex-1 h-screen flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Locations</h2>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setPrefillRoomId(""); setEditLocation(null); setLocationModal(true); }}
            >
              <MapPin className="w-4 h-4 mr-1" /> Add Location
            </Button>
            <Button size="sm" onClick={() => { setEditRoom(null); setRoomModal(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Room
            </Button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto px-8 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Home className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="text-lg font-medium">No rooms yet</p>
            <p className="text-sm mt-1">Start by adding your first room.</p>
            <Button className="mt-4" onClick={() => { setEditRoom(null); setRoomModal(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Room
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {rooms.map((room) => {
              const isExpanded = expandedRooms.has(room.id);
              return (
                <div key={room.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors"
                    onClick={() => toggleRoom(room.id)}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <Home className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="font-semibold text-slate-900">{room.name}</p>
                        {room.description && <p className="text-xs text-slate-500">{room.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {room.locations?.length ?? 0} locations
                        {room.floor != null ? ` · Floor ${room.floor}` : ""}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="text-slate-400 hover:text-slate-600 p-1 rounded">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditRoom(room); setRoomModal(true); }}>
                            Edit Room
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setPrefillRoomId(room.id); setEditLocation(null); setLocationModal(true); }}>
                            Add Location
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteRoom_(room); }}>
                            Delete Room
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100">
                      {!room.locations || room.locations.length === 0 ? (
                        <div className="px-12 py-4 text-sm text-slate-400">No locations in this room.</div>
                      ) : (
                        room.locations.map((loc) => (
                          <div
                            key={loc.id}
                            className="flex items-center justify-between px-12 py-3 hover:bg-slate-50 border-t border-slate-100 first:border-t-0"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-sm font-medium text-slate-800">{loc.name}</p>
                                {loc.description && <p className="text-xs text-slate-500">{loc.description}</p>}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="text-slate-400 hover:text-slate-600 p-1 rounded">
                                  <MoreHorizontal className="w-4 h-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setEditLocation(loc); setLocationModal(true); }}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => setDeleteLocation_(loc)}>
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <RoomModal
        open={roomModal}
        onOpenChange={(v) => { setRoomModal(v); if (!v) setEditRoom(null); }}
        initial={editRoom}
        onSubmit={(v) => editRoom ? updateRoomMutation.mutate(v) : createRoomMutation.mutate(v)}
        loading={roomLoading}
      />

      <LocationModal
        open={locationModal}
        onOpenChange={(v) => { setLocationModal(v); if (!v) { setEditLocation(null); setPrefillRoomId(""); } }}
        initial={editLocation ?? (prefillRoomId ? { id: "", name: "", description: null, room_id: prefillRoomId, created_at: "" } : null)}
        rooms={rooms}
        onSubmit={(v) => editLocation ? updateLocationMutation.mutate(v) : createLocationMutation.mutate(v)}
        loading={locationLoading}
      />

      <ConfirmDialog
        open={!!deleteRoom_}
        onOpenChange={(v) => !v && setDeleteRoom_(null)}
        title="Delete room?"
        description={`"${deleteRoom_?.name}" and all its locations will be permanently deleted.`}
        onConfirm={() => deleteRoom_ && deleteRoomMutation.mutate(deleteRoom_.id)}
        loading={deleteRoomMutation.isPending}
      />

      <ConfirmDialog
        open={!!deleteLocation_}
        onOpenChange={(v) => !v && setDeleteLocation_(null)}
        title="Delete location?"
        description={`"${deleteLocation_?.name}" will be permanently deleted.`}
        onConfirm={() => deleteLocation_ && deleteLocationMutation.mutate(deleteLocation_.id)}
        loading={deleteLocationMutation.isPending}
      />
    </div>
  );
}
