import React, { useMemo, useState } from 'react';
import { MapPin, Camera, Backpack, Plane, Sun, PawPrint, Dog, Cat, Star, Heart, Smile, Coffee, Map, Images, Video } from 'lucide-react';
import { motion } from 'framer-motion';

// ==========================================
// 🎨 素材層 (ASSETS LAYER)
// ==========================================
const ASSETS = {
  // 1. Logo
  logo: "https://drive.google.com/file/d/1M-U8vr_LZXM56NQDNb5sDPZyQdwPN31f/view?usp=drive_link",
  // 2. 一家三口照片
  family: "https://drive.google.com/file/d/16iZWeAVFG3PYDGCmWQi_HqS_bkcffDQd/view?usp=drive_link", 
  // 3. 旅遊裝備
  items: "https://placehold.co/600x300/png?text=Travel+Items",
  // 4. 背景紋理
  paper: "https://www.transparenttextures.com/patterns/cream-paper.png",
  // 5. 吉祥物 (貓咪) - 使用您的 Google Drive 連結
  shiba: "https://drive.google.com/file/d/1tYjdUz0LIbeJJYSv7WOe1Eq2AkrZYfz6/view?usp=sharing" 
};

// ==========================================
// 🗂️ 資料層 (DATA LAYER)
// ==========================================

interface Trip {
  year: number;
  season: string;
  title: string;
  location: string;
  status: string;
  type: string;
  image: string;
  album: string;
  plan: string;
  vlog: string;
}

const allTrips: Trip[] = [
  { 
    year: 2025, season: "秋假", title: "日本東北", location: "日本 東北", status: "Done", type: "future", 
    image: "https://lh3.googleusercontent.com/pw/AP1GczMcbMORd3qssAAAygutlCGQGvpgnFJ3KBnO6yWZPet3L3Pv6nOtmcfgqDzlIbkB4aqRXNyK3FLwLabLpbg7b3GtsYkX_NOfYxrMDWzxwdq3enVw2FQqbsyPTt9le0xfFt7Cmwh2xJCwqreHk4kvVB90Gg=w1367-h911-s-no-gm?authuser=0",
    album: "https://photos.app.goo.gl/hP631FQAmCgxUpoL8",
    plan: "https://docs.google.com/document/d/1BAFg8ngF0yvULcSp7SLqvflTe6oxSSRZ/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true", 
    vlog: ""
  },
  { 
    year: 2025, season: "春假", title: "紐西蘭", location: "紐西蘭", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOnC_qyPEENGBXm9a2ztYIwfFwSD3yrdoenrXKPllvVVj0IpQgAOeXjU6fE4d2TofZUac99-3MhUXbHIZcTnsNNY4KNr8Sn5fneQeWTzH9OEWpIEM3gbQwIC2EtbemZxFDwUqUxOCJDr_OV6bnfXV47Xg=w1367-h911-s-no-gm?authuser=0",
    album: "https://photos.app.goo.gl/S1CzpJ9nt5PQgR7J7",
    plan: "https://docs.google.com/document/d/13Tg1tbjXMauMIuIlisPgrwgdt9h-0BF9/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true", 
    vlog: "https://youtu.be/CeH0dgQCtPY" 
  },
  { 
    year: 2024, season: "秋假", title: "名古屋", location: "日本 名古屋", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOIFpXM83TMg3kiA0lHJfb7s9QrYCqMQgGF9TU5CTXqohr_yM9YwOwW7--G9xvVAMYKRyd1ZOkTpZCAhhyoBrPGHHX4SU9Z07Je3jJTLppWkExKICFejgU5UKItNM-JcS2AiWhDgL2vZmHLZYK8-kXJbw=w683-h911-s-no-gm?authuser=0",
    album: "https://photos.app.goo.gl/Ntntxma3tJJF2zvR8",
    plan: "https://docs.google.com/document/d/19k4b5TZ9R-bfBAuEMlQUkMOWeYpSjVz4/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: ""
  },
  { 
    year: 2024, season: "暑假", title: "泰國喀比島+芭達雅", location: "泰國 喀比/芭達雅", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczPKvJcz_f0SRhyXpaJ1WiCVcFUt4svjVKuisrnUd1m9JwsIIhnVRNyOguE-OjR1HtjqyLcjm8b_WlXQQDsb7z7HNC9IpxCU2cdx9O2R3qhqfscs9MvCs0i-Bmo9gqO7ZQyGCKMk6IJudwbohdSv-f1EkQ=w683-h911-s-no-gm?authuser=0",
    album: "https://photos.app.goo.gl/Pewtpp8aaH5Jt3vL7",
    plan: "https://docs.google.com/document/d/1BgiWNLVZqKV3Wzj-spiHTA9RLL7lMf3u/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/QDROySj-56A"
  },
  { 
    year: 2024, season: "春假", title: "馬來西亞沙巴", location: "馬來西亞 沙巴", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&q=80&w=800",
    album: "https://photos.app.goo.gl/xVrTKHo2T2uYLkHx6",
    plan: "https://docs.google.com/document/d/1kTI_pd3t2UpaU1F-seRqsN4tftGl2ZIy/edit?usp=sharing&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/1pxgzINsQkg"
  },
  { 
    year: 2023, season: "秋假", title: "東京富士山+輕井澤", location: "日本 東京/輕井澤", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOSXA2NRjXKyroJ_Np5KA2cJ0RjMYqyFEugErbZ-vXu1r43BYkAcWKzS0b3GAmnDuiv0yAIQJcsZ7bfbBSf6U0KeGftcss_E4WR3OCri_8aSQyX0WrCjmm15lJE8bw2Kn674bTmez_Y38f0lpFDvVISwg=w683-h911-s-no-gm?authuser=0",
    album: "https://photos.app.goo.gl/LRERnQ9bv16G1wUw7",
    plan: "https://docs.google.com/document/d/1lidmmVOxq7J52-pA-eSYQXTdHtc4hTMn/edit?usp=sharing&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/ZDzI_i8r54E"
  },
  { 
    year: 2023, season: "春假", title: "阿里山", location: "台灣 阿里山", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1627894451152-66352ae07b22?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "https://docs.google.com/document/d/1PYevx-l8pimaWODh2JkjZLyz-8xXUVX9/edit?usp=sharing&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/H3iL7GCYOCo"
  },
  { 
    year: 2022, season: "秋假", title: "金門", location: "台灣 金門", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1599827876288-299691b33e9e?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "https://docs.google.com/document/d/19ejwcXm1rbVKTpVYrv3bB0djDR7FpDbL/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/qgYisyxXANc"
  },
  { 
    year: 2021, season: "春假", title: "澎湖", location: "台灣 澎湖", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1590053912959-1d2279b9dd71?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "https://docs.google.com/document/d/1kWK0K1WjR4uvMNrU2J9nyEKNvuYowHEOHcvqO2EnNSQ/edit?usp=drive_link",
    vlog: ""
  },
  { 
    year: 2020, season: "秋假", title: "台東花蓮", location: "台灣 花東", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1571474004502-c1def214ac6d?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "",
    vlog: ""
  },
  { 
    year: 2020, season: "寒假", title: "菲律賓長灘島", location: "菲律賓 長灘島", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1540206351-d6465b3ac5c1?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "",
    vlog: ""
  },
  { 
    year: 2019, season: "秋假", title: "花蓮", location: "台灣 花蓮", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1596716075908-7243c220263f?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "",
    vlog: ""
  },
  { 
    year: 2019, season: "春假", title: "小琉球", location: "台灣 小琉球", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1582963032768-466d739226eb?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "",
    vlog: ""
  },
  { 
    year: 2018, season: "秋假", title: "薄荷島", location: "菲律賓 薄荷島", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1542332205-4da5d5fa6184?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "",
    vlog: ""
  },
  { 
    year: 2018, season: "春假", title: "京都大阪賞櫻", location: "日本 京都/大阪", status: "Done", type: "past",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=800",
    album: "",
    plan: "",
    vlog: ""
  },
];

// 🔧 圖片轉換器
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
// 🐶🐱 客製化可愛圖示 (Back of Card)
// ==========================================

const DogMapIcon = ({ size = 28, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6l9-4 9 4v16l-9-4-9 4V6z" className="text-blue-600" />
    <circle cx="12" cy="10" r="4" fill="white" stroke="currentColor" />
    <path d="M10.5 9.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" fill="currentColor" stroke="none" />
    <path d="M13.5 9.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" fill="currentColor" stroke="none" />
    <path d="M11 11.5s.5.5 1 .5 1-.5 1-.5" />
    <path d="M8.5 7L7.5 5.5" />
    <path d="M15.5 7L16.5 5.5" />
  </svg>
);

const CatAlbumIcon = ({ size = 28, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" className="text-amber-600" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
    <path d="M14 16c0-1.5 1-2.5 2.5-2.5S19 14.5 19 16" fill="white" stroke="currentColor"/>
    <path d="M14 16v5" />
    <path d="M19 16v5" />
    <path d="M14.5 13.5L13 12" />
    <path d="M18.5 13.5L20 12" />
    <circle cx="15.5" cy="16.5" r="0.5" fill="currentColor" stroke="none"/>
    <circle cx="17.5" cy="16.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

const PawVlogIcon = ({ size = 28, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="6" width="14" height="12" rx="2" className="text-red-600" />
    <path d="M16 16l6 2V6l-6 2" />
    <circle cx="9" cy="12" r="4" fill="white" stroke="currentColor"/>
    <circle cx="7.5" cy="10.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="10.5" cy="10.5" r="0.9" fill="currentColor" stroke="none"/>
    <circle cx="9" cy="9" r="0.9" fill="currentColor" stroke="none"/>
    <path d="M7.5 13c.5 1 2.5 1 3 0" strokeLinecap="round" />
  </svg>
);

// ==========================================
// 🐕 吉祥物舉牌日期標籤 (Mascot Sign Label)
// ==========================================
const MascotLabel = ({ trip }: { trip: Trip }) => (
  <div className="absolute -top-[52px] -left-[10px] z-30 group-hover:animate-bounce-slight origin-bottom-left w-[100px] h-[100px]">
      <div className="relative w-full h-full flex flex-col items-center justify-end">
          <img 
            src={resolveImage(ASSETS.shiba)} 
            alt="Mascot"
            className="w-16 h-16 object-contain absolute bottom-[25px] left-[15px] z-10"
            style={{ transform: "rotate(-5deg)" }}
          />
          <div 
            className="relative z-20 bg-[#fff9c4] border-2 border-[#d6c0ae] px-3 py-1.5 rounded-md shadow-md text-center min-w-[70px] -rotate-3 transform translate-y-2 translate-x-1"
            style={{ boxShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}
          >
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#d6c0ae] rounded-full opacity-50"></div>
              <span className="block text-base font-black text-stone-600 font-['Patrick_Hand'] leading-none">
                  {trip.year}
              </span>
              <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-tight font-['Patrick_Hand'] mt-0.5">
                  {trip.season}
              </span>
          </div>
      </div>
  </div>
);

// 🌟 隨機貼紙元件
const RandomSticker = ({ index }: { index: number }) => {
  const stickerData = useMemo(() => {
    const stickers = [
      { icon: <Coffee size={24} />, color: "text-amber-700", bg: "bg-amber-100", rotate: 12 },
      { icon: <Camera size={24} />, color: "text-blue-700", bg: "bg-blue-100", rotate: -15 },
      { icon: <Heart size={24} />, color: "text-red-500", bg: "bg-red-100", rotate: 8 },
      { icon: <Star size={24} />, color: "text-yellow-500", bg: "bg-yellow-100", rotate: -5 },
      { icon: <Smile size={24} />, color: "text-green-600", bg: "bg-green-100", rotate: 20 },
      null, null
    ];
    const sticker = stickers[index % stickers.length];
    
    const positions = [
      { top: 10, left: 10 },
      { top: 10, right: 10 },
      { bottom: 60, right: 10 }, 
    ];
    const pos = positions[index % positions.length];

    return { sticker, pos };
  }, [index]);

  if (!stickerData.sticker) return null;

  return (
    <div 
      className={`absolute z-30 p-2 rounded-full shadow-md border-2 border-white ${stickerData.sticker.bg} ${stickerData.sticker.color}`}
      style={{ 
        ...stickerData.pos,
        transform: `rotate(${stickerData.sticker.rotate}deg)`
      }}
    >
      {stickerData.sticker.icon}
    </div>
  );
};

// 🏷️ 可愛動物紙膠帶元件
const CuteWashiTape = ({ index }: { index: number }) => {
  const tapeColors = [
    "bg-red-100/90", "bg-blue-100/90", "bg-green-100/90", "bg-yellow-100/90", "bg-orange-100/90"
  ];
  const color = tapeColors[index % tapeColors.length];
  const rotate = (index % 2 === 0) ? -2 : 2; 

  const icons = useMemo(() => {
    const pattern = [];
    for(let i=0; i<5; i++) {
        const r = (index + i) % 3;
        if(r === 0) pattern.push(<PawPrint size={12} key={i} className="text-stone-400/70" />);
        if(r === 1) pattern.push(<Cat size={12} key={i} className="text-stone-500/70" />);
        if(r === 2) pattern.push(<Dog size={12} key={i} className="text-stone-500/70" />);
    }
    return pattern;
  }, [index]);

  return (
    <div 
      className={`absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 shadow-sm z-30 backdrop-blur-[1px] ${color} flex items-center justify-around px-1 overflow-hidden`}
      style={{ 
        transform: `translateX(-50%) rotate(${rotate}deg)`,
        clipPath: "polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)",
        maskImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqonyQAWMUEFPTE2MDAYAfXYK0ZO1uMAAAAAASUVORK5CYII=)" 
      }}
    >
      {icons}
    </div>
  );
};

// 📍 地點紙膠帶元件
const LocationTapeLabel = ({ location, index }: { location: string, index: number }) => {
    const rotate = (index % 2 === 0) ? -2 : 2; 
    
    return (
        <div 
            className="absolute bottom-2 right-4 z-20 origin-center"
            style={{ transform: `rotate(${rotate}deg)` }}
        >
            <div className="relative bg-orange-400/90 backdrop-blur-sm pl-4 pr-3 py-1 shadow-sm border-dashed border-white/50 rounded-sm">
                <div 
                    className="absolute top-0 bottom-0 -left-1 w-2 bg-orange-400/90"
                    style={{
                        maskImage: "url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzjwqonyQAWMUEFPTE2MDAYAfXYK0ZO1uMAAAAAASUVORK5CYII=)",
                        clipPath: "polygon(100% 0, 0 0, 50% 50%, 0 100%, 100% 100%)"
                    }}
                ></div>
                <span className="text-lg font-black text-white tracking-widest whitespace-nowrap font-['Patrick_Hand'] drop-shadow-sm flex items-center gap-1">
                    <MapPin size={14} className="text-yellow-100" fill="currentColor" />
                    {location}
                </span>
            </div>
        </div>
    );
};

// 📮 郵戳元件 (New Realistic SVG Version) - Adjusted position to be cut off
const PostalStamp = ({ status }: { status: string }) => {
    return (
        <div className="absolute -top-4 -right-4 z-10 opacity-85 rotate-12 pointer-events-none mix-blend-multiply shrink-0">
            <svg width="140" height="80" viewBox="0 0 120 70" className="w-32 h-auto">
                <defs>
                    <path id="curve" d="M 22,40 A 28,28 0 1,1 98,40" />
                </defs>
                
                {/* 雙圈圓形日戳 */}
                <circle cx="35" cy="35" r="28" stroke="#8B0000" strokeWidth="1.5" fill="none" />
                <circle cx="35" cy="35" r="20" stroke="#8B0000" strokeWidth="0.8" fill="none" />
                
                {/* 圓圈內的文字 */}
                <text x="35" y="25" textAnchor="middle" fill="#8B0000" fontSize="5" fontWeight="bold" fontFamily="Arial" letterSpacing="0.5">FAMILY JOURNAL</text>
                <text x="35" y="38" textAnchor="middle" fill="#8B0000" fontSize="8" fontWeight="bold" fontFamily="Courier New">{status.toUpperCase()}</text>
                <text x="35" y="48" textAnchor="middle" fill="#8B0000" fontSize="5" fontFamily="Arial">TAIWAN</text>

                {/* 經典波浪消除線 */}
                <path d="M68 20 Q 73 15, 78 20 T 88 20 T 98 20 T 108 20" stroke="#8B0000" strokeWidth="1.5" fill="none" />
                <path d="M68 28 Q 73 23, 78 28 T 88 28 T 98 28 T 108 28" stroke="#8B0000" strokeWidth="1.5" fill="none" />
                <path d="M68 36 Q 73 31, 78 36 T 88 36 T 98 36 T 108 36" stroke="#8B0000" strokeWidth="1.5" fill="none" />
                <path d="M68 44 Q 73 39, 78 44 T 88 44 T 98 44 T 108 44" stroke="#8B0000" strokeWidth="1.5" fill="none" />
            </svg>
        </div>
    );
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
        
        /* 3D Flip Styles */
        .card-perspective { perspective: 1000px; }
        .card-inner { transform-style: preserve-3d; }
        .card-front, .card-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .card-back { transform: rotateY(180deg); }
        .group:hover .card-inner { transform: rotateY(180deg); }
        
        /* Slight bounce for peeking pets */
        @keyframes bounce-slight {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .animate-bounce-slight { animation: bounce-slight 2s ease-in-out infinite; }
      `}</style>
      
      <svg style={{position: 'absolute', width: 0, height: 0}}>
        <filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" /></filter>
      </svg>

      <FloatingBackground />

      {/* Header */}
      <header className="relative pt-20 pb-12 px-6 text-center z-10">
        
        {/* 裝飾圖片 */}
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

      {/* Main Content: Trip Cards */}
      <main className="max-w-6xl mx-auto px-6 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {allTrips.map((trip, index) => {
            const randomRotate = (index % 5) - 2; 

            return (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50, rotate: randomRotate }}
                whileInView={{ opacity: 1, y: 0, rotate: randomRotate }}
                whileHover={{ y: -5, rotate: 0, zIndex: 10 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index % 3 * 0.1 }}
                className="group relative w-full h-80 card-perspective cursor-pointer"
              >
                {/* 裝飾性元素 (不會跟著翻轉) */}
                <CuteWashiTape index={index} />
                <MascotLabel trip={trip} />

                {/* 翻轉容器 */}
                <div className="card-inner relative w-full h-full transition-all duration-700 ease-in-out">
                    
                    {/* ========= 正面 (FRONT) ========= */}
                    <div className="card-front absolute inset-0 bg-white p-3 shadow-md border border-stone-200 flex flex-col">
                        {/* 照片區域：高度調整為 85%，留白給下方的地點標籤 */}
                        <div className="w-full h-[85%] bg-stone-100 overflow-hidden relative border border-stone-100 group-hover:border-stone-300 transition-colors">
                             <img 
                                src={resolveImage(trip.image)} 
                                alt={trip.title} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                             />
                             {/* 郵戳 - 移到右上方並裁切 */}
                             <PostalStamp status={trip.status} />
                        </div>
                        
                        {/* 地點紙膠帶 (橘色版) - 移到照片下方的白色外框上 */}
                        <LocationTapeLabel location={trip.location} index={index} />
                    </div>

                    {/* ========= 背面 (BACK) ========= */}
                    <div className="card-back absolute inset-0 bg-[#fffdf5] p-5 shadow-md border border-stone-200 flex flex-col items-center text-center relative overflow-hidden"
                         style={{backgroundImage: `url(${ASSETS.paper})`}}>
                        
                        <RandomSticker index={index} />
                        <div className="absolute top-0 left-0 bottom-0 w-3 border-r-2 border-dashed border-stone-300"></div>

                        <div className="flex-1 flex flex-col items-center justify-center w-full pl-4">
                            <motion.h3 
                                className="text-3xl font-black mb-6 text-stone-800 leading-tight"
                            >
                                {trip.title}
                            </motion.h3>

                            {/* 質感按鈕區 - 分離式設計 (可愛動物 + 標準圖示) */}
                            <div className="w-full flex flex-col gap-3 px-2">
                                {/* PLAN BUTTON */}
                                <a 
                                    href={trip.plan || "#"} 
                                    target={trip.plan ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    className={`relative flex items-center justify-between px-4 py-2 border-2 border-dashed rounded-lg transition-all group/btn bg-white ${
                                        trip.plan 
                                        ? "border-blue-300 text-stone-600 hover:bg-blue-50" 
                                        : "border-stone-200 text-stone-300 cursor-not-allowed"
                                    }`}
                                    onClick={(e) => !trip.plan && e.preventDefault()}
                                >
                                    <div className="flex items-center gap-3">
                                        <Map size={20} className={trip.plan ? "text-blue-500" : "text-stone-300"} />
                                        <span className="text-sm font-bold tracking-widest">旅行計畫</span>
                                    </div>
                                    <Dog size={24} className={`transform group-hover/btn:rotate-12 transition-transform ${trip.plan ? "text-stone-400" : "text-stone-200"}`} />
                                </a>
                                
                                {/* ALBUM BUTTON */}
                                <a 
                                    href={trip.album || "#"} 
                                    target={trip.album ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    className={`relative flex items-center justify-between px-4 py-2 border-2 border-dashed rounded-lg transition-all group/btn bg-white ${
                                        trip.album 
                                        ? "border-amber-300 text-stone-600 hover:bg-amber-50" 
                                        : "border-stone-200 text-stone-300 cursor-not-allowed"
                                    }`}
                                    onClick={(e) => !trip.album && e.preventDefault()}
                                >
                                    <div className="flex items-center gap-3">
                                        <Images size={20} className={trip.album ? "text-amber-500" : "text-stone-300"} />
                                        <span className="text-sm font-bold tracking-widest">相簿</span>
                                    </div>
                                    <Cat size={24} className={`transform group-hover/btn:-rotate-12 transition-transform ${trip.album ? "text-stone-400" : "text-stone-200"}`} />
                                </a>

                                {/* VLOG BUTTON */}
                                <a 
                                    href={trip.vlog || "#"} 
                                    target={trip.vlog ? "_blank" : "_self"}
                                    rel="noopener noreferrer"
                                    className={`relative flex items-center justify-between px-4 py-2 border-2 border-dashed rounded-lg transition-all group/btn bg-white ${
                                        trip.vlog 
                                        ? "border-red-300 text-stone-600 hover:bg-red-50" 
                                        : "border-stone-200 text-stone-300 cursor-not-allowed"
                                    }`}
                                    onClick={(e) => !trip.vlog && e.preventDefault()}
                                >
                                    <div className="flex items-center gap-3">
                                        <Video size={20} className={trip.vlog ? "text-red-500" : "text-stone-300"} />
                                        <span className="text-sm font-bold tracking-widest">旅遊影片</span>
                                    </div>
                                    <PawPrint size={24} className={`transform group-hover/btn:scale-110 transition-transform ${trip.vlog ? "text-stone-400" : "text-stone-200"}`} />
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
              </motion.div>
            );
          })}
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