import React from 'react';
import { Map, Plane, ArrowRight, Globe, Camera, Coffee } from 'lucide-react';

const Portal = () => {
  // ✈️ 您的旅遊計畫資料庫
  // 以後有新旅遊，只要複製一段 {...}, 貼在下面並修改內容即可
  const trips = [
    {
      id: 1,
      title: '貓貓吉伊卡哇峇里島療癒行',
      date: '2025.04.25 - 05.03',
      tag: 'Mission Complete',
      tagColor: 'bg-green-500',
      desc: '海灘、夕陽與無所事事的奢華廢人生活。跟著貓貓與吉伊卡哇一起躺平。',
      image:
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=1000',
      // 👇 請注意！這裡要換成您剛剛做好的那個 Vercel 網址
      link: 'https://myfirststack-cl3zufldc-littlebaus-projects.vercel.app/',
    },
    {
      id: 2,
      title: '東京暴食極限挑戰 (範例)',
      date: 'Coming Soon',
      tag: 'Planning',
      tagColor: 'bg-yellow-500',
      desc: '從築地吃到新宿，三天胖五公斤的計畫。目標是吃遍所有拉麵名店。',
      image:
        'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=1000',
      link: '#', // 還沒做好的話就先放 #
    },
    {
      id: 3,
      title: '冰島極光追逐戰 (範例)',
      date: 'Future Plan',
      tag: 'Dreaming',
      tagColor: 'bg-blue-500',
      desc: '開著露營車環島，在寒風中等待歐若拉女神的降臨。',
      image:
        'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&q=80&w=1000',
      link: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans selection:bg-yellow-500 selection:text-black">
      {/* Hero Section: 霸氣的標題區 */}
      <header className="relative py-24 px-6 text-center overflow-hidden border-b border-neutral-800">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-800 border border-neutral-700 text-yellow-500 mb-8 animate-pulse">
            <Globe size={16} />
            <span className="text-sm font-bold tracking-widest uppercase">
              Travel Portal
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 text-white">
            林北三人成團<span className="text-yellow-500">.</span>
          </h1>

          <p className="text-neutral-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            這不是旅行社，這是我們的青春回憶錄。
            <br />
            紀錄每一次「說走就走」的瘋狂旅程，從這裡出發。
          </p>
        </div>
      </header>

      {/* Grid Section: 旅遊卡片區 */}
      <main className="max-w-7xl mx-auto py-20 px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trips.map((trip) => (
            <a
              key={trip.id}
              href={trip.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-700 hover:border-yellow-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-yellow-500/10"
            >
              {/* Image Container */}
              <div className="h-64 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent z-10 opacity-80"></div>

                {/* Status Badge */}
                <div
                  className={`absolute top-4 right-4 z-20 ${trip.tagColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}
                >
                  {trip.tag}
                </div>

                <img
                  src={trip.image}
                  alt={trip.title}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
              </div>

              {/* Text Content */}
              <div className="p-8 relative z-20 -mt-12">
                <div className="flex items-center gap-2 text-yellow-500 text-sm font-bold mb-3 uppercase tracking-wider">
                  <Plane size={16} />
                  {trip.date}
                </div>

                <h2 className="text-2xl font-bold mb-3 text-white group-hover:text-yellow-400 transition-colors">
                  {trip.title}
                </h2>

                <p className="text-neutral-400 mb-6 leading-relaxed line-clamp-2">
                  {trip.desc}
                </p>

                <div className="flex items-center text-sm font-bold text-white group-hover:gap-3 transition-all">
                  查看計畫{' '}
                  <ArrowRight size={16} className="ml-2 text-yellow-500" />
                </div>
              </div>
            </a>
          ))}

          {/* New Trip Placeholder (虛線框，暗示未來) */}
          <div className="border-2 border-dashed border-neutral-700 rounded-2xl flex flex-col items-center justify-center p-10 text-neutral-600 hover:border-neutral-500 hover:text-neutral-400 transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">下一次去哪裡？</h3>
            <p className="text-sm">期待新的冒險...</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center text-neutral-600 text-sm border-t border-neutral-800 bg-neutral-900">
        <div className="flex justify-center gap-4 mb-4">
          <Coffee
            size={20}
            className="hover:text-yellow-500 transition-colors cursor-pointer"
          />
          <Camera
            size={20}
            className="hover:text-yellow-500 transition-colors cursor-pointer"
          />
        </div>
        <p>© 2025 林北三人成團 Project. Built with React & Vercel.</p>
      </footer>
    </div>
  );
};

export default Portal;
