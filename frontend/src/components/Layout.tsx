import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ValorAIAssistant } from "@/components/ValorAIAssistant";
import SpaceNetworkBackground from "./ThreeBg";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col relative z-10 mt-0 md:mt-0">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ValorAIAssistant />
    </div>
  );
};

export default Layout;
