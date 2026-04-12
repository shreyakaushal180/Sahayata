import Link from 'next/link';
import { Briefcase, MessageSquare, HelpCircle, ShieldCheck, FileText, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#111110] text-white">

      {/* Vision Band */}
      <div className="border-b border-white/8 bg-[#1a1a14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-12">
            {/* Tag */}
            <div className="shrink-0">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber-500 border border-amber-500/30 rounded-full px-4 py-1.5 bg-amber-500/8">
                Our Vision
              </span>
            </div>
            {/* Quote */}
            <blockquote className="text-[#c9c4bc] text-base md:text-lg leading-relaxed font-medium italic max-w-3xl border-l-2 border-amber-500/50 pl-6">
              "Our vision is to create a transparent and accessible job marketplace where daily wage workers and employers can connect directly, without middlemen — ensuring fair opportunities and fair pay for every skilled hand."
            </blockquote>
          </div>
        </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-amber-600 rounded-xl flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold font-serif text-[#f5f0e8]">Sahayata</span>
            </div>
            <p className="text-[#8a8880] text-sm leading-relaxed max-w-sm">
              Connecting daily wage workers with employers across India for transparent, fair, and dignified work.
            </p>
            <p className="text-amber-500 text-sm font-semibold tracking-wide">
              Real work. Real pay. No middlemen.
            </p>
            <div className="flex gap-3 pt-1 flex-wrap">
              <Link href="/register" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-4 py-2 rounded-full transition-all">
                Join as Worker
              </Link>
              <Link href="/employer/dashboard" className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 active:scale-95 text-white px-4 py-2 rounded-full transition-all border border-white/10">
                Post a Job
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[#6b6b60]">Platform</h4>
            <ul className="space-y-3">
              {[
                { label: 'Browse Jobs', href: '/jobs' },
                { label: 'Find Workers', href: '/workers' },
                { label: 'Worker Dashboard', href: '/worker/dashboard' },
                { label: 'Employer Dashboard', href: '/employer/dashboard' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-[#a3a39e] hover:text-amber-400 text-sm transition-colors font-medium flex items-center gap-1.5 group">
                    {label}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support — Highlighted */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-amber-500">Support</h4>
            <div className="bg-white/5 border border-amber-500/20 rounded-2xl p-5 space-y-3">
              {[
                { label: 'Submit a Complaint', href: '/complaints', icon: MessageSquare },
                { label: 'FAQ', href: '/faq', icon: HelpCircle },
                { label: 'Privacy Policy', href: '/privacy', icon: ShieldCheck },
                { label: 'Terms of Service', href: '/terms', icon: FileText },
              ].map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-3 text-[#c9c4bc] hover:text-amber-400 text-sm font-medium transition-colors group"
                >
                  <div className="h-7 w-7 rounded-lg bg-white/8 group-hover:bg-amber-500/15 flex items-center justify-center transition-colors shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  {label}
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/8 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#4a4a46]">
          <p>© {new Date().getFullYear()} Sahayata. All rights reserved.</p>
          <p>Built with ❤️ for India's workers</p>
        </div>
      </div>

    </footer>
  );
}


//

