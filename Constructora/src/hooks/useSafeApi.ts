// src/hooks/useSafeApi.ts
import { useEffect, useState } from "react";
import { toast } from "sonner";
import apiClient from "@/lib/api";

/**
 * Hook reutilizable para cargar datos desde la API de forma segura
 * Maneja errores, permisos, arrays nulos y estado de carga automáticamente.
 *
 * Ejemplo de uso:
 * const { data, loading, error, refetch } = useSafeApi<InventarioItem[]>('/inventario');
 */
export function useSafeApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 👇 Le indicamos a axios qué tipo de datos esperamos
      const res = await apiClient.get<T>(endpoint);
      const responseData = res.data;

      if (Array.isArray(responseData) && responseData.length === 0) {
        toast.info("No hay datos disponibles o no tienes permisos para verlos.");
      }

      if (!responseData) {
        throw new Error("Respuesta vacía del servidor");
      }

      // 👇 Forzamos el tipo a T porque ya lo validamos
      setData(responseData as T);
    } catch (err: any) {
      console.error(`❌ Error en ${endpoint}:`, err);
      const message =
        err.response?.status === 403
          ? "No tienes permisos para acceder a estos datos."
          : err.response?.status === 404
          ? "Datos no encontrados."
          : "Error al cargar los datos desde el servidor.";

      toast.error(message);
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [endpoint]);

  return { data, loading, error, refetch: fetchData };
}