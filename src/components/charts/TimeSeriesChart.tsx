
import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isValidDate } from "@/lib/mock-data-helpers";

type TimeSeriesProps = {
  data: { date: Date; value: number }[];
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
};

const TimeSeriesChart = ({
  data,
  title,
  xAxisLabel = "Time",
  yAxisLabel = "Count",
  color = "var(--primary)",
}: TimeSeriesProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;
    
    // Validate dates and filter out invalid ones
    const validData = data.filter(d => isValidDate(d.date));
    
    if (validData.length === 0) {
      console.error("No valid data points for time series chart");
      return;
    }

    // Create tooltip if it doesn't exist
    if (!tooltipRef.current) {
      const tooltip = document.createElement("div");
      tooltip.className = "cyber-tooltip hidden";
      document.body.appendChild(tooltip);
      tooltipRef.current = tooltip;
    }

    // Sort data by date
    const sortedData = [...validData].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Clear previous chart
    d3.select(svgRef.current).selectAll("*").remove();

    // Set dimensions - Increased margins for better labeling
    const margin = { top: 30, right: 40, bottom: 70, left: 70 };
    const width = svgRef.current.clientWidth - margin.left - margin.right;
    const height = svgRef.current.clientHeight - margin.top - margin.bottom;

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(sortedData, d => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, d => d.value) || 0])
      .nice()
      .range([height, 0]);

    // Add grid lines for better readability
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xScale)
          .ticks(10)
          .tickSize(-height)
          .tickFormat(() => "")
      )
      .attr("color", "var(--border)")
      .attr("opacity", 0.3);
      
    svg.append("g")
      .attr("class", "grid")
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => "")
      )
      .attr("color", "var(--border)")
      .attr("opacity", 0.3);

    // Add X axis with improved styling
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.timeFormat("%b %d, %Y" as any)))
      .selectAll("text")
      .style("font-size", "12px") // Increased font size
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Add Y axis with improved styling
    svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(8))
      .selectAll("text")
      .style("font-size", "12px"); // Increased font size

    // Create line generator
    const line = d3
      .line<{ date: Date; value: number }>()
      .defined(d => !isNaN(d.value))
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add area with gradient fill
    const gradientId = `area-gradient-${Math.random().toString(36).substring(2, 9)}`;
    
    // Add gradient definition
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", gradientId)
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
      
    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.7);
      
    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", color)
      .attr("stop-opacity", 0.05);

    // Add area
    svg
      .append("path")
      .datum(sortedData)
      .attr("fill", `url(#${gradientId})`) // Use gradient
      .attr("d", d3.area<{ date: Date, value: number }>()
        .defined(d => !isNaN(d.value))
        .x(d => xScale(d.date))
        .y0(height)
        .y1(d => yScale(d.value))
        .curve(d3.curveMonotoneX)
      );

    // Add line path with improved styling
    svg
      .append("path")
      .datum(sortedData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 3) // Thicker line
      .attr("d", line as any);

    // Create crosshair elements
    const crosshairVertical = svg
      .append("line")
      .attr("class", "crosshair")
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "currentColor")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0);

    const crosshairHorizontal = svg
      .append("line")
      .attr("class", "crosshair")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("stroke", "currentColor")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4,4")
      .style("opacity", 0);

    // Value indicators
    const dateIndicator = svg
      .append("text")
      .attr("class", "indicator")
      .attr("text-anchor", "middle")
      .attr("y", height + 50)
      .style("font-size", "12px")
      .style("opacity", 0);

    const valueIndicator = svg
      .append("text")
      .attr("class", "indicator")
      .attr("text-anchor", "end")
      .attr("x", -10)
      .style("font-size", "12px")
      .style("opacity", 0);

    // Create a transparent overlay for mouse interaction
    const bisect = d3.bisector<{date: Date, value: number}, Date>((d) => d.date).left;
    
    svg.append("rect")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mousemove", function(event) {
        // Get x mouse position
        const x0 = xScale.invert(d3.pointer(event)[0]);
        const i = bisect(sortedData, x0, 1);
        
        // Handle edge cases
        if (i <= 0 || i >= sortedData.length) return;
        
        const d0 = sortedData[i - 1];
        const d1 = sortedData[i];
        if (!d0 || !d1) return;
        
        // Find the closest point
        const d = x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;
        
        // X position for the vertical crosshair
        const xPos = xScale(d.date);
        // Y position for the horizontal crosshair
        const yPos = yScale(d.value);
        
        // Update crosshairs
        crosshairVertical
          .attr("x1", xPos)
          .attr("x2", xPos)
          .style("opacity", 0.7);
        
        crosshairHorizontal
          .attr("y1", yPos)
          .attr("y2", yPos)
          .style("opacity", 0.7);
          
        // Update indicators
        dateIndicator
          .attr("x", xPos)
          .text(d3.timeFormat("%b %d, %Y")(d.date))
          .style("opacity", 1);
          
        valueIndicator
          .attr("y", yPos)
          .text(d.value)
          .style("opacity", 1);
        
        // Move the focus circle
        focus
          .attr("cx", xPos)
          .attr("cy", yPos)
          .attr("opacity", 1);
        
        // Update the tooltip
        if (tooltipRef.current) {
          tooltipRef.current.innerHTML = `
            <div class="font-bold">${d3.timeFormat("%b %d, %Y")(d.date)}</div>
            <div>Value: ${d.value}</div>
          `;
          tooltipRef.current.classList.remove("hidden");
          tooltipRef.current.style.left = `${event.pageX + 15}px`;
          tooltipRef.current.style.top = `${event.pageY}px`;
        }
      })
      .on("mouseleave", function() {
        // Hide crosshairs when mouse leaves
        crosshairVertical.style("opacity", 0);
        crosshairHorizontal.style("opacity", 0);
        dateIndicator.style("opacity", 0);
        valueIndicator.style("opacity", 0);
        focus.attr("opacity", 0);
        
        if (tooltipRef.current) {
          tooltipRef.current.classList.add("hidden");
        }
      });

    // Add dots with improved styling and interactivity
    svg
      .selectAll(".dot")
      .data(sortedData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.value))
      .attr("r", 4) // Larger dots
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .attr("opacity", 0.7)
      .on("mouseover", function(event, d) {
        d3.select(this)
          .attr("r", 6)
          .attr("opacity", 1);
          
        if (tooltipRef.current) {
          tooltipRef.current.innerHTML = `
            <div class="font-bold">${d3.timeFormat("%b %d, %Y")(d.date)}</div>
            <div>Value: ${d.value}</div>
          `;
          tooltipRef.current.classList.remove("hidden");
          tooltipRef.current.style.left = `${event.pageX + 15}px`;
          tooltipRef.current.style.top = `${event.pageY}px`;
        }
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 4)
          .attr("opacity", 0.7);
          
        if (tooltipRef.current) {
          tooltipRef.current.classList.add("hidden");
        }
      });
      
    // Add a focus circle that follows mouse
    const focus = svg.append("circle")
      .attr("class", "focus")
      .attr("r", 6)
      .attr("fill", color)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .attr("opacity", 0);

    // Add X axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text(xAxisLabel)
      .attr("fill", "currentColor")
      .style("font-size", "14px"); // Increased font size

    // Add Y axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15)
      .attr("x", -height / 2)
      .text(yAxisLabel)
      .attr("fill", "currentColor")
      .style("font-size", "14px"); // Increased font size
      
    // Clean up on unmount
    return () => {
      if (tooltipRef.current && document.body.contains(tooltipRef.current)) {
        document.body.removeChild(tooltipRef.current);
      }
    };

  }, [data, title, xAxisLabel, yAxisLabel, color]);

  // Updated date range display to show actual start date (January 1, 2024)
  const startDate = new Date(2024, 0, 1);
  const endDate = new Date();
  const dateRangeText = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

  return (
    <Card className="card-cyber h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          From {startDate.toLocaleDateString()}
          {" to "}
          {endDate.toLocaleDateString()}
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="w-full h-[600px]"> {/* Increased height from 500px to 600px */}
          <svg
            ref={svgRef}
            className="w-full h-full"
            viewBox="0 0 1000 600" /* Increased from 900x500 to 1000x600 */
            preserveAspectRatio="xMidYMid meet"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChart;
