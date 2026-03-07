"use client";

import { useState, useEffect, useCallback } from "react";

interface UseCrudOptions<T> {
  apiPath: string;
  dataKey: string;
}

export default function useAdminCrud<T extends { _id: string }>({
  apiPath,
  dataKey,
}: UseCrudOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiPath);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data[dataKey] || []);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [apiPath, dataKey]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const createItem = async (body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create");
      }
      await fetchItems();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async (id: string, body: Record<string, unknown>) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${apiPath}?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      await fetchItems();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${apiPath}?id=${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      await fetchItems();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, currentActive: boolean) => {
    return updateItem(id, { isActive: !currentActive });
  };

  return {
    items,
    loading,
    saving,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    toggleActive,
  };
}
