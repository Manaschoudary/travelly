export interface Destination {
  name: string;
  country: string;
  type: "city" | "region" | "island" | "country";
}

export const DESTINATIONS: Destination[] = [
  { name: "Goa", country: "India", type: "region" },
  { name: "Manali", country: "India", type: "city" },
  { name: "Kashmir", country: "India", type: "region" },
  { name: "Rajasthan", country: "India", type: "region" },
  { name: "Kerala", country: "India", type: "region" },
  { name: "Ladakh", country: "India", type: "region" },
  { name: "Rishikesh", country: "India", type: "city" },
  { name: "Jaipur", country: "India", type: "city" },
  { name: "Udaipur", country: "India", type: "city" },
  { name: "Varanasi", country: "India", type: "city" },
  { name: "Darjeeling", country: "India", type: "city" },
  { name: "Shimla", country: "India", type: "city" },
  { name: "Andaman Islands", country: "India", type: "island" },
  { name: "Lakshadweep", country: "India", type: "island" },
  { name: "Munnar", country: "India", type: "city" },
  { name: "Coorg", country: "India", type: "region" },
  { name: "Hampi", country: "India", type: "city" },
  { name: "Ooty", country: "India", type: "city" },
  { name: "Agra", country: "India", type: "city" },
  { name: "Amritsar", country: "India", type: "city" },
  { name: "Jodhpur", country: "India", type: "city" },
  { name: "Mysore", country: "India", type: "city" },
  { name: "Alleppey", country: "India", type: "city" },
  { name: "Pondicherry", country: "India", type: "city" },
  { name: "Dehradun", country: "India", type: "city" },
  { name: "Meghalaya", country: "India", type: "region" },
  { name: "Arunachal Pradesh", country: "India", type: "region" },
  { name: "Sikkim", country: "India", type: "region" },
  { name: "Kodaikanal", country: "India", type: "city" },
  { name: "Spiti Valley", country: "India", type: "region" },
  { name: "Ranthambore", country: "India", type: "city" },
  { name: "Pushkar", country: "India", type: "city" },
  { name: "Mount Abu", country: "India", type: "city" },
  { name: "Jaisalmer", country: "India", type: "city" },
  { name: "Nainital", country: "India", type: "city" },
  { name: "Jim Corbett", country: "India", type: "region" },

  { name: "Bali", country: "Indonesia", type: "island" },
  { name: "Bangkok", country: "Thailand", type: "city" },
  { name: "Phuket", country: "Thailand", type: "island" },
  { name: "Chiang Mai", country: "Thailand", type: "city" },
  { name: "Krabi", country: "Thailand", type: "region" },
  { name: "Pattaya", country: "Thailand", type: "city" },
  { name: "Koh Samui", country: "Thailand", type: "island" },
  { name: "Dubai", country: "UAE", type: "city" },
  { name: "Abu Dhabi", country: "UAE", type: "city" },
  { name: "Singapore", country: "Singapore", type: "country" },
  { name: "Kuala Lumpur", country: "Malaysia", type: "city" },
  { name: "Langkawi", country: "Malaysia", type: "island" },
  { name: "Maldives", country: "Maldives", type: "country" },
  { name: "Sri Lanka", country: "Sri Lanka", type: "country" },
  { name: "Colombo", country: "Sri Lanka", type: "city" },
  { name: "Kandy", country: "Sri Lanka", type: "city" },
  { name: "Vietnam", country: "Vietnam", type: "country" },
  { name: "Hanoi", country: "Vietnam", type: "city" },
  { name: "Ho Chi Minh City", country: "Vietnam", type: "city" },
  { name: "Da Nang", country: "Vietnam", type: "city" },
  { name: "Siem Reap", country: "Cambodia", type: "city" },
  { name: "Kathmandu", country: "Nepal", type: "city" },
  { name: "Pokhara", country: "Nepal", type: "city" },
  { name: "Bhutan", country: "Bhutan", type: "country" },
  { name: "Hong Kong", country: "China", type: "city" },
  { name: "Tokyo", country: "Japan", type: "city" },
  { name: "Kyoto", country: "Japan", type: "city" },
  { name: "Osaka", country: "Japan", type: "city" },
  { name: "Seoul", country: "South Korea", type: "city" },
  { name: "Jeju Island", country: "South Korea", type: "island" },
  { name: "Taipei", country: "Taiwan", type: "city" },

  { name: "Paris", country: "France", type: "city" },
  { name: "London", country: "UK", type: "city" },
  { name: "Rome", country: "Italy", type: "city" },
  { name: "Venice", country: "Italy", type: "city" },
  { name: "Florence", country: "Italy", type: "city" },
  { name: "Amalfi Coast", country: "Italy", type: "region" },
  { name: "Barcelona", country: "Spain", type: "city" },
  { name: "Madrid", country: "Spain", type: "city" },
  { name: "Amsterdam", country: "Netherlands", type: "city" },
  { name: "Prague", country: "Czech Republic", type: "city" },
  { name: "Vienna", country: "Austria", type: "city" },
  { name: "Zurich", country: "Switzerland", type: "city" },
  { name: "Interlaken", country: "Switzerland", type: "city" },
  { name: "Santorini", country: "Greece", type: "island" },
  { name: "Athens", country: "Greece", type: "city" },
  { name: "Istanbul", country: "Turkey", type: "city" },
  { name: "Cappadocia", country: "Turkey", type: "region" },
  { name: "Edinburgh", country: "UK", type: "city" },
  { name: "Berlin", country: "Germany", type: "city" },
  { name: "Munich", country: "Germany", type: "city" },
  { name: "Budapest", country: "Hungary", type: "city" },
  { name: "Dubrovnik", country: "Croatia", type: "city" },
  { name: "Reykjavik", country: "Iceland", type: "city" },
  { name: "Lisbon", country: "Portugal", type: "city" },
  { name: "Copenhagen", country: "Denmark", type: "city" },
  { name: "Stockholm", country: "Sweden", type: "city" },
  { name: "Norwegian Fjords", country: "Norway", type: "region" },

  { name: "New York", country: "USA", type: "city" },
  { name: "Los Angeles", country: "USA", type: "city" },
  { name: "San Francisco", country: "USA", type: "city" },
  { name: "Las Vegas", country: "USA", type: "city" },
  { name: "Hawaii", country: "USA", type: "island" },
  { name: "Miami", country: "USA", type: "city" },
  { name: "Grand Canyon", country: "USA", type: "region" },
  { name: "Toronto", country: "Canada", type: "city" },
  { name: "Vancouver", country: "Canada", type: "city" },
  { name: "Banff", country: "Canada", type: "region" },
  { name: "Cancun", country: "Mexico", type: "city" },
  { name: "Machu Picchu", country: "Peru", type: "region" },
  { name: "Rio de Janeiro", country: "Brazil", type: "city" },
  { name: "Buenos Aires", country: "Argentina", type: "city" },
  { name: "Patagonia", country: "Argentina", type: "region" },

  { name: "Cape Town", country: "South Africa", type: "city" },
  { name: "Zanzibar", country: "Tanzania", type: "island" },
  { name: "Marrakech", country: "Morocco", type: "city" },
  { name: "Egypt", country: "Egypt", type: "country" },
  { name: "Seychelles", country: "Seychelles", type: "country" },
  { name: "Mauritius", country: "Mauritius", type: "country" },
  { name: "Kenya Safari", country: "Kenya", type: "region" },

  { name: "Sydney", country: "Australia", type: "city" },
  { name: "Melbourne", country: "Australia", type: "city" },
  { name: "Great Barrier Reef", country: "Australia", type: "region" },
  { name: "New Zealand", country: "New Zealand", type: "country" },
  { name: "Queenstown", country: "New Zealand", type: "city" },
  { name: "Fiji", country: "Fiji", type: "country" },
  { name: "Bora Bora", country: "French Polynesia", type: "island" },
];

const TYPE_EMOJI: Record<string, string> = {
  city: "\uD83C\uDFD9\uFE0F",
  region: "\uD83C\uDF0D",
  island: "\uD83C\uDFDD\uFE0F",
  country: "\uD83C\uDDEE\uD83C\uDDF3",
};

export function getTypeEmoji(type: string): string {
  return TYPE_EMOJI[type] || "\uD83D\uDCCD";
}

export function searchDestinations(query: string, limit = 8): Destination[] {
  if (!query || query.length < 1) return [];

  const q = query.toLowerCase().trim();

  const scored = DESTINATIONS.map((d) => {
    const name = d.name.toLowerCase();
    const country = d.country.toLowerCase();
    let score = 0;

    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (country.startsWith(q)) score = 40;
    else if (country.includes(q)) score = 30;
    else {
      const words = name.split(/\s+/);
      if (words.some((w) => w.startsWith(q))) score = 50;
    }

    return { dest: d, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored.map((s) => s.dest);
}
