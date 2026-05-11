import { useState, useEffect } from 'react';

const INITIAL_STATIONS = [
  'QA', 'FM', 'BT', 'HX', 'DP', 'AK', 'RC', 
  'LM', 'ZF', 'KN', 'PE', 'CU', 'SJ', 'VG'
];

const DEPENDENCY_MATRIX = [
  [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0], // 1
  [0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0], // 2
  [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0], // 3
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 4
  [0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0], // 5
  [0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0], // 6
  [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0], // 7
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0], // 8
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0], // 9
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0], // 10
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1], // 11
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0], // 12
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 13
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // 14
];

const WEIGHTED_MATRIX = [
  [ 0,  3,  9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [ 3,  0,  4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [ 9,  4,  0,  2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, 10,  2,  0,  5, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1,  5,  0,  6, 11, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1,  6,  0,  3, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, 11,  3,  0,  4, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1,  4,  0,  2, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1,  2,  0,  5,  8, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1,  5,  0,  3, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1,  8,  3,  0,  4, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  4,  0,  2, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  2,  0,  7],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,  7,  0]
];

const ROUTE_MATRIX = [
  [ 0,  6,  9, -1,  3, -1,  4],
  [ 6,  0,  5,  8,  2, -1, -1],
  [ 9,  5,  0,  4,  7, 12, -1],
  [-1,  8,  4,  0,  6,  9, 10],
  [ 3,  2,  7,  6,  0, 11,  8],
  [-1, -1, 12,  9, 11,  0,  3],
  [ 4, -1, -1, 10,  8,  3,  0]
];

export default function StationOrderingUI() {
  const [stations, setStations] = useState([]);
  const [sortedStations, setSortedStations] = useState([]);
  const [inversionCount, setInversionCount] = useState(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryComplete, setRecoveryComplete] = useState(false);

  const [currentLevel, setCurrentLevel] = useState(1);
  const [isResolving, setIsResolving] = useState(false);
  const [executionSequence, setExecutionSequence] = useState([]);
  const [matrixResolved, setMatrixResolved] = useState(false);

  // Level 3 states
  const [isReconstructing, setIsReconstructing] = useState(false);
  const [networkReconstructed, setNetworkReconstructed] = useState(false);
  const [mstEdges, setMstEdges] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [binaryCost, setBinaryCost] = useState("");

  // Level 4 states
  const [selectedZones, setSelectedZones] = useState([]);
  const [isVerifyingL4, setIsVerifyingL4] = useState(false);
  const [l4Verified, setL4Verified] = useState(false);
  const [unlockCode, setUnlockCode] = useState("");
  const [l4Error, setL4Error] = useState("");

  // Level 5 states
  const [isRouting, setIsRouting] = useState(false);
  const [routeFound, setRouteFound] = useState(false);
  const [shortestRoute, setShortestRoute] = useState([]);
  const [minCost, setMinCost] = useState(0);
  const [finalUnlockCode, setFinalUnlockCode] = useState("");

  // Initialize and compute values
  useEffect(() => {
    const computedStations = INITIAL_STATIONS.map(id => {
      const val1 = id.charCodeAt(0);
      const val2 = id.charCodeAt(1);
      return {
        id,
        val1,
        val2,
        value: val1 + val2,
      };
    });
    setStations(computedStations);
  }, []);

  const calculateInversionsAndSort = (arr) => {
    let count = 0;
    
    function mergeSort(array) {
      if (array.length <= 1) return array;
      const mid = Math.floor(array.length / 2);
      const left = mergeSort(array.slice(0, mid));
      const right = mergeSort(array.slice(mid));
      return merge(left, right);
    }

    function merge(left, right) {
      let result = [];
      let i = 0, j = 0;
      while (i < left.length && j < right.length) {
        if (left[i].value <= right[j].value) {
          result.push(left[i]);
          i++;
        } else {
          result.push(right[j]);
          count += left.length - i;
          j++;
        }
      }
      return result.concat(left.slice(i)).concat(right.slice(j));
    }
    
    const sorted = mergeSort([...arr]);
    return { sorted, count };
  };

  const handleRecovery = () => {
    setIsRecovering(true);
    
    // Simulate processing time
    setTimeout(() => {
      const { sorted, count } = calculateInversionsAndSort(stations);
      setSortedStations(sorted);
      setInversionCount(count);
      setIsRecovering(false);
      setRecoveryComplete(true);
    }, 2000);
  };

  const handleProceedToLevel2 = () => {
    setCurrentLevel(2);
    window.scrollTo(0, 0);
  };

  const handleResolveDependencies = () => {
    setIsResolving(true);
    setTimeout(() => {
      const numStations = 14;
      const inDegree = new Array(numStations).fill(0);
      const adjList = Array.from({ length: numStations }, () => []);

      for (let i = 0; i < numStations; i++) {
        for (let j = 0; j < numStations; j++) {
          if (DEPENDENCY_MATRIX[i][j] === 1) {
            adjList[j].push(i);
            inDegree[i]++;
          }
        }
      }

      const queue = [];
      for (let i = 0; i < numStations; i++) {
        if (inDegree[i] === 0) queue.push(i);
      }

      const sequenceIndices = [];
      while (queue.length > 0) {
        const u = queue.shift();
        sequenceIndices.push(u);
        for (const v of adjList[u]) {
          inDegree[v]--;
          if (inDegree[v] === 0) queue.push(v);
        }
      }

      const resolvedSequence = sequenceIndices.map(idx => sortedStations[idx]).reverse();
      setExecutionSequence(resolvedSequence);
      setIsResolving(false);
      setMatrixResolved(true);
    }, 2000);
  };

  const handleProceedToLevel3 = () => {
    setCurrentLevel(3);
    window.scrollTo(0, 0);
  };

  const handleReconstructNetwork = () => {
    setIsReconstructing(true);
    setTimeout(() => {
      // Kruskal's algorithm
      const numStations = 14;
      const edges = [];
      for (let i = 0; i < numStations; i++) {
        for (let j = i + 1; j < numStations; j++) {
          if (WEIGHTED_MATRIX[i][j] !== -1 && WEIGHTED_MATRIX[i][j] !== 0) {
            edges.push({ u: i, v: j, weight: WEIGHTED_MATRIX[i][j] });
          }
        }
      }
      
      edges.sort((a, b) => a.weight - b.weight);
      
      const parent = new Array(numStations).fill(0).map((_, i) => i);
      const find = (i) => {
        if (parent[i] === i) return i;
        return parent[i] = find(parent[i]);
      };
      const union = (i, j) => {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) {
          parent[rootI] = rootJ;
          return true;
        }
        return false;
      };
      
      const resultEdges = [];
      let cost = 0;
      
      for (const edge of edges) {
        if (union(edge.u, edge.v)) {
          resultEdges.push({
            ...edge,
            stationU: sortedStations[edge.u].id,
            stationV: sortedStations[edge.v].id
          });
          cost += edge.weight;
        }
      }
      
      setMstEdges(resultEdges);
      setTotalCost(cost);
      setBinaryCost(cost.toString(2));
      setIsReconstructing(false);
      setNetworkReconstructed(true);
    }, 2000);
  };

  const ZONES = [
    { id: 'A', baseCost: 6, baseBenefit: 12, rule: "Reduces Zone B's cost to 5 if activated first." },
    { id: 'B', baseCost: 8, baseBenefit: 14, rule: "Costs 5 only if Zone A is already active." },
    { id: 'C', baseCost: 5, baseBenefit: 9, rule: "Gains +4 benefit if activated after Zone D." },
    { id: 'D', baseCost: 7, baseBenefit: 13, rule: "Stabilizes nearby sectors (triggers C's bonus)." },
    { id: 'E', baseCost: 4, baseBenefit: 8, rule: "If selected with Zone C, reduces C's cost by 1." },
    { id: 'F', baseCost: 3, baseBenefit: 0, rule: "Consumes energy but provides no direct benefit." }
  ];

  const calculateL4 = (zones) => {
    let energy = 0;
    let benefit = 0;
    let hasA = false;
    let hasD = false;
    let hasE = zones.includes('E');

    zones.forEach(z => {
      if (z === 'A') {
        energy += 6;
        benefit += 12;
        hasA = true;
      } else if (z === 'B') {
        energy += hasA ? 5 : 8;
        benefit += 14;
      } else if (z === 'C') {
        energy += hasE ? 4 : 5;
        benefit += hasD ? 13 : 9;
      } else if (z === 'D') {
        energy += 7;
        benefit += 13;
        hasD = true;
      } else if (z === 'E') {
        energy += 4;
        benefit += 8;
      } else if (z === 'F') {
        energy += 3;
        benefit += 0;
      }
    });
    
    return { energy, benefit };
  };

  const l4Stats = calculateL4(selectedZones);

  const handleZoneToggle = (zoneId) => {
    if (l4Verified) return;
    setL4Error("");
    if (selectedZones.includes(zoneId)) {
      setSelectedZones(selectedZones.filter(id => id !== zoneId));
    } else {
      setSelectedZones([...selectedZones, zoneId]);
    }
  };

  const handleVerifyL4 = () => {
    if (l4Stats.energy > 20) {
      setL4Error("Critical Error: Total Energy Exceeds 20 kWh Maximum Capacity.");
      return;
    }
    if (selectedZones.length === 0) {
      setL4Error("Critical Error: No zones selected.");
      return;
    }
    
    setIsVerifyingL4(true);
    setTimeout(() => {
      if (l4Stats.benefit === 43 && l4Stats.energy <= 20) {
        const B = l4Stats.benefit;
        const E = l4Stats.energy;
        const n = selectedZones.length;
        const S = B + E + n;
        
        const digitSum = (num) => String(num).split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
        const F = digitSum(B) * digitSum(E);
        
        const K = Math.floor(S + (F / 3));
        const finalKey = K + (n - 1);
        
        setUnlockCode(`${finalKey}GRID`);
        setL4Verified(true);
        setL4Error("");
      } else {
        setL4Error(`Allocation accepted, but survival benefit (${l4Stats.benefit}) is suboptimal. A better configuration exists.`);
      }
      setIsVerifyingL4(false);
    }, 1500);
  };

  const handleFindRoute = () => {
    setIsRouting(true);
    setTimeout(() => {
      // Dijkstra's algorithm from Z2 (index 1) to Z6 (index 5)
      const numNodes = 7;
      const dist = new Array(numNodes).fill(Infinity);
      const prev = new Array(numNodes).fill(-1);
      const visited = new Array(numNodes).fill(false);
      
      const source = 1; // Z2
      const target = 5; // Z6
      
      dist[source] = 0;
      
      for (let i = 0; i < numNodes; i++) {
        let u = -1;
        for (let j = 0; j < numNodes; j++) {
          if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
            u = j;
          }
        }
        
        if (dist[u] === Infinity) break;
        visited[u] = true;
        
        for (let v = 0; v < numNodes; v++) {
          if (ROUTE_MATRIX[u][v] !== -1 && !visited[v]) {
            const alt = dist[u] + ROUTE_MATRIX[u][v];
            if (alt < dist[v]) {
              dist[v] = alt;
              prev[v] = u;
            }
          }
        }
      }
      
      const path = [];
      let u = target;
      if (prev[u] !== -1 || u === source) {
        while (u !== -1) {
          path.unshift(u);
          u = prev[u];
        }
      }
      
      const pathNodes = path.map(idx => `Z${idx + 1}`);
      const code = path.map(idx => `${idx + 1}`).join('');
      
      setShortestRoute(pathNodes);
      setMinCost(dist[target]);
      setFinalUnlockCode(code);
      setRouteFound(true);
      setIsRouting(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-cyan-900 selection:text-cyan-100">
      <div className="max-w-7xl mx-auto space-y-8 relative">
        
        {/* Background ambient light */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-4 relative z-10 pt-8">
          <div className="inline-flex items-center justify-center space-x-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]" />
            <span className="text-red-400 font-mono tracking-widest text-sm font-semibold uppercase">Critical Error Detected</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
            SMART CITY RECOVERY
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto">
            {currentLevel === 1 ? 'Level 1 — Station Ordering & Disorder Analysis' : currentLevel === 2 ? 'Level 2 — Dependency Resolution' : currentLevel === 3 ? 'Level 3 — Network Reconstruction' : currentLevel === 4 ? 'Level 4 — The Grid of Vital Energy' : 'Level 5 — Critical Route Recovery'}
          </p>
        </div>

        {currentLevel === 1 && (
          <>
        {/* Console */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/20 rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden group hover:border-cyan-500/40 transition-colors duration-500">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500 to-cyan-500/0 opacity-50" />
          
          <h2 className="flex items-center text-xl font-semibold text-cyan-300 mb-4">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Emergency Console
          </h2>

          <div className="bg-black/60 rounded-xl p-5 border border-cyan-900/50 font-mono text-sm md:text-base leading-relaxed text-cyan-50 shadow-inner">
            <p className="text-red-400">{">"} Station registry corruption detected.</p>
            <p className="text-amber-400">{">"} Signal ordering integrity has been compromised.</p>
            <p className="text-cyan-200 opacity-80">{">"} Convert all station identifiers into numerical form.</p>
            <p className="text-cyan-200 opacity-80">{">"} Restore the correct sequence before synchronization can continue.</p>
          </div>
        </div>

        {/* Input Stations Grid */}
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-100 flex items-center">
              <svg className="w-6 h-6 mr-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              Corrupted Registry
            </h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {stations.map((station, i) => (
              <div key={i} className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800 transition-colors duration-300 group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-2xl font-bold text-white tracking-wider group-hover:text-red-400 transition-colors">{station.id}</span>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                    <span>ASCII({station.id[0]})</span>
                    <span className="text-slate-400">{station.val1}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                    <span>ASCII({station.id[1]})</span>
                    <span className="text-slate-400">{station.val2}</span>
                  </div>
                  <div className="pt-2 mt-2 border-t border-slate-700/50 flex justify-between items-center">
                    <span className="text-xs text-slate-400">Value</span>
                    <span className="text-lg font-semibold text-cyan-300">{station.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        {!recoveryComplete && (
          <div className="flex justify-center py-8 relative z-10">
            <button 
              onClick={handleRecovery}
              disabled={isRecovering}
              className={`
                relative group overflow-hidden rounded-full px-8 py-4 font-bold tracking-widest uppercase transition-all duration-300
                ${isRecovering 
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] scale-100 hover:scale-105'
                }
              `}
            >
              {isRecovering ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Sequence...
                </span>
              ) : 'Initiate Recovery'}
            </button>
          </div>
        )}

        {/* Results Section */}
        {recoveryComplete && (
          <div className="space-y-8 relative z-10 animate-fade-in-up">
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Inversion Count Card */}
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                <h3 className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-2">Disorder Analysis</h3>
                <p className="text-slate-300 text-xs mb-6 max-w-[200px]">Total misplaced pairs (i &lt; j and Value(i) &gt; Value(j))</p>
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-indigo-300 drop-shadow-sm">
                  {inversionCount}
                </div>
                <div className="mt-4 inline-block px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs border border-indigo-500/20">
                  Calculated via Merge Sort
                </div>
              </div>

              {/* Success Info */}
              <div className="md:col-span-2 bg-slate-900/60 border border-green-500/30 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-green-400">Synchronization Restored</h3>
                    <p className="text-slate-400 text-sm">System ready for Level 2 Dependency Matrix alignment.</p>
                  </div>
                </div>
                
                <div className="bg-black/40 rounded-xl p-4 border border-slate-700/50">
                   <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Optimal Strategy Applied:</h4>
                   <ul className="space-y-2 text-sm text-slate-400">
                     <li className="flex items-center"><span className="text-cyan-500 mr-2">✓</span> Divided registry into smaller sections</li>
                     <li className="flex items-center"><span className="text-cyan-500 mr-2">✓</span> Recursively solved each segment</li>
                     <li className="flex items-center"><span className="text-cyan-500 mr-2">✓</span> Counted inversions during merge phase</li>
                     <li className="flex items-center"><span className="text-cyan-500 mr-2">✓</span> Successfully restored ascending sequence</li>
                   </ul>
                </div>
              </div>
            </div>

            {/* Sorted Stations Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-100 flex items-center">
                  <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                  Restored Sequence
                </h2>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {sortedStations.map((station, i) => (
                  <div key={i} className="bg-gradient-to-b from-slate-800 to-slate-900 border border-green-500/30 rounded-xl p-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-500/50"></div>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-mono text-slate-500">#{i + 1}</span>
                      <span className="text-2xl font-bold text-white group-hover:text-green-300 transition-colors">{station.id}</span>
                    </div>
                    <div className="text-center pt-2 border-t border-slate-700/50">
                      <span className="text-xl font-semibold text-green-400">{station.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {recoveryComplete && currentLevel === 1 && (
          <div className="flex justify-center py-8 relative z-10 animate-fade-in-up">
            <button 
              onClick={handleProceedToLevel2}
              className="relative group overflow-hidden rounded-full px-8 py-4 font-bold tracking-widest uppercase transition-all duration-300 bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] scale-100 hover:scale-105"
            >
              Proceed to Level 2
            </button>
          </div>
        )}
        </>
        )}

        {currentLevel === 2 && (
          <div className="space-y-8 relative z-10 animate-fade-in-up">
            
            {/* Level 2 Console */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden group hover:border-indigo-500/40 transition-colors duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/0 via-indigo-500 to-indigo-500/0 opacity-50" />
              
              <h2 className="flex items-center text-xl font-semibold text-indigo-300 mb-4">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                Dependency Analyzer
              </h2>

              <div className="bg-black/60 rounded-xl p-5 border border-indigo-900/50 font-mono text-sm md:text-base leading-relaxed text-indigo-50 shadow-inner">
                <p className="text-amber-400">{">"} Warning: Dependency constraints detected.</p>
                <p className="text-indigo-200 opacity-80">{">"} Multiple control stations require prerequisite activations.</p>
                <p className="text-indigo-200 opacity-80">{">"} Construct a valid execution sequence before system-wide synchronization can continue.</p>
              </div>
            </div>

            {/* Matrix Display */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-100 flex items-center">
                <svg className="w-6 h-6 mr-3 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                Connectivity Matrix
              </h2>
              <div className="bg-slate-900/60 backdrop-blur-sm border border-indigo-500/30 rounded-xl p-4 overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header Row */}
                  <div className="flex mb-2">
                    <div className="w-10"></div>
                    {sortedStations.map((s, i) => (
                      <div key={i} className="flex-1 text-center text-xs font-mono text-slate-500 font-bold">{i+1}</div>
                    ))}
                  </div>
                  {/* Matrix Rows */}
                  {DEPENDENCY_MATRIX.map((row, i) => (
                    <div key={i} className="flex mb-1 items-center group">
                      <div className="w-10 text-xs font-mono text-indigo-400 font-bold">{i+1}</div>
                      {row.map((val, j) => (
                        <div key={j} className={`flex-1 aspect-square flex items-center justify-center text-xs font-mono rounded-sm mx-0.5 transition-colors ${val === 1 ? 'bg-indigo-500/80 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800/50 text-slate-600 group-hover:bg-slate-800'}`}>
                          {val}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!matrixResolved && (
              <div className="flex justify-center py-8">
                <button 
                  onClick={handleResolveDependencies}
                  disabled={isResolving}
                  className={`
                    relative group overflow-hidden rounded-full px-8 py-4 font-bold tracking-widest uppercase transition-all duration-300
                    ${isResolving 
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                      : 'bg-indigo-500 hover:bg-indigo-400 text-white hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] scale-100 hover:scale-105'
                    }
                  `}
                >
                  {isResolving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Computing Topology...
                    </span>
                  ) : 'Resolve Sequence'}
                </button>
              </div>
            )}

            {/* Resolved Sequence */}
            {matrixResolved && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="bg-slate-900/60 border border-green-500/30 rounded-2xl p-6 shadow-xl mb-8">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-green-400">Conflict Resolved</h3>
                      <p className="text-slate-400 text-sm">Valid execution sequence generated. System ready for Level 3.</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold text-slate-100 flex items-center">
                    <svg className="w-6 h-6 mr-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Execution Sequence
                  </h2>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {executionSequence.map((station, i) => (
                    <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 rounded-xl p-4 relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50"></div>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-mono text-indigo-400 font-bold">Step {i + 1}</span>
                        <span className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">{station.id}</span>
                      </div>
                      <div className="text-center pt-2 border-t border-slate-700/50 flex justify-between items-center">
                        <span className="text-xs text-slate-500">Value</span>
                        <span className="text-lg font-semibold text-slate-300">{station.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action to Level 3 */}
            {matrixResolved && currentLevel === 2 && (
              <div className="flex justify-center py-8 relative z-10 animate-fade-in-up">
                <button 
                  onClick={handleProceedToLevel3}
                  className="relative group overflow-hidden rounded-full px-8 py-4 font-bold tracking-widest uppercase transition-all duration-300 bg-teal-500 hover:bg-teal-400 text-slate-900 hover:shadow-[0_0_40px_rgba(20,184,166,0.6)] scale-100 hover:scale-105"
                >
                  Proceed to Level 3
                </button>
              </div>
            )}

          </div>
        )}

        {currentLevel === 3 && (
          <div className="space-y-8 relative z-10 animate-fade-in-up">
            
            {/* Level 3 Console */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-teal-500/20 rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden group hover:border-teal-500/40 transition-colors duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500/0 via-teal-500 to-teal-500/0 opacity-50" />
              
              <h2 className="flex items-center text-xl font-semibold text-teal-300 mb-4">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Network Reconstructor
              </h2>

              <div className="bg-black/60 rounded-xl p-5 border border-teal-900/50 font-mono text-sm md:text-base leading-relaxed text-teal-50 shadow-inner">
                <p className="text-red-400">{">"} Critical infrastructure failure detected.</p>
                <p className="text-teal-200 opacity-80">{">"} Communication pathways between control stations have collapsed.</p>
                <p className="text-teal-200 opacity-80">{">"} Rebuild the smart-grid backbone while minimizing total restoration cost.</p>
                <p className="text-amber-400 opacity-80">{">"} Redundant cyclic pathways must be avoided to preserve network stability.</p>
              </div>
            </div>

            {/* Matrix Display */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-100 flex items-center">
                <svg className="w-6 h-6 mr-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                Weighted Connectivity Matrix
              </h2>
              <div className="bg-slate-900/60 backdrop-blur-sm border border-teal-500/30 rounded-xl p-4 overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header Row */}
                  <div className="flex mb-2">
                    <div className="w-10"></div>
                    {sortedStations.map((s, i) => (
                      <div key={i} className="flex-1 text-center text-xs font-mono text-slate-500 font-bold">{i+1}</div>
                    ))}
                  </div>
                  {/* Matrix Rows */}
                  {WEIGHTED_MATRIX.map((row, i) => (
                    <div key={i} className="flex mb-1 items-center group">
                      <div className="w-10 text-xs font-mono text-teal-400 font-bold">{i+1}</div>
                      {row.map((val, j) => (
                        <div key={j} className={`flex-1 aspect-square flex items-center justify-center text-xs font-mono rounded-sm mx-0.5 transition-colors ${val !== -1 && val !== 0 ? 'bg-teal-500/80 text-white shadow-[0_0_10px_rgba(20,184,166,0.3)]' : val === 0 ? 'bg-slate-700/80 text-slate-400' : 'bg-slate-800/50 text-slate-600 group-hover:bg-slate-800'}`}>
                          {val}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!networkReconstructed && (
              <div className="flex justify-center py-8">
                <button 
                  onClick={handleReconstructNetwork}
                  disabled={isReconstructing}
                  className={`
                    relative group overflow-hidden rounded-full px-8 py-4 font-bold tracking-widest uppercase transition-all duration-300
                    ${isReconstructing 
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                      : 'bg-teal-500 hover:bg-teal-400 text-slate-900 hover:shadow-[0_0_40px_rgba(20,184,166,0.6)] scale-100 hover:scale-105'
                    }
                  `}
                >
                  {isReconstructing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating Optimal Connections...
                    </span>
                  ) : 'Reconstruct Network'}
                </button>
              </div>
            )}

            {/* Results Section */}
            {networkReconstructed && (
              <div className="space-y-8 animate-fade-in-up">
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Cost Analysis Card */}
                  <div className="bg-gradient-to-br from-teal-900/50 to-emerald-900/50 border border-teal-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
                    <h3 className="text-teal-200 text-sm font-semibold uppercase tracking-widest mb-2">Total Restoration Cost</h3>
                    <p className="text-slate-300 text-xs mb-6">Minimum spanning tree computed</p>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-teal-300 drop-shadow-sm">
                      {totalCost}
                    </div>
                    <div className="mt-4 px-4 py-2 rounded-lg bg-black/40 border border-teal-500/30 flex items-center flex-col">
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">Binary Code</span>
                      <span className="text-xl font-mono text-teal-400 tracking-[0.2em]">{binaryCost}</span>
                    </div>
                  </div>

                  {/* Success Info */}
                  <div className="md:col-span-2 bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-emerald-400">Network Reconnected</h3>
                        <p className="text-slate-400 text-sm">Full communication restored without redundancy.</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-xl p-4 border border-slate-700/50">
                       <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Reconstruction Log:</h4>
                       <ul className="space-y-2 text-sm text-slate-400 max-h-40 overflow-y-auto pr-2">
                         {mstEdges.map((edge, idx) => (
                           <li key={idx} className="flex justify-between items-center border-b border-slate-800 pb-1">
                             <span className="flex items-center">
                               <span className="text-teal-500 mr-2 text-xs">●</span> 
                               Link {edge.stationU} <span className="text-slate-600 mx-2">↔</span> {edge.stationV}
                             </span>
                             <span className="text-teal-300 font-mono">Cost: {edge.weight}</span>
                           </li>
                         ))}
                       </ul>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {networkReconstructed && currentLevel === 3 && (
              <div className="flex justify-center py-8 relative z-10 animate-fade-in-up">
                <button 
                  onClick={() => { setCurrentLevel(4); window.scrollTo(0, 0); }}
                  className="relative group overflow-hidden rounded-full px-8 py-4 font-bold tracking-widest uppercase transition-all duration-300 bg-emerald-500 hover:bg-emerald-400 text-slate-900 hover:shadow-[0_0_40px_rgba(16,185,129,0.6)] scale-100 hover:scale-105"
                >
                  Proceed to Level 4
                </button>
              </div>
            )}

          </div>
        )}

        {currentLevel === 4 && (
          <div className="space-y-8 relative z-10 animate-fade-in-up">
            
            {/* Level 4 Console */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-yellow-500/20 rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden group hover:border-yellow-500/40 transition-colors duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500/0 via-yellow-500 to-yellow-500/0 opacity-50" />
              
              <h2 className="flex items-center text-xl font-semibold text-yellow-300 mb-4">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Energy Grid Command
              </h2>

              <div className="bg-black/60 rounded-xl p-5 border border-yellow-900/50 font-mono text-sm md:text-base leading-relaxed text-yellow-50 shadow-inner">
                <p className="text-red-400">{">"} Critical energy shortage detected.</p>
                <p className="text-yellow-200 opacity-80">{">"} Max Available Energy: 20 kWh.</p>
                <p className="text-yellow-200 opacity-80">{">"} Objective: Maximize survival benefit without exceeding capacity.</p>
                <p className="text-amber-400 opacity-80">{">"} Warning: Grid is unstable. Activation order modifies zone parameters dynamically.</p>
              </div>
            </div>

            {/* Dashboard for Energy & Benefit */}
            <div className="grid grid-cols-2 gap-6">
               <div className={`p-6 rounded-2xl border transition-colors ${l4Stats.energy > 20 ? 'bg-red-900/20 border-red-500/50' : 'bg-slate-900/60 border-yellow-500/30'} flex flex-col justify-center items-center`}>
                 <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2 text-center">Total Energy Used</h3>
                 <div className={`text-4xl md:text-5xl font-black ${l4Stats.energy > 20 ? 'text-red-400' : 'text-yellow-400'}`}>
                   {l4Stats.energy} <span className="text-lg md:text-xl font-normal text-slate-500">/ 20 kWh</span>
                 </div>
               </div>
               <div className="p-6 rounded-2xl border bg-slate-900/60 border-yellow-500/30 flex flex-col justify-center items-center">
                 <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-2 text-center">Total Survival Benefit</h3>
                 <div className="text-4xl md:text-5xl font-black text-green-400">
                   {l4Stats.benefit}
                 </div>
               </div>
            </div>

            {/* Zones Grid */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-100 flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center mb-2 md:mb-0">
                  <svg className="w-6 h-6 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  Select City Zones
                </div>
                <div className="text-sm text-slate-400 font-mono bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-700/50">
                  Sequence: <span className="text-yellow-300">{selectedZones.length === 0 ? "None" : selectedZones.join(" → ")}</span>
                </div>
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ZONES.map((zone) => {
                  const isSelected = selectedZones.includes(zone.id);
                  const selectedIndex = selectedZones.indexOf(zone.id);
                  return (
                    <div 
                      key={zone.id} 
                      onClick={() => handleZoneToggle(zone.id)}
                      className={`relative cursor-pointer overflow-hidden rounded-xl border p-5 transition-all duration-300 ${isSelected ? 'bg-yellow-900/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-slate-900/60 border-slate-700/50 hover:bg-slate-800 hover:border-yellow-500/30'}`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-yellow-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                          #{selectedIndex + 1}
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <h3 className={`text-3xl font-black ${isSelected ? 'text-yellow-400' : 'text-slate-300'}`}>Zone {zone.id}</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div className="bg-black/30 p-2 rounded border border-slate-800 flex flex-col">
                          <span className="text-slate-500 text-[10px] uppercase">Base Cost</span>
                          <span className="font-mono text-yellow-200">{zone.baseCost} kWh</span>
                        </div>
                        <div className="bg-black/30 p-2 rounded border border-slate-800 flex flex-col">
                          <span className="text-slate-500 text-[10px] uppercase">Base Benefit</span>
                          <span className="font-mono text-green-300">{zone.baseBenefit}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 italic bg-black/20 p-2 rounded min-h-[48px] flex items-center">
                        {zone.rule}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Message */}
            {l4Error && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-4 flex items-center text-red-200 animate-fade-in-up">
                <svg className="w-5 h-5 mr-3 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {l4Error}
              </div>
            )}

            {/* Action Button */}
            {!l4Verified && (
              <div className="flex justify-center py-8">
                <button 
                  onClick={handleVerifyL4}
                  disabled={isVerifyingL4}
                  className={`
                    relative group overflow-hidden rounded-full px-8 py-4 font-bold tracking-widest uppercase transition-all duration-300
                    ${isVerifyingL4 
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                      : 'bg-yellow-500 hover:bg-yellow-400 text-slate-900 hover:shadow-[0_0_40px_rgba(234,179,8,0.6)] scale-100 hover:scale-105'
                    }
                  `}
                >
                  {isVerifyingL4 ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying Grid...
                    </span>
                  ) : 'Verify Allocation'}
                </button>
              </div>
            )}

            {/* Success Details */}
            {l4Verified && (
              <div className="space-y-8 animate-fade-in-up">
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Unlock Code Card */}
                  <div className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 border border-yellow-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl"></div>
                    <h3 className="text-yellow-200 text-sm font-semibold uppercase tracking-widest mb-2">Final Unlock Code</h3>
                    <p className="text-slate-300 text-xs mb-6">Access granted to next sector</p>
                    <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-yellow-300 drop-shadow-sm tracking-wider">
                      {unlockCode}
                    </div>
                  </div>

                  {/* Verification Protocol Details */}
                  <div className="md:col-span-2 bg-slate-900/60 border border-green-500/30 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-green-400">Grid Synchronized</h3>
                        <p className="text-slate-400 text-sm">Optimal energy allocation verified.</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-xl p-4 border border-slate-700/50">
                       <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Verification Protocol Executed:</h4>
                       <ul className="space-y-2 text-sm text-slate-400 font-mono">
                         <li className="flex justify-between border-b border-slate-800 pb-1">
                           <span>1. Grid Sum (S)</span>
                           <span className="text-yellow-400">{l4Stats.benefit} + {l4Stats.energy} + {selectedZones.length} = {l4Stats.benefit + l4Stats.energy + selectedZones.length}</span>
                         </li>
                         <li className="flex justify-between border-b border-slate-800 pb-1">
                           <span>2. Stability Factor (F)</span>
                           <span className="text-yellow-400">DigitSum({l4Stats.benefit}) × DigitSum({l4Stats.energy}) = {
                             String(l4Stats.benefit).split('').reduce((acc, d) => acc + parseInt(d, 10), 0) * String(l4Stats.energy).split('').reduce((acc, d) => acc + parseInt(d, 10), 0)
                           }</span>
                         </li>
                         <li className="flex justify-between border-b border-slate-800 pb-1">
                           <span>3. Numeric Access Key (K)</span>
                           <span className="text-yellow-400">Floor(S + F/3) = {Math.floor((l4Stats.benefit + l4Stats.energy + selectedZones.length) + (String(l4Stats.benefit).split('').reduce((acc, d) => acc + parseInt(d, 10), 0) * String(l4Stats.energy).split('').reduce((acc, d) => acc + parseInt(d, 10), 0))/3)}</span>
                         </li>
                         <li className="flex justify-between pt-1">
                           <span className="text-green-300 font-bold">Generated Sequence</span>
                           <span className="text-green-400 tracking-wider font-bold">{unlockCode}</span>
                         </li>
                       </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {l4Verified && currentLevel === 4 && (
              <div className="flex justify-center py-8 relative z-10 animate-fade-in-up">
                <button 
                  onClick={() => { setCurrentLevel(5); window.scrollTo(0, 0); }}
                  className="relative group overflow-hidden rounded-full px-8 py-4 font-bold tracking-widest uppercase transition-all duration-300 bg-red-500 hover:bg-red-400 text-slate-900 hover:shadow-[0_0_40px_rgba(239,68,68,0.6)] scale-100 hover:scale-105"
                >
                  Proceed to Level 5
                </button>
              </div>
            )}

          </div>
        )}

        {currentLevel === 5 && (
          <div className="space-y-8 relative z-10 animate-fade-in-up">
            
            {/* Level 5 Console */}
            <div className="bg-slate-900/80 backdrop-blur-md border border-fuchsia-500/20 rounded-2xl p-6 shadow-2xl relative z-10 overflow-hidden group hover:border-fuchsia-500/40 transition-colors duration-500">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500 to-fuchsia-500/0 opacity-50" />
              
              <h2 className="flex items-center text-xl font-semibold text-fuchsia-300 mb-4">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Emergency Routing Protocol
              </h2>

              <div className="bg-black/60 rounded-xl p-5 border border-fuchsia-900/50 font-mono text-sm md:text-base leading-relaxed text-fuchsia-50 shadow-inner">
                <p className="text-red-400">{">"} Priority control packet detected.</p>
                <p className="text-fuchsia-200 opacity-80">{">"} Immediate transmission required across the smart-grid network.</p>
                <p className="text-fuchsia-200 opacity-80">{">"} Determine the minimum-cost route before communication failure spreads further.</p>
                <p className="text-amber-400 opacity-80">{">"} Source Node: Z2 | Destination Node: Z6</p>
              </div>
            </div>

            {/* Matrix Display */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-slate-100 flex items-center">
                <svg className="w-6 h-6 mr-3 text-fuchsia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
                Transmission Cost Matrix
              </h2>
              <div className="bg-slate-900/60 backdrop-blur-sm border border-fuchsia-500/30 rounded-xl p-4 overflow-x-auto">
                <div className="min-w-[400px]">
                  {/* Header Row */}
                  <div className="flex mb-2">
                    <div className="w-10"></div>
                    {ROUTE_MATRIX[0].map((_, i) => (
                      <div key={i} className="flex-1 text-center text-xs font-mono text-slate-500 font-bold">Z{i+1}</div>
                    ))}
                  </div>
                  {/* Matrix Rows */}
                  {ROUTE_MATRIX.map((row, i) => (
                    <div key={i} className="flex mb-1 items-center group">
                      <div className="w-10 text-xs font-mono text-fuchsia-400 font-bold">Z{i+1}</div>
                      {row.map((val, j) => (
                        <div key={j} className={`flex-1 aspect-square flex items-center justify-center text-xs font-mono rounded-sm mx-0.5 transition-colors ${val !== -1 && val !== 0 ? 'bg-fuchsia-500/80 text-white shadow-[0_0_10px_rgba(217,70,239,0.3)]' : val === 0 ? 'bg-slate-700/80 text-slate-400' : 'bg-slate-800/50 text-slate-600 group-hover:bg-slate-800'}`}>
                          {val === -1 ? '∞' : val}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Button */}
            {!routeFound && (
              <div className="flex justify-center py-8">
                <button 
                  onClick={handleFindRoute}
                  disabled={isRouting}
                  className={`
                    relative group overflow-hidden rounded-full px-8 py-4 font-bold tracking-widest uppercase transition-all duration-300
                    ${isRouting 
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700' 
                      : 'bg-fuchsia-500 hover:bg-fuchsia-400 text-slate-900 hover:shadow-[0_0_40px_rgba(217,70,239,0.6)] scale-100 hover:scale-105'
                    }
                  `}
                >
                  {isRouting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Calculating Route...
                    </span>
                  ) : 'Compute Optimal Route'}
                </button>
              </div>
            )}

            {/* Results Section */}
            {routeFound && (
              <div className="space-y-8 animate-fade-in-up">
                
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Cost Card */}
                  <div className="bg-gradient-to-br from-fuchsia-900/50 to-pink-900/50 border border-fuchsia-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-center items-center text-center">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-2xl"></div>
                    <h3 className="text-fuchsia-200 text-sm font-semibold uppercase tracking-widest mb-2">Total Transmission Cost</h3>
                    <p className="text-slate-300 text-xs mb-6">Minimum-cost route established</p>
                    <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-fuchsia-300 drop-shadow-sm">
                      {minCost}
                    </div>
                  </div>

                  {/* Success Info */}
                  <div className="md:col-span-2 bg-slate-900/60 border border-pink-500/30 rounded-2xl p-6 shadow-xl flex flex-col justify-center">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-pink-400">Packet Transmitted Successfully</h3>
                        <p className="text-slate-400 text-sm">Automated defense systems stabilized.</p>
                      </div>
                    </div>
                    
                    <div className="bg-black/40 rounded-xl p-4 border border-slate-700/50 mt-2">
                       <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Shortest Valid Route:</h4>
                       <div className="flex flex-wrap items-center gap-2 text-lg font-mono">
                         {shortestRoute.map((node, idx) => (
                           <span key={idx} className="flex items-center">
                             <span className="bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 px-3 py-1 rounded-lg">
                               {node}
                             </span>
                             {idx < shortestRoute.length - 1 && (
                               <svg className="w-5 h-5 mx-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                             )}
                           </span>
                         ))}
                       </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-fuchsia-900/40 via-purple-900/40 to-fuchsia-900/40 border border-fuchsia-500/50 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(217,70,239,0.15)] relative overflow-hidden">
                   <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-fuchsia-500/20 rounded-full blur-[80px] pointer-events-none" />
                   <h3 className="text-fuchsia-200 text-lg font-semibold uppercase tracking-widest mb-3 relative z-10">System Unlock Code</h3>
                   <div className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-fuchsia-100 to-fuchsia-400 tracking-[0.2em] drop-shadow-lg relative z-10">
                     {finalUnlockCode}
                   </div>
                   <p className="text-slate-400 mt-6 max-w-2xl mx-auto relative z-10">
                     The emergency routing sequence itself forms the final system unlock code. All critical infrastructures have been restored.
                   </p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
      
      {/* Global styles for animations */}
      <style>{`
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}