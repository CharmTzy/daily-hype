import Link from "next/link";
import { URL } from "@/enums/global-enums";
import FooterLink from "./footer-link";
import FaceBookIcon from "@/icons/facebook-icon";
import InstagramIcon from "@/icons/instagram-icon";
import TwitterIcon from "@/icons/twitter-icon";
import YoutubeIcon from "@/icons/youtube-icon";
import LinkedInIcon from "@/icons/linkedin-icon";
import BrandLogo from "@/components/brand/brand-logo";
export default function Footer() {
    return (<footer className="w-full border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.7fr_0.7fr_1fr]">
          <div className="max-w-sm">
            <BrandLogo
              size="md"
            />
            <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-300">
              DailyHype brings together fresh drops, easy browsing, and a cleaner shopping experience across mobile, tablet, and desktop.
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">Shop</label>
            <div className="mt-4 flex flex-col gap-1">
              <FooterLink label="About Us" url={URL.About}/>
              <FooterLink label="Payment Methods" url={URL.About}/>
              <FooterLink label="How to Buy" url={URL.About}/>
              <FooterLink label="Return and Refund" url={URL.About}/>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">Support</label>
            <div className="mt-4 flex flex-col gap-1">
              <FooterLink label="Feedback" url={URL.Feedback}/>
              <FooterLink label="Help and Support" url={URL.Help}/>
              <FooterLink label="Contact Us" url={URL.Contact}/>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-300">Social Media</label>
            <label className="mt-4 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-300">
              Follow us for new arrivals, styling ideas, and limited-time promos.
            </label>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:hover:bg-slate-900">
                <FaceBookIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
              <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:hover:bg-slate-900">
                <InstagramIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
              <Link href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:hover:bg-slate-900">
                <TwitterIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
              <Link href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:hover:bg-slate-900">
                <YoutubeIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
              <Link href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="rounded-full border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:hover:bg-slate-900">
                <LinkedInIcon width={20} height={20} className="cursor-pointer"/>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-300 lg:flex-row lg:items-center lg:justify-between">
          <label>&copy; 2023 DailyHype. All rights reserved</label>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link className="cursor-pointer transition hover:text-slate-900 dark:hover:text-white" href={URL.PrivacyPolicy}>
              Privacy Policy
            </Link>
            <Link className="cursor-pointer transition hover:text-slate-900 dark:hover:text-white" href={URL.TermsNConditions}>
              Terms and Conditions
            </Link>
            <Link className="cursor-pointer transition hover:text-slate-900 dark:hover:text-white" href={URL.SiteMap}>
              Sitemap
            </Link>
          </div>
          <label>Country & Region: Singapore</label>
        </div>
      </div>
    </footer>);
}
