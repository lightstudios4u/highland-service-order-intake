import Image from "next/image";
import { FaInstagram, FaLinkedinIn, FaVimeoV } from "react-icons/fa";
import { HiPhone, HiEnvelope } from "react-icons/hi2";

const NAV_LINKS = [
  { label: "About", href: "https://highlandroof.com/about/" },
  { label: "Expertise", href: "https://highlandroof.com/expertise/" },
  { label: "Services", href: "https://highlandroof.com/services/" },
  { label: "Portfolio", href: "https://highlandroof.com/portfolio/" },
  { label: "Careers", href: "https://highlandroof.com/careers/" },
  { label: "Contact", href: "https://highlandroof.com/contact/" },
];

const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/highlandcommercialroofing/",
    icon: FaInstagram,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/highland-commercial-roofing/",
    icon: FaLinkedinIn,
  },
  {
    label: "Vimeo",
    href: "https://vimeo.com/highlandroof",
    icon: FaVimeoV,
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#163832] text-slate-300">
      {/* Main footer content */}
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 py-10 md:px-10">
        {/* Logo */}
        <Image
          src="/New-Logo-Final-White-1.svg"
          alt="Highland Commercial Roofing"
          width={200}
          height={40}
          className="h-auto w-[180px]"
        />

        {/* Contact row */}
        <div className="flex flex-col items-center gap-3 text-sm sm:flex-row sm:gap-6">
          <a
            href="tel:8668805252"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <HiPhone className="text-[#2f9750]" />
            (866) 880-5252
          </a>
          <span className="hidden text-slate-600 sm:inline">|</span>
          <a
            href="mailto:info@highlandroof.com"
            className="flex items-center gap-2 transition-colors hover:text-white"
          >
            <HiEnvelope className="text-[#2f9750]" />
            info@highlandroof.com
          </a>
        </div>

        {/* Nav links */}
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs font-medium uppercase tracking-wider">
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* Social icons */}
        <div className="flex gap-4">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700/60 text-slate-300 transition-colors hover:bg-[#2f9750] hover:text-white"
            >
              <Icon className="text-base" />
            </a>
          ))}
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-slate-700/50 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Highland Commercial Roofing,{" "}
        <a
          href="https://thehcrgroup.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline transition-colors hover:text-slate-300"
        >
          An HCR Group Company
        </a>
      </div>
    </footer>
  );
}
