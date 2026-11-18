import "./globals.css";
import Footer from "../components/Footer";
import WebsiteNavbar from "../components/website/Navbar";
import ServiceWorkerRegister from "../components/pwa/ServiceWorkerRegister";
import Script from "next/script";

export const metadata = {
  title: "Lost & Found",
  description: "Find lost items and return found items",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
              try {
                const theme = localStorage.getItem("theme");

                if (theme === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (e) {}
          `}
        </Script>
      </head>

      <body>
        <ServiceWorkerRegister />
        <div className="site-wrapper">
          <WebsiteNavbar />
          <main className="site-content">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}