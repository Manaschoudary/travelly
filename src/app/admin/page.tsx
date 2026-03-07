import connectDB from "@/lib/db/mongoose";
import {
  Photo,
  GroupTrip,
  Testimonial,
  Destination,
  GroupPackage,
} from "@/lib/db/models";
import AdminDashboardCards from "@/components/admin/AdminDashboardCards";

async function getCounts() {
  await connectDB();
  const [photos, trips, testimonials, destinations, packages] =
    await Promise.all([
      Photo.countDocuments(),
      GroupTrip.countDocuments(),
      Testimonial.countDocuments(),
      Destination.countDocuments(),
      GroupPackage.countDocuments(),
    ]);
  return { photos, trips, testimonials, destinations, packages };
}

const cardMeta = [
  { key: "photos" as const, label: "Photos", href: "/admin/photos", color: "#FFD166", iconName: "Camera" },
  { key: "trips" as const, label: "Group Trips", href: "/admin/trips", color: "#2EC4B6", iconName: "Map" },
  { key: "testimonials" as const, label: "Testimonials", href: "/admin/testimonials", color: "#FF6B35", iconName: "MessageSquare" },
  { key: "destinations" as const, label: "Destinations", href: "/admin/destinations", color: "#0F4C81", iconName: "Compass" },
  { key: "packages" as const, label: "Packages", href: "/admin/packages", color: "#FF8C61", iconName: "Package" },
];

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  const cards = cardMeta.map((meta) => ({
    label: meta.label,
    href: meta.href,
    color: meta.color,
    iconName: meta.iconName,
    count: counts[meta.key],
  }));

  return (
    <div className="max-w-5xl mx-auto pt-4 lg:pt-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your site content from here
        </p>
      </div>

      <AdminDashboardCards cards={cards} />
    </div>
  );
}
