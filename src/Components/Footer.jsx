import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  PlayCircleIcon,
  Twitter,
} from "lucide-react";
import Button from "../Components/Button";

const Footer = () => {
  return (
    <footer className="flex flex-col gap-20 md:p-20 p-5 bg-indigo-950 text-white">
      <div className="grid md:grid-cols-2 grid-cols-1 items-center gap-20">
        <div className="flex flex-col gap-10">
          <div className=" bg-white rounded-full p-4 size-max">
            <Mail className="size-8 text-indigo-950 m-auto" />
          </div>

          <h1 className="text-6xl font-semibold">
            Keep up with the <br />
            latest
          </h1>
          <p className="text-sm">
            Join our newsletter to stay up to date on features and releases.
          </p>
        </div>
        <div className="flex flex-col gap-10 w-full">
          <h2 className="text-xl font-medium">News Letter</h2>
          <div className="flex items-center gap-5 w-full bg-white p-2 px-2 rounded-md justify-between">
            <input
              type="text"
              className=" text-slate-900 p-1 text-sm w-full outline-none"
              placeholder="Enter your email"
            />
            <Button text={"Subscribe"} style={"bg-indigo-800 text-white"} />
          </div>
          <p className="text-sm">Join our newsletter to stay up to date</p>
        </div>
      </div>
      <hr className="border-slate-500" />
      <div className="grid md:grid-cols-4 grid-cols-1 gap-20">
        <ul className="flex flex-col gap-10">
          <span className="text-4xl font-medium">Aggregator.</span>
          <p>Make your complex finance more simple with us.</p>
          <div className="flex gap-8 items-center">
            <Facebook className="size-5" />
            <Instagram className="size-5" />
            <Twitter className="size-5" />
            <PlayCircleIcon className="size-5" />
          </div>
        </ul>
        <ul className="flex flex-col gap-4">
          <h1 className="text-2xl font-medium">Contact</h1>
          <div className="flex items-center gap-3 text-sm">
            <Phone className="size-5" />
            +234 (0) 703 1244 456
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Mail className="size-5" />
            info@support.com
          </div>

          <div className="flex flex-col mt-10 gap-4 text-sm">
            <h1 className="text-2xl font-medium">Address</h1>
            <address>5600 Wuse zone II, Abuja, Nigeria.</address>
            <span>07.00 AM - 19.00 PM</span>
          </div>
        </ul>
        <ul className="flex flex-col gap-4 text-sm">
          <h1 className="text-2xl font-medium">Explore</h1>
          <span>Home</span>
          <span>Why Aggregator?</span>
          <span>Features</span>
          <span>FAQ</span>
          <span>Contact</span>
        </ul>
        <ul className="flex flex-col gap-4 text-sm">
          <h1 className="text-2xl font-medium">Support</h1>
          <span>Help Center</span>
          <span>Privacy Policy</span>
          <span>Disclaimer</span>
          <span>FAQs</span>
        </ul>
      </div>
      <hr className="border-slate-500" />
      <div className="text-center text-base">
        All rights Reserved for Aggregator. &copy; copyright 2026.
      </div>
    </footer>
  );
};
export default Footer;
