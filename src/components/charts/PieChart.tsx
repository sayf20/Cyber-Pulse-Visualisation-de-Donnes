
import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PieChartProps = {
  data: { label: string; value: number }[];
  title: string;
  colors?: string[];
};

const PieChart = ({
  data,
  title,
  colors = [
    "#8B5CF6", // Purple
    "#3B82F6", // Blue
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#EC4899", // Pink
    "#6366F1", // Indigo
    "#14B8A6", // Teal
    "#F97316", // Orange
    "#8B5CF6", // Purple (repeat with variation)
    "#3B82F6", // Blue (repeat with variation)
  ],
}: PieChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Filter out zero values
    const filteredData = data.filter(d => d.value > 0);

    if (filteredData.length === 0) return;

    // Create tooltip if it doesn't exist
    if (!tooltipRef.current) {
      const tooltip = document.createElement("div");
      tooltip.className = "cyber-tooltip hidden";
      document.body.appendChild(tooltip);
      tooltipRef.current = tooltip;
    }

    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Set dimensions
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const radius = Math.min(width, height) / 2 * 0.8;
    
    const svg = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
    
    // Create color scale
    const colorScale = d3.scaleOrdinal<string>()
      .domain(filteredData.map(d => d.label))
      .range(colors);
    
    // Create pie generator
    const pie = d3.pie<any>()
      .value(d => d.value)
      .sort(null);
    
    // Create arc generators
    const arc = d3.arc()
      .innerRadius(radius * 0.5) // Donut chart
      .outerRadius(radius);
      
    const hoverArc = d3.arc()
      .innerRadius(radius * 0.48) // Slightly smaller inner radius when hovering
      .outerRadius(radius * 1.05); // Slightly larger outer radius when hovering
    
    // Create arcs
    const arcs = svg.selectAll(".arc")
      .data(pie(filteredData))
      .enter()
      .append("g")
      .attr("class", "arc");
    
    // Draw pie segments with improved interaction
    arcs.append("path")
      .attr("d", arc as any)
      .attr("fill", (d: any) => colorScale(d.data.label))
      .attr("stroke", "var(--background)")
      .attr("stroke-width", 1.5)
      .style("opacity", 0.9)
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", hoverArc as any)
          .style("opacity", 1)
          .attr("stroke-width", 2);
          
        if (tooltipRef.current) {
          tooltipRef.current.innerHTML = `${d.data.label}: ${d.data.value}`;
          tooltipRef.current.classList.remove("hidden");
          tooltipRef.current.style.left = `${event.pageX + 10}px`;
          tooltipRef.current.style.top = `${event.pageY + 10}px`;
        }
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arc as any)
          .style("opacity", 0.9)
          .attr("stroke-width", 1.5);
          
        if (tooltipRef.current) {
          tooltipRef.current.classList.add("hidden");
        }
      });
    
    // Add labels with improved visibility
    const labelArc = d3.arc()
      .innerRadius(radius * 0.85)
      .outerRadius(radius * 0.85);
    
    arcs.append("text")
      .attr("transform", (d: any) => {
        const centroid = labelArc.centroid(d as any);
        const x = centroid[0];
        const y = centroid[1];
        const h = Math.sqrt(x * x + y * y);
        return `translate(${x / h * radius * 0.95},${y / h * radius * 0.95})`;
      })
      .attr("dy", "0.35em")
      .attr("text-anchor", (d: any) => {
        const pos = labelArc.centroid(d as any);
        return pos[0] > 0 ? "start" : "end";
      })
      .text((d: any) => {
        // Only show label if segment is large enough
        return d.data.value > (d3.sum(filteredData, d => d.value) * 0.05) 
          ? d.data.label
          : "";
      })
      .style("font-size", "12px") // Increased font size
      .style("font-weight", "600") // Made text bolder
      .style("fill", "currentColor");
    
    // Add lines from segments to labels with improved visibility
    arcs.append("polyline")
      .attr("points", (d: any) => {
        const centroid = arc.centroid(d as any);
        const labelPosition = labelArc.centroid(d as any);
        const x = labelPosition[0];
        const y = labelPosition[1];
        const h = Math.sqrt(x * x + y * y);
        const labelPoint = [x / h * radius * 0.9, y / h * radius * 0.9];
        
        // Only add lines for segments with labels
        return d.data.value > (d3.sum(filteredData, d => d.value) * 0.05)
          ? [centroid, labelPoint, [x / h * radius * 0.92, y / h * radius * 0.92]]
          : [];
      })
      .style("fill", "none")
      .style("stroke", "currentColor")
      .style("stroke-width", 1) // Thicker lines
      .style("opacity", 0.7); // More visible

    // Add center text with improved styling
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-size", "14px") // Larger text
      .style("font-weight", "bold")
      .style("fill", "currentColor")
      .text(`Total: ${d3.sum(filteredData, d => d.value)}`);
      
    // Clean up on unmount
    return () => {
      if (tooltipRef.current && document.body.contains(tooltipRef.current)) {
        document.body.removeChild(tooltipRef.current);
      }
    };
      
  }, [data, title, colors]);

  return (
    <Card className="card-cyber h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="w-full h-[400px]"> {/* Increased height */}
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox="0 0 700 400"
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PieChart;
