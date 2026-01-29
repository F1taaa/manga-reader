'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookMarked,
  Search,
  Menu,
  X,
  Moon,
  Sun,
  Home,
  Compass,
  Library,
  History
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

export function Navigation() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse', href: '/search', icon: Compass },
    { name: 'Library', href: '#', icon: Library },
    { name: 'History', href: '#', icon: History },
  ];

  if (!mounted) return null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm py-2"
          : "bg-transparent py-4"
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
            <BookMarked className="h-5 w-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tighter hidden sm:inline-block bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            MANGA<span className="text-primary">HUB</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}>
              <Button variant="ghost" size="sm" className="gap-2 font-medium">
                <link.icon className="h-4 w-4" />
                {link.name}
              </Button>
            </Link>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
              <Search className="h-4 w-4" />
            </div>
            <Input
              type="search"
              placeholder="Search your favorite manga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-muted/50 border-transparent focus:bg-background focus:border-primary/30 transition-all rounded-full"
            />
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Button size="sm" className="hidden sm:flex rounded-full px-5 shadow-primary/20">
            Sign In
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="container px-4 py-6 flex flex-col gap-4">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </form>
              <div className="grid grid-cols-2 gap-2">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-start gap-3 h-12 rounded-xl">
                      <link.icon className="h-5 w-5 text-primary" />
                      {link.name}
                    </Button>
                  </Link>
                ))}
              </div>
              <Button className="w-full h-12 rounded-xl shadow-lg">
                Sign In
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
