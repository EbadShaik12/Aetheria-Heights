# Aetheria Heights ✦ Luxury Hospitality Reimagined

A premium, full-stack luxury hospitality management system. Aetheria Heights combines minimalist luxury aesthetics with a robust, feature-rich platform built for seamless guest bookings, dining orders, immersive tours, and administrative analytics.

---

## ✦ Key Features

### 🌐 Guest & Customer Portal
*   **Immersive 360° Room Tours:** Explore rooms and event halls in high-definition 360° views with slide-out details and interactive prev/next gallery controls.
*   **Flexible Booking Engine:** Book premium suites, luxury rooms, and event halls with dynamic pricing, checking availability in real-time.
*   **Smart Dining Portal:** Order luxury meals, beverages, and custom items directly to booked rooms with live billing updates.
*   **Interactive Location Maps:** Discover local tourist attractions and navigate within the hotel premises using custom built-in interactive maps.
*   **PDF Invoices:** Instantly download digital room booking invoices and billing receipts powered by `jsPDF`.
*   **Real-time AI Chatbot:** Get immediate answers to frequently asked questions about room rates, spa services, check-in rules, and dining.

### 💼 Powerful Admin Portal
*   **Live Dashboard Analytics:** Visualize hotel performance, occupancy rates, monthly revenue, and dining sales via clean interactive charts (`recharts`).
*   **Inventory & Price Management:** Add, edit, or delete hotel rooms, event halls, dining menu items, and update pricing on the fly.
*   **Reservation Tracking:** View list of active, completed, and canceled guest reservations.
*   **Newsletter & Marketing:** Send bulk promotional emails and announcements to all subscribed guests via `nodemailer`.

---

## 🛠️ Tech Stack

*   **Frontend:** React (Vite, TailwindCSS, Lucide Icons)
*   **Backend:** Node.js (Express, dotenv, CORS)
*   **Database:** MongoDB (via Mongoose ODM)
*   **Integrations:** 
    *   `react-photo-sphere-viewer` for 360° panoramics
    *   `jsPDF` for PDF invoice generation
    *   `recharts` for interactive admin charts
    *   `nodemailer` for automated emails

---

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB Instance (Local or Atlas)

### 2. Installation
Clone the repository:
```bash
git clone https://github.com/EbadShaik12/Aetheria-Heights.git
cd Aetheria-Heights
```

Install the dependencies:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory:
```env
PORT=3002
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

### 4. Running the Project

**Run the Backend API Server:**
```bash
npm run server
```

**Run the Frontend Dev Server:**
```bash
npm run dev
```

Open your browser to **http://localhost:3000** to experience Aetheria Heights!
