
import ThemeToggle from "./ThemeToggle";
import { Activity } from "lucide-react";

const Header = () => {
  return (
    <header className="w-full border-b border-border py-3 px-4 dark:bg-cyber-background-dark bg-white">
      <div className="container-cyber flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-cyber-primary" />
          <h1 className="text-lg md:text-xl font-bold text-cyber-primary">
            CyberPulse
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
