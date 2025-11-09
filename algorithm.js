// Romania Map Graph
const graph = {
  Arad: [{ node: "Zerind", cost: 75 }, { node: "Sibiu", cost: 140 }, { node: "Timisoara", cost: 118 }],
  Zerind: [{ node: "Arad", cost: 75 }, { node: "Oradea", cost: 71 }],
  Oradea: [{ node: "Zerind", cost: 71 }, { node: "Sibiu", cost: 151 }],
  Sibiu: [{ node: "Arad", cost: 140 }, { node: "Oradea", cost: 151 }, { node: "Fagaras", cost: 99 }, { node: "Rimnicu_Vilcea", cost: 80 }],
  Timisoara: [{ node: "Arad", cost: 118 }, { node: "Lugoj", cost: 111 }],
  Lugoj: [{ node: "Timisoara", cost: 111 }, { node: "Mehadia", cost: 70 }],
  Mehadia: [{ node: "Lugoj", cost: 70 }, { node: "Drobeta", cost: 75 }],
  Drobeta: [{ node: "Mehadia", cost: 75 }, { node: "Craiova", cost: 120 }],
  Craiova: [{ node: "Drobeta", cost: 120 }, { node: "Rimnicu_Vilcea", cost: 146 }, { node: "Pitesti", cost: 138 }],
  Rimnicu_Vilcea: [{ node: "Sibiu", cost: 80 }, { node: "Craiova", cost: 146 }, { node: "Pitesti", cost: 97 }],
  Fagaras: [{ node: "Sibiu", cost: 99 }, { node: "Bucharest", cost: 211 }],
  Pitesti: [{ node: "Rimnicu_Vilcea", cost: 97 }, { node: "Craiova", cost: 138 }, { node: "Bucharest", cost: 101 }],
  Bucharest: [{ node: "Fagaras", cost: 211 }, { node: "Pitesti", cost: 101 }, { node: "Giurgiu", cost: 90 }, { node: "Urziceni", cost: 85 }],
  Giurgiu: [{ node: "Bucharest", cost: 90 }],
  Urziceni: [{ node: "Bucharest", cost: 85 }, { node: "Vaslui", cost: 142 }, { node: "Hirsova", cost: 98 }],
  Hirsova: [{ node: "Urziceni", cost: 98 }, { node: "Eforie", cost: 86 }],
  Eforie: [{ node: "Hirsova", cost: 86 }],
  Vaslui: [{ node: "Urziceni", cost: 142 }, { node: "Iasi", cost: 92 }],
  Iasi: [{ node: "Vaslui", cost: 92 }, { node: "Neamt", cost: 87 }],
  Neamt: [{ node: "Iasi", cost: 87 }]
};

// Heuristics (Straight-line distance to Bucharest)
const heuristics = {
  Arad: 366, Bucharest: 0, Craiova: 160, Drobeta: 242, Eforie: 161, Fagaras: 176,
  Giurgiu: 77, Hirsova: 151, Iasi: 226, Lugoj: 244, Mehadia: 241, Neamt: 234,
  Oradea: 380, Pitesti: 100, Rimnicu_Vilcea: 193, Sibiu: 253, Timisoara: 329,
  Urziceni: 80, Vaslui: 199, Zerind: 374
};

// Coordinates for cities (rough positions for visualization)
const coordinates = {
  Arad: [100, 100], Zerind: [150, 50], Oradea: [220, 40], Sibiu: [200, 120],
  Timisoara: [80, 180], Lugoj: [130, 220], Mehadia: [160, 260], Drobeta: [140, 320],
  Craiova: [200, 350], Rimnicu_Vilcea: [250, 200], Fagaras: [280, 130], Pitesti: [280, 250],
  Bucharest: [350, 280], Giurgiu: [360, 330], Urziceni: [400, 220], Hirsova: [460, 200],
  Eforie: [480, 260], Vaslui: [420, 150], Iasi: [440, 100], Neamt: [410, 60]
};


// Gets the cost between two *directly connected* cities
function getCost(city1, city2) {
  const neighbors = graph[city1];
  if (!neighbors) return 0;
  const connection = neighbors.find(n => n.node === city2);
  return connection ? connection.cost : 0;
}

// Calculates the total cost of a path (an array of cities)
function calculateCost(path) {
  let cost = 0;
  for (let i = 0; i < path.length - 1; i++) {
    cost += getCost(path[i], path[i + 1]);
  }
  return cost;
}

// ---------- UnInformed ----------

// BFS (Finds path with fewest *steps*)
function bfs(start, goal) {
  let queue = [[start]]; // Queue stores paths (arrays of cities)
  let visited = new Set([start]); // Track visited nodes

  while (queue.length) {
    let path = queue.shift();
    let node = path[path.length - 1];

    if (node === goal) {
      // Found the goal, return the path and its *actual* cost
      return { path, cost: calculateCost(path) };
    }

    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor.node)) {
        visited.add(neighbor.node);
        let newPath = [...path, neighbor.node];
        queue.push(newPath);
      }
    }
  }
  return null; // No path found
}

// DFS (Finds *a* path, not optimal) - Iterative version
function dfs(start, goal) {
  let stack = [[start]]; // Stack stores paths
  let visited = new Set(); // Track visited nodes to avoid cycles

  while (stack.length) {
    let path = stack.pop();
    let node = path[path.length - 1];

    if (visited.has(node)) {
        continue;
    }
    visited.add(node);

    if (node === goal) {
      return { path, cost: calculateCost(path) };
    }

    // Add neighbors to stack in reverse order to explore them alphabetically (optional, but consistent)
    const neighbors = graph[node] || [];
    for (let i = neighbors.length - 1; i >= 0; i--) {
        const neighbor = neighbors[i];
        if (!visited.has(neighbor.node)) {
            let newPath = [...path, neighbor.node];
            stack.push(newPath);
        }
    }
  }
  return null;
}

// UCS (Finds the *cheapest* path)
function ucs(start, goal) {
  // Priority queue stores [cost, path]
  let pq = [[0, [start]]];
  // minCosts stores the cheapest cost found *so far* to reach a node
  let minCosts = new Map();
  minCosts.set(start, 0);

  while (pq.length) {
    // Sort to simulate a min-priority queue (inefficient, but works)
    pq.sort((a, b) => a[0] - b[0]);
    
    let [cost, path] = pq.shift();
    let node = path[path.length - 1];

    // If this path is already more expensive than the cheapest path we found
    // to this node, skip it.
    if (cost > minCosts.get(node)) {
      continue;
    }

    if (node === goal) {
      return { path, cost };
    }

    for (let neighbor of graph[node]) {
      let newCost = cost + neighbor.cost;

      // If we've never seen this neighbor, or we found a *new cheaper* path
      // to it, add it to the queue and update its min cost.
      if (!minCosts.has(neighbor.node) || newCost < minCosts.get(neighbor.node)) {
        minCosts.set(neighbor.node, newCost);
        let newPath = [...path, neighbor.node];
        pq.push([newCost, newPath]);
      }
    }
  }
  return null;
}

// IDDFS (Iterative Deepening DFS)
function iddfs(start, goal, maxDepth = 20) {
  // DLS: Depth-Limited Search
  function dls(node, goal, depth, path) {
    if (node === goal) {
      // Found the goal, return path and its calculated cost
      return { path, cost: calculateCost(path) };
    }
    if (depth <= 0) {
      return null;
    }

    for (let neighbor of graph[node]) {
      // Avoid cycles *within the current path*
      if (!path.includes(neighbor.node)) {
        let newPath = [...path, neighbor.node];
        let result = dls(neighbor.node, goal, depth - 1, newPath);
        if (result) return result;
      }
    }
    return null;
  }

  // Iteratively increase the depth limit
  for (let depth = 0; depth <= maxDepth; depth++) {
    let result = dls(start, goal, depth, [start]);
    if (result) return result;
  }
  return null;
}

// ---------- Informed ----------

// Greedy Best-First (Finds path based on heuristic, not optimal)
function greedy(start, goal) {
  // Priority queue stores [heuristic_cost, path]
  let pq = [[heuristics[start], [start]]];
  let visited = new Set(); // Avoid re-exploring nodes

  while (pq.length) {
    // Sort by heuristic cost (h)
    pq.sort((a, b) => a[0] - b[0]);

    let [h, path] = pq.shift();
    let node = path[path.length - 1];

    if (visited.has(node)) {
      continue;
    }
    visited.add(node);

    if (node === goal) {
      // Found path, return it and its *actual* cost (not heuristic cost)
      return { path, cost: calculateCost(path) };
    }

    for (let neighbor of graph[node]) {
      if (!visited.has(neighbor.node)) {
        let newPath = [...path, neighbor.node];
        pq.push([heuristics[neighbor.node], newPath]);
      }
    }
  }
  return null;
}

// A* (Finds the *cheapest* path using heuristics)
function astar(start, goal) {
  // Priority queue stores [f_cost, g_cost, path]
  // f = g + h (total estimated cost)
  // g = actual cost from start
  let pq = [[heuristics[start], 0, [start]]];

  // minCosts stores the cheapest *actual* cost (g) found so far to reach a node
  let minCosts = new Map();
  minCosts.set(start, 0);

  while (pq.length) {
    // Sort by f_cost (g + h)
    pq.sort((a, b) => a[0] - b[0]);

    let [f, g, path] = pq.shift();
    let node = path[path.length - 1];

    // If the *actual* cost (g) of this path is already worse than the
    // cheapest path we've found to this node, skip it.
    if (g > minCosts.get(node)) {
      continue;
    }

    if (node === goal) {
      return { path, cost: g }; // Return path and its actual cost (g)
    }

    for (let neighbor of graph[node]) {
      let newG = g + neighbor.cost; // New *actual* cost

      // If we've never seen this neighbor, or we found a *new cheaper* path to it...
      if (!minCosts.has(neighbor.node) || newG < minCosts.get(neighbor.node)) {
        minCosts.set(neighbor.node, newG); // Update its minimum cost
        let newH = heuristics[neighbor.node];
        let newF = newG + newH; // Calculate new total estimated cost
        let newPath = [...path, neighbor.node];
        pq.push([newF, newG, newPath]);
      }
    }
  }
  return null;
}

// AO*
function aoStar(start, goal) {
  // AO* is a specialized algorithm for AND-OR graphs, not simple pathfinding graphs.
  // An AND-OR graph represents problems that can be broken into subproblems,
  // where you might need to solve *all* subproblems (an AND node) or
  // just *one* of them (an OR node).
  //
  // This Romania map is a standard graph (all OR nodes - you can go to
  // Sibiu OR Timisoara OR Zerind).
  // Therefore, AO* is not applicable to this problem.
  return [
    "AO* Algorithm",
    "This algorithm is not applicable to this type of graph.",
    "AO* is designed for AND-OR graphs, which represent problems with sub-problems (e.g., game trees or logic puzzles), not for standard pathfinding."
  ];
}
