"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Airport {
  code: string;
  city: string;
  name: string;
  country?: string;
}

interface AirportComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

const AIRPORTS: { label: string; airports: Airport[] }[] = [
  {
    label: "Metro Cities",
    airports: [
      { code: "DEL", city: "New Delhi", name: "Indira Gandhi International" },
      { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International" },
      { code: "BLR", city: "Bengaluru", name: "Kempegowda International" },
      { code: "MAA", city: "Chennai", name: "Chennai International" },
      { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International" },
      { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose International" },
    ],
  },
  {
    label: "Popular Domestic",
    airports: [
      { code: "GOI", city: "Goa", name: "Manohar International" },
      { code: "JAI", city: "Jaipur", name: "Jaipur International" },
      { code: "COK", city: "Kochi", name: "Cochin International" },
      { code: "IXC", city: "Chandigarh", name: "Chandigarh International" },
      { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International" },
      { code: "SXR", city: "Srinagar", name: "Sheikh ul-Alam International" },
      { code: "IXB", city: "Bagdogra", name: "Bagdogra Airport" },
      { code: "IXZ", city: "Port Blair", name: "Veer Savarkar International" },
      { code: "IXE", city: "Mangaluru", name: "Mangalore International" },
      { code: "GAU", city: "Guwahati", name: "Lokpriya Gopinath Bordoloi International" },
      { code: "PNQ", city: "Pune", name: "Pune Airport" },
      { code: "LKO", city: "Lucknow", name: "Chaudhary Charan Singh International" },
      { code: "VNS", city: "Varanasi", name: "Lal Bahadur Shastri International" },
      { code: "IXJ", city: "Jammu", name: "Jammu Airport" },
      { code: "IXA", city: "Agartala", name: "Maharaja Bir Bikram Airport" },
      { code: "BBI", city: "Bhubaneswar", name: "Biju Patnaik International" },
      { code: "IDR", city: "Indore", name: "Devi Ahilyabai Holkar Airport" },
      { code: "NAG", city: "Nagpur", name: "Dr. Babasaheb Ambedkar International" },
      { code: "PAT", city: "Patna", name: "Jay Prakash Narayan International" },
      { code: "TRV", city: "Thiruvananthapuram", name: "Trivandrum International" },
      { code: "UDR", city: "Udaipur", name: "Maharana Pratap Airport" },
      { code: "DED", city: "Dehradun", name: "Jolly Grant Airport" },
    ],
  },
  {
    label: "International",
    airports: [
      { code: "DXB", city: "Dubai", name: "Dubai International", country: "UAE" },
      { code: "BKK", city: "Bangkok", name: "Suvarnabhumi Airport", country: "Thailand" },
      { code: "SIN", city: "Singapore", name: "Changi Airport", country: "Singapore" },
      { code: "KUL", city: "Kuala Lumpur", name: "KL International", country: "Malaysia" },
      { code: "CMB", city: "Colombo", name: "Bandaranaike International", country: "Sri Lanka" },
      { code: "KTM", city: "Kathmandu", name: "Tribhuvan International", country: "Nepal" },
      { code: "DAC", city: "Dhaka", name: "Hazrat Shahjalal International", country: "Bangladesh" },
      { code: "MLE", city: "Male", name: "Velana International", country: "Maldives" },
      { code: "HKG", city: "Hong Kong", name: "Hong Kong International", country: "China" },
      { code: "NRT", city: "Tokyo", name: "Narita International", country: "Japan" },
      { code: "ICN", city: "Seoul", name: "Incheon International", country: "South Korea" },
      { code: "LHR", city: "London", name: "Heathrow Airport", country: "UK" },
      { code: "JFK", city: "New York", name: "John F. Kennedy International", country: "USA" },
      { code: "SFO", city: "San Francisco", name: "San Francisco International", country: "USA" },
      { code: "SYD", city: "Sydney", name: "Kingsford Smith Airport", country: "Australia" },
    ],
  },
];

function findAirport(code: string): Airport | undefined {
  for (const group of AIRPORTS) {
    const found = group.airports.find((a) => a.code === code);
    if (found) return found;
  }
  return undefined;
}

export default function AirportCombobox({
  value,
  onValueChange,
  placeholder = "Select airport...",
}: AirportComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? findAirport(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-12 w-full justify-between bg-white/10 border-white/10 text-white rounded-xl hover:bg-white/15 hover:text-white",
            open && "border-[#2EC4B6]",
            !selected && "text-white/40"
          )}
        >
          {selected ? (
            <span className="truncate">
              <span className="font-semibold">{selected.code}</span>
              <span className="text-white/60"> — {selected.city}</span>
            </span>
          ) : (
            placeholder
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-white/40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] bg-[#1A1A2E] border-white/10 p-0"
        align="start"
      >
        <Command className="bg-transparent">
          <CommandInput
            placeholder="Search airports..."
            className="text-white placeholder:text-white/40"
          />
          <CommandList>
            <CommandEmpty className="text-white/50 py-6 text-center text-sm">
              No airport found.
            </CommandEmpty>
            {AIRPORTS.map((group) => (
              <CommandGroup
                key={group.label}
                heading={group.label}
                className="[&_[cmdk-group-heading]]:text-white/40"
              >
                {group.airports.map((airport) => (
                  <CommandItem
                    key={airport.code}
                    value={`${airport.code} ${airport.city} ${airport.name} ${airport.country || ""}`}
                    onSelect={() => {
                      onValueChange(airport.code);
                      setOpen(false);
                    }}
                    className="text-white/80 data-[selected=true]:bg-white/10 data-[selected=true]:text-white cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4 text-[#2EC4B6]",
                        value === airport.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>
                        <span className="font-semibold">{airport.code}</span>
                        <span className="text-white/60"> — {airport.city}</span>
                      </span>
                      <span className="text-xs text-white/40">
                        {airport.name}
                        {airport.country ? `, ${airport.country}` : ""}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
