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
            "h-12 w-full justify-between bg-white/10 border-white/10 text-white rounded-xl hover:bg-white/15 hover:text-white",
            open && "border-[#2EC4B6]",
            !value && "text-white/40"
          )}
        >
          <span className="truncate">
            {selectedLabel || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-white/40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] bg-[#1A1A2E] border-white/10 p-0"
        align="start"
      >
        <Command className="bg-transparent" shouldFilter={false}>
          <CommandInput
            placeholder="Type city, airport, or code..."
            className="text-white placeholder:text-white/40"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {loading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-white/40" />
              </div>
            )}
            {!loading && search.length >= 2 && airports.length === 0 && (
              <CommandEmpty className="text-white/50 py-6 text-center text-sm">
                No airports found.
              </CommandEmpty>
            )}
            {!loading && search.length < 2 && (
              <div className="py-6 text-center text-sm text-white/40">
                Type at least 2 characters to search
              </div>
            )}
            {!loading && airports.length > 0 && (
              <CommandGroup className="[&_[cmdk-group-heading]]:text-white/40">
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
                        <span className="text-white/60"> — {airport.name}</span>
                      </span>
                      <span className="text-xs text-white/40">
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
