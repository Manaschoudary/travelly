"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import useAdminCrud from "@/hooks/use-admin-crud";

interface Photo {
  _id: string;
  title: string;
  location: string;
  category: string;
  gradient: string;
  span: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
}

const defaultForm = {
  title: "",
  location: "",
  category: "",
  gradient: "from-amber-400 to-orange-600",
  span: "col-span-1 row-span-1",
  imageUrl: "",
  order: 0,
  isActive: true,
};

export default function AdminPhotosPage() {
  const { theme } = useTheme();
  const light = theme === "light";
  const { items, loading, saving, error, createItem, updateItem, deleteItem, toggleActive } =
    useAdminCrud<Photo>({ apiPath: "/api/admin/photos", dataKey: "photos" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (photo: Photo) => {
    setEditing(photo);
    setForm({
      title: photo.title,
      location: photo.location,
      category: photo.category,
      gradient: photo.gradient,
      span: photo.span,
      imageUrl: photo.imageUrl || "",
      order: photo.order,
      isActive: photo.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const body = { ...form, order: Number(form.order) };
    if (!body.imageUrl) delete (body as Record<string, unknown>).imageUrl;

    const success = editing
      ? await updateItem(editing._id, body)
      : await createItem(body);

    if (success) setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteItem(deleteId);
    setDeleteId(null);
  };

  return (
    <div className="max-w-5xl mx-auto pt-4 lg:pt-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Photos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your photo gallery
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Photo
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card
          className={cn(
            "p-12 text-center rounded-2xl border",
            light ? "bg-white border-gray-200" : "bg-white/5 border-white/10"
          )}
        >
          <p className="text-muted-foreground">No photos yet. Add your first photo!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((photo) => (
            <Card
              key={photo._id}
              className={cn(
                "overflow-hidden rounded-2xl border transition-all",
                light ? "bg-white border-gray-200" : "bg-white/5 border-white/10",
                !photo.isActive && "opacity-50"
              )}
            >
              <div className={`h-32 bg-gradient-to-br ${photo.gradient} relative`}>
                <Badge className="absolute top-2 right-2 bg-black/30 backdrop-blur-sm text-white border-0 text-[10px]">
                  {photo.category}
                </Badge>
                {photo.span !== "col-span-1 row-span-1" && (
                  <Badge className="absolute top-2 left-2 bg-black/30 backdrop-blur-sm text-white border-0 text-[10px]">
                    {photo.span}
                  </Badge>
                )}
              </div>
              <div className="p-4">
                <h3
                  className={cn(
                    "font-semibold text-sm truncate",
                    light ? "text-[#1A1A2E]" : "text-white"
                  )}
                >
                  {photo.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{photo.location}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleActive(photo._id, photo.isActive)}
                    className="h-8 px-2"
                  >
                    {photo.isActive ? (
                      <Eye className="w-3.5 h-3.5 text-[#2EC4B6]" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(photo)}
                    className="h-8 px-2"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteId(photo._id)}
                    className="h-8 px-2 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    #{photo.order}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className={cn(
            "rounded-2xl max-w-md",
            light ? "bg-white" : "bg-[#1A1A2E] border-white/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>
              {editing ? "Edit Photo" : "Add Photo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Golden Hour at Taj Mahal"
                className={cn("mt-1", !light && "bg-white/5 border-white/10 text-white")}
              />
            </div>
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Location</Label>
              <Input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Agra, India"
                className={cn("mt-1", !light && "bg-white/5 border-white/10 text-white")}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Category</Label>
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Heritage"
                  className={cn("mt-1", !light && "bg-white/5 border-white/10 text-white")}
                />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Order</Label>
                <Input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                  className={cn("mt-1", !light && "bg-white/5 border-white/10 text-white")}
                />
              </div>
            </div>
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Gradient</Label>
              <Input
                value={form.gradient}
                onChange={(e) => setForm({ ...form, gradient: e.target.value })}
                placeholder="from-amber-400 to-orange-600"
                className={cn("mt-1", !light && "bg-white/5 border-white/10 text-white")}
              />
              <div className={`mt-2 h-8 rounded-lg bg-gradient-to-br ${form.gradient}`} />
            </div>
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Span (CSS grid)</Label>
              <Input
                value={form.span}
                onChange={(e) => setForm({ ...form, span: e.target.value })}
                placeholder="col-span-2 row-span-2"
                className={cn("mt-1", !light && "bg-white/5 border-white/10 text-white")}
              />
            </div>
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Image URL (optional)</Label>
              <Input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://..."
                className={cn("mt-1", !light && "bg-white/5 border-white/10 text-white")}
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="photo-active"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="photo-active" className={light ? "text-gray-700" : "text-white/70"}>
                Active (visible on site)
              </Label>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.title || !form.location || !form.category || !form.gradient}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Save Changes" : "Add Photo"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent
          className={cn(
            "rounded-2xl max-w-sm",
            light ? "bg-white" : "bg-[#1A1A2E] border-white/10"
          )}
        >
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>
              Delete Photo?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              className={cn("flex-1 rounded-full", !light && "border-white/10 text-white hover:bg-white/10")}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={saving}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-full"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
