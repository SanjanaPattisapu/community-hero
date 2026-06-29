import React, { useState, useEffect } from "react";
import { CivicIssue, UserProfile } from "../types";
import { analyzeImage, enhanceComplaintText, detectDuplicates, upvoteIssue } from "../services/api";
import CustomMap from "./CustomMap";
import {
  Sparkles,
  MapPin,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Trash2,
  Compass,
  ArrowRight,
  FileVideo
} from "lucide-react";

interface ReportIssueProps {
  issues: CivicIssue[];
  user: UserProfile;
  onSubmitReport: (payload: any) => void;
  darkMode: boolean;
  onNavigateToDashboard: () => void;
}

export default function ReportIssue({
  issues,
  user,
  onSubmitReport,
  darkMode,
  onNavigateToDashboard
}: ReportIssueProps) {
  // Form fields
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState(37.7749);
  const [longitude, setLongitude] = useState(-122.4194);
  const [address, setAddress] = useState("San Francisco, CA");
  
  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // AI loading and output states
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isEnhancingText, setIsEnhancingText] = useState(false);
  const [enhancedTextDraft, setEnhancedTextDraft] = useState<string | null>(null);

  // Duplicates state
  const [duplicateIssues, setDuplicateIssues] = useState<CivicIssue[]>([]);
  const [isDetectingDuplicates, setIsDetectingDuplicates] = useState(false);

  // Form submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const categories = [
    "Pothole",
    "Garbage",
    "Water Leakage",
    "Broken Streetlight",
    "Damaged Road",
    "Drainage Problem",
    "Illegal Dumping",
    "Fallen Tree",
    "Other"
  ];

  // Auto detect duplicates whenever location or category changes
  useEffect(() => {
    let active = true;
    if (latitude && longitude && category) {
      setIsDetectingDuplicates(true);
      detectDuplicates(latitude, longitude, category)
        .then((dups) => {
          if (active) {
            setDuplicateIssues(dups);
            setIsDetectingDuplicates(false);
          }
        })
        .catch(() => {
          if (active) setIsDetectingDuplicates(false);
        });
    }
    return () => {
      active = false;
    };
  }, [latitude, longitude, category]);

  // Geolocation detector
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(parseFloat(position.coords.latitude.toFixed(5)));
          setLongitude(parseFloat(position.coords.longitude.toFixed(5)));
          setAddress(`Near ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}, San Francisco, CA`);
        },
        (error) => {
          alert("Location authorization declined. Please select coordinates by clicking our interactive vector map.");
        }
      );
    } else {
      alert("Browser Geolocation is not supported. Please use the interactive map.");
    }
  };

  // Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Process selected image
  const processImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Call server-side Gemini AI Vision model
    setIsAnalyzingImage(true);
    setAiAnalysis(null);
    try {
      const base64Data = await fileToBase64(file);
      const data = await analyzeImage(base64Data);
      
      setAiAnalysis(data);
      // Auto pre-fill predicted categories and update category state!
      if (data.category && categories.includes(data.category)) {
        setCategory(data.category);
      }
    } catch (e: any) {
      console.error("Image analysis failed:", e);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Image Upload inputs
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  // Drag and Drop helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImage(e.dataTransfer.files[0]);
    }
  };

  // Trigger Gemini AI description rewrite
  const handleEnhanceDescription = async () => {
    if (!description.trim()) {
      alert("Please enter a basic description before enhancing.");
      return;
    }
    setIsEnhancingText(true);
    setEnhancedTextDraft(null);
    try {
      const res = await enhanceComplaintText(description);
      setEnhancedTextDraft(res.enhancedText);
    } catch (e: any) {
      alert("AI rewrite failed. Please check connection.");
    } finally {
      setIsEnhancingText(false);
    }
  };

  // Accept Gemini AI text draft
  const handleAcceptDraft = () => {
    if (enhancedTextDraft) {
      setDescription(enhancedTextDraft);
      setEnhancedTextDraft(null);
    }
  };

  // Upvote duplicate instead of submitting new
  const handleUpvoteDuplicate = async (issueId: string) => {
    try {
      await upvoteIssue(issueId);
      alert("Successfully supported duplicate issue! Taking you to the active dashboard.");
      onNavigateToDashboard();
    } catch (e) {
      alert("Failed to upvote duplicate issue.");
    }
  };

  // Submit complete complaint report
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage("Please enter an issue description.");
      return;
    }
    if (!address.trim()) {
      setErrorMessage("Please supply a valid localized address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Package payload
      const payload = {
        title: `Reported ${category} at ${address.split(",")[0]}`,
        description,
        category,
        latitude,
        longitude,
        address,
        imageUrl: imagePreview || undefined, // Since we don't have true cloud bucket storage, passing local objectURL or default is handled gracefully by server
        aiAnalysis: aiAnalysis ? {
          aiConfidence: aiAnalysis.aiConfidence,
          aiSummary: aiAnalysis.aiSummary,
          severity: aiAnalysis.severity,
          priority: aiAnalysis.priority,
          department: aiAnalysis.department,
          safetyRisk: aiAnalysis.safetyRisk
        } : undefined
      };

      await onSubmitReport(payload);
    } catch (e: any) {
      setErrorMessage(e.message || "Failed to submit. Try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 text-left bg-[#FFF8F5] dark:bg-[#1C1715]">
      
      {/* Page Header */}
      <div className="mb-8 max-w-4xl">
        <h1 className="text-3xl font-extrabold text-[#3A3A3A] dark:text-white">Report New Local Concern</h1>
        <p className="text-sm text-[#777777] dark:text-[#A89F9D] mt-2">
          File a complaint with photo verification. Our integrated Gemini AI automatically processes categories, severity, safety risks, and routes reports directly to city departments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Panel (Left) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white dark:bg-[#221C1A] p-6 rounded-3xl border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm space-y-6">
          
          <h2 className="text-base font-extrabold text-[#3A3A3A] dark:text-white border-b border-neutral-50 dark:border-neutral-800 pb-3">Complaint Submission</h2>

          {/* User Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wide mb-1.5">Reporter Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-neutral-50 dark:bg-[#1E1816] border border-neutral-200 dark:border-neutral-800 text-[#777777] dark:text-[#A89F9D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wide mb-1.5">Phone Number</label>
              <input
                type="tel"
                placeholder="(415) 555-0199"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FFF8F5] dark:bg-[#2C211E] border border-[#F2D5CC] dark:border-[#3E302C] text-[#3A3A3A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
              />
            </div>
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wide mb-1.5">Issue Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    category === cat
                      ? "text-white bg-[#FF6B6B] border-[#FF6B6B]"
                      : "text-[#3A3A3A] dark:text-[#E3DCDA] bg-white dark:bg-[#2A2321] border-[#F2D5CC] dark:border-[#3E302C] hover:border-[#FFD6C9]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Photo & Video Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Image Upload Area */}
            <div>
              <label className="block text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wide mb-1.5">Upload Verification Photo</label>
              
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isDragOver
                    ? "border-[#FF6B6B] bg-[#FFF3F0] dark:bg-[#2F2220]"
                    : "border-[#F2D5CC] dark:border-[#3E302C] hover:border-[#FFD6C9] bg-[#FFFDFD] dark:bg-[#1E1917]"
                }`}
              >
                {imagePreview ? (
                  <div className="w-full h-full p-2 relative">
                    <img src={imagePreview} className="w-full h-full object-cover rounded-xl" alt="Preview" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                        setAiAnalysis(null);
                      }}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-red-500 text-white shadow-md cursor-pointer hover:scale-105"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
                    <ImageIcon className="w-8 h-8 text-[#FF6B6B] mb-2 animate-pulse" />
                    <span className="block text-xs font-bold text-[#3A3A3A] dark:text-white">Drag & drop image here</span>
                    <span className="block text-[10px] text-[#777777] mt-1">or click to browse files</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Optional Video Upload Area */}
            <div>
              <label className="block text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wide mb-1.5">Upload Supplementary Video (Optional)</label>
              
              <div className="h-44 rounded-2xl border-2 border-dashed border-[#F2D5CC] dark:border-[#3E302C] bg-[#FFFDFD] dark:bg-[#1E1917] flex flex-col items-center justify-center p-4">
                {videoFile ? (
                  <div className="text-center">
                    <FileVideo className="w-10 h-10 text-green-500 mx-auto" />
                    <span className="block text-xs font-bold text-[#3A3A3A] dark:text-white mt-2 truncate max-w-[150px]">{videoFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setVideoFile(null)}
                      className="mt-3 px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-bold"
                    >
                      Remove Video
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                    <FileVideo className="w-8 h-8 text-[#FF8A65] mb-2" />
                    <span className="block text-xs font-bold text-[#3A3A3A] dark:text-white">Attach supplementary video</span>
                    <span className="block text-[10px] text-[#777777] mt-1">Formats: MP4, MOV (max 20mb)</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

          </div>

          {/* Description with AI Enhance Trigger */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wide">Tell us what happened</label>
              
              <button
                type="button"
                onClick={handleEnhanceDescription}
                disabled={isEnhancingText || !description.trim()}
                className="px-3 py-1 rounded-lg text-[10px] font-extrabold bg-[#FFF0EB] text-[#FF6B6B] hover:bg-[#FFD6C9] disabled:opacity-40 transition-all flex items-center gap-1 cursor-pointer"
              >
                {isEnhancingText ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Rewriting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#FF6B6B]" /> AI Enhance Draft
                  </>
                )}
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="e.g. There is a huge leaking pipe on the sidewalk, it's spraying clean drinking water and flooding the local bicycle path..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-xs bg-[#FFF8F5] dark:bg-[#2C211E] border border-[#F2D5CC] dark:border-[#3E302C] text-[#3A3A3A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
            />

            {/* AI Review Drawer */}
            {enhancedTextDraft && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-tr from-[#FFFDFB] to-[#FFF5F2] dark:from-[#2A211E] dark:to-[#221B19] border border-[#FFD6C9] dark:border-[#3E2925] space-y-3">
                <span className="text-[10px] font-black text-[#FF6B6B] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Proposed Professional Rewrite Draft
                </span>
                <p className="text-xs text-[#3A3A3A] dark:text-[#E3DCDA] leading-relaxed italic bg-white/70 dark:bg-[#1C1715]/50 p-3 rounded-lg border border-[#F2D5CC]/40">
                  "{enhancedTextDraft}"
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptDraft}
                    className="px-3.5 py-1.5 rounded-lg bg-green-500 text-white text-[11px] font-bold shadow-sm"
                  >
                    Accept Rewrite
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnhancedTextDraft(null)}
                    className="px-3.5 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-500 text-[11px] font-bold"
                  >
                    Discard
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Location & GPS Coordinate selectors */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <label className="block text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase tracking-wide">Coordinates & Address</label>
                <p className="text-[10px] text-[#777777]">Drag pin on map or enter manually.</p>
              </div>
              <button
                type="button"
                onClick={handleDetectLocation}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-[#F2D5CC] dark:border-[#3E302C] text-xs font-bold text-[#FF6B6B] flex items-center gap-1 hover:bg-neutral-50 cursor-pointer"
              >
                <Compass className="w-4 h-4 text-[#FF6B6B] animate-spin" style={{ animationDuration: "5s" }} /> Detect GPS Position
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] text-[#777777]">Latitude</label>
                <input
                  type="number"
                  step="0.00001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-50 dark:bg-[#1E1816] border border-neutral-200 text-[#3A3A3A] dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[#777777]">Longitude</label>
                <input
                  type="number"
                  step="0.00001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-neutral-50 dark:bg-[#1E1816] border border-neutral-200 text-[#3A3A3A] dark:text-white"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="block text-[10px] text-[#777777]">Address / Nearest landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-[#FFF8F5] dark:bg-[#2C211E] border border-[#F2D5CC] dark:border-[#3E302C] text-[#3A3A3A] dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Coordinate selecting custom map */}
            <CustomMap
              issues={issues}
              selectable
              onSelectCoordinates={(lat, lng, addr) => {
                setLatitude(lat);
                setLongitude(lng);
                setAddress(addr);
              }}
              defaultLat={latitude}
              defaultLng={longitude}
              darkMode={darkMode}
              onSelectIssue={() => {}}
            />
          </div>

          {/* DUPLICATE ALERTS WARNING PANEL */}
          {duplicateIssues.length > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-[#FFF7F4] to-[#FFF0EB] border-2 border-orange-300 dark:border-orange-900/60 text-left space-y-3.5">
              <div className="flex gap-2">
                <ShieldAlert className="w-5 h-5 text-[#FF8A65] shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-[#3A3A3A]">Similar Issue Already Filed Nearby!</h4>
                  <p className="text-[11px] text-[#777777] leading-normal mt-0.5">
                    We detected a {category} already reported within 500m of your coordinates. You can support this existing concern to increase municipal priority rather than creating a duplicate.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-[#251E1C] rounded-xl border border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
                <div className="text-xs">
                  <span className="block font-bold text-[#3A3A3A] dark:text-white">{duplicateIssues[0].title}</span>
                  <span className="text-[10px] text-[#777777] italic">Status: {duplicateIssues[0].status}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpvoteDuplicate(duplicateIssues[0].id)}
                  className="px-3.5 py-1.5 bg-[#FF6B6B] hover:bg-[#FF8A65] text-white rounded-lg text-[10px] font-black shadow-sm"
                >
                  ▲ Support This Instead
                </button>
              </div>
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold">
              ⚠ {errorMessage}
            </div>
          )}

          {/* Submit Trigger Buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] text-white font-extrabold text-xs shadow-md hover:scale-[1.01] transition-transform flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting to City Hub...
                </>
              ) : (
                <>
                  Submit Issue Report <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="px-5 py-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-bold text-xs"
            >
              Cancel
            </button>
          </div>

        </form>

        {/* AI Diagnostics Panel (Right Side) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white dark:bg-[#221C1A] p-6 rounded-3xl border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-left space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-50 dark:border-neutral-800 pb-3">
              <h3 className="text-xs font-bold text-[#777777] uppercase tracking-wider">AI Vision Diagnostics</h3>
              <span className="text-[10px] bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] bg-clip-text text-transparent font-black flex items-center gap-0.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF6B6B]" /> Gemini Real-Time
              </span>
            </div>

            {isAnalyzingImage ? (
              <div className="py-12 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#FF6B6B] animate-spin mx-auto" />
                <p className="text-xs font-bold text-[#FF6B6B] animate-pulse">Gemini AI is analyzing visual pixels...</p>
                <p className="text-[10px] text-[#777777]">Detecting asphalt cracks, water leaks, and municipal routing...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-4">
                
                {/* Confidence banner */}
                <div className="p-3.5 rounded-xl bg-green-50/70 dark:bg-[#203024] border border-green-200/50 dark:border-[#304B37] text-green-800 dark:text-green-300 flex justify-between items-center text-xs">
                  <span className="font-extrabold flex items-center gap-1">✓ Category Confirmed: {aiAnalysis.category}</span>
                  <span className="font-mono">{Math.round(aiAnalysis.aiConfidence * 100)}% match</span>
                </div>

                {/* Summary Card */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#2B2321] border border-neutral-100 dark:border-[#3E302C]">
                  <span className="text-[9px] uppercase tracking-wider text-[#777777] dark:text-[#A89F9D] font-bold block">AI Summary</span>
                  <p className="text-xs text-[#3A3A3A] dark:text-[#E3DCDA] leading-relaxed mt-1.5 italic">
                    "{aiAnalysis.aiSummary}"
                  </p>
                </div>

                {/* Side-by-side details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1E1917] text-xs">
                    <span className="text-[9px] text-[#777777] dark:text-[#A89F9D] block uppercase font-bold">Severity</span>
                    <span className="font-extrabold text-[#3A3A3A] dark:text-white block mt-0.5">{aiAnalysis.severity}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1E1917] text-xs">
                    <span className="text-[9px] text-[#777777] dark:text-[#A89F9D] block uppercase font-bold">Priority</span>
                    <span className="font-extrabold text-[#3A3A3A] dark:text-white block mt-0.5">{aiAnalysis.priority}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FFF5F2] dark:bg-[#2E201E] text-xs">
                  <span className="text-[9px] text-[#FF6B6B] block uppercase font-bold">Target Department</span>
                  <span className="font-extrabold text-[#3A3A3A] dark:text-white block mt-0.5">{aiAnalysis.department}</span>
                </div>

                {aiAnalysis.safetyRisk && (
                  <div className="p-3.5 rounded-xl bg-red-50/70 dark:bg-[#321C1C] border border-red-200/50 dark:border-[#522929] text-[10px] text-red-700 dark:text-red-300 flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#F16A6A] shrink-0" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wide block">Identified Hazard Risks</span>
                      <span className="block mt-0.5 leading-normal">{aiAnalysis.safetyRisk}</span>
                    </div>
                  </div>
                )}

                <div className="text-[10px] text-[#777777] italic text-center pt-2">
                  *AI generated diagnostics are instantly pre-filled into your city complaint.
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#777777] dark:text-[#A89F9D]">
                No image loaded. Upload a photo of the concern (e.g., pothole, broken streetlight) to trigger instant Google Gemini diagnostics.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
