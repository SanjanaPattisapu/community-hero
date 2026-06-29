import React, { useState } from "react";
import { CivicIssue } from "../types";
import { updateIssueStatus, resetDatabase } from "../services/api";
import { Settings, Shield, Edit3, Trash2, Check, RefreshCw, Layers, MapPin, Sparkles } from "lucide-react";

interface AdminPanelProps {
  issues: CivicIssue[];
  onStatusUpdated: (issue: CivicIssue) => void;
  onResetDb: (issues: CivicIssue[]) => void;
  onDeleteIssueLocal: (id: string) => void;
}

export default function AdminPanel({
  issues,
  onStatusUpdated,
  onResetDb,
  onDeleteIssueLocal
}: AdminPanelProps) {
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(
    issues.length > 0 ? issues[0].id : null
  );
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("Assigned");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const activeIssue = issues.find((i) => i.id === selectedIssueId);

  const departments = [
    "Department of Public Works (DPW) - Road Maintenance",
    "Department of Public Health - Environmental Services",
    "San Francisco Water Power Sewer (SFPUC)",
    "Public Utilities Commission - Street Lighting Bureau",
    "Recreation & Parks Department - Forestry Division",
    "Municipal Transportation Agency (SFMTA)",
    "Department of Building Inspection"
  ];

  const statuses = [
    "Reported",
    "AI Verified",
    "Community Verified",
    "Assigned",
    "Work Started",
    "Resolved"
  ];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueId) return;
    setIsUpdating(true);
    try {
      const res = await updateIssueStatus(selectedIssueId, status, department || undefined);
      if (res.success) {
        onStatusUpdated(res.issue);
        alert("Issue status updated successfully on backend, timelines updated, and user alert triggered!");
      }
    } catch (e) {
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm("Are you sure you want to reset the database? This restores high-fidelity seeds and clears custom entries.")) return;
    setIsResetting(true);
    try {
      const res = await resetDatabase();
      if (res.success) {
        onResetDb(res.issues);
        alert("Database successfully reset to standard high-fidelity mock seeds!");
      }
    } catch (e) {
      alert("Failed to reset database.");
    } finally {
      setIsResetting(false);
    }
  };

  // Simulated soft delete of spam reports
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to flag and remove this report as spam? This deletes it from the active database.")) {
      onDeleteIssueLocal(id);
      alert("Report deleted successfully.");
      if (selectedIssueId === id) {
        setSelectedIssueId(issues.length > 1 ? issues[0].id : null);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300 text-left bg-[#FFF8F5] dark:bg-[#1C1715]">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#3A3A3A] dark:text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-[#FF6B6B]" /> Municipal Admin Hub
          </h1>
          <p className="text-sm text-[#777777] dark:text-[#A89F9D] mt-1">
            Dispatch street crews, update resolution lifespans, filter reports, and reset standard schemas.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="px-4 py-2 bg-[#FF6B6B] hover:bg-[#FF8A65] text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isResetting ? "animate-spin" : ""}`} /> Reset Database Seeds
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Complaints Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#221C1A] p-6 rounded-3xl border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm overflow-hidden">
          <h3 className="text-xs font-bold text-[#777777] uppercase tracking-wider mb-4">Active Public works ledger ({issues.length} cases)</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F2D5CC] dark:border-[#3E302C] text-[#777777] dark:text-[#A89F9D]">
                  <th className="pb-3 font-extrabold text-left uppercase tracking-wider">Report Details</th>
                  <th className="pb-3 font-extrabold text-left uppercase tracking-wider hidden sm:table-cell">Area / Street</th>
                  <th className="pb-3 font-extrabold text-center uppercase tracking-wider">Severity</th>
                  <th className="pb-3 font-extrabold text-center uppercase tracking-wider">Status</th>
                  <th className="pb-3 font-extrabold text-center uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-[#777777]">No active complaints in ledger. Click Reset above to populate.</td>
                  </tr>
                ) : (
                  issues.map((issue) => {
                    const isSelected = issue.id === selectedIssueId;
                    return (
                      <tr
                        key={issue.id}
                        onClick={() => {
                          setSelectedIssueId(issue.id);
                          setStatus(issue.status);
                          setDepartment(issue.department || "");
                        }}
                        className={`border-b border-neutral-50 dark:border-neutral-800 last:border-0 hover:bg-[#FFF9F7] dark:hover:bg-[#2C211E]/30 cursor-pointer ${
                          isSelected ? "bg-[#FFF2EE] dark:bg-[#2E201E]/40 font-bold" : ""
                        }`}
                      >
                        <td className="py-4 pr-3 max-w-[200px]">
                          <span className="block font-bold text-[#3A3A3A] dark:text-white truncate">{issue.title}</span>
                          <span className="text-[10px] text-[#777777] block mt-0.5">{issue.category}</span>
                        </td>
                        <td className="py-4 pr-3 text-[#777777] dark:text-[#A89F9D] hidden sm:table-cell">
                          📍 {issue.address.split(",")[0]}
                        </td>
                        <td className="py-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            issue.severity === "Critical" ? "bg-red-100 text-red-700" :
                            issue.severity === "High" ? "bg-orange-100 text-orange-700" :
                            issue.severity === "Medium" ? "bg-yellow-100 text-yellow-700" : "bg-neutral-100 text-neutral-700"
                          }`}>
                            {issue.severity}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-[#FFF0EB] text-[#FF6B6B] border border-[#FFD6C9]">
                            {issue.status}
                          </span>
                        </td>
                        <td className="py-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleDelete(issue.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                            title="Delete / Spam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Actions Controller (4 cols) */}
        <div className="lg:col-span-4">
          {activeIssue ? (
            <form onSubmit={handleUpdate} className="bg-white dark:bg-[#221C1A] p-6 rounded-3xl border border-[#F2D5CC] dark:border-[#3E302C] shadow-sm text-left space-y-5">
              
              <div className="border-b border-neutral-50 dark:border-neutral-800 pb-3">
                <h3 className="text-sm font-bold text-[#3A3A3A] dark:text-white flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-[#FF6B6B]" /> Modify Resolution State
                </h3>
                <p className="text-[10px] text-[#777777] dark:text-[#A89F9D] mt-1">Updating: "{activeIssue.title}"</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase mb-1.5">Dispatch Target Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[#FFF8F5] dark:bg-[#2C211E] border border-[#F2D5CC] dark:border-[#3E302C] text-[#3A3A3A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#FF6B6B]"
                >
                  <option value="">Choose municipal agency...</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#777777] dark:text-[#A89F9D] uppercase mb-1.5">Resolution Milestone Stage</label>
                <div className="space-y-2">
                  {statuses.map((stat) => (
                    <button
                      key={stat}
                      type="button"
                      onClick={() => setStatus(stat)}
                      className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold border text-left flex justify-between items-center transition-all ${
                        status === stat
                          ? "text-white bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] border-transparent"
                          : "text-[#3A3A3A] dark:text-[#E3DCDA] bg-white dark:bg-[#2A2321] border-[#F2D5CC] dark:border-[#3E302C] hover:border-[#FFD6C9]"
                      }`}
                    >
                      <span>{stat}</span>
                      {status === stat && <Check className="w-4 h-4 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8A65] text-white font-extrabold rounded-2xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Publish Case Changes"}
              </button>

            </form>
          ) : (
            <div className="p-12 text-center text-xs text-[#777777] bg-white dark:bg-[#221C1A] rounded-2xl border border-neutral-100">
              Select an issue from the ledger to dispatch crews or modify timelines.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
