package ma.smartypark.smartypark_backend.service.impl;

import ma.smartypark.smartypark_backend.service.GeoDistanceService;
import org.springframework.stereotype.Service;

@Service
public class GeoDistanceServiceImpl implements GeoDistanceService {

    private static final int EARTH_RADIUS_METERS = 6371000;

    @Override
    public double calculateDistanceInMeters(double lat1, double lon1, double lat2, double lon2) {
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_METERS * c;
    }
}