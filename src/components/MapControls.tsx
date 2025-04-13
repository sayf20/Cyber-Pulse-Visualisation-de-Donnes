
import React from "react";
import { Button } from "./ui/button";
import { Pause, Play, Palette, Filter, FastForward, Clock, ZoomIn, ZoomOut, Calendar } from "lucide-react";
import { Toggle } from "./ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface MapControlsProps {
  isAnimationPaused: boolean;
  toggleAnimationPause: () => void;
  isLightTheme: boolean;
  toggleMapTheme: () => void;
  selectedAttackType: string;
  setSelectedAttackType: (type: string) => void;
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
  isSimultaneousAttacks: boolean;
  toggleSimultaneousAttacks: () => void;
}

const MapControls = ({
  isAnimationPaused,
  toggleAnimationPause,
  isLightTheme,
  toggleMapTheme,
  selectedAttackType,
  setSelectedAttackType,
  animationSpeed,
  setAnimationSpeed,
  isSimultaneousAttacks,
  toggleSimultaneousAttacks,
}: MapControlsProps) => {
  // Updated attack types to match our enhanced dataset
  const attackTypes = [
    "All",
    "DDoS",
    "Phishing",
    "Malware",
    "Ransomware",
    "SQLi",
    "XSS",
    "Brute Force",
    "Zero-Day",
    "Man-in-the-Middle",
    "Credential Stuffing"
  ];

  // Get current date range info (2024-01-01 to now)
  const startDate = new Date(2024, 0, 1); // January 1, 2024
  const currentDate = new Date();
  const dateRangeText = `${startDate.toLocaleDateString()} - ${currentDate.toLocaleDateString()}`;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAnimationPause}
          className="flex items-center gap-1"
          aria-label={isAnimationPaused ? "Resume animation" : "Pause animation"}
        >
          {isAnimationPaused ? (
            <>
              <Play size={16} /> Resume
            </>
          ) : (
            <>
              <Pause size={16} /> Pause
            </>
          )}
        </Button>

        <Toggle
          pressed={isLightTheme}
          onPressedChange={toggleMapTheme}
          aria-label="Toggle map theme"
        >
          <Palette size={16} className="mr-1" />
          {isLightTheme ? "Standard" : "Enhanced"}
        </Toggle>

        <Toggle
          pressed={isSimultaneousAttacks}
          onPressedChange={toggleSimultaneousAttacks}
          aria-label="Toggle between simultaneous and sequential attacks"
          className="flex items-center gap-1"
        >
          {isSimultaneousAttacks ? (
            <>
              <FastForward size={16} /> Simultaneous
            </>
          ) : (
            <>
              <Clock size={16} /> Sequential
            </>
          )}
        </Toggle>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Calendar size={16} />
              Date Range
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 w-auto">
            <div className="text-sm">
              <div className="font-medium">Attack Timeline:</div>
              <div>{dateRangeText}</div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <Select
            value={selectedAttackType}
            onValueChange={setSelectedAttackType}
          >
            <SelectTrigger className="w-[160px]" aria-label="Filter attack type">
              <SelectValue placeholder="Attack type" />
            </SelectTrigger>
            <SelectContent>
              {attackTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex items-center gap-2 min-w-[140px] max-w-xs">
          <Clock size={16} />
          <Slider
            value={[animationSpeed]}
            min={1}
            max={10}
            step={1}
            onValueChange={(value) => setAnimationSpeed(value[0])}
            aria-label="Animation speed"
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default MapControls;
