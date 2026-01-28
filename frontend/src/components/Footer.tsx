import { Link } from "react-router-dom";
import { TrendingUp, Twitter, Github, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl  from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <img
                  className="w-8 h-8 text-primary-foreground"
                  src="/valor.png"
                />{" "}
              </div>
              <span className="font-bold md:text-4xl text-2xl  sm:block">
                <h1 className="text-foreground">VALOR</h1>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Trade football players like stocks on the Sui blockchain.
              AI-powered scoring with verifiable on-chain data.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-lg  font-semibold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/players"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Players
                </Link>
              </li>
              <li>
                <Link
                  to="/portfolio"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Portfolio
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className=" text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  API Reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Whitepaper
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className=" text-lg  font-semibold mb-4">Community</h4>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Valor. Built on Sui.
          </p>
          <div className="flex gap-6">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
