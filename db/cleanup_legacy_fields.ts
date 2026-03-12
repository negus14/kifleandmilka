import fs from "fs";
import path from "path";

const sitesDir = path.join(process.cwd(), "data", "sites");
const files = fs.readdirSync(sitesDir).filter(f => f.endsWith('.json'));

const FIELDS_TO_REMOVE = [
  "giftPaymentUrl",
  "giftPaymentLabel",
  "giftBankName",
  "giftAccountHolder",
  "giftAccountNumber",
  "giftSwiftCode"
];

console.log("Starting JSON cleanup of legacy fields...");

files.forEach(file => {
  const filePath = path.join(sitesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  
  let modified = false;
  FIELDS_TO_REMOVE.forEach(field => {
    if (field in data) {
      delete data[field];
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    console.log(`Cleaned up legacy fields in: ${file}`);
  } else {
    console.log(`No legacy fields found in: ${file}`);
  }
});

console.log("\nCleanup complete.");
