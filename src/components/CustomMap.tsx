import React, { useState } from "react";
import { CivicIssue } from "../types";
import { MapPin, ZoomIn, ZoomOut, Compass, Sparkles, ShieldAlert, CheckCircle2 } from "lucide-react";

interface CustomMapProps {
  issues: CivicIssue[];
  selectedIssueId?: string;
  onSelectIssue: (id: string) => void;
  selectable?: boolean;
  onSelectCoordinates?: (lat: number, lng: number, address: string) => void;
  defaultLat?: number;
  defaultLng?: number;
  darkMode: boolean;
}

export default function CustomMap({
  issues,
  selectedIssueId,
  onSelectIssue,
  selectable = false,
  onSelectCoordinates,
  defaultLat = 37.7749,
  defaultLng = -122.4194,
  darkMode
}: CustomMapProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinCoordinates, setPinCoordinates] = useState<{ lat: number; lng: number } | null>(
    selectable ? { lat: defaultLat, lng: defaultLng } : null
  );

  // Map limits
  // Center is SF 37.7749, -122.4194
  // Mapping coords to a 800x600 viewBox
  const mapWidth = 800;
  const mapHeight = 600;
  
  const minLat = 37.7600;
  const maxLat = 37.7900;
  const minLng = -122.4600;
  const maxLng = -122.4000;

  const latToY = (lat: number) => {
    // Latitude decreases as we go down
    const pct = (lat - minLat) / (maxLat - minLat);
    return mapHeight - pct * mapHeight;
  };

  const lngToX = (lng: number) => {
    // Longitude increases as we go right
    const pct = (lng - minLng) / (maxLng - minLng);
    return pct * mapWidth;
  };

  const yToLat = (y: number) => {
    const pct = (mapHeight - y) / mapHeight;
    return minLat + pct * (maxLat - minLat);
  };

  const xToLng = (x: number) => {
    const pct = x / mapWidth;
    return minLng + pct * (maxLng - minLng);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) return;
    
    // Calculate click coordinates relative to the SVG map layout taking zoom and offsets into account
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    // Get click coordinates inside client bounding box
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Inverse transform zoom and offset
    const mapX = (clientX - offset.x - rect.width / 2) / zoom + mapWidth / 2;
    const mapY = (clientY - offset.y - rect.height / 2) / zoom + mapHeight / 2;

    if (mapX >= 0 && mapX <= mapWidth && mapY >= 0 && mapY <= mapHeight) {
      const clickedLat = yToLat(mapY);
      const clickedLng = xToLng(mapX);

      if (selectable && onSelectCoordinates) {
        setPinCoordinates({ lat: clickedLat, lng: clickedLng });
        
        // Approximate a beautiful address based on neighborhood sector
        let streetName = "Market St";
        let number = Math.floor(Math.random() * 1200) + 100;
        
        if (clickedLat > 37.780) {
          streetName = clickedLng > -122.420 ? "Powell St, Union Square" : "Geary Blvd, Fillmore District";
        } else if (clickedLat < 37.770) {
          streetName = clickedLng > -122.420 ? "Mission St, Mission District" : "Valencia St, Dolores Heights";
        } else {
          streetName = clickedLng < -122.430 ? "Hayes St, Hayes Valley" : "Civic Center Plaza, Downtown";
        }

        const calculatedAddress = `${number} ${streetName}, San Francisco, CA 94103`;
        onSelectCoordinates(
          parseFloat(clickedLat.toFixed(5)),
          parseFloat(clickedLng.toFixed(5)),
          calculatedAddress
        );
      }
    }
  };

  const handleZoom = (factor: number) => {
    setZoom((prev) => Math.max(0.7, Math.min(prev * factor, 4)));
  };

  const handleReset = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  };

  // Helper for marker colors based on severity
  const getMarkerColor = (issue: CivicIssue) => {
    if (issue.status === "Resolved") return "#7BC47F"; // Green
    if (issue.severity === "Critical") return "#F16A6A"; // Red
    if (issue.severity === "High") return "#FF8A65"; // Accent Orange
    if (issue.severity === "Medium") return "#F6B756"; // Warning Yellow
    return "#FFD6C9"; // Peach Low
  };

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden shadow-inner border border-[#F2D5CC] dark:border-[#3E302C] bg-[#FFF8F5] dark:bg-[#1C1715]">
      {/* Map Control Rail */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => handleZoom(1.2)}
          className="p-2.5 rounded-xl bg-white dark:bg-[#2A2321] text-[#FF6B6B] hover:scale-105 transition-transform shadow-md border border-[#F2D5CC] dark:border-[#3E302C] flex items-center justify-center cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleZoom(0.8)}
          className="p-2.5 rounded-xl bg-white dark:bg-[#2A2321] text-[#FF6B6B] hover:scale-105 transition-transform shadow-md border border-[#F2D5CC] dark:border-[#3E302C] flex items-center justify-center cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        <button
          onClick={handleReset}
          className="p-2.5 rounded-xl bg-white dark:bg-[#2A2321] text-[#FF6B6B] hover:scale-105 transition-transform shadow-md border border-[#F2D5CC] dark:border-[#3E302C] flex items-center justify-center cursor-pointer"
          title="Recenter"
        >
          <Compass className="w-5 h-5" />
        </button>
      </div>

      {/* Floating Interactive Guide */}
      <div className="absolute bottom-4 left-4 z-10 p-3 rounded-xl bg-white/95 dark:bg-[#2A2321]/95 text-xs text-[#3A3A3A] dark:text-[#E3DCDA] shadow-lg border border-[#F2D5CC] dark:border-[#3E302C] max-w-xs backdrop-blur-sm">
        {selectable ? (
          <p className="flex items-center gap-1.5 font-medium text-[#FF6B6B]">
            <MapPin className="w-4 h-4 animate-bounce" /> Click anywhere on the map to pin your reported issue!
          </p>
        ) : (
          <div className="space-y-1.5">
            <p className="font-semibold text-xs uppercase tracking-wider text-[#777777] dark:text-[#A89F9D]">Hyperlocal Map Guide</p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F16A6A] inline-block animate-pulse"></span> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#FF8A65] inline-block"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#F6B756] inline-block"></span> Medium</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#7BC47F] inline-block"></span> Resolved</span>
            </div>
          </div>
        )}
      </div>

      {/* Vector SVG Stage */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleMapClick}
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      >
        <g transform={`translate(${offset.x + mapWidth / 2}, ${offset.y + mapHeight / 2}) scale(${zoom}) translate(${-mapWidth / 2}, ${-mapHeight / 2})`}>
          
          {/* BACKGROUND LANDMASS */}
          <rect width={mapWidth} height={mapHeight} fill={darkMode ? "#1C1715" : "#FFF8F5"} rx="16" />

          {/* THE BAY / WATERWAYS */}
          <path
            d="M 680,0 L 800,0 L 800,220 L 710,180 Q 640,120 680,0 Z"
            fill={darkMode ? "#1E2A38" : "#E1EDFA"}
            opacity="0.85"
          />

          {/* GOLDEN GATE PARK (WEST SIDE SECTOR) */}
          <rect
            x="0"
            y="260"
            width="220"
            height="140"
            fill={darkMode ? "#1C2D1F" : "#E3F4E5"}
            stroke={darkMode ? "#243E2A" : "#C4ECD0"}
            strokeWidth="1.5"
            rx="8"
          />
          <text
            x="110"
            y="335"
            textAnchor="middle"
            fill={darkMode ? "#3C6044" : "#6DA37A"}
            className="text-[10px] font-bold tracking-wider uppercase select-none"
          >
            Golden Gate Park
          </text>

          {/* PRESIDIO (NORTH-WEST SECTOR) */}
          <path
            d="M 0,0 L 180,0 Q 140,120 110,140 Q 60,130 0,100 Z"
            fill={darkMode ? "#1C2D1F" : "#E3F4E5"}
            stroke={darkMode ? "#243E2A" : "#C4ECD0"}
            strokeWidth="1.5"
          />
          <text
            x="70"
            y="60"
            textAnchor="middle"
            fill={darkMode ? "#3C6044" : "#6DA37A"}
            className="text-[10px] font-bold tracking-wider uppercase"
          >
            Presidio
          </text>

          {/* MAJOR VECTOR TRANSIT STREETS */}
          {/* Market Street (Diagonals) */}
          <line
            x1="0"
            y1="500"
            x2="800"
            y2="100"
            stroke={darkMode ? "#2B211F" : "#FFE2DA"}
            strokeWidth="24"
            strokeLinecap="round"
          />
          <line
            x1="0"
            y1="500"
            x2="800"
            y2="100"
            stroke={darkMode ? "#3E312F" : "#FFF0EB"}
            strokeWidth="4"
            strokeDasharray="8 6"
            strokeLinecap="round"
          />

          {/* Powell Street */}
          <line
            x1="520"
            y1="0"
            x2="520"
            y2="600"
            stroke={darkMode ? "#271E1C" : "#F4DDD4"}
            strokeWidth="14"
          />
          
          {/* Mission Street */}
          <line
            x1="0"
            y1="550"
            x2="800"
            y2="150"
            stroke={darkMode ? "#271E1C" : "#F4DDD4"}
            strokeWidth="14"
          />

          {/* Geary Blvd */}
          <line
            x1="0"
            y1="190"
            x2="800"
            y2="190"
            stroke={darkMode ? "#271E1C" : "#F4DDD4"}
            strokeWidth="14"
          />

          {/* Oak / Fell St (Park access lines) */}
          <line
            x1="0"
            y1="330"
            x2="520"
            y2="330"
            stroke={darkMode ? "#271E1C" : "#F4DDD4"}
            strokeWidth="12"
          />

          {/* Fillmore St */}
          <line
            x1="320"
            y1="0"
            x2="320"
            y2="600"
            stroke={darkMode ? "#271E1C" : "#F4DDD4"}
            strokeWidth="10"
          />

          {/* STREET LABELS */}
          <text
            x="480"
            y="245"
            transform="rotate(-26, 480, 245)"
            fill={darkMode ? "#554A47" : "#B2978F"}
            className="text-[9px] font-medium tracking-widest uppercase italic"
          >
            Market Street
          </text>
          <text
            x="510"
            y="120"
            transform="rotate(90, 510, 120)"
            fill={darkMode ? "#554A47" : "#B2978F"}
            className="text-[8px] font-medium tracking-widest uppercase"
          >
            Powell St
          </text>
          <text
            x="200"
            y="320"
            fill={darkMode ? "#554A47" : "#B2978F"}
            className="text-[8px] font-medium tracking-widest uppercase"
          >
            Fell St
          </text>

          {/* NEIGHBORHOOD LABELS */}
          <text x="320" y="440" textAnchor="middle" fill={darkMode ? "#6E5E5A" : "#9E8279"} className="text-[11px] font-bold uppercase tracking-widest opacity-60">
            Hayes Valley
          </text>
          <text x="590" y="490" textAnchor="middle" fill={darkMode ? "#6E5E5A" : "#9E8279"} className="text-[11px] font-bold uppercase tracking-widest opacity-60">
            Mission District
          </text>
          <text x="580" y="160" textAnchor="middle" fill={darkMode ? "#6E5E5A" : "#9E8279"} className="text-[11px] font-bold uppercase tracking-widest opacity-60">
            Union Square
          </text>
          <text x="350" y="130" textAnchor="middle" fill={darkMode ? "#6E5E5A" : "#9E8279"} className="text-[11px] font-bold uppercase tracking-widest opacity-60">
            Fillmore
          </text>

          {/* REPORT ACTIVE ISSUES MARKERS */}
          {!selectable && issues.map((issue) => {
            const x = lngToX(issue.longitude);
            const y = latToY(issue.latitude);
            const isSelected = issue.id === selectedIssueId;
            const markerColor = getMarkerColor(issue);

            return (
              <g
                key={issue.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectIssue(issue.id);
                }}
              >
                {/* Ping rings */}
                {issue.status !== "Resolved" && (
                  <>
                    <circle r="22" fill={markerColor} opacity="0.12" className="animate-ping" style={{ animationDuration: "2.5s" }} />
                    <circle r="12" fill={markerColor} opacity="0.22" className="animate-pulse" />
                  </>
                )}
                
                {/* Pin stem or base shadow */}
                <ellipse cx="0" cy="4" rx="5" ry="2" fill="rgba(0, 0, 0, 0.25)" />

                {/* Marker body */}
                <g transform={isSelected ? "scale(1.3) translate(0, -6)" : "translate(0, -2)"} className="transition-transform duration-300">
                  <path
                    d="M0 -15 C-8 -15, -8 -5, 0 4 C8 -5, 8 -15, 0 -15 Z"
                    fill={markerColor}
                    stroke={isSelected ? (darkMode ? "#FFF" : "#333") : (darkMode ? "#221C1A" : "#FFF")}
                    strokeWidth={isSelected ? 2 : 1.5}
                    shadow="lg"
                  />
                  {/* Inside point */}
                  <circle cx="0" cy="-8" r="3" fill={darkMode ? "#1C1715" : "#FFF"} />
                </g>
              </g>
            );
          })}

          {/* SELECTABLE PIN REPORT STATE */}
          {selectable && pinCoordinates && (
            <g transform={`translate(${lngToX(pinCoordinates.lng)}, ${latToY(pinCoordinates.lat)})`}>
              <circle r="24" fill="#FF6B6B" opacity="0.15" className="animate-ping" />
              <ellipse cx="0" cy="4" rx="6" ry="2.5" fill="rgba(0, 0, 0, 0.3)" />
              <g transform="translate(0, -6)" className="animate-bounce" style={{ animationDuration: "1.5s" }}>
                <path
                  d="M0 -15 C-8 -15, -8 -5, 0 4 C8 -5, 8 -15, 0 -15 Z"
                  fill="#FF6B6B"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                />
                <circle cx="0" cy="-8" r="3" fill="#FFFFFF" />
              </g>
            </g>
          )}

        </g>
      </svg>

      {/* Floating Coordinate Overlay */}
      {selectable && pinCoordinates && (
        <div className="absolute top-4 left-4 p-2 rounded-lg bg-[#FF6B6B] text-white text-[11px] font-mono font-medium shadow-md flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> Pinned: {pinCoordinates.lat.toFixed(4)}°, {pinCoordinates.lng.toFixed(4)}°
        </div>
      )}
    </div>
  );
}
