import React, { useState, useEffect } from 'react';
import CustomerPortal from './components/CustomerPortal';
import AdminPortal from './components/AdminPortal';
import Chatbot from './components/Chatbot';
import Auth from './components/Auth';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3002' : '');

// Normalize MongoDB _id to id string
const normalize = (obj) => ({ ...obj, id: String(obj.id || obj._id || '') });

// Initial Mock Data
const INITIAL_ROOMS = [
  {
    id: '1',
    number: '101',
    type: 'Ocean View Suite',
    category: 'VIP',
    price: 8500,
    maxCapacity: 2,
    status: 'Clean',
    images: [
      'https://picsum.photos/800/600?random=1',
      'https://picsum.photos/800/600?random=101'
    ],
    description: 'Panoramic ocean vistas with floor-to-ceiling glass windows.',
    amenities: ['Ocean View', 'King Bed', 'Free Wifi']
  },
  {
    id: '2',
    number: 'PH1',
    type: 'Royal Penthouse',
    category: 'VIP',
    price: 15000,
    maxCapacity: 6,
    status: 'Clean',
    images: [
      'https://picsum.photos/800/600?random=2',
      'https://picsum.photos/800/600?random=201',
      'https://picsum.photos/800/600?random=202'
    ],
    description: 'The pinnacle of luxury. Huge hall, private terrace and jacuzzi included.',
    amenities: ['Private Terrace', 'Jacuzzi', 'Butler Service', 'Conference Hall']
  },
  {
    id: '3',
    number: '102',
    type: 'Deluxe Double',
    category: 'General',
    price: 3000,
    maxCapacity: 2,
    status: 'Clean',
    images: [
      'https://picsum.photos/800/600?random=3'
    ],
    description: 'Spacious living area with bespoke furniture and art.',
    amenities: ['Living Room', 'Art Collection', 'Mini Bar']
  },
  {
    id: '4',
    number: '103',
    type: 'Single Standard',
    category: 'General',
    price: 2500,
    maxCapacity: 1,
    status: 'Occupied',
    images: [
      'https://picsum.photos/800/600?random=4'
    ],
    description: 'Elegant comfort for the solo traveler.',
    amenities: ['Single Bed', 'Work Desk']
  },
  {
    id: '5',
    number: '104',
    type: 'Family Suite',
    category: 'General',
    price: 2800,
    maxCapacity: 4,
    status: 'Dirty',
    images: [
      'https://picsum.photos/800/600?random=5',
      'https://picsum.photos/800/600?random=501'
    ],
    description: 'Perfect for small families, wake up to the sound of waves.',
    amenities: ['Ocean View', 'Balcony', '2 Queen Beds']
  }
];

const INITIAL_HALLS = [
  {
    id: 'h1',
    name: 'Grand Celestial Ballroom',
    type: 'Wedding',
    pricePerHour: 15000,
    capacity: 500,
    status: 'Available',
    images: ['https://picsum.photos/800/600?random=88', 'https://picsum.photos/800/600?random=89'],
    description: 'A magnificent space with crystal chandeliers and gold accents, perfect for fairytale weddings.',
    features: ['Stage', 'Dance Floor', 'Bridal Suite', 'Advanced Lighting']
  },
  {
    id: 'h2',
    name: 'Apex Conference Center',
    type: 'Conference',
    pricePerHour: 5000,
    capacity: 80,
    status: 'Available',
    images: ['https://picsum.photos/800/600?random=90'],
    description: 'State-of-the-art corporate environment designed for productivity and focus.',
    features: ['4K Projector', 'Video Conferencing', 'Ergonomic Seating', 'Soundproofing']
  },
  {
    id: 'h3',
    name: 'The Garden Atrium',
    type: 'Banquet',
    pricePerHour: 8000,
    capacity: 150,
    status: 'Available',
    images: ['https://picsum.photos/800/600?random=91'],
    description: 'Semi-outdoor space surrounded by lush greenery, ideal for cocktail parties and receptions.',
    features: ['Natural Light', 'Bar Counter', 'Ambient Sound', 'Outdoor Access']
  }
];

const INITIAL_MENU = [
  { id: 'w1', name: 'Truffle Mushroom Risotto', description: 'Arborio rice slow-cooked with wild mushrooms, white wine, and finished with black truffle oil.', price: 1200, category: 'Western', type: 'Veg', images: ['https://picsum.photos/800/600?random=food1'], calories: 650 },
  { id: 'w2', name: 'Grilled Salmon', description: 'Atlantic salmon fillet served with asparagus, roasted potatoes, and a lemon butter sauce.', price: 1800, category: 'Western', type: 'Non-Veg', images: ['https://picsum.photos/800/600?random=food2'], calories: 540 },
  { id: 'w3', name: 'Classic Filet Mignon', description: 'Tenderloin steak cooked to perfection, served with mashed potatoes and red wine jus.', price: 2500, category: 'Western', type: 'Non-Veg', images: ['https://picsum.photos/800/600?random=food3'], calories: 800 },
  { id: 'w4', name: 'Caesar Salad', description: 'Crisp romaine lettuce, parmesan cheese, croutons, and our house-made Caesar dressing.', price: 850, category: 'Western', type: 'Veg', images: ['https://picsum.photos/800/600?random=food4'], calories: 320 },
  { id: 'i1', name: 'Butter Chicken', description: 'Tender chicken pieces simmered in a rich, creamy tomato and cashew gravy.', price: 1100, category: 'Indian', type: 'Non-Veg', images: ['https://picsum.photos/800/600?random=food5'], calories: 750 },
  { id: 'i2', name: 'Paneer Tikka Masala', description: 'Grilled cottage cheese cubes tossed in a spiced onion-tomato gravy with bell peppers.', price: 950, category: 'Indian', type: 'Veg', images: ['https://picsum.photos/800/600?random=food6'], calories: 680 },
  { id: 'i3', name: 'Lamb Rogan Josh', description: 'Aromatic Kashmiri lamb curry cooked with yogurt and traditional spices.', price: 1400, category: 'Indian', type: 'Non-Veg', images: ['https://picsum.photos/800/600?random=food7'], calories: 820 },
  { id: 'i4', name: 'Hyderabadi Biryani', description: 'Fragrant basmati rice cooked with saffron, spices, and fresh vegetables in a sealed pot.', price: 900, category: 'Indian', type: 'Veg', images: ['https://picsum.photos/800/600?random=food8'], calories: 600 }
];

const INITIAL_BOOKINGS = [
  {
    id: 'BK-1234',
    roomId: '4',
    roomType: 'Single Standard',
    bookingCategory: 'ROOM',
    guestName: 'Alice Morgan',
    guestEmail: 'alice@example.com',
    checkIn: '2024-10-24T15:00',
    checkOut: '2024-10-26T11:00',
    guests: 1,
    totalPrice: 5000,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    bookingDate: '2024-10-20T09:00:00.000Z'
  }
];

const INITIAL_PROFILES = [
  {
    id: 'guest-1',
    name: 'Alice Morgan',
    email: 'alice@example.com',
    role: 'GUEST',
    phone: '+1 (555) 0199',
    address: '42 Wallaby Way, Sydney',
    paymentMethods: [],
    documents: [
      {
        id: 'doc-1',
        type: 'Passport',
        fileName: 'alice_passport.jpg',
        fileUrl: 'https://picsum.photos/id/237/800/600',
        uploadDate: '2024-10-20',
        status: 'Pending'
      }
    ],
    preferences: { preferredFloor: 'High', pillowType: 'Feather', dietaryRestrictions: [], newsletter: true },
    loyaltyPoints: 1250,
    loyaltyTier: 'Gold',
    adminNotes: 'Prefers early check-in. Loves flowers in the room.'
  }
];

const INITIAL_OFFERS = [
  {
    id: 'offer-1',
    title: 'Weekend Getaway',
    description: 'Enjoy a luxurious weekend with 20% off on all Ocean View Suites. Complementary breakfast included.',
    discountPercentage: 20,
    validUntil: '2026-12-31T23:59:59.000Z',
    isActive: true,
    imageUrl: 'https://picsum.photos/800/600?random=off1'
  },
  {
    id: 'offer-2',
    title: 'Early Bird Conference',
    description: 'Book Apex Conference Center 3 months in advance and get 15% off along with free Wi-Fi for all attendees.',
    discountPercentage: 15,
    validUntil: '2026-12-31T23:59:59.000Z',
    isActive: true,
    imageUrl: 'https://picsum.photos/800/600?random=off2'
  }
];

const App = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [halls, setHalls] = useState(INITIAL_HALLS);
  const [menuItems, setMenuItems] = useState(INITIAL_MENU);
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [userProfiles, setUserProfiles] = useState(INITIAL_PROFILES);
  const [offers, setOffers] = useState(INITIAL_OFFERS);

  // New States
  const [diningOrders, setDiningOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Load data for logged-in user from backend
  useEffect(() => {
    if (!currentUser) return;

    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        const [roomsRes, hallsRes, menuRes, bookingsRes, profilesRes, ordersRes, feedbackRes, offersRes] =
          await Promise.all([
            fetch(`${API_BASE}/api/rooms`, { headers }),
            fetch(`${API_BASE}/api/halls`, { headers }),
            fetch(`${API_BASE}/api/menu-items`, { headers }),
            fetch(`${API_BASE}/api/bookings`, { headers }),
            // Admin fetches ALL profiles; guest fetches only their own
            fetch(
              currentUser.role === 'ADMIN'
                ? `${API_BASE}/api/profiles`
                : `${API_BASE}/api/profiles?email=${encodeURIComponent(currentUser.email)}`,
              { headers }
            ),
            fetch(`${API_BASE}/api/dining-orders`, { headers }),
            fetch(`${API_BASE}/api/feedbacks`, { headers }),
            fetch(`${API_BASE}/api/offers`, { headers }),
          ]);

        const [roomsData, hallsData, menuData, bookingsData, profilesData, ordersData, feedbackData, offersData] =
          await Promise.all([
            roomsRes.json(),
            hallsRes.json(),
            menuRes.json(),
            bookingsRes.json(),
            profilesRes.json(),
            ordersRes.json(),
            feedbackRes.json(),
            offersRes.json()
          ]);

        // Map Mongo _id to id so existing UI keeps working
        setRooms(roomsData.map(r => normalize(r)));
        setHalls(hallsData.map(h => normalize(h)));
        setMenuItems(menuData.map(m => normalize(m)));
        setBookings(bookingsData.map(b => normalize(b)));
        setUserProfiles(profilesData.map(p => normalize(p)));
        setDiningOrders(ordersData.map(o => normalize(o)));
        setFeedbacks(feedbackData.map(f => normalize(f)));
        setOffers(offersData.map(o => normalize(o)));
      } catch (err) {
        console.error('Failed to load data from backend, falling back to mock data', err);
      }
    };

    fetchAll();
  }, [currentUser]);

  const handleLogin = (user) => {
    // user comes from backend auth (/api/auth/login or /api/auth/register)
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  const handleCreateBooking = async (newBooking) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...newBooking };
      delete payload.id;
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      const bookingWithId = { ...saved, id: saved.id || saved._id };

      setBookings(prev => [bookingWithId, ...prev]);

      // Auto status update for Rooms upon booking
      if (newBooking.bookingCategory === 'ROOM') {
        setRooms(prev => prev.map(room =>
          room.id === newBooking.roomId
            ? { ...room, status: 'Occupied' }
            : room
        ));
      } else {
        setHalls(prev => prev.map(hall =>
          hall.id === newBooking.roomId
            ? { ...hall, status: 'Booked' }
            : hall
        ));
      }
    } catch (err) {
      console.error('Failed to create booking', err);
    }
  };

  const handleCreateDiningOrder = async (newOrder) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...newOrder };
      delete payload.id;
      const res = await fetch(`${API_BASE}/api/dining-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      const orderWithId = { ...saved, id: saved.id || saved._id };
      setDiningOrders(prev => [orderWithId, ...prev]);
    } catch (err) {
      console.error('Failed to create dining order', err);
    }
  };

  const handleAddFeedback = async (newFeedback) => {
    try {
      const payload = { ...newFeedback };
      delete payload.id;
      const res = await fetch(`${API_BASE}/api/feedbacks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      const fbWithId = { ...saved, id: saved.id || saved._id };
      setFeedbacks(prev => [fbWithId, ...prev]);
    } catch (err) {
      console.error('Failed to add feedback', err);
    }
  };

  const handleUpdateBooking = async (updatedBooking) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...updatedBooking };
      const id = payload.id || payload._id;
      delete payload.id;
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      const bookingWithId = { ...saved, id: saved.id || saved._id };

      setBookings(prev => prev.map(b => b.id === bookingWithId.id ? bookingWithId : b));

      // Sync Room Status based on Booking Lifecycle
      if (updatedBooking.bookingCategory === 'ROOM') {
        setRooms(prev => prev.map(r => {
          if (r.id === bookingWithId.roomId) {
            if (bookingWithId.status === 'Checked In') return { ...r, status: 'Occupied' };
            if (bookingWithId.status === 'Checked Out') return { ...r, status: 'Dirty' };
            if (bookingWithId.status === 'Cancelled') return { ...r, status: 'Clean' }; // Free up room
          }
          return r;
        }));
      }
    } catch (err) {
      console.error('Failed to update booking', err);
    }
  };

  const handleUpdateRoomStatus = (roomId, newStatus) => {
    setRooms(prev => prev.map(room =>
      room.id === roomId ? { ...room, status: newStatus } : room
    ));
  };

  const handleAddRoom = async (newRoom) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...newRoom };
      delete payload.id;
      delete payload._id;
      const res = await fetch(`${API_BASE}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      const saved = await res.json();
      setRooms(prev => [...prev, normalize(saved)]);
    } catch (err) {
      console.error('Failed to add room', err);
      alert('Failed to add room: ' + err.message);
    }
  };

  const handleEditRoom = async (updatedRoom) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...updatedRoom };
      const id = String(payload.id || payload._id);
      delete payload.id;
      delete payload._id;
      const res = await fetch(`${API_BASE}/api/rooms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      const saved = await res.json();
      const roomWithId = normalize(saved);
      setRooms(prev => prev.map(r => r.id === roomWithId.id ? roomWithId : r));
    } catch (err) {
      console.error('Failed to edit room', err);
      alert('Failed to edit room: ' + err.message);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/rooms/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setRooms(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error('Failed to delete room', err);
    }
  };

  const handleAddHall = async (newHall) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...newHall };
      delete payload.id;
      delete payload._id;
      const res = await fetch(`${API_BASE}/api/halls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      const saved = await res.json();
      setHalls(prev => [...prev, normalize(saved)]);
    } catch (err) {
      console.error('Failed to add hall', err);
      alert('Failed to add hall: ' + err.message);
    }
  };

  const handleEditHall = async (updatedHall) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...updatedHall };
      const id = String(payload.id || payload._id);
      delete payload.id;
      delete payload._id;
      const res = await fetch(`${API_BASE}/api/halls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      const saved = await res.json();
      setHalls(prev => prev.map(h => h.id === normalize(saved).id ? normalize(saved) : h));
    } catch (err) {
      console.error('Failed to edit hall', err);
      alert('Failed to edit hall: ' + err.message);
    }
  };

  const handleDeleteHall = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/halls/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setHalls(prev => prev.filter(h => h.id !== id));
    } catch (err) {
      console.error('Failed to delete hall', err);
    }
  };

  const handleAddMenuItem = async (newItem) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...newItem };
      delete payload.id;
      delete payload._id;
      const res = await fetch(`${API_BASE}/api/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      const saved = await res.json();
      setMenuItems(prev => [...prev, normalize(saved)]);
    } catch (err) {
      console.error('Failed to add menu item', err);
      alert('Failed to add menu item: ' + err.message);
    }
  };

  const handleEditMenuItem = async (updatedItem) => {
    try {
      const token = localStorage.getItem('token');
      const payload = { ...updatedItem };
      const id = String(payload.id || payload._id);
      delete payload.id;
      delete payload._id;
      const res = await fetch(`${API_BASE}/api/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed'); }
      const saved = await res.json();
      const itemWithId = normalize(saved);
      setMenuItems(prev => prev.map(i => i.id === itemWithId.id ? itemWithId : i));
    } catch (err) {
      console.error('Failed to edit menu item', err);
      alert('Failed to edit menu item: ' + err.message);
    }
  };

  const handleDeleteMenuItem = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE}/api/menu-items/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMenuItems(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Failed to delete menu item', err);
    }
  };

  const handleUpdateProfile = async (updatedProfile) => {
    try {
      const payload = { ...updatedProfile };
      const email = payload.email || currentUser?.email;
      if (!email) {
        console.error('Cannot update profile: missing email', payload);
        return;
      }
      delete payload.id;

      // Always update (or create) by email – simpler and avoids id issues
      const res = await fetch(`${API_BASE}/api/profiles/${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, email })
      });
      const saved = await res.json();
      const profileWithId = { ...saved, id: saved.id || saved._id };

      setUserProfiles(prev => {
        const existsInState = prev.some(p => p.id === profileWithId.id || p.email === profileWithId.email);
        if (existsInState) {
          return prev.map(p => (p.id === profileWithId.id || p.email === profileWithId.email) ? profileWithId : p);
        }
        return [...prev, profileWithId];
      });
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const handleAddOffer = async (newOffer) => {
    try {
      const payload = { ...newOffer };
      delete payload.id;
      const res = await fetch(`${API_BASE}/api/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      const offerWithId = { ...saved, id: saved.id || saved._id };
      setOffers(prev => [...prev, offerWithId]);
    } catch (err) {
      console.error('Failed to add offer', err);
    }
  };

  const handleEditOffer = async (updatedOffer) => {
    try {
      const payload = { ...updatedOffer };
      const id = payload.id || payload._id;
      delete payload.id;
      const res = await fetch(`${API_BASE}/api/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const saved = await res.json();
      const offerWithId = { ...saved, id: saved.id || saved._id };
      setOffers(prev => prev.map(o => o.id === offerWithId.id ? offerWithId : o));
    } catch (err) {
      console.error('Failed to edit offer', err);
    }
  };

  const handleDeleteOffer = async (id) => {
    try {
      await fetch(`${API_BASE}/api/offers/${id}`, { method: 'DELETE' });
      setOffers(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error('Failed to delete offer', err);
    }
  };

  if (!currentUser) {
    return <Auth onLogin={handleLogin} />;
  }

  const currentProfile = userProfiles.find(p => p.email === currentUser.email) || {
    ...currentUser,
    paymentMethods: [],
    documents: [],
    preferences: { preferredFloor: 'No Preference', pillowType: 'Hypoallergenic', dietaryRestrictions: [], newsletter: false },
    loyaltyPoints: 0,
    loyaltyTier: 'Silver',
    adminNotes: ''
  };

  return (
    <div className="relative">
      {currentUser.role === 'ADMIN' ? (
        <AdminPortal
          rooms={rooms}
          halls={halls}
          menuItems={menuItems}
          bookings={bookings}
          profiles={userProfiles}
          feedbacks={feedbacks}
          offers={offers}
          onUpdateRoomStatus={handleUpdateRoomStatus}
          onUpdateBooking={handleUpdateBooking}
          onAddRoom={handleAddRoom}
          onEditRoom={handleEditRoom}
          onDeleteRoom={handleDeleteRoom}
          onAddHall={handleAddHall}
          onEditHall={handleEditHall}
          onDeleteHall={handleDeleteHall}
          onAddMenuItem={handleAddMenuItem}
          onEditMenuItem={handleEditMenuItem}
          onDeleteMenuItem={handleDeleteMenuItem}
          onAddOffer={handleAddOffer}
          onEditOffer={handleEditOffer}
          onDeleteOffer={handleDeleteOffer}
          onUpdateProfile={handleUpdateProfile}
          user={currentUser}
          onLogout={handleLogout}
        />
      ) : (
        <>
          <CustomerPortal
            rooms={rooms}
            halls={halls}
            menuItems={menuItems}
            bookings={bookings.filter(b => b.guestEmail === currentUser.email)}
            diningOrders={diningOrders}
            offers={offers}
            user={currentUser}
            profile={currentProfile}
            adminProfile={userProfiles.find(p => p.role === 'ADMIN')}
            onUpdateProfile={handleUpdateProfile}
            onCreateBooking={handleCreateBooking}
            onAddDiningOrder={handleCreateDiningOrder}
            onAddFeedback={handleAddFeedback}
            onLogout={handleLogout}
          />
          <Chatbot />
        </>
      )}
    </div>
  );
};

export default App;

