// script.js
// This version reads colors from CSS variables so SVG colors exactly match the UI.
// No changes needed to index.html or algorithm.js (they remain the same).

document.getElementById("sendBtn").addEventListener("click", runQuery);

function runQuery() {
  const input = document.getElementById("query").value.trim();
  const outputDiv = document.getElementById("output");
  const svg = document.getElementById("map");
  svg.innerHTML = ""; // clear old map

  const lower = input.toLowerCase();

  let algo = null;
  if (lower.includes("bfs")) algo = "bfs";
  else if (lower.includes("dfs")) algo = "dfs";
  else if (lower.includes("ucs") || lower.includes("uniform cost")) algo = "ucs";
  else if (lower.includes("iddfs") || lower.includes("iterative")) algo = "iddfs";
  else if (lower.includes("greedy")) algo = "greedy";
  else if (lower.includes("a*") || lower.includes("astar") || lower.includes("a star")) algo = "astar";
  else if (lower.includes("ao*") || lower.includes("ao star")) algo = "ao*";

  const match = input.match(/from\s+(\w+)\s+to\s+(\w+)/i);
  let start, goal;
  if (match) {
    start = capitalize(match[1]);
    goal = capitalize(match[2]);
  }

  let result = null;
  if (algo && start && goal) {
    switch (algo) {
      case "bfs": result = bfs(start, goal); break;
      case "dfs": result = dfs(start, goal); break;
      case "ucs": result = ucs(start, goal); break;
      case "iddfs": result = iddfs(start, goal); break;
      case "greedy": result = greedy(start, goal); break;
      case "astar": result = astar(start, goal); break;
      case "ao*": result = aoStar(start, goal); break;
    }
  }

  // Render output only after Send pressed (and valid result or error)
  if (result && result.path) {
    drawMap(result.path); // animate the path on the map (uses CSS colors)
    outputDiv.innerHTML = `
      <div class="result-card">
        <p><span class="path">Path:</span> ${result.path.join(" → ")}</p>
        <p><span class="cost">Cost:</span> ${result.cost}</p>
      </div>
    `;
  } else if (Array.isArray(result)) {
    // AO* placeholder (array)
    outputDiv.innerHTML = `
      <div class="result-card error">
        ${result.join("<br>")}
      </div>
    `;
  } else {
    outputDiv.innerHTML = `
      <div class="result-card error">
        ⚠️ Could not parse query. Try: 'Find path from Arad to Bucharest using A*'
      </div>
    `;
  }
}

function capitalize(word) {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

function drawMap(path) {
  const svg = document.getElementById("map");

  // read CSS variables so JS-drawn elements use exact same colors
  const styles = getComputedStyle(document.documentElement);
  const nodeColor = (styles.getPropertyValue('--node-color') || '#38bdf8').trim();
  const lineColor = (styles.getPropertyValue('--line-color') || '#00ff7f').trim();
  const textColor = (styles.getPropertyValue('--text-color') || '#e2e8f0').trim();

  // draw all city nodes (base)
  for (let city in coordinates) {
    const [x, y] = coordinates[city];

    // base circle
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 6);
    circle.setAttribute("fill", nodeColor);
    circle.setAttribute("data-city", city);
    svg.appendChild(circle);

    // label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x + 8);
    text.setAttribute("y", y - 8);
    text.setAttribute("fill", textColor);
    text.setAttribute("font-size", "12px");
    text.textContent = city;
    svg.appendChild(text);
  }

  // highlight path nodes (make them larger and colored)
  for (let cityName of path) {
    // find the circle element with data-city === cityName
    const nodes = svg.querySelectorAll(`circle[data-city="${cityName}"]`);
    if (nodes.length) {
      const c = nodes[0];
      c.setAttribute("fill", lineColor);
      c.setAttribute("r", 8);
      c.setAttribute("stroke", "#fff");
      c.setAttribute("stroke-width", "1");
    }
  }

  // animate lines segment by segment
  let i = 0;
  function animateStep() {
    if (i >= path.length - 1) return;
    const from = path[i];
    const to = path[i + 1];
    const [x1, y1] = coordinates[from];
    const [x2, y2] = coordinates[to];

    // create an SVG line that starts and grows to the target
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x1); // start collapsed
    line.setAttribute("y2", y1);
    line.setAttribute("stroke", lineColor);
    line.setAttribute("stroke-width", 4);
    line.setAttribute("stroke-linecap", "round");
    line.setAttribute("opacity", "0.95");
    svg.appendChild(line);

    // incremental animation using requestAnimationFrame (smoother)
    const distance = Math.hypot(x2 - x1, y2 - y1);
    let t = 0;
    const duration = Math.max(300, Math.min(1200, distance * 4)); // duration in ms
    const startTime = performance.now();

    function frame(now) {
      t = (now - startTime) / duration;
      if (t >= 1) t = 1;
      const curX = x1 + (x2 - x1) * t;
      const curY = y1 + (y2 - y1) * t;
      line.setAttribute("x2", curX);
      line.setAttribute("y2", curY);

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        // segment complete -> proceed to next
        i++;
        // small pause between segments for clarity
        setTimeout(animateStep, 120);
      }
    }
    requestAnimationFrame(frame);
  }

  animateStep();
}
