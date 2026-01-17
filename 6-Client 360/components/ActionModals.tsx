import React, { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@bundlros/ui";
import {
  ContractsApi,
  AuditLogsApi,
  IntakeItemsApi,
  FileAssetsApi,
  ProfilesApi,
  SystemEventsApi,
  ClientsApi,
  supabase,
  type ContractStatus,
  type IntakePriority,
  type Profile,
} from "@bundlros/supabase";
import { useLanguage } from "../../_Shared/contexts/LanguageContext";

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
  onSuccess?: () => void;
}

export const ActionModal: React.FC<ActionModalProps> = ({
  type,
  isOpen,
  onClose,
  clientId,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [clientEmail, setClientEmail] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const { t } = useLanguage();

  // Reset form when modal opens/closes or type changes
  useEffect(() => {
    if (isOpen) {
      setFormData({});
      setShowValidation(false);
      // Fetch profiles if needed for dropdowns
      if (type === "LOG_MEETING" || type === "ADD_TASK") {
        ProfilesApi.getAll().then(setProfiles).catch(console.error);
      }
      // Fetch client email for SEND_EMAIL
      if (type === "SEND_EMAIL" && clientId) {
        ClientsApi.getAll()
          .then((clients) => {
            const client = clients.find((c) => c.id === clientId);
            if (client?.email) {
              setClientEmail(client.email);
              setFormData((prev) => ({ ...prev, to: client.email }));
            }
          })
          .catch(console.error);
      }
      // Fetch profiles if needed for dropdowns
      if (type === "LOG_MEETING" || type === "ADD_TASK") {
        ProfilesApi.getAll().then(setProfiles).catch(console.error);
      }
    }
  }, [isOpen, type]);

  if (!isOpen || !type) return null;

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    let isValid = true;
    switch (type) {
      case "NEW_CONTRACT":
        if (
          !formData.title ||
          !formData.value ||
          !formData.payment_type ||
          !formData.status ||
          !formData.start_date ||
          !formData.end_date
        )
          isValid = false;
        break;
      case "LOG_MEETING":
        if (
          !formData.subject ||
          !formData.date ||
          !formData.attendeeId ||
          !formData.notes
        )
          isValid = false;
        break;
      case "ADD_TASK":
        if (
          !formData.title ||
          !formData.assigneeId ||
          !formData.due_date ||
          !formData.description ||
          !formData.priority
        )
          isValid = false;
        break;
      case "UPLOAD_ASSET":
        if (!formData.filename || !formData.category) isValid = false;
        // Also check if file is present if it's a new upload, but formData.file handles that
        if (!formData.file) isValid = false;
        break;
      case "SEND_EMAIL":
        if (!formData.to || !formData.subject || !formData.message)
          isValid = false;
        break;
      case "REPORT_BUG":
        if (
          !formData.title ||
          !formData.severity ||
          !formData.system ||
          !formData.description
        )
          isValid = false;
        break;
    }

    if (!isValid) {
      setShowValidation(true);
      return;
    }

    setLoading(true);

    try {
      switch (type) {
        case "NEW_CONTRACT":
          await ContractsApi.create({
            client_id: clientId,
            title: formData.title || "New Contract",
            value: parseFloat(formData.value) || 0,
            status: (formData.status || "pending") as ContractStatus,
            start_date: formData.start_date || new Date().toISOString(),
            end_date: formData.end_date || null,
            payment_type: formData.payment_type || "one_off",
          });
          break;

        case "LOG_MEETING":
          await AuditLogsApi.create({
            action: "MEETING_LOGGED",
            target_id: clientId,
            performer_id: formData.attendeeId || null,
            details: {
              subject: formData.subject,
              date: formData.date,
              attendees: formData.attendees, // Name of the selected profile
              notes: formData.notes,
            },
          });
          break;

        case "ADD_TASK":
          await IntakeItemsApi.create({
            client_id: clientId,
            title: formData.title || "New Task",
            description: formData.description || "",
            priority: (formData.priority || "Medium") as IntakePriority,
            status: "New",
            assignee_id: formData.assigneeId || null,
            tags: ["task"],
            requestor: "Dashboard User", // Placeholder
            ai_analysis: null,
            sla_due_at: formData.due_date
              ? new Date(formData.due_date).toISOString()
              : null,
          });
          break;

        case "UPLOAD_ASSET":
          if (formData.file) {
            const file = formData.file as File;
            const fileExt = file.name.split(".").pop();
            const filePath = `${clientId}/${Math.random()
              .toString(36)
              .substring(7)}.${fileExt}`;

            const { data: uploadData, error: uploadError } =
              await supabase.storage.from("assets").upload(filePath, file);

            if (uploadError) throw uploadError;

            const {
              data: { publicUrl },
            } = supabase.storage.from("assets").getPublicUrl(filePath);

            await FileAssetsApi.create({
              client_id: clientId,
              filename: formData.filename || file.name,
              mime_type: file.type || "application/octet-stream",
              tags: [formData.category || "General"],
              size_bytes: file.size,
              public_url: publicUrl,
              description: null,
              preview_url: null,
              deliverable_id: null,
            });
          }
          break;

        case "SEND_EMAIL":
          await SystemEventsApi.create({
            type: "email.send",
            client_id: clientId,
            status: "pending",
            payload: {
              to: formData.to,
              subject: formData.subject,
              message: formData.message,
              from: "dashboard",
            },
          });
          break;

        case "REPORT_BUG":
          await IntakeItemsApi.create({
            client_id: clientId,
            title: formData.title || "Bug Report",
            description: `System: ${formData.system}\n\n${
              formData.description || ""
            }`,
            priority: (formData.severity || "Medium") as IntakePriority,
            status: "New",
            tags: ["bug", formData.system || "unknown"],
            requestor: "Dashboard User",
            assignee_id: null,
            ai_analysis: null,
            sla_due_at: null,
          });
          break;
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error executing action:", error);
      // Ideally show toast error
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (type) {
      case "NEW_CONTRACT":
        return (
          <>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.newContract.title")}
                {showValidation && !formData.title && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t("actionModals.placeholders.contractTitle")}
                autoFocus
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.newContract.value")}
                  {showValidation && !formData.value && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  className="form-input"
                  placeholder={t("actionModals.placeholders.value")}
                  value={formData.value || ""}
                  onChange={(e) => handleChange("value", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.newContract.payment")}
                  {showValidation && !formData.payment_type && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <select
                  className="form-select"
                  value={formData.payment_type || "one_off"}
                  onChange={(e) => handleChange("payment_type", e.target.value)}
                >
                  <option value="one_off">
                    {t("actionModals.newContract.paymentTypes.regular")}
                  </option>
                  <option value="monthly">
                    {t("actionModals.newContract.paymentTypes.monthly")}
                  </option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.newContract.status")}
                  {showValidation && !formData.status && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <select
                  className="form-select"
                  value={formData.status || "pending"}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option value="pending">
                    {t("actionModals.newContract.statuses.pending")}
                  </option>
                  <option value="active">
                    {t("actionModals.newContract.statuses.active")}
                  </option>
                  <option value="expired">
                    {t("actionModals.newContract.statuses.expired")}
                  </option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.newContract.startDate")}
                  {showValidation && !formData.start_date && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.start_date || ""}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.newContract.endDate")}
                  {showValidation && !formData.end_date && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.end_date || ""}
                  onChange={(e) => handleChange("end_date", e.target.value)}
                />
              </div>
            </div>
          </>
        );
      case "LOG_MEETING":
        return (
          <>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.logMeeting.subject")}
                {showValidation && !formData.subject && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t("actionModals.placeholders.meetingSubject")}
                autoFocus
                value={formData.subject || ""}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.logMeeting.dateTime")}
                  {showValidation && !formData.date && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.date || ""}
                  onChange={(e) => handleChange("date", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.logMeeting.attendees")}
                  {showValidation && !formData.attendeeId && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <select
                  className="form-select"
                  value={formData.attendeeId || ""}
                  onChange={(e) => {
                    const selectedProfile = profiles.find(
                      (p) => p.id === e.target.value,
                    );
                    handleChange("attendeeId", e.target.value);
                    handleChange(
                      "attendees",
                      selectedProfile ? selectedProfile.name : "",
                    );
                  }}
                >
                  <option value="">NULL</option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name || profile.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.logMeeting.notes")}
                {showValidation && !formData.notes && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <textarea
                className="form-input"
                rows={4}
                placeholder={t("actionModals.placeholders.notes")}
                value={formData.notes || ""}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>
          </>
        );
      case "ADD_TASK":
        return (
          <>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.addTask.title")}
                {showValidation && !formData.title && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t("actionModals.placeholders.taskTitle")}
                autoFocus
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.addTask.assignee")}
                  {showValidation && !formData.assigneeId && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <select
                  className="form-select"
                  value={formData.assigneeId || ""}
                  onChange={(e) => handleChange("assigneeId", e.target.value)}
                >
                  <option value="">
                    {t("actionModals.addTask.unassigned")}
                  </option>
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.name || profile.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.addTask.dueDate")}
                  {showValidation && !formData.due_date && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.due_date || ""}
                  onChange={(e) => handleChange("due_date", e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.addTask.description")}
                {showValidation && !formData.description && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <textarea
                className="form-input"
                rows={4}
                placeholder={t("actionModals.placeholders.description")}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.addTask.priority")}
                {showValidation && !formData.priority && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <div className="flex gap-2">
                {["Low", "Medium", "High", "Critical"].map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-1 text-xs text-gray-400 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p}
                      checked={(formData.priority || "Medium") === p}
                      onChange={(e) => handleChange("priority", e.target.value)}
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
            <div
              className="border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 transition-colors cursor-pointer bg-white/5 mx-auto w-full"
              onClick={() => document.getElementById("file-upload")?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) {
                  handleChange("file", e.dataTransfer.files[0]);
                  handleChange("filename", e.dataTransfer.files[0].name);
                }
              }}
            >
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleChange("file", e.target.files[0]);
                    handleChange("filename", e.target.files[0].name);
                  }
                }}
              />
              <UploadCloud size={32} className="text-gray-400 mb-2" />
              <p className="text-sm font-medium text-white">
                {formData.file
                  ? formData.file.name
                  : t("actionModals.uploadAsset.dragDrop")}
                {showValidation && !formData.file && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t("actionModals.uploadAsset.formats")}
              </p>
            </div>
            <div className="form-group mt-4">
              <label className="form-label">
                {t("actionModals.uploadAsset.title")}
                {showValidation && !formData.filename && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t("actionModals.placeholders.filename")}
                value={formData.filename || ""}
                onChange={(e) => handleChange("filename", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.uploadAsset.category")}
                {showValidation && !formData.category && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <select
                className="form-select"
                value={formData.category || "Brand Guidelines"}
                onChange={(e) => handleChange("category", e.target.value)}
              >
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
              <label className="form-label">
                {t("actionModals.sendEmail.to")}
                {showValidation && !formData.to && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  list="email-suggestions"
                  className="form-input"
                  placeholder={t("actionModals.placeholders.emailTo")}
                  value={formData.to || ""}
                  onChange={(e) => handleChange("to", e.target.value)}
                  autoFocus
                />
                <datalist id="email-suggestions">
                  {clientEmail && (
                    <option value={clientEmail}>Client Email</option>
                  )}
                  <option value="contact@bundlros.com">Support</option>
                </datalist>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.sendEmail.subject")}
                {showValidation && !formData.subject && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t("actionModals.placeholders.emailSubject")}
                value={formData.subject || ""}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.sendEmail.message")}
                {showValidation && !formData.message && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <textarea
                className="form-input"
                rows={6}
                placeholder={t("actionModals.placeholders.emailMessage")}
                value={formData.message || ""}
                onChange={(e) => handleChange("message", e.target.value)}
              />
            </div>
          </>
        );
      case "REPORT_BUG":
        return (
          <>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.reportBug.title")}
                {showValidation && !formData.title && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={t("actionModals.placeholders.bugTitle")}
                autoFocus
                value={formData.title || ""}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.reportBug.severity")}
                  {showValidation && !formData.severity && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <select
                  className="form-select text-red-400"
                  value={formData.severity || "Medium"}
                  onChange={(e) => handleChange("severity", e.target.value)}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {t("actionModals.reportBug.system")}
                  {showValidation && !formData.system && (
                    <span
                      style={{
                        color: "var(--color-status-danger)",
                        fontSize: "1.25rem",
                        lineHeight: 1,
                      }}
                    >
                      {" "}
                      *
                    </span>
                  )}
                </label>
                <select
                  className="form-select"
                  value={formData.system || "Frontend"}
                  onChange={(e) => handleChange("system", e.target.value)}
                >
                  <option>Frontend</option>
                  <option>Backend API</option>
                  <option>Database</option>
                  <option>Infrastructure</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">
                {t("actionModals.reportBug.description")}
                {showValidation && !formData.description && (
                  <span
                    style={{
                      color: "var(--color-status-danger)",
                      fontSize: "1.25rem",
                      lineHeight: 1,
                    }}
                  >
                    {" "}
                    *
                  </span>
                )}
              </label>
              <textarea
                className="form-input"
                rows={4}
                placeholder={t("actionModals.placeholders.steps")}
                value={formData.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
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
        return {
          title: t("actionModals.titles.newContract"),
          icon: FileText,
          color: "bg-blue-500",
        };
      case "LOG_MEETING":
        return {
          title: t("actionModals.titles.logMeeting"),
          icon: Briefcase,
          color: "bg-purple-500",
        };
      case "ADD_TASK":
        return {
          title: t("actionModals.titles.addTask"),
          icon: CheckCircle,
          color: "bg-green-500",
        };
      case "UPLOAD_ASSET":
        return {
          title: t("actionModals.titles.uploadAsset"),
          icon: ImageIcon,
          color: "bg-pink-500",
        };
      case "SEND_EMAIL":
        return {
          title: t("actionModals.titles.sendEmail"),
          icon: Send,
          color: "bg-orange-500",
        };
      case "REPORT_BUG":
        return {
          title: t("actionModals.titles.reportBug"),
          icon: AlertCircle,
          color: "bg-red-500",
        };
      default:
        return {
          title: t("actionModals.titles.default"),
          icon: Star,
          color: "bg-gray-500",
        };
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

          {/* Footer */}
          <div className="modal__footer">
            <Button variant="ghost" type="button" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
              leftIcon={
                loading ? <Loader2 className="animate-spin" size={14} /> : null
              }
            >
              {loading ? t("common.processing") : t("common.save")}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
};
