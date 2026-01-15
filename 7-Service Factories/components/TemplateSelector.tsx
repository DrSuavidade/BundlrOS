import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { PIPELINE_TEMPLATES } from "../constants";
import { PipelineTemplate } from "../types";
import {
  Share2,
  FastForward,
  Rocket,
  Cpu,
  Settings,
  MessageSquare,
  Layout,
  Layers,
  ShoppingBag,
  Wrench,
  Loader2,
  Info,
  Sparkles,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import styles from "./TemplateSelector.module.css";

const IconMap: Record<string, React.FC<any>> = {
  Share2,
  FastForward,
  Rocket,
  Cpu,
  Settings,
  MessageSquare,
  Layout,
  Layers,
  ShoppingBag,
  Wrench,
};

interface TemplateItemProps {
  template: PipelineTemplate;
  isSelected: boolean;
  onSelect: (template: PipelineTemplate) => void;
}

const TemplateItem: React.FC<TemplateItemProps> = ({
  template,
  isSelected,
  onSelect,
}) => {
  const Icon = (template.iconName && IconMap[template.iconName]) || Settings;

  return (
    <button
      onClick={() => onSelect(template)}
      className={`${styles.templateBtn} ${isSelected ? styles.selected : ""}`}
    >
      <div className={styles.iconWrapper}>
        <Icon size={20} strokeWidth={2} />
      </div>

      <div className={styles.textInfo}>
        <h3 className={styles.templateName}>{template.name}</h3>
        <p className={styles.templateCategory}>
          {template.category || "General"}
        </p>
      </div>

      <ChevronRight size={18} className={styles.arrowIcon} />
    </button>
  );
};

interface TemplateSelectorProps {
  onSelect: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    summary: string;
    steps: string[];
    estimatedTime: string;
  } | null>(null);

  const selectedTemplate = PIPELINE_TEMPLATES.find((t) => t.id === selectedId);

  useEffect(() => {
    if (selectedTemplate) {
      setLoading(true);
      // Simulate AI loading
      setTimeout(() => {
        setAiInsights({
          summary: `This template is optimized for ${
            selectedTemplate.category?.toLowerCase() || "general"
          } workflows. It guides the project from ${
            selectedTemplate.stages[0].name
          } to ${
            selectedTemplate.stages[selectedTemplate.stages.length - 1].name
          } efficiently.`,
          steps: selectedTemplate.stages.map((s) => s.name),
          estimatedTime: "4-6 Weeks",
        });
        setLoading(false);
      }, 800);
    } else {
      setAiInsights(null);
    }
  }, [selectedId]);

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        {/* Left: Template List */}
        <div className={styles.listPanel}>
          <div className={styles.header}>
            <h2 className={styles.title}>SELECT PIPELINE TEMPLATE</h2>
            <p className={styles.subtitle}>
              This factory needs a pipeline template to initialize. Please
              select one below.
            </p>
          </div>

          <div className={styles.scrollArea}>
            {PIPELINE_TEMPLATES.map((template) => (
              <TemplateItem
                key={template.id}
                template={template}
                isSelected={selectedId === template.id}
                onSelect={(t) => setSelectedId(t.id)}
              />
            ))}
          </div>

          <div className={styles.footer}>
            <button
              disabled={!selectedId}
              onClick={() => selectedId && onSelect(selectedId)}
              className={styles.primaryBtn}
            >
              {selectedId
                ? "Initialize Factory"
                : "Select a Template to Continue"}
              {selectedId && <CheckCircle size={20} />}
            </button>
          </div>
        </div>

        {/* Right: AI Insights Panel */}
        <div className={styles.insightsPanel}>
          <div className={styles.glowEffect} />

          {!selectedId ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <Info size={32} />
              </div>
              <h3 className={styles.emptyTitle}>No Selection</h3>
              <p className={styles.emptyDesc}>
                Pick a template from the list to see an AI-generated action plan
                and estimated timeline.
              </p>
            </div>
          ) : loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}>
                <Loader2 size={32} />
              </div>
              <p>Generating AI Analysis...</p>
            </div>
          ) : aiInsights ? (
            <div className={styles.insightsContent}>
              <div className={styles.insightHeader}>
                <Sparkles size={16} />
                AI Insights
              </div>

              <div>
                <h4 className={styles.strategyTitle}>Pipeline Strategy</h4>
                <p className={styles.strategyDesc}>{aiInsights.summary}</p>
              </div>

              <div className={styles.stepsSection}>
                <h4 className={styles.stepsTitle}>Key Implementation Steps</h4>
                <div className={styles.stepsList}>
                  {aiInsights.steps.map((step, idx) => (
                    <div key={idx} className={styles.stepItem}>
                      <div className={styles.stepNum}>{idx + 1}</div>
                      <p className={styles.stepText}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.velocityCard}>
                <div className={styles.velocityLabel}>Estimated Velocity</div>
                <div className={styles.velocityValue}>
                  {aiInsights.estimatedTime}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TemplateSelector;
