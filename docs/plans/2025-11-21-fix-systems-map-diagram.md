# Fix Systems Map Diagram Rendering

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the ReactFlow diagram on /systems-map page so nodes and edges render correctly when data loads from API.

**Architecture:** The issue is that ReactFlow's `useNodesState` and `useEdgesState` hooks only consume their initial values on mount. When `systemsData` loads asynchronously and `initialNodes`/`initialEdges` update via `useMemo`, the hooks don't pick up the new values. We need to add a `useEffect` to manually update the nodes and edges when the initial values change.

**Tech Stack:** React, ReactFlow, Next.js, TypeScript

---

## Root Cause Analysis

**Current Flow (Broken):**
1. Component mounts → `systemsData` is `null`
2. `useMemo` returns `{ initialNodes: [], initialEdges: [] }`
3. `useNodesState([])` and `useEdgesState([])` initialize with empty arrays
4. Data fetches → `systemsData` updates → `useMemo` recalculates with new values
5. ❌ **Bug:** `initialNodes` and `initialEdges` update, but the hooks don't re-initialize
6. Result: ReactFlow renders with empty `nodes=[]` and `edges=[]`

**Fix:**
Add `useEffect` hooks to update nodes/edges when initial values change.

---

## Task 1: Add useEffect to Sync Nodes and Edges

**Files:**
- Modify: `/Users/macmini/Library/CloudStorage/Dropbox/3 - Active VRM/productivity/AVRM_Business_Map/command-center/src/app/systems-map/page.tsx:170-171`

**Step 1: Import useEffect hook**

Add `useEffect` to the existing React import on line 3:

```typescript
import { useEffect, useState, useMemo } from "react";
```

**Step 2: Add useEffect hooks to update nodes and edges**

After line 171 (after the `useNodesState` and `useEdgesState` declarations), add two `useEffect` hooks:

```typescript
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
```

**Explanation:**
- `useNodesState` and `useEdgesState` return setter functions (`setNodes`, `setEdges`)
- The `useEffect` hooks watch `initialNodes` and `initialEdges` for changes
- When they change (after data loads), the setters update the state
- ReactFlow re-renders with the new nodes and edges

**Step 3: Test locally**

Run the development server:

```bash
cd /Users/macmini/Library/CloudStorage/Dropbox/3\ -\ Active\ VRM/productivity/AVRM_Business_Map/command-center
npm run dev
```

Open browser to `http://localhost:3000/systems-map`

**Expected Result:**
- Page loads with "Loading systems data..." message
- After ~1-2 seconds, ReactFlow diagram appears with:
  - 5 function columns (Marketing, Sales, Onboarding, Hosting, Finance)
  - Task nodes in orange boxes within each column
  - Goal nodes (green circles) at bottom of each column
  - Edges connecting tasks and goals

**Step 4: Verify in browser console**

Open DevTools → Console

Check for:
- ✅ No errors
- ✅ API call to `/api/systems` returns 200
- ✅ You can zoom/pan the diagram with ReactFlow controls

**Step 5: Commit the fix**

```bash
git add src/app/systems-map/page.tsx
git commit -m "fix: Add useEffect to sync ReactFlow nodes/edges when data loads

- ReactFlow hooks (useNodesState, useEdgesState) only consume initial values on mount
- When systemsData loads async, initialNodes/initialEdges update but hooks don't re-initialize
- Added useEffect to manually update nodes/edges when initial values change
- Diagram now renders correctly after data fetch completes

Fixes empty diagram issue on /systems-map page

🤖 Generated with [Claude Code](https://claude.com/claude-code)
via [Happy](https://happy.engineering)

Co-Authored-By: Claude <noreply@anthropic.com>
Co-Authored-By: Happy <yesreply@happy.engineering>"
```

---

## Task 2: Test Production Deployment

**Step 1: Push to GitHub**

```bash
git push
```

**Step 2: Wait for Vercel deployment**

Wait ~60 seconds for Vercel to build and deploy.

**Step 3: Test production URL**

Open browser to: `https://avrm-command-center.vercel.app/systems-map`

**Expected Result:**
- Same as local testing - diagram should render with all nodes and edges

**Step 4: Verify diagram interaction**

Test ReactFlow features:
- ✅ Zoom in/out with controls
- ✅ Pan by dragging canvas
- ✅ Minimap shows full diagram
- ✅ All 5 function columns visible
- ✅ Task codes (M1, M2, S1, etc.) are readable

---

## Task 3: Add Debugging Support (Optional Enhancement)

**Files:**
- Modify: `/Users/macmini/Library/CloudStorage/Dropbox/3 - Active VRM/productivity/AVRM_Business_Map/command-center/src/app/systems-map/page.tsx:168`

**Purpose:** Add console logging to help debug future issues

**Step 1: Add debug logging in useMemo**

After line 167, add logging:

```typescript
const { initialNodes, initialEdges } = useMemo(() => {
  if (!systemsData) {
    return { initialNodes: [], initialEdges: [] };
  }
  const { nodes, edges } = buildNodesAndEdges(systemsData);
  console.log('[SystemsMap] Built diagram:', {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    functions: systemsData.functions.length,
    tasks: systemsData.tasks.length
  });
  return { initialNodes: nodes, initialEdges: edges };
}, [systemsData]);
```

**Step 2: Test the logging**

Run dev server and check browser console:

**Expected Output:**
```
[SystemsMap] Built diagram: {
  nodeCount: 45,  // 5 headers + 5 goals + 35 tasks (approx)
  edgeCount: 39,  // task connections + handoffs
  functions: 5,
  tasks: 35
}
```

**Step 3: Commit (if keeping debug logs)**

```bash
git add src/app/systems-map/page.tsx
git commit -m "chore: Add debug logging to systems map diagram builder"
git push
```

---

## Verification Checklist

After completing all tasks, verify:

- ✅ Local dev server (`npm run dev`) shows diagram correctly
- ✅ Production deployment (`https://avrm-command-center.vercel.app/systems-map`) shows diagram
- ✅ All 5 business functions visible (Marketing, Sales, Onboarding, Hosting, Finance)
- ✅ Tasks within each function column are visible
- ✅ Goals at bottom of each column
- ✅ Edges connect tasks vertically and functions horizontally
- ✅ ReactFlow controls (zoom, pan, minimap) work
- ✅ No errors in browser console
- ✅ Page metadata shows correct version and last_updated date

---

## Technical Notes

**Why This Works:**

ReactFlow's state management hooks (`useNodesState`, `useEdgesState`) are designed like `useState` - they initialize once with the provided initial value but don't react to changes in that initial value. This is intentional for performance reasons.

When data loads asynchronously:
- Initial render: `systemsData = null` → `initialNodes = []` → `useNodesState([])` stores `[]`
- After fetch: `systemsData = data` → `initialNodes = [...]` → but `useNodesState` already initialized!

The `useEffect` pattern explicitly synchronizes the state when the initial values change:

```typescript
useEffect(() => {
  setNodes(initialNodes);  // Manually update when initialNodes changes
}, [initialNodes, setNodes]);
```

**Alternative Approaches (Not Recommended):**

1. **Pass nodes/edges directly to ReactFlow** (controlled component)
   - Con: Loses ReactFlow's internal state management features
   - Con: More complex to implement drag/drop, selections, etc.

2. **Don't use useNodesState/useEdgesState**
   - Con: Would need to manually implement all change handlers
   - Con: Significantly more code

3. **Wait for data before rendering ReactFlow**
   - Con: Can't show loading state inside the canvas
   - Con: Flash of empty state

Our `useEffect` approach is the recommended ReactFlow pattern for async data.

---

## Files Changed

- `src/app/systems-map/page.tsx` - Added useEffect hooks to sync nodes/edges

## Dependencies

No new dependencies required. Uses existing React hooks and ReactFlow hooks.
