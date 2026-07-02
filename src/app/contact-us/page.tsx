"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  Clock 
} from "lucide-react";

import { useSubmitContactMutation } from "@/hooks/api/publicAPIs";

export default function ContactUsPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const submitContact = useSubmitContactMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const message = form.phone.trim()
      ? `Phone: ${form.phone.trim()}\n\n${form.message.trim()}`
      : form.message.trim();

    submitContact.mutate(
      {
        name: form.name.trim(),
        email: form.email.trim(),
        message,
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          setForm({ name: "", email: "", phone: "", message: "" });
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-stone-900/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/30 group-hover:shadow-emerald-500/30 transition-shadow">
              <img src="/logo.png" alt="Karnataka Hikes" className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Karnataka Hikes</h1>
              <p className="text-emerald-400 text-[9px] uppercase tracking-[0.2em] font-semibold">Treks & Adventures</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-sm text-stone-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">Home</Link>
            <Link href="/about-us" className="px-4 py-2 text-sm text-stone-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">About Us</Link>
            <Link href="/contact-us" className="px-4 py-2 text-sm font-medium text-white bg-white/10 rounded-lg">Contact Us</Link>
          </nav>
        </div>
      </header>

      <section className="relative min-h-[50vh] flex items-center overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-20 w-64 h-64 bg-teal-500/8 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-20 text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-medium">We'd Love to Hear From You</span>
          </div>
          <h2 className="animate-fade-up-delay-1 text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            Let's plan your<br /><span className="text-gradient">next adventure</span>
          </h2>
          <p className="animate-fade-up-delay-2 text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Have a question about a trek? Want to book a private group? Drop us a message and we'll get back to you within 24 hours.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-stone-50 to-transparent" />
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-10 relative z-10 pb-20">
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Mail, title: "Email Us", info: "info@karnatakahikes.com", sub: "We reply within 24h", color: "emerald" },
            { icon: Phone, title: "Call Us", info: "+91 98765 43210", sub: "Mon-Sat, 9am-6pm", color: "blue" },
            { icon: MapPin, title: "Visit Us", info: "Bengaluru, Karnataka", sub: "India", color: "purple" },
          ].map((item, i) => (
            <div key={item.title} className="stat-card rounded-2xl p-6 shadow-lg shadow-stone-200/50 border border-stone-100 animate-fade-up" style={{ animationDelay: `${0.1 * i}s` }}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                item.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
                item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-stone-900 mb-1">{item.title}</h4>
              <p className="text-stone-700 text-sm font-medium">{item.info}</p>
              <p className="text-stone-400 text-xs mt-1">{item.sub}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden">
          <div className="grid md:grid-cols-5">
            <div className="md:col-span-2 hero-gradient p-8 md:p-10 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-10" />
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="relative">
                <h3 className="text-2xl font-extrabold mb-3">Get in Touch</h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-8">
                  Fill out the form and our team will get back to you within 24 hours. We'd love to help you plan your perfect trek.
                </p>
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Quick Response</p>
                      <p className="text-stone-500 text-xs">Within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Custom Treks</p>
                      <p className="text-stone-500 text-xs">Private groups available</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:col-span-3 p-8 md:p-10">
              {submitted ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-stone-900 mb-2">Thank You!</h3>
                  <p className="text-stone-500 mb-8 max-w-sm mx-auto">We've received your message and will get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="btn-primary px-6 py-3 rounded-xl text-white text-sm font-semibold">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-extrabold text-stone-900 mb-6">Send us a Message</h3>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Name *</label>
                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-stone-50/50 hover:border-stone-300 transition-colors" placeholder="Your name" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email *</label>
                        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-stone-50/50 hover:border-stone-300 transition-colors" placeholder="you@example.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1.5">Phone</label>
                      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-stone-50/50 hover:border-stone-300 transition-colors" placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-stone-700 mb-1.5">Message *</label>
                      <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-stone-50/50 hover:border-stone-300 transition-colors resize-none" placeholder="Tell us about the trek you're interested in, group size, preferred dates, or any questions..." />
                    </div>
                    <button
                      type="submit"
                      disabled={submitContact.isPending}
                      className="btn-primary flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold w-full sm:w-auto justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                      {submitContact.isPending ? "Sending…" : "Send Message"}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-stone-900 text-stone-400 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-linear-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                  <img src="/logo.png" alt="Karnataka Hikes" className="w-10 h-10" />
                </div>
                <div>
                  <span className="font-bold text-white text-lg">Karnataka Hikes</span>
                  <p className="text-stone-500 text-xs">Treks & Adventures</p>
                </div>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed">
                Curated treks and outdoor adventures across India.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/" className="block text-sm hover:text-emerald-400 transition-colors">Home</Link>
                <Link href="/about-us" className="block text-sm hover:text-emerald-400 transition-colors">About Us</Link>
                <Link href="/contact-us" className="block text-sm hover:text-emerald-400 transition-colors">Contact Us</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm">
                <p>info@karnatakahikes.com</p>
                <p>+91 98765 43210</p>
                <p>Bengaluru, Karnataka</p>
              </div>
            </div>
          </div>
          <div className="border-t border-stone-800 mt-12 pt-6 text-center text-sm text-stone-600">
            &copy; {new Date().getFullYear()} Karnataka Hikes. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
