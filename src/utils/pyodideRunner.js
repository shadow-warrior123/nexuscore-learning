/**
 * Pyodide In-Browser Execution Engine
 * Runs real Python in WebAssembly with zero backend dependencies!
 */

let pyodideInstance = null;
let isInitializing = false;
let initPromise = null;

export async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof window.loadPyodide !== 'function') {
      throw new Error("Pyodide script not loaded. Check internet connection.");
    }
    const pyodide = await window.loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/"
    });
    // Load micropip and common scientific packages if needed
    try {
      await pyodide.loadPackage(['numpy']);
    } catch (e) {
      console.warn("Could not pre-load numpy:", e);
    }
    pyodideInstance = pyodide;
    return pyodide;
  })();

  return initPromise;
}

/**
 * Execute arbitrary Python code and capture stdout, stderr, and result
 */
export async function runPythonCode(code) {
  const pyodide = await getPyodide();
  const startTime = performance.now();

  let stdout = [];
  let stderr = [];

  // Redirect sys.stdout and sys.stderr
  pyodide.setStdout({
    batched: (str) => stdout.push(str)
  });
  pyodide.setStderr({
    batched: (str) => stderr.push(str)
  });

  try {
    const result = await pyodide.runPythonAsync(code);
    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: true,
      stdout: stdout.join('\n'),
      stderr: stderr.join('\n'),
      result: result !== undefined ? String(result) : null,
      durationMs
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      stdout: stdout.join('\n'),
      stderr: err.message,
      error: err.message,
      durationMs
    };
  }
}

/**
 * Run problem test cases against user code
 */
export async function runTests(userCode, testCases) {
  const pyodide = await getPyodide();
  const startTime = performance.now();

  let stdout = [];
  pyodide.setStdout({ batched: (str) => stdout.push(str) });

  const results = [];
  let allPassed = true;

  // First run user definitions
  try {
    await pyodide.runPythonAsync(userCode);
  } catch (err) {
    return {
      passed: false,
      syntaxError: err.message,
      results: [],
      durationMs: Math.round(performance.now() - startTime),
      stdout: stdout.join('\n')
    };
  }

  // Detect function name from user code
  const funcMatch = userCode.match(/def\s+([a-zA-Z0-9_]+)\s*\(/);
  const funcName = funcMatch ? funcMatch[1] : null;

  if (!testCases || testCases.length === 0) {
    // If no test cases defined, successful compilation counts as pass
    return {
      passed: true,
      results: [{ id: 1, name: "Execution Test", passed: true, input: "Script run", output: stdout.join('\n') }],
      durationMs: Math.round(performance.now() - startTime),
      stdout: stdout.join('\n')
    };
  }

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      let callStr = '';
      if (tc.input) {
        callStr = tc.input;
      } else if (funcName && tc.input_data) {
        if (typeof tc.input_data === 'object' && !Array.isArray(tc.input_data)) {
          const args = Object.entries(tc.input_data).map(([k, v]) => `${k}=${JSON.stringify(v)}`).join(', ');
          callStr = `${funcName}(${args})`;
        } else {
          callStr = `${funcName}(${JSON.stringify(tc.input_data)})`;
        }
      } else {
        callStr = funcName ? `${funcName}()` : 'None';
      }

      const evalRes = await pyodide.runPythonAsync(callStr);
      let actualStr = evalRes !== undefined ? String(evalRes) : 'None';
      
      // Expected comparison
      let expectedStr = tc.expectedOutput !== undefined ? String(tc.expectedOutput) : 
                        (tc.expected_output?.result !== undefined ? String(tc.expected_output.result) : 
                        String(tc.expected_output || ''));

      // Check loose equality or representation
      const pass = actualStr.trim().toLowerCase() === expectedStr.trim().toLowerCase() ||
                   JSON.stringify(actualStr) === JSON.stringify(expectedStr);

      if (!pass) allPassed = false;

      results.push({
        id: tc.id || (i + 1),
        isSample: tc.isSample !== undefined ? tc.isSample : true,
        callStr,
        expected: expectedStr,
        actual: actualStr,
        passed: pass
      });
    } catch (testErr) {
      allPassed = false;
      results.push({
        id: tc.id || (i + 1),
        isSample: tc.isSample !== undefined ? tc.isSample : true,
        callStr: funcName ? `${funcName}(...)` : 'test',
        error: testErr.message,
        passed: false
      });
    }
  }

  return {
    passed: allPassed,
    results,
    durationMs: Math.round(performance.now() - startTime),
    stdout: stdout.join('\n')
  };
}
