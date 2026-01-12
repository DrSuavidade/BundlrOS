import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ApprovalService } from "../services";
import { GeminiService } from "../services/geminiService";
import { ApprovalRequest, ApprovalStatus } from "../types";
import { StatusBadge } from "../components/StatusBadge";
import {
  ArrowLeft,
  Clock,
  Paperclip,
  Share2,
  MessageSquare,
  Send,
  Sparkles,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

export const ApprovalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [approval, setApproval] = useState<ApprovalRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [comment, setComment] = useState("");

  // For drafting
  const [aiDraftOpen, setAiDraftOpen] = useState(false);
  const [draftType, setDraftType] = useState<"APPROVE" | "REJECT">("APPROVE");
  const [draftContent, setDraftContent] = useState("");
  const [drafting, setDrafting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      const data = await ApprovalService.getById(id);
      if (data) setApproval(data);
      setLoading(false);
    };
    fetch();
  }, [id]);

  const handleGenerateSummary = async () => {
    if (!approval) return;
    setSummaryLoading(true);
    const text = await GeminiService.summarizeRequest(approval.description);
    setSummary(text);
    setSummaryLoading(false);
  };

  const handleCopyLink = () => {
    if (!approval) return;
    const url = `${window.location.origin}/#/verify/${approval.token}`;
    navigator.clipboard.writeText(url);
    alert("Client verification link copied to clipboard!");
  };

  const handleSendReminder = async () => {
    if (!approval) return;
    await ApprovalService.sendReminder(approval.id);
    const updated = await ApprovalService.getById(approval.id);
    if (updated) setApproval(updated);
  };

  const openDraft = async (type: "APPROVE" | "REJECT") => {
    setDraftType(type);
    setAiDraftOpen(true);
    setDrafting(true);
    setDraftContent("AI is thinking...");
    const text = await GeminiService.draftResponse(
      type,
      approval?.title + " - " + approval?.description || ""
    );
    setDraftContent(text);
    setDrafting(false);
  };

  const handleDecision = async () => {
    if (!approval) return;
    setLoading(true);
    await ApprovalService.updateStatus(
      approval.id,
      draftType === "APPROVE"
        ? ApprovalStatus.APPROVED
        : ApprovalStatus.REJECTED,
      draftContent,
      "Admin"
    );
    const updated = await ApprovalService.getById(approval.id);
    if (updated) setApproval(updated);
    setAiDraftOpen(false);
    setLoading(false);
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    );
  if (!approval) return <div>Not Found</div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" /> Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
          >
            <Share2 size={16} /> Share Link
          </button>
          {approval.status === ApprovalStatus.PENDING && (
            <button
              onClick={handleSendReminder}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
            >
              Send Reminder
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <StatusBadge status={approval.status} className="mb-4" />
                <h1 className="text-3xl font-bold text-slate-800">
                  {approval.title}
                </h1>
              </div>
              {approval.status === ApprovalStatus.PENDING && (
                <div className="flex gap-3">
                  <button
                    onClick={() => openDraft("REJECT")}
                    className="px-4 py-2 rounded-lg border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 font-medium text-sm"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => openDraft("APPROVE")}
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium text-sm shadow-sm shadow-indigo-200"
                  >
                    Approve
                  </button>
                </div>
              )}
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Description
              </h3>
              <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 text-slate-700 leading-relaxed relative group">
                {approval.description}

                {/* Gemini Summary Integration */}
                {!summary && (
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="absolute top-4 right-4 text-xs flex items-center gap-1 text-indigo-600 bg-white px-2 py-1 rounded shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    {summaryLoading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    Summarize
                  </button>
                )}
              </div>

              {summary && (
                <div className="mt-4 bg-indigo-50 p-4 rounded-lg border border-indigo-100 flex gap-3">
                  <Sparkles
                    className="text-indigo-500 shrink-0 mt-0.5"
                    size={18}
                  />
                  <div>
                    <p className="text-xs font-bold text-indigo-700 uppercase mb-1">
                      AI Summary
                    </p>
                    <p className="text-sm text-indigo-800">{summary}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Attachments
              </h3>
              {approval.attachmentName ? (
                <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg w-fit hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                    <Paperclip size={20} />
                  </div>
                  <div className="pr-4">
                    <p className="text-sm font-medium text-slate-700">
                      {approval.attachmentName}
                    </p>
                    <p className="text-xs text-slate-400">
                      PDF Document • 2.4 MB
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No attachments.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Meta & History */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Request Details
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Client</span>
                <span className="font-medium text-slate-800">
                  {approval.clientName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Requested</span>
                <span className="font-medium text-slate-800">
                  {format(new Date(approval.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Due Date</span>
                <span className="font-medium text-slate-800">
                  {format(new Date(approval.dueDate), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
              Timeline
            </h3>
            <div className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {approval.history.map((event) => (
                <div key={event.id} className="relative pl-8">
                  <div
                    className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 border-white ${
                      event.type === "STATUS_CHANGED"
                        ? "bg-indigo-500"
                        : "bg-slate-300"
                    }`}
                  ></div>
                  <p className="text-sm text-slate-800 font-medium">
                    {event.description}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(event.timestamp), "MMM d, h:mm a")} •{" "}
                    {event.actor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Action Modal Overlay */}
        {aiDraftOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
              <div
                className={`px-6 py-4 border-b ${
                  draftType === "APPROVE"
                    ? "bg-indigo-50 border-indigo-100"
                    : "bg-red-50 border-red-100"
                } flex justify-between items-center`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles
                    size={18}
                    className={
                      draftType === "APPROVE"
                        ? "text-indigo-600"
                        : "text-red-600"
                    }
                  />
                  <h3
                    className={`font-semibold ${
                      draftType === "APPROVE"
                        ? "text-indigo-800"
                        : "text-red-800"
                    }`}
                  >
                    AI Draft Assistant
                  </h3>
                </div>
                <button
                  onClick={() => setAiDraftOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <p className="text-sm text-slate-500 mb-2">
                  Review and edit the {draftType.toLowerCase()} message before
                  sending:
                </p>
                <div className="relative">
                  <textarea
                    value={draftContent}
                    onChange={(e) => setDraftContent(e.target.value)}
                    className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-700 text-sm"
                    disabled={drafting}
                  />
                  {drafting && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                      <Loader2 className="animate-spin text-indigo-600" />
                    </div>
                  )}
                </div>
                <div className="mt-4 flex justify-end gap-2">
                  <button
                    onClick={() => setAiDraftOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDecision}
                    disabled={drafting}
                    className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${
                      draftType === "APPROVE"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    Confirm {draftType === "APPROVE" ? "Approval" : "Rejection"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
