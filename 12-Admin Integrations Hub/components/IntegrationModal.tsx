import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Integration, PROVIDERS, FieldMapping, HealthStatus } from "../types";
import { X, Save, Wand2, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import {
  generateSmartMappings,
  analyzeErrorLog,
} from "../services/geminiService";

interface IntegrationModalProps {
  integration: Integration;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Integration) => void;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  integration,
  isOpen,
  onClose,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<"settings" | "mapping" | "logs">(
    "settings"
  );
  const [localConfig, setLocalConfig] = useState(integration.config);
  const [mappings, setMappings] = useState<FieldMapping[]>(
    integration.mappings
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [analyzedError, setAnalyzedError] = useState<string | null>(null);

  const provider = PROVIDERS[integration.providerId];

  const clientSourceFields = [
    "id",
    "user_email",
    "full_name",
    "organization",
    "phone_number",
    "signup_date",
    "status_code",
  ];

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(integration.config);
      setMappings(integration.mappings);
      setActiveTab("settings");
      setAnalyzedError(null);
    }
  }, [isOpen, integration]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...integration,
      config: localConfig,
      mappings: mappings,
    });
    onClose();
  };

  const handleAutoMap = async () => {
    setIsAiLoading(true);
    const newMappings = await generateSmartMappings(
      clientSourceFields,
      provider.defaultFields
    );
    setMappings(newMappings);
    setIsAiLoading(false);
  };

  const analyzeLatestError = async () => {
    const lastError = integration.logs.find((l) => l.level === "error");
    if (lastError) {
      setIsAiLoading(true);
      const analysis = await analyzeErrorLog(lastError.message, provider.name);
      setAnalyzedError(analysis);
      setIsAiLoading(false);
    }
  };

  const modalContent = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "var(--color-bg-card)",
          border: "1px solid var(--color-border-subtle)",
          borderRadius: "0.75rem",
          width: "100%",
          maxWidth: "900px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--color-border-subtle)",
            background: "var(--color-bg-subtle)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "0.5rem",
                background: "var(--color-bg-elevated)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.75rem",
                color: "var(--color-text-primary)",
              }}
            >
              {provider?.logo}
            </div>
            <div>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  margin: 0,
                }}
              >
                {integration.name}
              </h2>
              <p
                style={{
                  fontSize: "0.625rem",
                  color: "var(--color-text-tertiary)",
                  margin: 0,
                }}
              >
                Managing connection to {provider?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem",
              background: "transparent",
              border: "none",
              borderRadius: "0.375rem",
              color: "var(--color-text-tertiary)",
              cursor: "pointer",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--color-border-subtle)",
            padding: "0 1.25rem",
          }}
        >
          {(["settings", "mapping", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.75rem 1rem",
                fontSize: "0.6875rem",
                fontWeight: 600,
                color:
                  activeTab === tab
                    ? "var(--color-accent-primary)"
                    : "var(--color-text-tertiary)",
                background: "transparent",
                border: "none",
                borderBottom:
                  activeTab === tab
                    ? "2px solid var(--color-accent-primary)"
                    : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab === "settings"
                ? "Configuration"
                : tab === "mapping"
                ? "Field Mapping"
                : "Health & Logs"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflow: "auto", padding: "1.25rem" }}>
          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div style={{ maxWidth: "600px" }}>
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(99, 102, 241, 0.1)",
                  border: "1px solid rgba(99, 102, 241, 0.2)",
                  borderRadius: "0.5rem",
                  display: "flex",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                }}
              >
                <ShieldCheck
                  size={18}
                  style={{
                    color: "var(--color-accent-primary)",
                    flexShrink: 0,
                  }}
                />
                <div>
                  <h4
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      margin: "0 0 0.25rem 0",
                    }}
                  >
                    Secure Vault Storage
                  </h4>
                  <p
                    style={{
                      fontSize: "0.625rem",
                      color: "var(--color-text-secondary)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    Credentials are encrypted and stored securely. They are
                    never exposed in plain text.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.375rem",
                  }}
                >
                  API Key / Token
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    value={localConfig.apiKey || "mock-secret-value-123"}
                    disabled
                    style={{
                      width: "100%",
                      padding: "0.5rem 4rem 0.5rem 0.75rem",
                      background: "var(--color-bg-elevated)",
                      border: "1px solid var(--color-border-subtle)",
                      borderRadius: "0.375rem",
                      color: "var(--color-text-tertiary)",
                      fontSize: "0.6875rem",
                      fontFamily: "monospace",
                    }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      right: "0.5rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "0.5rem",
                      fontWeight: 600,
                      color: "rgb(16, 185, 129)",
                      background: "rgba(16, 185, 129, 0.1)",
                      padding: "0.125rem 0.375rem",
                      borderRadius: "999px",
                    }}
                  >
                    Vaulted
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.5625rem",
                    color: "var(--color-text-tertiary)",
                    marginTop: "0.25rem",
                  }}
                >
                  To rotate keys, please use the Provider Dashboard.
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.6875rem",
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.375rem",
                  }}
                >
                  Endpoint URL
                </label>
                <input
                  type="text"
                  value={localConfig.endpointUrl || ""}
                  onChange={(e) =>
                    setLocalConfig({
                      ...localConfig,
                      endpointUrl: e.target.value,
                    })
                  }
                  placeholder="https://api.example.com/v1"
                  style={{
                    width: "100%",
                    padding: "0.5rem 0.75rem",
                    background: "var(--color-bg-elevated)",
                    border: "1px solid var(--color-border-subtle)",
                    borderRadius: "0.375rem",
                    color: "var(--color-text-primary)",
                    fontSize: "0.6875rem",
                  }}
                />
              </div>
            </div>
          )}

          {/* Mapping Tab */}
          {activeTab === "mapping" && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <p
                  style={{
                    fontSize: "0.6875rem",
                    color: "var(--color-text-tertiary)",
                    margin: 0,
                  }}
                >
                  Map fields from your source data to {provider.name}.
                </p>
                <button
                  onClick={handleAutoMap}
                  disabled={isAiLoading}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.375rem 0.625rem",
                    background: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.2)",
                    borderRadius: "0.375rem",
                    color: "rgb(168, 85, 247)",
                    fontSize: "0.5625rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {isAiLoading ? (
                    <Loader2
                      size={12}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Wand2 size={12} />
                  )}
                  AI Auto-Map
                </button>
              </div>

              <div
                style={{
                  background: "var(--color-bg-subtle)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    gap: "1rem",
                    padding: "0.5rem 1rem",
                    background: "var(--color-bg-elevated)",
                    borderBottom: "1px solid var(--color-border-subtle)",
                    fontSize: "0.5rem",
                    fontWeight: 700,
                    color: "var(--color-text-tertiary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  <span>Source Field</span>
                  <span>Direction</span>
                  <span>Destination ({provider.name})</span>
                </div>

                <div style={{ maxHeight: "300px", overflow: "auto" }}>
                  {mappings.map((mapping, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr auto 1fr",
                        gap: "1rem",
                        padding: "0.75rem 1rem",
                        alignItems: "center",
                        borderBottom: "1px solid var(--color-border-subtle)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.625rem",
                          color: "var(--color-text-primary)",
                          background: "var(--color-bg-card)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          border: "1px solid var(--color-border-subtle)",
                          display: "inline-block",
                          width: "fit-content",
                        }}
                      >
                        {mapping.sourceField}
                      </span>
                      <ArrowRight
                        size={14}
                        style={{ color: "var(--color-text-tertiary)" }}
                      />
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.625rem",
                          color: "var(--color-accent-primary)",
                          background: "rgba(99, 102, 241, 0.1)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          border: "1px solid rgba(99, 102, 241, 0.2)",
                          display: "inline-block",
                          width: "fit-content",
                        }}
                      >
                        {mapping.destinationField}
                      </span>
                    </div>
                  ))}
                  {mappings.length === 0 && (
                    <div
                      style={{
                        padding: "2rem",
                        textAlign: "center",
                        color: "var(--color-text-tertiary)",
                        fontSize: "0.6875rem",
                      }}
                    >
                      No fields mapped yet. Try Auto-Map.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.875rem",
                  background: "var(--color-bg-subtle)",
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "0.5rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background:
                      integration.status === HealthStatus.HEALTHY
                        ? "rgb(16, 185, 129)"
                        : "rgb(244, 63, 94)",
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      margin: 0,
                    }}
                  >
                    Current Status:{" "}
                    <span style={{ textTransform: "uppercase" }}>
                      {integration.status}
                    </span>
                  </p>
                  <p
                    style={{
                      fontSize: "0.5625rem",
                      color: "var(--color-text-tertiary)",
                      margin: 0,
                    }}
                  >
                    Last health check: 2 minutes ago
                  </p>
                </div>
                {integration.status === HealthStatus.FAILED && (
                  <button
                    onClick={analyzeLatestError}
                    disabled={isAiLoading}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.375rem 0.625rem",
                      background: "rgba(244, 63, 94, 0.1)",
                      border: "1px solid rgba(244, 63, 94, 0.2)",
                      borderRadius: "0.375rem",
                      color: "rgb(244, 63, 94)",
                      fontSize: "0.5625rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {isAiLoading ? (
                      <Loader2
                        size={12}
                        style={{ animation: "spin 1s linear infinite" }}
                      />
                    ) : (
                      <Wand2 size={12} />
                    )}
                    Analyze Root Cause
                  </button>
                )}
              </div>

              {analyzedError && (
                <div
                  style={{
                    padding: "0.875rem",
                    background: "rgba(168, 85, 247, 0.1)",
                    border: "1px solid rgba(168, 85, 247, 0.2)",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                  }}
                >
                  <h5
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      fontSize: "0.5625rem",
                      fontWeight: 700,
                      color: "rgb(168, 85, 247)",
                      textTransform: "uppercase",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    <Wand2 size={12} /> AI Analysis
                  </h5>
                  <p
                    style={{
                      fontSize: "0.6875rem",
                      color: "var(--color-text-secondary)",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {analyzedError}
                  </p>
                </div>
              )}

              <div
                style={{
                  border: "1px solid var(--color-border-subtle)",
                  borderRadius: "0.5rem",
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--color-bg-elevated)" }}>
                      <th
                        style={{
                          padding: "0.5rem 0.875rem",
                          fontSize: "0.5rem",
                          fontWeight: 700,
                          color: "var(--color-text-tertiary)",
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        Timestamp
                      </th>
                      <th
                        style={{
                          padding: "0.5rem 0.875rem",
                          fontSize: "0.5rem",
                          fontWeight: 700,
                          color: "var(--color-text-tertiary)",
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        Level
                      </th>
                      <th
                        style={{
                          padding: "0.5rem 0.875rem",
                          fontSize: "0.5rem",
                          fontWeight: 700,
                          color: "var(--color-text-tertiary)",
                          textTransform: "uppercase",
                          textAlign: "left",
                        }}
                      >
                        Message
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...integration.logs].reverse().map((log) => (
                      <tr
                        key={log.id}
                        style={{
                          borderTop: "1px solid var(--color-border-subtle)",
                        }}
                      >
                        <td
                          style={{
                            padding: "0.625rem 0.875rem",
                            fontFamily: "monospace",
                            fontSize: "0.5625rem",
                            color: "var(--color-text-tertiary)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {log.timestamp}
                        </td>
                        <td style={{ padding: "0.625rem 0.875rem" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              padding: "0.125rem 0.375rem",
                              borderRadius: "0.25rem",
                              fontSize: "0.5rem",
                              fontWeight: 600,
                              background:
                                log.level === "error"
                                  ? "rgba(244, 63, 94, 0.1)"
                                  : log.level === "warn"
                                  ? "rgba(245, 158, 11, 0.1)"
                                  : log.level === "success"
                                  ? "rgba(16, 185, 129, 0.1)"
                                  : "var(--color-bg-subtle)",
                              color:
                                log.level === "error"
                                  ? "rgb(244, 63, 94)"
                                  : log.level === "warn"
                                  ? "rgb(245, 158, 11)"
                                  : log.level === "success"
                                  ? "rgb(16, 185, 129)"
                                  : "var(--color-text-tertiary)",
                            }}
                          >
                            {log.level}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "0.625rem 0.875rem",
                            fontFamily: "monospace",
                            fontSize: "0.5625rem",
                            color: "var(--color-text-secondary)",
                            maxWidth: "300px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={log.message}
                        >
                          {log.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            padding: "1rem 1.25rem",
            borderTop: "1px solid var(--color-border-subtle)",
            background: "var(--color-bg-subtle)",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              background: "transparent",
              border: "none",
              borderRadius: "0.375rem",
              color: "var(--color-text-secondary)",
              fontSize: "0.6875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.5rem 1rem",
              background: "var(--color-accent-primary)",
              border: "none",
              borderRadius: "0.375rem",
              color: "white",
              fontSize: "0.6875rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Save size={14} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
