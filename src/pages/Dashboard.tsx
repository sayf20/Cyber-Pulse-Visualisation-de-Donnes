import { useState, useEffect } from "react";
import Header from "@/components/Header";
import WorldMap from "@/components/WorldMap";
import AttackTable from "@/components/AttackTable";
import CountryDetail from "@/components/CountryDetail";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import TimeSeriesChart from "@/components/charts/TimeSeriesChart";
import MapControls from "@/components/MapControls";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  generateExtendedMockAttacks, 
  processAttacksByCountry, 
  processAttacksByMonth, 
  processAttacksByHour, 
  processAttacksByProtocol, 
  processAttacksByHost, 
  processAttacksByType, 
  processTimeSeriesData,
  processAttacksByPort,
  processAttacksBySource,
  processAttacksByYearMonth,
  ExtendedAttack
} from "@/lib/mock-data";

const Dashboard = () => {
  const [attacks, setAttacks] = useState<ExtendedAttack[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isAnimationPaused, setIsAnimationPaused] = useState(false);
  const [isLightTheme, setIsLightTheme] = useState(false);
  const [selectedAttackType, setSelectedAttackType] = useState("All");
  const [animationSpeed, setAnimationSpeed] = useState(5); // 1-10 scale (5 is medium)
  const [isSimultaneousAttacks, setIsSimultaneousAttacks] = useState(false); // Changed default to sequential
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate loading data
    const loadData = async () => {
      try {
        // In a real app, we would fetch the data here
        // const response = await fetch('/api/attacks');
        // const data = await response.json();
        
        // Using extended mock data with 500 entries, starting from Jan 1, 2024
        setTimeout(() => {
          // Set the start date to January 1, 2024
          const startDate = new Date(2024, 0, 1);
          const currentDate = new Date();
          
          const mockAttacks = generateExtendedMockAttacks(500, startDate, currentDate);
          setAttacks(mockAttacks);
          setLoading(false);
          
          toast({
            title: "Extended data loaded",
            description: `Using enhanced dataset with 500 entries from ${startDate.toLocaleDateString()} to ${currentDate.toLocaleDateString()}`,
          });
        }, 1000);
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load attack data. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    loadData();
  }, [toast]);
  
  const handleCountryClick = (countryName: string) => {
    setSelectedCountry(countryName);
    
    toast({
      title: `Selected ${countryName}`,
      description: `Showing data for ${countryName}`,
    });
  };
  
  const toggleAnimationPause = () => {
    setIsAnimationPaused(prev => !prev);
    toast({
      title: isAnimationPaused ? "Animation resumed" : "Animation paused",
      description: isAnimationPaused ? "Attack animations are now playing" : "Attack animations have been paused",
    });
  };
  
  const toggleMapTheme = () => {
    setIsLightTheme(prev => !prev);
    toast({
      title: "Map theme changed",
      description: isLightTheme ? "Using enhanced contrast theme" : "Using standard theme",
    });
  };

  const toggleSimultaneousAttacks = () => {
    setIsSimultaneousAttacks(prev => !prev);
    toast({
      title: "Animation mode changed",
      description: isSimultaneousAttacks ? 
        "Showing attacks sequentially" : 
        "Showing all attacks simultaneously",
    });
  };

  const handleAttackTypeChange = (type: string) => {
    setSelectedAttackType(type);
    toast({
      title: "Attack filter applied",
      description: type === "All" ? 
        "Showing all attack types" : 
        `Filtering to show only ${type} attacks`,
    });
  };

  const handleSpeedChange = (speed: number) => {
    setAnimationSpeed(speed);
    toast({
      title: "Animation speed changed",
      description: `Attack animation speed set to ${speed}/10`,
    });
  };
  
  // Process data for charts
  const byMonth = processAttacksByMonth(attacks);
  const byCountry = processAttacksByCountry(attacks);
  const byHour = processAttacksByHour(attacks);
  const byProtocol = processAttacksByProtocol(attacks);
  const byHost = processAttacksByHost(attacks);
  const byType = processAttacksByType(attacks);
  const timeSeries = processTimeSeriesData(attacks, new Date(2024, 0, 1), new Date());
  
  // New data processing for extended metrics
  const byPort = processAttacksByPort(attacks);
  const bySource = processAttacksBySource(attacks);
  const byYearMonth = processAttacksByYearMonth(attacks);
  
  return (
    <div className="min-h-screen flex flex-col dark">
      <Header />
      
      <main className="flex-1 container-cyber py-6">
        <h1 className="text-3xl font-bold mb-6 text-gradient animate-fade-in-up">Cyber Attack Visualization Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 animate-fade-in-up">
            <MapControls 
              isAnimationPaused={isAnimationPaused}
              toggleAnimationPause={toggleAnimationPause}
              isLightTheme={isLightTheme}
              toggleMapTheme={toggleMapTheme}
              selectedAttackType={selectedAttackType}
              setSelectedAttackType={handleAttackTypeChange}
              animationSpeed={animationSpeed}
              setAnimationSpeed={handleSpeedChange}
              isSimultaneousAttacks={isSimultaneousAttacks}
              toggleSimultaneousAttacks={toggleSimultaneousAttacks}
            />
            <WorldMap 
              attacks={attacks}
              width={800}
              height={500}
              onCountryClick={handleCountryClick}
              isAnimationPaused={isAnimationPaused}
              isLightTheme={isLightTheme}
              selectedAttackType={selectedAttackType}
              animationSpeed={animationSpeed}
              isSimultaneousAttacks={isSimultaneousAttacks}
            />
          </div>
          
          <div className="animate-slide-in-right">
            <CountryDetail 
              countryName={selectedCountry}
              attacks={attacks}
            />
          </div>
        </div>
        
        <div className="mb-8 animate-scale-in">
          <AttackTable attacks={attacks} />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4 animate-fade-in-up">Attack Analytics</h2>
          
          <Tabs defaultValue="timeline" className="w-full"> {/* Changed default tab to timeline */}
            <TabsList className="mb-2">
              <TabsTrigger value="charts" className="text-lg">Charts</TabsTrigger>
              <TabsTrigger value="timeline" className="text-lg">Timeline</TabsTrigger>
              <TabsTrigger value="extended" className="text-lg">Extended Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="charts" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="chart-anim-1 animate-fade-in-up">
                  <BarChart 
                    data={byCountry}
                    title="Top Countries Targeted"
                    xAxisLabel="Count"
                    yAxisLabel="Country"
                    color="var(--primary)"
                    horizontal={true}
                  />
                </div>
                
                <div className="chart-anim-2 animate-scale-in">
                  <PieChart 
                    data={byProtocol}
                    title="Attacks by Protocol"
                  />
                </div>
                
                <div className="chart-anim-3 animate-fade-in-up">
                  <BarChart 
                    data={byHour}
                    title="Attacks by Hour of Day"
                    xAxisLabel="Hour"
                    yAxisLabel="Count"
                    color="#3B82F6"
                  />
                </div>
                
                <div className="chart-anim-4 animate-scale-in">
                  <PieChart 
                    data={byType}
                    title="Attack Types"
                  />
                </div>
                
                <div className="chart-anim-5 animate-fade-in-up">
                  <BarChart 
                    data={byMonth}
                    title="Attacks by Month"
                    xAxisLabel="Month"
                    yAxisLabel="Count"
                    color="#10B981"
                  />
                </div>
                
                <div className="chart-anim-6 animate-scale-in">
                  <PieChart 
                    data={byHost}
                    title="Attacks by Host"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-6">
              <Card className="card-cyber animate-fade-in-up">
                <CardContent className="p-0"> {/* Removed padding to maximize space */}
                  <TimeSeriesChart
                    data={timeSeries}
                    title="Attack Frequency Over Time (2024)"
                    xAxisLabel="Date"
                    yAxisLabel="Number of Attacks"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="extended" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="chart-anim-1 animate-fade-in-up">
                  <BarChart 
                    data={byPort}
                    title="Top Targeted Ports"
                    xAxisLabel="Port"
                    yAxisLabel="Count"
                    color="#F97316"
                    horizontal={true}
                  />
                </div>
                
                <div className="chart-anim-2 animate-scale-in">
                  <PieChart 
                    data={bySource}
                    title="Top Attack Sources"
                  />
                </div>
                
                <div className="chart-anim-3 animate-fade-in-up col-span-2">
                  <Card className="card-cyber">
                    <CardContent className="pt-6">
                      <TimeSeriesChart
                        data={byYearMonth.map(item => ({
                          date: new Date(`${item.label}-01`),
                          value: item.value
                        }))}
                        title="Attack Trends by Month"
                        xAxisLabel="Month"
                        yAxisLabel="Number of Attacks"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-border">
        <div className="container-cyber">
          <p>CyberPulse World Map · Cyber Attack Visualization Dashboard</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
