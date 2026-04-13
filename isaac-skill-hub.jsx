import { useState, useMemo, useCallback } from "react";
import { Search, Star, Download, Shield, CheckCircle, ChevronDown, ArrowUpRight, Users, TrendingUp, Package, Filter, X, Award, Clock, GitFork, Heart, BarChart3, Zap, Eye, BookOpen, Plus, ArrowLeft, ExternalLink, Github, Code, FileText, Terminal } from "lucide-react";

// ─── SAMPLE DATA ───────────────────────────────────────────────────────────────

const DOMAINS = [
  { id: "navigation", label: "Navigation", icon: "🧭", color: "bg-blue-500" },
  { id: "manipulation", label: "Manipulation", icon: "🦾", color: "bg-purple-500" },
  { id: "perception", label: "Perception", icon: "👁️", color: "bg-green-500" },
  { id: "data_training", label: "Data & Training", icon: "📊", color: "bg-orange-500" },
  { id: "simulation", label: "Simulation", icon: "🌐", color: "bg-cyan-500" },
  { id: "control", label: "Control", icon: "🎛️", color: "bg-red-500" },
  { id: "safety", label: "Safety", icon: "🛡️", color: "bg-yellow-500" },
  { id: "integration", label: "Integration", icon: "🔌", color: "bg-pink-500" },
];

const SKILLS = [
  {
    id: 1, name: "nav-slam-lidar", displayName: "LiDAR SLAM Navigation",
    description: "Real-time SLAM navigation using LiDAR point clouds. Supports 2D and 3D mapping with loop closure detection. Optimized for warehouse and logistics environments.",
    domain: "navigation", tags: ["slam", "lidar", "mapping", "warehouse"],
    author: { name: "Jane Chen", org: "NVIDIA", avatar: "JC", tier: "core" },
    version: "1.2.0", license: "Apache-2.0",
    hubScore: 94, rating: 4.8, reviewCount: 47, downloads: 18420, downloads30d: 2340,
    activeDeployments: 512, workflowCompletions: 0.96,
    validationBadge: true, certifiedBadge: true, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=3.0", ros: ["humble", "iron"], platforms: ["Jetson Orin", "x86_64"] },
    updatedAt: "2026-04-02", publishedAt: "2025-08-15", contributors: 8,
    dependencies: 3, dependents: 12,
  },
  {
    id: 2, name: "grasp-6dof-transformer", displayName: "6-DOF Grasp Planner",
    description: "Transformer-based 6-DOF grasp pose prediction from point clouds. Handles novel objects with zero-shot generalization. Integrated with MoveIt2 for motion planning.",
    domain: "manipulation", tags: ["grasping", "transformer", "6dof", "point-cloud"],
    author: { name: "Alex Kim", org: "RoboLabs", avatar: "AK", tier: "verified" },
    version: "2.0.1", license: "MIT",
    hubScore: 91, rating: 4.7, reviewCount: 34, downloads: 14200, downloads30d: 1980,
    activeDeployments: 389, workflowCompletions: 0.92,
    validationBadge: true, certifiedBadge: true, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=3.0", ros: ["humble"], platforms: ["x86_64 + RTX 4090", "Jetson Orin"] },
    updatedAt: "2026-03-28", publishedAt: "2025-11-01", contributors: 5,
    dependencies: 4, dependents: 8,
  },
  {
    id: 3, name: "perception-yolo-ros2", displayName: "YOLO Object Detection (ROS2)",
    description: "Production-ready YOLO v8/v9 object detection wrapped as a ROS2 node. Auto-selects model variant based on available GPU memory. Includes custom training pipeline.",
    domain: "perception", tags: ["yolo", "detection", "ros2", "real-time"],
    author: { name: "Maria Santos", org: "Community", avatar: "MS", tier: "verified" },
    version: "3.1.0", license: "Apache-2.0",
    hubScore: 89, rating: 4.6, reviewCount: 62, downloads: 31200, downloads30d: 4100,
    activeDeployments: 890, workflowCompletions: 0.98,
    validationBadge: true, certifiedBadge: false, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=2.5", ros: ["humble", "iron", "jazzy"], platforms: ["Jetson Orin", "Jetson AGX", "x86_64"] },
    updatedAt: "2026-04-05", publishedAt: "2025-06-20", contributors: 14,
    dependencies: 2, dependents: 23,
  },
  {
    id: 4, name: "domain-rand-factory", displayName: "Domain Randomization Factory",
    description: "Automated domain randomization for sim-to-real transfer. Configurable randomization of textures, lighting, physics, and camera parameters. Curriculum-aware difficulty scaling.",
    domain: "data_training", tags: ["domain-randomization", "sim2real", "training", "curriculum"],
    author: { name: "Isaac Team", org: "NVIDIA", avatar: "IT", tier: "core" },
    version: "1.5.0", license: "Apache-2.0",
    hubScore: 88, rating: 4.5, reviewCount: 29, downloads: 9800, downloads30d: 1450,
    activeDeployments: 234, workflowCompletions: 0.94,
    validationBadge: true, certifiedBadge: true, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=3.0", ros: [], platforms: ["x86_64 + RTX 3090+"] },
    updatedAt: "2026-03-20", publishedAt: "2025-09-10", contributors: 6,
    dependencies: 5, dependents: 7,
  },
  {
    id: 5, name: "isaac-sim-warehouse", displayName: "Warehouse Environment Generator",
    description: "Procedural warehouse environment generation for Isaac Sim. Configurable rack layouts, dynamic obstacles, worker agents, and lighting conditions.",
    domain: "simulation", tags: ["warehouse", "procedural", "environment", "isaac-sim"],
    author: { name: "Tom Park", org: "NVIDIA", avatar: "TP", tier: "core" },
    version: "2.1.0", license: "Apache-2.0",
    hubScore: 86, rating: 4.7, reviewCount: 21, downloads: 7600, downloads30d: 1120,
    activeDeployments: 178, workflowCompletions: 0.97,
    validationBadge: true, certifiedBadge: true, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=3.0", ros: [], platforms: ["x86_64 + RTX 4070+"] },
    updatedAt: "2026-03-15", publishedAt: "2025-10-05", contributors: 4,
    dependencies: 2, dependents: 9,
  },
  {
    id: 6, name: "pid-auto-tuner", displayName: "Adaptive PID Auto-Tuner",
    description: "Automatic PID controller tuning using Bayesian optimization. Supports cascade, feedforward, and multi-axis configurations. Real-time adaptation during operation.",
    domain: "control", tags: ["pid", "auto-tune", "bayesian", "adaptive"],
    author: { name: "Raj Patel", org: "ControlSys", avatar: "RP", tier: "verified" },
    version: "1.0.3", license: "MIT",
    hubScore: 82, rating: 4.4, reviewCount: 18, downloads: 5400, downloads30d: 780,
    activeDeployments: 145, workflowCompletions: 0.91,
    validationBadge: true, certifiedBadge: false, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=2.5", ros: ["humble"], platforms: ["Jetson Orin", "x86_64"] },
    updatedAt: "2026-04-01", publishedAt: "2026-01-15", contributors: 3,
    dependencies: 1, dependents: 4,
  },
  {
    id: 7, name: "safety-zone-monitor", displayName: "Dynamic Safety Zone Monitor",
    description: "Real-time safety zone monitoring using 3D occupancy grids. ISO 13482 compliant. Configurable zones with velocity-dependent boundaries and emergency stop triggers.",
    domain: "safety", tags: ["safety", "iso-13482", "monitoring", "e-stop"],
    author: { name: "SafeBot Team", org: "SafeBot GmbH", avatar: "SB", tier: "certified" },
    version: "1.3.2", license: "Apache-2.0",
    hubScore: 85, rating: 4.9, reviewCount: 15, downloads: 4200, downloads30d: 890,
    activeDeployments: 267, workflowCompletions: 0.99,
    validationBadge: true, certifiedBadge: true, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=3.0", ros: ["humble", "iron"], platforms: ["Jetson Orin", "x86_64"] },
    updatedAt: "2026-03-30", publishedAt: "2025-12-01", contributors: 4,
    dependencies: 2, dependents: 11,
  },
  {
    id: 8, name: "ros2-cloud-bridge", displayName: "ROS2 Cloud Bridge",
    description: "Bidirectional bridge between ROS2 and cloud services. Supports AWS RoboMaker, Azure IoT, and NVIDIA Fleet Command. Automatic reconnection and message queuing.",
    domain: "integration", tags: ["ros2", "cloud", "aws", "azure", "fleet"],
    author: { name: "CloudRobo", org: "Community", avatar: "CR", tier: "community" },
    version: "0.9.1", license: "MIT",
    hubScore: 74, rating: 4.2, reviewCount: 11, downloads: 3100, downloads30d: 520,
    activeDeployments: 89, workflowCompletions: 0.88,
    validationBadge: true, certifiedBadge: false, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=2.5", ros: ["humble", "iron"], platforms: ["x86_64", "Jetson Orin"] },
    updatedAt: "2026-04-07", publishedAt: "2026-02-10", contributors: 2,
    dependencies: 3, dependents: 2,
  },
  {
    id: 9, name: "multi-robot-coord", displayName: "Multi-Robot Coordinator",
    description: "Decentralized multi-robot task allocation and coordination. Conflict-free path planning for up to 100 robots. Supports heterogeneous fleets.",
    domain: "navigation", tags: ["multi-robot", "coordination", "fleet", "task-allocation"],
    author: { name: "Fleet Labs", org: "Community", avatar: "FL", tier: "verified" },
    version: "1.1.0", license: "Apache-2.0",
    hubScore: 83, rating: 4.5, reviewCount: 22, downloads: 6700, downloads30d: 1100,
    activeDeployments: 56, workflowCompletions: 0.90,
    validationBadge: true, certifiedBadge: false, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=3.0", ros: ["humble"], platforms: ["x86_64"] },
    updatedAt: "2026-03-25", publishedAt: "2025-11-20", contributors: 7,
    dependencies: 4, dependents: 3,
  },
  {
    id: 10, name: "pose-estimation-foundationpose", displayName: "FoundationPose Estimator",
    description: "6-DOF pose estimation using FoundationPose. Zero-shot on novel objects with only RGB-D input. Real-time inference on Jetson Orin.",
    domain: "perception", tags: ["pose-estimation", "6dof", "foundation-model", "zero-shot"],
    author: { name: "Vision Team", org: "NVIDIA", avatar: "VT", tier: "core" },
    version: "2.0.0", license: "Apache-2.0",
    hubScore: 92, rating: 4.8, reviewCount: 38, downloads: 15800, downloads30d: 2800,
    activeDeployments: 445, workflowCompletions: 0.95,
    validationBadge: true, certifiedBadge: true, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=3.0", ros: ["humble"], platforms: ["Jetson Orin", "x86_64 + RTX 3090+"] },
    updatedAt: "2026-04-06", publishedAt: "2025-07-01", contributors: 9,
    dependencies: 3, dependents: 15,
  },
  {
    id: 11, name: "rl-locomotion-anymal", displayName: "RL Locomotion Policy (ANYmal-style)",
    description: "Reinforcement learning locomotion policies for quadruped robots. Trained in Isaac Sim with automatic curriculum. Supports rough terrain, stairs, and dynamic obstacles.",
    domain: "control", tags: ["reinforcement-learning", "locomotion", "quadruped", "legged"],
    author: { name: "Leo Müller", org: "ETH Robotics", avatar: "LM", tier: "certified" },
    version: "1.4.0", license: "MIT",
    hubScore: 87, rating: 4.6, reviewCount: 26, downloads: 8900, downloads30d: 1300,
    activeDeployments: 167, workflowCompletions: 0.93,
    validationBadge: true, certifiedBadge: true, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=3.0", ros: ["humble"], platforms: ["x86_64 + RTX 4080+"] },
    updatedAt: "2026-03-18", publishedAt: "2025-10-20", contributors: 5,
    dependencies: 6, dependents: 4,
  },
  {
    id: 12, name: "synthetic-data-annotator", displayName: "Synthetic Data Auto-Annotator",
    description: "Automatic annotation generation for synthetic datasets. Bounding boxes, segmentation masks, depth maps, and 6-DOF poses. Customizable annotation formats (COCO, KITTI, custom).",
    domain: "data_training", tags: ["annotation", "synthetic-data", "labeling", "coco", "kitti"],
    author: { name: "DataForge", org: "Community", avatar: "DF", tier: "verified" },
    version: "1.2.1", license: "Apache-2.0",
    hubScore: 80, rating: 4.3, reviewCount: 19, downloads: 6200, downloads30d: 950,
    activeDeployments: 198, workflowCompletions: 0.94,
    validationBadge: true, certifiedBadge: false, maintenanceStatus: "active",
    compatibility: { isaac_sdk: ">=2.5", ros: [], platforms: ["x86_64"] },
    updatedAt: "2026-03-22", publishedAt: "2025-12-15", contributors: 4,
    dependencies: 3, dependents: 6,
  },
];

const COLLECTIONS = [
  { id: 1, name: "Getting Started with Mobile Robots", skillCount: 8, icon: "🤖" },
  { id: 2, name: "Production Manipulation Pipeline", skillCount: 6, icon: "🏭" },
  { id: 3, name: "Sim-to-Real Transfer Kit", skillCount: 5, icon: "🔄" },
  { id: 4, name: "GTC 2026 Community Picks", skillCount: 12, icon: "⭐" },
];

const STATS = {
  totalSkills: 247, totalContributors: 89, totalDownloads: "1.2M", totalOrgs: 34,
};

// ─── COMPONENTS ────────────────────────────────────────────────────────────────

function Badge({ type, children }) {
  const styles = {
    certified: "bg-amber-100 text-amber-800 border border-amber-300",
    validated: "bg-green-100 text-green-800 border border-green-300",
    core: "bg-blue-100 text-blue-800 border border-blue-300",
    verified: "bg-purple-100 text-purple-800 border border-purple-300",
    community: "bg-gray-100 text-gray-600 border border-gray-300",
    active: "bg-green-100 text-green-700 border border-green-300",
    domain: "bg-slate-100 text-slate-700 border border-slate-200",
    tag: "bg-slate-50 text-slate-500 border border-slate-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[type] || styles.community}`}>
      {children}
    </span>
  );
}

function ScoreRing({ score, size = 40 }) {
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? "#22c55e" : score >= 80 ? "#3b82f6" : score >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="3"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>{score}</span>
    </div>
  );
}

function MetricPill({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-500">
      <Icon size={12} className="text-slate-400" />
      <span className="font-semibold text-slate-700">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function SkillCard({ skill, onClick }) {
  const domain = DOMAINS.find(d => d.id === skill.domain);
  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n;
  return (
    <div onClick={() => onClick(skill)} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <ScoreRing score={skill.hubScore} />
          <div>
            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-sm leading-tight">{skill.displayName}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs text-slate-400">by</span>
              <span className="text-xs font-medium text-slate-600">{skill.author.name}</span>
              {skill.author.tier === "core" && <Badge type="core">Core</Badge>}
              {skill.author.tier === "certified" && <Badge type="certified">Certified</Badge>}
              {skill.author.tier === "verified" && <Badge type="verified">Verified</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {skill.certifiedBadge && (
            <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center" title="NVIDIA Certified">
              <Award size={13} className="text-amber-600" />
            </div>
          )}
          {skill.validationBadge && (
            <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center" title="Sim Validated">
              <CheckCircle size={13} className="text-green-600" />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{skill.description}</p>

      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          <Star size={12} className="text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold text-slate-700">{skill.rating}</span>
          <span className="text-xs text-slate-400">({skill.reviewCount})</span>
        </div>
        <MetricPill icon={Download} value={fmt(skill.downloads)} label="" />
        <MetricPill icon={Users} value={skill.activeDeployments} label="active" />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <Badge type="domain">{domain?.icon} {domain?.label}</Badge>
        {skill.tags.slice(0, 2).map(t => <Badge key={t} type="tag">{t}</Badge>)}
        {skill.tags.length > 2 && <span className="text-xs text-slate-400">+{skill.tags.length - 2}</span>}
      </div>
    </div>
  );
}

function SkillDetail({ skill, onBack }) {
  const domain = DOMAINS.find(d => d.id === skill.domain);
  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}k` : n;
  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to skills
      </button>

      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <ScoreRing score={skill.hubScore} size={56} />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{skill.displayName}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <code className="text-sm text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{skill.name}</code>
                <span className="text-sm text-slate-400">v{skill.version}</span>
                <Badge type={skill.maintenanceStatus}>{skill.maintenanceStatus}</Badge>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white text-xs font-bold">{skill.author.avatar}</div>
                <span className="text-sm font-medium text-slate-700">{skill.author.name}</span>
                <span className="text-sm text-slate-400">{skill.author.org}</span>
                <Badge type={skill.author.tier}>{skill.author.tier}</Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {skill.certifiedBadge && <Badge type="certified"><Award size={11} /> NVIDIA Certified</Badge>}
            {skill.validationBadge && <Badge type="validated"><CheckCircle size={11} /> Sim Validated</Badge>}
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed mb-6">{skill.description}</p>

        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { icon: Download, label: "Downloads", value: fmt(skill.downloads), sub: `${fmt(skill.downloads30d)} last 30d` },
            { icon: Users, label: "Active Deployments", value: skill.activeDeployments.toLocaleString(), sub: `${Math.round(skill.workflowCompletions * 100)}% success rate` },
            { icon: Star, label: "Rating", value: skill.rating, sub: `${skill.reviewCount} reviews` },
            { icon: GitFork, label: "Ecosystem", value: `${skill.dependents} dependents`, sub: `${skill.contributors} contributors` },
          ].map((m, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <m.icon size={14} className="text-slate-400" />
                <span className="text-xs text-slate-500">{m.label}</span>
              </div>
              <div className="text-xl font-bold text-slate-900">{m.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Classification</h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge type="domain">{domain?.icon} {domain?.label}</Badge>
              {skill.tags.map(t => <Badge key={t} type="tag">{t}</Badge>)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Compatibility</h3>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div><span className="text-slate-400">Isaac SDK:</span> {skill.compatibility.isaac_sdk}</div>
              {skill.compatibility.ros.length > 0 && <div><span className="text-slate-400">ROS:</span> {skill.compatibility.ros.join(", ")}</div>}
              <div><span className="text-slate-400">Platforms:</span> {skill.compatibility.platforms.join(", ")}</div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>Published {skill.publishedAt}</span>
            <span>Updated {skill.updatedAt}</span>
            <span>{skill.license}</span>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-1.5">
              <BookOpen size={14} /> Docs
            </button>
            <button className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors flex items-center gap-1.5">
              <Download size={14} /> Install
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Terminal size={14} /> Quick Install</h3>
          <div className="bg-slate-900 text-green-400 rounded-lg p-4 font-mono text-sm">
            <div className="text-slate-500"># Install via CLI</div>
            <div>$ isaac-hub install {skill.name}</div>
            <div className="mt-2 text-slate-500"># Or add to your workflow</div>
            <div>$ isaac-hub add {skill.name} --workflow my-pipeline</div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2"><Github size={14} /> Source & Standard</h3>
          <div className="space-y-2.5">
            <a href={`https://github.com/nvidia/isaac-skill-hub/tree/main/skills/${skill.domain}/${skill.name}`} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
              <Code size={14} /> View SKILL.md on GitHub
            </a>
            <div className="text-xs text-slate-400">Format: Anthropic Skill Standard + Isaac Extensions</div>
            <div className="bg-slate-50 rounded-lg p-3 font-mono text-xs text-slate-600">
              <div>{skill.name}/</div>
              <div className="text-slate-400">├── SKILL.md</div>
              <div className="text-slate-400">├── LICENSE.txt</div>
              <div className="text-slate-400">├── scripts/</div>
              <div className="text-slate-400">├── tests/</div>
              <div className="text-slate-400">├── examples/</div>
              <div className="text-slate-400">└── references/</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContributePage({ onBack }) {
  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="bg-white rounded-xl border border-slate-200 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plus size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Contribute a Skill</h1>
          <p className="text-slate-500 mt-2 max-w-lg mx-auto">Share your robotics expertise with the Isaac community. Skills are packaged using the open Isaac Skill Standard and reviewed for quality before publication.</p>
        </div>

        <div className="space-y-6">
          {[
            { step: "1", title: "Create your SKILL.md", desc: "Scaffold a skill directory with SKILL.md (Anthropic format + Isaac extensions), LICENSE.txt, and scripts/. The SKILL.md frontmatter defines your interfaces, parameters, and compatibility.", code: "isaac-hub init my-skill" },
            { step: "2", title: "Add tests & documentation", desc: "Include unit tests, sim tests (optional), examples, and reference docs. Your HubScore depends on these. Follow the progressive disclosure pattern.", code: "isaac-hub validate ./my-skill" },
            { step: "3", title: "Submit via GitHub PR", desc: "Fork the repo, add your skill to skills/<domain>/, and open a PR. Automated checks run on CI. Certified contributors get fast-tracked review.", code: "git push origin add-my-skill && gh pr create" },
          ].map(s => (
            <div key={s.step} className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">{s.step}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-sm">{s.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{s.desc}</p>
                <div className="bg-slate-900 text-green-400 rounded-lg px-4 py-2.5 font-mono text-xs mt-2.5">$ {s.code}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-slate-100 pt-6 mb-6">
          <h3 className="font-semibold text-slate-900 text-sm mb-3">SKILL.md Format (Anthropic Standard)</h3>
          <p className="text-xs text-slate-500 mb-3">Every skill is a directory with a SKILL.md at its root. The format extends Anthropic's skill standard with typed I/O, hardware compatibility, and sim validation.</p>
          <div className="bg-slate-900 rounded-lg p-4 font-mono text-xs text-slate-300 overflow-x-auto">
            <div className="text-green-400">---</div>
            <div><span className="text-blue-400">name:</span> my-skill</div>
            <div><span className="text-blue-400">version:</span> 1.0.0</div>
            <div><span className="text-blue-400">description:</span> <span className="text-yellow-300">When should an agent use this?</span></div>
            <div><span className="text-blue-400">license:</span> Apache-2.0</div>
            <div><span className="text-blue-400">domain:</span> navigation</div>
            <div><span className="text-blue-400">execution:</span></div>
            <div>  <span className="text-blue-400">context:</span> hybrid</div>
            <div>  <span className="text-blue-400">entry_point:</span> scripts/main.py</div>
            <div><span className="text-blue-400">inputs:</span> <span className="text-slate-500"># Typed I/O (ROS msg types)</span></div>
            <div><span className="text-blue-400">outputs:</span></div>
            <div><span className="text-blue-400">parameters:</span> <span className="text-slate-500"># Tunable with ranges</span></div>
            <div><span className="text-blue-400">platforms:</span> <span className="text-slate-500"># Hardware compatibility</span></div>
            <div><span className="text-blue-400">validation:</span> <span className="text-slate-500"># Sim test criteria</span></div>
            <div className="text-green-400">---</div>
            <div className="mt-1 text-slate-500"># Markdown docs follow...</div>
          </div>
          <div className="mt-3 flex gap-2">
            <a href="https://github.com/nvidia/isaac-skill-hub/blob/main/standard/skill-standard-v1.md" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
              <FileText size={12} /> Full Standard Spec
            </a>
            <a href="https://github.com/nvidia/isaac-skill-hub/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium">
              <BookOpen size={12} /> Contributing Guide
            </a>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 mb-6">
          <h3 className="font-semibold text-slate-900 text-sm mb-4">Contributor Tiers</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { tier: "Community", desc: "Anyone with a GitHub or NVIDIA account", badge: "community", perks: "Submit skills, rate & review" },
              { tier: "Verified", desc: "3+ published skills, identity verified", badge: "verified", perks: "Priority review, Verified badge" },
              { tier: "Certified", desc: "NVIDIA partner or proven track record", badge: "certified", perks: "Fast-track publishing, Certified badge" },
              { tier: "Core", desc: "NVIDIA internal or appointed maintainers", badge: "core", perks: "Full admin, taxonomy changes" },
            ].map(t => (
              <div key={t.tier} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge type={t.badge}>{t.tier}</Badge>
                </div>
                <p className="text-xs text-slate-500">{t.desc}</p>
                <p className="text-xs text-slate-400 mt-1">{t.perks}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Leaderboard() {
  const topContributors = [
    { name: "Jane Chen", org: "NVIDIA", skills: 12, downloads: "45.2k", tier: "core" },
    { name: "Maria Santos", org: "Community", skills: 8, downloads: "38.1k", tier: "verified" },
    { name: "Vision Team", org: "NVIDIA", skills: 7, downloads: "31.5k", tier: "core" },
    { name: "Alex Kim", org: "RoboLabs", skills: 6, downloads: "22.8k", tier: "verified" },
    { name: "Leo Müller", org: "ETH Robotics", skills: 5, downloads: "18.3k", tier: "certified" },
  ];
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-4"><Award size={15} className="text-amber-500" /> Top Contributors</h3>
      <div className="space-y-3">
        {topContributors.map((c, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-300 w-4 text-right">{i+1}</span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold">
                {c.name.split(" ").map(n=>n[0]).join("")}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">{c.name}</div>
                <div className="text-xs text-slate-400">{c.org}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{c.skills} skills</span>
              <span className="text-xs text-slate-400">{c.downloads} ↓</span>
              <Badge type={c.tier}>{c.tier}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MAIN APP ──────────────────────────────────────────────────────────────────

export default function IsaacSkillHub() {
  const [view, setView] = useState("home");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDomain, setSelectedDomain] = useState(null);
  const [sortBy, setSortBy] = useState("hubScore");
  const [showFilters, setShowFilters] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [certifiedOnly, setCertifiedOnly] = useState(false);

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
    if (minRating > 0) result = result.filter(s => s.rating >= minRating);
    if (certifiedOnly) result = result.filter(s => s.certifiedBadge);
    result.sort((a, b) => {
      if (sortBy === "hubScore") return b.hubScore - a.hubScore;
      if (sortBy === "downloads") return b.downloads - a.downloads;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "recent") return new Date(b.updatedAt) - new Date(a.updatedAt);
      return 0;
    });
    return result;
  }, [searchQuery, selectedDomain, sortBy, minRating, certifiedOnly]);

  const handleSkillClick = useCallback((skill) => {
    setSelectedSkill(skill);
    setView("detail");
  }, []);

  if (view === "detail" && selectedSkill) {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("home")}>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">Isaac Skill Hub</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Alpha</span>
          </div>
        </nav>
        <div className="p-6">
          <SkillDetail skill={selectedSkill} onBack={() => setView("home")} />
        </div>
      </div>
    );
  }

  if (view === "contribute") {
    return (
      <div className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView("home")}>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Package size={16} className="text-white" />
            </div>
            <span className="font-bold text-slate-900">Isaac Skill Hub</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Alpha</span>
          </div>
        </nav>
        <div className="p-6">
          <ContributePage onBack={() => setView("home")} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <Package size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900">Isaac Skill Hub</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Alpha</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">Skills</button>
          <button className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">Collections</button>
          <button className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium" onClick={() => setView("contribute")}>Contribute</button>
          <button className="text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium">Docs</button>
          <a href="https://github.com/nvidia/isaac-skill-hub" target="_blank" rel="noopener" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors font-medium"><Github size={16} /> GitHub</a>
          <button className="px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">Sign In</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-3">The Open Registry for Robotics Skills</h1>
          <p className="text-slate-400 text-lg mb-3 max-w-2xl mx-auto">Discover, share, and deploy modular robotic capabilities. Built on the Anthropic Skill Standard — extended for physical AI.</p>
          <div className="flex items-center justify-center gap-3 mb-8">
            <a href="https://github.com/nvidia/isaac-skill-hub" target="_blank" rel="noopener" className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-white font-medium transition-colors">
              <Github size={16} /> Star on GitHub
            </a>
            <span className="text-slate-500 text-xs">Apache 2.0 · Based on Anthropic Skill Format</span>
          </div>
          <div className="relative max-w-xl mx-auto mb-8">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search skills... (e.g., SLAM, grasp planning, sim-to-real)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white text-slate-900 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex items-center justify-center gap-8 text-sm">
            {Object.entries(STATS).map(([k, v]) => (
              <div key={k} className="text-center">
                <div className="text-2xl font-bold text-white">{v}</div>
                <div className="text-slate-400 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Domain Chips */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedDomain(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!selectedDomain ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >All Domains</button>
          {DOMAINS.map(d => (
            <button key={d.id}
              onClick={() => setSelectedDomain(selectedDomain === d.id ? null : d.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${selectedDomain === d.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >{d.icon} {d.label}</button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Skills Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-slate-900">{filteredSkills.length} skills</h2>
                {selectedDomain && (
                  <button onClick={() => setSelectedDomain(null)} className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded-full">
                    <X size={11} /> Clear filter
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowFilters(!showFilters)} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showFilters ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <Filter size={12} /> Filters
                </button>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-600 bg-white">
                  <option value="hubScore">Hub Score</option>
                  <option value="downloads">Downloads</option>
                  <option value="rating">Rating</option>
                  <option value="recent">Recently Updated</option>
                </select>
              </div>
            </div>

            {showFilters && (
              <div className="bg-white border border-slate-200 rounded-lg p-4 mb-4 flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <span>Min Rating:</span>
                  <select value={minRating} onChange={e => setMinRating(Number(e.target.value))} className="border border-slate-200 rounded px-2 py-1 text-xs">
                    <option value={0}>Any</option>
                    <option value={4}>4+</option>
                    <option value={4.5}>4.5+</option>
                  </select>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={certifiedOnly} onChange={e => setCertifiedOnly(e.target.checked)} className="rounded" />
                  NVIDIA Certified only
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {filteredSkills.map(skill => (
                <SkillCard key={skill.id} skill={skill} onClick={handleSkillClick} />
              ))}
            </div>

            {filteredSkills.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <Search size={40} className="mx-auto mb-3 opacity-50" />
                <p className="font-medium">No skills match your search</p>
                <p className="text-sm mt-1">Try different keywords or clear your filters</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 space-y-6">
            <Leaderboard />

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-3"><Zap size={15} className="text-green-500" /> Curated Collections</h3>
              <div className="space-y-2.5">
                {COLLECTIONS.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors">
                    <span className="text-lg">{c.icon}</span>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-slate-700">{c.name}</div>
                      <div className="text-xs text-slate-400">{c.skillCount} skills</div>
                    </div>
                    <ArrowUpRight size={12} className="text-slate-300" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
              <h3 className="font-semibold text-sm mb-2">Share Your Skills</h3>
              <p className="text-green-100 text-xs leading-relaxed mb-3">The Isaac community needs your expertise. Contribute skills and help roboticists worldwide.</p>
              <button onClick={() => setView("contribute")} className="w-full py-2 bg-white text-green-700 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors flex items-center justify-center gap-1.5">
                <Plus size={14} /> Start Contributing
              </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2 mb-3"><BarChart3 size={15} className="text-blue-500" /> Hub Activity</h3>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between"><span>New skills this week</span><span className="font-semibold text-slate-900">7</span></div>
                <div className="flex justify-between"><span>Updates published</span><span className="font-semibold text-slate-900">23</span></div>
                <div className="flex justify-between"><span>Reviews submitted</span><span className="font-semibold text-slate-900">41</span></div>
                <div className="flex justify-between"><span>New contributors</span><span className="font-semibold text-slate-900">12</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
