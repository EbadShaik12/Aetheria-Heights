import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, Navigation, MapPin, Heart, Star, ChevronLeft, ChevronRight, SlidersHorizontal, Map as MapIcon, List, Search, X } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3002' : '');

const HotelMap = ({ onBookHotel }) => {
    const mapRef = useRef(null);
    const [map, setMap] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [backendHotels, setBackendHotels] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [hoveredHotelId, setHoveredHotelId] = useState(null);
    const [markersRef, setMarkersRef] = useState({});
    const [showMapMobile, setShowMapMobile] = useState(false);

    // Direction & Map State
    const [routePolyline, setRoutePolyline] = useState(null);
    const [gettingDirections, setGettingDirections] = useState(false);
    const [mapBounds, setMapBounds] = useState(null);
    const [userRealLocation, setUserRealLocation] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchDisplay, setSearchDisplay] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    // Mock images since backend might not have them yet
    const HOTEL_IMAGES = [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=2070",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=2025",
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=2070",
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=2070"
    ];

    // Fetch backend hotels initially
    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch(`${API_BASE}/api/hotels`);
                if (response.ok) {
                    const data = await response.json();
                    setBackendHotels(data);
                }
            } catch (error) {
                console.error("Failed to fetch hotels", error);
            }
        };
        fetchHotels();
    }, []);

    // Fetch and position real hotels when map bounds change or location changes
    useEffect(() => {
        if (!userLocation && !mapBounds) return;

        const locationName = searchDisplay ? searchDisplay.split(',')[0] : "the area";

        const fetchTimeout = setTimeout(async () => {
            try {
                let url = `https://nominatim.openstreetmap.org/search?format=json&q=hotel`;

                if (mapBounds) {
                    const { _southWest: sw, _northEast: ne } = mapBounds;
                    url += `&viewbox=${sw.lng},${ne.lat},${ne.lng},${sw.lat}&bounded=1&limit=15&email=aetheriacloneapp@example.com`;
                } else if (locationName && locationName !== "the area") {
                    url += `+in+${encodeURIComponent(locationName)}&limit=15&countrycodes=in&email=aetheriacloneapp@example.com`;
                } else {
                    return;
                }

                const res = await fetch(url);
                const realHotels = await res.json();

                if (realHotels && realHotels.length > 0) {
                    const mappedHotels = realHotels.map((h, i) => {
                        const nameParts = h.display_name.split(',');
                        let name = nameParts[0].trim();

                        // Ensure it sounds like a hotel if it isn't obvious
                        if (!name.toLowerCase().includes('hotel') && !name.toLowerCase().includes('resort') && !name.toLowerCase().includes('inn') && !name.toLowerCase().includes('stay')) {
                            name = `${name} Hotel`;
                        }

                        const subtitle = nameParts.slice(1, 4).join(',').trim() || `Luxury stay in ${locationName}`;

                        return {
                            _id: h.place_id.toString() || `real-hotel-${i}`,
                            name: name,
                            image: HOTEL_IMAGES[i % HOTEL_IMAGES.length],
                            subtitle: subtitle,
                            features: h.type === 'guest_house' ? "Guest House · 1 bedroom · 1 bed · 1 bath" : "Luxury Room · 2 guests · 1 bed · 1 bath",
                            reviews: Math.floor(Math.random() * 500) + 50,
                            rating: (Math.random() * 1 + 4).toFixed(1), // Random 4.0 - 5.0
                            pricePerNight: Math.floor(Math.random() * 15000) + 3000,
                            location: {
                                lat: parseFloat(h.lat),
                                lng: parseFloat(h.lon)
                            }
                        };
                    });
                    setHotels(mappedHotels);
                } else if (backendHotels && backendHotels.length > 0) {
                    // Fallback to mock hotels wrapped around user location
                    const centerLat = mapBounds ? mapBounds.getCenter().lat : userLocation[0];
                    const centerLng = mapBounds ? mapBounds.getCenter().lng : userLocation[1];
                    const enhancedData = backendHotels.map((h, i) => {
                        const latOffset = (Math.random() - 0.5) * 0.05;
                        const lngOffset = (Math.random() - 0.5) * 0.05;

                        return {
                            ...h,
                            image: h.image || HOTEL_IMAGES[i % HOTEL_IMAGES.length],
                            subtitle: h.subtitle || `Entire luxury stay in ${locationName}`,
                            features: h.features || "2 guests · 1 bedroom · 1 bed · 1 bath",
                            reviews: Math.floor(Math.random() * 500) + 50,
                            location: {
                                lat: centerLat + latOffset,
                                lng: centerLng + lngOffset
                            }
                        };
                    });
                    setHotels(enhancedData);
                } else {
                    setHotels([]);
                }
            } catch (err) {
                console.error("Failed to fetch real hotels:", err);
            }
        }, 1500); // 1.5s heavy debounce to prevent Nominatim 429 block

        return () => clearTimeout(fetchTimeout);
    }, [userLocation, searchDisplay, backendHotels, mapBounds]);

    // Get User Location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error getting location", error);
                    setPermissionDenied(true);
                    setLoading(false);
                    // Default fallback location (Mumbai)
                    setUserLocation([19.0760, 72.8777]);
                }
            );
        } else {
            setPermissionDenied(true);
            setLoading(false);
            setUserLocation([19.0760, 72.8777]);
        }
    }, []);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapRef.current || !userLocation || map) return;
        if (!window.L) return;

        // Create map instance
        const mapInstance = window.L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView(userLocation, 13);

        window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(mapInstance);

        window.L.control.zoom({ position: 'topright' }).addTo(mapInstance);

        // Fix grey tiles on mount by repeating invalidateSize a few times
        const fixSize = () => { if (mapInstance) mapInstance.invalidateSize() };
        setTimeout(fixSize, 100);
        setTimeout(fixSize, 500);
        setTimeout(fixSize, 1000);

        mapInstance.on('moveend', () => {
            setMapBounds(mapInstance.getBounds());
            setTimeout(fixSize, 50);
        });

        // Set initial bounds
        setTimeout(() => setMapBounds(mapInstance.getBounds()), 500);

        setMap(mapInstance);

        return () => {
            if (mapInstance) {
                mapInstance.remove();
                setMap(null);
            }
        };
    }, [userLocation]); // Re-run when userLocation is set

    // Update markers when hotels userLocation changes
    useEffect(() => {
        if (!map || hotels.length === 0 || !window.L) return;

        // Clear existing markers logic if we were storing them (simplified here by recreating)
        // Ideally we would manage a layer group, but for this demo, standard add is okay 
        // as long as we don't duplicate on re-renders (useEffect dependency management).

        // We'll use a feature group to manage markers easily
        const markersGroup = window.L.featureGroup().addTo(map);
        const newMarkersRef = {};

        hotels.forEach(hotel => {
            if (hotel.location && hotel.location.lat && hotel.location.lng) {

                // Create custom image+price pill icon
                const createIcon = (isActive) => window.L.divIcon({
                    className: 'custom-price-marker',
                    html: `<div style="
                        background-color: ${isActive ? '#222222' : '#ffffff'}; 
                        color: ${isActive ? '#ffffff' : '#222222'}; 
                        padding: 4px; 
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        border-radius: 30px; 
                        font-weight: bold; 
                        font-family: sans-serif;
                        font-size: 14px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.15);
                        border: 2px solid ${isActive ? '#222222' : '#dddddd'};
                        white-space: nowrap;
                        transition: all 0.2s ease;
                        transform: ${isActive ? 'scale(1.1)' : 'scale(1)'};
                    ">
                        <img src="${hotel.image}" alt="hotel" style="width: 28px; height: 28px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />
                        <span style="padding-right: 8px;">₹${hotel.pricePerNight.toLocaleString()}</span>
                    </div>`,
                    iconSize: [110, 40],
                    iconAnchor: [55, 20] // Center it
                });

                const marker = window.L.marker([hotel.location.lat, hotel.location.lng], {
                    icon: createIcon(false),
                    zIndexOffset: 0
                }).addTo(markersGroup);

                // Store reference to update icon later
                newMarkersRef[hotel._id] = { marker, createIcon };

                marker.on('click', () => {
                    // Scroll list to item
                    const el = document.getElementById(`hotel-card-${hotel._id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHoveredHotelId(hotel._id);
                });
            }
        });

        setMarkersRef(newMarkersRef);

        // Fit bounds
        if (hotels.length > 0) {
            map.fitBounds(markersGroup.getBounds().pad(0.2));
        }

        return () => {
            map.removeLayer(markersGroup);
        };

    }, [map, hotels]);

    // Effect to handle highlighting markers based on hover
    useEffect(() => {
        Object.keys(markersRef).forEach(id => {
            const { marker, createIcon } = markersRef[id];
            const isActive = id === hoveredHotelId;
            marker.setIcon(createIcon(isActive));
            marker.setZIndexOffset(isActive ? 1000 : 0);
        });
    }, [hoveredHotelId, markersRef]);

    // Search Logic with Real Data (Nominatim OpenStreetMap API)
    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (searchQuery.trim().length > 2) {
                setIsSearching(true);
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&countrycodes=in`);
                    const data = await res.json();
                    setSuggestions(data);
                } catch (err) {
                    console.error("Search error:", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setSuggestions([]);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const handleSelectLocation = (loc) => {
        setSearchDisplay(loc.display_name);
        setSearchQuery('');
        setSuggestions([]);

        const newLat = parseFloat(loc.lat);
        const newLng = parseFloat(loc.lon);
        setUserLocation([newLat, newLng]);

        if (map) {
            map.flyTo([newLat, newLng], 14, { animate: true, duration: 1.5 });
        }
    };

    const handleGetDirections = (e, hotel) => {
        e.stopPropagation();
        setGettingDirections(hotel._id);

        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            setGettingDirections(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserRealLocation([latitude, longitude]);

                try {
                    const start = `${longitude},${latitude}`;
                    const end = `${hotel.location.lng},${hotel.location.lat}`;
                    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`);
                    const data = await res.json();

                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        const latlngs = route.geometry.coordinates.map(c => [c[1], c[0]]);

                        if (routePolyline) map.removeLayer(routePolyline);

                        const polyline = window.L.polyline(latlngs, {
                            color: '#0A192F', weight: 6, opacity: 0.9, dashArray: '1, 10'
                        }).addTo(map);

                        setRoutePolyline(polyline);
                        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });

                        // Add marker for user start location
                        window.L.circleMarker([latitude, longitude], {
                            radius: 8, color: '#D4AF37', fillColor: '#0A192F', fillOpacity: 1, weight: 3
                        }).addTo(map).bindPopup("Your Location");

                        if (window.innerWidth < 768) setShowMapMobile(true);
                    }
                } catch (err) {
                    console.error("Route error:", err);
                    alert("Failed to get directions.");
                }
                setGettingDirections(false);
            },
            (err) => {
                alert("Please allow location access to get directions.");
                setGettingDirections(false);
            },
            { enableHighAccuracy: true }
        );
    };

    // Ensure map resizes correctly on mobile toggle
    useEffect(() => {
        if (map && showMapMobile) {
            setTimeout(() => map.invalidateSize(), 300);
        }
    }, [showMapMobile, map]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] bg-white text-black">
                <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
                <p>Loading luxury experiences...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[85vh] bg-white text-black rounded-xl overflow-hidden shadow-lg border border-gray-200">
            {/* Header / Top Bar */}
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between bg-white z-[1000] shrink-0">
                <div className="flex items-center gap-4 flex-1">
                    <p className="font-bold text-gray-800 hidden lg:block w-48 truncate">
                        {hotels.length > 0 ? `${hotels.length} homes in this area` : "Finding nearby stays..."}
                    </p>

                    {/* Search Bar */}
                    <div className="relative flex-1 max-w-md">
                        <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:bg-white focus-within:border-gray-300 focus-within:shadow-md transition-all">
                            <Search className="w-5 h-5 text-gray-500 mr-2" />
                            <input
                                type="text"
                                value={searchQuery || searchDisplay}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setSearchDisplay('');
                                }}
                                placeholder="Search any state, city, or village in India..."
                                className="bg-transparent border-none outline-none w-full text-sm text-black placeholder-gray-500"
                            />
                            {searchQuery && (
                                <button onClick={() => { setSearchQuery(''); setSearchDisplay(''); setSuggestions([]); }} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                            {isSearching && <Loader2 className="w-4 h-4 text-gray-400 animate-spin ml-2" />}
                        </div>

                        {/* Suggestions Dropdown */}
                        {suggestions.length > 0 && (
                            <div className="absolute top-12 left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden z-[1001]">
                                {suggestions.map(loc => (
                                    <div
                                        key={loc.place_id}
                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-start gap-3 transition-colors border-b border-gray-50 last:border-0"
                                        onClick={() => handleSelectLocation(loc)}
                                    >
                                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                                        <div className="text-sm text-gray-800 text-left line-clamp-2">
                                            {loc.display_name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <button className="hidden sm:flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 text-sm hover:border-black transition-colors">
                        <SlidersHorizontal className="w-4 h-4" /> Filters
                    </button>
                    {/* Mobile Map Toggle */}
                    <button
                        className="md:hidden flex items-center gap-2 bg-black text-white rounded-full px-4 py-2 text-sm hover:bg-gray-800 transition-colors"
                        onClick={() => setShowMapMobile(!showMapMobile)}
                    >
                        {showMapMobile ? <><List className="w-4 h-4" /> Show List</> : <><MapIcon className="w-4 h-4" /> Show Map</>}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Left Side - Hotel List */}
                <div className={`w-full md:w-[60%] lg:w-[55%] h-full overflow-y-auto p-6 ${showMapMobile ? 'hidden' : 'block'}`}>
                    {permissionDenied && (
                        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                            Location permission denied. Showing top rated stays in Mumbai.
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8 pb-20">
                        {hotels.map((hotel) => (
                            <div
                                key={hotel._id}
                                id={`hotel-card-${hotel._id}`}
                                className="group cursor-pointer bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300"
                                onMouseEnter={() => setHoveredHotelId(hotel._id)}
                                onMouseLeave={() => setHoveredHotelId(null)}
                                onClick={() => {
                                    if (map) {
                                        map.flyTo([hotel.location.lat, hotel.location.lng], 16, { animate: true, duration: 1.5 });
                                    }
                                    if (window.innerWidth < 768) setShowMapMobile(true);
                                }}
                            >
                                {/* Image Container */}
                                <div className="aspect-[4/3] rounded-xl overflow-hidden relative mb-3 bg-gray-100">
                                    <img
                                        src={hotel.image}
                                        alt={hotel.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <button className="absolute top-3 right-3 text-white/70 hover:text-white hover:scale-110 transition-all">
                                        <Heart className="w-6 h-6 drop-shadow-md" />
                                    </button>
                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-black border border-gray-200 shadow-sm">
                                        Guest favorite
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-900 group-hover:text-aetheria-gold transition-colors">{hotel.name}</h3>
                                        <p className="text-gray-500 text-sm mt-0.5">{hotel.subtitle}</p>
                                        <p className="text-gray-500 text-sm mt-0.5">{hotel.features}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm font-bold">
                                        <Star className="w-3 h-3 fill-black text-black" />
                                        <span>{hotel.rating}</span>
                                        <span className="text-gray-500 font-normal">({hotel.reviews})</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                                    <div className="flex items-baseline gap-1">
                                        <span className="font-bold text-black text-lg not-italic">₹{hotel.pricePerNight.toLocaleString()}</span>
                                        <span className="text-gray-500 font-normal text-xs">/ night</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleGetDirections(e, hotel)}
                                            disabled={gettingDirections === hotel._id}
                                            className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition disabled:opacity-50"
                                        >
                                            {gettingDirections === hotel._id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                                            Directions
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onBookHotel && onBookHotel(hotel); }}
                                            className="bg-black hover:bg-gray-800 text-white px-4 py-1.5 rounded-full text-xs font-bold transition shadow-sm"
                                        >
                                            Book
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Side - Map */}
                <div className={`w-full md:w-[40%] lg:w-[45%] h-full bg-gray-100 relative ${showMapMobile ? 'block absolute inset-0 z-10' : 'hidden md:block'}`}>
                    <div ref={mapRef} className="w-full h-full" />
                </div>
            </div>

            {/* Floating Map Toggle Button (Mobile Only) */}
            <div className="md:hidden absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30">
                <button
                    className="flex items-center gap-2 bg-[#222222] text-white rounded-full px-6 py-3 font-semibold shadow-xl hover:scale-105 transition-transform"
                    onClick={() => setShowMapMobile(!showMapMobile)}
                >
                    {showMapMobile ? <><List className="w-4 h-4" /> Show List</> : <><MapIcon className="w-4 h-4" /> Map</>}
                </button>
            </div>
        </div>
    );
};

export default HotelMap;
