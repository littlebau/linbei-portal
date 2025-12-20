import React, { useState } from 'react';
import { Map, Video, Calendar, MapPin, Camera, Backpack, Star, X, PawPrint, Plane, Music, Sun, ArrowRight, Utensils, Images } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 🎨 素材層 (ASSETS LAYER)
// ==========================================
const ASSETS = {
  // 1. Logo
  logo: "https://drive.google.com/file/d/1M-U8vr_LZXM56NQDNb5sDPZyQdwPN31f/view?usp=drive_link",

  // 2. 一家三口照片
  family: "https://drive.google.com/file/d/16iZWeAVFG3PYDGCmWQi_HqS_bkcffDQd/view?usp=drive_link", 
  
  // 3. 旅遊裝備 (使用 placeholder 確保顯示)
  items: "https://placehold.co/600x300/png?text=Travel+Items",
  
  // 4. 背景紋理
  paper: "https://www.transparenttextures.com/patterns/cream-paper.png",
};

// ==========================================
// 🗂️ 資料層 (DATA LAYER)
// ==========================================

// 定義行程資料介面 (TypeScript Interface)
interface Trip {
  year: number;
  season: string;
  title: string;
  location: string;
  status: string;
  type: string;
  image: string;
  album: string; // 相簿連結
  plan: string;  // 新增：計畫連結
  vlog: string;  // 新增：影片連結
}

const allTrips: Trip[] = [
  { 
    year: 2025, season: "春假", title: "紐西蘭", location: "New Zealand", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOnC_qyPEENGBXm9a2ztYIwfFwSD3yrdoenrXKPllvVVj0IpQgAOeXjU6fE4d2TofZUac99-3MhUXbHIZcTnsNNY4KNr8Sn5fneQeWTzH9OEWpIEM3gbQwIC2EtbemZxFDwUqUxOCJDr_OV6bnfXV47Xg=w1367-h911-s-no-gm?authuser=0",
    album: "https://photos.app.goo.gl/S1CzpJ9nt5PQgR7J7",
    plan: "https://docs.google.com/document/d/13Tg1tbjXMauMIuIlisPgrwgdt9h-0BF9/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true", // 範例：可放入 Google Doc 連結
    vlog: "https://youtu.be/CeH0dgQCtPY" // 範例：可放入 YouTube 連結
  },
  { 
    year: 2025, season: "秋假", title: "日本東北", location: "Tohoku, Japan", status: "Planning", type: "future", 
    image: "https://images.unsplash.com/photo-1528360983277-13d9b152c6d7?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "", 
    vlog: ""
  },
  { 
    year: 2024, season: "秋假", title: "名古屋", location: "Nagoya, Japan", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1565619624098-e6598710b218?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.app.goo.gl/Ntntxma3tJJF2zvR8",
    plan: "",
    vlog: ""
  },
  { 
    year: 2024, season: "暑假", title: "泰國喀比島+芭達雅", location: "Krabi/Pattaya", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2024, season: "春假", title: "馬來西亞沙巴", location: "Sabah, Malaysia", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2023, season: "秋假", title: "東京富士山+輕井澤", location: "Tokyo/Karuizawa", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2023, season: "春假", title: "阿里山", location: "Alishan, Taiwan", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1627894451152-66352ae07b22?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2022, season: "秋假", title: "金門", location: "Kinmen, Taiwan", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1599827876288-299691b33e9e?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2021, season: "春假", title: "澎湖", location: "Penghu, Taiwan", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1590053912959-1d2279b9dd71?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2020, season: "秋假", title: "台東花蓮", location: "Hualien/Taitung", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1571474004502-c1def214ac6d?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2020, season: "寒假", title: "菲律賓長灘島", location: "Boracay, Philippines", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2019, season: "秋假", title: "花蓮", location: "Hualien, Taiwan", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1596716075908-7243c220263f?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2019, season: "春假", title: "小琉球", location: "Xiao Liuqiu", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1582963032768-466d739226eb?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2018, season: "秋假", title: "薄荷島", location: "Bohol, Philippines", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1542332205-4da5d5fa6184?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
  { 
    year: 2018, season: "春假", title: "京都大阪賞櫻", location: "Kyoto/Osaka", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.google.com/",
    plan: "",
    vlog: ""
  },
];

// 🔧 圖片轉換器 (Google Drive Thumbnail Fix)
const resolveImage = (url: string) => {
  if (!url || url.includes("Upload") || url.includes("Paste")) return url;
  if (url.includes("drive.google.com")) {
    const idMatch = url.match(/\/d\/([^/]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
  }
  return url;
};

// ==========================================
// 🧩 元件：漂浮背景圖示
// ==========================================
const FloatingBackground = () => {
  const floatingItems = [
    { icon: <PawPrint size={24} />, left: '10%', top: '20%', delay: 0, duration: 15 },
    { icon: <Plane size={30} />, left: '85%', top: '15%', delay: 2, duration: 20 },
    { icon: <span className="text-2xl">🐶</span>, left: '5%', top: '60%', delay: 5, duration: 18 },
    { icon: <span className="text-2xl">🐱</span>, left: '90%', top: '50%', delay: 1, duration: 16 },
    { icon: <Camera size={28} />, left: '15%', top: '85%', delay: 3, duration: 22 },
    { icon: <Sun size={32} className="text-orange-400" />, left: '80%', top: '80%', delay: 4, duration: 25 },
    { icon: <span className="text-2xl">🐾</span>, left: '50%', top: '5%', delay: 6, duration: 30 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {floatingItems.map((item, index) => (
        <motion.div
          key={index}
          initial={{ y: 0, opacity: 0.2 }}
          animate={{ 
            y: [0, -20, 0], 
            rotate: [0, 10, -10, 0],
            opacity: [0.2, 0.5, 0.2] 
          }}
          transition={{ 
            duration: item.duration, 
            repeat: Infinity, 
            ease: "easeInOut",
            delay: item.delay
          }}
          className="absolute text-stone-400"
          style={{ left: item.left, top: item.top }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
};

// ==========================================
// 🚀 主程式
// ==========================================

const App = () => {
  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-700 font-['Patrick_Hand',_cursive] selection:bg-yellow-200 pb-20 overflow-hidden relative"
         style={{backgroundImage: `url(${ASSETS.paper})`}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
        .hand-drawn-border { stroke-linecap: round; stroke-linejoin: round; filter: url(#wobble); }
        /* 質感升級：更細緻的陰影和邊框 */
        .journal-card { 
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border: 1px solid #e7e5e4;
        }
      `}</style>
      
      <svg style={{position: 'absolute', width: 0, height: 0}}>
        <filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" /></filter>
      </svg>

      <FloatingBackground />

      {/* Header */}
      <header className="relative pt-20 pb-12 px-6 text-center z-10">
        
        {/* 裝飾圖片 (保持在左上角) */}
        <motion.div 
          initial={{ x: -100, opacity: 0, rotate: -45 }}
          animate={{ x: 0, opacity: 1, rotate: -12 }}
          transition={{ type: "spring", duration: 1.5, delay: 0.5 }}
          className="absolute top-10 left-6 hidden md:block w-48"
        >
           <img 
             src={resolveImage(ASSETS.items)} 
             alt="Items" 
             className="drop-shadow-lg opacity-90 w-full h-auto" 
             referrerPolicy="no-referrer"
             onError={(e) => (e.currentTarget.style.opacity = '0.3')} 
           />
        </motion.div>

        <div className="max-w-5xl mx-auto relative z-10 flex flex-col items-center">
          
          {/* Logo 與 家庭照片並排區塊 */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-20 mb-12 w-full mt-8">
            
            {/* LOGO */}
            <motion.div 
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
              className="w-64 h-64 md:w-80 md:h-80 relative flex-shrink-0"
            >
               <img 
                 src={resolveImage(ASSETS.logo)} 
                 alt="Linbei Logo" 
                 className="w-full h-full object-contain drop-shadow-xl cursor-pointer"
                 referrerPolicy="no-referrer"
                 onError={(e) => (e.currentTarget.style.opacity = '0.3')} 
               />
            </motion.div>

            {/* 一家三口照片 */}
            <motion.div 
              initial={{ opacity: 0, x: 20, rotate: 5 }}
              animate={{ opacity: 1, x: 0, rotate: 3 }}
              transition={{ duration: 1, delay: 0.5, ease: "easeOut" }} 
              className="w-72 md:w-96 relative flex-shrink-0 bg-white p-4 pb-12 shadow-xl rotate-2 border border-stone-200"
            >
               {/* 膠帶裝飾 */}
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-200/80 -rotate-2 shadow-sm backdrop-blur-sm z-20"></div>
               <div className="aspect-square w-full overflow-hidden bg-stone-100 border border-stone-100">
                 <img 
                   src={resolveImage(ASSETS.family)} 
                   alt="Family" 
                   className="w-full h-full object-cover hover:scale-105 transition-all duration-700" 
                   referrerPolicy="no-referrer"
                   onError={(e) => (e.currentTarget.style.opacity = '0.3')} 
                 />
               </div>
               <div className="absolute bottom-4 left-0 w-full text-center font-bold text-stone-500 font-['Patrick_Hand'] text-xl">
                 Since 2018
               </div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="flex flex-col items-center"
          >
            <div className="h-1 w-20 bg-stone-300 mb-6 rounded-full"></div>
            <p className="text-2xl text-stone-600 max-w-lg mx-auto leading-relaxed font-bold tracking-wide">
              從 2018 到 2025<br/>
              收集世界的角落，紀錄我們一起長大的時光。
            </p>
          </motion.div>
        </div>
      </header>

      {/* Main Content: Trip Cards (質感升級) */}
      <main className="max-w-6xl mx-auto px-6 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {allTrips.map((trip, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index % 3 * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-white p-4 flex flex-col journal-card rounded-sm transition-all duration-300 hover:shadow-xl"
            >
              {/* 紙膠帶裝飾 */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-blue-100/80 shadow-sm rotate-1 z-20 backdrop-blur-[1px]"></div>

              {/* 拍立得風格圖片區 */}
              <div className="relative aspect-[4/3] overflow-hidden mb-5 bg-stone-100 p-1 border border-stone-100 shadow-inner">
                 <div className="w-full h-full overflow-hidden relative">
                   <img 
                     src={resolveImage(trip.image)} 
                     alt={trip.title} 
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                     referrerPolicy="no-referrer"
                   />
                   {/* 狀態戳章 */}
                   <div className="absolute top-2 right-2">
                      <span className={`inline-block px-2 py-1 text-xs font-black tracking-widest uppercase border-2 bg-white/90 -rotate-6 shadow-md ${trip.status === 'Done' ? 'border-blue-500 text-blue-500' : 'border-emerald-500 text-emerald-500'}`}>
                        {trip.status}
                      </span>
                   </div>
                 </div>
              </div>

              {/* 卡片內容 */}
              <div className="flex flex-col flex-grow px-2">
                <div className="flex items-center gap-2 mb-3 text-stone-400 text-xs font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} /> {trip.year} {trip.season}
                  </span>
                  <div className="h-px bg-stone-300 flex-grow"></div>
                </div>

                <h3 className="text-2xl font-bold mb-2 text-stone-800 group-hover:text-stone-600 transition-colors leading-tight">
                  {trip.title}
                </h3>
                
                <div className="flex items-center gap-1 text-stone-500 font-bold mb-6 text-sm">
                   <MapPin size={14} className="text-stone-400" /> {trip.location}
                </div>

                {/* 質感按鈕區 */}
                <div className="mt-auto flex gap-3 border-t border-dashed border-stone-200 pt-4">
                  {/* PLAN BUTTON (UPDATED) */}
                  <a 
                    href={trip.plan || "#"} 
                    target={trip.plan ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-all rounded-md ${
                      trip.plan 
                        ? "text-stone-600 hover:text-blue-600 hover:bg-blue-50 cursor-pointer" 
                        : "text-stone-300 cursor-not-allowed"
                    }`}
                    onClick={(e) => !trip.plan && e.preventDefault()}
                  >
                    <Map size={16} /> <span className="tracking-widest hidden sm:inline">旅行計畫</span>
                  </a>
                  
                  <div className="w-px bg-stone-200 my-1"></div>
                  
                  {/* ALBUM BUTTON */}
                  <a 
                    href={trip.album || "#"} 
                    target={trip.album ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-all rounded-md ${
                      trip.album 
                        ? "text-stone-600 hover:text-amber-600 hover:bg-amber-50 cursor-pointer" 
                        : "text-stone-300 cursor-not-allowed"
                    }`}
                    onClick={(e) => !trip.album && e.preventDefault()}
                  >
                    <Images size={16} /> <span className="tracking-widest hidden sm:inline">相簿</span>
                  </a>

                  <div className="w-px bg-stone-200 my-1"></div>

                  {/* VLOG BUTTON (UPDATED) */}
                  <a 
                    href={trip.vlog || "#"} 
                    target={trip.vlog ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold transition-all rounded-md ${
                      trip.vlog 
                        ? "text-stone-600 hover:text-red-600 hover:bg-red-50 cursor-pointer" 
                        : "text-stone-300 cursor-not-allowed"
                    }`}
                    onClick={(e) => !trip.vlog && e.preventDefault()}
                  >
                    <Video size={16} /> <span className="tracking-widest hidden sm:inline">旅遊影片</span>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="mt-32 pt-16 border-t border-stone-200 text-center relative z-10 bg-white/50 backdrop-blur-sm pb-10">
         <div className="relative z-10 flex flex-col items-center justify-center gap-6 text-stone-400">
           <div className="flex gap-6">
             <Camera size={28} className="text-stone-300 hover:text-stone-500 transition-colors cursor-pointer" />
             <Backpack size={28} className="text-stone-300 hover:text-stone-500 transition-colors cursor-pointer" />
             <Plane size={28} className="text-stone-300 hover:text-stone-500 transition-colors cursor-pointer" />
           </div>
           <p className="text-stone-500 font-bold text-lg tracking-wide">
             © 2025 Family Travel Journal.<br/>
             <span className="text-xs font-normal uppercase tracking-widest text-stone-400 mt-2 block">Designed for Memories</span>
           </p>
         </div>
      </footer>
    </div>
  );
};

export default App;