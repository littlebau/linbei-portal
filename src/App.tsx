import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapPin, Camera, Backpack, Plane, Star, Heart, Smile, ArrowUp, Sun, Image as ImageIcon, RotateCw, Eye, MessageCircle, Send, Lock, LogOut, Trash2, KeyRound, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  increment, 
  onSnapshot, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  deleteDoc,
  DocumentSnapshot,
  QuerySnapshot
} from "firebase/firestore";

// ==========================================
// 🔐 安全性設定 (Security Tokens)
// ==========================================
// 在這裡設定你的密碼
const ACCESS_TOKENS = {
    // 網址範例: domain.com/?token=ilovefamily (家庭成員)
    FAMILY: "ilovefamily", 
    // 網址範例: domain.com/?token=hellofriend (訪客)
    GUEST: "hellofriend"   
};

// 權限等級定義
type AccessLevel = 'NONE' | 'GUEST' | 'FAMILY';

// ==========================================
// 🟢 Firebase Config
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyBSVyHMDAqc8JkeZuCjmAGyPSu8oDN543Y",
  authDomain: "mytravelsite-39bd9.firebaseapp.com",
  projectId: "mytravelsite-39bd9",
  storageBucket: "mytravelsite-39bd9.firebasestorage.app",
  messagingSenderId: "114552084268",
  appId: "1:114552084268:web:6606382ccd60a921a57e89",
  measurementId: "G-FTFRKF1S5F"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'family-travel-journal';

// ==========================================
// 🛠️ 工具函式與介面定義
// ==========================================

interface Trip {
  year: number;
  season: string;
  title: string;
  location: string;
  status: string;
  type: string;
  image: string;
  images?: string[];
  album: string;
  plan: string;
  vlog: string;
}

interface GuestMessage {
    id: string;
    name: string;
    content: string;
    timestamp: any;
}

const resolveImage = (url: string) => {
  if (!url || typeof url !== 'string') return '';
  if (url.includes("Upload") || url.includes("Paste")) return url;
  if (url.includes("drive.google.com")) {
    const idMatch = url.match(/\/d\/([^/]+)/);
    if (idMatch && idMatch[1]) {
      return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w1000`;
    }
  }
  return url;
};

const formatDate = (timestamp: any) => {
    if (!timestamp) return '剛剛';
    try {
        if (typeof timestamp.toDate === 'function') {
            return timestamp.toDate().toLocaleDateString();
        }
        if (timestamp instanceof Date) {
            return timestamp.toLocaleDateString();
        }
        if (typeof timestamp.seconds === 'number') {
            return new Date(timestamp.seconds * 1000).toLocaleDateString();
        }
    } catch (e) {
        console.error("Date format error", e);
    }
    return '剛剛';
};

// ==========================================
// 🎨 素材層
// ==========================================
const ASSETS = {
  mainTheme: "https://drive.google.com/file/d/1DkyWE7T3BSV5PGyYiRCaHlCeaR-kskBO/view?usp=drive_link",
  items: "https://placehold.co/600x300/png?text=Travel+Items",
  paper: "https://www.transparenttextures.com/patterns/cream-paper.png",
  mascot1: "https://drive.google.com/file/d/1BUuXbcVZexXoOK-Kic-Jdy-8LrlH_HWi/view?usp=drive_link",
  mascot2: "https://drive.google.com/file/d/1Jo-EP05_m7XtYllT29tQ2FNhKJiiSY-B/view?usp=drive_link",
  stamp1: "https://drive.google.com/file/d/1A7Zc3ZqsP3oJ528Jzq3D1SOt6T0Z0mLl/view?usp=drive_link",
  stamp2: "https://drive.google.com/file/d/1BS652qurVrAzMF21_7NdA9-fs9CLj2tW/view?usp=drive_link",
  groupMascot: "https://drive.google.com/file/d/14Q2vRY9Entm6z7aH507IQhh9GUmSOty-/view?usp=drive_link",
  iconPlan: "https://drive.google.com/file/d/1YH6f9ksA-5VaXa_seCnnzdxZ1bZpO29z/view?usp=drive_link",
  iconAlbum: "https://drive.google.com/file/d/1gIIZ5F3Hb2G7sSiSSNLUxijSSdR9TapP/view?usp=drive_link",
  iconVlog: "https://drive.google.com/file/d/1RbE-fHvsqodQBBNw9ozPGaNYWcj0-TUD/view?usp=drive_link",
  floating: [
    "https://drive.google.com/file/d/1dO5qnrh7GG1OPTVUUhLjoIAPsiOqWVGT/view?usp=drive_link",
    "https://drive.google.com/file/d/1DWPEAX7BjRQbPXxa4v4nOlr6U9N-Q5qU/view?usp=drive_link",
    "https://drive.google.com/file/d/13PocXFe_v9QQdN_d40Escp7Pw7rxjVTV/view?usp=drive_link",
    "https://drive.google.com/file/d/1kcft3exVqfp-xcAtCX4Ak99XAhHJMNw6/view?usp=drive_link",
    "https://drive.google.com/file/d/1JftJqTtVi1YlTNQ3LCdIl1kxuE7cViSk/view?usp=drive_link",
    "https://drive.google.com/file/d/1YpG-WAJwcnPnaxdc6hCZeupFeAiaVwd-/view?usp=drive_link"
  ]
};

// ==========================================
// 🗂️ 資料層 (Trips)
// ==========================================
// 為了簡潔，這裡保留你的資料結構，但縮減顯示長度。實際運行時請確保這裡是完整的 allTrips 資料
const allTrips: Trip[] = [
  { 
    year: 2025, season: "秋假", title: "日本東北", location: "日本 東北", status: "Done", type: "future", 
    image: "https://lh3.googleusercontent.com/pw/AP1GczMcbMORd3qssAAAygutlCGQGvpgnFJ3KBnO6yWZPet3L3Pv6nOtmcfgqDzlIbkB4aqRXNyK3FLwLabLpbg7b3GtsYkX_NOfYxrMDWzxwdq3enVw2FQqbsyPTt9le0xfFt7Cmwh2xJCwqreHk4kvVB90Gg=w1367-h911-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczMcbMORd3qssAAAygutlCGQGvpgnFJ3KBnO6yWZPet3L3Pv6nOtmcfgqDzlIbkB4aqRXNyK3FLwLabLpbg7b3GtsYkX_NOfYxrMDWzxwdq3enVw2FQqbsyPTt9le0xfFt7Cmwh2xJCwqreHk4kvVB90Gg=w1367-h911-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczODjmS_gW43khZYdutZC57zearwSwMszt_XfUhy7cxbDbAcFRwHg4rwmo0IiV1nEXqGbcg843zDGoDoYgi-uE0ADLECT-S8zA5gVUnecy7i8u7N5EfozjGzgzSORANTF0WsxKC-0hq7sGvyhVNeu3-w_A=w1304-h869-s-no-gm?authuser=0"
    ],
    album: "https://photos.app.goo.gl/hP631FQAmCgxUpoL8",
    plan: "https://docs.google.com/document/d/1BAFg8ngF0yvULcSp7SLqvflTe6oxSSRZ/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true", 
    vlog: ""
  },
  { 
    year: 2025, season: "春假", title: "紐西蘭", location: "紐西蘭", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOnC_qyPEENGBXm9a2ztYIwfFwSD3yrdoenrXKPllvVVj0IpQgAOeXjU6fE4d2TofZUac99-3MhUXbHIZcTnsNNY4KNr8Sn5fneQeWTzH9OEWpIEM3gbQwIC2EtbemZxFDwUqUxOCJDr_OV6bnfXV47Xg=w1367-h911-s-no-gm?authuser=0",
    images: ["https://lh3.googleusercontent.com/pw/AP1GczOnC_qyPEENGBXm9a2ztYIwfFwSD3yrdoenrXKPllvVVj0IpQgAOeXjU6fE4d2TofZUac99-3MhUXbHIZcTnsNNY4KNr8Sn5fneQeWTzH9OEWpIEM3gbQwIC2EtbemZxFDwUqUxOCJDr_OV6bnfXV47Xg=w1367-h911-s-no-gm?authuser=0"],
    album: "https://photos.app.goo.gl/S1CzpJ9nt5PQgR7J7",
    plan: "https://docs.google.com/document/d/13Tg1tbjXMauMIuIlisPgrwgdt9h-0BF9/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true", 
    vlog: "https://youtu.be/CeH0dgQCtPY" 
  },
  { 
    year: 2024, season: "秋假", title: "名古屋", location: "日本 名古屋", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOIFpXM83TMg3kiA0lHJfb7s9QrYCqMQgGF9TU5CTXqohr_yM9YwOwW7--G9xvVAMYKRyd1ZOkTpZCAhhyoBrPGHHX4SU9Z07Je3jJTLppWkExKICFejgU5UKItNM-JcS2AiWhDgL2vZmHLZYK8-kXJbw=w683-h911-s-no-gm?authuser=0",
    images: ["https://lh3.googleusercontent.com/pw/AP1GczOIFpXM83TMg3kiA0lHJfb7s9QrYCqMQgGF9TU5CTXqohr_yM9YwOwW7--G9xvVAMYKRyd1ZOkTpZCAhhyoBrPGHHX4SU9Z07Je3jJTLppWkExKICFejgU5UKItNM-JcS2AiWhDgL2vZmHLZYK8-kXJbw=w683-h911-s-no-gm?authuser=0"],
    album: "https://photos.app.goo.gl/Ntntxma3tJJF2zvR8",
    plan: "https://docs.google.com/document/d/19k4b5TZ9R-bfBAuEMlQUkMOWeYpSjVz4/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: ""
  },
  // ... (為節省篇幅，其他資料請保持原樣，這邊模擬已有全部資料)
  // 請務必保留你原本完整的 allTrips 陣列
];

// ==========================================
// 🐕 吉祥物元件 (TravelMascot)
// ==========================================
const TravelMascot = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    return (
        <motion.div
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 80, damping: 15, delay: 1.5 }}
        className="fixed bottom-2 right-4 z-50 cursor-pointer group flex flex-col items-end"
        onClick={scrollToTop}
        >
        <motion.div 
            initial={{ scale: 0, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 2.5, type: "spring" }}
            className="relative bg-white border-2 border-stone-800 rounded-2xl py-2 px-4 shadow-lg mb-1 mr-4 origin-bottom-right"
        >
            <span className="text-stone-800 font-black text-sm md:text-base whitespace-nowrap tracking-wider font-['Patrick_Hand'] flex items-center gap-1">
                林北三人成團 GO! 🚀
            </span>
            <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-b-2 border-r-2 border-stone-800 transform rotate-45"></div>
        </motion.div>
        <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
        >
            <motion.img 
            whileHover={{ scale: 1.1, rotate: -10, transition: { type: "spring", stiffness: 300 } }}
            src={resolveImage(ASSETS.groupMascot)} 
            alt="Group Mascot" 
            className="w-32 h-auto md:w-40 drop-shadow-2xl hover:brightness-110 transition-all"
            />
        </motion.div>
        </motion.div>
    );
};

// ==========================================
// 🧩 漂浮背景 (FloatingBackground)
// ==========================================
const FloatingBackground = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {ASSETS.floating.map((src, index) => (
            <motion.div
            key={index}
            initial={{ y: 0, opacity: 0.6 }} 
            animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 15 + index * 2, repeat: Infinity, ease: "easeInOut", delay: index }}
            className="absolute"
            style={{ left: `${(index * 15) % 90}%`, top: `${(index * 20) % 80}%` }}
            >
            <img src={resolveImage(src)} alt="floating-icon" className={`w-${16 + index % 4 * 4} h-auto object-contain drop-shadow-md`} />
            </motion.div>
        ))}
        </div>
    );
};

// ==========================================
// 🐕 吉祥物裝飾
// ==========================================
const MascotDecoration = ({ index }: { index: number }) => {
  const mascotImg = index % 2 === 0 ? ASSETS.mascot1 : ASSETS.mascot2;
  return (
    <div className="absolute -top-[52px] md:-top-[75px] -left-[10px] md:-left-[20px] z-10 pointer-events-none w-[100px] h-[100px] md:w-[130px] md:h-[130px]">
        <img 
          src={resolveImage(mascotImg)} 
          alt="Mascot"
          className="w-full h-full object-contain"
          style={{ transform: "rotate(-10deg)" }}
        />
    </div>
  );
};

// 🌟 隨機貼紙元件
const RandomSticker = ({ index }: { index: number }) => {
  const stickerData = useMemo(() => {
    const stickers = [
      { color: "text-amber-700", bg: "bg-amber-100", rotate: 12 },
      { color: "text-blue-700", bg: "bg-blue-100", rotate: -15 },
      { color: "text-red-500", bg: "bg-red-100", rotate: 8 },
      { color: "text-yellow-500", bg: "bg-yellow-100", rotate: -5 },
      { color: "text-green-600", bg: "bg-green-100", rotate: 20 },
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

  let SafeIcon = Star;
  if(index % 5 === 0) SafeIcon = Sun; 
  if(index % 5 === 1) SafeIcon = Camera;
  if(index % 5 === 2) SafeIcon = Heart;
  if(index % 5 === 3) SafeIcon = Star;
  if(index % 5 === 4) SafeIcon = Smile;

  return (
    <div 
      className={`absolute z-30 p-2 rounded-full shadow-md border-2 border-white ${stickerData.sticker.bg} ${stickerData.sticker.color}`}
      style={{ 
        ...stickerData.pos,
        transform: `rotate(${stickerData.sticker.rotate}deg)`
      }}
    >
      <SafeIcon size={24} />
    </div>
  );
};

// 🏷️ 日期紙膠帶元件
const DateTapeLabel = ({ trip, index }: { trip: Trip; index: number }) => {
  const tapeColors = [
    "bg-[#fdfcdc]", "bg-[#e0f7fa]", "bg-[#fce4ec]", "bg-[#e8f5e9]", 
  ];
  const color = tapeColors[index % tapeColors.length];
  const rotate = (index % 3 === 0) ? -1.5 : (index % 3 === 1) ? 1.5 : 0; 

  return (
    <div 
      className={`absolute -top-5 left-1/2 -translate-x-1/2 w-48 h-10 z-30 flex items-center justify-center shadow-md backdrop-blur-sm ${color}`}
      style={{ 
        transform: `translateX(-50%) rotate(${rotate}deg)`,
        clipPath: "polygon(0% 0%, 100% 0%, 98% 50%, 100% 100%, 0% 100%, 2% 50%)",
        opacity: 0.95
      }}
    >
      <div className="absolute inset-0 opacity-10 bg-repeat pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='4' height='4' viewBox='0 0 4 4' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 3h1v1H1V3zm2-2h1v1H3V1z' fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")` }}></div>
      <div className="relative z-10 flex items-center gap-2 text-stone-700">
        <span className="text-xl font-black tracking-wider font-['Patrick_Hand'] leading-none">
            {trip.year}
        </span>
        <div className="w-[1.5px] h-4 bg-stone-400/50 rounded-full"></div>
        <span className="text-lg font-bold tracking-widest font-['Patrick_Hand'] leading-none text-stone-600">
            {trip.season}
        </span>
      </div>
    </div>
  );
};

// 📍 地點紙膠帶元件
const LocationTapeLabel = ({ location, index }: { location: string; index: number }) => {
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

// 📮 郵戳元件
const PostalStamp = ({ status, index }: { status: string; index: number }) => {
    const stampImg = index % 2 === 0 ? ASSETS.stamp1 : ASSETS.stamp2;
    return (
        <div className="absolute -top-4 -right-4 z-10 opacity-90 rotate-12 pointer-events-none mix-blend-multiply shrink-0 w-32 h-auto">
             <img 
               src={resolveImage(stampImg)} 
               alt="Stamp"
               className="w-full h-full object-contain drop-shadow-sm opacity-80"
             />
        </div>
    );
};

// ==========================================
// ❤️ 按讚按鈕元件
// ==========================================
const LikeButton = ({ tripIndex, user }: { tripIndex: number, user: User | null }) => {
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const likeDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'trip_likes', String(tripIndex));

  useEffect(() => {
    if (!user) return;
    
    const unsubscribe = onSnapshot(likeDocRef, (doc: DocumentSnapshot) => {
        if (doc.exists()) {
            setLikes(doc.data().count || 0);
        }
    });
    
    return () => unsubscribe();
  }, [user, tripIndex]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    if (!user) return;
    setIsLiked(true); 
    setTimeout(() => setIsLiked(false), 500);

    setDoc(likeDocRef, { count: increment(1) }, { merge: true })
      .catch(console.error);
  };

  return (
    <div 
      className="absolute bottom-2 right-2 md:bottom-3 md:right-3 z-30 cursor-pointer group/like"
      onClick={handleLike}
    >
      <div className={`p-2 rounded-full backdrop-blur-sm border-2 transition-all duration-300 flex items-center gap-1.5 ${isLiked ? 'bg-rose-100 border-rose-300 scale-110' : 'bg-white/80 border-stone-200 hover:border-rose-200'}`}>
        <Heart 
            size={18} 
            className={`transition-colors duration-300 ${isLiked ? 'text-rose-500 fill-rose-500' : 'text-stone-400 group-hover/like:text-rose-400'}`} 
        />
        <span className="text-xs font-black text-stone-500">{likes > 0 ? likes : ''}</span>
      </div>
    </div>
  );
};

// ==========================================
// 🎴 單一卡片元件 (TripCard)
// ==========================================
// [修改] 增加 accessLevel prop 傳入
const TripCard = ({ trip, index, user, accessLevel }: { trip: Trip; index: number, user: User | null, accessLevel: AccessLevel }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const randomRotate = (index % 5) - 2;
  
  // [權限檢查] 是否為家庭成員
  const isFamily = accessLevel === 'FAMILY';

  const validImages = trip.images ? trip.images.filter((img) => img && img.trim() !== "") : [];
  const displayImages = validImages.length > 0 ? validImages : [trip.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (displayImages.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }, 4000); 
    return () => clearInterval(interval);
  }, [displayImages.length]);

  const handleFlip = (e: React.MouseEvent) => {
     const target = e.target as HTMLElement;
     if (target.closest('a') || target.closest('button') || target.closest('.like-btn') || target.closest('.group\\/like')) return;
     setIsFlipped(!isFlipped);
  };

  // [功能] 處理相簿點擊
  const handleAlbumClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isFamily) {
        e.preventDefault();
        alert('🔒 哎呀！相簿只開放給家庭成員觀看喔！');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, rotate: randomRotate }}
      whileInView={{ opacity: 1, y: 0, rotate: randomRotate }}
      whileHover={{ y: -5, rotate: 0, zIndex: 10 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index % 3 * 0.1 }}
      className="group relative w-full h-[28rem] md:h-[32rem] card-perspective cursor-pointer"
      onClick={handleFlip}
    >
      <DateTapeLabel trip={trip} index={index} />
      <MascotDecoration index={index} />

      <div 
          className="card-inner relative w-full h-full transition-all duration-700 ease-in-out"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
          {/* ========= 正面 (FRONT) ========= */}
          <div 
            className="card-front absolute inset-0 bg-white p-3 shadow-md border border-stone-200 flex flex-col"
            style={{ 
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden',
              pointerEvents: isFlipped ? 'none' : 'auto'
            }}
          >
              <div className="w-full h-[85%] bg-stone-100 overflow-hidden relative border border-stone-100 group-hover:border-stone-300 transition-colors">
                    
                    <AnimatePresence>
                      {displayImages[0] ? (
                          <div key="image-container" className="absolute inset-0">
                             {/* 背景模糊層 */}
                             <motion.div
                                key={`bg-${currentImageIndex}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute inset-0 z-0"
                             >
                                <img 
                                    src={resolveImage(displayImages[currentImageIndex])} 
                                    alt="Background Blur"
                                    className="w-full h-full object-cover filter blur-xl opacity-60 scale-110" 
                                />
                             </motion.div>

                             {/* 主圖片層 */}
                             <motion.img 
                                  key={`img-${currentImageIndex}`}
                                  src={resolveImage(displayImages[currentImageIndex])} 
                                  alt={trip.title} 
                                  className="absolute inset-0 w-full h-full object-contain z-10 shadow-sm"
                                  referrerPolicy="no-referrer"
                                  initial={{ opacity: 0, scale: 1.1, filter: "blur(8px)" }}
                                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                  exit={{ opacity: 0, zIndex: 0 }} 
                                  transition={{ 
                                      opacity: { duration: 1.2, ease: "easeInOut" },
                                      filter: { duration: 1.2, ease: "easeInOut" },
                                      scale: { duration: 6, ease: "linear" } 
                                  }}
                              />
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 text-stone-300 relative overflow-hidden">
                              <div className="absolute inset-0 opacity-30" style={{backgroundImage: `url(${ASSETS.paper})`}}></div>
                              <div className="relative z-10 w-[80%] h-[70%] border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center gap-3 bg-white/50 backdrop-blur-sm">
                                  <Camera size={40} className="text-stone-300/80" />
                                  <span className="text-sm font-bold tracking-widest text-stone-400 font-['Patrick_Hand']">正在挑選照片中...</span>
                              </div>
                          </div>
                        )}
                    </AnimatePresence>
                    
                    <PostalStamp status={trip.status} index={index} />
                    
                    {/* ❤️ 新增：按讚按鈕 */}
                    <div className="like-btn">
                      <LikeButton tripIndex={index} user={user} />
                    </div>
              </div>
              
              <LocationTapeLabel location={trip.location} index={index} />
              
              <div className="absolute bottom-2 left-3 z-20">
                  <div className="flex items-center gap-1.5 text-rose-500 font-black tracking-widest font-['Patrick_Hand'] bg-rose-50 px-3 py-1.5 rounded-lg border-2 border-rose-200 shadow-md">
                      <RotateCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                      <span className="text-xs">點擊翻面</span>
                  </div>
              </div>
          </div>

          {/* ========= 背面 (BACK) ========= */}
          <div 
            className="card-back absolute inset-0 bg-[#fffdf5] p-5 shadow-md border border-stone-200 flex flex-col items-center text-center relative overflow-hidden"
            style={{
              backgroundImage: `url(${ASSETS.paper})`,
              backfaceVisibility: 'hidden', 
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              pointerEvents: isFlipped ? 'auto' : 'none'
            }}
          >
              <RandomSticker index={index} />
              <div className="absolute top-0 left-0 bottom-0 w-3 border-r-2 border-dashed border-stone-300"></div>

              <div className="flex-1 flex flex-col items-center justify-center w-full pl-4">
                  <motion.h3 
                      className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-stone-800 leading-tight"
                  >
                      {trip.title}
                  </motion.h3>

                  <div className="w-full flex flex-col gap-3 md:gap-4 px-1 md:px-2">
                      <a 
                          href={trip.plan || "#"} 
                          target={trip.plan ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`relative flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-2 border-dashed rounded-lg transition-all group/btn z-50 ${
                              trip.plan 
                              ? "border-blue-300 bg-white text-stone-600 hover:bg-blue-50 cursor-pointer" 
                              : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!trip.plan) e.preventDefault();
                          }}
                      >
                          <div className="flex items-center gap-3 md:gap-4">
                              <img 
                                src={resolveImage(ASSETS.iconPlan)} 
                                alt="Plan" 
                                className={`w-16 h-16 md:w-20 md:h-20 object-contain ${trip.plan ? "" : "grayscale opacity-50"}`}
                              />
                              <span className="text-lg md:text-xl font-black tracking-widest">
                                  {trip.plan ? "旅行計畫" : "計畫撰寫中..."}
                              </span>
                          </div>
                          <MapPin size={32} className={`md:w-10 md:h-10 transform group-hover/btn:rotate-12 transition-transform ${trip.plan ? "text-stone-400" : "text-stone-200"}`} />
                      </a>
                      
                      {/* [權限控制] 相簿按鈕 */}
                      <a 
                          href={isFamily && trip.album ? trip.album : "#"} 
                          target={isFamily && trip.album ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`relative flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-2 border-dashed rounded-lg transition-all group/btn z-50 ${
                              isFamily && trip.album
                              ? "border-amber-300 bg-white text-stone-600 hover:bg-amber-50 cursor-pointer" 
                              : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                          }`}
                          onClick={handleAlbumClick}
                      >
                          <div className="flex items-center gap-3 md:gap-4">
                              <img 
                                src={resolveImage(ASSETS.iconAlbum)} 
                                alt="Album" 
                                className={`w-16 h-16 md:w-20 md:h-20 object-contain ${isFamily && trip.album ? "" : "grayscale opacity-50"}`}
                              />
                              <div className="flex flex-col items-start">
                                <span className="text-lg md:text-xl font-black tracking-widest">
                                    {isFamily ? (trip.album ? "相簿" : "照片整理中...") : "相簿"}
                                </span>
                                {/* 提示文字 */}
                                {!isFamily && (
                                    <span className="text-xs text-rose-400 flex items-center gap-1 font-bold">
                                        <Lock size={10} /> 僅限家庭成員
                                    </span>
                                )}
                              </div>
                          </div>
                          <div className="relative">
                            <ImageIcon size={32} className={`md:w-10 md:h-10 transform group-hover/btn:-rotate-12 transition-transform ${isFamily && trip.album ? "text-stone-400" : "text-stone-200"}`} />
                            {!isFamily && <Lock size={16} className="absolute -bottom-1 -right-1 text-rose-400" />}
                          </div>
                      </a>

                      <a 
                          href={trip.vlog || "#"} 
                          target={trip.vlog ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`relative flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-2 border-dashed rounded-lg transition-all group/btn z-50 ${
                              trip.vlog 
                              ? "border-red-300 bg-white text-stone-600 hover:bg-red-50 cursor-pointer" 
                              : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!trip.vlog) e.preventDefault();
                          }}
                      >
                          <div className="flex items-center gap-3 md:gap-4">
                              <img 
                                src={resolveImage(ASSETS.iconVlog)} 
                                alt="Vlog" 
                                className={`w-16 h-16 md:w-20 md:h-20 object-contain ${trip.vlog ? "" : "grayscale opacity-50"}`}
                              />
                              <span className="text-lg md:text-xl font-black tracking-widest">
                                  {trip.vlog ? "旅遊影片" : "影片剪輯中..."}
                              </span>
                          </div>
                          <Plane size={32} className={`md:w-10 md:h-10 transform group-hover/btn:scale-110 transition-transform ${trip.vlog ? "text-stone-400" : "text-stone-200"}`} />
                      </a>
                  </div>
              </div>
          </div>

      </div>
    </motion.div>
  );
};

// ==========================================
// 📝 留言板元件 (Guestbook)
// ==========================================
const Guestbook = ({ user, isAdmin }: { user: User | null; isAdmin: boolean }) => {
    const [messages, setMessages] = useState<GuestMessage[]>([]);
    const [name, setName] = useState('');
    const [content, setContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'guestbook'), 
            orderBy('timestamp', 'desc')
        );
        const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GuestMessage));
            setMessages(msgs);
        });
        return () => unsubscribe();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !content.trim() || !user) return;

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'guestbook'), {
                name,
                content,
                timestamp: serverTimestamp(),
            });
            setContent('');
            setName('');
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if(!isAdmin) return;
        if(confirm('確定要刪除這則留言嗎？')) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'guestbook', id));
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-20 px-4 mb-20">
           <div className="bg-[#fffdf5] p-6 md:p-8 rounded-lg shadow-lg border-2 border-dashed border-stone-300 relative transform rotate-1">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-stone-200/50 backdrop-blur-sm -rotate-2" style={{clipPath: "polygon(0% 0%, 100% 0%, 98% 50%, 100% 100%, 0% 100%, 2% 50%)"}}></div>
              
              <h2 className="text-2xl font-black text-center text-stone-600 mb-6 flex items-center justify-center gap-2">
                <MessageCircle className="text-stone-400" />
                訪客留言板
              </h2>

              <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar" ref={scrollRef}>
                 {messages.length === 0 ? (
                     <p className="text-center text-stone-400 italic py-10">還沒有人留言，來搶頭香吧！</p>
                 ) : (
                     messages.map((msg) => (
                        <div key={msg.id} className="bg-white p-4 rounded-md border border-stone-100 shadow-sm relative group">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-bold text-stone-700 bg-yellow-100 px-2 rounded-sm transform -rotate-1 inline-block">{msg.name}</span>
                                <span className="text-xs text-stone-400">
                                    {formatDate(msg.timestamp)}
                                </span>
                            </div>
                            <p className="text-stone-600 leading-relaxed text-sm md:text-base">{msg.content}</p>
                            {isAdmin && (
                                <button 
                                    onClick={() => handleDelete(msg.id)}
                                    className="absolute top-2 right-2 text-stone-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                     ))
                 )}
              </div>

              <form onSubmit={handleSubmit} className="border-t-2 border-stone-100 pt-6">
                  <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        placeholder="你的名字 / 綽號"
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded focus:outline-none focus:border-stone-400 transition-colors font-['Patrick_Hand']"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        maxLength={10}
                        required
                      />
                      <textarea 
                        placeholder="寫下你想說的話..."
                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded h-24 resize-none focus:outline-none focus:border-stone-400 transition-colors font-['Patrick_Hand']"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        maxLength={100}
                        required
                      />
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="bg-stone-700 text-white font-bold py-2 rounded-md hover:bg-stone-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send size={16} />
                        {isSubmitting ? '傳送中...' : '送出留言'}
                      </button>
                  </div>
              </form>
           </div>
        </div>
    );
};

// ==========================================
// 🔐 管理員登入 Modal
// ==========================================
interface AdminLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogin: (e: string, p: string) => Promise<void>;
}

const AdminLoginModal = ({ isOpen, onClose, onLogin }: AdminLoginModalProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    if(!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await onLogin(email, password);
            onClose();
        } catch (err) {
            setError('登入失敗，請確認 Firebase 設定或帳密錯誤');
            console.error(err);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-stone-400 hover:text-stone-600">✕</button>
                <h3 className="text-xl font-bold mb-4 text-center">管理員登入</h3>
                {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input 
                        type="email" 
                        placeholder="Email" 
                        className="p-2 border rounded"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        className="p-2 border rounded"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                    <button type="submit" className="bg-stone-800 text-white p-2 rounded hover:bg-stone-700">Login</button>
                </form>
                <p className="text-xs text-stone-400 mt-4 text-center">
                    (需在 Firebase Console 開啟 Email Auth 並建立使用者)
                </p>
            </div>
        </div>
    );
};

// ==========================================
// 🚫 403 未授權畫面
// ==========================================
const UnauthorizedView = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 p-4 font-['Patrick_Hand']"
         style={{backgroundImage: `url(${ASSETS.paper})`}}>
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl text-center max-w-md w-full border-4 border-dashed border-stone-300 relative">
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-stone-200 rounded-full flex items-center justify-center shadow-md border-4 border-white">
                <ShieldAlert size={40} className="text-stone-500" />
            </div>
            <h1 className="text-3xl font-black text-stone-700 mt-8 mb-4">沒有授權</h1>
            <p className="text-stone-500 text-lg mb-8 leading-relaxed">
                抱歉，這是一個私人的家庭旅遊紀錄。
                <br />
                如果您是親友，請聯繫 <strong className="text-stone-800">林北</strong> 索取通行連結！
            </p>
            <div className="flex items-center justify-center gap-2 text-stone-400 text-sm">
                <KeyRound size={16} />
                <span>請檢查您的網址是否包含 Token</span>
            </div>
        </div>
    </div>
);

// ==========================================
// 🚀 主程式 (App)
// ==========================================
const App = () => {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const hasIncremented = useRef(false);
  
  // [新增] 權限狀態
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('NONE');
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // 1. [新增] 檢查網址 Token (在元件載入時執行一次)
  useEffect(() => {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get('token');

      if (token === ACCESS_TOKENS.FAMILY) {
          setAccessLevel('FAMILY');
      } else if (token === ACCESS_TOKENS.GUEST) {
          setAccessLevel('GUEST');
      } else {
          setAccessLevel('NONE');
      }
      setIsCheckingAccess(false);
  }, []);

  // 2. 初始化 Firebase Auth
  useEffect(() => {
    // 只有在有權限時才登入 Firebase
    if (accessLevel === 'NONE' && !isCheckingAccess) return;

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("🔥 Authentication Error: 請確認 Firebase 後台設定。", error);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser: User | null) => {
      setUser(currentUser);
      setIsAdmin(!!currentUser && !currentUser.isAnonymous);
    });
    return () => unsubscribe();
  }, [accessLevel, isCheckingAccess]);

  // 3. 處理瀏覽計數
  useEffect(() => {
    if (!user) return;
    const statsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'site_stats', 'total');
    if (!hasIncremented.current) {
        hasIncremented.current = true;
        setDoc(statsDocRef, { count: increment(1) }, { merge: true }).catch(console.error);
    }
    const unsubscribe = onSnapshot(statsDocRef, (doc: DocumentSnapshot) => {
        if (doc.exists()) setViewCount(doc.data()?.count);
        else setViewCount(0);
    });
    return () => unsubscribe();
  }, [user]);

  const handleAdminLogin = async (email: string, password: string): Promise<void> => {
      await signInWithEmailAndPassword(auth, email, password);
  };

  const handleLogout = async () => {
      await signOut(auth);
      await signInAnonymously(auth);
  };

  // [新增] 權限阻擋畫面
  if (isCheckingAccess) return <div className="min-h-screen bg-stone-50" />; // 載入中空白
  if (accessLevel === 'NONE') return <UnauthorizedView />;

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-stone-700 font-['Patrick_Hand',_cursive] selection:bg-yellow-200 pb-20 overflow-hidden relative"
         style={{backgroundImage: `url(${ASSETS.paper})`}}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap');
        .hand-drawn-border { stroke-linecap: round; stroke-linejoin: round; filter: url(#wobble); }
        .card-perspective { perspective: 1000px; }
        .card-inner { transform-style: preserve-3d; }
        .card-front, .card-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .card-back { transform: rotateY(180deg); }
        @keyframes bounce-slight {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
        }
        .animate-bounce-slight { animation: bounce-slight 2s ease-in-out infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #d6c0ae; border-radius: 20px; }
      `}</style>
      
      <svg style={{position: 'absolute', width: 0, height: 0}}>
        <filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="3" /></filter>
      </svg>

      <FloatingBackground />
      <TravelMascot />
      <AdminLoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleAdminLogin} />

      <header className="relative pt-10 pb-12 px-4 md:px-6 text-center z-10 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center w-full mt-4 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
              className="w-full max-w-2xl relative mb-2"
            >
                <img 
                    src={resolveImage(ASSETS.mainTheme)} 
                    alt="Linbei Theme Logo" 
                    className="w-full h-auto object-contain drop-shadow-xl"
                    referrerPolicy="no-referrer"
                    onError={(e) => (e.currentTarget.style.opacity = '0.3')} 
                />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }} 
              className="relative"
            >
                <div className="h-1 w-16 bg-orange-400 mb-4 rounded-full mx-auto"></div>
                <p className="text-lg md:text-2xl text-stone-500 leading-relaxed font-bold tracking-wide">
                    從 2012 到 2025<br/>
                    收集世界的角落，紀錄我們一起長大的時光。
                </p>
                {/* 顯示目前權限狀態 (除錯用或提示用) */}
                <div className="mt-4 inline-block px-3 py-1 bg-stone-200/50 rounded-full text-xs text-stone-400">
                    目前模式: {accessLevel === 'FAMILY' ? '🏠 家庭成員' : '👤 訪客參觀'}
                </div>
            </motion.div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
          {allTrips.map((trip, index) => (
            <TripCard key={index} trip={trip} index={index} user={user} accessLevel={accessLevel} />
          ))}
        </div>
      </main>

      {/* 📝 留言板區塊 */}
      <Guestbook user={user} isAdmin={isAdmin} />

      <footer className="mt-16 pt-16 border-t border-stone-200 text-center relative z-10 bg-white/50 backdrop-blur-sm pb-10">
         <div className="relative z-10 flex flex-col items-center justify-center gap-4 text-stone-400">
           <div className="flex gap-6">
             <Camera size={28} className="text-stone-300 hover:text-stone-500 transition-colors cursor-pointer" />
             <Backpack size={28} className="text-stone-300 hover:text-stone-500 transition-colors cursor-pointer" />
             <Plane size={28} className="text-stone-300 hover:text-stone-500 transition-colors cursor-pointer" />
           </div>
           <p className="text-stone-500 font-bold text-lg tracking-wide">
             © 2025 Family Travel Journal.<br/>
             <span className="text-xs font-normal uppercase tracking-widest text-stone-400 mt-2 block">Designed for Memories</span>
           </p>

           <div className="flex items-center gap-4">
               {/* 流量統計 */}
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 1 }}
                 className="flex items-center gap-2 px-3 py-1 bg-stone-100/50 rounded-full border border-stone-200"
               >
                  <Eye size={14} className="text-stone-400" />
                  <span className="text-xs font-bold text-stone-500 tracking-wider">
                      {viewCount !== null ? `${viewCount.toLocaleString()} 次造訪` : '...'}
                  </span>
               </motion.div>

               {/* 管理員登入按鈕 */}
               <button 
                  onClick={() => isAdmin ? handleLogout() : setIsLoginOpen(true)}
                  className={`p-1.5 rounded-full border transition-colors ${isAdmin ? 'bg-stone-800 text-white border-stone-800' : 'bg-transparent text-stone-300 border-transparent hover:text-stone-500 hover:border-stone-300'}`}
                  title={isAdmin ? "登出管理員" : "管理員登入"}
               >
                   {isAdmin ? <LogOut size={14} /> : <Lock size={14} />}
               </button>
           </div>
         </div>
      </footer>
    </div>
  );
};

export default App;