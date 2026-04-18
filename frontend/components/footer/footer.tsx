import Link from "next/link";
import { URL } from "@/enums/global-enums";
import FooterLink from "./footer-link";
import FaceBookIcon from "@/icons/facebook-icon";
import InstagramIcon from "@/icons/instagram-icon";
import TwitterIcon from "@/icons/twitter-icon";
import YoutubeIcon from "@/icons/youtube-icon";
import LinkedInIcon from "@/icons/linkedin-icon";
import BrandLogo from "@/components/brand/brand-logo";

const shopLinks = [
    { label: "Explore All", url: URL.Explore },
    { label: "New Arrivals", url: "/#new-arrivals" },
    { label: "Most Popular", url: "/#most-popular" },
    { label: "Shop by Collection", url: "/#shop-by-collection" },
];

const supportLinks = [
    { label: "Payment Methods", url: "/help#payment" },
    { label: "How to Buy", url: "/help#buy" },
    { label: "Return and Refund", url: "/help#returns" },
    { label: "Contact Us", url: URL.Contact },
];

const policyLinks = [
    { label: "Privacy Policy", url: URL.PrivacyPolicy },
    { label: "Terms and Conditions", url: URL.TermsNConditions },
    { label: "Sitemap", url: URL.SiteMap },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (<footer className="w-full border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1fr]">
          <div className="max-w-sm">
            <BrandLogo
              size="md"
              tagline="Curated fashion, shopper-first flow"
            />
            <p className="mt-4 text-sm leading-6 text-slate-500">
              DailyHype brings together fresh drops, easy browsing, and a cleaner shopping experience across mobile, tablet, and desktop.
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Shop</label>
            <div className="mt-4 flex flex-col gap-1">
              {shopLinks.map((link) => (
                <FooterLink key={link.label} label={link.label} url={link.url}/>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Support</label>
            <div className="mt-4 flex flex-col gap-1">
              {supportLinks.map((link) => (
                <FooterLink key={link.label} label={link.label} url={link.url}/>
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Social Media</label>
            <label className="mt-4 max-w-sm text-sm leading-6 text-slate-500">
              Follow us for new arrivals, styling ideas, and limited-time promos.
            </label>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white">
                <FaceBookIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
              <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white">
                <InstagramIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
              <Link href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white">
                <TwitterIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
              <Link href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white">
                <YoutubeIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
              <Link href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white">
                <LinkedInIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 lg:flex-row lg:items-center lg:justify-between">
          <label>&copy; {currentYear} DailyHype. All rights reserved</label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {policyLinks.map((link) => (
              <Link key={link.label} className="cursor-pointer transition hover:text-slate-900" href={link.url}>
                {link.label}
              </Link>
            ))}
          </div>
          <label>Country & Region: Singapore</label>
        </div>
      </div>
    </footer>);
}
