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

// ---------- UnInformed ----------

// BFS
function bfs(start, goal) {
  let queue = [[start]];
  let visited = new Set();

  while (queue.length) {
    let path = queue.shift();
    let node = path[path.length - 1];
    if (node === goal) return { path, cost: path.length - 1 };

    if (!visited.has(node)) {
      visited.add(node);
      for (let neighbor of graph[node]) {
        queue.push([...path, neighbor.node]);
      }
    }
  }
  return null;
}

// DFS
function dfs(start, goal, visited = new Set(), path = []) {
  path.push(start);
  if (start === goal) return { path, cost: path.length - 1 };
  visited.add(start);

  for (let neighbor of graph[start]) {
    if (!visited.has(neighbor.node)) {
      let newPath = dfs(neighbor.node, goal, visited, [...path]);
      if (newPath) return newPath;
    }
  }
  return null;
}

// UCS
function ucs(start, goal) {
  let pq = [[0, [start]]];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    let [cost, path] = pq.shift();
    let node = path[path.length - 1];

    if (node === goal) return { path, cost };

    for (let neighbor of graph[node]) {
      pq.push([cost + neighbor.cost, [...path, neighbor.node]]);
    }
  }
  return null;
}

// IDDFS
function iddfs(start, goal, maxDepth = 20) {
  function dls(node, goal, depth, path, visited) {
    if (depth === 0 && node === goal) return { path, cost: path.length - 1 };
    if (depth > 0) {
      visited.add(node);
      for (let neighbor of graph[node]) {
        if (!visited.has(neighbor.node)) {
          let newPath = dls(neighbor.node, goal, depth - 1, [...path, neighbor.node], visited);
          if (newPath) return newPath;
        }
      }
    }
    return null;
  }

  for (let depth = 0; depth <= maxDepth; depth++) {
    let result = dls(start, goal, depth, [start], new Set());
    if (result) return result;
  }
  return null;
}

// ---------- Informed ----------

// Greedy
function greedy(start, goal) {
  let pq = [[heuristics[start], [start]]];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    let [h, path] = pq.shift();
    let node = path[path.length - 1];

    if (node === goal) return { path, cost: path.length - 1 };

    for (let neighbor of graph[node]) {
      pq.push([heuristics[neighbor.node], [...path, neighbor.node]]);
    }
  }
  return null;
}

// A*
function astar(start, goal) {
  let pq = [[heuristics[start], 0, [start]]];

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    let [f, g, path] = pq.shift();
    let node = path[path.length - 1];

    if (node === goal) return { path, cost: g };

    for (let neighbor of graph[node]) {
      let newG = g + neighbor.cost;
      let newF = newG + heuristics[neighbor.node];
      pq.push([newF, newG, [...path, neighbor.node]]);
    }
  }
  return null;
}

// AO* Placeholder
function aoStar(start, goal) {
  return ["AO*", "is typically used on AND-OR graphs (not plain maps).", "Implementation placeholder."];
}
