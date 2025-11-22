"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HostawayProperty {
  id: number;
  name: string;
  address: string;
}

export function HostawayManager() {
  const [properties, setProperties] = useState<HostawayProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing properties on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/hostaway/properties");
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch properties");
      }

      setProperties(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch properties");
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      setError(null);

      const response = await fetch("/api/hostaway/sync", {
        method: "POST",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Sync failed");
      }

      // Refresh the properties list
      await fetchProperties();

      alert(`Successfully synced ${result.data?.propertiesCount || 0} properties!`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sync failed";
      setError(errorMessage);
      alert(`Sync failed: ${errorMessage}`);
      console.error("Error syncing properties:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <CardTitle className="text-white">Hostaway Properties</CardTitle>
        <CardDescription>
          Sync properties from Hostaway to enable dashboard filtering
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-400">
              {loading ? (
                "Loading properties..."
              ) : (
                <>
                  <span className="font-semibold text-white">{properties.length}</span> properties synced
                </>
              )}
            </p>
            {error && (
              <p className="text-sm text-red-400 mt-1">{error}</p>
            )}
          </div>

          <Button
            onClick={handleSync}
            disabled={syncing || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {syncing ? "Syncing..." : "Sync Properties"}
          </Button>
        </div>

        {properties.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-neutral-500 mb-2">Recent properties:</p>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {properties.slice(0, 5).map((property) => (
                <div
                  key={property.id}
                  className="text-xs text-neutral-400 p-2 bg-neutral-950 rounded border border-neutral-800"
                >
                  <span className="font-medium text-neutral-300">{property.name}</span>
                  {property.address && (
                    <span className="ml-2 text-neutral-600">• {property.address}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
