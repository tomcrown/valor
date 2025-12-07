import { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { ValorAIAssistant } from "@/components/ValorAIAssistant";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ValorAIAssistant />
    </div>
  );
};

export default Layout;
