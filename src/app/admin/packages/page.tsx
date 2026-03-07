"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff, Check, X } from "lucide-react";
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

interface GroupPackage {
  _id: string;
  title: string;
  emoji: string;
  tagline: string;
  groupSize: string;
  from: number;
  color: string;
  popular: boolean;
  inclusions: string[];
  isActive: boolean;
  order: number;
}

const defaultForm = {
  title: "",
  emoji: "",
  tagline: "",
  groupSize: "",
  from: 0,
  color: "#FF6B35",
  popular: false,
  inclusions: [] as string[],
  order: 0,
  isActive: true,
};

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function AdminPackagesPage() {
  const { theme } = useTheme();
  const light = theme === "light";
  const { items, loading, saving, error, createItem, updateItem, deleteItem, toggleActive } =
    useAdminCrud<GroupPackage>({ apiPath: "/api/admin/packages", dataKey: "packages" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GroupPackage | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newInclusion, setNewInclusion] = useState("");

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (p: GroupPackage) => {
    setEditing(p);
    setForm({
      title: p.title,
      emoji: p.emoji,
      tagline: p.tagline,
      groupSize: p.groupSize,
      from: p.from,
      color: p.color,
      popular: p.popular,
      inclusions: [...p.inclusions],
      order: p.order,
      isActive: p.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const body = { ...form, from: Number(form.from), order: Number(form.order) };
    const success = editing ? await updateItem(editing._id, body) : await createItem(body);
    if (success) setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteItem(deleteId);
    setDeleteId(null);
  };

  const addInclusion = () => {
    const trimmed = newInclusion.trim();
    if (!trimmed) return;
    setForm({ ...form, inclusions: [...form.inclusions, trimmed] });
    setNewInclusion("");
  };

  const removeInclusion = (index: number) => {
    setForm({ ...form, inclusions: form.inclusions.filter((_, i) => i !== index) });
  };

  const inputClass = cn("mt-1", !light && "bg-white/5 border-white/10 text-white");

  return (
    <div className="max-w-5xl mx-auto pt-4 lg:pt-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage group travel packages</p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Package
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
          <p className="text-muted-foreground">No packages yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <Card
              key={p._id}
              className={cn(
                "relative p-5 rounded-2xl border transition-all",
                p.popular
                  ? light
                    ? "border-[#2EC4B6] shadow-lg shadow-[#2EC4B6]/10 bg-white"
                    : "border-[#2EC4B6] shadow-lg shadow-[#2EC4B6]/10 bg-white/5"
                  : light
                    ? "bg-white border-gray-200"
                    : "bg-white/5 border-white/10",
                !p.isActive && "opacity-50"
              )}
            >
              {p.popular && (
                <Badge className="absolute -top-3 right-4 bg-gradient-to-r from-[#2EC4B6] to-[#0F4C81] text-white border-0 px-3 text-[10px]">
                  Popular
                </Badge>
              )}
              <div className="text-center mb-4">
                <span className="text-4xl mb-2 block">{p.emoji}</span>
                <h3 className={cn("text-lg font-bold", light ? "text-[#1A1A2E]" : "text-white")}>{p.title}</h3>
                <p className={cn("text-xs mt-0.5", light ? "text-gray-500" : "text-white/50")}>{p.tagline}</p>
                <Badge variant="outline" className={cn("mt-1 text-[10px]", light ? "text-gray-500 border-gray-200" : "text-white/50 border-white/20")}>
                  {p.groupSize}
                </Badge>
              </div>
              <div className="space-y-1.5 mb-3">
                {p.inclusions.slice(0, 3).map((item) => (
                  <div key={item} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: p.color }} />
                    <span className={cn("text-xs", light ? "text-gray-600" : "text-white/60")}>{item}</span>
                  </div>
                ))}
                {p.inclusions.length > 3 && (
                  <p className={cn("text-[10px] pl-5", light ? "text-gray-400" : "text-white/40")}>
                    +{p.inclusions.length - 3} more
                  </p>
                )}
              </div>
              <div className={cn("text-center pt-3 border-t", light ? "border-gray-100" : "border-white/10")}>
                <p className={cn("text-xs", light ? "text-gray-400" : "text-white/40")}>From</p>
                <p className={cn("text-lg font-bold", light ? "text-[#1A1A2E]" : "text-white")}>
                  {formatINR(p.from)}
                  <span className={cn("text-xs font-normal", light ? "text-gray-400" : "text-white/40")}>/person</span>
                </p>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Button variant="ghost" size="sm" onClick={() => toggleActive(p._id, p.isActive)} className="h-8 px-2">
                  {p.isActive ? <Eye className="w-3.5 h-3.5 text-[#2EC4B6]" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="h-8 px-2">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteId(p._id)} className="h-8 px-2 text-red-500 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
                <span className="ml-auto text-[10px] text-muted-foreground">#{p.order}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn("rounded-2xl max-w-md max-h-[85vh] overflow-y-auto", light ? "bg-white" : "bg-[#1A1A2E] border-white/10")}>
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>
              {editing ? "Edit Package" : "Add Package"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Friends Trip" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Emoji</Label>
                <Input value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} placeholder="🎉" className={inputClass} />
              </div>
            </div>
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Adventure with your squad" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Group Size</Label>
                <Input value={form.groupSize} onChange={(e) => setForm({ ...form, groupSize: e.target.value })} placeholder="4–8 people" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Price From</Label>
                <Input type="number" value={form.from} onChange={(e) => setForm({ ...form, from: Number(e.target.value) })} className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Brand Color</Label>
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
              <Label className={light ? "text-gray-700" : "text-white/70"}>Inclusions</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={newInclusion}
                  onChange={(e) => setNewInclusion(e.target.value)}
                  placeholder="Add an inclusion..."
                  className={cn("flex-1", !light && "bg-white/5 border-white/10 text-white")}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInclusion(); } }}
                />
                <Button type="button" onClick={addInclusion} size="sm" variant="outline" className={cn("shrink-0", !light && "border-white/10 text-white hover:bg-white/10")}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.inclusions.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {form.inclusions.map((item, i) => (
                    <div key={i} className={cn("flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg", light ? "bg-gray-50" : "bg-white/5")}>
                      <Check className="w-3.5 h-3.5 shrink-0" style={{ color: form.color }} />
                      <span className={cn("flex-1", light ? "text-gray-700" : "text-white/70")}>{item}</span>
                      <button onClick={() => removeInclusion(i)} className="text-red-500 hover:text-red-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pkg-popular" checked={form.popular} onChange={(e) => setForm({ ...form, popular: e.target.checked })} className="rounded" />
                <Label htmlFor="pkg-popular" className={light ? "text-gray-700" : "text-white/70"}>Popular</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="pkg-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
                <Label htmlFor="pkg-active" className={light ? "text-gray-700" : "text-white/70"}>Active</Label>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={saving || !form.title || !form.emoji || !form.tagline || !form.groupSize || !form.from}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Save Changes" : "Add Package"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className={cn("rounded-2xl max-w-sm", light ? "bg-white" : "bg-[#1A1A2E] border-white/10")}>
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>Delete Package?</DialogTitle>
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
