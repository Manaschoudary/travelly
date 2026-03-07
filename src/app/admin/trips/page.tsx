"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/ThemeProvider";
import useAdminCrud from "@/hooks/use-admin-crud";

interface GroupTrip {
  _id: string;
  type: "past" | "upcoming";
  title: string;
  destination: string;
  date: string;
  duration: string;
  groupSize: number | string;
  gradient: string;
  rating?: number;
  highlights?: string[];
  testimonial?: string;
  attendeeName?: string;
  price?: number;
  originalPrice?: number;
  spotsTotal?: number;
  spotsLeft?: number;
  itinerary?: { day: number; title: string; description: string }[];
  inclusions?: string[];
  exclusions?: string[];
  isActive: boolean;
  order: number;
}

const defaultForm = {
  type: "upcoming" as "past" | "upcoming",
  title: "",
  destination: "",
  date: "",
  duration: "",
  groupSize: "",
  gradient: "from-teal-400 to-emerald-600",
  rating: "",
  highlights: "",
  testimonial: "",
  attendeeName: "",
  price: "",
  originalPrice: "",
  spotsTotal: "",
  spotsLeft: "",
  itineraryText: "",
  inclusionsText: "",
  exclusionsText: "",
  order: 0,
  isActive: true,
};

const formatINR = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

export default function AdminTripsPage() {
  const { theme } = useTheme();
  const light = theme === "light";
  const { items, loading, saving, error, createItem, updateItem, deleteItem, toggleActive } =
    useAdminCrud<GroupTrip>({ apiPath: "/api/admin/trips", dataKey: "trips" });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<GroupTrip | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "past" | "upcoming">("all");

  const filtered = filterType === "all" ? items : items.filter((t) => t.type === filterType);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (trip: GroupTrip) => {
    setEditing(trip);
    setForm({
      type: trip.type,
      title: trip.title,
      destination: trip.destination,
      date: trip.date,
      duration: trip.duration,
      groupSize: String(trip.groupSize),
      gradient: trip.gradient,
      rating: trip.rating != null ? String(trip.rating) : "",
      highlights: trip.highlights?.join("\n") || "",
      testimonial: trip.testimonial || "",
      attendeeName: trip.attendeeName || "",
      price: trip.price != null ? String(trip.price) : "",
      originalPrice: trip.originalPrice != null ? String(trip.originalPrice) : "",
      spotsTotal: trip.spotsTotal != null ? String(trip.spotsTotal) : "",
      spotsLeft: trip.spotsLeft != null ? String(trip.spotsLeft) : "",
      itineraryText: trip.itinerary?.map((d) => `Day ${d.day}: ${d.title} | ${d.description}`).join("\n") || "",
      inclusionsText: trip.inclusions?.join("\n") || "",
      exclusionsText: trip.exclusions?.join("\n") || "",
      order: trip.order,
      isActive: trip.isActive,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const body: Record<string, unknown> = {
      type: form.type,
      title: form.title,
      destination: form.destination,
      date: form.date,
      duration: form.duration,
      groupSize: form.groupSize,
      gradient: form.gradient,
      order: Number(form.order),
      isActive: form.isActive,
    };

    if (form.rating) body.rating = Number(form.rating);
    if (form.highlights.trim()) body.highlights = form.highlights.split("\n").filter(Boolean);
    if (form.testimonial) body.testimonial = form.testimonial;
    if (form.attendeeName) body.attendeeName = form.attendeeName;
    if (form.price) body.price = Number(form.price);
    if (form.originalPrice) body.originalPrice = Number(form.originalPrice);
    if (form.spotsTotal) body.spotsTotal = Number(form.spotsTotal);
    if (form.spotsLeft) body.spotsLeft = Number(form.spotsLeft);
    if (form.inclusionsText.trim()) body.inclusions = form.inclusionsText.split("\n").filter(Boolean);
    if (form.exclusionsText.trim()) body.exclusions = form.exclusionsText.split("\n").filter(Boolean);

    if (form.itineraryText.trim()) {
      body.itinerary = form.itineraryText.split("\n").filter(Boolean).map((line, idx) => {
        const match = line.match(/^Day\s*(\d+):\s*(.+?)\s*\|\s*(.+)$/i);
        if (match) return { day: Number(match[1]), title: match[2].trim(), description: match[3].trim() };
        return { day: idx + 1, title: line.trim(), description: "" };
      });
    }

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
          <h1 className="text-2xl font-bold text-foreground">Group Trips</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage past and upcoming group trips
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Trip
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              filterType === t
                ? "bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white"
                : light
                  ? "text-gray-500 bg-gray-100 hover:text-[#1A1A2E]"
                  : "text-white/60 bg-white/5 hover:text-white"
            )}
          >
            {t === "all" ? "All" : t === "upcoming" ? "Upcoming" : "Past"}
          </button>
        ))}
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
      ) : filtered.length === 0 ? (
        <Card className={cn("p-12 text-center rounded-2xl border", light ? "bg-white border-gray-200" : "bg-white/5 border-white/10")}>
          <p className="text-muted-foreground">No trips found.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((trip) => (
            <Card
              key={trip._id}
              className={cn(
                "rounded-2xl border overflow-hidden transition-all",
                light ? "bg-white border-gray-200" : "bg-white/5 border-white/10",
                !trip.isActive && "opacity-50"
              )}
            >
              <div className="flex flex-col sm:flex-row">
                <div className={`w-full sm:w-40 h-24 sm:h-auto bg-gradient-to-br ${trip.gradient} shrink-0`} />
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={cn("font-semibold", light ? "text-[#1A1A2E]" : "text-white")}>
                          {trip.title}
                        </h3>
                        <Badge
                          className={cn(
                            "text-[10px] border-0",
                            trip.type === "upcoming"
                              ? "bg-[#2EC4B6]/20 text-[#2EC4B6]"
                              : "bg-[#0F4C81]/20 text-[#0F4C81]"
                          )}
                        >
                          {trip.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {trip.destination} &middot; {trip.date} &middot; {trip.duration}
                      </p>
                      {trip.price != null && (
                        <p className="text-sm font-semibold text-[#2EC4B6] mt-1">
                          {formatINR(trip.price)}
                          {trip.originalPrice != null && (
                            <span className="text-xs text-muted-foreground line-through ml-2">
                              {formatINR(trip.originalPrice)}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(trip._id, trip.isActive)} className="h-8 px-2">
                        {trip.isActive ? <Eye className="w-3.5 h-3.5 text-[#2EC4B6]" /> : <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(trip)} className="h-8 px-2">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(trip._id)} className="h-8 px-2 text-red-500 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn("rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto", light ? "bg-white" : "bg-[#1A1A2E] border-white/10")}>
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>
              {editing ? "Edit Trip" : "Add Trip"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "past" | "upcoming" })}>
                <SelectTrigger className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Kashmir Valley Explorer" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Destination</Label>
                <Input value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} placeholder="Srinagar, Kashmir" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Date</Label>
                <Input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="15 Apr 2026" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Duration</Label>
                <Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="6 Days" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Group Size</Label>
                <Input value={form.groupSize} onChange={(e) => setForm({ ...form, groupSize: e.target.value })} placeholder="8-15 people" className={inputClass} />
              </div>
              <div>
                <Label className={light ? "text-gray-700" : "text-white/70"}>Order</Label>
                <Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: Number(e.target.value) })} className={inputClass} />
              </div>
            </div>
            <div>
              <Label className={light ? "text-gray-700" : "text-white/70"}>Gradient</Label>
              <Input value={form.gradient} onChange={(e) => setForm({ ...form, gradient: e.target.value })} placeholder="from-teal-400 to-emerald-600" className={inputClass} />
              <div className={`mt-2 h-8 rounded-lg bg-gradient-to-br ${form.gradient}`} />
            </div>

            {form.type === "past" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={light ? "text-gray-700" : "text-white/70"}>Rating</Label>
                    <Input value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} placeholder="4.9" className={inputClass} />
                  </div>
                  <div>
                    <Label className={light ? "text-gray-700" : "text-white/70"}>Attendee Name</Label>
                    <Input value={form.attendeeName} onChange={(e) => setForm({ ...form, attendeeName: e.target.value })} placeholder="Rohit M." className={inputClass} />
                  </div>
                </div>
                <div>
                  <Label className={light ? "text-gray-700" : "text-white/70"}>Highlights (one per line)</Label>
                  <Textarea value={form.highlights} onChange={(e) => setForm({ ...form, highlights: e.target.value })} placeholder="Pangong Lake camping&#10;Khardung La Pass ride" rows={3} className={inputClass} />
                </div>
                <div>
                  <Label className={light ? "text-gray-700" : "text-white/70"}>Testimonial</Label>
                  <Textarea value={form.testimonial} onChange={(e) => setForm({ ...form, testimonial: e.target.value })} rows={2} className={inputClass} />
                </div>
              </>
            )}

            {form.type === "upcoming" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={light ? "text-gray-700" : "text-white/70"}>Price (INR)</Label>
                    <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="32999" className={inputClass} />
                  </div>
                  <div>
                    <Label className={light ? "text-gray-700" : "text-white/70"}>Original Price</Label>
                    <Input value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: e.target.value })} placeholder="42999" className={inputClass} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className={light ? "text-gray-700" : "text-white/70"}>Spots Total</Label>
                    <Input value={form.spotsTotal} onChange={(e) => setForm({ ...form, spotsTotal: e.target.value })} placeholder="15" className={inputClass} />
                  </div>
                  <div>
                    <Label className={light ? "text-gray-700" : "text-white/70"}>Spots Left</Label>
                    <Input value={form.spotsLeft} onChange={(e) => setForm({ ...form, spotsLeft: e.target.value })} placeholder="4" className={inputClass} />
                  </div>
                </div>
                <div>
                  <Label className={light ? "text-gray-700" : "text-white/70"}>Itinerary (Day N: Title | Description)</Label>
                  <Textarea value={form.itineraryText} onChange={(e) => setForm({ ...form, itineraryText: e.target.value })} placeholder={"Day 1: Arrival | Airport pickup, check into hotel\nDay 2: Exploration | Visit local attractions"} rows={4} className={inputClass} />
                </div>
                <div>
                  <Label className={light ? "text-gray-700" : "text-white/70"}>Inclusions (one per line)</Label>
                  <Textarea value={form.inclusionsText} onChange={(e) => setForm({ ...form, inclusionsText: e.target.value })} placeholder={"All meals included\nAirport transfers"} rows={3} className={inputClass} />
                </div>
                <div>
                  <Label className={light ? "text-gray-700" : "text-white/70"}>Exclusions (one per line)</Label>
                  <Textarea value={form.exclusionsText} onChange={(e) => setForm({ ...form, exclusionsText: e.target.value })} placeholder={"Flights to destination\nTravel insurance"} rows={3} className={inputClass} />
                </div>
              </>
            )}

            <div className="flex items-center gap-2">
              <input type="checkbox" id="trip-active" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded" />
              <Label htmlFor="trip-active" className={light ? "text-gray-700" : "text-white/70"}>Active</Label>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving || !form.title || !form.destination || !form.date || !form.duration || !form.gradient}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white rounded-full"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editing ? "Save Changes" : "Add Trip"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className={cn("rounded-2xl max-w-sm", light ? "bg-white" : "bg-[#1A1A2E] border-white/10")}>
          <DialogHeader>
            <DialogTitle className={light ? "text-[#1A1A2E]" : "text-white"}>Delete Trip?</DialogTitle>
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
