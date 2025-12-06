// ============================================================================
// FILE 4: src/components/Navbar.tsx (UPDATED)
// ============================================================================

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  LogIn,
  LogOut,
  User,
  Wallet,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthDialog } from "@/components/AuthDialog";
import { useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/players", label: "Players" },
  { href: "/portfolio", label: "Portfolio" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const location = useLocation();

  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  const authMethod = localStorage.getItem("auth_method");
  const isAuthenticated = currentAccount || authMethod === "google";

  // Save session when account changes
  useEffect(() => {
    if (currentAccount) {
      localStorage.setItem(
        "sui_session",
        JSON.stringify({
          address: currentAccount.address,
        })
      );
    }
  }, [currentAccount]);

  const handleLogout = () => {
    if (authMethod === "wallet") {
      disconnect();
    }
    localStorage.removeItem("auth_method");
    localStorage.removeItem("google_credential");
    localStorage.removeItem("sui_session");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card border-b border-border/50 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <img
                  className="w-10 h-10 text-primary-foreground"
                  src="/valor.png"
                  alt="VALOR"
                />
              </div>
              <span className="font-bold text-4xl hidden sm:block">
                <h1 className="text-foreground">VALOR</h1>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={cn(
                    "nav-link text-sm font-medium py-2",
                    location.pathname === link.href && "nav-link-active"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center gap-4">
              {!isAuthenticated ? (
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
                        {authMethod === "wallet" ? (
                          <>
                            <Wallet className="w-4 h-4" />
                            <span className="font-mono text-sm">
                              {currentAccount
                                ? formatAddress(currentAccount.address)
                                : "Wallet"}
                            </span>
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4" />
                            <span>Account</span>
                          </>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">
                        {authMethod === "wallet" ? "Connected" : "Signed In"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {authMethod === "wallet" && currentAccount
                          ? formatAddress(currentAccount.address)
                          : "via Google"}
                      </p>
                    </div>
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
                      className="text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={cn(
                      "text-sm font-medium py-2 px-4 rounded-lg transition-colors",
                      location.pathname === link.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}

                {!isAuthenticated ? (
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
                    <div className="px-4 py-2 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        {authMethod === "wallet" && currentAccount
                          ? formatAddress(currentAccount.address)
                          : "Google Account"}
                      </p>
                    </div>
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
      </nav>

      <AuthDialog isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Navbar;
