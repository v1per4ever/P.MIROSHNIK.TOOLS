const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');

const canvas = createCanvas(100, 100);

try {
    JsBarcode(canvas, "4607123412345", { format: "EAN13" });
    console.log("Success 13 digits!");
} catch (e) {
    console.error("Failed 13 digits:", e.message);
}

try {
    JsBarcode(canvas, "460712341234", { format: "EAN13" });
    console.log("Success 12 digits!");
} catch (e) {
    console.error("Failed 12 digits:", e.message);
}
