export function runProgram(code) {
const lines = code.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
const vars = {};
const output = [];


for (let i = 0; i < lines.length; i++) {
const line = lines[i];


// DECLARE
if (line.startsWith('DECLARE')) {
const [, name] = line.split(' ');
vars[name] = null;
}


// OUTPUT
else if (line.startsWith('OUTPUT')) {
const value = line.replace('OUTPUT', '').trim();
output.push(evaluate(value, vars));
}


else {
throw new Error(`Invalid statement on line ${i + 1}`);
}
}


return { output };
}


function evaluate(expr, vars) {
if (expr.startsWith('"')) return expr.replace(/"/g, '');
if (vars.hasOwnProperty(expr)) return vars[expr];
return expr;
}