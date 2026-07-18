// Mock Stock Data Layer for FoxStock

export const INITIAL_STOCKS = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    sector: "Technology",
    price: 188.32,
    change: 1.45,
    changePercent: 0.78,
    peRatio: 30.2,
    forwardPe: 27.5,
    low52: 164.08,
    high52: 199.62,
    analystTarget: 210.00,
    consensus: "Buy",
    ratingScore: 4.2,
    quarterlyRevenue: [
      { quarter: "Q2 25", revenue: 90.75 },
      { quarter: "Q3 25", revenue: 85.78 },
      { quarter: "Q4 25", revenue: 89.50 },
      { quarter: "Q1 26", revenue: 119.58 }
    ],
    history: [181.2, 180.5, 182.3, 181.9, 183.0, 182.1, 184.5, 183.9, 182.8, 184.2, 185.0, 184.1, 186.2, 185.5, 184.8, 185.9, 186.4, 187.0, 185.9, 186.5, 187.2, 188.0, 187.5, 188.9, 189.2, 187.8, 186.9, 187.5, 188.1, 188.32],
    aiSummary: "Apple's Services revenue continues to grow at double digits, offset by minor slowdowns in hardware cycles. The AI initiatives (Apple Intelligence) present a strong multi-year upgrade catalyst."
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    sector: "Technology",
    price: 421.90,
    change: -3.12,
    changePercent: -0.73,
    peRatio: 35.8,
    forwardPe: 31.2,
    low52: 315.18,
    high52: 430.82,
    analystTarget: 450.00,
    consensus: "Strong Buy",
    ratingScore: 4.8,
    quarterlyRevenue: [
      { quarter: "Q2 25", revenue: 62.02 },
      { quarter: "Q3 25", revenue: 61.86 },
      { quarter: "Q4 25", revenue: 64.73 },
      { quarter: "Q1 26", revenue: 65.60 }
    ],
    history: [412.5, 415.2, 413.9, 416.8, 418.0, 420.5, 419.1, 421.0, 422.3, 420.9, 423.5, 425.0, 424.1, 426.0, 428.2, 427.5, 425.9, 427.0, 429.3, 428.5, 430.1, 428.9, 426.2, 424.8, 423.5, 425.0, 424.1, 422.9, 423.0, 421.9],
    aiSummary: "Azure Cloud continues to gain market share driven by generative AI integrations. Commercial booking growth is solid, suggesting sustained enterprise software spend."
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    sector: "Automotive",
    price: 177.46,
    change: 5.21,
    changePercent: 3.02,
    peRatio: 45.1,
    forwardPe: 38.4,
    low52: 138.80,
    high52: 299.29,
    analystTarget: 195.00,
    consensus: "Hold",
    ratingScore: 3.1,
    quarterlyRevenue: [
      { quarter: "Q2 25", revenue: 21.30 },
      { quarter: "Q3 25", revenue: 23.35 },
      { quarter: "Q4 25", revenue: 25.17 },
      { quarter: "Q1 26", revenue: 21.30 }
    ],
    history: [168.5, 170.2, 171.1, 169.0, 167.5, 165.2, 163.0, 165.9, 168.0, 169.5, 172.0, 170.5, 173.1, 172.9, 171.0, 173.8, 174.5, 173.9, 172.1, 175.0, 176.5, 175.2, 173.9, 172.5, 171.0, 173.2, 174.8, 175.9, 176.2, 177.46],
    aiSummary: "Tesla faces headwinds from Chinese EV competition and margin pressures. Robotaxi expectations and FSD advancements offer high-beta long-term growth potential."
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corp.",
    sector: "Semiconductors",
    price: 875.12,
    change: 18.54,
    changePercent: 2.16,
    peRatio: 72.4,
    forwardPe: 34.8,
    low52: 280.12,
    high52: 974.00,
    analystTarget: 1000.00,
    consensus: "Strong Buy",
    ratingScore: 4.9,
    quarterlyRevenue: [
      { quarter: "Q2 25", revenue: 22.10 },
      { quarter: "Q3 25", revenue: 26.04 },
      { quarter: "Q4 25", revenue: 35.08 },
      { quarter: "Q1 26", revenue: 38.50 }
    ],
    history: [820.5, 831.0, 825.2, 838.0, 842.5, 839.1, 845.0, 852.3, 849.0, 855.5, 860.2, 858.0, 863.5, 869.0, 866.5, 872.0, 875.9, 871.2, 878.0, 882.5, 880.0, 884.2, 888.5, 885.0, 879.9, 874.2, 871.0, 873.5, 872.1, 875.12],
    aiSummary: "Unprecedented demand for Hopper and Blackwell GPU architectures drives massive datacenter revenues. Highly efficient margins position NVDA as the premium AI infrastructure leader."
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    sector: "Technology",
    price: 173.96,
    change: 0.88,
    changePercent: 0.51,
    peRatio: 26.4,
    forwardPe: 22.1,
    low52: 115.35,
    high52: 179.22,
    analystTarget: 190.00,
    consensus: "Buy",
    ratingScore: 4.4,
    quarterlyRevenue: [
      { quarter: "Q2 25", revenue: 80.54 },
      { quarter: "Q3 25", revenue: 76.69 },
      { quarter: "Q4 25", revenue: 86.31 },
      { quarter: "Q1 26", revenue: 88.27 }
    ],
    history: [165.2, 166.0, 165.8, 167.1, 168.0, 167.5, 169.1, 168.9, 169.5, 170.2, 171.5, 170.8, 172.0, 171.9, 171.1, 172.8, 173.2, 174.0, 173.1, 173.9, 174.5, 175.2, 174.8, 176.0, 175.5, 174.2, 173.0, 173.8, 174.1, 173.96],
    aiSummary: "Search advertising remains resilient. Google Cloud is accelerating, and Gemini AI integration across workspaces is expected to bolster search capabilities and enterprise engagement."
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    sector: "Consumer Cyclical",
    price: 180.05,
    change: -1.20,
    changePercent: -0.66,
    peRatio: 41.5,
    forwardPe: 33.2,
    low52: 118.35,
    high52: 189.77,
    analystTarget: 215.00,
    consensus: "Strong Buy",
    ratingScore: 4.7,
    quarterlyRevenue: [
      { quarter: "Q2 25", revenue: 143.30 },
      { quarter: "Q3 25", revenue: 147.98 },
      { quarter: "Q4 25", revenue: 170.00 },
      { quarter: "Q1 26", revenue: 172.50 }
    ],
    history: [172.1, 173.5, 172.9, 174.8, 175.2, 174.9, 176.1, 177.0, 176.5, 178.2, 179.0, 178.5, 179.9, 180.2, 179.5, 181.1, 181.8, 182.5, 181.9, 182.4, 183.1, 182.9, 181.5, 180.2, 179.0, 180.5, 181.1, 180.9, 180.5, 180.05],
    aiSummary: "AWS stabilization and AI service adoption are key growth drivers. Retail margin expansion through logistics optimization and rising ad revenues provide stable cash flow."
  },
  {
    symbol: "NFLX",
    name: "Netflix Inc.",
    sector: "Communication Services",
    price: 610.50,
    change: -8.45,
    changePercent: -1.37,
    peRatio: 38.2,
    forwardPe: 32.0,
    low52: 410.02,
    high52: 639.00,
    analystTarget: 660.00,
    consensus: "Buy",
    ratingScore: 4.1,
    quarterlyRevenue: [
      { quarter: "Q2 25", revenue: 9.37 },
      { quarter: "Q3 25", revenue: 9.56 },
      { quarter: "Q4 25", revenue: 9.83 },
      { quarter: "Q1 26", revenue: 10.10 }
    ],
    history: [595.0, 598.2, 597.5, 601.0, 604.2, 602.8, 605.0, 608.1, 607.0, 609.5, 612.0, 610.8, 614.0, 616.5, 615.1, 618.0, 619.5, 621.0, 619.2, 620.5, 622.0, 621.1, 619.0, 617.5, 615.0, 617.2, 618.9, 616.0, 613.5, 610.5],
    aiSummary: "Ad-supported tier growth and crackdowns on password sharing have driven user additions. The shift towards live sports streaming (NFL, WWE) should increase engagement and ad rates."
  },
  {
    symbol: "META",
    name: "Meta Platforms Inc.",
    sector: "Communication Services",
    price: 475.22,
    change: 12.10,
    changePercent: 2.61,
    peRatio: 28.9,
    forwardPe: 23.5,
    low52: 288.90,
    high52: 531.49,
    analystTarget: 525.00,
    consensus: "Buy",
    ratingScore: 4.5,
    quarterlyRevenue: [
      { quarter: "Q2 25", revenue: 36.46 },
      { quarter: "Q3 25", revenue: 34.15 },
      { quarter: "Q4 25", revenue: 40.11 },
      { quarter: "Q1 26", revenue: 41.50 }
    ],
    history: [448.2, 452.1, 450.5, 455.0, 458.2, 456.9, 460.1, 463.0, 461.5, 464.8, 467.0, 465.9, 469.1, 471.5, 470.2, 473.0, 475.8, 474.1, 472.9, 475.0, 477.5, 476.2, 474.0, 472.5, 470.0, 472.1, 474.9, 473.5, 474.1, 475.22],
    aiSummary: "AI-driven feed recommendations and smart ad bidding tools are paying off, pushing ad revenues higher. High capital expenditure in AI and metaverse remains a long-term watchpoint."
  }
];

export const MOCK_INDICES = [
  { symbol: "S&P 500", name: "S&P 500 Index", price: 5432.12, change: 35.80, changePercent: 0.66 },
  { symbol: "NASDAQ", name: "Nasdaq Composite", price: 16845.56, change: 189.44, changePercent: 1.14 },
  { symbol: "DOW JONES", name: "Dow Jones Indus.", price: 39512.44, change: -45.10, changePercent: -0.11 }
];

export const AVAILABLE_INDICATORS = [
  { id: "peRatio", label: "P/E Ratio", default: true, category: "Valuation" },
  { id: "forwardPe", label: "Forward P/E", default: true, category: "Valuation" },
  { id: "range52", label: "52-Week Range", default: true, category: "Price Metrics" },
  { id: "quarterlyRevenue", label: "Quarterly Revenue", default: true, category: "Financials" },
  { id: "sparkline", label: "Price Evolution Chart", default: true, category: "Price Metrics" },
  { id: "analystTarget", label: "Analyst Target & Rating", default: true, category: "Consensus" }
];
