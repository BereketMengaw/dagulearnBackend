const crypto = require("crypto");

const payload = JSON.stringify({
  tx_ref: "tx_1733161103345",
  status: "success",
});
const secret = "KALKIDAN"; // Replace with your actual secret key
const signature = crypto
  .createHmac("sha256", secret)
  .update(payload)
  .digest("hex");
console.log("Generated Signature:", signature);
