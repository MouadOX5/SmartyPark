import { useState, useEffect } from 'react';
import { espacePublicApi } from '../api/espacePublicApi';
import { presenceApi } from '../api/presenceApi';
import { EspacePublicResponse } from '../types';

export function useEspaceDetail(espaceId: number | null) {
  const [espace, setEspace] = useState<EspacePublicResponse | null>(null);
  const [activeCount, setActiveCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const loadData = async () => {
    if (!espaceId) return;
    try {
      const [espaceData, count] = await Promise.all([
        espacePublicApi.getById(espaceId),
        presenceApi.getActiveCountInEspace(espaceId),
      ]);
      setEspace(espaceData);
      setActiveCount(count);
    } catch (e) {
      console.error('Erreur chargement espace:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (espaceId) {
      setIsLoading(true);
      loadData();
    }
  }, [espaceId]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return {
    espace,
    activeCount,
    isLoading,
    isRefreshing,
    imageError,
    onRefresh,
    handleImageError
  };
}
