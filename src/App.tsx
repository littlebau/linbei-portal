import { useState, useEffect } from 'react';
import { Map, Video, Calendar, MapPin, Camera, Backpack, Star, X, PawPrint, Plane, Music, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 🎨 素材層 (ASSETS LAYER)
// ==========================================
const ASSETS = {
  // 1. Logo
  logo: "https://drive.google.com/file/d/1M-U8vr_LZXM56NQDNb5sDPZyQdwPN31f/view?usp=drive_link",

  // 2. 一家三口照片
  family: "https://drive.google.com/file/d/16iZWeAVFG3PYDGCmWQi_HqS_bkcffDQd/view?usp=drive_link", 
  
  // 3. 旅遊裝備 (維持 Imgur 連結或佔位)
  items: "https://placehold.co/600x300/png?text=Travel+Items",
  
  // 4. 背景紋理
  paper: "https://www.transparenttextures.com/patterns/cream-paper.png",
};

// ==========================================
// 🗂️ 資料層 (DATA LAYER)
// ==========================================

// 每個行程都加上 image 欄位，目前先用 Unsplash 頂替，您可以換成 Google Drive 連結
const allTrips = [
  { 
    year: 2025, season: "春假", title: "紐西蘭開露營車", location: "New Zealand", status: "規劃中", type: "future",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2025, season: "秋假", title: "日本東北賞楓追火車", location: "Tohoku, Japan", status: "規劃中", type: "future",
    image: "https://images.unsplash.com/photo-1505886559267-3367b36f7330?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2024, season: "秋假", title: "名古屋樂高樂園+吉卜力", location: "Nagoya, Japan", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1594979397839-a9c80338779b?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2024, season: "暑假", title: "泰國喀比島+芭達雅跳島", location: "Krabi/Pattaya", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2024, season: "春假", title: "馬來西亞沙巴探險", location: "Sabah, Malaysia", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2023, season: "秋假", title: "東京富士山+輕井澤避暑", location: "Tokyo/Karuizawa", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2023, season: "春假", title: "阿里山坐小火車看日出", location: "Alishan, Taiwan", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1517469399878-a28a278914ba?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2022, season: "秋假", title: "金門戰地風光+找風獅爺", location: "Kinmen, Taiwan", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1627918349275-04b327b87232?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2021, season: "春假", title: "澎湖花火節吃仙人掌冰", location: "Penghu, Taiwan", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1589982704987-9b23b379b339?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2020, season: "秋假", title: "台東花蓮東海岸慢遊", location: "Hualien/Taitung", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1588762557343-6c7088b9076f?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2020, season: "寒假", title: "菲律賓長灘島最後一飛", location: "Boracay, Philippines", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2019, season: "秋假", title: "花蓮太魯閣壯麗峽谷", location: "Hualien, Taiwan", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1596716075908-7243c220263f?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2019, season: "春假", title: "小琉球看海龜", location: "Xiao Liuqiu", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1682687220208-22d7a2543e88?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2018, season: "秋假", title: "薄荷島巧克力山眼鏡猴", location: "Bohol, Philippines", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&q=80&w=800"
  },
  { 
    year: 2018, season: "春假", title: "京都大阪賞櫻粉紅泡泡", location: "Kyoto/Osaka", status: "已完成", type: "past",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800"
  },
];

// 🔧 終極修復版圖片轉換器
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
// 🧩 元件：打字機標題
// ==========================================
const TypewriterTitle = ({ text }: { text: string }) => {
  return (
    <h1 className="text-5xl md:text-7xl font-black text-stone-800 mb-6 relative inline-block">
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.1, 
            delay: index * 0.15,
            type: "spring", 
            stiffness: 100 
          }}
          className="relative z-10 inline-block"
        >
          {char}
        </motion.span>
      ))}
      <motion.svg 
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.6 }}
        transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
        className="absolute -bottom-2 left-0 w-full h-6 z-0" 
        viewBox="0 0 300 20" 
        preserveAspectRatio="none"
      >
        <motion.path d="M5,15 Q80,5 150,12 T295,10" fill="none" stroke="#fcd34d" strokeWidth="12" strokeLinecap="round"/>
      </motion.svg>
    </h1>
  );
};

// ==========================================
// 🚀 主程式
// ==========================================

const App = () => {
  return (
    <div className="min-h-screen bg-[#fffbeb] text-stone-700 font-['Patrick_Hand',_cursive] selection:bg-yellow-200 pb-20 overflow-hidden relative"
         style={{backgroundImage: `url(${ASSETS.paper})`}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
        .hand-drawn-border { stroke-linecap: round; stroke-linejoin: round; filter: url(#wobble); }
        .hand-drawn-box { border-radius: 15px 15px 15px 15px/255px 15px 255px 15px; border: 3px solid #78350f; }
        .hand-drawn-shadow { box-shadow: 5px 5px 0px 0px rgba(120, 53, 15, 0.2); }
      `}</style>
      
      <svg style={{position: 'absolute', width: 0, height: 0}}>
        <filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" /></filter>
      </svg>

      <FloatingBackground />

      {/* Header */}
      <header className="relative pt-24 pb-16 px-6 text-center z-10">
        
        {/* 裝飾圖片 */}
        <motion.div 
          initial={{ x: -100, opacity: 0, rotate: -45 }}
          animate={{ x: 0, opacity: 1, rotate: -12 }}
          transition={{ type: "spring", duration: 1.5, delay: 0.5 }}
          className="absolute top-10 left-10 hidden md:block w-48"
        >
           <img 
             src={resolveImage(ASSETS.items)} 
             alt="Items" 
             className="drop-shadow-lg opacity-90 w-full h-auto" 
             referrerPolicy="no-referrer"
             onError={(e) => e.currentTarget.style.opacity = '0.3'} 
           />
        </motion.div>

        <div className="max-w-3xl mx-auto relative z-10">
          
          {/* LOGO */}
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
            className="w-40 h-40 mx-auto mb-6"
          >
             <img 
               src={resolveImage(ASSETS.logo)} 
               alt="Linbei Logo" 
               className="w-full h-full object-contain drop-shadow-xl cursor-pointer"
               referrerPolicy="no-referrer"
               onError={(e) => e.currentTarget.style.opacity = '0.3'} 
             />
          </motion.div>

          {/* 一家三口照片 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3, ease: "easeOut" }} 
            className="flex justify-center items-end gap-4 mb-6"
          >
            <div className="w-64 h-64 relative">
               <img 
                 src={resolveImage(ASSETS.family)} 
                 alt="Family" 
                 className="w-full h-full object-contain drop-shadow-xl" 
                 referrerPolicy="no-referrer"
                 onError={(e) => e.currentTarget.style.opacity = '0.3'} 
               />
            </div>
          </motion.div>
          
          <div className="mb-6 min-h-[80px]">
            <TypewriterTitle text="林北三人成團" />
          </div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="text-xl text-stone-600 max-w-lg mx-auto leading-relaxed font-bold"
          >
            從 2018 到 2025<br/>
            收集世界的角落，紀錄我們一起長大的時光。
          </motion.p>
        </div>
      </header>

      {/* Main Content: Trip Cards */}
      <main className="max-w-6xl mx-auto px-6 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allTrips.map((trip, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index % 3 * 0.1 }}
              whileHover={{ y: -10, rotate: index % 2 === 0 ? 1 : -1, scale: 1.02 }}
              className={`group relative bg-white p-4 pb-6 hand-drawn-box hand-drawn-shadow flex flex-col ${trip.type === 'future' ? 'bg-[#fffbeb]' : ''}`}
            >
              {/* 圖釘 (裝飾) */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 border-2 border-red-600 shadow-md z-20"></div>

              {/* 卡片封面圖片 */}
              <div className="relative aspect-[4/3] overflow-hidden mb-4 rounded-lg border-2 border-stone-200">
                 <img 
                   src={resolveImage(trip.image)} 
                   alt={trip.title} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                   referrerPolicy="no-referrer"
                 />
                 {/* 狀態標籤 */}
                 <div className="absolute top-2 right-2">
                    <span className={`inline-block px-2 py-1 rounded-md text-xs font-bold border ${
                      trip.type === 'future' 
                        ? 'bg-yellow-100 border-yellow-400 text-yellow-800' 
                        : 'bg-green-100 border-green-400 text-green-800'
                    } shadow-sm`}>
                      {trip.status}
                    </span>
                 </div>
              </div>

              {/* 卡片內容 */}
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-500 border border-stone-200">
                    <Calendar size={12} className="inline mr-1 mb-0.5" />
                    {trip.year} {trip.season}
                  </span>
                  {trip.type === 'future' && <Star className="text-yellow-400 fill-current animate-pulse" size={16} />}
                </div>

                <h3 className="text-xl font-bold mb-2 text-stone-800 group-hover:text-orange-700 transition-colors leading-tight">
                  {trip.title}
                </h3>
                
                <div className="flex items-center gap-1 text-stone-500 font-bold mb-4 text-xs">
                   <MapPin size={14} /> {trip.location}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2">
                  <button disabled={trip.type === 'future'} className={`flex items-center justify-center gap-1 border-2 rounded-lg py-2 font-bold text-sm transition-colors relative overflow-hidden group/btn ${trip.type === 'future' ? 'bg-stone-50 border-stone-200 text-stone-300 cursor-not-allowed' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300'}`}>
                    <Map size={14} className="hand-drawn-filter" /> 行程
                  </button>
                  <button disabled={trip.type === 'future'} className={`flex items-center justify-center gap-1 border-2 rounded-lg py-2 font-bold text-sm transition-colors relative overflow-hidden group/btn ${trip.type === 'future' ? 'bg-stone-50 border-stone-200 text-stone-300 cursor-not-allowed' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300'}`}>
                    <Video size={14} className="hand-drawn-filter" /> 影片
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="mt-24 pt-12 border-t-4 border-dotted border-stone-300 text-center relative z-10">
         <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-stone-400 mb-8">
           <div className="flex gap-4">
             <Camera size={24} className="text-stone-300 hover:text-stone-600 transition-colors animate-bounce" />
             <Backpack size={24} className="text-stone-300 hover:text-stone-600 transition-colors animate-bounce" style={{ animationDelay: '0.5s' }} />
           </div>
           <p className="text-stone-500 font-bold text-lg">
             © 2025 Family Travel Journal.<br/>
             <span className="text-sm font-normal">Created with Love, Gemini & StackBlitz.</span>
           </p>
         </div>
      </footer>
    </div>
  );
};

export default App;