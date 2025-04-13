
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExtendedAttack } from "@/lib/mock-data";

type CountryDetailProps = {
  countryName: string;
  attacks: ExtendedAttack[];
};

const CountryDetail = ({ countryName, attacks }: CountryDetailProps) => {
  if (!countryName) {
    return (
      <Card className="card-cyber h-full">
        <CardHeader>
          <CardTitle>Country Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Select a country on the map to view details</p>
        </CardContent>
      </Card>
    );
  }
  
  // Filter attacks related to this country (either as origin or target)
  const filteredAttacks = attacks.filter(
    attack => attack.origin_country === countryName || attack.target_country === countryName
  );
  
  // Count incoming and outgoing attacks
  const incomingAttacks = attacks.filter(attack => attack.target_country === countryName);
  const outgoingAttacks = attacks.filter(attack => attack.origin_country === countryName);
  
  // Count attacks by type
  const attackTypes = filteredAttacks.reduce((acc, attack) => {
    acc[attack.type] = (acc[attack.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Top protocols
  const protocols = filteredAttacks.reduce((acc, attack) => {
    acc[attack.proto] = (acc[attack.proto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get top destination ports
  const destPorts = filteredAttacks.reduce((acc, attack) => {
    const port = attack.dpt.toString();
    acc[port] = (acc[port] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort ports by count and get top 5
  const topPorts = Object.entries(destPorts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  return (
    <Card className="card-cyber h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">
          {countryName}
          <Badge variant="outline" className="ml-2">
            {filteredAttacks.length} attacks
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col p-4 border border-border rounded-md">
            <span className="text-muted-foreground text-sm">Incoming</span>
            <span className="text-xl font-semibold text-cyber-danger">{incomingAttacks.length}</span>
          </div>
          <div className="flex flex-col p-4 border border-border rounded-md">
            <span className="text-muted-foreground text-sm">Outgoing</span>
            <span className="text-xl font-semibold text-cyber-info">{outgoingAttacks.length}</span>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Attack Types</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(attackTypes).map(([type, count]) => (
              <Badge key={type} variant="secondary">
                {type}: {count}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Protocols</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(protocols).map(([proto, count]) => (
              <Badge key={proto} variant="outline">
                {proto}: {count}
              </Badge>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Top Target Ports</h3>
          <div className="flex flex-wrap gap-2">
            {topPorts.map(([port, count]) => (
              <Badge key={port} variant="default" className="bg-primary/20">
                Port {port}: {count}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountryDetail;
