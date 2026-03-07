"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import useAdminCrud from "@/hooks/use-admin-crud";

interface Destination {
  _id: string;
  name: string;
  tag: string;
  emoji: string;
  from: number;
  rating: number;
  gradient: string;
  description: string;
  isActive: boolean;
  order: number;
}

const defaultForm = {
  name: "",
  tag: "",
  emoji: "",
  from: 0,
  rating: 4.5,
  gradient: "from-cyan-500 to-blue-600",
  description: "",
  order: 0,
  isActive: true,
};

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function AdminDestinationsPage() {
  const { theme } = useTheme();
  const light = theme === "light";
  const { items, loading, saving, error, createItem, updateItem, deleteItem, toggleActive } =
    useAdminCrud<Destination>({ apiPath: "/api/admin/destinations", dataKey: "destinations" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (d: Destination) => {
    setEditing(d);
    setForm({
      name: d.name,
      tag: d.tag,
      emoji: d.emoji,
      from: d.from,
      rating: d.rating,
      gradient: d.gradient,
      description: d.description,
      order: d.order,
      isActive: d.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const body = { ...form, from: Number(form.from), rating: Number(form.rating), order: Number(form.order) };
    const success = editing ? await updateItem(editing._id, body) : await createItem(body);
    if (success) setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteItem(deleteId);
    setDeleteId(null);
  };

  const inputClass = cn("mt-1", !light && "bg-white/5 border-white/10 text-white");

  return (
    <div className="max-w-5xl mx-auto pt-4 lg:pt-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Destinations</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage trending destinations</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Destination
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className={cn("p-12 text-center rounded-2xl border", light ? "bg-white border-gray-200" : "bg-white/5 border-white/10")}>
          <p className="text-muted-foreground">No destinations yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((d) => (
            <Card
              key={d._id}
              className={cn(
                "overflow-hidden rounded-2xl border transition-all",
                light ? "bg-white border-gray-200" : "bg-white/5 border-white/10",
                !d.isActive && "opacity-50"
              )}
            >
              <div className={cn("h-28 bg-gradient-to-br flex items-center justify-center", d.gradient)}>
                <span className="text-5xl">{d.emoji}</span>
                <Badge className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white border-0 text-[10px]">
                  {d.tag}
                </Badge>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={cn("font-bold", light ? "text-[#1A1A2E]" : "text-white")}>{d.name}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-[#FFD166] fill-[#FFD166]" />
                    <span className={cn("text-xs", light ? "text-gray-500" : "text-white/70")}>{d.rating}</span>
                  </div>
                </div>
                <p className={cn("text-xs mb-2", light ? "text-gray-500" : "text-white/50")}>{d.description}</p>
                <p className="text-[#2EC4B6] font-semibold text-sm">from {formatINR(d.from)}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="ghost" size="sm" onClick={() => toggleActive(d._id, d.isActive)} className="h-8 px-2">
                    {d.isActive ? <Eye className="w-3.5 h-3.5 text-[#2EC4B6]" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(d)} className="h-8 px-2">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteId(d._id)} className="h-8 px-2 text-red-500 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <span className="ml-auto text-[10px] text-muted-foreground">#{d.order}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn("rounded-2xl max-w-md", light ? "bg-white" : "bg-[#1A1A2E] border-white/10")}>
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>
              {editing ? "Edit Destination" : "Add Destination"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Goa" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Tag</Label>
                <Input value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} placeholder="Beach" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Emoji</Label>
                <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🏖️" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Price From</Label>
                <Input type="number" value={form.from} onChange={(e) => setForm({ ...form, from: Number(e.target.value) })} className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Rating</Label>
                <Input type="number" min={1} max={5} step={0.1} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Gradient</Label>
                <Input value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })} placeholder="from-cyan-500 to-blue-600" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={inputClass} />
              </div>
            </div>
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Sun, sand & nightlife" className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="dest-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              <Label htmlFor="dest-active" className={light ? "text-gray-700" : "text-white/70"}>Active</Label>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.name || !form.tag || !form.emoji || !form.description || !form.from}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Save Changes" : "Add Destination"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className={cn("rounded-2xl max-w-sm", light ? "bg-white" : "bg-[#1A1A2E] border-white/10")}>
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>Delete Destination?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)} className={cn("flex-1 rounded-full", !light && "border-white/10 text-white hover:bg-white/10")}>Cancel</Button>
            <Button onClick={handleDelete} disabled={saving} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
