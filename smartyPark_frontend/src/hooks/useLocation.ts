import { useState } from 'react';
import { Alert } from 'react-native';
import { getCurrentLocation, Coordinates } from '../utils/location';

/**
 * Hook utilitaire pour récupérer la position GPS de l'utilisateur.
 */
export function useLocation() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLocation = async (): Promise<Coordinates | null> => {
    setIsLoading(true);
    try {
      const loc = await getCurrentLocation();
      if (!loc) {
        Alert.alert(
          'Localisation requise',
          'Activez la localisation dans vos paramètres pour continuer.',
        );
        return null;
      }
      setCoords(loc);
      return loc;
    } finally {
      setIsLoading(false);
    }
  };

  return { coords, isLoading, fetchLocation };
}
