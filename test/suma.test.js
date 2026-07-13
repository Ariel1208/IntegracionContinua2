const { suma } = require("../index");
const assert = require("assert");

assert.strictEqual(suma(2, 3), 5);
assert.strictEqual(suma(0, 0), 0);
assert.strictEqual(suma(-1, 1), 0);

console.log("✅ Todas las pruebas pasaron");
