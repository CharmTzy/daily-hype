// Name: Zay Yar Tun
// Admin No: 2235035
// Class: DIT/FT/2B/02

import Link from "next/link";
import { URL } from "@/enums/global-enums";
import FooterLink from "./footer-link";
import FaceBookIcon from "@/icons/facebook-icon";
import InstagramIcon from "@/icons/instagram-icon";
import TwitterIcon from "@/icons/twitter-icon";
import YoutubeIcon from "@/icons/youtube-icon";
import LinkedInIcon from "@/icons/linkedin-icon";

export default function Footer() {
  return (
    <footer className="flex flex-col w-full dark:bg-slate-900 bg-slate-50 max-w-full px-36 py-10 border-t-2 border-slate-300 laptop-xl:px-24">
      <label className="tracking-wide uppercase text-2xl font-medium laptop-3xl:text-3xl laptop-xl:text-xl">dailyhype</label>
      <div className="flex mt-8 justify-start laptop-xl:mt-6">
        <div className="flex flex-col me-60 laptop-xl:me-36">
          <FooterLink label="About Us" url={URL.About} />
          <FooterLink label="Payment Methods" url={URL.About} />
          <FooterLink label="How to Buy" url={URL.About} />
          <FooterLink label="Return and Refund" url={URL.About} />
        </div>
        <div className="flex flex-col">
          <FooterLink label="Feedback" url={URL.Feedback} />
          <FooterLink label="Help and Support" url={URL.Help} />
          <FooterLink label="Contact Us" url={URL.Contact} />
        </div>
        <div className="flex flex-col max-w-sm ms-auto">
          <label className="mt-3 text-slate-500 dark:text-slate-300 uppercase tracking-wide font-medium laptop-3xl:text-large laptop-xl:text-small">social media</label>
          <label className="mt-3 text-slate-500 dark:text-slate-300 text-sm laptop-3xl:text-large laptop-xl:text-small">Follow us on social media to find out the latest products</label>
          <div className="flex justify-start mt-7 laptop-xl:mt-5">
            <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
              <FaceBookIcon width={20} height={20} className="me-8 cursor-pointer laptop-3xl:w-7 laptop-3xl:h-7 laptop-xl:w-5 laptop-xl:h-5" />
            </Link>
            <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
              <InstagramIcon width={20} height={20} className="me-8 cursor-pointer laptop-3xl:w-7 laptop-3xl:h-7 laptop-xl:w-5 laptop-xl:h-5" />
            </Link>
            <Link href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
              <TwitterIcon width={20} height={20} className="me-8 cursor-pointer laptop-3xl:w-7 laptop-3xl:h-7 laptop-xl:w-5 laptop-xl:h-5" />
            </Link>
            <Link href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
              <YoutubeIcon width={20} height={20} className="me-8 cursor-pointer laptop-3xl:w-7 laptop-3xl:h-7 laptop-xl:w-5 laptop-xl:h-5" />
            </Link>
            <Link href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
              <LinkedInIcon width={20} height={20} className="me-8 cursor-pointer laptop-3xl:w-7 laptop-3xl:h-7 laptop-xl:w-5 laptop-xl:h-5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="flex mt-10 pt-6 border-t-2 justify-between text-slate-500 dark:text-slate-300 laptop-3xl:text-large laptop-xl:text-small">
        <label>&copy; 2023 DailyHype. All rights reserved</label>
        <div>
          <Link className="cursor-pointer hover:font-medium me-8 laptop-3xl:text-large laptop-3xl:me-6 laptop-xl:me-5 laptop-xl:text-small" href={URL.PrivacyPolicy}>
            Privacy Policy
          </Link>
          <Link className="cursor-pointer hover:font-medium me-8 laptop-3xl:text-large laptop-3xl:me-6 laptop-xl:me-5 laptop-xl:text-small" href={URL.TermsNConditions}>
            Terms and Conditions
          </Link>
          <Link className="cursor-pointer hover:font-medium me-8 laptop-3xl:text-large laptop-3xl:me-6 laptop-xl:me-5 laptop-xl:text-small" href={URL.SiteMap}>
            Sitemap
          </Link>
        </div>
        <label className="laptop-3xl:text-large laptop-xl:text-small">Country & Region: Singapore</label>
      </div>
    </footer>
  );
}
