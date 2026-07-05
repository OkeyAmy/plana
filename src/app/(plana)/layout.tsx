import { Plus_Jakarta_Sans, Spline_Sans_Mono } from "next/font/google";
import "@copilotkit/react-ui/v2/styles.css";
import "@/a2ui/theme.css";
import "./plana.css";
import { Providers } from "@/components/plana/Providers";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const splineMono = Spline_Sans_Mono({
  variable: "--font-spline-mono",
  subsets: ["latin"],
  display: "swap",
});

export default function PlanaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Providers>
      <div
        className={`plana-root ${plusJakarta.variable} ${splineMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {children}
      </div>
    </Providers>
  );
}
