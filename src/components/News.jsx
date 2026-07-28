import React from "react";
import { Newspaper, TrendingUp, TrendingDown, ArrowUpRight, Clock } from "lucide-react";

// Mock news database
const MOCK_NEWS = [
  {
    id: "1",
    title: "Apple Intelligence Ramps Up Production with Supplier Partners",
    source: "Bloomberg",
    time: "1 hour ago",
    sentiment: "positive",
    relatedStocks: ["AAPL"],
    summary: "Apple is accelerating production orders for its next-generation silicon chips. Suppliers in Taiwan report significant volume increases for A18 chip packages, indicating high internal projections for Apple Intelligence devices."
  },
  {
    id: "2",
    title: "NVIDIA Blackwell B200 Servers Show Increased Cloud Demand",
    source: "Reuters",
    time: "2 hours ago",
    sentiment: "positive",
    relatedStocks: ["NVDA"],
    summary: "Major hyper-scalers (Microsoft, AWS, Meta) have expanded order books for NVIDIA's Blackwell graphics architecture. Yield concerns have resolved, clearing the path for volume shipping next quarter."
  },
  {
    id: "3",
    title: "Tesla Cybercab Testing Spotted in San Francisco Metro Area",
    source: "Electrek",
    time: "4 hours ago",
    sentiment: "positive",
    relatedStocks: ["TSLA"],
    summary: "Unmarked autonomous Cybercabs were filmed navigating heavy downtown traffic. Analysts suggest full operational robotaxi rollouts could begin ahead of previous estimates."
  },
  {
    id: "4",
    title: "Microsoft Cloud Earnings Lifted by Copilot Pro Subscription Uptake",
    source: "Wall Street Journal",
    time: "5 hours ago",
    sentiment: "positive",
    relatedStocks: ["MSFT"],
    summary: "Microsoft reported a surge in enterprise commercial seats for Office 365 Copilot. Azure cloud spending grew 29% YoY, outperforming expectations."
  },
  {
    id: "5",
    title: "Meta Platforms Invests in Low-Power AI ASIC Prototypes",
    source: "TechCrunch",
    time: "6 hours ago",
    sentiment: "neutral",
    relatedStocks: ["META"],
    summary: "Meta is partnering with custom silicon designers to produce proprietary processing chips. The initiative aims to reduce Meta's long-term hardware dependency on third-party GPU vendors."
  },
  {
    id: "6",
    title: "Regulators Raise Concerns Over Google's Default Search Contract Deals",
    source: "Financial Times",
    time: "8 hours ago",
    sentiment: "negative",
    relatedStocks: ["GOOGL"],
    summary: "Antitrust watchdogs have signaled potential blockades against Google's multi-billion dollar agreements to remain the default search engine on premium mobile operating systems."
  },
  {
    id: "7",
    title: "Amazon Logistics Rollout Cuts Delivery Costs by 12% in EU",
    source: "CNBC",
    time: "12 hours ago",
    sentiment: "positive",
    relatedStocks: ["AMZN"],
    summary: "Amazon's localized distribution hubs have optimized shipping routes, resulting in significant savings and faster shipping cycles across Western Europe."
  },
  {
    id: "8",
    title: "Netflix Ad-Supported Tier Reaches 40 Million Active Viewers",
    source: "Variety",
    time: "14 hours ago",
    sentiment: "positive",
    relatedStocks: ["NFLX"],
    summary: "Netflix announced that its lower-priced advertising subscription tier has gained massive traction, offering higher ad-load spots and boosting overall revenue visibility."
  },
  {
    id: "9",
    title: "JPMorgan Expansion of Digital Asset Unit Shows Institution Momentum",
    source: "Bloomberg",
    time: "1 day ago",
    sentiment: "positive",
    relatedStocks: ["JPM"],
    summary: "JPMorgan Chase is hiring additional blockchain developers for its Onyx platform, aiming to automate global payment clearings and collateral management."
  },
  {
    id: "10",
    title: "Visa Faces Competition in Instant Bank Transfer Payment Networks",
    source: "Reuters",
    time: "1 day ago",
    sentiment: "negative",
    relatedStocks: ["V"],
    summary: "New European regulations promoting instant direct account-to-account bank transfers threaten Visa's traditional debit card swipe fee models."
  },
  {
    id: "11",
    title: "Disney Parks Attendance Slows Due to Inflation Pressures",
    source: "CNBC",
    time: "1 day ago",
    sentiment: "negative",
    relatedStocks: ["DIS"],
    summary: "Disney experienced a mild decline in average visitor numbers in its domestic theme parks during the recent quarter, blamed on elevated consumer price concerns."
  },
  {
    id: "12",
    title: "Walmart Launches New Robotic Fulfilment Facilities in East Coast",
    source: "Wall Street Journal",
    time: "1 day ago",
    sentiment: "positive",
    relatedStocks: ["WMT"],
    summary: "Walmart has opened advanced automated logistics hubs to accelerate grocery processing, aiming to expand same-day delivery coverage zones."
  },
  {
    id: "13",
    title: "Johnson & Johnson Drug Trial for Psoriasis Shows Strong Phase 3 Data",
    source: "BioPharma Dive",
    time: "2 days ago",
    sentiment: "positive",
    relatedStocks: ["JNJ"],
    summary: "JNJ's next-generation targeted therapeutic antibody showed high efficacy and low side effects in final trials, paving the way for FDA review applications."
  },
  {
    id: "14",
    title: "Procter & Gamble Warns of Elevated Raw Material Supply Cost Inflation",
    source: "Bloomberg",
    time: "2 days ago",
    sentiment: "negative",
    relatedStocks: ["PG"],
    summary: "PG reported rising input expenses for packaging and chemical shipping, warning it might trigger additional pricing shifts for retail soaps and detergents."
  },
  {
    id: "15",
    title: "AMD RDNA 4 GPU Architecture Launch Scheduled for Next Quarter",
    source: "Tom's Hardware",
    time: "2 days ago",
    sentiment: "positive",
    relatedStocks: ["AMD"],
    summary: "Advanced Micro Devices confirmed that its next generation of mid-range gaming hardware will launch soon, focusing on advanced ray tracing components."
  },
  {
    id: "16",
    title: "Intel Pauses Magdeburg Fab Build Due to Spending Reductions",
    source: "Reuters",
    time: "3 days ago",
    sentiment: "negative",
    relatedStocks: ["INTC"],
    summary: "Intel has postponed plans to build its multi-billion dollar manufacturing plant in Germany, seeking to conserve cash flow amidst server market share losses."
  },
  {
    id: "17",
    title: "Qualcomm Snapdragon X Elite PC Chip Wins Additional Laptop Contracts",
    source: "AnandTech",
    time: "3 days ago",
    sentiment: "positive",
    relatedStocks: ["QCOM"],
    summary: "Qualcomm's ARM-based laptop processors have been registered in upcoming corporate fleets from Dell, Lenovo, and HP, asserting Windows-on-ARM feasibility."
  },
  {
    id: "18",
    title: "Nike Retail Markdowns Impact Wholesale Revenue Growth Guidance",
    source: "Financial Times",
    time: "4 days ago",
    sentiment: "negative",
    relatedStocks: ["NKE"],
    summary: "Nike announced wider discount promos to clear excess product backlogs from outlet channels, contributing to lower operating margins forecast outlooks."
  },
  {
    id: "19",
    title: "Coca-Cola Expansion of Zero Sugar Flavors Boosts APAC Unit Volumes",
    source: "Variety",
    time: "4 days ago",
    sentiment: "positive",
    relatedStocks: ["KO"],
    summary: "The Coca-Cola Company reported double-digit sales improvements for its sugar-free lineups in India and Japan markets, highlighting effective thematic targeting."
  },
  {
    id: "20",
    title: "Costco Gold Bar Sales Drive Growth But Squeeze Gross Margins",
    source: "CNBC",
    time: "5 days ago",
    sentiment: "neutral",
    relatedStocks: ["COST"],
    summary: "Costco's expansion into precious metals sales has created strong member traffic, though the low markups of bullion sales slightly compressed general gross margins."
  }
];

export default function News({ portfolio }) {
  const portfolioSymbols = (portfolio || []).map((p) => p.symbol.toUpperCase());

  // Filter news articles: match if related to stocks in portfolio
  // If portfolio is empty, show general market news
  let filteredNews = MOCK_NEWS.filter((item) =>
    item.relatedStocks.some((symbol) => portfolioSymbols.includes(symbol))
  );

  const isFiltered = filteredNews.length > 0;

  // Fallback to general market news if no matching portfolio news, capped at 10 items
  if (filteredNews.length < 10) {
    const extraNews = MOCK_NEWS.filter(
      (item) => !filteredNews.some((fn) => fn.id === item.id)
    );
    filteredNews = [...filteredNews, ...extraNews].slice(0, 10);
  } else {
    filteredNews = filteredNews.slice(0, 10);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", padding: "24px 0", textAlign: "left" }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "2rem" }}>Holdings Market News</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {isFiltered 
            ? "Showing the latest news articles filtered by stocks inside your active Portfolio."
            : "No active portfolio holdings match the latest feeds. Showing general market coverage."}
        </p>
      </div>

      {/* News Feed List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {filteredNews.map((item) => {
          const isPos = item.sentiment === "positive";
          const isNeg = item.sentiment === "negative";

          return (
            <div 
              key={item.id} 
              className="glass-panel" 
              style={{ 
                padding: "24px", 
                borderLeft: isPos 
                  ? "4px solid var(--color-success)" 
                  : isNeg 
                    ? "4px solid var(--color-danger)" 
                    : "4px solid var(--border-glass)",
                transition: "transform 0.2s"
              }}
            >
              {/* Meta row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ 
                    fontSize: "0.75rem", 
                    color: "var(--color-primary)", 
                    fontWeight: "700",
                    textTransform: "uppercase",
                    backgroundColor: "rgba(139, 92, 246, 0.1)",
                    padding: "3px 8px",
                    borderRadius: "4px"
                  }}>
                    {item.source}
                  </span>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    <Clock size={12} />
                    <span>{item.time}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "6px" }}>
                  {item.relatedStocks.map((symbol) => (
                    <span 
                      key={symbol} 
                      style={{ 
                        fontSize: "0.75rem", 
                        fontWeight: "700", 
                        backgroundColor: "rgba(255,255,255,0.05)", 
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        border: "1px solid var(--border-glass)"
                      }}
                    >
                      {symbol}
                    </span>
                  ))}
                  
                  {/* Sentiment Badge */}
                  <span style={{ 
                    fontSize: "0.75rem", 
                    fontWeight: "600",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor: isPos 
                      ? "rgba(16, 185, 129, 0.1)" 
                      : isNeg 
                        ? "rgba(239, 68, 68, 0.1)" 
                        : "rgba(255,255,255,0.05)",
                    color: isPos 
                      ? "var(--color-success)" 
                      : isNeg 
                        ? "var(--color-danger)" 
                        : "var(--text-secondary)"
                  }}>
                    {item.sentiment.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Title & summary */}
              <h3 style={{ fontSize: "1.15rem", fontWeight: "600", marginBottom: "8px", color: "#fff" }}>
                {item.title}
              </h3>
              
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.6" }}>
                {item.summary}
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
}
