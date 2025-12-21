import React, { useMemo, useState, useEffect } from 'react';
import { MapPin, Camera, Backpack, Plane, Sun, PawPrint, Dog, Cat, Star, Heart, Smile, Coffee, Map, Images, Video, ArrowRight, Calendar, RotateCw, ArrowUp } from 'lucide-react';
import { motion, useScroll, useAnimation, AnimatePresence } from 'framer-motion';

// ==========================================
// 🎨 素材層 (ASSETS LAYER)
// ==========================================
const ASSETS = {
  // 1. 全新主題 Logo
  mainTheme: "https://drive.google.com/file/d/1DkyWE7T3BSV5PGyYiRCaHlCeaR-kskBO/view?usp=drive_link",
  
  // 2. 旅遊裝備 (Placeholder)
  items: "https://placehold.co/600x300/png?text=Travel+Items",
  // 3. 背景紋理
  paper: "https://www.transparenttextures.com/patterns/cream-paper.png",
  
  // 4. 卡片吉祥物 (左上角)
  mascot1: "https://drive.google.com/file/d/1BUuXbcVZexXoOK-Kic-Jdy-8LrlH_HWi/view?usp=drive_link",
  mascot2: "https://drive.google.com/file/d/1Jo-EP05_m7XtYllT29tQ2FNhKJiiSY-B/view?usp=drive_link",

  // 5. 卡片郵戳 (右上角)
  stamp1: "https://drive.google.com/file/d/1A7Zc3ZqsP3oJ528Jzq3D1SOt6T0Z0mLl/view?usp=drive_link",
  stamp2: "https://drive.google.com/file/d/1BS652qurVrAzMF21_7NdA9-fs9CLj2tW/view?usp=drive_link",

  // 6. 右下角三人成團吉祥物
  groupMascot: "https://drive.google.com/file/d/14Q2vRY9Entm6z7aH507IQhh9GUmSOty-/view?usp=drive_link",
  
  // 7. 按鈕圖示 (Icons)
  iconPlan: "https://drive.google.com/file/d/1YH6f9ksA-5VaXa_seCnnzdxZ1bZpO29z/view?usp=drive_link",
  iconAlbum: "https://drive.google.com/file/d/1gIIZ5F3Hb2G7sSiSSNLUxijSSdR9TapP/view?usp=drive_link",
  iconVlog: "https://drive.google.com/file/d/1RbE-fHvsqodQBBNw9ozPGaNYWcj0-TUD/view?usp=drive_link"
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
  image: string;     // 主要封面圖 (兼容舊資料)
  images?: string[]; // [NEW] 支援多張輪播圖片
  album: string;
  plan: string;
  vlog: string;
}

const allTrips: Trip[] = [
  { 
    year: 2025, season: "秋假", title: "日本東北", location: "日本 東北", status: "Done", type: "future", 
    image: "https://lh3.googleusercontent.com/pw/AP1GczMcbMORd3qssAAAygutlCGQGvpgnFJ3KBnO6yWZPet3L3Pv6nOtmcfgqDzlIbkB4aqRXNyK3FLwLabLpbg7b3GtsYkX_NOfYxrMDWzxwdq3enVw2FQqbsyPTt9le0xfFt7Cmwh2xJCwqreHk4kvVB90Gg=w1367-h911-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczMcbMORd3qssAAAygutlCGQGvpgnFJ3KBnO6yWZPet3L3Pv6nOtmcfgqDzlIbkB4aqRXNyK3FLwLabLpbg7b3GtsYkX_NOfYxrMDWzxwdq3enVw2FQqbsyPTt9le0xfFt7Cmwh2xJCwqreHk4kvVB90Gg=w1367-h911-s-no-gm?authuser=0",
        "https://lh3.googleusercontent.com/pw/AP1GczODjmS_gW43khZYdutZC57zearwSwMszt_XfUhy7cxbDbAcFRwHg4rwmo0IiV1nEXqGbcg843zDGoDoYgi-uE0ADLECT-S8zA5gVUnecy7i8u7N5EfozjGzgzSORANTF0WsxKC-0hq7sGvyhVNeu3-w_A=w1304-h869-s-no-gm?authuser=0", // Fixed: Added comma here
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
        "https://lh3.googleusercontent.com/pw/AP1GczPn3BVBzWeSz_V5w6MKhABjBOLhk5COrdbobL2ojgoxD1MrG_MnOjHNK7YGDEULxnqEKAbCLKWlvAMyKo_78o7lkuigJEKPkyLnhTGYHt3BEC9VdvEgvKuoVdwnVTWq-4pd1YYyvZ6yOuKFSurfCtuwhA=w1303-h869-s-no-gm?authuser=0", // 預留空間
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
        "" // 預留空間
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
        "" // 預留空間
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
        "" // 預留空間
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
        "" // 預留空間
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
        "" // 預留空間
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
        "" // 預留空間
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
        "" // 預留空間
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
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/H4HsyqcSfXYi9UW16",
    plan: "",
    vlog: ""
  },
  { 
    year: 2020, season: "春假", title: "台中薰衣草森林", location: "台灣 台中", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczPhREnlHCM8UJg1Rg52QkzsJNi7hK7NCdgKMvltsqeQJdKvkSHlTc6Y3TQM97UewCgI3CyEFQk-D3ANvuLRwUNur3VTsqOpzCezC4P-J476NTabFjliJrQHVBilEUYCmB9b11WwGCqw7Y8J3X0X83aRaQ=w960-h720-s-no-gm?authuser=0", // 空白
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczPhREnlHCM8UJg1Rg52QkzsJNi7hK7NCdgKMvltsqeQJdKvkSHlTc6Y3TQM97UewCgI3CyEFQk-D3ANvuLRwUNur3VTsqOpzCezC4P-J476NTabFjliJrQHVBilEUYCmB9b11WwGCqw7Y8J3X0X83aRaQ=w960-h720-s-no-gm?authuser=0", // 空白
        "" // 預留空間
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
        "" // 預留空間
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
        "" // 預留空間
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
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/Qui7FURUHiCYfZ7B6",
    plan: "",
    vlog: ""
  },
  { 
    year: 2018, season: "秋假", title: "薄荷島", location: "菲律賓 薄荷島", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczNEnT1ehdcVZHZnDFnepYVonSsp7PiUHYMJbguR-RU9lsvV3jGyuoNl0W7iikhg10yTRXlARhqXVIVjt-Cz-D5wxwAsWD0mF3t8152_0fDu3hzl9Uzns7bTcHJQNEJBAa3atLBLiqVMzmCKH7ObQ3Wjhw=w651-h869-s-no-gm?authuser=0",
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczNEnT1ehdcVZHZnDFnepYVonSsp7PiUHYMJbguR-RU9lsvV3jGyuoNl0W7iikhg10yTRXlARhqXVIVjt-Cz-D5wxwAsWD0mF3t8152_0fDu3hzl9Uzns7bTcHJQNEJBAa3atLBLiqVMzmCKH7ObQ3Wjhw=w651-h869-s-no-gm?authuser=0",
        "" // 預留空間
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
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/6RT3wDj3LRJrLQjK7",
    plan: "",
    vlog: ""
  },
  { 
    year: 2017, season: "10月", title: "日本九州", location: "日本 九州", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczNw2V4r-AZlrxXikyE8f-ydCdR-fQpfTazFARMpZAQb9NyqOJEumziV29fkdw0DZufBYHPMcmDHwcOpWxjlmnMlzV2BzWAtqbBPZot8HSCrAT5nBtygTYjhP41aNzeT-zy_Ixv0emZquRPBf1S2R1IzGA=w960-h720-s-no-gm?authuser=0", // 空白
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczNw2V4r-AZlrxXikyE8f-ydCdR-fQpfTazFARMpZAQb9NyqOJEumziV29fkdw0DZufBYHPMcmDHwcOpWxjlmnMlzV2BzWAtqbBPZot8HSCrAT5nBtygTYjhP41aNzeT-zy_Ixv0emZquRPBf1S2R1IzGA=w960-h720-s-no-gm?authuser=0", // 空白
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/6PFYDGzFEp7fkHem7",
    plan: "",
    vlog: ""
  },
  { 
    year: 2017, season: "228連假", title: "泰國曼谷", location: "泰國 曼谷", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczMqonmhIgRP57SEtQU1uxFweQbS6gJjv0dy-ZpmVlEIWmMXY3wmgj4_TzsDFCBYTXWB2mwP8-3t6Y6bJ_2-3aGJf0-wGsU_sDx1vR6TsQP8BejYT_DubWfPW1KxC48v8ZYK8mFCaG382gNwKH7cn2zXRg=w1298-h869-s-no-gm?authuser=0", // 空白
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczMqonmhIgRP57SEtQU1uxFweQbS6gJjv0dy-ZpmVlEIWmMXY3wmgj4_TzsDFCBYTXWB2mwP8-3t6Y6bJ_2-3aGJf0-wGsU_sDx1vR6TsQP8BejYT_DubWfPW1KxC48v8ZYK8mFCaG382gNwKH7cn2zXRg=w1298-h869-s-no-gm?authuser=0", // 空白
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/o4vCZhmEFurrUcGV8",
    plan: "",
    vlog: ""
  },
  { 
    year: 2016, season: "12月", title: "泰國普吉島", location: "泰國 普吉島", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczMhhy_tboy1m7o-aLb7_bxVGK14AxIPmVCmz8o-9BFAt3r_Oi1VgFJ8Z0yMC3e-KS9jr1V7lDhjx771AK59RSHNIp0W4DPFZjZ0FwDOq6qSBx0TPm5_X9qUYJD_BqD-AvMoBydvWA29kY-bMvrZnCHwJw=w1298-h869-s-no-gm?authuser=0", // 空白
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczMhhy_tboy1m7o-aLb7_bxVGK14AxIPmVCmz8o-9BFAt3r_Oi1VgFJ8Z0yMC3e-KS9jr1V7lDhjx771AK59RSHNIp0W4DPFZjZ0FwDOq6qSBx0TPm5_X9qUYJD_BqD-AvMoBydvWA29kY-bMvrZnCHwJw=w1298-h869-s-no-gm?authuser=0", // 空白
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/bgacpnskapAws9jf7",
    plan: "",
    vlog: ""
  },
  { 
    year: 2015, season: "10月", title: "菲律賓長灘島", location: "菲律賓 長灘島", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczP2-YWeZHX1KEDGC5XCjt9oqQm2iZo9Es3AmbJAB-xc9czoagV6o3iHURgCB4dBfwAqKuCiq2FSeoiRdldx-Vx9LYjGZmMyWHwomAfCSPqVpKBPPhcnvOJbBi8bhFTlEFFiMJJ3YnBE9kzwJsFFeZ1A1g=w1159-h869-s-no-gm?authuser=0", // 空白
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczP2-YWeZHX1KEDGC5XCjt9oqQm2iZo9Es3AmbJAB-xc9czoagV6o3iHURgCB4dBfwAqKuCiq2FSeoiRdldx-Vx9LYjGZmMyWHwomAfCSPqVpKBPPhcnvOJbBi8bhFTlEFFiMJJ3YnBE9kzwJsFFeZ1A1g=w1159-h869-s-no-gm?authuser=0", // 空白
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/nJ2vXrskDPPyaBp68",
    plan: "",
    vlog: ""
  },
  { 
    year: 2015, season: "7月", title: "日本沖繩", location: "日本 沖繩", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczPSNpysGxf-PY4Ci1_fEdAn1b7Lfq-a9Fhrw2nA1ePppSmbGIpVEaGkFHIgAS0EvRBrfHmMMEgFPl-M5_0KNlHV7gmH9o1t7Wv_VzNcaSiAoBIVyVUTarpfdhkp1N1vpzCh_PqrcaFo8d5747Lw49pvhQ=w651-h869-s-no-gm?authuser=0", // 空白
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczPSNpysGxf-PY4Ci1_fEdAn1b7Lfq-a9Fhrw2nA1ePppSmbGIpVEaGkFHIgAS0EvRBrfHmMMEgFPl-M5_0KNlHV7gmH9o1t7Wv_VzNcaSiAoBIVyVUTarpfdhkp1N1vpzCh_PqrcaFo8d5747Lw49pvhQ=w651-h869-s-no-gm?authuser=0", // 空白
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/3rPEuj87yJeaKGm69",
    plan: "",
    vlog: ""
  },
  { 
    year: 2015, season: "5月", title: "日本關西", location: "日本 關西", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczNIVwTZiGqboCln-rcM57PvfYkNEhhD6Ed0WBEUn1Cs0iFlbimJgeB41fSBczbXAZHwW7IbffpIHFMk_2ErT_I7gnhiwoqNWl_qeftdLFaXxUo52faqj_z-u1bYHF8SeEADcHoOr5jqg0xXQi6D7zCy0g=w1159-h869-s-no-gm?authuser=0", // 空白
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczNIVwTZiGqboCln-rcM57PvfYkNEhhD6Ed0WBEUn1Cs0iFlbimJgeB41fSBczbXAZHwW7IbffpIHFMk_2ErT_I7gnhiwoqNWl_qeftdLFaXxUo52faqj_z-u1bYHF8SeEADcHoOr5jqg0xXQi6D7zCy0g=w1159-h869-s-no-gm?authuser=0", // 空白
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/TFgis9BccSoP2VxJ7",
    plan: "",
    vlog: ""
  },
  { 
    year: 2014, season: "暑假", title: "韓國首爾", location: "韓國 首爾", status: "Done", type: "past",
    image: "https://lh3.googleusercontent.com/pw/AP1GczOFvT0MwE9z5-L3dCYqQTf8g-wEmyZ5ntyUPpw52loItuxZ3uXfYIvY7ybT3DPB4GJ7q-a1f0XzaAohanG_ghlMikM9H7vAXP6cIh7Cy2dRrTLfswklTKAkk_ttccbTfPCorUagdyY5p17fjH29Ky8JhA=w581-h869-s-no-gm?authuser=0", // 空白
    images: [
        "https://lh3.googleusercontent.com/pw/AP1GczOFvT0MwE9z5-L3dCYqQTf8g-wEmyZ5ntyUPpw52loItuxZ3uXfYIvY7ybT3DPB4GJ7q-a1f0XzaAohanG_ghlMikM9H7vAXP6cIh7Cy2dRrTLfswklTKAkk_ttccbTfPCorUagdyY5p17fjH29Ky8JhA=w581-h869-s-no-gm?authuser=0", // 空白
        "" // 預留空間
    ],
    album: "https://photos.app.goo.gl/w5g9ZzY2wkhnqV7j9",
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
// 🐕 吉祥物舉牌日期標籤 (Mascot Sign Label)
// ==========================================
// [Modified] Scaled up mascot image and container by approx 2x
const MascotLabel = ({ trip, index }: { trip: Trip, index: number }) => {
  
  // 交錯使用 Mascot 1 和 Mascot 2
  const mascotImg = index % 2 === 0 ? ASSETS.mascot1 : ASSETS.mascot2;

  return (
    // Container size increased from w-[100px] h-[100px] to w-[160px] h-[160px]
    // Position adjusted from -top-[52px] to -top-[80px]
    <div className="absolute -top-[80px] -left-[20px] z-30 group-hover:animate-bounce-slight origin-bottom-left w-[160px] h-[160px]">
        <div className="relative w-full h-full flex flex-col items-center justify-end">
            <img 
              src={resolveImage(mascotImg)} 
              alt="Mascot"
              // Image size increased from w-16 h-16 (64px) to w-32 h-32 (128px) - 2X size
              className="w-32 h-32 object-contain absolute bottom-[30px] left-[10px] z-10"
              style={{ transform: "rotate(-5deg)" }}
            />
            {/* Board also scaled slightly and repositioned to fit larger mascot */}
            <div 
              className="relative z-20 bg-[#fff9c4] border-2 border-[#d6c0ae] px-4 py-2 rounded-md shadow-md text-center min-w-[90px] -rotate-3 transform translate-y-4 translate-x-4"
              style={{ boxShadow: "3px 3px 0px rgba(0,0,0,0.1)" }}
            >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#d6c0ae] rounded-full opacity-50"></div>
                <span className="block text-xl font-black text-stone-600 font-['Patrick_Hand'] leading-none">
                    {trip.year}
                </span>
                <span className="block text-xs font-bold text-stone-400 uppercase tracking-widest leading-tight font-['Patrick_Hand'] mt-0.5">
                    {trip.season}
                </span>
            </div>
        </div>
    </div>
  );
};

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

// 📮 郵戳元件 (New: Image Based)
const PostalStamp = ({ status, index }: { status: string, index: number }) => {
    // 交錯使用 Stamp 1 和 Stamp 2
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
// 🐶 NEW: 旅行吉祥物元件 (右下角固定)
// ==========================================
const TravelMascot = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  return (
    <motion.div
      initial={{ x: 200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 80, 
        damping: 15, 
        delay: 1.5 // 稍微晚一點進場，像是在追趕行程
      }}
      className="fixed bottom-2 right-4 z-50 cursor-pointer group flex flex-col items-end"
      onClick={scrollToTop}
    >
      {/* 💭 對話氣泡 (Speech Bubble) */}
      <motion.div 
        initial={{ scale: 0, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 2.5, type: "spring" }}
        className="relative bg-white border-2 border-stone-800 rounded-2xl py-2 px-4 shadow-lg mb-1 mr-4 origin-bottom-right"
      >
          <span className="text-stone-800 font-black text-sm md:text-base whitespace-nowrap tracking-wider font-['Patrick_Hand'] flex items-center gap-1">
            林北三人成團 GO! 🚀
          </span>
          {/* Bubble Tail */}
          <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-b-2 border-r-2 border-stone-800 transform rotate-45"></div>
      </motion.div>

      {/* 🚙 吉祥物本體 (上下顛簸動畫) */}
      <motion.div
        animate={{ y: [0, -5, 0] }} // 模擬車子/走路的顛簸感 (Bobbing)
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative"
      >
        <motion.img 
          whileHover={{ 
            scale: 1.1, 
            rotate: -10, // 歪頭
            transition: { type: "spring", stiffness: 300 } 
          }}
          src={resolveImage(ASSETS.groupMascot)} 
          alt="Group Mascot" 
          className="w-32 h-auto md:w-40 drop-shadow-2xl hover:brightness-110 transition-all"
        />
        
        {/* Hover Hint: Back to Top Arrow */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-yellow-400/90 text-white rounded-full p-2 shadow-sm animate-bounce">
                <ArrowUp size={20} strokeWidth={3} />
            </div>
        </div>
      </motion.div>
    </motion.div>
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
// 🎴 單一卡片元件 (Handle Flip State Here)
// ==========================================
const TripCard = ({ trip, index }: { trip: Trip, index: number }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const randomRotate = (index % 5) - 2;

  // 1. [NEW] Images Logic (Slideshow)
  // 如果 trip.images 存在就用它，否則就用單張的 trip.image
  // 過濾掉空字串，避免輪播到空白圖片
  const validImages = trip.images ? trip.images.filter(img => img && img.trim() !== "") : [];
  const displayImages = validImages.length > 0 ? validImages : [trip.image];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 2. [NEW] Auto-cycle slideshow effect if multiple images exist
  useEffect(() => {
    if (displayImages.length <= 1) return;
    
    const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [displayImages.length]);

  // 點擊翻轉處理
  const handleFlip = (e: React.MouseEvent) => {
     // 如果點擊的是連結(按鈕)，不要翻轉
     if ((e.target as HTMLElement).closest('a')) return;
     setIsFlipped(!isFlipped);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, rotate: randomRotate }}
      whileInView={{ opacity: 1, y: 0, rotate: randomRotate }}
      whileHover={{ y: -5, rotate: 0, zIndex: 10 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index % 3 * 0.1 }}
      // Increased height to h-[32rem] to accommodate larger buttons
      className="group relative w-full h-[32rem] card-perspective cursor-pointer"
      onClick={handleFlip}
    >
      {/* 裝飾性元素 (不會跟著翻轉) */}
      <CuteWashiTape index={index} />
      
      {/* 吉祥物標籤 (交錯顯示) */}
      <MascotLabel trip={trip} index={index} />

      {/* 翻轉容器 (CSS class + Style Control) */}
      <div 
          className="card-inner relative w-full h-full transition-all duration-700 ease-in-out"
          style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
          
          {/* ========= 正面 (FRONT) ========= */}
          <div className="card-front absolute inset-0 bg-white p-3 shadow-md border border-stone-200 flex flex-col">
              {/* 照片區域 */}
              <div className="w-full h-[85%] bg-stone-100 overflow-hidden relative border border-stone-100 group-hover:border-stone-300 transition-colors">
                   
                   {/* [NEW] Photo Logic: Slideshow or Ken Burns Single Image */}
                   <AnimatePresence mode="popLayout">
                      {displayImages[0] ? (
                          <motion.img 
                              key={currentImageIndex} // Key change triggers animation
                              src={resolveImage(displayImages[currentImageIndex])} 
                              alt={trip.title} 
                              className="absolute inset-0 w-full h-full object-contain bg-stone-200" // Modified: object-contain + bg
                              referrerPolicy="no-referrer"
                              
                              // [NEW] Ken Burns Effect (Slow Zoom) & Crossfade
                              initial={{ opacity: 0, scale: 1 }}
                              animate={{ opacity: 1, scale: 1.1 }}
                              exit={{ opacity: 0 }}
                              transition={{ 
                                  opacity: { duration: 1 }, // Crossfade duration
                                  scale: { duration: 20, ease: "linear" } // Slow zoom over 20s
                              }}
                          />
                       ) : (
                          // Placeholder if NO image at all
                          <div className="w-full h-full flex flex-col items-center justify-center bg-stone-50 text-stone-300 relative overflow-hidden">
                              <div className="absolute inset-0 opacity-30" style={{backgroundImage: `url(${ASSETS.paper})`}}></div>
                              <div className="relative z-10 w-[80%] h-[70%] border-2 border-dashed border-stone-300 rounded-lg flex flex-col items-center justify-center gap-3 bg-white/50 backdrop-blur-sm">
                                  <Camera size={40} className="text-stone-300/80" />
                                  <span className="text-sm font-bold tracking-widest text-stone-400 font-['Patrick_Hand']">正在挑選照片中...</span>
                              </div>
                          </div>
                       )}
                   </AnimatePresence>
                   
                   {/* 郵戳 (New: 交錯顯示) */}
                   <PostalStamp status={trip.status} index={index} />
              </div>
              
              {/* 地點紙膠帶 */}
              <LocationTapeLabel location={trip.location} index={index} />
              
              {/* 翻轉提示 (Flip Hint) - 顯眼設計 (左下角) - 常駐顯示 */}
              <div className="absolute bottom-2 left-3 z-20">
                  <div className="flex items-center gap-1.5 text-rose-500 font-black tracking-widest font-['Patrick_Hand'] bg-rose-50 px-3 py-1.5 rounded-lg border-2 border-rose-200 shadow-md">
                      <RotateCw size={14} className="animate-spin" style={{ animationDuration: '3s' }} />
                      <span className="text-xs">點擊翻面</span>
                  </div>
              </div>
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

                  {/* 質感按鈕區 */}
                  <div className="w-full flex flex-col gap-4 px-2">
                      {/* PLAN BUTTON */}
                      <a 
                          href={trip.plan || "#"} 
                          target={trip.plan ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          // Increased padding (py-3) to handle larger icons
                          className={`relative flex items-center justify-between px-4 py-3 border-2 border-dashed rounded-lg transition-all group/btn ${
                              trip.plan 
                              ? "border-blue-300 bg-white text-stone-600 hover:bg-blue-50" 
                              : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                          }`}
                          onClick={(e) => !trip.plan && e.preventDefault()}
                      >
                          <div className="flex items-center gap-4">
                              {/* Left Icon: Scaled to w-20 h-20 (approx 80px, 3x original) */}
                              <img 
                                src={resolveImage(ASSETS.iconPlan)} 
                                alt="Plan" 
                                className={`w-20 h-20 object-contain ${trip.plan ? "" : "grayscale opacity-50"}`}
                              />
                              {/* Middle Text: Increased to text-xl */}
                              <span className="text-xl font-black tracking-widest">
                                  {trip.plan ? "旅行計畫" : "計畫撰寫中..."}
                              </span>
                          </div>
                          {/* Right Icon: Scaled to size={40} (approx 2x original) */}
                          <Dog size={40} className={`transform group-hover/btn:rotate-12 transition-transform ${trip.plan ? "text-stone-400" : "text-stone-200"}`} />
                      </a>
                      
                      {/* ALBUM BUTTON */}
                      <a 
                          href={trip.album || "#"} 
                          target={trip.album ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`relative flex items-center justify-between px-4 py-3 border-2 border-dashed rounded-lg transition-all group/btn ${
                              trip.album 
                              ? "border-amber-300 bg-white text-stone-600 hover:bg-amber-50" 
                              : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                          }`}
                          onClick={(e) => !trip.album && e.preventDefault()}
                      >
                          <div className="flex items-center gap-4">
                              {/* Left Icon: Scaled to w-20 h-20 */}
                              <img 
                                src={resolveImage(ASSETS.iconAlbum)} 
                                alt="Album" 
                                className={`w-20 h-20 object-contain ${trip.album ? "" : "grayscale opacity-50"}`}
                              />
                              {/* Middle Text: Increased to text-xl */}
                              <span className="text-xl font-black tracking-widest">
                                  {trip.album ? "相簿" : "照片整理中..."}
                              </span>
                          </div>
                          {/* Right Icon: Scaled to size={40} */}
                          <Cat size={40} className={`transform group-hover/btn:-rotate-12 transition-transform ${trip.album ? "text-stone-400" : "text-stone-200"}`} />
                      </a>

                      {/* VLOG BUTTON */}
                      <a 
                          href={trip.vlog || "#"} 
                          target={trip.vlog ? "_blank" : "_self"}
                          rel="noopener noreferrer"
                          className={`relative flex items-center justify-between px-4 py-3 border-2 border-dashed rounded-lg transition-all group/btn ${
                              trip.vlog 
                              ? "border-red-300 bg-white text-stone-600 hover:bg-red-50" 
                              : "border-stone-200 bg-stone-50 text-stone-400 cursor-not-allowed"
                          }`}
                          onClick={(e) => !trip.vlog && e.preventDefault()}
                      >
                          <div className="flex items-center gap-4">
                              {/* Left Icon: Scaled to w-20 h-20 */}
                              <img 
                                src={resolveImage(ASSETS.iconVlog)} 
                                alt="Vlog" 
                                className={`w-20 h-20 object-contain ${trip.vlog ? "" : "grayscale opacity-50"}`}
                              />
                              {/* Middle Text: Increased to text-xl */}
                              <span className="text-xl font-black tracking-widest">
                                  {trip.vlog ? "旅遊影片" : "影片剪輯中..."}
                              </span>
                          </div>
                          {/* Right Icon: Scaled to size={40} */}
                          <PawPrint size={40} className={`transform group-hover/btn:scale-110 transition-transform ${trip.vlog ? "text-stone-400" : "text-stone-200"}`} />
                      </a>
                  </div>
              </div>
          </div>

      </div>
    </motion.div>
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
        /* Removed hover flip rule to support click flip */
        
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
      
      {/* 🐶 新增：右下角吉祥物 (Travel Mascot) */}
      <TravelMascot />

      {/* Header (Changed to Center Layout with New Logo) */}
      <header className="relative pt-10 pb-12 px-6 text-center z-10 max-w-6xl mx-auto">
        
        <div className="flex flex-col items-center justify-center w-full mt-4 relative z-10">
            
            {/* New Main Theme Logo */}
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

            {/* Subtitle Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }} 
              className="relative"
            >
                <div className="h-1 w-16 bg-orange-400 mb-4 rounded-full mx-auto"></div>
                <p className="text-xl md:text-2xl text-stone-500 leading-relaxed font-bold tracking-wide">
                    從 2012 到 2025<br/>
                    收集世界的角落，紀錄我們一起長大的時光。
                </p>
            </motion.div>

        </div>
      </header>

      {/* Main Content: Trip Cards */}
      <main className="max-w-6xl mx-auto px-6 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {allTrips.map((trip, index) => (
            <TripCard key={index} trip={trip} index={index} />
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