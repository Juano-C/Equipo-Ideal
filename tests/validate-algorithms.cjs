/*
 * Validación independiente de los algoritmos de la demo.
 * Uso: node tests/validate-algorithms.cjs
 * No requiere dependencias externas.
 *
 * La referencia enumera todas las combinaciones por rol y comprueba las
 * incompatibilidades directamente; no reutiliza el backtracking de producción.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const appPath = path.join(__dirname, '..', 'app.js');
const appSource = fs.readFileSync(appPath, 'utf8');
const algorithmSource = appSource.slice(0, appSource.indexOf('function renderTeam(result)'));

const validation = String.raw`
function bruteReference(counts) {
  const groups = ROLE_ORDER.map(role => EMPLOYEES.filter(e => e.rol === role));
  let bestScore = -1;
  let bestTeam = null;
  let combinations = 0;
  const chosen = [];

  function visitRole(roleIndex) {
    if (roleIndex >= ROLE_ORDER.length) {
      combinations++;
      const currentScore = score(chosen);
      if (currentScore > bestScore) {
        bestScore = currentScore;
        bestTeam = chosen.slice();
      }
      return;
    }

    const role = ROLE_ORDER[roleIndex];
    const needed = counts[role];
    const group = groups[roleIndex];

    function choose(start, left) {
      if (left === 0) {
        visitRole(roleIndex + 1);
        return;
      }
      for (let i = start; i <= group.length - left; i++) {
        const candidate = group[i];
        // Comprueba incompatibilidades directamente a partir de la lista de pares.
        const conflict = chosen.some(member => INCOMPATIBILITIES.some(([a, b]) =>
          (a === candidate.id && b === member.id) ||
          (b === candidate.id && a === member.id)
        ));
        if (conflict) continue;
        chosen.push(candidate);
        choose(i + 1, left - 1);
        chosen.pop();
      }
    }
    choose(0, needed);
  }

  visitRole(0);
  return { score: bestTeam ? bestScore : null, team: bestTeam, combinations };
}

let testedConfigurations = 0;
let referenceCombinations = 0;
let backtrackingMismatches = [];
let feasibleConfigurations = 0;
let greedyMisses = 0;
let greedyInvalidSolutions = 0;
let defaultBacktrackingScore = null;
let defaultGreedyScore = null;

for (let leaders = 0; leaders <= 5; leaders++) {
  for (let architects = 0; architects <= 5; architects++) {
    for (let programmers = 0; programmers <= 5; programmers++) {
      for (let testers = 0; testers <= 5; testers++) {
        const counts = {
          LIDERPROYECTO: leaders,
          ARQUITECTO: architects,
          PROGRAMADOR: programmers,
          TESTER: testers
        };
        const reference = bruteReference(counts);
        referenceCombinations += reference.combinations;
        const backtracking = runBacktracking(counts);
        testedConfigurations++;

        if ((backtracking.team ? backtracking.score : null) !== reference.score) {
          backtrackingMismatches.push({ counts, reference: reference.score,
            backtracking: backtracking.team ? backtracking.score : null });
        }

        if (reference.team) {
          feasibleConfigurations++;
          const greedy = runGreedy(counts);
          if (!greedy.team) {
            greedyMisses++;
          } else {
            const hasConflict = greedy.team.some((person, index, team) =>
              team.slice(0, index).some(other => INCOMPATIBILITIES.some(([a, b]) =>
                (a === person.id && b === other.id) ||
                (b === person.id && a === other.id)
              ))
            );
            const hasCorrectCounts = ROLE_ORDER.every(role =>
              greedy.team.filter(person => person.rol === role).length === counts[role]
            );
            if (hasConflict || !hasCorrectCounts) greedyInvalidSolutions++;
          }
        }

        if (leaders === 1 && architects === 2 && programmers === 4 && testers === 5) {
          defaultBacktrackingScore = backtracking.team ? backtracking.score : null;
          const greedy = runGreedy(counts);
          defaultGreedyScore = greedy.team ? greedy.score : null;
        }
      }
    }
  }
}

const report = {
  testedConfigurations,
  referenceCombinations,
  backtrackingMismatches: backtrackingMismatches.length,
  mismatchExamples: backtrackingMismatches.slice(0, 3),
  feasibleConfigurations,
  greedyFailedToFindSolution: greedyMisses,
  greedyInvalidSolutions: greedyInvalidSolutions,
  defaultScenario: {
    counts: { leaders: 1, architects: 2, programmers: 4, testers: 5 },
    backtrackingScore: defaultBacktrackingScore,
    greedyScore: defaultGreedyScore
  }
};
console.log(JSON.stringify(report, null, 2));
if (backtrackingMismatches.length > 0 || greedyInvalidSolutions > 0) process.exitCode = 1;
`;

vm.runInThisContext(`${algorithmSource}\n${validation}`, { filename: 'equipoideal-validation.js' });
