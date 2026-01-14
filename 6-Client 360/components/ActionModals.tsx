import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  FileText,
  Briefcase,
  CheckCircle,
  Image as ImageIcon,
  MessageSquare,
  AlertCircle,
  UploadCloud,
  Calendar,
  User,
  Send,
  Star,
} from "lucide-react";
import { Button } from "@bundlros/ui";

export type ActionType =
  | "NEW_CONTRACT"
  | "LOG_MEETING"
  | "ADD_TASK"
  | "UPLOAD_ASSET"
  | "SEND_EMAIL"
  | "REPORT_BUG"
  | null;

interface ActionModalProps {
  type: ActionType;
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  type,
  isOpen,
  onClose,
  clientId,
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !type) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false);
    onClose();
  };

  const renderContent = () => {
    switch (type) {
      case "NEW_CONTRACT":
        return (
          <>
            <div className="form-group">
              <label className="form-label">Contract Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Q4 2026 Retainer"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Value ($)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="50,000"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select">
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input type="date" className="form-input" />
              </div>
            </div>
          </>
        );
      case "LOG_MEETING":
        return (
          <>
            <div className="form-group">
              <label className="form-label">Meeting Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Weekly Sync"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Date & Time</label>
                <input type="datetime-local" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Attendees</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John, Sarah"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Notes / Outcome</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Key takeaways..."
              />
            </div>
          </>
        );
      case "ADD_TASK":
        return (
          <>
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Update Brand Assets"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Assignee</label>
                <select className="form-select">
                  <option>Unassigned</option>
                  <option>Alex Morgan</option>
                  <option>Sam Torres</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-input" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="flex gap-2">
                {["Low", "Medium", "High", "Critical"].map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p.toLowerCase()}
                    />{" "}
                    {p}
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      case "UPLOAD_ASSET":
        return (
          <>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 transition-colors cursor-pointer bg-white/5 mx-auto w-full">
              <UploadCloud size={32} className="text-gray-400 mb-2" />
              <p className="text-sm font-medium text-white">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500 mt-1">
                SVG, PNG, JPG or PDF (max. 10MB)
              </p>
            </div>
            <div className="form-group mt-4">
              <label className="form-label">Asset Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Filename"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select">
                <option>Brand Guidelines</option>
                <option>Logos</option>
                <option>Contracts</option>
                <option>Reports</option>
              </select>
            </div>
          </>
        );
      case "SEND_EMAIL":
        return (
          <>
            <div className="form-group">
              <label className="form-label">To</label>
              <input
                type="text"
                className="form-input"
                placeholder="client@example.com"
                defaultValue={clientId === "c-101" ? "contact@acmeweb.com" : ""}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder="Subject line"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea
                className="form-input"
                rows={6}
                placeholder="Type your message here..."
              />
            </div>
          </>
        );
      case "REPORT_BUG":
        return (
          <>
            <div className="form-group">
              <label className="form-label">Issue Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Login failing on staging"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Severity</label>
                <select className="form-select text-red-400">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Affected System</label>
                <select className="form-select">
                  <option>Frontend</option>
                  <option>Backend API</option>
                  <option>Database</option>
                  <option>Infrastructure</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="Steps to reproduce..."
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  const getHeader = () => {
    switch (type) {
      case "NEW_CONTRACT":
        return { title: "New Contract", icon: FileText, color: "bg-blue-500" };
      case "LOG_MEETING":
        return {
          title: "Log Meeting",
          icon: Briefcase,
          color: "bg-purple-500",
        };
      case "ADD_TASK":
        return { title: "Add Task", icon: CheckCircle, color: "bg-green-500" };
      case "UPLOAD_ASSET":
        return { title: "Upload Asset", icon: ImageIcon, color: "bg-pink-500" };
      case "SEND_EMAIL":
        return { title: "Send Email", icon: Send, color: "bg-orange-500" };
      case "REPORT_BUG":
        return { title: "Report Bug", icon: AlertCircle, color: "bg-red-500" };
      default:
        return { title: "Action", icon: Star, color: "bg-gray-500" };
    }
  };

  const { title, icon: Icon, color } = getHeader();

  return createPortal(
    <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={onClose}>
      <div
        className="modal w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal__header">
          <h2 className="modal__title">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center text-white`}
              >
                <Icon size={18} />
              </div>
              {title}
            </div>
          </h2>
          <button onClick={onClose} className="modal__close">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal__body">
          {renderContent()}
        </form>

        {/* Footer */}
        <div className="modal__footer">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading}
            className="min-w-[100px]"
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};
