import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheckIcon, MenuIcon, XIcon } from "lucide-react";
import { useNavigation } from "../../context/NavigationContext";
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { navigate, currentPage } = useNavigation();
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const isOnLanding = currentPage === "home";
  const isDark = isOnLanding && !scrolled;
  const navLinks = [
    {
      label: "Home",
      page: "home" as const,
    },
    {
      label: "Features",
      page: "home" as const,
      anchor: "#features",
    },
    {
      label: "Pricing",
      page: "home" as const,
      anchor: "#pricing",
    },
    {
      label: "Docs",
      page: "docs" as const,
    },
    {
      label: "Blog",
      page: "blog" as const,
    },
    {
      label: "Contact",
      page: "contact" as const,
    },
  ];

  const handleNavClick = (link: (typeof navLinks)[0]) => {
    navigate(link.page);
    setMobileOpen(false);
    if (link.anchor && link.page === "home") {
      setTimeout(() => {
        const el = document.querySelector(link.anchor!);
        el?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  };
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !isOnLanding ? "bg-white" : "bg-green-800"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 focus:outline-none">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: "#C8F04A",
              }}>
              <ShieldCheckIcon
                className="w-5 h-5"
                style={{
                  color: "#0B2518",
                }}
              />
            </div>
            <span
              className={`text-xl font-bold tracking-tight transition-colors duration-300 ${isDark ? "text-white" : "text-gray-900"}`}>
              PayOrch
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className={`text-sm font-medium transition-colors duration-200 hover:opacity-80 focus:outline-none ${isDark ? "text-white/90" : "text-gray-700"}`}>
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to={"/login"}
              className={`text-sm font-medium transition-colors duration-200 hover:opacity-80 focus:outline-none ${isDark ? "text-white/90" : "text-gray-700"}`}>
              Sign In
            </Link>

            <Link
              to={"/signup"}
              className="lime-btn bg-lime-300 text-sm font-semibold px-5 py-2 rounded-full">
              Get Started
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? "text-white" : "text-gray-700"}`}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu">
            {mobileOpen ? (
              <XIcon className="w-5 h-5" />
            ) : (
              <MenuIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="block w-full text-left text-sm font-medium text-gray-700 py-2.5 px-2 rounded-lg hover:bg-gray-50 focus:outline-none">
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-3 mt-2">
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileOpen(false);
                }}
                className="text-sm font-medium text-gray-700 text-center py-2">
                Sign In
              </button>
              <button
                onClick={() => {
                  navigate("/signup");
                  setMobileOpen(false);
                }}
                className="lime-btn text-sm font-semibold px-5 py-2.5 rounded-full w-full">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
