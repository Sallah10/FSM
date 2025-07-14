import Image from "next/image";
import Link from "next/link";
// import logo from "./assets/logo.png"
import "./globals.css";

export const metadata = {
  title: 'QuickSet — Your Branded Service Page in 1 Click',
  description: 'QuickSet helps technicians and solo service providers build and share their own branded page to get jobs faster.',
  openGraph: {
    title: 'QuickSet',
    description: 'Build and share your branded service page in seconds.',
    url: 'https://quickset.app',
    siteName: 'QuickSet',
    images: [
      {
        url: 'https://quickset.app/og-home.png',
        width: 1200,
        height: 630,
        alt: 'QuickSet Preview',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuickSet',
    description: 'One-click branded pages for service providers.',
    images: ['https://quickset.app/og-home.png'],
  },
};

export default function Home() {
  return (
    <div className="bg-light min-h-screen flex flex-col items-center justify-center px-4">
      <main className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center">
        <Image src={logo} width={300} height={50} alt="logo" className="p-0 m-0 flex self-center " />
        <h1 className="text-heading text-center -mt-24">Welcome to <span className='italic'>QuickSet</span></h1>
        <p className="text-lg text-center italic mt-4">
          {/* Build your service page in minutes. */}
          One-Click Branded Page for Service Providers
        </p>
        <p className="textp text-center mt-4">
          For technicians, freelancers, and artisans who want to look professional — without coding or design stress.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/auth/login" className="btn-primary border-bg-accent font-bold no-underline shadow-gray-400 shadow-md">
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}
