import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI!;

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  const PhotoModel = mongoose.models.Photo || mongoose.model("Photo", new mongoose.Schema({
    title: String, location: String, category: String, gradient: String,
    span: String, imageUrl: String, order: Number, isActive: Boolean,
  }, { timestamps: true }));

  const GroupTripModel = mongoose.models.GroupTrip || mongoose.model("GroupTrip", new mongoose.Schema({
    type: String, title: String, destination: String, date: String, duration: String,
    groupSize: mongoose.Schema.Types.Mixed, gradient: String, rating: Number,
    highlights: [String], testimonial: String, attendeeName: String,
    price: Number, originalPrice: Number, spotsTotal: Number, spotsLeft: Number,
    itinerary: [{ day: Number, title: String, description: String }],
    inclusions: [String], exclusions: [String], isActive: Boolean, order: Number,
  }, { timestamps: true }));

  const TestimonialModel = mongoose.models.Testimonial || mongoose.model("Testimonial", new mongoose.Schema({
    name: String, initials: String, destination: String, rating: Number,
    color: String, review: String, isActive: Boolean, order: Number,
  }, { timestamps: true }));

  const DestinationModel = mongoose.models.Destination || mongoose.model("Destination", new mongoose.Schema({
    name: String, tag: String, emoji: String, from: Number, rating: Number,
    gradient: String, description: String, isActive: Boolean, order: Number,
  }, { timestamps: true }));

  const GroupPackageModel = mongoose.models.GroupPackage || mongoose.model("GroupPackage", new mongoose.Schema({
    title: String, emoji: String, tagline: String, groupSize: String,
    from: Number, color: String, popular: Boolean, inclusions: [String],
    isActive: Boolean, order: Number,
  }, { timestamps: true }));

  const photos = [
    { title: "Golden Hour at Taj Mahal", location: "Agra, India", category: "Heritage", gradient: "from-amber-400 to-orange-600", span: "col-span-2 row-span-2", order: 0 },
    { title: "Misty Tea Plantations", location: "Munnar, Kerala", category: "Landscape", gradient: "from-green-400 to-emerald-600", span: "col-span-1 row-span-1", order: 1 },
    { title: "Varanasi at Dawn", location: "Varanasi, India", category: "Street", gradient: "from-orange-300 to-rose-500", span: "col-span-1 row-span-1", order: 2 },
    { title: "Snow Leopard Trail", location: "Hemis, Ladakh", category: "Wildlife", gradient: "from-slate-400 to-blue-800", span: "col-span-1 row-span-2", order: 3 },
    { title: "Holi Festival of Colors", location: "Mathura, India", category: "Culture", gradient: "from-pink-400 to-purple-600", span: "col-span-1 row-span-1", order: 4 },
    { title: "Backwaters at Sunset", location: "Alleppey, Kerala", category: "Landscape", gradient: "from-teal-400 to-cyan-600", span: "col-span-2 row-span-1", order: 5 },
    { title: "Desert Starscape", location: "Jaisalmer, Rajasthan", category: "Night", gradient: "from-indigo-600 to-violet-900", span: "col-span-1 row-span-1", order: 6 },
    { title: "Monks of Tawang", location: "Tawang, Arunachal Pradesh", category: "Portrait", gradient: "from-red-400 to-amber-500", span: "col-span-1 row-span-1", order: 7 },
    { title: "Living Root Bridges", location: "Cherrapunji, Meghalaya", category: "Nature", gradient: "from-lime-400 to-green-700", span: "col-span-1 row-span-1", order: 8 },
    { title: "Bali Rice Terraces", location: "Ubud, Bali", category: "Landscape", gradient: "from-emerald-300 to-teal-600", span: "col-span-1 row-span-1", order: 9 },
  ].map((p) => ({ ...p, isActive: true }));

  const pastTrips = [
    {
      type: "past", title: "Ladakh Expedition 2025", destination: "Leh, Ladakh", date: "Jun 2025", duration: "7 Days", groupSize: 12, rating: 4.9,
      highlights: ["Pangong Lake camping under the stars", "Khardung La Pass motorcycle ride", "Nubra Valley sand dunes", "Local monastery visits"],
      gradient: "from-sky-400 to-blue-700", testimonial: "The Ladakh trip was life-changing. The group vibes were incredible and the photography spots were unreal.", attendeeName: "Rohit M.", order: 0,
    },
    {
      type: "past", title: "Spiti Valley Circuit", destination: "Spiti, Himachal Pradesh", date: "Sep 2025", duration: "9 Days", groupSize: 10, rating: 4.8,
      highlights: ["Key Monastery sunrise shoot", "Chandratal Lake trek", "Chicham Bridge crossing", "Homestay in Langza village"],
      gradient: "from-slate-500 to-indigo-700", testimonial: "Spiti is raw and beautiful. The itinerary was perfectly paced \u2014 enough adventure with time to soak it all in.", attendeeName: "Ananya K.", order: 1,
    },
    {
      type: "past", title: "Meghalaya Exploration", destination: "Shillong, Meghalaya", date: "Nov 2025", duration: "6 Days", groupSize: 14, rating: 5.0,
      highlights: ["Double-decker living root bridge trek", "Dawki River crystal-clear kayaking", "Mawlynnong cleanest village visit", "Laitlum Canyon sunrise"],
      gradient: "from-emerald-400 to-green-700", testimonial: "Meghalaya blew my mind. The root bridges, the waterfalls, the food \u2014 everything was magical.", attendeeName: "Priya S.", order: 2,
    },
    {
      type: "past", title: "Hampi Heritage Trail", destination: "Hampi, Karnataka", date: "Dec 2025", duration: "5 Days", groupSize: 8, rating: 4.7,
      highlights: ["Virupaksha Temple golden hour shoot", "Coracle ride on Tungabhadra River", "Matanga Hill sunrise hike", "Boulder climbing & cave exploration"],
      gradient: "from-amber-400 to-orange-600", testimonial: "Hampi is an underrated gem. The photography opportunities were endless and the group was amazing.", attendeeName: "Vikram D.", order: 3,
    },
  ].map((t) => ({ ...t, isActive: true }));

  const upcomingTrips = [
    {
      type: "upcoming", title: "Kashmir Valley Explorer", destination: "Srinagar, Kashmir", date: "15 Apr 2026", duration: "6 Days / 5 Nights", price: 32999, originalPrice: 42999, spotsTotal: 15, spotsLeft: 4, groupSize: "8-15 people", gradient: "from-teal-400 to-emerald-600",
      itinerary: [
        { day: 1, title: "Arrival in Srinagar", description: "Airport pickup, check into luxury houseboat on Dal Lake. Evening shikara ride with golden hour photography session." },
        { day: 2, title: "Mughal Gardens & Old City", description: "Visit Nishat Bagh, Shalimar Bagh, and Chashme Shahi gardens. Afternoon walk through the old city bazaars and spice markets." },
        { day: 3, title: "Gulmarg Day Trip", description: "Drive to Gulmarg, ride the Gondola to Kongdoori. Snow photography, meadow walks, and local Kashmiri wazwan lunch." },
        { day: 4, title: "Pahalgam & Betaab Valley", description: "Full day in Pahalgam. Visit Betaab Valley, Aru Valley, and Chandanwari. River-side picnic lunch and landscape shoots." },
        { day: 5, title: "Sonmarg & Thajiwas Glacier", description: "Drive to Sonmarg, short trek to Thajiwas Glacier. Alpine meadow photography and optional pony ride to the glacier base." },
        { day: 6, title: "Departure Day", description: "Sunrise photography at Dal Lake, farewell breakfast on the houseboat. Airport transfers arranged." },
      ],
      inclusions: ["Luxury houseboat & hotel stays", "All meals (breakfast, lunch, dinner)", "Airport transfers & local transport", "Professional photography guidance", "Shikara ride & Gondola tickets", "Group photography sessions"],
      exclusions: ["Flights to/from Srinagar", "Personal expenses & shopping", "Travel insurance", "Optional pony rides"],
      order: 0,
    },
    {
      type: "upcoming", title: "Northeast India Discovery", destination: "Meghalaya & Assam", date: "10 May 2026", duration: "8 Days / 7 Nights", price: 38999, originalPrice: 49999, spotsTotal: 12, spotsLeft: 7, groupSize: "8-12 people", gradient: "from-lime-400 to-green-700",
      itinerary: [
        { day: 1, title: "Arrival in Guwahati", description: "Airport pickup, drive to Shillong. Evening walk at Police Bazaar and local Khasi cuisine dinner." },
        { day: 2, title: "Cherrapunji Waterfalls", description: "Visit Nohkalikai Falls, Seven Sisters Falls, and Mawsmai Cave. Overnight at eco-resort in Cherrapunji." },
        { day: 3, title: "Living Root Bridges", description: "Trek to the double-decker living root bridge in Nongriat. Natural pool swimming and jungle photography." },
        { day: 4, title: "Dawki & Mawlynnong", description: "Crystal-clear Dawki River boating, visit to Asia\u2019s cleanest village Mawlynnong. Sky walk experience." },
        { day: 5, title: "Laitlum Canyon & Shillong", description: "Sunrise at Laitlum Canyon for dramatic landscape shots. Afternoon exploring Shillong\u2019s cafes and music scene." },
        { day: 6, title: "Kaziranga National Park", description: "Drive to Kaziranga. Afternoon jeep safari in the Central Range. Spot one-horned rhinos and wild elephants." },
        { day: 7, title: "Kaziranga Elephant Safari", description: "Early morning elephant safari through tall grasslands. Second jeep safari in Eastern Range. Farewell bonfire dinner." },
        { day: 8, title: "Departure from Guwahati", description: "Morning drive to Guwahati. Visit Kamakhya Temple if time permits. Airport transfers." },
      ],
      inclusions: ["All accommodation (eco-resorts & lodges)", "All meals included", "Jeep & elephant safari fees", "All internal transfers", "Professional guide throughout", "Root bridge trek guide"],
      exclusions: ["Flights to/from Guwahati", "Personal expenses", "Travel insurance", "Camera fees at national park"],
      order: 1,
    },
    {
      type: "upcoming", title: "Rajasthan Heritage Circuit", destination: "Jaipur - Jodhpur - Jaisalmer", date: "1 Oct 2026", duration: "7 Days / 6 Nights", price: 29999, originalPrice: 39999, spotsTotal: 16, spotsLeft: 11, groupSize: "10-16 people", gradient: "from-yellow-400 to-orange-600",
      itinerary: [
        { day: 1, title: "Arrival in Jaipur", description: "Airport pickup, check into haveli. Evening visit to Nahargarh Fort for sunset views over the Pink City." },
        { day: 2, title: "Jaipur Forts & Palaces", description: "Amber Fort, Hawa Mahal, City Palace, and Jantar Mantar. Street photography in the old city markets." },
        { day: 3, title: "Jaipur to Jodhpur", description: "Drive to Jodhpur via Ajmer. Visit the Blue City lanes, clock tower market. Evening at Mehrangarh Fort." },
        { day: 4, title: "Jodhpur Exploration", description: "Mehrangarh Fort interior tour, Jaswant Thada, blue city walking tour. Rajasthani thali dinner with folk music." },
        { day: 5, title: "Jodhpur to Jaisalmer", description: "Drive through the Thar Desert to Jaisalmer. Evening walk through the golden fort. Rooftop dinner with fort views." },
        { day: 6, title: "Jaisalmer & Desert Camp", description: "Patwon Ki Haveli, Gadisar Lake. Afternoon camel safari into the dunes. Overnight at luxury desert camp with stargazing." },
        { day: 7, title: "Desert Sunrise & Departure", description: "Sunrise over the Thar Desert dunes. Breakfast at camp. Transfer to Jaisalmer airport/station for departure." },
      ],
      inclusions: ["Heritage haveli stays & desert camp", "Daily breakfast & 4 dinners", "All fort & monument entry fees", "Camel safari experience", "AC vehicle for all transfers", "Local expert guides"],
      exclusions: ["Flights/trains to Jaipur & from Jaisalmer", "Lunches (flexible for exploration)", "Travel insurance", "Personal shopping"],
      order: 2,
    },
  ].map((t) => ({ ...t, isActive: true }));

  const testimonials = [
    { name: "Priya Sharma", initials: "PS", destination: "Goa", rating: 5, color: "#2EC4B6", review: "Travelly planned our entire Goa trip in under 2 minutes! The AI found us beach shacks we never would have discovered. Best friends trip ever.", order: 0 },
    { name: "Rahul Verma", initials: "RV", destination: "Bali", rating: 5, color: "#FF6B35", review: "I was skeptical about AI trip planning, but Travelly nailed it. The itinerary was perfectly paced, and the flight deals saved us \u20B915,000 per person.", order: 1 },
    { name: "Ananya Patel", initials: "AP", destination: "Rajasthan", rating: 5, color: "#FFD166", review: "Our family trip to Rajasthan was magical. The local tips from the AI \u2014 hidden restaurants, sunset spots \u2014 made it truly special. Highly recommend!", order: 2 },
    { name: "Vikram Singh", initials: "VS", destination: "Dubai", rating: 4.5, color: "#0F4C81", review: "Used Travelly for our corporate retreat to Dubai. 20 people, complex requirements \u2014 the AI handled it like a pro. Will use again for sure.", order: 3 },
    { name: "Meera Nair", initials: "MN", destination: "Kerala", rating: 5, color: "#2EC4B6", review: "The budget optimization was incredible. Travelly found us a houseboat stay in Alleppey for half the price I was seeing online. Love this platform!", order: 4 },
    { name: "Arjun Kapoor", initials: "AK", destination: "Thailand", rating: 5, color: "#FF6B35", review: "First international trip and I was nervous. Travelly planned everything \u2014 visa tips, local transport, even the best street food spots in Bangkok. 10/10.", order: 5 },
  ].map((t) => ({ ...t, isActive: true }));

  const destinations = [
    { name: "Goa", tag: "Beach", emoji: "\u{1F3D6}\u{FE0F}", from: 8999, rating: 4.8, gradient: "from-cyan-500 to-blue-600", description: "Sun, sand & nightlife", order: 0 },
    { name: "Rajasthan", tag: "Culture", emoji: "\u{1F3F0}", from: 12999, rating: 4.7, gradient: "from-orange-400 to-amber-600", description: "Forts, deserts & royalty", order: 1 },
    { name: "Kerala", tag: "Nature", emoji: "\u{1F334}", from: 9999, rating: 4.9, gradient: "from-green-400 to-emerald-600", description: "Backwaters & spice gardens", order: 2 },
    { name: "Manali", tag: "Mountains", emoji: "\u{1F3D4}\u{FE0F}", from: 7999, rating: 4.6, gradient: "from-slate-400 to-blue-800", description: "Snow peaks & adventure", order: 3 },
    { name: "Bali", tag: "Beach", emoji: "\u{1F33A}", from: 25999, rating: 4.9, gradient: "from-teal-400 to-emerald-500", description: "Temples, rice terraces & surf", order: 4 },
    { name: "Dubai", tag: "Luxury", emoji: "\u{1F306}", from: 22999, rating: 4.7, gradient: "from-yellow-400 to-orange-500", description: "Skyline, malls & desert safari", order: 5 },
    { name: "Thailand", tag: "Adventure", emoji: "\u{1F418}", from: 18999, rating: 4.8, gradient: "from-pink-400 to-rose-600", description: "Beaches, street food & islands", order: 6 },
    { name: "Maldives", tag: "Luxury", emoji: "\u{1F3DD}\u{FE0F}", from: 35999, rating: 5.0, gradient: "from-sky-300 to-blue-500", description: "Overwater villas & coral reefs", order: 7 },
  ].map((d) => ({ ...d, isActive: true }));

  const packages = [
    { title: "Friends Trip", emoji: "\u{1F389}", tagline: "Adventure with your squad", groupSize: "4\u20138 people", from: 15000, color: "#FF6B35", popular: false, inclusions: ["Customized adventure itinerary", "Group discounts on activities", "Nightlife & party spots mapped", "Shared accommodation options", "24/7 AI trip support"], order: 0 },
    { title: "Family Vacation", emoji: "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}\u200D\u{1F466}", tagline: "Memories that last forever", groupSize: "3\u20136 people", from: 20000, color: "#2EC4B6", popular: true, inclusions: ["Kid-friendly activities & dining", "Safe & comfortable stays", "Family sightseeing packages", "Flexible cancellation options", "Special meal preferences handled"], order: 1 },
    { title: "Corporate Retreat", emoji: "\u{1F3E2}", tagline: "Team building done right", groupSize: "10\u201350 people", from: 25000, color: "#0F4C81", popular: false, inclusions: ["Team building activities", "Conference & meeting rooms", "Premium accommodations", "Group transport arranged", "Dedicated trip coordinator"], order: 2 },
  ].map((p) => ({ ...p, isActive: true }));

  console.log("Clearing existing content...");
  await Promise.all([
    PhotoModel.deleteMany({}),
    GroupTripModel.deleteMany({}),
    TestimonialModel.deleteMany({}),
    DestinationModel.deleteMany({}),
    GroupPackageModel.deleteMany({}),
  ]);

  console.log("Seeding content...");
  await Promise.all([
    PhotoModel.insertMany(photos),
    GroupTripModel.insertMany([...pastTrips, ...upcomingTrips]),
    TestimonialModel.insertMany(testimonials),
    DestinationModel.insertMany(destinations),
    GroupPackageModel.insertMany(packages),
  ]);

  console.log("Seed complete!");
  console.log(`  Photos: ${photos.length}`);
  console.log(`  Group Trips: ${pastTrips.length + upcomingTrips.length}`);
  console.log(`  Testimonials: ${testimonials.length}`);
  console.log(`  Destinations: ${destinations.length}`);
  console.log(`  Packages: ${packages.length}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
