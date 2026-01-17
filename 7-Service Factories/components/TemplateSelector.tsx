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
import { useLanguage } from "@bundlros/ui";
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
  t: (key: string) => string;
}

const TemplateItem: React.FC<TemplateItemProps> = ({
  template,
  isSelected,
  onSelect,
  t,
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
        <h3 className={styles.templateName}>
          {t(`factories.templates.${template.id}.name`)}
        </h3>
        <p className={styles.templateCategory}>
          {t(`factories.templates.${template.id}.category`)}
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
  const { t } = useLanguage();
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
            t(
              `factories.templates.${selectedTemplate.id}.category`,
            ).toLowerCase() || "general"
          } workflows. It guides the project from ${t(
            `factories.templates.${selectedTemplate.id}.stages.${selectedTemplate.stages[0].id}`,
          )} to ${t(
            `factories.templates.${selectedTemplate.id}.stages.${selectedTemplate.stages[selectedTemplate.stages.length - 1].id}`,
          )} efficiently.`,
          steps: selectedTemplate.stages.map((s) =>
            t(`factories.templates.${selectedTemplate.id}.stages.${s.id}`),
          ),
          estimatedTime: "4-6 Weeks", // logic is mock, string is static for now
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
            <h2 className={styles.title}>
              {t("factories.templateSelector.title").toUpperCase()}
            </h2>
            <p className={styles.subtitle}>
              {t("factories.templateSelector.subtitle")}
            </p>
          </div>

          <div className={styles.scrollArea}>
            {PIPELINE_TEMPLATES.map((template) => (
              <TemplateItem
                key={template.id}
                template={template}
                isSelected={selectedId === template.id}
                onSelect={(t) => setSelectedId(t.id)}
                t={t}
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
                ? t("factories.templateSelector.initialize")
                : t("factories.templateSelector.selectToContinue")}
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
              <h3 className={styles.emptyTitle}>
                {t("factories.templateSelector.noSelection")}
              </h3>
              <p className={styles.emptyDesc}>
                {t("factories.templateSelector.pickTemplate")}
              </p>
            </div>
          ) : loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}>
                <Loader2 size={32} />
              </div>
              <p>{t("factories.templateSelector.generating")}</p>
            </div>
          ) : aiInsights ? (
            <div className={styles.insightsContent}>
              <div className={styles.insightHeader}>
                <Sparkles size={16} />
                {t("factories.templateSelector.aiInsights")}
              </div>

              <div>
                <h4 className={styles.strategyTitle}>
                  {t("factories.templateSelector.pipelineStrategy")}
                </h4>
                <p className={styles.strategyDesc}>{aiInsights.summary}</p>
              </div>

              <div className={styles.stepsSection}>
                <h4 className={styles.stepsTitle}>
                  {t("factories.templateSelector.steps")}
                </h4>
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
                <div className={styles.velocityLabel}>
                  {t("factories.templateSelector.velocity")}
                </div>
                <div className={styles.velocityValue}>
                  {aiInsights.estimatedTime}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default TemplateSelector;
