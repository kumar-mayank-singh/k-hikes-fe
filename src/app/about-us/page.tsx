"use client";

import Link from "next/link";
import { Mountain, Users, MapPin, Star, Shield, Heart, Compass, TreePine, ArrowRight } from "lucide-react";

import { Footer } from "@/components/layout/Footer";
import { NavBar } from "@/components/layout/NavBar";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <NavBar activePath="/about-us" />

      <section className="relative min-h-[60vh] flex items-center overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-20 right-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-500/8 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <Heart className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">Our Story</span>
          </div>
          <h2 className="animate-fade-up-delay-1 text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Passionate about the<br /><span className="text-gradient">great outdoors</span>
          </h2>
          <p className="animate-fade-up-delay-2 text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
            We're a team of nature lovers, trail runners, and mountain seekers committed to making outdoor adventures accessible to everyone.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-stone-50 to-transparent" />
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid md:grid-cols-4 gap-4 mb-20">
          {[
            { value: "50+", label: "Trails", icon: MapPin, color: "emerald" },
            { value: "5000+", label: "Trekkers", icon: Users, color: "blue" },
            { value: "4.9", label: "Rating", icon: Star, color: "amber" },
            { value: "100%", label: "Safe Treks", icon: Shield, color: "purple" },
          ].map((stat, i) => (
            <div key={stat.label} className="stat-card rounded-2xl p-6 text-center shadow-lg shadow-stone-200/50 border border-stone-100 animate-fade-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                stat.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-extrabold text-stone-900">{stat.value}</p>
              <p className="text-stone-500 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-4">
                <Compass className="w-3.5 h-3.5" /> How It Started
              </div>
              <h3 className="text-3xl font-extrabold text-stone-900 mb-4 leading-tight">From weekend hikes to a <span className="text-gradient">community</span></h3>
              <p className="text-stone-600 leading-relaxed mb-4">
                Karnataka Hikes was born from a simple love for the outdoors. What started as a group of friends exploring trails in the Western Ghats has grown into a vibrant community of adventure seekers who believe that nature has the power to transform lives.
              </p>
              <p className="text-stone-600 leading-relaxed">
                We organize treks, hikes, and outdoor experiences across India — from the misty peaks of the Sahyadris to the rugged trails of the Himalayas. Every trek is carefully planned by our experienced team to ensure safety, fun, and a deep connection with nature.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700 p-1">
                <div className="w-full h-full rounded-3xl bg-linear-to-br from-emerald-600 to-teal-800 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  <div className="text-center relative z-10 px-8">
                    <TreePine className="w-20 h-20 text-emerald-300/40 mx-auto mb-4" />
                    <p className="text-emerald-100 text-2xl font-extrabold mb-2">Since 2020</p>
                    <p className="text-emerald-200/60 text-sm">Making outdoor adventures accessible & memorable</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 glass rounded-2xl px-4 py-3 animate-float">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span className="text-white text-sm font-semibold">Loved by 5000+ trekkers</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-extrabold text-stone-900 mb-3">Why choose <span className="text-gradient">Karnataka Hikes</span></h3>
            <p className="text-stone-500 max-w-lg mx-auto">We go above and beyond to make every trek a memorable experience.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Safety First", desc: "Every trek is led by certified guides with extensive knowledge of the terrain and emergency protocols.", color: "emerald" },
              { icon: Users, title: "Small Groups", desc: "We keep group sizes manageable for a personalized experience and minimal environmental impact.", color: "blue" },
              { icon: Heart, title: "Community", desc: "Join a community of like-minded adventurers. Make friends, share stories, and create lasting bonds.", color: "rose" },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100 card-hover group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white' :
                  item.color === 'blue' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white' :
                  'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                } transition-all duration-300`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-stone-900 text-lg mb-2">{item.title}</h4>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl hero-gradient mb-20">
          <div className="absolute inset-0 bg-grid opacity-20" />
          <div className="absolute top-10 right-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="relative px-8 md:px-16 py-16 text-center">
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Our Mission</h3>
            <p className="text-stone-300 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              To inspire people to step outside, explore the beauty of nature, and build a community of responsible and passionate outdoor enthusiasts. We believe every trek is a journey — not just through the mountains, but within yourself.
            </p>
            <Link href="/contact-us" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-semibold">
              Start Your Journey <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
