
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, isValid } from "date-fns";

type Attack = {
  id: string;
  type: string;
  origin_country: string;
  target_country: string;
  time: string;
  proto: string;
  host: string;
};

const AttackTable = ({ attacks = [] }: { attacks: Attack[] }) => {
  const [sortField, setSortField] = useState<keyof Attack>("time");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  // Sort attacks
  const sortedAttacks = [...attacks].sort((a, b) => {
    if (sortField === "time") {
      return sortDirection === "desc" 
        ? new Date(b.time).getTime() - new Date(a.time).getTime() 
        : new Date(a.time).getTime() - new Date(b.time).getTime();
    }
    
    return sortDirection === "desc" 
      ? b[sortField].localeCompare(a[sortField]) 
      : a[sortField].localeCompare(b[sortField]);
  });
  
  // Handle sort column click
  const handleSortClick = (field: keyof Attack) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  // Get badge color based on attack type
  const getBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "ddos": return "warning";
      case "phishing": return "destructive";
      case "malware": return "default";
      case "ransomware": return "secondary";
      case "sqli": return "success";
      case "xss": return "info";
      default: return "outline";
    }
  };
  
  // Format relative time safely
  const formatRelativeTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      if (!isValid(date)) {
        return "Invalid date";
      }
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error("Error formatting date:", timeString, error);
      return "Invalid date";
    }
  };
  
  return (
    <Card className="card-cyber h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center justify-between">
          Latest Attacks
          <Badge variant="outline">{attacks.length} total</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-auto max-h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="w-[100px] cursor-pointer" 
                  onClick={() => handleSortClick("type")}
                >
                  Type {sortField === "type" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => handleSortClick("origin_country")}
                >
                  Origin {sortField === "origin_country" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => handleSortClick("target_country")}
                >
                  Target {sortField === "target_country" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => handleSortClick("proto")}
                >
                  Protocol {sortField === "proto" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead 
                  className="cursor-pointer text-right" 
                  onClick={() => handleSortClick("time")}
                >
                  Time {sortField === "time" && (sortDirection === "asc" ? "↑" : "↓")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAttacks.length > 0 ? (
                sortedAttacks.map((attack) => (
                  <TableRow key={attack.id}>
                    <TableCell>
                      <Badge variant={getBadgeVariant(attack.type) as any}>
                        {attack.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{attack.origin_country}</TableCell>
                    <TableCell>{attack.target_country}</TableCell>
                    <TableCell>{attack.proto}</TableCell>
                    <TableCell className="text-right">
                      {formatRelativeTime(attack.time)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No attack data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttackTable;
