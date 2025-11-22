# Improve Systems Map Diagram Layout

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix overlapping nodes, improve text readability, and ensure legend is fully visible by implementing a professional grid layout with proper spacing and text wrapping.

**Architecture:** Replace the current minimal spacing layout with a fixed grid system. Update all three node component types (TaskNode, GoalNode, FunctionHeader) to use fixed widths with centered, wrapped text. Adjust container height to prevent legend cutoff. All changes in a single file (page.tsx) with incremental testing.

**Tech Stack:** React, ReactFlow, TypeScript, Tailwind CSS, Next.js

---

## Current Issues (from screenshot)

1. **Overlapping nodes**: Tasks overlap vertically due to 70px spacing
2. **Text overflow**: Long task names overflow node boundaries
3. **Inconsistent spacing**: Variable node sizes create uneven columns
4. **Legend cutoff**: Bottom legend cut off by page boundary
5. **Poor readability**: Text not centered, no wrapping

---

## Task 1: Update Layout Constants and Grid System

**Files:**
- Modify: `/Users/macmini/Library/CloudStorage/Dropbox/3 - Active VRM/productivity/AVRM_Business_Map/command-center/src/app/systems-map/page.tsx:51-135`

**Step 1: Replace layout constants in buildNodesAndEdges function**

Find the `buildNodesAndEdges` function (starts around line 51). Replace the existing constants:

**Current (lines 55-58):**
```typescript
const COLUMN_WIDTH = 200;
const TASK_HEIGHT = 70;
const HEADER_Y = 0;
const TASKS_START_Y = 100;
```

**Replace with:**
```typescript
// Professional grid layout constants
const LAYOUT = {
  COLUMN_WIDTH: 280,        // Wide enough for wrapped text
  COLUMN_GAP: 100,          // Clear separation between functions
  HEADER_Y: 50,             // Top margin
  TASKS_START_Y: 150,       // Space below headers
  TASK_HEIGHT: 90,          // Increased for wrapped text
  TASK_VERTICAL_GAP: 20,    // Breathing room between tasks
  GOAL_MARGIN_TOP: 40,      // Space before goal node
  NODE_WIDTH: 240,          // Standard node width
  GOAL_WIDTH: 200,          // Goal node width
};
```

**Step 2: Update function header positioning**

Find the function header node creation (around line 65-70). Replace the position calculation:

**Current:**
```typescript
const x = funcIndex * COLUMN_WIDTH + 50;
```

**Replace with:**
```typescript
const x = funcIndex * (LAYOUT.COLUMN_WIDTH + LAYOUT.COLUMN_GAP) + 50;
```

**Current:**
```typescript
position: { x, y: HEADER_Y },
```

**Replace with:**
```typescript
position: { x, y: LAYOUT.HEADER_Y },
```

**Step 3: Update task node positioning**

Find the tasks forEach loop (around line 75-82). Replace the position calculation:

**Current:**
```typescript
position: { x, y: TASKS_START_Y + taskIndex * TASK_HEIGHT },
```

**Replace with:**
```typescript
position: {
  x,
  y: LAYOUT.TASKS_START_Y + taskIndex * (LAYOUT.TASK_HEIGHT + LAYOUT.TASK_VERTICAL_GAP)
},
```

**Step 4: Update goal node positioning**

Find the goal node creation (around line 97-104). Replace the position calculation:

**Current:**
```typescript
const lastTaskY = TASKS_START_Y + tasks.length * TASK_HEIGHT;
nodes.push({
  id: `goal-${func.goal.id}`,
  type: "goal",
  position: { x: x + 10, y: lastTaskY + 30 },
```

**Replace with:**
```typescript
const lastTaskY = LAYOUT.TASKS_START_Y + tasks.length * (LAYOUT.TASK_HEIGHT + LAYOUT.TASK_VERTICAL_GAP);
nodes.push({
  id: `goal-${func.goal.id}`,
  type: "goal",
  position: { x, y: lastTaskY + LAYOUT.GOAL_MARGIN_TOP },
```

**Step 5: Test layout changes locally**

Run dev server:
```bash
cd /Users/macmini/Library/CloudStorage/Dropbox/3\ -\ Active\ VRM/productivity/AVRM_Business_Map/command-center
npm run dev
```

Open browser to `http://localhost:3000/systems-map`

**Expected Result:**
- Columns are wider with more space between them
- Tasks no longer overlap vertically
- Headers and goals properly aligned
- Nodes may still show text overflow (fixed in Task 2)

**Step 6: Commit layout grid changes**

```bash
git add src/app/systems-map/page.tsx
git commit -m "refactor: Improve systems map grid layout with proper spacing

- Increased column width from 200px to 280px
- Added 100px gap between function columns
- Increased task node height from 70px to 90px
- Added 20px vertical gap between tasks
- Prevents node overlap and improves readability

Part 1 of layout improvements

🤖 Generated with [Claude Code](https://claude.com/claude-code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 2: Update Node Components with Fixed Widths and Text Wrapping

**Files:**
- Modify: `/Users/macmini/Library/CloudStorage/Dropbox/3 - Active VRM/productivity/AVRM_Business_Map/command-center/src/app/systems-map/page.tsx:17-44`

**Step 1: Update TaskNode component**

Find the `TaskNode` component (around line 17-25). Replace entire component:

**Replace:**
```typescript
function TaskNode({ data }: { data: { label: string; code: string; output: string } }) {
  return (
    <div className="px-3 py-2 rounded-lg bg-orange-500/20 border border-orange-500/50 min-w-[140px]">
      <div className="text-[10px] text-orange-400 font-mono">{data.code}</div>
      <div className="text-xs font-medium text-white">{data.label}</div>
      <div className="text-[10px] text-neutral-400 mt-1">→ {data.output}</div>
    </div>
  );
}
```

**With:**
```typescript
function TaskNode({ data }: { data: { label: string; code: string; output: string } }) {
  return (
    <div className="w-[240px] px-4 py-3 rounded-lg bg-orange-500/20 border border-orange-500/50">
      <div className="text-[11px] text-orange-400 font-mono font-semibold mb-1 text-center">
        {data.code}
      </div>
      <div className="text-sm font-medium text-white text-center leading-tight break-words">
        {data.label}
      </div>
      <div className="text-[10px] text-neutral-400 text-center mt-2 italic">
        → {data.output}
      </div>
    </div>
  );
}
```

**Changes:**
- `w-[240px]`: Fixed width instead of min-w
- `text-center`: Center all text
- `break-words`: Wrap long task names
- `leading-tight`: Tighter line spacing for wrapped text
- `mb-1`, `mt-2`: Vertical spacing between elements

**Step 2: Update GoalNode component**

Find the `GoalNode` component (around line 27-35). Replace entire component:

**Replace:**
```typescript
function GoalNode({ data }: { data: { label: string; target: string } }) {
  return (
    <div className="px-4 py-3 rounded-full bg-emerald-500/20 border-2 border-emerald-500 min-w-[120px] text-center">
      <div className="text-xs font-bold text-emerald-400">{data.label}</div>
      <div className="text-[10px] text-neutral-400">{data.target}</div>
    </div>
  );
}
```

**With:**
```typescript
function GoalNode({ data }: { data: { label: string; target: string } }) {
  return (
    <div className="w-[200px] px-5 py-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-center">
      <div className="text-sm font-bold text-emerald-400 break-words leading-tight">
        {data.label}
      </div>
      <div className="text-[11px] text-neutral-400 mt-1">
        {data.target}
      </div>
    </div>
  );
}
```

**Changes:**
- `w-[200px]`: Fixed width
- `px-5 py-4`: More padding for better proportion
- `break-words leading-tight`: Wrap goal names
- `text-sm` and `text-[11px]`: Slightly larger text

**Step 3: Update FunctionHeader component**

Find the `FunctionHeader` component (around line 37-44). Replace entire component:

**Replace:**
```typescript
function FunctionHeader({ data }: { data: { label: string; description: string } }) {
  return (
    <div className="px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 min-w-[160px] text-center">
      <div className="text-sm font-bold text-blue-400">{data.label}</div>
      <div className="text-[10px] text-neutral-500 mt-1">{data.description}</div>
    </div>
  );
}
```

**With:**
```typescript
function FunctionHeader({ data }: { data: { label: string; description: string } }) {
  return (
    <div className="w-[240px] px-4 py-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center">
      <div className="text-base font-bold text-blue-400">
        {data.label}
      </div>
      <div className="text-[10px] text-neutral-500 mt-1 leading-snug break-words">
        {data.description}
      </div>
    </div>
  );
}
```

**Changes:**
- `w-[240px]`: Fixed width matching task nodes
- `text-base`: Slightly larger function name (was text-sm)
- `leading-snug break-words`: Wrap descriptions

**Step 4: Test node component changes**

Refresh browser at `http://localhost:3000/systems-map`

**Expected Result:**
- All nodes have consistent widths
- Text is centered within nodes
- Long task names wrap to multiple lines
- No text overflow outside node boundaries
- Proper padding and spacing within each node type

**Step 5: Commit node component improvements**

```bash
git add src/app/systems-map/page.tsx
git commit -m "style: Update node components with fixed widths and text wrapping

- TaskNode: Fixed 240px width with centered, wrapped text
- GoalNode: Fixed 200px width with proper text wrapping
- FunctionHeader: Fixed 240px width matching task nodes
- All nodes use break-words for long text
- Improved padding and text hierarchy

Part 2 of layout improvements

🤖 Generated with [Claude Code](https://claude.com/claude-code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 3: Fix Container Height and Legend Positioning

**Files:**
- Modify: `/Users/macmini/Library/CloudStorage/Dropbox/3 - Active VRM/productivity/AVRM_Business_Map/command-center/src/app/systems-map/page.tsx:205-248`

**Step 1: Update ReactFlow container height**

Find the ReactFlow container div (around line 205). Change the height class:

**Current:**
```typescript
<div className="h-[calc(100vh-200px)] bg-neutral-950 rounded-lg border border-neutral-800">
```

**Replace with:**
```typescript
<div className="h-[calc(100vh-300px)] bg-neutral-950 rounded-lg border border-neutral-800">
```

**Explanation:** Changed from `vh-200px` to `vh-300px` to leave more room for the legend at the bottom.

**Step 2: Move legend outside ReactFlow container**

Find the current structure (around lines 205-247). The legend is currently inside the main container's closing tag.

**Current structure:**
```typescript
return (
  <div className="space-y-4">
    <div>
      {/* Header section */}
    </div>

    <div className="h-[calc(100vh-200px)] ...">
      <ReactFlow ...>
        {/* ReactFlow content */}
      </ReactFlow>
    </div>

    <div className="flex gap-6 text-xs text-neutral-500">
      {/* Legend items */}
    </div>
  </div>
);
```

**Verify the legend is already outside the ReactFlow container** (it should be). If it's inside, move it outside. The structure should be:

```typescript
return (
  <div className="space-y-4">
    {/* Header */}
    <div>
      <h2 className="text-2xl font-bold text-white">Business Systems Map</h2>
      <p className="text-neutral-400">
        Interactive visualization of AVRM operational workflow (dynamically loaded from YAML)
      </p>
      <p className="text-xs text-neutral-600 mt-1">
        Last updated: {systemsData.last_updated} • Version: {systemsData.version}
      </p>
    </div>

    {/* ReactFlow Container */}
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

    {/* Legend - Outside ReactFlow container */}
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
```

**Step 3: Test container and legend**

Refresh browser at `http://localhost:3000/systems-map`

**Expected Result:**
- ReactFlow canvas is taller (takes up more vertical space)
- Legend is fully visible at the bottom of the page
- No cutoff or overlap with page boundary
- Can scroll within the ReactFlow canvas to see all nodes

**Step 4: Commit container and legend fixes**

```bash
git add src/app/systems-map/page.tsx
git commit -m "fix: Adjust container height and ensure legend visibility

- Increased ReactFlow container from vh-200px to vh-300px
- Provides adequate space for legend at bottom
- Legend remains outside ReactFlow container
- Prevents cutoff at page boundary

Part 3 of layout improvements

🤖 Generated with [Claude Code](https://claude.com/claude-code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 4: Visual Refinement and Testing

**Files:**
- Modify: `/Users/macmini/Library/CloudStorage/Dropbox/3 - Active VRM/productivity/AVRM_Business_Map/command-center/src/app/systems-map/page.tsx` (if needed)

**Step 1: Comprehensive local testing**

Test all aspects of the updated diagram:

**Visual Checklist:**
- [ ] No overlapping nodes in any column
- [ ] Text is centered and readable in all nodes
- [ ] Long task names wrap properly (e.g., "Client Onboarding Meeting")
- [ ] Consistent spacing between all columns
- [ ] Consistent spacing between all tasks within columns
- [ ] Goals are properly aligned at bottom of each column
- [ ] Function headers are aligned at top
- [ ] Legend is fully visible at bottom

**Interaction Checklist:**
- [ ] Can zoom in/out with ReactFlow controls
- [ ] Can pan the canvas by dragging
- [ ] Minimap shows full diagram
- [ ] All 5 function columns visible in initial view
- [ ] Edges connect properly between nodes
- [ ] Handoff edges (blue, animated) visible between functions

**Responsive Testing:**
- [ ] Test at different browser widths (full screen, half screen)
- [ ] Verify diagram remains usable at different zoom levels

**Step 2: Optional fine-tuning (if needed)**

If any spacing issues remain, adjust these values in the LAYOUT constant:

```typescript
const LAYOUT = {
  COLUMN_WIDTH: 280,        // Adjust if columns feel too wide/narrow
  COLUMN_GAP: 100,          // Adjust if columns are too close/far
  TASK_HEIGHT: 90,          // Adjust if nodes overlap or have too much space
  TASK_VERTICAL_GAP: 20,    // Adjust vertical spacing between tasks
  GOAL_MARGIN_TOP: 40,      // Adjust space before goal node
};
```

Common adjustments:
- **Nodes still overlap?** Increase `TASK_HEIGHT` or `TASK_VERTICAL_GAP`
- **Too much empty space?** Decrease `TASK_HEIGHT` or `TASK_VERTICAL_GAP`
- **Columns too cramped?** Increase `COLUMN_GAP`
- **Text wrapping too aggressively?** Increase node `w-[240px]` width in components

**Step 3: Test production build**

Build and test production version:

```bash
npm run build
npm start
```

Open `http://localhost:3000/systems-map`

**Expected Result:**
- Same appearance as dev mode
- No console errors
- Smooth rendering and interactions

**Step 4: Commit any final adjustments**

If you made fine-tuning changes:

```bash
git add src/app/systems-map/page.tsx
git commit -m "refactor: Fine-tune spacing for optimal readability

- Adjusted [specific constant] from X to Y
- Improves [specific aspect]

Part 4 of layout improvements

🤖 Generated with [Claude Code](https://claude.com/claude-code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 5: Deploy to Production and Verify

**Files:**
- None (deployment only)

**Step 1: Push to GitHub**

```bash
git push
```

**Step 2: Wait for Vercel deployment**

Wait ~60-90 seconds for Vercel to build and deploy the changes.

**Step 3: Test production URL**

Open browser to: `https://avrm-command-center.vercel.app/systems-map`

**Expected Result:**
- All layout improvements visible in production
- No overlapping nodes
- Text properly wrapped and centered
- Legend fully visible
- Diagram is professional and easy to read

**Step 4: Take before/after screenshots**

For documentation purposes:
1. Take a screenshot of the improved layout
2. Compare with the original screenshot showing overlapping nodes
3. Verify all issues from original screenshot are resolved

**Step 5: Final verification checklist**

Production checklist:
- [ ] Production site loads without errors
- [ ] Diagram renders correctly (no empty state)
- [ ] All 5 function columns visible
- [ ] No overlapping nodes
- [ ] Text is readable and properly wrapped
- [ ] Legend is fully visible
- [ ] ReactFlow controls work (zoom, pan, minimap)
- [ ] No console errors in browser DevTools

---

## Verification Checklist

After completing all tasks, verify:

**Layout:**
- ✅ Columns are 280px wide with 100px gaps
- ✅ Tasks spaced 90px + 20px gap vertically
- ✅ No overlapping nodes anywhere in the diagram
- ✅ Top-aligned layout with consistent positioning

**Node Components:**
- ✅ All nodes have fixed widths (240px for tasks/headers, 200px for goals)
- ✅ Text is centered in all nodes
- ✅ Long text wraps properly with `break-words`
- ✅ Proper padding and spacing within nodes

**Container:**
- ✅ ReactFlow canvas height: `calc(100vh-300px)`
- ✅ Legend visible below canvas
- ✅ No cutoff at page boundary

**Functionality:**
- ✅ Zoom/pan works smoothly
- ✅ Minimap accurate
- ✅ All edges render correctly
- ✅ No performance issues

**Cross-Environment:**
- ✅ Works in local dev (`npm run dev`)
- ✅ Works in production build (`npm run build` + `npm start`)
- ✅ Works on Vercel production deployment

---

## Technical Notes

### Why This Layout Works

**Fixed Grid System:**
The layout uses a predictable grid where each element's position is calculated mathematically:

```
Column X = funcIndex × (COLUMN_WIDTH + COLUMN_GAP) + leftMargin
Task Y = TASKS_START_Y + taskIndex × (TASK_HEIGHT + TASK_VERTICAL_GAP)
```

This ensures:
- No surprises or overlaps
- Easy to debug (positions are deterministic)
- Scalable (adding more tasks/functions is automatic)

**Fixed-Width Nodes:**
Using `w-[240px]` instead of `min-w-[140px]` ensures:
- Predictable layout (ReactFlow knows exact node dimensions)
- Text wrapping works correctly
- Consistent visual rhythm across the diagram

**Text Wrapping:**
The `break-words` + `leading-tight` combination:
- Breaks long words/task names at character boundaries
- Reduces line height to fit more text
- Centers all text for visual balance

### Alternative Approaches (Not Recommended)

**Dynamic Node Sizing:**
- Could measure text and size nodes accordingly
- Con: Unpredictable, harder to maintain
- Con: ReactFlow re-layout complexity

**Horizontal Scrolling Only:**
- Could make canvas very wide, no vertical scrolling
- Con: Loses vertical workflow metaphor
- Con: Harder to see full business process at once

**Smaller Text:**
- Could shrink text to fit more in less space
- Con: Readability suffers
- Con: Defeats purpose of visualization

Our fixed grid + wrapping approach balances readability, functionality, and maintainability.

---

## Files Changed

- `src/app/systems-map/page.tsx` - All layout improvements

## Dependencies

No new dependencies. Uses existing React, ReactFlow, and Tailwind CSS.

---

## Rollback Plan

If the new layout has issues, revert with:

```bash
# Get the commit hash before Task 1
git log --oneline

# Revert to that commit
git revert <commit-hash>..HEAD

# Or reset if not pushed
git reset --hard <commit-hash>
```

The old layout is preserved in git history.
