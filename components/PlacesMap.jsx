import React, { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Clock, Loader2, Navigation } from 'lucide-react';

const PlacesMap = ({ location = { lat: 19.0760, lng: 72.8777 }, height = "400px" }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [routingControl, setRoutingControl] = useState(null);

    // Initial Mock Places (Since we don't have Google Places API Key)
    const MOCK_NEARBY_PLACES = [
        { id: 1, name: "The Gold Coast Bistro", type: "Restaurant", lat: location.lat + 0.002, lng: location.lng + 0.002, distance: "0.5 km", time: "5 min" },
        { id: 2, name: "Azure Shopping Mall", type: "Mall", lat: location.lat - 0.003, lng: location.lng + 0.001, distance: "1.2 km", time: "12 min" },
        { id: 3, name: "City General Hospital", type: "Hospital", lat: location.lat + 0.001, lng: location.lng - 0.004, distance: "0.8 km", time: "8 min" },
        { id: 4, name: "Sunset Viewpoint", type: "Tourist", lat: location.lat - 0.002, lng: location.lng - 0.002, distance: "0.6 km", time: "6 min" },
    ];

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapRef.current || map || !window.L) return;

        // Leaflet takes [lat, lng]
        const center = [location.lat, location.lng];
        const mapInstance = window.L.map(mapRef.current).setView(center, 15);

        // Dark Theme Tiles
        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(mapInstance);

        // Hotel Marker (Home)
        const homeIcon = window.L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #D4AF37; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 0 10px #D4AF37;"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });

        window.L.marker(center, { icon: homeIcon }).addTo(mapInstance)
            .bindPopup("<b>Your Hotel</b>")
            .openPopup();

        // Render Mock Places
        const placeIcon = window.L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        const markers = [];
        MOCK_NEARBY_PLACES.forEach(place => {
            const marker = window.L.marker([place.lat, place.lng], { icon: placeIcon })
                .addTo(mapInstance);

            marker.on('click', () => {
                setSelectedPlace(place);

                // Draw Simple Polyline as "Route"
                if (window.routeLine) mapInstance.removeLayer(window.routeLine);

                window.routeLine = window.L.polyline([center, [place.lat, place.lng]], {
                    color: '#D4AF37',
                    weight: 4,
                    opacity: 0.7,
                    dashArray: '10, 10'
                }).addTo(mapInstance);

                mapInstance.fitBounds(window.routeLine.getBounds().pad(0.2));
            });

            markers.push(marker);

            // Allow searching from list
            place.marker = marker;
        });

        setPlaces(MOCK_NEARBY_PLACES);
        setMap(mapInstance);

        return () => {
            if (mapInstance) {
                mapInstance.remove();
                setMap(null);
            }
        };
    }, [location]);

    // Handle Search
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(e.target.value);

        if (!map) return;

        // Filter valid places
        const match = places.find(p => p.name.toLowerCase().includes(query) || p.type.toLowerCase().includes(query));

        if (match && match.marker) {
            map.flyTo([match.lat, match.lng], 16);
            match.marker.fire('click');
        }
    };

    return (
        <div className="w-full relative rounded-lg overflow-hidden border border-white/10 bg-[#0B1120]">
            <div className="absolute top-4 left-4 right-4 z-[1000]">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search nearby places (e.g. Mall, Bistro)..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full bg-black/80 backdrop-blur-md border border-white/20 rounded-lg p-3 pl-10 text-white text-sm focus:outline-none focus:border-aetheria-gold shadow-xl"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
            </div>

            <div ref={mapRef} style={{ height: height, width: '100%' }} className="relative z-0" />

            {selectedPlace && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/90 backdrop-blur-md p-4 rounded-lg border border-white/10 flex items-center justify-between z-[1000] animate-in slide-in-from-bottom-4">
                    <div>
                        <h4 className="font-bold text-white flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-aetheria-gold" />
                            {selectedPlace.name}
                        </h4>
                        <p className="text-xs text-gray-400 ml-6">{selectedPlace.type} • {selectedPlace.distance}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-aetheria-gold font-bold text-lg flex items-center gap-2 justify-end">
                            <Clock className="w-4 h-4" /> {selectedPlace.time}
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider">Est. Travel Time</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlacesMap;
