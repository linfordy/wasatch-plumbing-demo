"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { company } from "@/data/company";
import { trackPhoneClick } from "@/lib/gtag";

const serviceCategories = [
  {
    label: "RESIDENTIAL",
    items: [
      { name: "Residential Plumbing", href: "/services/residential-plumbing" },
      { name: "Water Heaters", href: "/services/water-heaters" },
      { name: "Tankless Water Heaters", href: "/services/tankless-water-heaters" },
      { name: "Drain Cleaning", href: "/services/drain-cleaning" },
    ],
  },
  {
    label: "COMMERCIAL",
    items: [
      { name: "Commercial Plumbing", href: "/services/commercial-plumbing" },
      { name: "Backflow Testing", href: "/services/backflow-testing" },
      { name: "Grease Trap Service", href: "/services/commercial-plumbing" },
    ],
  },
  {
    label: "EMERGENCY & SPECIALTY",
    items: [
      { name: "Emergency Plumbing (24/7)", href: "/services/emergency-plumbing" },
      { name: "Slab Leak Detection", href: "/services/residential-plumbing" },
      { name: "Trenchless Sewer Repair", href: "/services/drain-cleaning" },
      { name: "Hydro-Jetting", href: "/services/drain-cleaning" },
    ],
  },
];

const areaLinks = [
  { name: "South Jordan", href: "/service-areas/rockwall" },
  { name: "Riverton", href: "/service-areas/riverton" },
  { name: "Sandy", href: "/service-areas/sandy" },
  { name: "Draper", href: "/service-areas/draper" },
  { name: "Bluffdale", href: "/service-areas/bluffdale" },
  { name: "South Jordan", href: "/service-areas/south-jordan" },
  { name: "University Park", href: "/service-areas/university-park" },
];

const topNavLinks = [
  { label: "Services", key: "services" },
  { label: "Service Areas", key: "areas" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Specials", href: "/specials" },
];

export function Nav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileAreasOpen, setMobileAreasOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleMouseEnter = (key: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveMenu(key);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setActiveMenu(null), 200);
  };

  const closeAll = () => {
    setActiveMenu(null);
    setMobileOpen(false);
    setMobileServicesOpen(false);
    setMobileAreasOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 px-6 lg:px-10 transition-all duration-300 ${
        scrolled
          ? "bg-brand-black/95 backdrop-blur-lg shadow-[0_2px_20px_rgba(0,0,0,0.5)] py-3"
          : "py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo — cursive wordmark */}
        <Link href="/" className="flex items-center" onClick={closeAll}>
          <span
            className="text-white"
            style={{
              fontFamily: "'Kaushan Script', cursive",
              fontSize: "2rem",
              lineHeight: 1,
              letterSpacing: "0.5px",
            }}
          >
            Wasatch Plumbing
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {topNavLinks.map((link) =>
            "key" in link && link.key ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => handleMouseEnter(link.key!)}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors tracking-wide"
                >
                  {link.label}
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      activeMenu === link.key ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            ) : (
              <Link
                key={link.label}
                href={link.href!}
                className="text-sm text-gray-400 hover:text-white transition-colors tracking-wide"
              >
                {link.label}
              </Link>
            )
          )}
          <a
            href={`tel:${company.phoneRaw}`}
            onClick={trackPhoneClick}
            className="bg-brand-red text-white px-5 py-2.5 rounded-md text-sm font-bold tracking-wide shadow-[0_4px_20px_rgba(196,30,30,0.4)] hover:shadow-[0_8px_30px_rgba(196,30,30,0.6)] transition-all hover:-translate-y-0.5"
          >
            {company.phone}
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-white transition-transform ${
              mobileOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-opacity ${
              mobileOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-white transition-transform ${
              mobileOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* ===== DESKTOP MEGA MENUS ===== */}
      <AnimatePresence>
        {activeMenu === "services" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full pt-2"
            onMouseEnter={() => handleMouseEnter("services")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="w-[900px] bg-brand-dark border border-brand-darker rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(196,30,30,0.08)] ring-1 ring-white/5 overflow-hidden">
              <div className="flex">
                {/* Service Categories (3 columns) */}
                <div className="flex-1 grid grid-cols-3 gap-6 p-6">
                  {serviceCategories.map((category) => (
                    <div key={category.label}>
                      <h4
                        className="text-brand-red font-semibold text-xs uppercase mb-3"
                        style={{ letterSpacing: "2px" }}
                      >
                        {category.label}
                      </h4>
                      <ul className="space-y-1">
                        {category.items.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              onClick={closeAll}
                              className="block py-1.5 text-sm text-white/70 hover:text-brand-red transition-colors"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Right Sidebar — Featured Special */}
                <div className="w-[280px] bg-brand-dark/50 border-l border-white/10 p-6">
                  <h4
                    className="text-brand-red font-semibold text-xs uppercase mb-4"
                    style={{ letterSpacing: "2px" }}
                  >
                    CURRENT SPECIAL
                  </h4>
                  <Link
                    href="/specials"
                    onClick={closeAll}
                    className="group block"
                  >
                    <div className="relative h-[120px] bg-gradient-to-br from-[#1a0505] to-brand-dark rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                      <div className="absolute -top-1/2 -right-1/2 w-40 h-40 bg-brand-red/10 rounded-full blur-[30px]" />
                      <div className="relative text-center">
                        <div className="text-3xl font-black text-brand-red">$500</div>
                        <div className="text-xs text-white/60 mt-1">OFF TANKLESS</div>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-white group-hover:text-brand-red transition-colors">
                      Tankless Water Heater
                    </p>
                    <p className="text-xs text-white/50 mt-1">
                      Endless hot water, lower energy bills. Limited time.
                    </p>
                  </Link>
                </div>
              </div>

              {/* Emergency Banner */}
              <div className="mx-4 mb-4 px-4 py-3 bg-brand-red/10 border border-brand-red/20 rounded-xl">
                <Link
                  href="/services/emergency-plumbing"
                  onClick={closeAll}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-red" />
                    </span>
                    <span className="text-sm font-semibold text-white">
                      24/7 Emergency Plumbing Service
                    </span>
                    <span className="text-xs text-white/50">
                      — Call now for immediate response
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-brand-red"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {activeMenu === "areas" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="hidden lg:block absolute left-1/2 -translate-x-1/2 top-full pt-2"
            onMouseEnter={() => handleMouseEnter("areas")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="w-[480px] bg-brand-dark border border-brand-darker rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(196,30,30,0.08)] ring-1 ring-white/5 p-5">
              <h4
                className="text-brand-red font-semibold text-xs uppercase mb-3"
                style={{ letterSpacing: "2px" }}
              >
                SERVICE AREAS
              </h4>
              <div className="grid grid-cols-2 gap-1">
                {areaLinks.map((area) => (
                  <Link
                    key={area.name}
                    href={area.href}
                    onClick={closeAll}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:text-brand-red hover:bg-brand-darker/50 transition-colors"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red flex-shrink-0" />
                    {area.name}, TX
                  </Link>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/5">
                <p className="text-xs text-white/40 text-center">
                  Headquartered in South Jordan — serving all of Salt Lake Valley since 2018
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MOBILE MENU ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden mt-4 bg-brand-dark border border-brand-darker rounded-xl p-6 overflow-hidden"
          >
            {/* Services Accordion */}
            <div className="mb-4">
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className="flex items-center justify-between w-full text-white font-semibold text-base"
              >
                Services
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileServicesOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {mobileServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 ml-2 space-y-4">
                      {serviceCategories.map((category) => (
                        <div key={category.label}>
                          <h5
                            className="text-brand-red font-semibold text-xs uppercase mb-2"
                            style={{ letterSpacing: "1.5px" }}
                          >
                            {category.label}
                          </h5>
                          <div className="space-y-1.5 ml-2">
                            {category.items.map((item) => (
                              <Link
                                key={item.name}
                                href={item.href}
                                onClick={closeAll}
                                className="block text-sm text-gray-400 hover:text-white"
                              >
                                {item.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Service Areas Accordion */}
            <div className="mb-4">
              <button
                onClick={() => setMobileAreasOpen(!mobileAreasOpen)}
                className="flex items-center justify-between w-full text-white font-semibold text-base"
              >
                Service Areas
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileAreasOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {mobileAreasOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 ml-4 space-y-1.5">
                      {areaLinks.map((area) => (
                        <Link
                          key={area.name}
                          href={area.href}
                          onClick={closeAll}
                          className="block text-sm text-gray-400 hover:text-white"
                        >
                          {area.name}, TX
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Static Links */}
            <Link href="/about" onClick={closeAll} className="block mb-4 text-white font-semibold text-base">
              About
            </Link>
            <Link href="/blog" onClick={closeAll} className="block mb-4 text-white font-semibold text-base">
              Blog
            </Link>
            <Link href="/specials" onClick={closeAll} className="block mb-4 text-white font-semibold text-base">
              Specials
            </Link>
            <Link href="/contact" onClick={closeAll} className="block mb-4 text-white font-semibold text-base">
              Contact
            </Link>

            {/* Emergency Banner (mobile) */}
            <Link
              href="/services/emergency-plumbing"
              onClick={closeAll}
              className="flex items-center gap-2 mb-4 px-3 py-2.5 bg-brand-red/10 border border-brand-red/20 rounded-lg"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red" />
              </span>
              <span className="text-sm font-semibold text-white">24/7 Emergency Service</span>
            </Link>

            {/* Phone CTA */}
            <a
              href={`tel:${company.phoneRaw}`}
              onClick={() => { trackPhoneClick(); closeAll(); }}
              className="block bg-brand-red text-white text-center py-3 rounded-lg font-bold"
            >
              Call {company.phone}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
