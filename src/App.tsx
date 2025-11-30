import { useState } from 'react';
import { Map, Video, Calendar, MapPin, Camera, Backpack, Star, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// 🎨 素材層 (ASSETS LAYER)
// ==========================================
const ASSETS = {
  // 1. Logo (Imgur)
  logo: "https://i.imgur.com/your-logo-link.png", // 請確認這裡有換成您上傳後的 Logo 連結，如果還沒上傳可以用預設佔位

  // 2. 一家三口照片 (Google Drive)
  family: "https://drive.google.com/file/d/16iZWeAVFG3PYDGCmWQi_HqS_bkcffDQd/view?usp=drive_link", 
  
  // 3. 旅遊裝備 (Imgur)
  items: "https://placehold.co/600x300/png?text=Paste+Imgur+Items+Link",
  
  // 4. 背景紋理
  paper: "https://www.transparenttextures.com/patterns/cream-paper.png",
  worldMap: "https://upload.wikimedia.org/wikipedia/commons/8/80/World_map_-_low_resolution.svg", 
};

// ==========================================
// 🗂️ 資料層 (DATA LAYER)
// ==========================================

const polaroids = [
  { id: 1, src: "https://images.unsplash.com/photo-1519681393784-d120267933ba", caption: "全家福 @京都櫻花樹下", rotate: "-rotate-2" },
  { id: 2, src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e", caption: "孩子們在長灘島玩沙", rotate: "rotate-3" },
  { id: 3, src: "https://images.unsplash.com/photo-1491884662610-735432c3143a", caption: "阿里山看日出冷到發抖", rotate: "-rotate-1" },
  { id: 4, src: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3", caption: "日本東北賞楓", rotate: "rotate-2" },
];

const allTrips = [
  { year: 2025, season: "春假", title: "紐西蘭開露營車", location: "New Zealand", status: "規劃中", type: "future" },
  { year: 2025, season: "秋假", title: "日本東北賞楓追火車", location: "Tohoku, Japan", status: "規劃中", type: "future" },
  { year: 2024, season: "秋假", title: "名古屋樂高樂園+吉卜力", location: "Nagoya, Japan", status: "已完成", type: "past" },
  { year: 2024, season: "暑假", title: "泰國喀比島+芭達雅跳島", location: "Krabi/Pattaya", status: "已完成", type: "past" },
  { year: 2024, season: "春假", title: "馬來西亞沙巴探險", location: "Sabah, Malaysia", status: "已完成", type: "past" },
  { year: 2023, season: "秋假", title: "東京富士山+輕井澤避暑", location: "Tokyo/Karuizawa", status: "已完成", type: "past" },
  { year: 2023, season: "春假", title: "阿里山坐小火車看日出", location: "Alishan, Taiwan", status: "已完成", type: "past" },
  { year: 2022, season: "秋假", title: "金門戰地風光+找風獅爺", location: "Kinmen, Taiwan", status: "已完成", type: "past" },
  { year: 2021, season: "春假", title: "澎湖花火節吃仙人掌冰", location: "Penghu, Taiwan", status: "已完成", type: "past" },
  { year: 2020, season: "秋假", title: "台東花蓮東海岸慢遊", location: "Hualien/Taitung", status: "已完成", type: "past" },
  { year: 2020, season: "寒假", title: "菲律賓長灘島最後一飛", location: "Boracay, Philippines", status: "已完成", type: "past" },
  { year: 2019, season: "秋假", title: "花蓮太魯閣壯麗峽谷", location: "Hualien, Taiwan", status: "已完成", type: "past" },
  { year: 2019, season: "春假", title: "小琉球看海龜", location: "Xiao Liuqiu", status: "已完成", type: "past" },
  { year: 2018, season: "秋假", title: "薄荷島巧克力山眼鏡猴", location: "Bohol, Philippines", status: "已完成", type: "past" },
  { year: 2018, season: "春假", title: "京都大阪賞櫻粉紅泡泡", location: "Kyoto/Osaka", status: "已完成", type: "past" },
];

const mapPins = [
  { id: 1, name: "紐西蘭", top: "85%", left: "92%", img: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=600" },
  { id: 2, name: "日本", top: "35%", left: "85%", img: "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&q=80&w=600" },
  { id: 3, name: "台灣", top: "42%", left: "82%", img: "https://images.unsplash.com/photo-1555400038-63f5ba517a47?auto=format&fit=crop&q=80&w=600" },
  { id: 4, name: "泰國", top: "45%", left: "75%", img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=600" },
];

// 🔧 終極修復版圖片轉換器
const resolveImage = (url: string) => {
  if (!url || url.includes("Upload") || url.includes("Paste")) return url;
  
  if (url.includes("drive.google.com")) {
    // 抓取檔案 ID
    const idMatch = url.match(/\/d\/([^/]+)/);
    if (idMatch && idMatch[1]) {
      // 使用 thumbnail 接口並請求最大尺寸 (w1000)，這個接口通常比較寬鬆
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
  }
  return url;
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
      
      {/* 螢光筆線條動畫 */}
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
// 🧩 元件：互動地圖
// ==========================================
const InteractiveMap = () => {
  const [activePin, setActivePin] = useState<number | null>(null);

  return (
    <div className="relative w-full aspect-[16/9] bg-blue-50/50 rounded-3xl border-4 border-stone-800 overflow-hidden shadow-xl my-12 group">
      <div 
        className="absolute inset-0 opacity-40 bg-contain bg-no-repeat bg-center transition-transform duration-1000 group-hover:scale-105"
        style={{ backgroundImage: `url(${ASSETS.worldMap})` }}
      ></div>
      
      <div className="absolute top-4 left-4 z-10 bg-white/80 px-4 py-2 rounded-lg border-2 border-stone-800 rotate-2">
        <span className="font-bold text-stone-800">🌍 點點看我們去哪玩!</span>
      </div>

      {mapPins.map((pin) => (
        <div key={pin.id} className="absolute" style={{ top: pin.top, left: pin.left }}>
          <motion.button
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActivePin(pin.id)}
            className="relative -translate-x-1/2 -translate-y-1/2"
          >
            <MapPin size={32} className="text-red-500 drop-shadow-md fill-red-500" />
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute top-full left-1/2 -translate-x-1/2 bg-stone-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap mt-1 pointer-events-none"
            >
              {pin.name}
            </motion.span>
          </motion.button>
        </div>
      ))}

      {/* 彈出視窗 */}
      <AnimatePresence>
        {activePin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setActivePin(null)}
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 1 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 5 }}
              transition={{ type: "spring", damping: 15 }}
              className="bg-white p-4 rounded-2xl shadow-2xl max-w-sm w-full relative" 
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setActivePin(null)} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
                <X size={20} />
              </button>
              <div className="aspect-video bg-stone-100 rounded-lg overflow-hidden mb-2">
                <img 
                  src={mapPins.find(p => p.id === activePin)?.img} 
                  alt="Travel Memory" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-center font-bold text-stone-700 text-lg">
                📍 {mapPins.find(p => p.id === activePin)?.name} 之旅
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// 🚀 主程式
// ==========================================

const App = () => {
  return (
    <div className="min-h-screen bg-[#fffbeb] text-stone-700 font-['Patrick_Hand',_cursive] selection:bg-yellow-200 pb-20 overflow-hidden"
         style={{backgroundImage: `url(${ASSETS.paper})`}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
        .hand-drawn-border { stroke-linecap: round; stroke-linejoin: round; filter: url(#wobble); }
        .hand-drawn-box { border-radius: 255px 15px 225px 15px/15px 225px 15px 255px; border: 3px solid #78350f; }
        .hand-drawn-shadow { box-shadow: 5px 5px 0px 0px rgba(120, 53, 15, 0.2); }
      `}</style>
      
      <svg style={{position: 'absolute', width: 0, height: 0}}>
        <filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" /></filter>
      </svg>

      {/* Header */}
      <header className="relative pt-24 pb-16 px-6 text-center">
        
        {/* 動畫：裝備從左邊滑入 */}
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
          
          {/* LOGO 顯示區塊 (放在最上面) */}
          <motion.div 
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, delay: 0.2 }}
            className="w-40 h-40 mx-auto mb-6"
          >
             <img 
               src={resolveImage(ASSETS.logo)} 
               alt="Linbei Logo" 
               className="w-full h-full object-contain drop-shadow-xl hover:scale-110 transition-transform cursor-pointer"
               referrerPolicy="no-referrer"
               onError={(e) => e.currentTarget.style.opacity = '0.3'} 
             />
          </motion.div>

          {/* 動畫：一家三口照片慢慢浮現 (Fade In) */}
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

      <section className="max-w-5xl mx-auto px-6 mb-16">
        <InteractiveMap />
      </section>

      <main className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allTrips.map((trip, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index % 3 * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`group relative bg-white p-6 hand-drawn-box hand-drawn-shadow transition-all ${trip.type === 'future' ? 'bg-[#fffbeb] border-dashed' : ''}`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-400 border-2 border-red-600 shadow-md z-10"></div>

              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border-2 ${
                    trip.type === 'future' 
                      ? 'bg-yellow-100 border-yellow-400 text-yellow-800' 
                      : 'bg-green-100 border-green-400 text-green-800'
                  } rotate-[-2deg]`}>
                    <Calendar size={14} className="inline mr-1 mb-0.5" />
                    {trip.year} {trip.season}
                  </span>
                  
                  {trip.type === 'future' && <Star className="text-yellow-400 fill-current animate-pulse" size={20} />}
                </div>

                <h3 className="text-2xl font-bold mb-2 text-stone-800 group-hover:text-orange-700 transition-colors leading-tight">
                  {trip.title}
                </h3>
                
                <div className="flex items-center gap-2 text-stone-500 font-bold mb-6 text-sm">
                   <MapPin size={16} /> {trip.location}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button disabled={trip.type === 'future'} className={`flex items-center justify-center gap-2 border-2 rounded-xl py-2 font-bold text-sm transition-colors relative overflow-hidden group/btn ${trip.type === 'future' ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300'}`}>
                    <Map size={16} className="hand-drawn-filter" /> 行程
                  </button>
                  <button disabled={trip.type === 'future'} className={`flex items-center justify-center gap-2 border-2 rounded-xl py-2 font-bold text-sm transition-colors relative overflow-hidden group/btn ${trip.type === 'future' ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed' : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300'}`}>
                    <Video size={16} className="hand-drawn-filter" /> 影片
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="mt-24 pt-12 border-t-4 border-dotted border-stone-300 text-center relative">
         <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-stone-400 mb-8">
           <div className="flex gap-4">
             <Camera size={24} className="text-stone-300 hover:text-stone-600 transition-colors" />
             <Backpack size={24} className="text-stone-300 hover:text-stone-600 transition-colors" />
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