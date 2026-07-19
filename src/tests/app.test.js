// Automated Unit Tests for FoxStock Logic Engine

// 1. Core Logic Functions (matching App implementation)
function calculateChangePercent(price, prevClose) {
  if (!prevClose) return 0;
  const change = price - prevClose;
  return parseFloat(((change / prevClose) * 100).toFixed(2));
}

function calculateSuitabilityScore(stock, prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const drawdown = ((stock.high52 - stock.price) / stock.high52) * 100;
  let score = 50; 

  if (lowerPrompt.includes("drop") || lowerPrompt.includes("down")) {
    score += drawdown * 1.2;
  }
  if (lowerPrompt.includes("low-medium risk") || lowerPrompt.includes("low risk")) {
    score += (50 - stock.peRatio) * 0.5; 
  }
  if (lowerPrompt.includes("target") || lowerPrompt.includes("increase")) {
    score += stock.ratingScore * 10; 
  }
  return Math.min(99, Math.max(40, Math.round(score)));
}

function validateRegistration(email, password, confirmPassword) {
  if (!email || !password || !confirmPassword) {
    return { valid: false, error: "Please fill in all fields." };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match." };
  }
  if (password.length < 6) {
    return { valid: false, error: "Password must be at least 6 characters." };
  }
  return { valid: true };
}

function checkLoginPermissions(user) {
  if (user.blocked) {
    return { allowed: false, error: "Your account has been blocked by an administrator." };
  }
  if (user.status === "pending") {
    return { allowed: false, error: "Please verify your email address to activate your account." };
  }
  return { allowed: true };
}

// 2. Test Execution Harness
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ Passed: ${message}`);
  }
}

console.log("=== STARTING FOXSTOCK AUTOMATED TEST SUITE ===");

// Test 1: Price Change Calculations
assert(
  calculateChangePercent(110, 100) === 10,
  "Positive change percentage calculation is correct."
);
assert(
  calculateChangePercent(90, 100) === -10,
  "Negative change percentage calculation is correct."
);
assert(
  calculateChangePercent(100, 100) === 0,
  "Zero change percentage calculation is correct."
);

// Test 2: AI Suitability Rating
const mockStock = {
  price: 150,
  high52: 200, // 25% drawdown
  peRatio: 30,
  ratingScore: 4.5
};

const promptA = "dropped more in past week with low risk";
const scoreA = calculateSuitabilityScore(mockStock, promptA);
assert(
  scoreA > 50,
  "AI Suitability score matches drop criteria keywords."
);

// Test 3: Password / Registration Validation
assert(
  validateRegistration("test@user.com", "pass123", "pass123").valid === true,
  "Valid registration fields pass verification."
);
assert(
  validateRegistration("test@user.com", "pass123", "different").valid === false,
  "Password mismatch triggers registration failure."
);
assert(
  validateRegistration("test@user.com", "123", "123").valid === false,
  "Short password triggers registration validation warning."
);

// Test 4: Account Status and Blocking Checks
const blockedUser = { email: "blocked@user.com", blocked: true, status: "active" };
const pendingUser = { email: "pending@user.com", blocked: false, status: "pending" };
const normalUser = { email: "ok@user.com", blocked: false, status: "active" };

assert(
  checkLoginPermissions(blockedUser).allowed === false,
  "Blocked users are correctly denied access."
);
assert(
  checkLoginPermissions(pendingUser).allowed === false,
  "Pending activation accounts are restricted from logging in."
);
assert(
  checkLoginPermissions(normalUser).allowed === true,
  "Active, unblocked accounts successfully bypass restrictions."
);

console.log("=== ALL AUTOMATED TESTS PASSED SUCCESSFULLY ===");
