package ma.smartypark.smartypark_backend.service;

/**
 * Service utilitaire pour le calcul de distance géographique.
 * Utilise la formule de Haversine pour calculer la distance
 * entre deux points GPS en mètres.
 */
public interface GeoDistanceService {

    /**
     * Calcule la distance en mètres entre deux coordonnées GPS.
     *
     * @param lat1 Latitude du point 1
     * @param lon1 Longitude du point 1
     * @param lat2 Latitude du point 2
     * @param lon2 Longitude du point 2
     * @return Distance en mètres
     */
    double calculateDistanceInMeters(double lat1, double lon1, double lat2, double lon2);
}