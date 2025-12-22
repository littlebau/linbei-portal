import React, { useMemo, useState, useEffect, useRef } from 'react';
import { MapPin, Camera, Backpack, Plane, Star, Heart, Smile, ArrowUp, Sun, Image as ImageIcon, RotateCw, Eye, MessageCircle, Send, Lock, LogOut, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase Imports
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  signInWithCustomToken,
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
// 🟢 你的 Firebase Config
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

// 定義資料介面
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
    timestamp: any; // Firestore timestamp 類型較複雜，暫用 any 處理顯示邏輯
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
// 🗂️ 資料層
// ==========================================
const allTrips: Trip[] = [
  { 
    year: 2025, season: "秋假", title: "日本東北", location: "日本 東北", status: "Done", type: "future", 
    image: "https://lh3.googleusercontent.com/pw/AP1GczMcbMORd3qssAAAygutlCGQGvpgnFJ3KBnO6yWZPet3L3Pv6nOtmcfgqDzlIbkB4aqRXNyK3FLwLabLpbg7b3GtsYkX_NOfYxrMDWzxwdq3enVw2FQqbsyPTt9le0xfFt7Cmwh2xJCwqreHk4kvVB90Gg=w1367-h911-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczMcbMORd3qssAAAygutlCGQGvpgnFJ3KBnO6yWZPet3L3Pv6nOtmcfgqDzlIbkB4aqRXNyK3FLwLabLpbg7b3GtsYkX_NOfYxrMDWzxwdq3enVw2FQqbsyPTt9le0xfFt7Cmwh2xJCwqreHk4kvVB90Gg=w1367-h911-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczODjmS_gW43khZYdutZC57zearwSwMszt_XfUhy7cxbDbAcFRwHg4rwmo0IiV1nEXqGbcg843zDGoDoYgi-uE0ADLECT-S8zA5gVUnecy7i8u7N5EfozjGzgzSORANTF0WsxKC-0hq7sGvyhVNeu3-w_A=w1304-h869-s-no-gm?authuser=0", 
        "https://lh3.googleusercontent.com/pw/AP1GczNgkhapuKI3ZWZ_igxIXGYyD8izRa5_q6wMIl6UOY9qD3qdYYfs08wH7tmi8_481iyf76HWyFoY4Z51Dhtv71dwyUTYbWaZo_-cF-sukYWTZqLXhGatZFbS-j9ZHndVSAsfvoy2WwwctxfPSa__QYR4YA=w1304-h869-s-no-gm?authuser=0"
    ],
    album: "https://photos.app.goo.gl/hP631FQAmCgxUpoL8",
    plan: "https://docs.google.com/document/d/1BAFg8ngF0yvULcSp7SLqvflTe6oxSSRZ/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true", 
    vlog: ""
  },
  { 
    year: 2025, season: "春假", title: "紐西蘭", location: "紐西蘭", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOnC_qyPEENGBXm9a2ztYIwfFwSD3yrdoenrXKPllvVVj0IpQgAOeXjU6fE4d2TofZUac99-3MhUXbHIZcTnsNNY4KNr8Sn5fneQeWTzH9OEWpIEM3gbQwIC2EtbemZxFDwUqUxOCJDr_OV6bnfXV47Xg=w1367-h911-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczOnC_qyPEENGBXm9a2ztYIwfFwSD3yrdoenrXKPllvVVj0IpQgAOeXjU6fE4d2TofZUac99-3MhUXbHIZcTnsNNY4KNr8Sn5fneQeWTzH9OEWpIEM3gbQwIC2EtbemZxFDwUqUxOCJDr_OV6bnfXV47Xg=w1367-h911-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczPn3BVBzWeSz_V5w6MKhABjBOLhk5COrdbobL2ojgoxD1MrG_MnOjHNK7YGDEULxnqEKAbCLKWlvAMyKo_78o7lkuigJEKPkyLnhTGYHt3BEC9VdvEgvKuoVdwnVTWq-4pd1YYyvZ6yOuKFSurfCtuwhA=w1303-h869-s-no-gm?authuser=0", 
        "https://lh3.googleusercontent.com/pw/AP1GczMm71Q_JbSbKDo2bPZe54dH7spuiD7G5UlIi9gP4oKuKsju9q4nMmSyJi4XSPYXl9E5oG4LpqutxxensaVMvGrvjOsiubHYx6cFhH76beCgjcUwTHkct4XdC5TKoyAfaXyvx9ORzk8jnvug19XrDu5dVQ=w1304-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczOpcvQuovtghwu_66m2V6bJApPyRt_qnjoUO7kHtBYGtwdR2GOhN8B7MnF6WWYXDgpHgjJ65LRm2seWnZt_2Yn4ReJIsYtj_FcsVkAspOp0DrDbGnu27b6iPvpmOneQOvRv1jNepfy3CthVY_cWEigfGg=w1304-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczNYJ2LHUSUqyJtS91ZfIEaaiKhcrDfuHGeed6oFuTtUlJBPuSLfypgYzSdaAZj-7KQlhLma-2tk14Dr_us_566vAKaUHUa8iG2ygULtgAhotdUFOsdSKH0C7e0w35n6KMlVtRJufs5SPoaX7EaPz859zQ=w1304-h869-s-no-gm?authuser=0"
    ],
    album: "https://photos.app.goo.gl/S1CzpJ9nt5PQgR7J7",
    plan: "https://docs.google.com/document/d/13Tg1tbjXMauMIuIlisPgrwgdt9h-0BF9/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true", 
    vlog: "https://youtu.be/CeH0dgQCtPY" 
  },
  { 
    year: 2024, season: "秋假", title: "名古屋", location: "日本 名古屋", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOIFpXM83TMg3kiA0lHJfb7s9QrYCqMQgGF9TU5CTXqohr_yM9YwOwW7--G9xvVAMYKRyd1ZOkTpZCAhhyoBrPGHHX4SU9Z07Je3jJTLppWkExKICFejgU5UKItNM-JcS2AiWhDgL2vZmHLZYK8-kXJbw=w683-h911-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczOIFpXM83TMg3kiA0lHJfb7s9QrYCqMQgGF9TU5CTXqohr_yM9YwOwW7--G9xvVAMYKRyd1ZOkTpZCAhhyoBrPGHHX4SU9Z07Je3jJTLppWkExKICFejgU5UKItNM-JcS2AiWhDgL2vZmHLZYK8-kXJbw=w683-h911-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczNVcHdQ0RDuhBqcj0LTUKN-xo9PxqhlmzEJ7jYghJuiQ91_ev5CWpGrtYtDT48npTj3j5Tx6w2Swjhvb9Y5xpPrntgZJaNNcNmaKf8ECxGYjJ7hqr3EkNh-mhD09GiGLQguCYtRR3juNEsUwZ8vbIUJ1g=w1159-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/Ntntxma3tJJF2zvR8",
    plan: "https://docs.google.com/document/d/19k4b5TZ9R-bfBAuEMlQUkMOWeYpSjVz4/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: ""
  },
  { 
    year: 2024, season: "暑假", title: "泰國喀比島+芭達雅", location: "泰國 喀比/芭達雅", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczPKvJcz_f0SRhyXpaJ1WiCVcFUt4svjVKuisrnUd1m9JwsIIhnVRNyOguE-OjR1HtjqyLcjm8b_WlXQQDsb7z7HNC9IpxCU2cdx9O2R3qhqfscs9MvCs0i-Bmo9gqO7ZQyGCKMk6IJudwbohdSv-f1EkQ=w683-h911-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczPKvJcz_f0SRhyXpaJ1WiCVcFUt4svjVKuisrnUd1m9JwsIIhnVRNyOguE-OjR1HtjqyLcjm8b_WlXQQDsb7z7HNC9IpxCU2cdx9O2R3qhqfscs9MvCs0i-Bmo9gqO7ZQyGCKMk6IJudwbohdSv-f1EkQ=w683-h911-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczN0jmzGq7CCW0DhNxFFrYMJet2FayNpmI3o-LfDMnW5eONmakSleffVGnaRLZdV_7Pe_OivFoSO5g6Ya8fGe_AvOG_CJADNQHV_hholKlfbFRaqEk8b_A0MnyA4LwTTO5UcqvwPjCFveX7kpOxf0hVG3g=w579-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczMFKma_kbCBpzrBger9lolr6gVMi21dmkiDc7qASqCi7E65n_2FtTHULoVFedwwaBC11YzznmUcparrrxeatrx0Dl-AFCmtQorGf1NXKustXa2YChYLWavWGsYmHQdr4p7sBkk4ErOvyeWBe_z7FWpXBg=w579-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczNunvS_OvOo_VRBMdTfQhyx5gkH80MBhxYKLp7eThPPk1e6iY3P4Bp4KptqJx74-SfcH4CAS0YVzCrMOYsB1qMMsKoxW5InN984yKvdDwpS4fDJclc683ZTcV9rgW2XYCQPjQeJkAczWN0Np1IPYa8ylQ=w651-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/Pewtpp8aaH5Jt3vL7",
    plan: "https://docs.google.com/document/d/1BgiWNLVZqKV3Wzj-spiHTA9RLL7lMf3u/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/QDROySj-56A"
  },
  { 
    year: 2024, season: "春假", title: "馬來西亞沙巴", location: "馬來西亞 沙巴", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczNTgX4qaWhKMk4AZNpHVcodVcZp48JRv83RiIukQOZGsRCYijVXYmV9Vmd-4jsio22l9W8El-9GUpqlhgzPLTtJz-U6vqGyaFXrQfSpDgGbb7gsej5KkZkVaMe--YaYc5UVLR9S8FqS7FrHtONGiNEE6g=w683-h911-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczNTgX4qaWhKMk4AZNpHVcodVcZp48JRv83RiIukQOZGsRCYijVXYmV9Vmd-4jsio22l9W8El-9GUpqlhgzPLTtJz-U6vqGyaFXrQfSpDgGbb7gsej5KkZkVaMe--YaYc5UVLR9S8FqS7FrHtONGiNEE6g=w683-h911-s-no-gm?authuser=0", 
        "https://lh3.googleusercontent.com/pw/AP1GczOyErpniIsOtOLv4VCes1jIJcKtr4lUyHBSYsfTjQVD77x-6dZO1_eRxxdKpCW3I4e3nbagMxHFJzz1wLe5zpBuwO_2p5fgUhtF44O4vFWAHy-HLMmoJ33LbYpwpGsw89ZlZiCu1c-huSmWJGj3bkfKaw=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczOZrfAhqexFtJNdQKM-9cPdcRAaBvmEDwIIzY6SjJ9u7l9HKeQBSKcAmCpnXNAYKOWGyPgqOlsxxxAn19cboISKLgg63TuZU-qLfPwdGH7xvyTJWSeC_sQ3wbsQ6YtloD1rqkp0hDpwBGkR1hsATxj_Jg=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczMv7zKQl-DSKEIU-hAQkm78wErmmuUXMzPQRXtQUFTbThJIMRrttjiocNHuTjXfTni-_PDNnG-5mSxlrVsvl_o-9dU1eEBGZ02PGiopojJiFJGH0y33EHwIJxTcByWMULytjm6RuDpSps726W2gzTBE1A=w651-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/xVrTKHo2T2uYLkHx6",
    plan: "https://docs.google.com/document/d/1kTI_pd3t2UpaU1F-seRqsN4tftGl2ZIy/edit?usp=sharing&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/1pxgzINsQkg"
  },
  { 
    year: 2023, season: "秋假", title: "東京富士山+輕井澤", location: "日本 東京/輕井澤", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOSXA2NRjXKyroJ_Np5KA2cJ0RjMYqyFEugErbZ-vXu1r43BYkAcWKzS0b3GAmnDuiv0yAIQJcsZ7bfbBSf6U0KeGftcss_E4WR3OCri_8aSQyX0WrCjmm15lJE8bw2Kn674bTmez_Y38f0lpFDvVISwg=w683-h911-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczOSXA2NRjXKyroJ_Np5KA2cJ0RjMYqyFEugErbZ-vXu1r43BYkAcWKzS0b3GAmnDuiv0yAIQJcsZ7bfbBSf6U0KeGftcss_E4WR3OCri_8aSQyX0WrCjmm15lJE8bw2Kn674bTmez_Y38f0lpFDvVISwg=w683-h911-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczPXn-XiM0h1xt0rjoMkHHcHWbcmREmMZRlXkEfK2XVgWADvO1Rtmc90FM-A1ryszUE_gcpzeQ2jdMwkTDtADN3NMbhhTNOsw2qKP4kyDCPPxGRSeq4lbnLOs9XUvI76x1QNvYfetEUoso9FCrXLEamsNQ=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczPamUJmhIhPJdvLmUJwEJDjos73OBY8c6bULO14lf0BYH-2whpav4IVfx9uq4uajn8VAuUzaWrGjN_bRRG12SLStqOm-taCp-F0g-yQlYDnQazQGs6tr2fsldnic6p7YcDI1ukqZoY0d-EqfhAA9erdRQ=w869-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczP8Fl32d0-Qc-OehT-LgTK6kW9910R6HPfNIjtdracSwygHen2A6teSgTXPmJS92zmOn8lWEAeUlml44NLbIvGhlJ_z-qK2KuNZYjUbkYtQ4BCU8P73c0dQK5seo6vO79fb3vzoP2CLsmu-zK6n4x6M6A=w869-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/LRERnQ9bv16G1wUw7",
    plan: "https://docs.google.com/document/d/1lidmmVOxq7J52-pA-eSYQXTdHtc4hTMn/edit?usp=sharing&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/ZDzI_i8r54E"
  },
  { 
    year: 2023, season: "春假", title: "阿里山+墾丁", location: "台灣 阿里山+墾丁", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOk9eL_jzkrwIC7pPXMC1DNleQ1Ao7OOX2243CAUqNCcsldAqGk5XoRJz069GwzJfZicfirmBb_9-guYimYzRJB62fys2oj2OjWzdYmgfXMI4HcbXl_kHwBpNVTGKMSo-_ikRXhbpTdfS-g-DoJC0BlOQ=w1080-h810-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczOk9eL_jzkrwIC7pPXMC1DNleQ1Ao7OOX2243CAUqNCcsldAqGk5XoRJz069GwzJfZicfirmBb_9-guYimYzRJB62fys2oj2OjWzdYmgfXMI4HcbXl_kHwBpNVTGKMSo-_ikRXhbpTdfS-g-DoJC0BlOQ=w1080-h810-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczP1d389B7I6v6S5QRmKKCgUorqHWn5PCrfy3Ahg-rdZ1vYuQLKtqF-HvwbF5XpF44oa9V_ONLNCzm5Bfp8w25-B-A06nhQw5ccE8KtlBEf865vgXEHXpLx8ZMPw9CvYmOuOoBIl4-u0_dIrvZKYi8ZfKA=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczPXgqRY6eZmQqeLutDw4dllPySTSZ14Nb5bvucUqi5s7s0lwftJ_myiGnB5QixnNyTeVML_kJBItgXdCUpQaU0vkIY-pxhf3gfKIXYSdtaPFRLcG7wd9D2IqFBhZ6sHYJrMvi0K6Zq-ma08wr4KqJ0c5Q=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczNKXbF762MTq5mSDWEDZVEAPpqBEwyghlAbsiWwGoISrsehdQusME0WmA6OilAxcf6Wh5vsi3idTNphDgq0DytSeyVyUfGT8TaQCld31EJltmNKUDh3M7k9dIcRl9zhs54TO9dMKsyE7Tkr23Cx72tvsA=w651-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/6Tm4xnSpEiMQKpFD9",
    plan: "https://docs.google.com/document/d/1PYevx-l8pimaWODh2JkjZLyz-8xXUVX9/edit?usp=sharing&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/H3iL7GCYOCo"
  },
  { 
    year: 2022, season: "秋假", title: "金門", location: "台灣 金門", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczNCZqyKu69Abqg8PsMWI0liXB0CN_eCpW5tMQwR8YCzTXSN77IDC8os1s6CEpDrufxVRBaYo_HkK8uiG1c428dY7UB7fEEBnFX9Efmqe31NtNyjdJqOeRuiZDowU8728TOv3JQkdeKMIFUP-JBpGEUhCg=w1080-h810-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczNCZqyKu69Abqg8PsMWI0liXB0CN_eCpW5tMQwR8YCzTXSN77IDC8os1s6CEpDrufxVRBaYo_HkK8uiG1c428dY7UB7fEEBnFX9Efmqe31NtNyjdJqOeRuiZDowU8728TOv3JQkdeKMIFUP-JBpGEUhCg=w1080-h810-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczPdRgCWmoHSC4_S-zKFJz7Lf4yfpBs863HnacpBry6OV8DWQ7x7IIq2P8afI0bvC55tNftfclrr2dcfyu3h9qwXYFFNDFfgS1ET5SBhI_D5HAn5frFFyjTx3frnjGHyhwhhptsRG0YV1BrNJTdj_p4bhg=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczNA8ClOpPv2RXOLnXUSsYSarUSHUm9_vqqF0HcI-u1IpuKcAml_XrlsxSSHVUsSqGm4iy56Rw8UaP6CqL5e6GBhj8YPuyUtCjoTM_cQb1v_uKaIApY7W3-EobCAmNeeUE8yC-u9VQSBiCszHJRXzM9j6w=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczMk9oq8IK8xMAVm0qRR_mHB83yNPl9zN_6hLh8p3YmarPWdQ_vS8V5tPtFSqD5Jqwlrn6DhaTYiHvo2SgYIHSsFobSsAW6oCUw2xWIBSjPpFGJSgFimO3PjuwNGlVJYgUShmE_4lrbbW9Td8HcmNR_VTg=w651-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/mzw2SFgtotUeyvuQA",
    plan: "https://docs.google.com/document/d/19ejwcXm1rbVKTpVYrv3bB0djDR7FpDbL/edit?usp=drive_link&ouid=107075976967006832590&rtpof=true&sd=true",
    vlog: "https://youtu.be/qgYisyxXANc"
  },
  { 
    year: 2021, season: "春假", title: "澎湖", location: "台灣 澎湖", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOWyPeiR_92g04FqjWeg2EUS3XsyNGZSoxZBVDtGaNzUVadlOplFiFKFOcmj_lQpY0Z9VtVO5-iIKboJQeRL_OjvhPHwk2rHV6PW5bUqYsYald_ytBhjwCkS3fL2usU4fy-qTM1IVn3Z8tH9JFNJL0t_g=w1215-h911-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczOWyPeiR_92g04FqjWeg2EUS3XsyNGZSoxZBVDtGaNzUVadlOplFiFKFOcmj_lQpY0Z9VtVO5-iIKboJQeRL_OjvhPHwk2rHV6PW5bUqYsYald_ytBhjwCkS3fL2usU4fy-qTM1IVn3Z8tH9JFNJL0t_g=w1215-h911-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczMb2ZrT6qBTMYYvQSf9ObOL6mReUdyCr_e1dAk24qlUQcWDrg_IzTlXOKuj4L4R_oy5J0bFwXcXJYw2lC4boHba4G2CwvsNQADXxZuXZI3LEEl5OiUIDfMimUwzovN6hWpaFQ2Tvjg0HBpA7gmmJOsfZA=w869-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczM0JxrLTYhJboQv_RRsFaWU54jY5dmVx-qZf65c8ynvXDt8CsaSHPEOLWK4NhfyF3UhKnhwIpdjcuL81Et8V4MP9UtQkUUS08Q5H7ciYLDnPfcDf_gV0gTqQuhl-I-oRjzC7limAYZocBTOM67G3k5TtA=w869-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczMnq1tePgBzGB-wq-d3RCqF-LeW6fPlHDbjtrCycsFQuyhZa9x3ygqao7_OC1LBPrCCg44YK0fNjzGhC2xj9cId56Hs6EJiifbLK6u8DyP5keywYEsAKsfRd8WayrHlNKjH_ff-dSEqkSiSPWJeIIGtYw=w1158-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/VDvduGyLpJrJRWvK9",
    plan: "https://docs.google.com/document/d/1kWK0K1WjR4uvMNrU2J9nyEKNvuYowHEOHcvqO2EnNSQ/edit?usp=drive_link",
    vlog: ""
  },
  { 
    year: 2020, season: "秋假", title: "台東花蓮", location: "台灣 花東", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczO8aEmmVsL3vbj2KkKhniAZGxub7WwkJ1jkBkuUawv3jmNr0N87uztf5kdR91-KV3XT8IsTMTFzMwrTkTCxy7pfcJoI2Mcr5CQn4MWd8_CVIpetFMaHvxcy_D-692cAeIaVWa_mCr2svMzK8VwE5FgNNA=w1159-h869-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczO8aEmmVsL3vbj2KkKhniAZGxub7WwkJ1jkBkuUawv3jmNr0N87uztf5kdR91-KV3XT8IsTMTFzMwrTkTCxy7pfcJoI2Mcr5CQn4MWd8_CVIpetFMaHvxcy_D-692cAeIaVWa_mCr2svMzK8VwE5FgNNA=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczMCaTPijrF1JAHqDRPwqzZbnwMMdc-ZaUjqCtXyUsIs-q4038LGL0R6LQhW1hGTM4m6sXAad3WL__jiqueEvp0sTYgSJf3r31wva9M9O0ohcGuB0mIvYO4hCo0zEdSAiQAvGSCk3IHbcYcAj52o5WLnBg=w651-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/H4HsyqcSfXYi9UW16",
    plan: "",
    vlog: ""
  },
  { 
    year: 2020, season: "春假", title: "台中薰衣草森林", location: "台灣 台中", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczPhREnlHCM8UJg1Rg52QkzsJNi7hK7NCdgKMvltsqeQJdKvkSHlTc6Y3TQM97UewCgI3CyEFQk-D3ANvuLRwUNur3VTsqOpzCezC4P-J476NTabFjliJrQHVBilEUYCmB9b11WwGCqw7Y8J3X0X83aRaQ=w960-h720-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczPhREnlHCM8UJg1Rg52QkzsJNi7hK7NCdgKMvltsqeQJdKvkSHlTc6Y3TQM97UewCgI3CyEFQk-D3ANvuLRwUNur3VTsqOpzCezC4P-J476NTabFjliJrQHVBilEUYCmB9b11WwGCqw7Y8J3X0X83aRaQ=w960-h720-s-no-gm?authuser=0", 
        "" 
    ],
    album: "https://photos.app.goo.gl/wa3ED2e4aEUU27kt7",
    plan: "",
    vlog: ""
  },
  { 
    year: 2020, season: "寒假", title: "菲律賓長灘島", location: "菲律賓 長灘島", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczO0HaHno8XLHt-qnazf8Q74IxSZV5tHE7s82NklL_1DFQYJYR4qrJGE7FhTUoWs12q1qR5sSXXFlGbforUyAlg3D43ciaOP96y97hZ2jBoftVEtO4BTBjlocl4tt2YMP63cH8qH2aIUPZ_m88qbYPgUQw=w1159-h869-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczO0HaHno8XLHt-qnazf8Q74IxSZV5tHE7s82NklL_1DFQYJYR4qrJGE7FhTUoWs12q1qR5sSXXFlGbforUyAlg3D43ciaOP96y97hZ2jBoftVEtO4BTBjlocl4tt2YMP63cH8qH2aIUPZ_m88qbYPgUQw=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczOUJy02ri2hxFhm4l8Q9-rRXD6TBR3e26RM-7rJItnl1aFDtNebH0JbWvYVlVMSadhhglT1_MVlz6FkU1vMZHedH4NXHP_E1cki68sUEMcNSP_IoO0rlm8yjdzaZrdqhtBRU68vShsm8bYau6Fk9xTEAA=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczOjcq5GvaA8JlJ5FpFAgPGNeBQWvA_Q6Q0qWRWgqV8rXgKO5zs-bzyDk_2236W0nqDiSOv3JkEUO0Xn0_Ffyk9E7S9hsAzP5jlYYLSE0fHcYYpCbd8aVrWBPsI5XLX2TIdnQly_NdUgYLWDaJ6z9tuZOw=w1159-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/YUQtZiJngPJp8iF59",
    plan: "",
    vlog: ""
  },
  { 
    year: 2019, season: "秋假", title: "花蓮", location: "台灣 花蓮", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOObxTVG1EGf41t9VT4uSzHjFz-2ROovPIACf9NmeUgiCqVnJUoiK51ZHOcv7bdxwpL-cPltqQ51qtXin8Pko4jRx2oLegYXFCD6GLC3TVCFCDoQKzxJoV1I-RG_Qpt4rjK7Pyc-Kilm7DrwdGwWnKamg=w651-h869-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczOObxTVG1EGf41t9VT4uSzHjFz-2ROovPIACf9NmeUgiCqVnJUoiK51ZHOcv7bdxwpL-cPltqQ51qtXin8Pko4jRx2oLegYXFCD6GLC3TVCFCDoQKzxJoV1I-RG_Qpt4rjK7Pyc-Kilm7DrwdGwWnKamg=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczN_mLa6r-jHwsCxo2uPp7xMyk3verZ8Xsvwryo3TmRT64ee7dBhtAYtlluFHjRCJ7mHtc6MtqUv6-GwWLXAWof_MOIaQNDq6RkUJ7CnZficWO6sp_gmJbk5UqJbINSOuycvWqxnKsEDdi3UJfkOiU7hjQ=w651-h869-s-no-gm?authuser=0",
        "" 
    ],
    album: "https://photos.app.goo.gl/mk2rstVdxmKUcjas8",
    plan: "",
    vlog: ""
  },
  { 
    year: 2019, season: "春假", title: "小琉球", location: "台灣 小琉球", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczNoGNobycQ8s94-o1u_DsTktFGTrH4aD-f1Vdfjp87KcdQnwYZLteq61H_nFYjgsXz5TQG-AMJ1rIuVs_ESwnbr-T-2VzfAdPr44OcGYdK15OEfkbF6cqyCqoADJKLuPL4Hj-RzqkxzESm5WdtjttvFPw=w651-h869-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczNoGNobycQ8s94-o1u_DsTktFGTrH4aD-f1Vdfjp87KcdQnwYZLteq61H_nFYjgsXz5TQG-AMJ1rIuVs_ESwnbr-T-2VzfAdPr44OcGYdK15OEfkbF6cqyCqoADJKLuPL4Hj-RzqkxzESm5WdtjttvFPw=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczN_O-ski8wVZUepWi3ztEjE2rfjM3Y1v9O46MBASAD4JpUjH7WiSA59j_uvZFgUpZ7cQoaTuadh9Z8Kw2sSJGRoUsnjB0XBnXmF-gmNTI1a4MiaJngkp5dz7kibMCF2_i0cZ0fLlRavrpYC8XOJYcSODg=w651-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/Qui7FURUHiCYfZ7B6",
    plan: "",
    vlog: ""
  },
  { 
    year: 2019, season: "228連假", title: "泰國曼谷家族旅遊", location: "泰國 曼谷", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczP860SyVfCvOVRH-oOWdm9k9ZqYPXFbncybFp7J84MnU4b3NQZQTH4dJfubWiKJQUJz_Aaq4Y24wDYJG9jdO1H1kPymFtV9vN8cAXlbeKwzIKD67Kg7Hk5pxpFMJm6ry3nobW8Wgk7NWgJZb2Mi9NDwyw=w1159-h869-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczP860SyVfCvOVRH-oOWdm9k9ZqYPXFbncybFp7J84MnU4b3NQZQTH4dJfubWiKJQUJz_Aaq4Y24wDYJG9jdO1H1kPymFtV9vN8cAXlbeKwzIKD67Kg7Hk5pxpFMJm6ry3nobW8Wgk7NWgJZb2Mi9NDwyw=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczOBJoRJKcpqlTSmyvnxeQ7OuMeiQJDlzL3kbOewHI3EbQJoUKpiUoAJ5HnWXfaXuwMx5mKlsDlJQAadlZf0FrpipKkYzcQtNAh_-gPMCivsB3OPLOHFHquNrfhGSJd-gNFrTlEE-Kgu0PVqH8JPbbCz7Q=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczPdU7u3LbWNsM1qUALYhFB8qHKDYQPGsTS6ROS7pO67XAcki8QgwXsuk68ygsatmxAIq-FQv-iWImiCKs8j-qyAsnUT-9TcqKFR1WlS2_RoR-_Mq_aeE-9fo1NN4fBjDjWL93X4FeEGv5X9d-0NOo46sg=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczOTztBUMMZmzvTXFCSNOCpkRtuR_IDJyfrQPpDonF7EfXTAUAVv7dfMCnSWtl2At4SsUqukh74kO8XsVF5i4Zw-9rifyEBZZS_fx64dYB1K-RIXV0cjT-7Soiccq8CCwnHqLjz_KH2mo9sgJWDh67lKQA=w1159-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/X7tTVwGE3F5JeJcQA",
    plan: "https://docs.google.com/document/d/1vl7W0JEGucFdqfiODl2M3XSnAlZSWjPRE0NN25bN9WY/edit?usp=sharing",
    vlog: ""
  },
  { 
    year: 2018, season: "秋假", title: "薄荷島", location: "菲律賓 薄荷島", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczNEnT1ehdcVZHZnDFnepYVonSsp7PiUHYMJbguR-RU9lsvV3jGyuoNl0W7iikhg10yTRXlARhqXVIVjt-Cz-D5wxwAsWD0mF3t8152_0fDu3hzl9Uzns7bTcHJQNEJBAa3atLBLiqVMzmCKH7ObQ3Wjhw=w651-h869-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczNEnT1ehdcVZHZnDFnepYVonSsp7PiUHYMJbguR-RU9lsvV3jGyuoNl0W7iikhg10yTRXlARhqXVIVjt-Cz-D5wxwAsWD0mF3t8152_0fDu3hzl9Uzns7bTcHJQNEJBAa3atLBLiqVMzmCKH7ObQ3Wjhw=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczPs9VWBGcuebzjyS9jVoWQIu1Tfxi9AmDBYiyNfvLTTsUrZv7uTRllGaoGIGlGd0l4zq5BtiI5OrQ2mtenw991DGVw5DRYWLXqqeyYowrpQYsE96GoDXBu_Y03qjrxFnrd7O5tqGnVE5gdW4iuWjQdjyQ=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczOBq-2g1UE_j6MDxnm5giETuQNqWStTTegqhgZWocj949iqwaqvugHZoCUxRXyNC62GILSJ1slFd3eSyTe9G2QW4aCrJrmLGr1PaOIHwfdW89J5uKvBNx-KA-mokLt7hEy2K_ThnDI1G1skjU-msjHQxw=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczOnSA0iscr7_qxSafxVHodIGjF-Ngkta4sCCeGZPDqRWOqNZRA6i73e5GQUUjov0aMgFEkLSA78PtmJLMLyE6zD6Vhb-i19P-4762aX5XapKJCx1XdSh_oxeJxUyq-n8w5vUMs92kEhWaOTzzo1_qRTUg=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczP-Gb1mddsBb_TgVrDc1NYSjsd3kl8BtXUGge62hXJwRCLckrMAYGobLkCVy9V5DcRdjZfigi_s4wW4MgvRWZj6N3EVjTlDitwZJiUKUn2QBwKThugh3Q8vhNS45lB1dfYKXV4qZbSABNQosq0LeVKqng=w651-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/mXKfaKRST6oYDsdt5",
    plan: "",
    vlog: ""
  },
  { 
    year: 2018, season: "春假", title: "京都大阪賞櫻", location: "日本 京都/大阪", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczMBFJ5NhFXesNNylOJMy4fLvTVOEliBuvw1Jvr7Tx8lZywNVrmxlbrksijkOytvm-UeZk52q76FDuP7_uYiG7KcYFDVsVJUW3AuLyYF_9ecFQObPQQNQX32ktcb40nzdL4UUOmshlfOyvE9JvbCHGdE3A=w1159-h869-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczMBFJ5NhFXesNNylOJMy4fLvTVOEliBuvw1Jvr7Tx8lZywNVrmxlbrksijkOytvm-UeZk52q76FDuP7_uYiG7KcYFDVsVJUW3AuLyYF_9ecFQObPQQNQX32ktcb40nzdL4UUOmshlfOyvE9JvbCHGdE3A=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczNuyk8pWagznRsGNfjzupXY3m4hAKCZfsr_3kTNszKh9EUDrJO0japLAWb0YeTx6TG8uYgnyyX_t3qxJRGO5pQtYW9xXGm3DJwADL2gsu_tQwxGQ0Hs68bgciuMilMZmsVHWCioOYgyJFVa0fo8g1urhA=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczMaAaMZ8XT0eR_j5rcWrltvtzzETWTgJA18TW7TTLj5ZyoRdL2sTZAwTdCzrMnKO-oNKdYU966hhkZgPvSJ5cxABxly0nyq6zWClAcf9omwqSfTEsW_NWZJh7fFQ9nqc__bOlXcN_OPs2XGBXSCux8RZQ=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczNNHbaJVoI-yt1t8N6q35X0mbwb5q5T2F3__13sMUh_rNa3HYE0VZr_aviim8gQB1ModncFRSK4gY1PWUZCkR6O4SUVM_Jt8JHTcECXae3jF17TpE2K3_MHBsa3nar311QaFgGdqddQyzSwdWP5nUwI2g=w1159-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/6RT3wDj3LRJrLQjK7",
    plan: "",
    vlog: ""
  },
  { 
    year: 2017, season: "10月", title: "日本九州", location: "日本 九州", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczNw2V4r-AZlrxXikyE8f-ydCdR-fQpfTazFARMpZAQb9NyqOJEumziV29fkdw0DZufBYHPMcmDHwcOpWxjlmnMlzV2BzWAtqbBPZot8HSCrAT5nBtygTYjhP41aNzeT-zy_Ixv0emZquRPBf1S2R1IzGA=w960-h720-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczNw2V4r-AZlrxXikyE8f-ydCdR-fQpfTazFARMpZAQb9NyqOJEumziV29fkdw0DZufBYHPMcmDHwcOpWxjlmnMlzV2BzWAtqbBPZot8HSCrAT5nBtygTYjhP41aNzeT-zy_Ixv0emZquRPBf1S2R1IzGA=w960-h720-s-no-gm?authuser=0", 
        "https://lh3.googleusercontent.com/pw/AP1GczOGp1OheeQhD-dsdSPjNu7lCl7pxyfzmxT4khXpc3lFC9CvNu_tyRRB6vMh7Etx0BJJr8gGEZO51EtxcC2UInIrmv3frlXtobkFHqxKgG-EXnN5WnjqnmyicohIklk1Hz4ni5I-yTMsAbQtTFs6QJHEHA=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczMz07Oys4h2bk2T8fkBlFpel3XBHHRSaQssofD3Elws81hk-ANgc1CSUQ5DXgBdrT8FsqNivErlj1UmklUjZPmn5UBBMb6iGVeCgzHBf5YjL_jZbGw5VVl_demtO2r1yhcDoKYf_eK6iv15RbxZ9OEjow=w651-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/6PFYDGzFEp7fkHem7",
    plan: "",
    vlog: ""
  },
  { 
    year: 2017, season: "228連假", title: "泰國曼谷", location: "泰國 曼谷", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczMqonmhIgRP57SEtQU1uxFweQbS6gJjv0dy-ZpmVlEIWmMXY3wmgj4_TzsDFCBYTXWB2mwP8-3t6Y6bJ_2-3aGJf0-wGsU_sDx1vR6TsQP8BejYT_DubWfPW1KxC48v8ZYK8mFCaG382gNwKH7cn2zXRg=w1298-h869-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczMqonmhIgRP57SEtQU1uxFweQbS6gJjv0dy-ZpmVlEIWmMXY3wmgj4_TzsDFCBYTXWB2mwP8-3t6Y6bJ_2-3aGJf0-wGsU_sDx1vR6TsQP8BejYT_DubWfPW1KxC48v8ZYK8mFCaG382gNwKH7cn2zXRg=w1298-h869-s-no-gm?authuser=0", 
        "" 
    ],
    album: "https://photos.app.goo.gl/o4vCZhmEFurrUcGV8",
    plan: "https://docs.google.com/document/d/1_I-eQ5iuBo18AJUMjqYzNDW8mLmIT1C5ozHpR-Az7qg/edit?usp=sharing",
    vlog: ""
  },
  { 
    year: 2016, season: "12月", title: "泰國普吉島", location: "泰國 普吉島", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczMhhy_tboy1m7o-aLb7_bxVGK14AxIPmVCmz8o-9BFAt3r_Oi1VgFJ8Z0yMC3e-KS9jr1V7lDhjx771AK59RSHNIp0W4DPFZjZ0FwDOq6qSBx0TPm5_X9qUYJD_BqD-AvMoBydvWA29kY-bMvrZnCHwJw=w1298-h869-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczMhhy_tboy1m7o-aLb7_bxVGK14AxIPmVCmz8o-9BFAt3r_Oi1VgFJ8Z0yMC3e-KS9jr1V7lDhjx771AK59RSHNIp0W4DPFZjZ0FwDOq6qSBx0TPm5_X9qUYJD_BqD-AvMoBydvWA29kY-bMvrZnCHwJw=w1298-h869-s-no-gm?authuser=0", 
        "" 
    ],
    album: "https://photos.app.goo.gl/bgacpnskapAws9jf7",
    plan: "",
    vlog: ""
  },
  { 
    year: 2015, season: "10月", title: "菲律賓長灘島", location: "菲律賓 長灘島", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczP2-YWeZHX1KEDGC5XCjt9oqQm2iZo9Es3AmbJAB-xc9czoagV6o3iHURgCB4dBfwAqKuCiq2FSeoiRdldx-Vx9LYjGZmMyWHwomAfCSPqVpKBPPhcnvOJbBi8bhFTlEFFiMJJ3YnBE9kzwJsFFeZ1A1g=w1159-h869-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczP2-YWeZHX1KEDGC5XCjt9oqQm2iZo9Es3AmbJAB-xc9czoagV6o3iHURgCB4dBfwAqKuCiq2FSeoiRdldx-Vx9LYjGZmMyWHwomAfCSPqVpKBPPhcnvOJbBi8bhFTlEFFiMJJ3YnBE9kzwJsFFeZ1A1g=w1159-h869-s-no-gm?authuser=0", 
        "https://lh3.googleusercontent.com/pw/AP1GczM-jW4tK013vwoyxjN5kOOrwN-2RF_3q3TbYC6odU8NKr2pn2iBFGnVyk_wH0OMfgQbfICp8TVOIq6AFHBmtRGOpw75UYbrQ9DgJgkp-9oFHuXfD2LLAyeUE8zsLnBBx5N5ofHbvGMYBfFcyyW3sHLZIQ=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczNoLLBB9X848r78S4DcvIrWkuntmuCzsc4hGJIVsRPzBRjGnUtDM_WKdbI7PE0RKuk2b73bRAmb7kGaomK1X7vsr3SZoIBR0Tz-LMxE8CxugXUGEbVWwc3VT0-OjCcxE3PTVXnM1oZrXLlC4vLYvv90Nw=w1159-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/nJ2vXrskDPPyaBp68",
    plan: "",
    vlog: ""
  },
  { 
    year: 2015, season: "7月", title: "日本沖繩", location: "日本 沖繩", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczPSNpysGxf-PY4Ci1_fEdAn1b7Lfq-a9Fhrw2nA1ePppSmbGIpVEaGkFHIgAS0EvRBrfHmMMEgFPl-M5_0KNlHV7gmH9o1t7Wv_VzNcaSiAoBIVyVUTarpfdhkp1N1vpzCh_PqrcaFo8d5747Lw49pvhQ=w651-h869-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczPSNpysGxf-PY4Ci1_fEdAn1b7Lfq-a9Fhrw2nA1ePppSmbGIpVEaGkFHIgAS0EvRBrfHmMMEgFPl-M5_0KNlHV7gmH9o1t7Wv_VzNcaSiAoBIVyVUTarpfdhkp1N1vpzCh_PqrcaFo8d5747Lw49pvhQ=w651-h869-s-no-gm?authuser=0", 
        "https://lh3.googleusercontent.com/pw/AP1GczM-8xa1YxQ7A9ghQdFzHHPfBTKK5GklhTFp0PJcnEUyYS1jxoq7qSgr3_FfD90Hsj0PKqu7P5AN-grI8pL8dWpY18OrLxWrtP8UR4UVYxAERgZFyaGBjnrkbC29ERl9tA3Fljimfhx-MHdZLdfKIKL6sA=w869-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczN6gZYML19_8Prqz5x6Ctzgg0l2GLDmaPKCTlWV9pM4em-QDwEwRGH8n2-KBHZ2B5_e_jj8-pXLnFZfCvVI4z74iWvX7V-uCx41ia0NIKH-aTsbWx9frZ_17QNgAFZg1f1A3a8_t-jsZBQhrN0rQqlHNw=w651-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/3rPEuj87yJeaKGm69",
    plan: "",
    vlog: "https://youtu.be/vb-Z-uyL8bQ"
  },
  { 
    year: 2015, season: "5月", title: "日本關西", location: "日本 關西", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczNIVwTZiGqboCln-rcM57PvfYkNEhhD6Ed0WBEUn1Cs0iFlbimJgeB41fSBczbXAZHwW7IbffpIHFMk_2ErT_I7gnhiwoqNWl_qeftdLFaXxUo52faqj_z-u1bYHF8SeEADcHoOr5jqg0xXQi6D7zCy0g=w1159-h869-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczNIVwTZiGqboCln-rcM57PvfYkNEhhD6Ed0WBEUn1Cs0iFlbimJgeB41fSBczbXAZHwW7IbffpIHFMk_2ErT_I7gnhiwoqNWl_qeftdLFaXxUo52faqj_z-u1bYHF8SeEADcHoOr5jqg0xXQi6D7zCy0g=w1159-h869-s-no-gm?authuser=0", 
        "https://lh3.googleusercontent.com/pw/AP1GczMIFyZ11XVpHLUoX1NDVyB6zcPPjmFkzVzGsHtS2vUXplWPhBm-VVDkdE_KN1cMhOdtdAoUH14P1Y4mzMlpU6vxv3wzuhIm_TBZwm2h9t95brUH0gnTJKB6kj2CaYJJc6YHy5JzwzRpiGsDIBWmzPakZQ=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczM61_-o40IuQJm6hiBfA7t3vWjemXZSTmsxhsCDN3Os7CvR2QPyll0HoCARsSHkGEokWqNOakz-4FbS_hqLU_HcieFmSUT1RxwULkRGAJfkILhzkd99nj1eRmvL9W6yMqF7yI7DKDkFoxR1sodnhLPqzw=w1159-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczPSMeoYm12pHF3W1pKaTYgNruKj7MXNO3rNHJzJvdWIceLv26Ru4Akv9DFJquaw-CA7tz8ZhUEMgtk1gSk4PGnKv6k3kbpNpISWoTGYEB9ZbsKCSiZXAzB_lKGnpNpj6r32jGqV9xkhrkLGgEZ1_iBCAQ=w651-h869-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczPLJ8iH2fO3GYceWC9sHXzRNR0cMGPoTAuoj-87hjLoBdzWZNJZFF7_gazW4ffsbrD6HQH780ya7SNPp6JdghAr985NF0GJqF75y96OnXdpb2DUcJEcgjer_1GV4faWrnsZP0nuCUF_eprtW26dzJueuw=w1159-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/TFgis9BccSoP2VxJ7",
    plan: "",
    vlog: ""
  },
  { 
    year: 2014, season: "暑假", title: "韓國首爾", location: "韓國 首爾", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOFvT0MwE9z5-L3dCYqQTf8g-wEmyZ5ntyUPpw52loItuxZ3uXfYIvY7ybT3DPB4GJ7q-a1f0XzaAohanG_ghlMikM9H7vAXP6cIh7Cy2dRrTLfswklTKAkk_ttccbTfPCorUagdyY5p17fjH29Ky8JhA=w581-h869-s-no-gm?authuser=0", 
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczOFvT0MwE9z5-L3dCYqQTf8g-wEmyZ5ntyUPpw52loItuxZ3uXfYIvY7ybT3DPB4GJ7q-a1f0XzaAohanG_ghlMikM9H7vAXP6cIh7Cy2dRrTLfswklTKAkk_ttccbTfPCorUagdyY5p17fjH29Ky8JhA=w581-h869-s-no-gm?authuser=0", 
        "https://lh3.googleusercontent.com/pw/AP1GczPorQTN6Gbe5pi0iK1dr5Zih78SJQ91Jz-LBCkWUBAnYq0NA2dQH3j2Fw9iezodFJjqx-qW0C_H8CLd_YqIybsWOCELWxEEdNZgPjcIlDYqLal8CcjEJI0qvVOvgGYChjdi-474Fgb5tJTuMAMkhhODdQ=w560-h869-s-no-gm?authuser=0" 
    ],
    album: "https://photos.app.goo.gl/w5g9ZzY2wkhnqV7j9",
    plan: "",
    vlog: ""
  },
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

  // [修正] 使用偶數層級路徑: collection/doc/collection/doc
  // artifacts/{appId}/public/data/trip_likes/{tripIndex}
  const likeDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'trip_likes', String(tripIndex));

  useEffect(() => {
    if (!user) return;
    
    // 監聽按讚數
    const unsubscribe = onSnapshot(likeDocRef, (doc: DocumentSnapshot) => {
        if (doc.exists()) {
            setLikes(doc.data().count || 0);
        }
    });
    
    return () => unsubscribe();
  }, [user, tripIndex]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止觸發翻牌
    if (!user) return;
    setIsLiked(true); // 本地立即回饋動畫
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
const TripCard = ({ trip, index, user }: { trip: Trip; index: number, user: User | null }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const randomRotate = (index % 5) - 2;

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
     // Check if click was on a link or button
     const target = e.target as HTMLElement;
     if (target.closest('a') || target.closest('button') || target.closest('.like-btn') || target.closest('.group\\/like')) return;
     setIsFlipped(!isFlipped);
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
                      
                      <a 
                          href={trip.album || "#"} 
                          target={trip.album ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`relative flex items-center justify-between px-3 md:px-4 py-2 md:py-3 border-2 border-dashed rounded-lg transition-all group/btn z-50 ${
                              trip.album 
                              ? "border-amber-300 bg-white text-stone-600 hover:bg-amber-50 cursor-pointer" 
                              : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!trip.album) e.preventDefault();
                          }}
                      >
                          <div className="flex items-center gap-3 md:gap-4">
                              <img 
                                src={resolveImage(ASSETS.iconAlbum)} 
                                alt="Album" 
                                className={`w-16 h-16 md:w-20 md:h-20 object-contain ${trip.album ? "" : "grayscale opacity-50"}`}
                              />
                              <span className="text-lg md:text-xl font-black tracking-widest">
                                  {trip.album ? "相簿" : "照片整理中..."}
                              </span>
                          </div>
                          <ImageIcon size={32} className={`md:w-10 md:h-10 transform group-hover/btn:-rotate-12 transition-transform ${trip.album ? "text-stone-400" : "text-stone-200"}`} />
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
    const [messages, setMessages] = useState<GuestMessage[]>([]); // [修正] 使用明確的介面
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
// 🚀 主程式 (App)
// ==========================================
const App = () => {
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const hasIncremented = useRef(false);

  // 1. 初始化 Firebase Auth
  useEffect(() => {
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
  }, []);

  // 2. 處理瀏覽計數
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
            </motion.div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-16">
          {allTrips.map((trip, index) => (
            <TripCard key={index} trip={trip} index={index} user={user} />
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