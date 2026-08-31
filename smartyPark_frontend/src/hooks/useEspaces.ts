import { useState, useCallback, useEffect } from 'react';
import { espacePublicApi } from '../api/espacePublicApi';
import { EspacePublicResponse } from '../types';
import { calculateDistance } from '../utils/location';
import { Coordinates } from '../utils/location';

export function useEspaces(userLocation: Coordinates | null) {
  const [espaces, setEspaces] = useState<EspacePublicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('tous');
  const [distances, setDistances] = useState<Record<number, number>>({});

  const loadEspaces = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await espacePublicApi.getAllValidated();
      setEspaces(data);
    } catch (e) {
      console.error('Erreur chargement espaces:', e);
      setError('Impossible de charger les espaces.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEspaces();
  }, [loadEspaces]);

  useEffect(() => {
    if (userLocation && espaces.length > 0) {
      const map: Record<number, number> = {};
      espaces.forEach((e) => {
        map[e.id] = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          e.latitude,
          e.longitude
        );
      });
      setDistances(map);
    }
  }, [userLocation, espaces]);

  const filteredEspaces = espaces.filter((e) => {
    if (selectedCategory !== 'tous' && e.categorie !== selectedCategory) return false;
    
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      if (!e.nom.toLowerCase().includes(s) && !e.adresse.toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    const da = distances[a.id] ?? Infinity;
    const db = distances[b.id] ?? Infinity;
    return da - db;
  });

  return {
    espaces: filteredEspaces,
    loading,
    error,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    distances,
    refresh: loadEspaces,
  };
}
