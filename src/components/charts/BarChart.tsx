
import { useRef, useEffect } from "react";
import * as d3 from "d3";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type BarChartProps = {
  data: { label: string; value: number }[];
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
  horizontal?: boolean;
};

const BarChart = ({
  data,
  title,
  xAxisLabel = "",
  yAxisLabel = "",
  color = "var(--primary)",
  horizontal = false,
}: BarChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    const sortedData = [...data].sort((a, b) => b.value - a.value);
    
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
    let xScale, yScale;

    if (horizontal) {
      // Horizontal bar chart
      xScale = d3
        .scaleLinear()
        .domain([0, d3.max(sortedData, d => d.value) || 0])
        .range([0, width]);

      yScale = d3
        .scaleBand()
        .domain(sortedData.map(d => d.label))
        .range([0, height])
        .padding(0.2);

      // Add X axis
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).ticks(5))
        .selectAll("text")
        .style("font-size", "12px"); // Increased font size

      // Add Y axis
      svg.append("g")
        .call(d3.axisLeft(yScale))
        .selectAll("text")
        .style("font-size", "12px") // Increased font size
        .attr("transform", "rotate(0)")
        .style("text-anchor", "end");

      // Add bars with improved styling
      svg
        .selectAll(".bar")
        .data(sortedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => yScale(d.label) || 0)
        .attr("height", yScale.bandwidth())
        .attr("x", 0)
        .attr("width", d => xScale(d.value))
        .attr("fill", color)
        .attr("rx", 3) // Rounded corners
        .attr("ry", 3)
        .attr("opacity", 0.85) // Slightly transparent
        .on("mouseover", function() {
          d3.select(this).attr("opacity", 1).attr("stroke", "var(--accent)").attr("stroke-width", 1);
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 0.85).attr("stroke", "none");
        });
        
      // Add value labels
      svg
        .selectAll(".value-label")
        .data(sortedData)
        .enter()
        .append("text")
        .attr("x", d => xScale(d.value) + 5)
        .attr("y", d => (yScale(d.label) || 0) + yScale.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("fill", "currentColor")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .text(d => d.value);
        
    } else {
      // Vertical bar chart
      xScale = d3
        .scaleBand()
        .domain(sortedData.map(d => d.label))
        .range([0, width])
        .padding(0.2);

      yScale = d3
        .scaleLinear()
        .domain([0, d3.max(sortedData, d => d.value) || 0])
        .nice()
        .range([height, 0]);

      // Add X axis
      svg
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-size", "12px") // Increased font size
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

      // Add Y axis
      svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5))
        .selectAll("text")
        .style("font-size", "12px"); // Increased font size

      // Add bars with improved styling
      svg
        .selectAll(".bar")
        .data(sortedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.label) || 0)
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.value))
        .attr("height", d => height - yScale(d.value))
        .attr("fill", color)
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("opacity", 0.85)
        .on("mouseover", function() {
          d3.select(this).attr("opacity", 1).attr("stroke", "var(--accent)").attr("stroke-width", 1);
        })
        .on("mouseout", function() {
          d3.select(this).attr("opacity", 0.85).attr("stroke", "none");
        });
        
      // Add value labels
      svg
        .selectAll(".value-label")
        .data(sortedData)
        .enter()
        .append("text")
        .attr("x", d => (xScale(d.label) || 0) + xScale.bandwidth() / 2)
        .attr("y", d => yScale(d.value) - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .text(d => d.value);
    }

    // Add X axis label
    if (xAxisLabel) {
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .text(xAxisLabel)
        .attr("fill", "currentColor")
        .style("font-size", "14px"); // Increased font size
    }

    // Add Y axis label
    if (yAxisLabel) {
      svg
        .append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 15)
        .attr("x", -height / 2)
        .text(yAxisLabel)
        .attr("fill", "currentColor")
        .style("font-size", "14px"); // Increased font size
    }

  }, [data, title, xAxisLabel, yAxisLabel, color, horizontal]);

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

export default BarChart;
