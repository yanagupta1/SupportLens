"use client";

import { useState } from "react";
import { AnalysisResult, TicketCluster } from "./types";

const SAMPLE_TICKETS = `Zoom recordings aren't showing up after meetings end. Checked integrations page, everything looks connected but still nothing.

The action items from yesterday's standup are completely wrong - it attributed tasks to the wrong people

Can't figure out how to share meeting notes with someone outside our org. Is there a public link option?

My calendar stopped syncing about 2 days ago. Meetings aren't being picked up automatically anymore.

Same issue as before - Zoom integration shows connected but recordings not appearing. This has been happening for 3 days.

Action items are getting assigned to the wrong people again. Really messing up our workflow.

How do I export all my meeting notes to a CSV or PDF? Need this for a quarterly review.

The search isn't finding meetings from last month even though I can see them in my history

Calendar sync is broken - had 3 meetings today that weren't captured at all

Is there a way to customize the action item format? We use a specific template for our team.

Zoom issue still not fixed. This is critical for us, we rely on recordings for compliance.

Can I connect a second calendar? I have work and personal Google calendars both need syncing`.trim();

const priorityConfig = {
  critical: { color: "bg-red-500", text: "text-red-400", label: "CRITICAL", ring: "ring-red-500/30" },
  high: { color: "bg-orange-500", text: "text-orange-400", label: "HIGH", ring: "ring-orange-500/30" },
  medium: { color: "bg-yellow-500", text: "text-yellow-400", label: "MED", ring: "ring-yellow-500/30" },
  low: { color: "bg-green-500", text: "text-green-400", label: "LOW", ring: "ring-green-500/30" },
};

function HealthGauge({ score }: { score: number }) {
  const color = score > 70 ? "#22c55e" : score > 40 ? "#f59e0b" : "#ef4444";
  const label = score > 70 ? "Healthy" : score > 40 ? "Stressed" : "On Fire";
  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="monospace">{score}</text>
        <text x="50" y="60" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">/ 100</text>
      </svg>
      <span className="text-xs font-mono" style={{ color }}>{label}</span>
    </div>
  );
}

function ClusterCard({ cluster, isSelected, onClick }: {
  cluster: TicketCluster;
  isSelected: boolean;
  onClick: () => void;
}) {
  const p = priorityConfig[cluster.priority];
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 ${
        isSelected
          ? `bg-zinc-800 border-zinc-500 ring-1 ${p.ring}`
          : "bg-zinc-900 border-zinc-800 hover:border-zinc-600"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">{cluster.emoji}</span>
          <span className="text-sm font-semibold text-white font-mono">{cluster.category}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono px-2 py-0.5 rounded ${p.text} bg-zinc-800`}>
            {p.label}
          </span>
          <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-2 py-0.5 rounded">
            x{cluster.count}
          </span>
        </div>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{cluster.pattern_summary}</p>
      {cluster.suggest_doc && (
        <div className="mt-2 flex items-center gap-1">
          <span className="text-xs text-blue-400 font-mono">doc needed</span>
        </div>
      )}
    </button>
  );
}

function DetailPanel({ cluster }: { cluster: TicketCluster }) {
  const [copied, setCopied] = useState(false);
  const p = priorityConfig[cluster.priority];

  const copy = () => {
    navigator.clipboard.writeText(cluster.draft_response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">{cluster.emoji}</span>
        <div>
          <h2 className="text-white font-mono font-bold text-lg">{cluster.category}</h2>
          <span className={`text-xs font-mono ${p.text}`}>{cluster.priority.toUpperCase()} PRIORITY · {cluster.count} tickets</span>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
        <p className="text-xs font-mono text-zinc-500 mb-2 uppercase tracking-wider">Pattern</p>
        <p className="text-sm text-zinc-300 leading-relaxed">{cluster.pattern_summary}</p>
      </div>

      <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 flex-1">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Draft Response</p>
          <button
            onClick={copy}
            className="text-xs font-mono text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
          >
            {copied ? "copied" : "copy"}
          </button>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">{cluster.draft_response}</p>
      </div>

      {cluster.suggest_doc && (
        <div className="bg-blue-950/40 rounded-lg p-4 border border-blue-900/50">
          <p className="text-xs font-mono text-blue-400 mb-1 uppercase tracking-wider">Suggested Doc</p>
          <p className="text-sm text-blue-300 font-medium">{cluster.doc_title}</p>
          <p className="text-xs text-blue-400/70 mt-1">Writing this doc would deflect ~{cluster.count} future tickets</p>
        </div>
      )}

      <div className="bg-zinc-900 rounded-lg p-4 border border-zinc-800">
        <p className="text-xs font-mono text-zinc-500 mb-3 uppercase tracking-wider">Tickets in cluster</p>
        <div className="flex flex-col gap-2">
          {cluster.tickets.map((t, i) => (
            <div key={i} className="text-xs text-zinc-400 bg-zinc-800/50 rounded p-2 leading-relaxed">
              &ldquo;{t}&rdquo;
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [input, setInput] = useState(SAMPLE_TICKETS);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<number>(0);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    const lines = input.split(/\n\n+/).map((t, i) => ({
      id: String(i),
      text: t.trim(),
    })).filter(t => t.text.length > 0);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickets: lines }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      setSelected(0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&display=swap');`}</style>

      <div className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-semibold tracking-wider text-white">SUPPORTLENS</span>
          <span className="text-xs text-zinc-600">/ ticket intelligence</span>
        </div>
        <span className="text-xs text-zinc-600">by Yana Gupta</span>
      </div>

      {!result ? (
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
              Paste your support queue.
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Separate tickets with a blank line. SupportLens will classify, cluster, and draft responses so you can fix patterns, not just tickets.
            </p>
          </div>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={16}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-sm text-zinc-300 leading-relaxed resize-none focus:outline-none focus:border-zinc-600 transition-colors"
            placeholder={"Customer ticket 1...\n\nCustomer ticket 2...\n\nCustomer ticket 3..."}
          />

          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-zinc-600">
              {input.split(/\n\n+/).filter(t => t.trim()).length} tickets detected
            </span>
            <button
              onClick={analyze}
              disabled={loading || !input.trim()}
              className="px-6 py-2.5 bg-white text-zinc-950 text-sm font-bold rounded-lg hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 tracking-wide"
            >
              {loading ? "analyzing..." : "analyze queue ->"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-950/50 border border-red-900 rounded-lg text-xs text-red-400">
              {error}
            </div>
          )}

          {loading && (
            <div className="mt-8 flex flex-col items-center gap-3 text-zinc-600">
              <div className="flex gap-1">
                {[0,1,2].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <span className="text-xs">clustering tickets · detecting patterns · drafting responses</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex h-[calc(100vh-57px)]">
          <div className="w-80 border-r border-zinc-800 flex flex-col">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">Queue health</p>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-[140px]">{result.top_issue}</p>
              </div>
              <HealthGauge score={result.health_score} />
            </div>

            <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-500">{result.total_tickets} tickets · {result.clusters.length} clusters</span>
              <button
                onClick={() => setResult(null)}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                new batch
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {result.clusters.map((cluster, i) => (
                <ClusterCard
                  key={i}
                  cluster={cluster}
                  isSelected={selected === i}
                  onClick={() => setSelected(i)}
                />
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {result.clusters[selected] && (
              <DetailPanel cluster={result.clusters[selected]} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
