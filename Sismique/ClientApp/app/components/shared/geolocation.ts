export class GeoLocation {
    latitude: number;
    longitude: number;

    public constructor(lat: number, lng: number) {
        this.latitude = lat;
        this.longitude = lng;
    }

    distanceTo(rhs: GeoLocation): number {
        function DegreeToRadian(angle: number): number {
            return (Math.PI * angle) / 180.0;
        }

        // Equirectangular approximation
        const R = 6371000;
        const x = (DegreeToRadian(rhs.longitude) - DegreeToRadian(this.longitude)) * Math.cos((DegreeToRadian(this.latitude) + DegreeToRadian(rhs.latitude)) / 2.0);
        const y = DegreeToRadian(rhs.latitude) - DegreeToRadian(this.latitude);
        return Math.sqrt(x * x + y * y) * R;
    }
}
