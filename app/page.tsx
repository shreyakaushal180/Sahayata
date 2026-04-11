'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChefHat, Sparkles, Wrench, Zap, Baby, HardHat, User, Briefcase, ArrowRight, ArrowLeft, Leaf, Paintbrush, Hammer } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const CATEGORIES = [
  { name: 'Cooking', icon: ChefHat, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=500&fit=crop', id: 'cooking', color: 'from-orange-500/80' },
  { name: 'Cleaning', icon: Sparkles, image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=500&fit=crop', id: 'cleaning', color: 'from-rose-500/80' },
  { name: 'Plumbing', icon: Wrench, image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=500&fit=crop', id: 'plumbing', color: 'from-green-500/80' },
  { name: 'Electrical', icon: Zap, image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=500&fit=crop', id: 'electrical', color: 'from-yellow-500/80' },
  { name: 'Nanny', icon: Baby, image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=500&fit=crop', id: 'nanny', color: 'from-purple-500/80' },
  { name: 'Construction', icon: HardHat, image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=500&fit=crop', id: 'construction', color: 'from-amber-500/80' },
  { name: 'Gardening', icon: Leaf, image: 'https://images.unsplash.com/photo-1599629954294-16b954af2e78?w=400&h=500&fit=crop', id: 'gardening', color: 'from-emerald-500/80' },
  { name: 'Painting', icon: Paintbrush, image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=500&fit=crop', id: 'painting', color: 'from-blue-500/80' },
  { name: 'Repairing', icon: Hammer, image: 'https://images.unsplash.com/photo-1581141849291-1125c7b692b5?w=400&h=500&fit=crop', id: 'repairing', color: 'from-slate-500/80' },
];


export default function Home() {
  const { profile } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current && !isHovered) {
        const { scrollLeft, clientWidth, scrollWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 304, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const scrollManual = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -304 : 304,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f5f2]">

      {/* ── HERO ── */}
      <div className="px-4 mt-8">
        <section
          className="relative overflow-hidden bg-[#1a1a14] flex flex-col items-center justify-center text-center px-4 pt-28 pb-52 rounded-[2.5rem] max-w-[96%] xl:max-w-7xl mx-auto shadow-2xl"
          style={{
            backgroundImage: `
              radial-gradient(ellipse 80% 60% at 50% -10%, rgba(217,162,76,0.18) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 80% 110%, rgba(217,100,50,0.12) 0%, transparent 60%)
            `
          }}
        >
          {/* Subtle grain texture overlay */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none rounded-[2.5rem]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px'
            }}
          />

          {/* Floating orb accents */}
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-orange-400/5 blur-3xl pointer-events-none" />

          <div
            className={`max-w-4xl mx-auto space-y-8 z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-[#f5f0e8] leading-tight flex flex-col gap-1">
              <span className="block">Daily work.</span>
              <span className="block text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(90deg, #d4a44c, #e8c878, #d4a44c)', backgroundSize: '200% auto', animation: 'shimmer 3s linear infinite' }}>
                Skilled hands.
              </span>
              <span className="block">Real pay.</span>
            </h1>

            <p className="text-lg md:text-2xl text-[#a3a39e] max-w-2xl mx-auto font-medium tracking-wide">
              Sahayata connects local workers with employers across India
            </p>

          </div>
        </section>
      </div>

      {/* Shimmer keyframe */}
      <style>{`
        @keyframes shimmer { 0%{ background-position:200% center } 100%{ background-position:-200% center } }
        @keyframes fadeUp { from{ opacity:0; transform:translateY(24px) } to{ opacity:1; transform:translateY(0) } }
        .fade-up { animation: fadeUp 0.5s ease both; }
      `}</style>

      {/* ── ROLE CARDS ── */}
      <section className="relative z-20 -mt-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">

          {/* LEFT CARD */}
          {profile?.role === 'worker' ? (
            <div
              className="group bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
              onTouchStart={() => setActiveCard('left')}
              onTouchEnd={() => setActiveCard(null)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]" />
              <div className="relative z-10">
                <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Hi, {profile?.name || 'Worker'}! 👋</h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Welcome back. Check your applications and find new opportunities.
                </p>
                <Link href="/worker/dashboard">
                  <Button className="w-full sm:w-auto rounded-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-8 h-14 text-lg font-medium shadow-md transition-all duration-200">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : profile?.role === 'employer' ? (
            <div
              className="group bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]" />
              <div className="relative z-10">
                <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Hi, {profile?.name || 'Employer'}! 👋</h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Welcome back. Manage your job postings and find the right workers.
                </p>
                <Link href="/employer/dashboard">
                  <Button className="w-full sm:w-auto rounded-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-8 h-14 text-lg font-medium shadow-md transition-all duration-200">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="group bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]" />
              <div className="relative z-10">
                <div className="h-14 w-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <User className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Find Daily Work</h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Join our community of skilled workers. Showcase your expertise, get hired instantly, and earn fair wages without middlemen.
                </p>
                <Link href="/register">
                  <Button className="w-full sm:w-auto rounded-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-8 h-14 text-lg font-medium shadow-md transition-all duration-200">
                    Register as Worker
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* RIGHT CARD */}
          {profile?.role === 'worker' ? (
            <div className="group bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]" />
              <div className="relative z-10">
                <div className="h-14 w-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">Your Profile</h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  Keep your skills, experience, and availability up to date to attract more employers.
                </p>
                <Link href="/worker/dashboard?tab=profile" className="flex-1 w-full block">
                  <Button className="w-full sm:w-auto rounded-full bg-[#1a1a14] hover:bg-black active:scale-95 text-white px-8 h-14 text-lg font-medium shadow-md transition-all duration-200">
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="group bg-white rounded-[2rem] p-8 sm:p-10 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-50/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[2rem]" />
              <div className="relative z-10">
                <div className="h-14 w-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Briefcase className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                  {profile?.role === 'employer' ? 'Post a New Job' : 'Hire Skilled Workers'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                  {profile?.role === 'employer'
                    ? 'Need more workers? Post a new job instantly to reach thousands of skilled professionals.'
                    : 'Find verified, professional workers for your specific needs. Post a job and hire the right match for your timeline.'}
                </p>
                <Link href="/employer/dashboard">
                  <Button className="w-full sm:w-auto rounded-full bg-[#1a1a14] hover:bg-black active:scale-95 text-white px-8 h-14 text-lg font-medium shadow-md transition-all duration-200">
                    Post a Job
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── BROWSE CATEGORIES ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full mt-4">
        <div className="flex justify-between items-end mb-10">
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-amber-600">
              DISCOVER EXPERTISE
            </h3>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900">
              Browse Categories
            </h2>
          </div>
          <div className="hidden md:flex space-x-3">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-300 h-12 w-12 hover:bg-gray-100 hover:border-amber-400 transition-all active:scale-95"
              onClick={() => scrollManual('left')}
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-300 h-12 w-12 hover:bg-gray-100 hover:border-amber-400 transition-all active:scale-95"
              onClick={() => scrollManual('right')}
            >
              <ArrowRight className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Horizontal scrollable row */}
        <div
          ref={scrollRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex overflow-x-auto pb-10 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const categoryHref = profile?.role === 'employer'
              ? `/employer/dashboard?tab=workers&category=${cat.name}`
              : `/jobs?category=${cat.name}`;

            return (
              <Link
                key={cat.id}
                href={categoryHref}
                className="snap-start shrink-0 group relative w-[280px] aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 active:scale-95"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient overlay — category-colored tint on hover */}
                <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-transparent to-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-400`} />
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-6">
                  <div className="flex items-center space-x-3 text-white transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="p-2.5 bg-white/25 backdrop-blur-md rounded-xl group-hover:bg-white/35 group-hover:scale-110 transition-all duration-300">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold tracking-wide font-serif">{cat.name}</span>
                  </div>
                  {/* Tap hint on mobile */}
                  <p className="text-white/50 text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Tap to explore →
                  </p>
                </div>
                {/* Glow ring on hover */}
                <div className="absolute inset-0 rounded-2xl ring-0 group-hover:ring-2 group-hover:ring-amber-400/50 transition-all duration-300" />
              </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}
