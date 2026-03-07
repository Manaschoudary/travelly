"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import useAdminCrud from "@/hooks/use-admin-crud";

interface Testimonial {
  _id: string;
  name: string;
  initials: string;
  destination: string;
  rating: number;
  color: string;
  review: string;
  isActive: boolean;
  order: number;
}

const defaultForm = {
  name: "",
  initials: "",
  destination: "",
  rating: 5,
  color: "#2EC4B6",
  review: "",
  order: 0,
  isActive: true,
};

export default function AdminTestimonialsPage() {
  const { theme } = useTheme();
  const light = theme === "light";
  const { items, loading, saving, error, createItem, updateItem, deleteItem, toggleActive } =
    useAdminCrud<Testimonial>({ apiPath: "/api/admin/testimonials", dataKey: "testimonials" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setForm({
      name: t.name,
      initials: t.initials,
      destination: t.destination,
      rating: t.rating,
      color: t.color,
      review: t.review,
      order: t.order,
      isActive: t.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const body = { ...form, rating: Number(form.rating), order: Number(form.order) };
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
          <h1 className="text-2xl font-bold text-foreground">Testimonials</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage traveler reviews</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Review
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
          <p className="text-muted-foreground">No testimonials yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((t) => (
            <Card
              key={t._id}
              className={cn(
                "p-5 rounded-2xl border transition-all",
                light ? "bg-white border-gray-200" : "bg-white/5 border-white/10",
                !t.isActive && "opacity-50"
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: t.color }}
                >
                  {t.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("font-semibold text-sm truncate", light ? "text-[#1A1A2E]" : "text-white")}>
                    {t.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Traveled to {t.destination}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={cn("w-3 h-3", j < t.rating ? "text-[#FFD166] fill-[#FFD166]" : "text-muted-foreground")}
                    />
                  ))}
                </div>
              </div>
              <p className={cn("text-sm leading-relaxed line-clamp-3", light ? "text-gray-600" : "text-white/60")}>
                &ldquo;{t.review}&rdquo;
              </p>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={() => toggleActive(t._id, t.isActive)} className="h-8 px-2">
                  {t.isActive ? <Eye className="w-3.5 h-3.5 text-[#2EC4B6]" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(t)} className="h-8 px-2">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(t._id)} className="h-8 px-2 text-red-500 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <span className="ml-auto text-[10px] text-muted-foreground">#{t.order}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn("rounded-2xl max-w-md", light ? "bg-white" : "bg-[#1A1A2E] border-white/10")}>
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>
              {editing ? "Edit Testimonial" : "Add Testimonial"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Priya Sharma" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Initials</Label>
                <Input value={form.initials} onChange={(e) => setForm({ ...form, initials: e.target.value })} placeholder="PS" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Destination</Label>
                <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Goa" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Rating (1-5)</Label>
                <Input type="number" min={1} max={5} step={0.5} value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Avatar Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={cn("flex-1", !light && "bg-white/5 border-white/10 text-white")} />
                </div>
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={inputClass} />
              </div>
            </div>
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Review</Label>
              <Textarea value={form.review} onChange={(e) => setForm({ ...form, review: e.target.value })} rows={3} className={inputClass} />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="testimonial-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              <Label htmlFor="testimonial-active" className={light ? "text-gray-700" : "text-white/70"}>Active</Label>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.name || !form.initials || !form.destination || !form.review}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Save Changes" : "Add Testimonial"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className={cn("rounded-2xl max-w-sm", light ? "bg-white" : "bg-[#1A1A2E] border-white/10")}>
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>Delete Testimonial?</DialogTitle>
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
