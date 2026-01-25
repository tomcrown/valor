import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Wallet,
  ChevronDown,
  Chrome,
  Activity,
  Copy,
  Check,
  Droplet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/AuthDialog";
import {
  useCurrentAccount,
  useDisconnectWallet,
  useCurrentWallet,
} from "@mysten/dapp-kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/hooks/use-toast";
import { isEnokiWallet } from "@mysten/enoki";
import { easeOutExpo } from "./ui/motion";
import { ThemeToggle } from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/players", label: "Players" },
  { href: "/pulse", label: "Pulse", icon: Activity, highlight: true },
  { href: "/portfolio", label: "Portfolio" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const { currentWallet } = useCurrentWallet();

  const isEnoki = currentWallet && isEnokiWallet(currentWallet);

  const handleLogout = () => {
    disconnect();
    window.location.href = "/";
  };

  const handleCopyAddress = async () => {
    if (!currentAccount?.address) return;

    try {
      await navigator.clipboard.writeText(currentAccount.address);
      setCopied(true);
      toast({
        title: "Address Copied!",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      {/* <nav className="sticky top-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl"> */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        className={cn(
          "md:fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
          isOpen
            ? "backdrop-blur-xl border-border"
            : "bg-transparent"
        )}
      >

        <div className="mx-auto max-w-7xl px-6 py-3 transition-colors">
          <div className="md:glass-card  flex items-center justify-between px-6 py-3 ">
            {/* Logo */}
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <img className="w-8 h-8 " src="/valor.png" alt="VALOR" />
                </div>
                <span className="font-bold md:text-4xl text-2xl sm:block">
                  <h1 className="text-dark">VALOR</h1>
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "nav-link text-sm font-medium py-2 flex items-center gap-1.5",
                    location.pathname === link.href && "nav-link-active",

                    link.highlight && "relative"
                  )}
                >
                  {link.icon && <link.icon className="w-4 h-4" />}
                  {link.label}
                  {link.highlight && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
                  )}
                </Link>
              ))}
            </div>
            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />

              {/* Faucet Button */}
              <a
                href="https://faucet.testnet.sui.io"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-2 rounded-2xl  text-dark font-medium transition-colors"
                title="Get Test SUI from Faucet"
              >
                <Droplet className="w-4 h-4" /> Faucet
              </a>
              {!currentAccount ? (
                <Button
                  onClick={() => setIsAuthOpen(true)}
                  className="btn-gradient text-primary-foreground font-semibold px-6"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Log In
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 min-w-[160px] justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {isEnoki ? (
                          <>
                            <Chrome className="w-4 h-4 text-blue-500" />
                            <span className="font-mono text-sm">
                              {formatAddress(currentAccount.address)}
                            </span>
                          </>
                        ) : (
                          <>
                            <Wallet className="w-4 h-4" />
                            <span className="font-mono text-sm">
                              {formatAddress(currentAccount.address)}
                            </span>
                          </>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {isEnoki ? "zkLogin Account" : "Connected Wallet"}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatAddress(currentAccount.address)}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleCopyAddress}
                      className="cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Address
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/portfolio" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        My Portfolio
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-400 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />

              <button
                className="p-2"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden backdrop-blur-2xl py-4 border-t border-border animate-fade-in">

              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      " text-sm font-medium py-2 px-4 rounded-2xl transition-colors flex items-center gap-2",
                      location.pathname === link.href
                        ? "text-primary "
                        : " hover:bg-muted/50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.label}
                    {link.highlight && (
                      <span className="ml-auto px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                        NEW
                      </span>
                    )}
                  </Link>
                ))}
                <a
                  href="https://faucet.testnet.sui.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl btn-gradientmr-2 font-medium"
                >
                  <Droplet className="w-4 h-4" /> Faucet
                </a>

                {!currentAccount ? (
                  <Button
                    onClick={() => {
                      setIsAuthOpen(true);
                      setIsOpen(false);
                    }}
                    className="btn-gradient text-primary-foreground font-semibold mt-2"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Log In
                  </Button>
                ) : (
                  <div className="space-y-2 mt-2">
                    <div className="px-4 py-2 bg-muted rounded-2xl">
                      <p className="text-xs text-muted-foreground mb-1">
                        {isEnoki ? "zkLogin" : "Wallet"} Account
                      </p>
                      <p className="text-xs font-mono">
                        {formatAddress(currentAccount.address)}
                      </p>
                    </div>
                    <Button
                      onClick={handleCopyAddress}
                      variant="outline"
                      className="w-full"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-success" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Address
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* </nav> */}
      </motion.header>

      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Navbar;
