'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut, LayoutDashboard, Briefcase, Globe } from 'lucide-react';
import { signOut } from '@/lib/auth';
import { toast } from 'sonner';

export default function Navbar() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const getDashboardLink = () => {
    if (!profile) return '/';
    switch (profile.role) {
      case 'worker':
        return '/worker/dashboard';
      case 'employer':
        return '/employer/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/';
    }
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-amber-600" />
              <span className="text-2xl font-bold text-[#1a1a14] font-serif">Sahayata</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2 px-3 rounded-full border-gray-300 hover:bg-gray-100">
                  <Globe className="h-4 w-4 text-gray-700" />
                  <span className="font-medium text-gray-700">English</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.success('Language set to English')}>
                  English (EN)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success('भाषा हिंदी में बदल गई है')}>
                  हिंदी (HI)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {user && profile ? (
              <>
                <Link href="/jobs">
                  <Button variant="default" className="rounded-full bg-amber-600 hover:bg-amber-700 text-white">
                    Browse Jobs
                  </Button>
                </Link>
                {profile.role === 'worker' && (
                  <Link href="/workers">
                    <Button variant={pathname === '/workers' ? 'default' : 'ghost'}>
                      Workers
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>{profile.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span className="font-semibold">{profile.name}</span>
                        <span className="text-xs text-gray-500 capitalize">
                          {profile.role}
                        </span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()} className="flex items-center cursor-pointer">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/complaints" className="flex items-center cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Complaints
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="cursor-pointer text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="rounded-full">Login</Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-full bg-gray-900 border border-gray-900 text-white hover:bg-gray-800">Sign Up</Button>
                </Link>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full border-gray-300 hover:bg-gray-100">
                  <Globe className="h-4 w-4 text-gray-700" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.success('Language set to English')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.success('भाषा हिंदी में बदल गई है')}>
                  हिंदी
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {user && profile ? (
                  <>
                    <DropdownMenuLabel>{profile.name}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/jobs">Browse Jobs</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/complaints">Complaints</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login">Login</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">Register</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
