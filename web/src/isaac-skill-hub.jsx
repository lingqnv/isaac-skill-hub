import { useState, useMemo, useCallback, useEffect } from "react";
import { Search, Star, Download, CheckCircle, ArrowUpRight, X, Award, ArrowLeft, Github, Terminal, ChevronRight, Activity, Box, Plus, BookOpen, FileText, Filter } from "lucide-react";

// ─── DATA ──────────────────────────────────────────────────────────────────────

const DOMAINS = [
  { id: "navigation", label: "Navigation" },
  { id: "manipulation", label: "Manipulation" },
  { id: "perception", label: "Perception" },
  { id: "data_training", label: "Data & Training" },
  { id: "simulation", label: "Simulation" },
  { id: "control", label: "Control" },
  { id: "safety", label: "Safety" },
  { id: "integration", label: "Integration" },
];

const SKILLS = [
  { id: 1, name: "nav-slam-lidar", displayName: "LiDAR SLAM Navigation", description: "Real-time SLAM navigation using LiDAR point clouds. Supports 2D/3D mapping with loop closure. Optimized for warehouse environments.", domain: "navigation", tags: ["slam", "lidar", "mapping"], author: { name: "Jane Chen", org: "NVIDIA", tier: "core" }, version: "1.2.0", license: "Apache-2.0", hubScore: 94, rating: 4.8, reviewCount: 47, downloads: 18420, downloads30d: 2340, activeDeployments: 512, workflowCompletions: 0.96, validationBadge: true, certifiedBadge: true, compatibility: { isaac_sdk: ">=3.0", ros: ["humble", "iron"], platforms: ["Jetson Orin", "x86_64"] }, updatedAt: "2026-04-02", publishedAt: "2025-08-15", contributors: 8, dependents: 12 },
  { id: 2, name: "grasp-6dof-transformer", displayName: "6-DOF Grasp Planner", description: "Transformer-based 6-DOF grasp pose prediction from point clouds. Zero-shot generalization on novel objects. MoveIt2 integrated.", domain: "manipulation", tags: ["grasping", "transformer", "6dof"], author: { name: "Alex Kim", org: "RoboLabs", tier: "verified" }, version: "2.0.1", license: "MIT", hubScore: 91, rating: 4.7, reviewCount: 34, downloads: 14200, downloads30d: 1980, activeDeployments: 389, workflowCompletions: 0.92, validationBadge: true, certifiedBadge: true, compatibility: { isaac_sdk: ">=3.0", ros: ["humble"], platforms: ["x86_64 + RTX 4090", "Jetson Orin"] }, updatedAt: "2026-03-28", publishedAt: "2025-11-01", contributors: 5, dependents: 8 },
  { id: 3, name: "perception-yolo-ros2", displayName: "YOLO Object Detection", description: "Production-ready YOLO v8/v9 object detection as a ROS2 node. Auto-selects model variant based on GPU memory. Custom training included.", domain: "perception", tags: ["yolo", "detection", "ros2"], author: { name: "Maria Santos", org: "Community", tier: "verified" }, version: "3.1.0", license: "Apache-2.0", hubScore: 89, rating: 4.6, reviewCount: 62, downloads: 31200, downloads30d: 4100, activeDeployments: 890, workflowCompletions: 0.98, validationBadge: true, certifiedBadge: false, compatibility: { isaac_sdk: ">=2.5", ros: ["humble", "iron", "jazzy"], platforms: ["Jetson Orin", "Jetson AGX", "x86_64"] }, updatedAt: "2026-04-05", publishedAt: "2025-06-20", contributors: 14, dependents: 23 },
  { id: 4, name: "domain-rand-factory", displayName: "Domain Randomization Factory", description: "Automated domain randomization for sim-to-real transfer. Configurable textures, lighting, physics. Curriculum-aware difficulty scaling.", domain: "data_training", tags: ["sim2real", "training", "curriculum"], author: { name: "Isaac Team", org: "NVIDIA", tier: "core" }, version: "1.5.0", license: "Apache-2.0", hubScore: 88, rating: 4.5, reviewCount: 29, downloads: 9800, downloads30d: 1450, activeDeployments: 234, workflowCompletions: 0.94, validationBadge: true, certifiedBadge: true, compatibility: { isaac_sdk: ">=3.0", ros: [], platforms: ["x86_64 + RTX 3090+"] }, updatedAt: "2026-03-20", publishedAt: "2025-09-10", contributors: 6, dependents: 7 },
  { id: 5, name: "isaac-sim-warehouse", displayName: "Warehouse Environment Generator", description: "Procedural warehouse environment generation for Isaac Sim. Configurable rack layouts, dynamic obstacles, worker agents.", domain: "simulation", tags: ["warehouse", "procedural", "isaac-sim"], author: { name: "Tom Park", org: "NVIDIA", tier: "core" }, version: "2.1.0", license: "Apache-2.0", hubScore: 86, rating: 4.7, reviewCount: 21, downloads: 7600, downloads30d: 1120, activeDeployments: 178, workflowCompletions: 0.97, validationBadge: true, certifiedBadge: true, compatibility: { isaac_sdk: ">=3.0", ros: [], platforms: ["x86_64 + RTX 4070+"] }, updatedAt: "2026-03-15", publishedAt: "2025-10-05", contributors: 4, dependents: 9 },
  { id: 6, name: "pid-auto-tuner", displayName: "Adaptive PID Auto-Tuner", description: "Automatic PID controller tuning using Bayesian optimization. Supports cascade, feedforward, and multi-axis configurations.", domain: "control", tags: ["pid", "auto-tune", "bayesian"], author: { name: "Raj Patel", org: "ControlSys", tier: "verified" }, version: "1.0.3", license: "MIT", hubScore: 82, rating: 4.4, reviewCount: 18, downloads: 5400, downloads30d: 780, activeDeployments: 145, workflowCompletions: 0.91, validationBadge: true, certifiedBadge: false, compatibility: { isaac_sdk: ">=2.5", ros: ["humble"], platforms: ["Jetson Orin", "x86_64"] }, updatedAt: "2026-04-01", publishedAt: "2026-01-15", contributors: 3, dependents: 4 },
  { id: 7, name: "safety-zone-monitor", displayName: "Dynamic Safety Zone Monitor", description: "Real-time safety zone monitoring with 3D occupancy grids. ISO 13482 compliant. Velocity-dependent boundaries and e-stop triggers.", domain: "safety", tags: ["safety", "iso-13482", "e-stop"], author: { name: "SafeBot Team", org: "SafeBot GmbH", tier: "certified" }, version: "1.3.2", license: "Apache-2.0", hubScore: 85, rating: 4.9, reviewCount: 15, downloads: 4200, downloads30d: 890, activeDeployments: 267, workflowCompletions: 0.99, validationBadge: true, certifiedBadge: true, compatibility: { isaac_sdk: ">=3.0", ros: ["humble", "iron"], platforms: ["Jetson Orin", "x86_64"] }, updatedAt: "2026-03-30", publishedAt: "2025-12-01", contributors: 4, dependents: 11 },
  { id: 8, name: "ros2-cloud-bridge", displayName: "ROS2 Cloud Bridge", description: "Bidirectional ROS2-to-cloud bridge. Supports AWS RoboMaker, Azure IoT, and NVIDIA Fleet Command. Auto-reconnection and queuing.", domain: "integration", tags: ["ros2", "cloud", "fleet"], author: { name: "CloudRobo", org: "Community", tier: "community" }, version: "0.9.1", license: "MIT", hubScore: 74, rating: 4.2, reviewCount: 11, downloads: 3100, downloads30d: 520, activeDeployments: 89, workflowCompletions: 0.88, validationBadge: true, certifiedBadge: false, compatibility: { isaac_sdk: ">=2.5", ros: ["humble", "iron"], platforms: ["x86_64", "Jetson Orin"] }, updatedAt: "2026-04-07", publishedAt: "2026-02-10", contributors: 2, dependents: 2 },
  { id: 9, name: "multi-robot-coord", displayName: "Multi-Robot Coordinator", description: "Decentralized multi-robot task allocation. Conflict-free path planning for up to 100 robots. Heterogeneous fleet support.", domain: "navigation", tags: ["multi-robot", "fleet", "coordination"], author: { name: "Fleet Labs", org: "Community", tier: "verified" }, version: "1.1.0", license: "Apache-2.0", hubScore: 83, rating: 4.5, reviewCount: 22, downloads: 6700, downloads30d: 1100, activeDeployments: 56, workflowCompletions: 0.90, validationBadge: true, certifiedBadge: false, compatibility: { isaac_sdk: ">=3.0", ros: ["humble"], platforms: ["x86_64"] }, updatedAt: "2026-03-25", publishedAt: "2025-11-20", contributors: 7, dependents: 3 },
  { id: 10, name: "pose-estimation-foundationpose", displayName: "FoundationPose Estimator", description: "6-DOF pose estimation using FoundationPose. Zero-shot on novel objects with RGB-D input. Real-time on Jetson Orin.", domain: "perception", tags: ["pose-estimation", "foundation-model", "zero-shot"], author: { name: "Vision Team", org: "NVIDIA", tier: "core" }, version: "2.0.0", license: "Apache-2.0", hubScore: 92, rating: 4.8, reviewCount: 38, downloads: 15800, downloads30d: 2800, activeDeployments: 445, workflowCompletions: 0.95, validationBadge: true, certifiedBadge: true, compatibility: { isaac_sdk: ">=3.0", ros: ["humble"], platforms: ["Jetson Orin", "x86_64 + RTX 3090+"] }, updatedAt: "2026-04-06", publishedAt: "2025-07-01", contributors: 9, dependents: 15 },
  { id: 11, name: "rl-locomotion-anymal", displayName: "RL Locomotion Policy", description: "Reinforcement learning locomotion for quadruped robots. Trained in Isaac Sim with automatic curriculum. Rough terrain and stairs.", domain: "control", tags: ["reinforcement-learning", "locomotion", "quadruped"], author: { name: "Leo M\u00FCller", org: "ETH Robotics", tier: "certified" }, version: "1.4.0", license: "MIT", hubScore: 87, rating: 4.6, reviewCount: 26, downloads: 8900, downloads30d: 1300, activeDeployments: 167, workflowCompletions: 0.93, validationBadge: true, certifiedBadge: true, compatibility: { isaac_sdk: ">=3.0", ros: ["humble"], platforms: ["x86_64 + RTX 4080+"] }, updatedAt: "2026-03-18", publishedAt: "2025-10-20", contributors: 5, dependents: 4 },
  { id: 12, name: "synthetic-data-annotator", displayName: "Synthetic Data Auto-Annotator", description: "Automatic annotation for synthetic datasets. Bounding boxes, segmentation masks, depth maps, 6-DOF poses. COCO/KITTI formats.", domain: "data_training", tags: ["annotation", "synthetic-data", "coco"], author: { name: "DataForge", org: "Community", tier: "verified" }, version: "1.2.1", license: "Apache-2.0", hubScore: 80, rating: 4.3, reviewCount: 19, downloads: 6200, downloads30d: 950, activeDeployments: 198, workflowCompletions: 0.94, validationBadge: true, certifiedBadge: false, compatibility: { isaac_sdk: ">=2.5", ros: [], platforms: ["x86_64"] }, updatedAt: "2026-03-22", publishedAt: "2025-12-15", contributors: 4, dependents: 6 },
];

// ─── STYLES ────────────────────────────────────────────────────────────────────

const injectStyles = () => {
  if (document.getElementById("nv-styles")) return;
  const s = document.createElement("style");
  s.id = "nv-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@300;400;500;600;700;800&family=Barlow+Condensed:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --nv-black: #000000;
      --nv-surface: #0a0a0a;
      --nv-card: #111111;
      --nv-border: #1c1c1c;
      --nv-border-subtle: #141414;
      --nv-white: #ffffff;
      --nv-gray-100: #f0f0f0;
      --nv-gray-200: #cccccc;
      --nv-gray-400: #888888;
      --nv-gray-500: #666666;
      --nv-gray-600: #444444;
      --nv-gray-800: #1a1a1a;
      --nv-green: #76b900;
      --nv-green-hover: #84d100;
    }

    .nv {
      font-family: 'Barlow', system-ui, -apple-system, sans-serif;
      background: var(--nv-black);
      color: var(--nv-white);
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }

    .nv * { box-sizing: border-box; }
    .nv *::-webkit-scrollbar { width: 4px; height: 4px; }
    .nv *::-webkit-scrollbar-track { background: transparent; }
    .nv *::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

    .nv .mono { font-family: 'JetBrains Mono', monospace; }
    .nv .condensed { font-family: 'Barlow Condensed', 'Barlow', sans-serif; }

    @keyframes nv-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes nv-in { from { opacity: 0; } to { opacity: 1; } }
    .nv-up { animation: nv-up 0.4s ease both; }
    .nv-in { animation: nv-in 0.3s ease both; }
  `;
  document.head.appendChild(s);
};

// ─── HELPERS ───────────────────────────────────────────────────────────────────

const fmt = n => n >= 1000 ? `${(n/1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function SkillCard({ skill, onClick, delay = 0 }) {
  const domain = DOMAINS.find(d => d.id === skill.domain);
  return (
    <div
      onClick={() => onClick(skill)}
      className="nv-up"
      style={{
        animationDelay: `${delay}ms`,
        background: "var(--nv-card)",
        border: "1px solid var(--nv-border-subtle)",
        borderRadius: 4,
        padding: "24px",
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--nv-border)"; e.currentTarget.style.background = "#151515"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--nv-border-subtle)"; e.currentTarget.style.background = "var(--nv-card)"; }}
    >
      {/* Top: Score + Name */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 12 }}>
        <span className="condensed" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: skill.hubScore >= 90 ? "var(--nv-green)" : skill.hubScore >= 80 ? "var(--nv-gray-200)" : "var(--nv-gray-400)", minWidth: 36 }}>
          {skill.hubScore}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.3, marginBottom: 4 }}>{skill.displayName}</div>
          <div className="mono" style={{ fontSize: 11, color: "var(--nv-gray-500)" }}>{skill.name} <span style={{ color: "var(--nv-gray-600)" }}>v{skill.version}</span></div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--nv-gray-400)", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {skill.description}
      </p>

      {/* Bottom row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="mono" style={{ fontSize: 11, color: "var(--nv-gray-500)" }}>
            <Star size={10} style={{ display: "inline", verticalAlign: -1, marginRight: 3, color: "var(--nv-gray-400)" }} />
            {skill.rating}
          </span>
          <span className="mono" style={{ fontSize: 11, color: "var(--nv-gray-500)" }}>
            <Download size={10} style={{ display: "inline", verticalAlign: -1, marginRight: 3 }} />
            {fmt(skill.downloads)}
          </span>
          <span className="mono" style={{ fontSize: 11, color: "var(--nv-gray-500)" }}>
            {skill.activeDeployments} live
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {skill.certifiedBadge && (
            <span className="mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--nv-green)", padding: "2px 6px", border: "1px solid rgba(118,185,0,0.25)", borderRadius: 2 }}>
              Certified
            </span>
          )}
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--nv-gray-500)" }}>{domain?.label}</span>
        </div>
      </div>
    </div>
  );
}

function SkillDetail({ skill, onBack }) {
  const domain = DOMAINS.find(d => d.id === skill.domain);
  return (
    <div className="nv-in" style={{ maxWidth: 800, margin: "0 auto" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--nv-gray-500)", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 32 }}>
        <ArrowLeft size={14} /> Back
      </button>

      <div style={{ marginBottom: 40 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 24 }}>
          <span className="condensed" style={{ fontSize: 48, fontWeight: 700, lineHeight: 1, color: skill.hubScore >= 90 ? "var(--nv-green)" : "var(--nv-gray-200)" }}>
            {skill.hubScore}
          </span>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, marginBottom: 8 }}>{skill.displayName}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <code className="mono" style={{ fontSize: 12, color: "var(--nv-gray-500)" }}>{skill.name}</code>
              <span className="mono" style={{ fontSize: 12, color: "var(--nv-gray-600)" }}>v{skill.version}</span>
              <span style={{ fontSize: 13, color: "var(--nv-gray-400)" }}>{skill.author.name} / {skill.author.org}</span>
              {skill.certifiedBadge && (
                <span className="mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--nv-green)", padding: "2px 6px", border: "1px solid rgba(118,185,0,0.25)", borderRadius: 2 }}>
                  Certified
                </span>
              )}
              {skill.validationBadge && (
                <span className="mono" style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--nv-gray-400)", padding: "2px 6px", border: "1px solid var(--nv-border)", borderRadius: 2 }}>
                  Sim Validated
                </span>
              )}
            </div>
          </div>
        </div>

        <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--nv-gray-400)", maxWidth: 640, marginBottom: 32 }}>
          {skill.description}
        </p>

        {/* Metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--nv-border-subtle)", borderRadius: 4, overflow: "hidden", marginBottom: 32 }}>
          {[
            { label: "Downloads", value: fmt(skill.downloads), sub: `${fmt(skill.downloads30d)} / 30d` },
            { label: "Deployments", value: String(skill.activeDeployments), sub: `${Math.round(skill.workflowCompletions * 100)}% success` },
            { label: "Rating", value: String(skill.rating), sub: `${skill.reviewCount} reviews` },
            { label: "Dependents", value: String(skill.dependents), sub: `${skill.contributors} contributors` },
          ].map(m => (
            <div key={m.label} style={{ background: "var(--nv-card)", padding: "20px 24px" }}>
              <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nv-gray-600)", marginBottom: 8 }}>{m.label}</div>
              <div className="condensed" style={{ fontSize: 24, fontWeight: 700, lineHeight: 1 }}>{m.value}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--nv-gray-500)", marginTop: 4 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Compatibility + Tags */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 32 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nv-gray-600)", marginBottom: 12 }}>Compatibility</div>
            <div className="mono" style={{ fontSize: 12, lineHeight: 2, color: "var(--nv-gray-400)" }}>
              <div>Isaac SDK <span style={{ color: "var(--nv-green)" }}>{skill.compatibility.isaac_sdk}</span></div>
              {skill.compatibility.ros.length > 0 && <div>ROS 2 <span style={{ color: "var(--nv-gray-200)" }}>{skill.compatibility.ros.join(", ")}</span></div>}
              <div>Platforms <span style={{ color: "var(--nv-gray-200)" }}>{skill.compatibility.platforms.join(", ")}</span></div>
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nv-gray-600)", marginBottom: 12 }}>Classification</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--nv-green)", padding: "3px 8px", border: "1px solid rgba(118,185,0,0.2)", borderRadius: 2 }}>{domain?.label}</span>
              {skill.tags.map(t => (
                <span key={t} className="mono" style={{ fontSize: 11, color: "var(--nv-gray-500)", padding: "3px 8px", border: "1px solid var(--nv-border)", borderRadius: 2 }}>{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--nv-border-subtle)", marginBottom: 24 }} />

        {/* Install + metadata */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nv-gray-600)", marginBottom: 12 }}>Install</div>
            <div className="mono" style={{ fontSize: 12, padding: "16px 20px", background: "var(--nv-card)", border: "1px solid var(--nv-border-subtle)", borderRadius: 4, lineHeight: 2 }}>
              <div><span style={{ color: "var(--nv-green)" }}>$</span> isaac-hub install {skill.name}</div>
              <div style={{ color: "var(--nv-gray-600)" }}># or add to workflow</div>
              <div><span style={{ color: "var(--nv-green)" }}>$</span> isaac-hub add {skill.name} --workflow my-pipeline</div>
            </div>
          </div>
          <div>
            <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nv-gray-600)", marginBottom: 12 }}>Structure</div>
            <div className="mono" style={{ fontSize: 12, padding: "16px 20px", background: "var(--nv-card)", border: "1px solid var(--nv-border-subtle)", borderRadius: 4, lineHeight: 2 }}>
              <div style={{ color: "var(--nv-green)" }}>{skill.name}/</div>
              <div style={{ color: "var(--nv-gray-500)" }}>{"\u251C"} SKILL.md</div>
              <div style={{ color: "var(--nv-gray-600)" }}>{"\u251C"} scripts/ {"\u251C"} tests/</div>
              <div style={{ color: "var(--nv-gray-600)" }}>{"\u2514"} examples/ references/</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--nv-gray-600)", display: "flex", gap: 16 }}>
            <span>Published {skill.publishedAt}</span>
            <span>Updated {skill.updatedAt}</span>
            <span>{skill.license}</span>
          </div>
          <button style={{ background: "var(--nv-green)", color: "#000", border: "none", borderRadius: 4, padding: "10px 28px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--nv-green-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--nv-green)"}
          >
            <Download size={14} style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} />
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

function ContributePage({ onBack }) {
  return (
    <div className="nv-in" style={{ maxWidth: 640, margin: "0 auto" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--nv-gray-500)", fontSize: 13, cursor: "pointer", padding: 0, marginBottom: 40 }}>
        <ArrowLeft size={14} /> Back
      </button>

      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 12 }}>Contribute a Skill</h1>
      <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--nv-gray-400)", marginBottom: 48, maxWidth: 480 }}>
        Share your robotics expertise. Skills use the open Isaac Skill Standard and are reviewed before publication.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 40, marginBottom: 48 }}>
        {[
          { n: "01", title: "Scaffold", desc: "Create a skill directory with SKILL.md, LICENSE.txt, and entry point.", cmd: "isaac-hub init my-skill" },
          { n: "02", title: "Test & document", desc: "Add unit tests, sim tests, examples, and reference docs. Your HubScore depends on coverage.", cmd: "isaac-hub validate ./my-skill" },
          { n: "03", title: "Submit", desc: "Fork, add to skills/<domain>/, and open a PR. Automated checks run on CI.", cmd: "gh pr create" },
        ].map(s => (
          <div key={s.n} style={{ display: "flex", gap: 24 }}>
            <span className="condensed" style={{ fontSize: 32, fontWeight: 700, color: "var(--nv-gray-600)", lineHeight: 1, minWidth: 36 }}>{s.n}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{s.title}</div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--nv-gray-400)", marginBottom: 12 }}>{s.desc}</p>
              <div className="mono" style={{ fontSize: 12, color: "var(--nv-gray-200)", padding: "10px 16px", background: "var(--nv-card)", border: "1px solid var(--nv-border-subtle)", borderRadius: 4 }}>
                <span style={{ color: "var(--nv-green)" }}>$</span> {s.cmd}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: "var(--nv-border-subtle)", marginBottom: 40 }} />

      {/* SKILL.md format */}
      <div style={{ marginBottom: 40 }}>
        <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nv-gray-600)", marginBottom: 16 }}>SKILL.md Format</div>
        <div className="mono" style={{ fontSize: 12, lineHeight: 1.8, padding: "20px 24px", background: "var(--nv-card)", border: "1px solid var(--nv-border-subtle)", borderRadius: 4 }}>
          <div style={{ color: "var(--nv-green)" }}>---</div>
          <div><span style={{ color: "var(--nv-gray-400)" }}>name:</span> my-skill</div>
          <div><span style={{ color: "var(--nv-gray-400)" }}>version:</span> 1.0.0</div>
          <div><span style={{ color: "var(--nv-gray-400)" }}>description:</span> <span style={{ color: "var(--nv-gray-500)" }}>When should an agent use this?</span></div>
          <div><span style={{ color: "var(--nv-gray-400)" }}>domain:</span> navigation</div>
          <div><span style={{ color: "var(--nv-gray-400)" }}>inputs:</span> <span style={{ color: "var(--nv-gray-600)" }}># ROS msg types</span></div>
          <div><span style={{ color: "var(--nv-gray-400)" }}>outputs:</span></div>
          <div><span style={{ color: "var(--nv-gray-400)" }}>platforms:</span> <span style={{ color: "var(--nv-gray-600)" }}># hardware compat</span></div>
          <div><span style={{ color: "var(--nv-gray-400)" }}>validation:</span> <span style={{ color: "var(--nv-gray-600)" }}># sim test criteria</span></div>
          <div style={{ color: "var(--nv-green)" }}>---</div>
        </div>
      </div>

      {/* Contributor tiers */}
      <div>
        <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nv-gray-600)", marginBottom: 16 }}>Contributor Tiers</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "var(--nv-border-subtle)", borderRadius: 4, overflow: "hidden" }}>
          {[
            { tier: "Community", desc: "GitHub account", perks: "Submit, rate, review" },
            { tier: "Verified", desc: "3+ published skills", perks: "Priority review" },
            { tier: "Certified", desc: "NVIDIA partner", perks: "Fast-track publishing" },
            { tier: "Core", desc: "Maintainers", perks: "Full admin" },
          ].map(t => (
            <div key={t.tier} style={{ background: "var(--nv-card)", padding: "16px 20px" }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{t.tier}</div>
              <div style={{ fontSize: 12, color: "var(--nv-gray-500)" }}>{t.desc}</div>
              <div className="mono" style={{ fontSize: 11, color: "var(--nv-gray-600)", marginTop: 4 }}>{t.perks}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────────

export default function IsaacSkillHub() {
  const [view, setView] = useState("home");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [sortBy, setSortBy] = useState("hubScore");

  useEffect(() => { injectStyles(); }, []);

  const filteredSkills = useMemo(() => {
    let result = [...SKILLS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        s.displayName.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedDomain) result = result.filter(s => s.domain === selectedDomain);
    result.sort((a, b) => {
      if (sortBy === "hubScore") return b.hubScore - a.hubScore;
      if (sortBy === "downloads") return b.downloads - a.downloads;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "recent") return new Date(b.updatedAt) - new Date(a.updatedAt);
      return 0;
    });
    return result;
  }, [searchQuery, selectedDomain, sortBy]);

  const handleSkillClick = useCallback((skill) => {
    setSelectedSkill(skill);
    setView("detail");
    window.scrollTo(0, 0);
  }, []);

  const nav = (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--nv-border-subtle)" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => { setView("home"); setSelectedSkill(null); }}>
          <div style={{ width: 28, height: 28, background: "var(--nv-green)", borderRadius: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box size={14} color="#000" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>Isaac Skill Hub</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <button onClick={() => setView("contribute")} style={{ background: "none", border: "none", color: "var(--nv-gray-400)", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--nv-white)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--nv-gray-400)"}
          >Contribute</button>
          <a href="https://github.com/lingqnv/isaac-skill-hub" target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--nv-gray-400)", fontSize: 13, fontWeight: 500, textDecoration: "none", transition: "color 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--nv-white)"}
            onMouseLeave={e => e.currentTarget.style.color = "var(--nv-gray-400)"}
          ><Github size={15} /> GitHub</a>
          <button style={{ background: "var(--nv-green)", color: "#000", border: "none", borderRadius: 3, padding: "7px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--nv-green-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--nv-green)"}
          >Sign In</button>
        </div>
      </div>
    </nav>
  );

  // Detail
  if (view === "detail" && selectedSkill) {
    return (
      <div className="nv">
        {nav}
        <div style={{ padding: "40px 32px" }}>
          <SkillDetail skill={selectedSkill} onBack={() => setView("home")} />
        </div>
      </div>
    );
  }

  // Contribute
  if (view === "contribute") {
    return (
      <div className="nv">
        {nav}
        <div style={{ padding: "40px 32px" }}>
          <ContributePage onBack={() => setView("home")} />
        </div>
      </div>
    );
  }

  // Home
  return (
    <div className="nv">
      {nav}

      {/* Hero — minimal */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "80px 32px 64px" }}>
        <div className="nv-up">
          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 16, maxWidth: 560 }}>
            The Open Registry for Robotics Skills
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--nv-gray-400)", marginBottom: 40, maxWidth: 460 }}>
            Discover, share, and deploy modular robotic capabilities. Built on the Anthropic Skill Standard.
          </p>
        </div>

        {/* Search */}
        <div className="nv-up" style={{ animationDelay: "80ms", maxWidth: 520, marginBottom: 48 }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--nv-gray-600)" }} />
            <input
              type="text"
              placeholder="Search skills..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="mono"
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                fontSize: 13,
                background: "var(--nv-card)",
                border: "1px solid var(--nv-border)",
                borderRadius: 4,
                color: "var(--nv-white)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = "var(--nv-green)"}
              onBlur={e => e.currentTarget.style.borderColor = "var(--nv-border)"}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="nv-up" style={{ animationDelay: "160ms", display: "flex", gap: 48, marginBottom: 64 }}>
          {[
            { label: "Skills", value: "247" },
            { label: "Contributors", value: "89" },
            { label: "Downloads", value: "1.2M" },
            { label: "Organizations", value: "34" },
          ].map(s => (
            <div key={s.label}>
              <div className="condensed" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, color: "var(--nv-green)" }}>{s.value}</div>
              <div className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nv-gray-600)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "var(--nv-border-subtle)", marginBottom: 32 }} />

        {/* Filters row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, overflowX: "auto" }}>
            <button
              onClick={() => setSelectedDomain(null)}
              className="mono"
              style={{
                padding: "6px 14px",
                fontSize: 11,
                border: `1px solid ${!selectedDomain ? "var(--nv-green)" : "var(--nv-border)"}`,
                borderRadius: 3,
                background: !selectedDomain ? "rgba(118,185,0,0.08)" : "transparent",
                color: !selectedDomain ? "var(--nv-green)" : "var(--nv-gray-500)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >All</button>
            {DOMAINS.map(d => (
              <button key={d.id}
                onClick={() => setSelectedDomain(selectedDomain === d.id ? null : d.id)}
                className="mono"
                style={{
                  padding: "6px 14px",
                  fontSize: 11,
                  border: `1px solid ${selectedDomain === d.id ? "var(--nv-green)" : "var(--nv-border)"}`,
                  borderRadius: 3,
                  background: selectedDomain === d.id ? "rgba(118,185,0,0.08)" : "transparent",
                  color: selectedDomain === d.id ? "var(--nv-green)" : "var(--nv-gray-500)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s",
                }}
              >{d.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--nv-gray-600)" }}>{filteredSkills.length} results</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="mono"
              style={{
                fontSize: 11,
                padding: "6px 10px",
                background: "var(--nv-card)",
                border: "1px solid var(--nv-border)",
                borderRadius: 3,
                color: "var(--nv-gray-400)",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="hubScore">Score</option>
              <option value="downloads">Downloads</option>
              <option value="rating">Rating</option>
              <option value="recent">Updated</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {filteredSkills.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} onClick={handleSkillClick} delay={i * 30} />
          ))}
        </div>

        {filteredSkills.length === 0 && (
          <div className="nv-in" style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: 15, color: "var(--nv-gray-500)" }}>No skills match your search.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--nv-border-subtle)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="mono" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--nv-gray-600)" }}>
            Isaac Skill Hub
          </span>
          <span className="mono" style={{ fontSize: 10, color: "var(--nv-gray-600)" }}>
            Apache 2.0 &middot; Anthropic Skill Standard
          </span>
        </div>
      </div>
    </div>
  );
}
