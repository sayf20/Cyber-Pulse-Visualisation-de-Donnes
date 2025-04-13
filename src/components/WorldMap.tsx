
import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { ExtendedAttack } from "@/lib/mock-data";

type GeoData = {
  type: string;
  features: any[];
};

type MapProps = {
  attacks?: ExtendedAttack[];
  width?: number;
  height?: number;
  onCountryClick?: (countryName: string) => void;
  isAnimationPaused?: boolean;
  isLightTheme?: boolean;
  selectedAttackType?: string;
  animationSpeed?: number;
  isSimultaneousAttacks?: boolean;
};

const WorldMap = ({ 
  attacks = [], 
  width = 800, 
  height = 500, 
  onCountryClick,
  isAnimationPaused = false,
  isLightTheme = false,
  selectedAttackType = "All",
  animationSpeed = 5,
  isSimultaneousAttacks = false // Changed default to sequential
}: MapProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [geoData, setGeoData] = useState<GeoData | null>(null);
  const { toast } = useToast();
  const [zoomLevel, setZoomLevel] = useState(1);
  const zoomRef = useRef<d3.ZoomBehavior<Element, unknown> | null>(null);

  // Expanded attack type to color mapping with more attack types
  const attackColors = {
    "DDoS": "#FF9500",       // Brighter Orange
    "Phishing": "#FF3B30",   // Brighter Red
    "Malware": "#AF52DE",    // Brighter Purple
    "Ransomware": "#FF2D55", // Brighter Pink
    "SQLi": "#34C759",       // Brighter Green
    "XSS": "#007AFF",        // Brighter Blue
    "Brute Force": "#FFCC00", // Yellow
    "Zero-Day": "#5856D6",    // Deep Purple
    "Man-in-the-Middle": "#FF3B30", // Red
    "Credential Stuffing": "#5AC8FA", // Light Blue
    "default": "#5AC8FA"      // Default blue
  };

  // Load world map data
  useEffect(() => {
    const fetchGeoData = async () => {
      try {
        const response = await fetch("https://unpkg.com/world-atlas@2.0.2/countries-110m.json");
        const data = await response.json();
        const worldData = topojson.feature(data, data.objects.countries);
        setGeoData(worldData as any);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load geo data:", error);
        toast({
          title: "Error",
          description: "Failed to load map data. Please refresh the page.",
          variant: "destructive",
        });
      }
    };

    fetchGeoData();
  }, [toast]);

  // Draw map and attacks when data is available
  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    // Create projection
    const projection = d3
      .geoMercator()
      .fitSize([width, height], geoData)
      .center([0, 30]) // Center the map
      .scale(width / 6.5); // Adjust the scale

    const path = d3.geoPath().projection(projection);

    // Add zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([1, 8]) // Min and max zoom
      .on("zoom", (event) => {
        const { transform } = event;
        setZoomLevel(transform.k);
        svg.selectAll("g").attr("transform", transform);
      });
    
    zoomRef.current = zoom;
    svg.call(zoom as any);

    // Add reset zoom button
    const resetButton = svg.append("g")
      .attr("class", "reset-button")
      .attr("transform", `translate(${width - 60}, 30)`)
      .style("cursor", "pointer")
      .on("click", () => {
        svg.transition().duration(750).call(
          (zoom as any).transform,
          d3.zoomIdentity
        );
      });
    
    resetButton.append("rect")
      .attr("width", 50)
      .attr("height", 25)
      .attr("rx", 5)
      .attr("fill", "rgba(50, 50, 50, 0.7)");
    
    resetButton.append("text")
      .attr("x", 25)
      .attr("y", 16)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .text("Reset");

    // Create tooltip
    if (!tooltipRef.current) {
      const tooltip = document.createElement("div");
      tooltip.className = "cyber-tooltip hidden absolute bg-background/90 border border-border px-2 py-1 text-sm rounded shadow-lg z-50";
      document.body.appendChild(tooltip);
      tooltipRef.current = tooltip;
    }

    // Add map group
    const mapGroup = svg.append("g");

    // Set color theme based on isLightTheme
    const countryFill = isLightTheme ? "#FFFFFF" : "var(--muted)";
    const countryStroke = isLightTheme ? "#000000" : "#FFFFFF"; // Enhanced border contrast
    const textColor = isLightTheme ? "#000000" : "currentColor";

    // Draw countries - Enhanced borders
    mapGroup
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path as any)
      .attr("class", "map-path")
      .attr("fill", countryFill)
      .attr("stroke", countryStroke)
      .attr("stroke-width", 0.8) // Enhanced border width
      .attr("data-country", (d: any) => d.properties.name)
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .attr("fill", "var(--primary)")
          .attr("cursor", "pointer");
          
        if (tooltipRef.current) {
          tooltipRef.current.innerHTML = d.properties.name;
          tooltipRef.current.classList.remove("hidden");
          tooltipRef.current.style.left = `${event.pageX + 10}px`;
          tooltipRef.current.style.top = `${event.pageY + 10}px`;
        }
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("fill", countryFill);
          
        if (tooltipRef.current) {
          tooltipRef.current.classList.add("hidden");
        }
      })
      .on("click", (event, d: any) => {
        if (onCountryClick) {
          onCountryClick(d.properties.name);
        }
      });

    // Draw attacks if we have attack data
    if (attacks.length > 0) {
      // Add attacks group
      const attacksGroup = svg.append("g");

      // Filter attacks based on type if needed
      const filteredAttacks = selectedAttackType === "All" 
        ? attacks 
        : attacks.filter(attack => attack.type === selectedAttackType);

      // Limit active animations to improve performance
      const maxSimultaneousAnimations = 10;
      const visibleAttacks = filteredAttacks.slice(0, isSimultaneousAttacks ? maxSimultaneousAnimations : 50);

      // Set animation duration based on speed (invert scale: 1 is slow, 10 is fast)
      const baseAnimationDuration = 11 - animationSpeed;
      
      // Batch animations for better performance
      const drawBatchedAttacks = () => {
        // Draw attack lines
        visibleAttacks.forEach((attack, index) => {
          if (!attack.origin_coords || !attack.target_coords) return;

          const originPoint = projection(attack.origin_coords);
          const targetPoint = projection(attack.target_coords);
          
          if (!originPoint || !targetPoint) return;

          // Calculate delay for sequential attacks
          let delay = 0;
          if (!isSimultaneousAttacks) {
            delay = index * (baseAnimationDuration * 200); // Shorter delay between attacks
          }

          // Draw curved attack line with optimized animation
          const dx = targetPoint[0] - originPoint[0];
          const dy = targetPoint[1] - originPoint[1];
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Controls the curve

          const attackColor = attackColors[attack.type as keyof typeof attackColors] || attackColors.default;

          // Create attack path with optimized animation
          const attackPath = attacksGroup
            .append("path")
            .attr("class", `attack-line`)
            .attr("d", `M${originPoint[0]},${originPoint[1]}A${dr},${dr} 0 0,1 ${targetPoint[0]},${targetPoint[1]}`)
            .attr("stroke", attackColor)
            .attr("stroke-width", 2)
            .attr("stroke-dasharray", "4,2")
            .attr("opacity", 0);

          // Only add animation if not paused
          if (!isAnimationPaused) {
            attackPath
              .transition()
              .delay(delay)
              .duration(baseAnimationDuration * 500) // Faster transition
              .attr("opacity", 0.9)
              .transition()
              .duration(baseAnimationDuration * 500) // Faster animation
              .attr("stroke-dashoffset", 0)
              .transition()
              .duration(300) // Quick fade out
              .attr("opacity", 0)
              .remove(); // Remove from DOM when done
          } else {
            attackPath.attr("opacity", 0.9);
          }

          // Origin point with optimized animation
          const originCircle = attacksGroup
            .append("circle")
            .attr("class", `attack-point`)
            .attr("cx", originPoint[0])
            .attr("cy", originPoint[1])
            .attr("r", 3)
            .attr("fill", attackColor)
            .attr("opacity", 0);

          // Only add animation if not paused
          if (!isAnimationPaused) {
            originCircle
              .transition()
              .delay(delay)
              .duration(300)
              .attr("opacity", 0.85)
              .transition()
              .duration(baseAnimationDuration * 500)
              .attr("opacity", 0)
              .remove(); // Remove from DOM when done
          } else {
            originCircle.attr("opacity", 0.85);
          }

          // Target point with optimized animation
          const targetCircle = attacksGroup
            .append("circle")
            .attr("class", `attack-point`)
            .attr("cx", targetPoint[0])
            .attr("cy", targetPoint[1])
            .attr("r", 4)
            .attr("fill", attackColor)
            .attr("opacity", 0);

          // Only add animation if not paused
          if (!isAnimationPaused) {
            targetCircle
              .transition()
              .delay(delay + baseAnimationDuration * 300)
              .duration(300)
              .attr("opacity", 0.9)
              .attr("r", 6)
              .transition()
              .duration(500)
              .attr("r", 4)
              .attr("opacity", 0)
              .remove(); // Remove from DOM when done
          } else {
            targetCircle.attr("opacity", 0.9);
          }

          // Add tooltip data for attacks
          targetCircle
            .on("mouseover", function(event) {
              if (tooltipRef.current) {
                tooltipRef.current.innerHTML = `
                  <div class="font-medium">${attack.type} Attack</div>
                  <div>From: ${attack.origin_country}</div>
                  <div>To: ${attack.target_country}</div>
                  <div>Protocol: ${attack.proto}</div>
                  <div>Port: ${attack.dpt}</div>
                  <div>Time: ${new Date(attack.datetime).toLocaleTimeString()}</div>
                `;
                tooltipRef.current.classList.remove("hidden");
                tooltipRef.current.style.left = `${event.pageX + 10}px`;
                tooltipRef.current.style.top = `${event.pageY + 10}px`;
              }
            })
            .on("mouseout", function() {
              if (tooltipRef.current) {
                tooltipRef.current.classList.add("hidden");
              }
            });
        });
      };
      
      drawBatchedAttacks();
      
      // If sequential and not paused, loop through attacks again after all are complete
      if (!isSimultaneousAttacks && !isAnimationPaused && visibleAttacks.length > 0) {
        const totalAnimationDuration = visibleAttacks.length * baseAnimationDuration * 200;
        setTimeout(() => {
          if (svgRef.current) {
            // Instead of re-rendering the whole map, just draw new attacks
            const svg = d3.select(svgRef.current);
            const attacksGroup = svg.select("g").append("g");
            drawBatchedAttacks();
          }
        }, totalAnimationDuration + 1000); // Add some buffer time
      }
    }

    // Handle resize
    const handleResize = () => {
      if (zoomRef.current && svg) {
        svg.call(zoomRef.current.transform as any, d3.zoomIdentity);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (tooltipRef.current && document.body.contains(tooltipRef.current)) {
        document.body.removeChild(tooltipRef.current);
      }
    };

  }, [geoData, attacks, width, height, onCountryClick, isAnimationPaused, isLightTheme, selectedAttackType, animationSpeed, isSimultaneousAttacks]);

  if (loading) {
    return (
      <div className="relative w-full aspect-[16/9]">
        <Skeleton className="w-full h-full" />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden card-cyber">
      <svg
        ref={svgRef}
        className="svg-container dark:text-cyber-background-dark/50 text-slate-200"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      />
      <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-sm border border-border">
        Zoom: {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
};

export default WorldMap;
