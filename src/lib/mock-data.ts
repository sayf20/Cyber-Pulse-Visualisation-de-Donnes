// Temporary mock data until real data is provided

import { v4 as uuidv4 } from "uuid";
import { format } from 'date-fns';
import { generateRandomDate, isValidDate } from "./mock-data-helpers";

type Attack = {
  id: string;
  type: string;
  origin_country: string;
  origin_coords: [number, number];
  target_country: string;
  target_coords: [number, number];
  time: string;
  proto: string;
  host: string;
  hour: number;
  month: number;
};

// Attack types
const attackTypes = [
  "DDoS", "Phishing", "Malware", "Ransomware", "SQLi", "XSS", 
  "Brute Force", "Zero-Day", "Man-in-the-Middle", "Credential Stuffing"
];

// Protocols with port associations
const protocols = [
  { name: "TCP", ports: [80, 443, 22, 21, 25, 110, 143, 3389] },
  { name: "UDP", ports: [53, 67, 68, 123, 161, 162, 1900, 5353] },
  { name: "HTTP", ports: [80, 8080, 8000, 8008] },
  { name: "HTTPS", ports: [443, 8443] },
  { name: "DNS", ports: [53, 853] },
  { name: "SMTP", ports: [25, 465, 587] },
  { name: "SSH", ports: [22] },
  { name: "FTP", ports: [20, 21] },
  { name: "TELNET", ports: [23] },
  { name: "SNMP", ports: [161, 162] }
];

// Sample hosts with more variety
const hosts = [
  "apache-server", "nginx-01", "db-cluster", "auth-service", "payment-api", 
  "web-frontend", "storage-node", "cdn-edge", "mail-relay", "monitoring", 
  "fw-01", "lb-prod", "app-server-12", "dev-environment", "test-01",
  "vpn-gateway", "kubernetes-master", "docker-registry", "elastic-search",
  "redis-cache", "mysql-primary", "postgres-replica", "neo4j-db", "cassandra-node"
];

// Sample countries with coordinates and country codes
const countries = [
  { name: "United States", code: "US", cc: "840", locale: "en_US", coords: [-95.7129, 37.0902] as [number, number] },
  { name: "China", code: "CN", cc: "156", locale: "zh_CN", coords: [104.1954, 35.8617] as [number, number] },
  { name: "Russia", code: "RU", cc: "643", locale: "ru_RU", coords: [105.3188, 61.5240] as [number, number] },
  { name: "Germany", code: "DE", cc: "276", locale: "de_DE", coords: [10.4515, 51.1657] as [number, number] },
  { name: "Brazil", code: "BR", cc: "076", locale: "pt_BR", coords: [-51.9253, -14.2350] as [number, number] },
  { name: "India", code: "IN", cc: "356", locale: "hi_IN", coords: [78.9629, 20.5937] as [number, number] },
  { name: "United Kingdom", code: "GB", cc: "826", locale: "en_GB", coords: [-3.4360, 55.3781] as [number, number] },
  { name: "France", code: "FR", cc: "250", locale: "fr_FR", coords: [2.2137, 46.2276] as [number, number] },
  { name: "Japan", code: "JP", cc: "392", locale: "ja_JP", coords: [138.2529, 36.2048] as [number, number] },
  { name: "South Korea", code: "KR", cc: "410", locale: "ko_KR", coords: [127.7669, 35.9078] as [number, number] },
  { name: "Australia", code: "AU", cc: "036", locale: "en_AU", coords: [133.7751, -25.2744] as [number, number] },
  { name: "Canada", code: "CA", cc: "124", locale: "en_CA", coords: [-106.3468, 56.1304] as [number, number] },
  { name: "Mexico", code: "MX", cc: "484", locale: "es_MX", coords: [-102.5528, 23.6345] as [number, number] },
  { name: "Italy", code: "IT", cc: "380", locale: "it_IT", coords: [12.5674, 41.8719] as [number, number] },
  { name: "Spain", code: "ES", cc: "724", locale: "es_ES", coords: [-3.7492, 40.4637] as [number, number] },
  { name: "Turkey", code: "TR", cc: "792", locale: "tr_TR", coords: [35.2433, 38.9637] as [number, number] },
  { name: "Netherlands", code: "NL", cc: "528", locale: "nl_NL", coords: [5.2913, 52.1326] as [number, number] },
  { name: "Switzerland", code: "CH", cc: "756", locale: "de_CH", coords: [8.2275, 46.8182] as [number, number] },
  { name: "Sweden", code: "SE", cc: "752", locale: "sv_SE", coords: [18.6435, 60.1282] as [number, number] },
  { name: "Singapore", code: "SG", cc: "702", locale: "en_SG", coords: [103.8198, 1.3521] as [number, number] },
  { name: "Israel", code: "IL", cc: "376", locale: "he_IL", coords: [34.8516, 31.0461] as [number, number] },
  { name: "Ukraine", code: "UA", cc: "804", locale: "uk_UA", coords: [31.1656, 48.3794] as [number, number] }
];

// Generate a random IPv4 address
const generateRandomIP = () => {
  return Array(4).fill(0).map(() => Math.floor(Math.random() * 256)).join('.');
};

// Generate postal codes
const generatePostalCode = (country: string) => {
  switch (country) {
    case "United States":
      return `${Math.floor(10000 + Math.random() * 90000)}`;
    case "Canada":
      return `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)}`;
    case "United Kingdom":
      return `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 10)} ${Math.floor(Math.random() * 10)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    default:
      return `${Math.floor(10000 + Math.random() * 90000)}`;
  }
};

// Generate random coordinates with slight variation from country center
const generateRandomCoords = (baseCoords: [number, number]) => {
  const latVariation = (Math.random() - 0.5) * 10;
  const lonVariation = (Math.random() - 0.5) * 10;
  return [
    baseCoords[0] + lonVariation,
    baseCoords[1] + latVariation
  ];
};

// Extended attack type
export type ExtendedAttack = {
  id: string;
  datetime: string;
  host: string;
  src: string;
  proto: string;
  type: string;
  spt: number;
  dpt: number;
  srcstr: string;
  cc: string;
  country: string;
  locale: string;
  localeabbr: string;
  postalcode: string;
  latitude: number;
  longitude: number;
  year: number;
  month: number;
  day: number;
  time: string;
  hour: number;
  origin_country: string;
  origin_coords: [number, number];
  target_country: string;
  target_coords: [number, number];
};

// Generate comprehensive mock attacks
export const generateExtendedMockAttacks = (
  count: number = 100,
  startDate: Date = new Date(2024, 0, 1),
  endDate: Date = new Date()
): ExtendedAttack[] => {
  const attacks: ExtendedAttack[] = [];
  
  if (!isValidDate(startDate)) startDate = new Date(2024, 0, 1);
  if (!isValidDate(endDate)) endDate = new Date();
  
  if (startDate > endDate) {
    const temp = startDate;
    startDate = endDate;
    endDate = temp;
  }
  
  for (let i = 0; i < count; i++) {
    // Get random origin and target countries
    const originIndex = Math.floor(Math.random() * countries.length);
    let targetIndex;
    do {
      targetIndex = Math.floor(Math.random() * countries.length);
    } while (targetIndex === originIndex);
    
    const originCountry = countries[originIndex];
    const targetCountry = countries[targetIndex];
    
    // Generate random date within the specified range
    const attackDate = generateRandomDate(startDate, endDate);
    
    const year = attackDate.getFullYear();
    const month = attackDate.getMonth() + 1;
    const day = attackDate.getDate();
    const hour = attackDate.getHours();
    const minute = attackDate.getMinutes();
    const second = attackDate.getSeconds();
    
    const formattedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
    const formattedDate = format(attackDate, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    
    // Select random protocol and associated port
    const protocol = protocols[Math.floor(Math.random() * protocols.length)];
    const sourcePort = Math.floor(1024 + Math.random() * 64000);
    const destPort = protocol.ports[Math.floor(Math.random() * protocol.ports.length)];
    
    // Generate precise coordinates with variation
    const exactOriginCoords = generateRandomCoords(originCountry.coords);
    const exactTargetCoords = generateRandomCoords(targetCountry.coords);
    
    attacks.push({
      id: uuidv4(),
      datetime: formattedDate,
      host: hosts[Math.floor(Math.random() * hosts.length)],
      src: generateRandomIP(),
      proto: protocol.name,
      type: attackTypes[Math.floor(Math.random() * attackTypes.length)],
      spt: sourcePort,
      dpt: destPort,
      srcstr: `${originCountry.name}-ISP-${Math.floor(Math.random() * 100)}`,
      cc: originCountry.cc,
      country: originCountry.name,
      locale: originCountry.locale,
      localeabbr: originCountry.code,
      postalcode: generatePostalCode(originCountry.name),
      latitude: exactOriginCoords[1],
      longitude: exactOriginCoords[0],
      year,
      month,
      day,
      time: formattedTime,
      hour,
      origin_country: originCountry.name,
      origin_coords: originCountry.coords,
      target_country: targetCountry.name,
      target_coords: targetCountry.coords
    });
  }
  
  return attacks;
};

// Keep existing utility functions that are still used
export const processAttacksByMonth = (attacks: any[]) => {
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  
  // Count attacks by month
  const monthCounts: Record<string, number> = {};
  
  attacks.forEach(attack => {
    const date = new Date(attack.datetime || attack.time);
    const monthIndex = date.getMonth();
    const monthName = monthNames[monthIndex];
    
    monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
  });
  
  // Convert to array format for D3
  return Object.entries(monthCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => {
      return monthNames.indexOf(a.label) - monthNames.indexOf(b.label);
    });
};

export const processAttacksByCountry = (attacks: any[]) => {
  // Count attacks by target country
  const countryCounts: Record<string, number> = {};
  
  attacks.forEach(attack => {
    countryCounts[attack.target_country] = (countryCounts[attack.target_country] || 0) + 1;
  });
  
  // Convert to array and sort by count
  return Object.entries(countryCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 15);
};

export const processAttacksByHour = (attacks: any[]) => {
  // Count attacks by hour of day
  const hourCounts: Record<string, number> = {};
  
  for (let i = 0; i < 24; i++) {
    // Initialize all hours to zero
    const hourLabel = i.toString().padStart(2, '0') + ':00';
    hourCounts[hourLabel] = 0;
  }
  
  // Count attacks
  attacks.forEach(attack => {
    const hour = attack.hour;
    const hourLabel = hour.toString().padStart(2, '0') + ':00';
    hourCounts[hourLabel] = (hourCounts[hourLabel] || 0) + 1;
  });
  
  // Convert to array format for D3
  return Object.entries(hourCounts)
    .map(([label, value]) => ({ label, value }));
};

export const processAttacksByProtocol = (attacks: any[]) => {
  // Count attacks by protocol
  const protoCounts: Record<string, number> = {};
  
  attacks.forEach(attack => {
    protoCounts[attack.proto] = (protoCounts[attack.proto] || 0) + 1;
  });
  
  // Convert to array format for D3
  return Object.entries(protoCounts)
    .map(([label, value]) => ({ label, value }));
};

export const processAttacksByHost = (attacks: any[]) => {
  // Count attacks by host
  const hostCounts: Record<string, number> = {};
  
  attacks.forEach(attack => {
    hostCounts[attack.host] = (hostCounts[attack.host] || 0) + 1;
  });
  
  // Convert to array format for charts
  return Object.entries(hostCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10); // Limit to top 10 for chart readability
};

export const processAttacksByType = (attacks: any[]) => {
  // Count attacks by type
  const typeCounts: Record<string, number> = {};
  
  attacks.forEach(attack => {
    typeCounts[attack.type] = (typeCounts[attack.type] || 0) + 1;
  });
  
  // Convert to array format for D3
  return Object.entries(typeCounts)
    .map(([label, value]) => ({ label, value }));
};

export const processTimeSeriesData = (
  attacks: ExtendedAttack[],
  startDate: Date = new Date(2024, 0, 1),
  endDate: Date = new Date()
): { date: Date; value: number }[] => {
  // Ensure we have valid dates
  if (!isValidDate(startDate)) startDate = new Date(2024, 0, 1);
  if (!isValidDate(endDate)) endDate = new Date();
  
  // Group attacks by date (YYYY-MM-DD)
  const dateMap = new Map<string, number>();
  
  // Set up all dates in range with 0 values to ensure continuous timeline
  const dateRange = [];
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    dateMap.set(dateKey, 0);
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Count attacks by date
  attacks.forEach(attack => {
    const attackDate = new Date(attack.datetime);
    if (attackDate >= startDate && attackDate <= endDate) {
      const dateKey = attackDate.toISOString().split('T')[0];
      dateMap.set(dateKey, (dateMap.get(dateKey) || 0) + 1);
    }
  });
  
  // Convert map to array of objects
  const result = Array.from(dateMap).map(([dateStr, count]) => ({
    date: new Date(dateStr),
    value: count
  }));
  
  // Sort by date
  return result.sort((a, b) => a.date.getTime() - b.date.getTime());
};

// New processing functions for the extended data

// Process attacks by port
export const processAttacksByPort = (attacks: ExtendedAttack[]) => {
  // Count attacks by destination port
  const portCounts: Record<string, number> = {};
  
  attacks.forEach(attack => {
    const port = attack.dpt.toString();
    portCounts[port] = (portCounts[port] || 0) + 1;
  });
  
  // Convert to array and get top 10 most common ports
  return Object.entries(portCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
};

// Process attacks by source
export const processAttacksBySource = (attacks: ExtendedAttack[]) => {
  // Group by source IP and count
  const sourceCounts: Record<string, number> = {};
  
  attacks.forEach(attack => {
    sourceCounts[attack.src] = (sourceCounts[attack.src] || 0) + 1;
  });
  
  // Get the top sources
  return Object.entries(sourceCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
};

// Process attacks by year/month combinations for time trends
export const processAttacksByYearMonth = (attacks: ExtendedAttack[]) => {
  const yearMonthCounts: Record<string, number> = {};
  
  attacks.forEach(attack => {
    const yearMonth = `${attack.year}-${attack.month.toString().padStart(2, '0')}`;
    yearMonthCounts[yearMonth] = (yearMonthCounts[yearMonth] || 0) + 1;
  });
  
  return Object.entries(yearMonthCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

// For backward compatibility
export const generateMockAttacks = (count = 100): any[] => {
  const extendedAttacks = generateExtendedMockAttacks(count);
  // Convert extended attacks to the previous format for compatibility
  return extendedAttacks.map(attack => ({
    id: attack.id,
    type: attack.type,
    origin_country: attack.origin_country,
    origin_coords: attack.origin_coords,
    target_country: attack.target_country,
    target_coords: attack.target_coords,
    time: attack.datetime,
    proto: attack.proto,
    host: attack.host,
    hour: attack.hour,
    month: attack.month
  }));
};
