# Celestine's 3rd Birthday Pool Party Invitation 🐱✨🏊‍♀️

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Motion](https://img.shields.io/badge/Motion-Framer-FF0055?style=flat-square&logo=framer&logoColor=white)](https://motion.dev/)
[![Google Sheets API](https://img.shields.io/badge/Google_Apps_Script-Backend-34A853?style=flat-square&logo=google-sheets&logoColor=white)](https://developers.google.com/apps-script)

An interactive, mobile-first web invitation crafted for **Celestine's (Cia) 3rd Birthday Celebration** at Casa de Clara, Marikina. Designed with a vibrant **Gabby's Dollhouse** and **Pool Party** theme, packed with smooth animations, mobile gyroscope motion parallax, sound effects, live RSVP tracking, guest photo sharing directly to Google Drive, and an interactive wishes wall.

---

## 🌟 Highlights & Key Features

### 💌 Interactive Opening Envelope
- **3D Animated Unfolding**: Guests tap an interactive wax seal to reveal the invitation.
- **Micro-interactions & Audio**: Plays celebratory sound effects and sparkle animations upon opening.
- **Replay Anytime**: Guests can re-seal and re-open the envelope using the header quick action button.

### 🐱 2.5D Parallax Hero Stage
- **Mobile Gyroscope Support**: On smartphones, tilting the device dynamically shifts layered cutouts of Celestine and floating celebratory badges.
- **Desktop Cursor Tracking**: On laptops and desktop screens, the parallax shifts smoothly in response to mouse movement.
- **Visual Depth**: Layered backdrop, cutout portraits, confetti particles, and floating status pills.

### 📱 Responsive Mobile-First & Desktop Split Grid
- **Mobile Optimized**: Tailored for smartphones with touch-friendly controls and smooth vertical flow.
- **Widescreen Dual-Column Layout**: On desktop screens, transforms into a 2-column split grid featuring a sticky left profile card and a dynamic scrollable content feed on the right.

### 🪄 Magic UI Floating Navigation Dock
- **macOS-Style Dock**: Centered floating bottom dock with spring-physics magnification on hover and tap.
- **Fast Navigation**: One-tap jumps to Home, Photo Sharing, Venue Map, Dress Code, and RSVP sections.

### 📸 Guest Photo Sharing & Memory Uploader
- **Live Memory Wall**: Guests can take or upload party photos directly from their phone camera or album.
- **Google Drive Integration**: Uploaded base64 images are automatically saved into a dedicated Google Drive folder via Google Apps Script.
- **Photo Metadata**: Captions, uploader names, timestamps, and like counts are indexed and rendered in real time.

### 📝 Live RSVP Tracking & Confirmation
- **Instant Attendance Submission**: Guests select attendance status, number of adults, number of children, and leave an optional birthday message.
- **Confirmation Popup**: Interactive modal verifying guest details upon submission.
- **Google Sheets Sync**: Real-time write and read operations keeping headcount synced.

### 💖 Interactive Wishes Wall
- **Community Message Board**: Heartfelt birthday messages from friends and family displayed in colorful greeting cards.
- **Reaction Counter**: Guests can tap to like individual wishes with animated feedback.

### 🎵 Background Music & Audio Synth Engine
- **Soundtrack Vibes**: Features party background music along with synthesized sparkle and pop sound effects.
- **Web Audio API Synth**: Custom-built chiptune/FM sound synthesizer engine (`audioSynth.ts`) ensuring crisp audio feedback without external audio latency.

### 📍 Venue Details & One-Click Navigation
- **Casa de Clara (Provident Village, Marikina)**: Complete address, parking guidelines, and pool preparation notes.
- **Direct Maps Links**: Integrated one-tap buttons for both **Google Maps** and **Apple Maps**.

### ⏰ RSVP Reminder & Sharing
- **RSVP Deadline Notification**: Polite pop-up modal highlighting the confirmation cut-off date.
- **Native Share Support**: Uses the Web Share API with instant fallback to clipboard copying.

---

## 🛠️ Tech Stack

| Category | Technology | Description |
|---|---|---|
| **Framework** | [React 19](https://react.dev/) | Modern component architecture with hooks |
| **Language** | [TypeScript 5.8](https://www.typescriptlang.org/) | Strict type safety and clear domain models |
| **Tooling** | [Vite 6](https://vitejs.dev/) | Ultra-fast build tool and development server |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Next-generation utility-first CSS styling via `@tailwindcss/vite` |
| **Animations** | [Motion](https://motion.dev/) | Smooth layout transitions, springs, and hover effects |
| **Effects** | [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti) | Confetti explosions on RSVP and celebration milestones |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, consistent icons |
| **Audio** | [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Custom procedural sound synthesizer engine |
| **Backend** | [Google Apps Script](https://developers.google.com/apps-script) | Serverless REST endpoint connected to Google Sheets & Google Drive |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Package Manager**: npm, pnpm, or bun

### 1. Clone the Repository
```bash
git clone https://github.com/clydekeanu-rgb/Ciawebinvi.git
cd Ciawebinvi
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
# Google Apps Script Web App URL for live RSVPs, Wishes, and Guest Photos
VITE_GOOGLE_SHEETS_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

> [!NOTE]
> If `VITE_GOOGLE_SHEETS_URL` is omitted, the app will fall back to local storage and the preconfigured endpoint.

### 4. Run Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
```
The compiled, production-ready static assets will be output in the `dist/` directory.

---

## ☁️ Google Sheets & Drive Backend Setup

The application uses a serverless **Google Apps Script** deployed as a Web App to store RSVPs, wishes, uploaded guest photos, and guest comments:

1. Create or configure your **Google Sheet** with four tabs:
   - **`RSVPs`**: `ID`, `Guest Name`, `Attending`, `Adults`, `Kids`, `Birthday Wish`, `Submitted At`
   - **`Wishes`**: `ID`, `Sender`, `Message`, `Sticker`, `Timestamp`, `Likes`
   - **`GuestPhotos`**: `ID`, `Uploader Name`, `Caption`, `Image URL`, `Created At`, `Likes`
   - **`PhotoComments`**: `ID`, `Photo ID`, `Author`, `Text`, `Created At`
2. Create a folder in your **Google Drive** to store guest photo uploads.
3. Open **Extensions > Apps Script** in the spreadsheet and paste the Apps Script code found in [`src/services/googleSheets.ts`](src/services/googleSheets.ts).
4. Replace `PHOTO_FOLDER_NAME` in the script with your Google Drive folder name.
5. Click **Deploy > New Deployment**:
   - **Type**: Web App
   - **Execute as**: Me
   - **Who has access**: Anyone
6. Copy the resulting Web App URL and set it as `VITE_GOOGLE_SHEETS_URL` in your `.env.local`.

---

## 📁 Project Structure

```text
Ciawebinvi/
├── public/
│   ├── celestine_bg.jpg         # Hero background artwork
│   ├── celestine_cutout.png     # Cutout portrait for 2.5D parallax
│   ├── celestine_tiara.png      # Decorative badge asset
│   ├── try_everything.mp3       # Party audio track
│   └── gallery/                 # High-resolution photo gallery assets
├── src/
│   ├── components/
│   │   ├── CountdownTimer.tsx       # Live countdown ticker
│   │   ├── GuestPhotoSection.tsx    # Photo uploader & guest gallery
│   │   ├── HeroSection.tsx          # 2.5D gyroscope parallax hero
│   │   ├── InteractiveEnvelope.tsx  # Unfolding opening envelope
│   │   ├── MusicPlayer.tsx          # Floating audio player
│   │   ├── PartyDetailsCard.tsx     # Dress code & heart notes
│   │   ├── PartyTimeline.tsx        # Event schedule & activity milestones
│   │   ├── PhotoGallerySection.tsx  # Celestine's photo gallery
│   │   ├── RsvpReminderModal.tsx    # Deadline reminder modal
│   │   ├── RsvpSection.tsx          # RSVP form & live guest counter
│   │   ├── ScrollReveal.tsx         # Scroll viewport animation wrapper
│   │   ├── VenueMapSection.tsx      # Venue location & directions
│   │   ├── WishesWall.tsx           # Interactive community wishes board
│   │   └── magicui/
│   │       └── dock.tsx             # Interactive floating navigation dock
│   ├── data/
│   │   └── partyData.ts             # Party configuration, timeline & details
│   ├── services/
│   │   └── googleSheets.ts          # Google Apps Script API integration
│   ├── utils/
│   │   └── audioSynth.ts            # Web Audio API sound effects synthesizer
│   ├── types.ts                     # TypeScript data interfaces
│   ├── App.tsx                      # Root page layout & navigation
│   ├── main.tsx                     # React entry point
│   └── index.css                    # Tailwind CSS v4 setup & theme styles
├── index.html                       # HTML head metadata & font preloads
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript compiler config
└── vite.config.ts                   # Vite configuration
```

---

## 🎨 Event Details

- **Celebrant**: Celestine (Cia)
- **Age**: Turning 3! 🎂
- **Theme**: Gabby's Dollhouse Pool Party 🐱🫧
- **Date**: Saturday, October 3, 2026 (2:00 PM – 6:00 PM)
- **Venue**: Casa de Clara, Saint Claire, Tañong, Provident Village, Marikina City
- **Dress Code**: Swimsuits / Pool Attire & Change of Clothes 🩱🏊‍♂️

---

## 👨‍💻 Author & Credits

Designed and developed with ❤️ by **[Clyde Abenojar](https://www.clydeabenojar.site)**.

---

## 📄 License

This project is created for Celestine's 3rd Birthday Celebration. All rights reserved.