"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
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
import { useTheme } from "@/components/providers/ThemeProvider";

interface Airport {
  code: string;
  name: string;
  country: string;
}

interface AirportComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function AirportCombobox({
  value,
  onValueChange,
  placeholder = "Search airports...",
}: AirportComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [airports, setAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme } = useTheme();
  const light = theme === "light";

  const fetchAirports = useCallback(async (query: string) => {
    if (query.length < 2) {
      setAirports([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/airports?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setAirports(data.airports || []);
    } catch {
      setAirports([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchAirports(search), 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, fetchAirports]);

  useEffect(() => {
    if (value && !selectedLabel) {
      fetch(`/api/airports?q=${encodeURIComponent(value)}`)
        .then((res) => res.json())
        .then((data) => {
          const match = (data.airports || []).find(
            (a: Airport) => a.code === value
          );
          if (match) {
            setSelectedLabel(`${match.code} — ${match.name}`);
          }
        })
        .catch(() => {});
    }
  }, [value, selectedLabel]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-12 w-full justify-between rounded-xl",
            light ? "bg-white border-gray-300 text-[#1A1A2E] hover:bg-gray-50 hover:text-[#1A1A2E]" : "bg-white/10 border-white/10 text-white hover:bg-white/15 hover:text-white",
            open && "border-[#2EC4B6]",
            !value && (light ? "text-gray-400" : "text-white/40")
          )}
        >
          <span className="truncate">
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className={cn("ml-2 h-4 w-4 shrink-0", light ? "text-gray-400" : "text-white/40")} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[var(--radix-popover-trigger-width)] p-0", light ? "bg-white border-gray-200" : "bg-[#1A1A2E] border-white/10")}
        align="start"
      >
        <Command className="bg-transparent" shouldFilter={false}>
          <CommandInput
            placeholder="Type city, airport, or code..."
            className={cn(light ? "text-[#1A1A2E] placeholder:text-gray-400" : "text-white placeholder:text-white/40")}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className={cn("h-4 w-4 animate-spin", light ? "text-gray-400" : "text-white/40")} />
              </div>
            )}
            {!loading && search.length >= 2 && airports.length === 0 && (
              <CommandEmpty className={cn("py-6 text-center text-sm", light ? "text-gray-500" : "text-white/50")}>
                No airports found.
              </CommandEmpty>
            )}
            {!loading && search.length < 2 && (
              <div className={cn("py-6 text-center text-sm", light ? "text-gray-400" : "text-white/40")}>
                Type at least 2 characters to search
              </div>
            )}
            {!loading && airports.length > 0 && (
              <CommandGroup className={cn(light ? "[&_[cmdk-group-heading]]:text-gray-400" : "[&_[cmdk-group-heading]]:text-white/40")}>
                {airports.map((airport) => (
                  <CommandItem
                    key={airport.code}
                    value={airport.code}
                    onSelect={() => {
                      onValueChange(airport.code);
                      setSelectedLabel(`${airport.code} — ${airport.name}`);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn("cursor-pointer", light ? "text-gray-700 data-[selected=true]:bg-gray-100 data-[selected=true]:text-[#1A1A2E]" : "text-white/80 data-[selected=true]:bg-white/10 data-[selected=true]:text-white")}
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
                        <span className={cn(light ? "text-gray-500" : "text-white/60")}> — {airport.name}</span>
                      </span>
                      <span className={cn("text-xs", light ? "text-gray-400" : "text-white/40")}>
                        {airport.country}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
