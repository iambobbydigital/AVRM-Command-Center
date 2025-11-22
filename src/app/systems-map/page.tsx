"use client";

import { useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import { SystemsData, AVRMFunction, Task } from "@/lib/systems-data";

// Custom node components
function TaskNode({ data }: { data: { label: string; code: string; output: string } }) {
  return (
    <div className="w-[240px] min-h-[130px] px-4 py-3 rounded-lg bg-orange-500/20 border border-orange-500/50 flex flex-col justify-center">
      <div className="text-xs text-orange-400 font-mono font-semibold mb-1 text-center">
        {data.code}
      </div>
      <div className="text-xl font-medium text-white text-center leading-tight break-words">
        {data.label}
      </div>
      <div className="text-base text-neutral-400 text-center mt-2 italic">
        → {data.output}
      </div>
    </div>
  );
}

function GoalNode({ data }: { data: { label: string; target: string } }) {
  return (
    <div className="w-[200px] px-5 py-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-center">
      <div className="text-base font-bold text-emerald-400 break-words leading-tight">
        {data.label}
      </div>
      <div className="text-xs text-neutral-400 mt-1">
        {data.target}
      </div>
    </div>
  );
}

function FunctionHeader({ data }: { data: { label: string; description: string } }) {
  return (
    <div className="w-[240px] px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
      <div className="text-lg font-bold text-blue-400">
        {data.label}
      </div>
      <div className="text-xs text-neutral-500 mt-1 leading-snug break-words">
        {data.description}
      </div>
    </div>
  );
}

const nodeTypes = {
  task: TaskNode,
  goal: GoalNode,
  functionHeader: FunctionHeader,
};

function buildNodesAndEdges(systemsData: SystemsData) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Professional grid layout constants
  const LAYOUT = {
    COLUMN_WIDTH: 280,        // Wide enough for wrapped text
    COLUMN_GAP: 40,           // Double the vertical task spacing
    HEADER_Y: 50,             // Top margin
    TASKS_START_Y: 150,       // Space below headers
    TASK_HEIGHT: 130,         // Fixed height for consistent spacing
    TASK_VERTICAL_GAP: 20,    // Breathing room between tasks
    GOAL_MARGIN_TOP: 20,      // Same spacing as between tasks
    NODE_WIDTH: 240,          // Standard node width
    GOAL_WIDTH: 200,          // Goal node width
  };

  // Create function columns
  systemsData.functions.forEach((func: AVRMFunction, funcIndex: number) => {
    const x = funcIndex * (LAYOUT.COLUMN_WIDTH + LAYOUT.COLUMN_GAP) + 50;

    // Function header
    nodes.push({
      id: `header-${func.id}`,
      type: "functionHeader",
      position: { x, y: LAYOUT.HEADER_Y },
      data: { label: func.name, description: func.description.slice(0, 40) + "..." },
      draggable: false,
    });

    // Tasks
    const tasks = systemsData.tasks.filter((t: Task) => t.function_id === func.id);
    tasks.forEach((task: Task, taskIndex: number) => {
      const nodeId = `task-${task.id}`;
      nodes.push({
        id: nodeId,
        type: "task",
        position: {
          x,
          y: LAYOUT.TASKS_START_Y + taskIndex * (LAYOUT.TASK_HEIGHT + LAYOUT.TASK_VERTICAL_GAP)
        },
        data: { label: task.name, code: task.code, output: task.output },
      });

      // Connect to previous task in same column
      if (taskIndex > 0) {
        edges.push({
          id: `edge-${tasks[taskIndex - 1].id}-${task.id}`,
          source: `task-${tasks[taskIndex - 1].id}`,
          target: nodeId,
          type: "smoothstep",
          style: { stroke: "#525252" },
        });
      }
    });

    // Goal at bottom (centered in column)
    const lastTaskY = LAYOUT.TASKS_START_Y + tasks.length * (LAYOUT.TASK_HEIGHT + LAYOUT.TASK_VERTICAL_GAP);
    const goalX = x + (LAYOUT.NODE_WIDTH - LAYOUT.GOAL_WIDTH) / 2; // Center goal in column
    nodes.push({
      id: `goal-${func.goal.id}`,
      type: "goal",
      position: { x: goalX, y: lastTaskY + LAYOUT.GOAL_MARGIN_TOP },
      data: { label: func.goal.name, target: func.goal.target },
      draggable: false,
    });

    // Connect last task to goal
    if (tasks.length > 0) {
      edges.push({
        id: `edge-${tasks[tasks.length - 1].id}-goal`,
        source: `task-${tasks[tasks.length - 1].id}`,
        target: `goal-${func.goal.id}`,
        type: "smoothstep",
        style: { stroke: "#22c55e" },
      });
    }

    // Connect to next function (handoff)
    if (funcIndex < systemsData.functions.length - 1) {
      const nextFunc = systemsData.functions[funcIndex + 1];
      const nextTasks = systemsData.tasks.filter((t: Task) => t.function_id === nextFunc.id);
      if (tasks.length > 0 && nextTasks.length > 0) {
        edges.push({
          id: `handoff-${func.id}-${nextFunc.id}`,
          source: `goal-${func.goal.id}`,
          target: `task-${nextTasks[0].id}`,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#3b82f6", strokeWidth: 2 },
        });
      }
    }
  });

  return { nodes, edges };
}

export default function SystemsMapPage() {
  const [systemsData, setSystemsData] = useState<SystemsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch systems data from API
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/systems");
        if (!response.ok) {
          throw new Error("Failed to load systems data");
        }
        const data = await response.json();
        setSystemsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Build nodes and edges from fetched data
  const { initialNodes, initialEdges } = useMemo(() => {
    if (!systemsData) {
      return { initialNodes: [], initialEdges: [] };
    }
    const { nodes, edges } = buildNodesAndEdges(systemsData);
    return { initialNodes: nodes, initialEdges: edges };
  }, [systemsData]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when initialNodes changes
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  // Sync edges when initialEdges changes
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-neutral-400">Loading systems data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!systemsData) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Business Systems Map</h2>
        <p className="text-neutral-400">
          Interactive visualization of AVRM operational workflow (dynamically loaded from YAML)
        </p>
        <p className="text-xs text-neutral-600 mt-1">
          Last updated: {systemsData.last_updated} • Version: {systemsData.version}
        </p>
      </div>

      <div className="h-[calc(100vh-300px)] bg-neutral-950 rounded-lg border border-neutral-800">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.3}
          maxZoom={1.5}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        >
          <Background color="#262626" gap={20} />
          <Controls className="[&_button]:bg-neutral-800 [&_button]:border-neutral-700 [&_button]:text-white [&_button:hover]:bg-neutral-700" />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === "goal") return "#22c55e";
              if (node.type === "functionHeader") return "#3b82f6";
              return "#f97316";
            }}
            className="bg-neutral-900 border border-neutral-800"
          />
        </ReactFlow>
      </div>

      <div className="flex gap-6 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500/30 border border-blue-500" />
          <span>Function</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500/20 border border-orange-500" />
          <span>Task</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500" />
          <span>Goal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-blue-500" />
          <span>Handoff</span>
        </div>
      </div>
    </div>
  );
}
