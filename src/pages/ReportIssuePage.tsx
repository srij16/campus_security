import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  SAMPLE_ISSUES, 
  analyzeIssueImage, 
  generateAISummary, 
  findDuplicateComplaints,
  SampleIssuePreset 
} from '../services/aiService';
import { Department, Priority, Complaint } from '../types';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  Building2, 
  ArrowRight, 
  Wrench, 
  ThumbsUp, 
  FileImage,
  RefreshCw
} from 'lucide-react';
import { PriorityBadge } from '../components/common/PriorityBadge';

export const ReportIssuePage: React.FC = () => {
  const { 
    buildings, 
    complaints, 
    createComplaint, 
    setActiveTab, 
    setSelectedComplaintId,
    upvoteComplaint,
    showToast 
  } = useApp();

  // Form State
  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_ISSUES[0].image);
  const [imageFileName, setImageFileName] = useState<string>('sample_ceiling_fan.jpg');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [aiConfidence, setAiConfidence] = useState<number | null>(96.4);

  // Form Fields (Editable by user)
  const [building, setBuilding] = useState<string>(buildings[0].name);
  const [floor, setFloor] = useState<string>(buildings[0].floors[0]);
  const [roomNumber, setRoomNumber] = useState<string>('Room 101');
  const [specificSpot, setSpecificSpot] = useState<string>('Center ceiling fixture');
  
  const [category, setCategory] = useState<string>(SAMPLE_ISSUES[0].category);
  const [department, setDepartment] = useState<Department>(SAMPLE_ISSUES[0].department);
  const [priority, setPriority] = useState<Priority>(SAMPLE_ISSUES[0].priority);
  const [issueTitle, setIssueTitle] = useState<string>(SAMPLE_ISSUES[0].suggestedTitle);
  const [description, setDescription] = useState<string>(SAMPLE_ISSUES[0].suggestedDescription);
  const [aiSummary, setAiSummary] = useState<string>('');

  // Duplicate Match State
  const [duplicateTicket, setDuplicateTicket] = useState<Complaint | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update floors when building changes
  const selectedBuildingData = buildings.find((b: any) => b.name === building) || buildings[0];

  // Run AI Image Analysis
  const runAIAnalysis = async (imageUrl: string, filename: string) => {
    setIsScanning(true);
    setSelectedImage(imageUrl);
    setImageFileName(filename);

    try {
      const result = await analyzeIssueImage(imageUrl, filename);
      setCategory(result.category);
      setDepartment(result.department);
      setPriority(result.priority);
      setIssueTitle(result.suggestedTitle);
      setDescription(result.suggestedDescription);
      setAiConfidence(result.confidenceScore);

      const generatedSummary = generateAISummary(
        result.category,
        result.department,
        result.priority,
        { building, room: roomNumber }
      );
      setAiSummary(generatedSummary);
      showToast('AI Analysis Complete', `Identified ${result.category} (${result.priority} Priority)`, 'success');
    } catch (e) {
      showToast('Analysis Error', 'Failed to scan image. Please enter details manually.', 'warning');
    } finally {
      setIsScanning(false);
    }
  };

  // Check duplicate whenever building, room, or category changes
  useEffect(() => {
    const duplicate = findDuplicateComplaints(building, roomNumber, category, complaints);
    setDuplicateTicket(duplicate);
  }, [building, roomNumber, category, complaints]);

  // Initial summary generation
  useEffect(() => {
    const summary = generateAISummary(category, department, priority, { building, room: roomNumber });
    setAiSummary(summary);
  }, [category, department, priority, building, roomNumber]);

  // Handle custom file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        runAIAnalysis(base64, file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Sample Preset Selection
  const handleSelectSample = (sample: SampleIssuePreset) => {
    runAIAnalysis(sample.image, sample.name);
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      showToast('Image Required', 'Please upload or select an issue photograph.', 'warning');
      return;
    }

    const created = await createComplaint({
      title: issueTitle || `${category} in ${roomNumber}`,
      description: description || aiSummary,
      aiSummary: aiSummary || description,
      category,
      department,
      priority,
      location: {
        building,
        floor,
        room: roomNumber,
        specificSpot
      },
      imageUrl: selectedImage,
      confidenceScore: aiConfidence || 95.0
    });

    if (created) {
      setSelectedComplaintId(created.id);
      setActiveTab('details');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="text-center sm:text-left space-y-2 border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Multimodal AI Vision Classification</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
          Report Campus Maintenance Issue
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          Upload an image of the problem. Our AI will automatically identify the fault category, determine priority, route to the correct department, and draft your ticket.
        </p>
      </div>

      {/* Duplicate Alert Notice from PDF page 7 */}
      {duplicateTicket && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-950/40 border border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-200">
                Similar Complaint Already Exists in this Location!
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                Ticket <span className="font-mono font-bold text-white">#{duplicateTicket.id}</span> ("{duplicateTicket.title}") is currently <span className="font-semibold text-white">{duplicateTicket.status}</span>.
              </p>
              <p className="text-xs text-slate-300 mt-1 font-medium italic">
                "A similar complaint already exists. Would you like to support this report instead?"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                upvoteComplaint(duplicateTicket.id);
                showToast('Upvoted', `Added your support to Ticket ${duplicateTicket.id}!`, 'success');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 text-black hover:bg-amber-300 flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)]"
            >
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>Upvote Existing ({duplicateTicket.upvotes})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedComplaintId(duplicateTicket.id);
                setActiveTab('details');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
            >
              View Ticket
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Left = Photo & Presets, Right = AI Auto-Filled Form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Image Uploader & Quick Presets (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Image Preview & Scanner Frame */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Issue Photograph
              </span>
              {aiConfidence && !isScanning && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {aiConfidence}% AI Match
                </span>
              )}
            </div>

            {/* Viewport with Scanner Beam */}
            <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center group">
              {selectedImage ? (
                <>
                  <img
                    src={selectedImage}
                    alt="Uploaded issue"
                    className="w-full h-full object-cover"
                  />

                  {/* AI Scanning Beam Overlay */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-cyan-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                      <div className="w-full h-1 bg-cyan-400 absolute scanner-beam" />
                      <div className="p-3 rounded-2xl bg-black/80 border border-cyan-500/50 flex items-center gap-2 text-cyan-300 text-xs font-bold shadow-2xl">
                        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                        <span>AI Vision Scanning Pixels...</span>
                      </div>
                    </div>
                  )}

                  {/* Top Badge Overlay */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5">
                    <FileImage className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate max-w-[160px]">{imageFileName}</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 space-y-2 text-slate-500">
                  <Camera className="w-12 h-12 mx-auto text-slate-600" />
                  <p className="text-xs">No image selected</p>
                </div>
              )}
            </div>

            {/* Upload Buttons */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload From Device</span>
              </button>
            </div>
          </div>

          {/* Quick Hackathon Test Samples Selector */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Quick Test Image Presets</span>
              </h3>
              <span className="text-[10px] text-slate-500">Click to scan instantly</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
              {SAMPLE_ISSUES.map((sample: SampleIssuePreset) => (
                <div
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-2 group ${
                    selectedImage === sample.image
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={sample.thumbnail}
                    alt={sample.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                      {sample.name}
                    </p>
                    <span className="text-[9px] text-slate-400 block truncate">
                      {sample.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Auto-Classification & Form Fields (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* AI Auto-Classified Badges Summary Card */}
          <div className="p-5 rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-[4px_4px_0px_#38bdf8] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-white">AI Vision Triage Output</h3>
              </div>
              <span className="text-[10px] text-cyan-400 font-medium">Fields auto-filled & fully editable</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Category */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Detected Category</span>
                <p className="text-xs font-bold text-cyan-300 truncate">{category}</p>
              </div>

              {/* Responsible Department */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Target Department</span>
                <p className="text-xs font-bold text-indigo-300 flex items-center gap-1">
                  <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{department}</span>
                </p>
              </div>

              {/* Priority */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Priority</span>
                <div>
                  <PriorityBadge priority={priority} size="sm" />
                </div>
              </div>
            </div>

            {/* AI Generated Summary Box matching PDF page 7 */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800/80 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1 text-cyan-400">
                  <Sparkles className="w-3 h-3" /> Auto-Generated AI Summary
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Standardized Protocol</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed italic">
                "{aiSummary || 'Scanning location and category context...'}"
              </p>
            </div>
          </div>

          {/* Form Fields: Location & Metadata */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-5">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>2. Location & Detailed Specifications</span>
            </h3>

            {/* Building & Floor Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Campus Building *</label>
                <select
                  value={building}
                  onChange={(e) => {
                    const newBld = e.target.value;
                    setBuilding(newBld);
                    const bData = buildings.find((b: any) => b.name === newBld);
                    if (bData && bData.floors.length > 0) {
                      setFloor(bData.floors[0]);
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {buildings.map((b: any) => (
                    <option key={b.id} value={b.name}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Floor Level *</label>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  {selectedBuildingData.floors.map((fl: string, i: number) => (
                    <option key={i} value={fl}>
                      {fl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Number & Specific Spot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Room / Hall / Lab Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 204, Seminar Hall B, Lab 3"
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Specific Landmark / Spot (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Near window lintel, Next to water cooler"
                  value={specificSpot}
                  onChange={(e) => setSpecificSpot(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Department & Priority Overrides */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Department Routing</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Civil">Civil</option>
                  <option value="IT">IT</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Critical">Critical (Exposed wires, gas/floods)</option>
                  <option value="High">High (Water leaks, projectors)</option>
                  <option value="Medium">Medium (Broken chair, fan wobble)</option>
                  <option value="Low">Low (Peeling paint, cosmetic)</option>
                </select>
              </div>
            </div>

            {/* Issue Title & Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Issue Title (Optional)</label>
              <input
                type="text"
                placeholder="Brief headline of the issue..."
                value={issueTitle}
                onChange={(e) => setIssueTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Additional Description Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Any special safety notes or observations..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 leading-relaxed"
              />
            </div>

            {/* Submit CTA */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={isScanning}
                className="w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-purple-400 text-black border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-purple-300 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Submit Ticket & Dispatch to {department}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
