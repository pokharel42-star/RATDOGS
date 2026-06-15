"use client";

import { useEffect, useState } from "react";
import {
  PARTICIPANTS,
  GROUPS,
  GROUP_COLORS,
  POT_LABELS,
  POT_COLORS,
  type Participant,
  type Team,
} from "./data";
import { MATCHES } from "./schedule";
import { resultKey, type LiveResult } from "./results";

type ResultMap = Map<string, LiveResult>;

/** look up a result regardless of which side ESPN lists as home */
function findResult(results: ResultMap, home: string, away: string) {
  const direct = results.get(resultKey(home, away));
  if (direct) return direct;
  const flipped = results.get(resultKey(away, home));
  if (!flipped) return undefined;
  return {
    ...flipped,
    home,
    away,
    homeScore: flipped.awayScore,
    awayScore: flipped.homeScore,
  };
}

/** team name -> { team, owner } for fast lookup from the schedule */
const TEAM_INDEX = new Map(
  PARTICIPANTS.flatMap((p) => p.teams.map((t) => [t.name, { team: t, owner: p }] as const)),
);

function Flag({ team, small }: { team: Team; small?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w40/${team.code}.png`}
      alt={`${team.name} flag`}
      width={small ? 20 : 28}
      height={small ? 15 : 21}
      loading="lazy"
      className={`shrink-0 rounded-[3px] object-cover shadow ring-1 ring-white/20 ${
        small ? "h-[15px] w-5" : "h-[21px] w-7"
      }`}
    />
  );
}

/** power-level badge: pot 1 (Lead Team) is strongest, pot 6 (Longshot) weakest */
function PotBadge({ pot, className = "" }: { pot: number; className?: string }) {
  const tierStyles: Record<number, { badge: string; marker: string }> = {
    1: {
      badge: "border-amber-300/60 bg-amber-400/20 text-amber-100",
      marker: "bg-amber-200 text-amber-950",
    },
    2: {
      badge: "border-sky-300/60 bg-sky-400/20 text-sky-100",
      marker: "bg-sky-200 text-sky-950",
    },
    3: {
      badge: "border-emerald-300/60 bg-emerald-400/20 text-emerald-100",
      marker: "bg-emerald-200 text-emerald-950",
    },
    4: {
      badge: "border-violet-300/60 bg-violet-400/20 text-violet-100",
      marker: "bg-violet-200 text-violet-950",
    },
    5: {
      badge: "border-orange-300/60 bg-orange-400/20 text-orange-100",
      marker: "bg-orange-200 text-orange-950",
    },
    6: {
      badge: "border-rose-300/60 bg-rose-400/20 text-rose-100",
      marker: "bg-rose-200 text-rose-950",
    },
  };
  const style = tierStyles[pot];

  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase ring-1 ring-white/10 ${style.badge} ${className}`}
    >
      <span className={`rounded-sm px-1 tabular-nums ${style.marker}`}>
        T{pot}
      </span>
      {POT_LABELS[pot]}
    </span>
  );
}

/** flag bleeding in from one edge of a card, full-height so the whole flag shows */
function FlagBackdrop({ code, side }: { code: string; side: "left" | "right" }) {
  const fade = side === "left" ? "to right" : "to left";
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-y-0 z-0 aspect-3/2 h-full opacity-25 mix-blend-soft-light sm:opacity-55 sm:mix-blend-normal ${
        side === "left" ? "left-0" : "right-0"
      }`}
      style={{
        backgroundImage: `url(https://flagcdn.com/w320/${code}.png)`,
        // natural 3:2 flag at card height — undistorted and uniform for every
        // country — then dissolved inward by the mask for a soft gradient edge
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        WebkitMaskImage: `linear-gradient(${fade}, black, transparent)`,
        maskImage: `linear-gradient(${fade}, black, transparent)`,
      }}
    />
  );
}

type View = "scoreboard" | "upsets" | "squads" | "groups" | "schedule";
const VIEW_STORAGE_KEY = "diwacup:last-view";
const VIEWS: View[] = ["scoreboard", "schedule", "squads", "upsets", "groups"];

export default function Home() {
  const [view, setView] = useState<View>("scoreboard");
  const [selected, setSelected] = useState<string[]>([]);
  const [results, setResults] = useState<ResultMap>(new Map());

  useEffect(() => {
    const storedView = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (VIEWS.includes(storedView as View)) {
      setView(storedView as View);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch("/api/results");
        const data: { results: LiveResult[] } = await res.json();
        if (alive && Array.isArray(data.results)) {
          setResults(
            new Map(data.results.map((r) => [resultKey(r.home, r.away), r])),
          );
        }
      } catch {
        // keep last known results; retry on next tick
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  const toggleSelect = (name: string) =>
    setSelected((cur) =>
      cur.includes(name) ? cur.filter((n) => n !== name) : [...cur, name],
    );
  const selectView = (nextView: View) => setView(nextView);

  return (
    <main className="flex-1 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Hero />

        {/* View switcher */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <div className="flex flex-wrap justify-center rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur">
            <TabButton
              active={view === "scoreboard"}
              onClick={() => selectView("scoreboard")}
            >
              🏆 Scoreboard
            </TabButton>
            <TabButton
              active={view === "schedule"}
              onClick={() => selectView("schedule")}
            >
              📅 Schedule
            </TabButton>
            <TabButton
              active={view === "squads"}
              onClick={() => selectView("squads")}
            >
              🧑‍✈️ Squads
            </TabButton>
            <TabButton
              active={view === "upsets"}
              onClick={() => selectView("upsets")}
            >
              🪓 Upsets
            </TabButton>
            <TabButton
              active={view === "groups"}
              onClick={() => selectView("groups")}
            >
              🗺️ Group Map
            </TabButton>
          </div>
        </div>

        {/* Participant filter chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {PARTICIPANTS.map((p) => (
            <button
              key={p.name}
              onClick={() => toggleSelect(p.name)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition-all ${
                selected.includes(p.name)
                  ? "border-white/40 bg-white/15 text-white shadow-lg scale-105"
                  : selected.length > 0
                    ? "border-white/10 bg-white/5 text-white/40 hover:text-white/70"
                    : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{p.emoji}</span>
              {p.name}
            </button>
          ))}
          {selected.length > 0 && (
            <button
              onClick={() => setSelected([])}
              className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-white/50 hover:text-white"
            >
              ✕ clear
            </button>
          )}
        </div>

        {view === "scoreboard" ? (
          <ScoreboardView results={results} selected={selected} />
        ) : view === "upsets" ? (
          <UpsetsView
            results={results}
            selected={selected}
            onManagerToggle={toggleSelect}
          />
        ) : view === "squads" ? (
          <SquadsView selected={selected} />
        ) : view === "groups" ? (
          <GroupsView selected={selected} />
        ) : (
          <ScheduleView selected={selected} results={results} />
        )}

        <footer className="mt-16 pb-8 text-center text-sm text-white/40">
          <p className="text-base">
            Every win = a clean{" "}
            <span className="font-bold text-emerald-300">3 points</span> and
            draw = <span className="font-bold text-amber-300">1 point</span>
          </p>
        </footer>
      </div>
    </main>
  );
}

function Hero() {
  return (
    <header className="text-center">
      <h1 className="text-balance text-4xl font-black text-white sm:text-6xl">
        Diwa Cup
      </h1>
    </header>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
        active
          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg"
          : "text-white/60 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function SquadsView({ selected }: { selected: string[] }) {
  const visible = PARTICIPANTS.filter(
    (p) => selected.length === 0 || selected.includes(p.name),
  );
  return (
    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {visible.map((p, i) => (
        <SquadCard key={p.name} participant={p} index={i} />
      ))}
    </div>
  );
}

function SquadCard({
  participant: p,
  index,
}: {
  participant: Participant;
  index: number;
}) {
  return (
    <div
      style={{ animationDelay: `${index * 70}ms` }}
      className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur"
    >
      <div
        className={`flex items-center gap-3 rounded-t-2xl bg-gradient-to-r ${p.gradient} px-4 py-3`}
      >
        <span className="text-2xl drop-shadow">{p.emoji}</span>
        <span className="text-lg font-black tracking-wide text-white drop-shadow">
          {p.name}
        </span>
        <span className="ml-auto rounded-full bg-black/25 px-2 py-0.5 text-xs font-bold text-white/90">
          {p.teams
            .map((t) => t.group)
            .sort()
            .join(" · ")}
        </span>
      </div>
      <ul className="divide-y divide-white/5 px-2 py-1">
        {p.teams.map((t) => (
          <li key={t.name} className="flex items-center gap-2.5 px-2 py-2.5">
            <Flag team={t} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90">
              {t.name}
            </span>
            <PotBadge pot={t.pot} className="tracking-wide" />
            <span
              className={`rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${GROUP_COLORS[t.group]}`}
            >
              {t.group}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ManagerRow = {
  p: Participant;
  pts: number;
  w: number;
  d: number;
  l: number;
  played: number;
  /** team name -> points earned */
  teamPts: Map<string, number>;
  /** team name -> games played */
  teamPlayed: Map<string, number>;
};

function computeStandings(results: ResultMap): ManagerRow[] {
  const rows = new Map<string, ManagerRow>(
    PARTICIPANTS.map((p) => [
      p.name,
      {
        p,
        pts: 0,
        w: 0,
        d: 0,
        l: 0,
        played: 0,
        teamPts: new Map(),
        teamPlayed: new Map(),
      },
    ]),
  );
  for (const r of results.values()) {
    if (r.state !== "post") continue;
    for (const [team, gf, ga] of [
      [r.home, r.homeScore, r.awayScore] as const,
      [r.away, r.awayScore, r.homeScore] as const,
    ]) {
      const owner = TEAM_INDEX.get(team)?.owner;
      if (!owner) continue;
      const row = rows.get(owner.name)!;
      const pts = gf > ga ? 3 : gf === ga ? 1 : 0;
      row.pts += pts;
      row.played += 1;
      if (pts === 3) row.w += 1;
      else if (pts === 1) row.d += 1;
      else row.l += 1;
      row.teamPts.set(team, (row.teamPts.get(team) ?? 0) + pts);
      row.teamPlayed.set(team, (row.teamPlayed.get(team) ?? 0) + 1);
    }
  }
  return [...rows.values()].sort(
    (a, b) => b.pts - a.pts || b.w - a.w || a.p.name.localeCompare(b.p.name),
  );
}

const RANK_BADGES = ["🥇", "🥈", "🥉"];

/** total scheduled games per manager (count of fixtures involving their teams) */
const TOTAL_GAMES = new Map<string, number>(
  PARTICIPANTS.map((p) => [
    p.name,
    MATCHES.filter(
      (m) =>
        TEAM_INDEX.get(m.home)?.owner.name === p.name ||
        TEAM_INDEX.get(m.away)?.owner.name === p.name,
    ).length,
  ]),
);

/** total scheduled games per team (count of fixtures involving that team) */
const TEAM_TOTAL_GAMES = new Map<string, number>();
for (const m of MATCHES) {
  TEAM_TOTAL_GAMES.set(m.home, (TEAM_TOTAL_GAMES.get(m.home) ?? 0) + 1);
  TEAM_TOTAL_GAMES.set(m.away, (TEAM_TOTAL_GAMES.get(m.away) ?? 0) + 1);
}

function ScoreboardView({
  results,
  selected,
}: {
  results: ResultMap;
  selected: string[];
}) {
  const rows = computeStandings(results);
  const maxPts = Math.max(...rows.map((r) => r.pts), 1);
  const finals = [...results.values()].filter((r) => r.state === "post");
  const live = [...results.values()].filter((r) => r.state === "in");

  return (
    <div className="mx-auto mt-8 max-w-3xl space-y-3">
      <p className="text-center text-sm text-white/50">
        Win = <span className="font-bold text-emerald-300">3 pts</span> · Draw ={" "}
        <span className="font-bold text-amber-300">1 pt</span> ·{" "}
        {finals.length} match{finals.length === 1 ? "" : "es"} final
        {live.length > 0 && (
          <span className="ml-2 font-bold text-red-400">
            · 🔴 {live.length} live now
          </span>
        )}
      </p>

      {live.length > 0 && (
        <div className="space-y-1.5 rounded-2xl border border-red-400/20 bg-red-400/5 p-3">
          {live.map((r) => (
            <p
              key={resultKey(r.home, r.away)}
              className="text-center text-sm font-semibold text-white/90"
            >
              <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
              {r.home} <span className="font-black">{r.homeScore}</span> –{" "}
              <span className="font-black">{r.awayScore}</span> {r.away}
              <span className="ml-2 text-xs text-red-300">{r.detail}</span>
            </p>
          ))}
        </div>
      )}

      {finals.length === 0 && (
        <div className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <div className="text-4xl">🍿</div>
          <p className="mt-3 font-bold text-white/90">
            The scoreboard is armed and waiting.
          </p>
          <p className="mt-1 text-sm text-white/50">
            No full-time results yet — points appear here automatically as
            matches finish. Everyone starts level on 0.
          </p>
        </div>
      )}

      {rows.map((row, i) => {
        // keep the rank from the full standings even when filtered
        if (selected.length > 0 && !selected.includes(row.p.name)) return null;
        return (
          <div
            key={row.p.name}
            style={{ animationDelay: `${i * 60}ms` }}
            className="animate-fade-up block w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 text-center text-xl font-black text-white/60">
                {RANK_BADGES[i] ?? i + 1}
              </span>
              <span
                className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${row.p.gradient} px-3 py-1 text-sm font-black text-white`}
              >
                {row.p.emoji} {row.p.name}
              </span>
              <span className="ml-auto hidden text-xs font-semibold text-white/40 sm:block">
                {row.w}W · {row.d}D · {row.l}L ({row.played}/
                {TOTAL_GAMES.get(row.p.name)} played)
              </span>
              <span className="w-16 text-right text-2xl font-black text-white">
                {row.pts}
                <span className="ml-1 text-xs font-bold text-white/40">
                  pts
                </span>
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${row.p.gradient} transition-all duration-700`}
                style={{ width: `${(row.pts / maxPts) * 100}%` }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {row.p.teams.map((t) => {
                const pts = row.teamPts.get(t.name) ?? 0;
                const played = row.teamPlayed.get(t.name) ?? 0;
                const total = TEAM_TOTAL_GAMES.get(t.name) ?? 0;
                return (
                  <span
                    key={t.name}
                    className={`flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                      pts > 0
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                        : "border-white/10 bg-black/20 text-white/50"
                    }`}
                  >
                    <Flag team={t} small />
                    {t.name}
                    <span className="text-[10px] font-medium text-white/40">
                      {played}/{total}
                    </span>
                    <span className="font-black">{pts}</span>
                  </span>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const DATE_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

const SHORT_DATE_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

type Upset = {
  key: string;
  date: string;
  underdog: { team: Team; owner: Participant };
  favourite: { team: Team; owner: Participant };
  underdogScore: number;
  favouriteScore: number;
  result: "win" | "draw";
  /** how many draft tiers the underdog jumped */
  tierGap: number;
  /** upset points: tier gap x2 for wins, tier gap x1 for draws */
  points: number;
};

/** completed matches where a lower-tier team beat or drew a higher-tier team */
function computeUpsets(results: ResultMap): Upset[] {
  return MATCHES.flatMap((m) => {
    const r = findResult(results, m.home, m.away);
    if (!r || r.state !== "post") return [];
    const homeInfo = TEAM_INDEX.get(m.home);
    const awayInfo = TEAM_INDEX.get(m.away);
    if (!homeInfo || !awayInfo) return [];
    if (homeInfo.team.pot === awayInfo.team.pot) return [];

    const homeIsUnderdog = homeInfo.team.pot > awayInfo.team.pot;
    const underdog = homeIsUnderdog ? homeInfo : awayInfo;
    const favourite = homeIsUnderdog ? awayInfo : homeInfo;
    const underdogScore = homeIsUnderdog ? r.homeScore : r.awayScore;
    const favouriteScore = homeIsUnderdog ? r.awayScore : r.homeScore;
    const underdogWon = underdogScore > favouriteScore;
    const underdogDrew = underdogScore === favouriteScore;

    if (!underdogWon && !underdogDrew) return [];

    const tierGap = underdog.team.pot - favourite.team.pot;
    const points = tierGap * (underdogWon ? 2 : 1);
    return [
      {
        key: `${m.home}-${m.away}`,
        date: m.date,
        underdog,
        favourite,
        underdogScore,
        favouriteScore,
        result: underdogWon ? "win" : "draw",
        tierGap,
        points,
      },
    ];
  });
}

type UpsetRank = {
  p: Participant;
  /** upsets pulled off (their underdog won or drew) */
  pulled: number;
  /** total upset points won across those upsets */
  points: number;
  /** upsets conceded as the favourite */
  conceded: number;
  /** total upset points conceded as the favourite */
  concededPoints: number;
};

function computeUpsetLeaderboard(
  upsets: Upset[],
  mode: "earned" | "conceded",
): UpsetRank[] {
  const rows = new Map<string, UpsetRank>(
    PARTICIPANTS.map((p) => [
      p.name,
      { p, pulled: 0, points: 0, conceded: 0, concededPoints: 0 },
    ]),
  );
  for (const u of upsets) {
    const w = rows.get(u.underdog.owner.name)!;
    w.pulled += 1;
    w.points += u.points;
    const l = rows.get(u.favourite.owner.name)!;
    l.conceded += 1;
    l.concededPoints += u.points;
  }
  return [...rows.values()]
    .filter((r) => (mode === "earned" ? r.pulled > 0 : r.conceded > 0))
    .sort(
      (a, b) =>
        (mode === "earned"
          ? b.points - a.points || b.pulled - a.pulled
          : b.concededPoints - a.concededPoints || b.conceded - a.conceded) ||
        a.p.name.localeCompare(b.p.name),
    );
}

function UpsetsView({
  results,
  selected,
  onManagerToggle,
}: {
  results: ResultMap;
  selected: string[];
  onManagerToggle: (name: string) => void;
}) {
  const [upsetMode, setUpsetMode] = useState<"earned" | "conceded">("earned");
  const allUpsets = computeUpsets(results);
  const leaderboard = computeUpsetLeaderboard(allUpsets, upsetMode);
  const upsets = allUpsets
    .filter(
      (u) =>
        selected.length === 0 ||
        selected.includes(
          upsetMode === "earned"
            ? u.underdog.owner.name
            : u.favourite.owner.name,
        ),
    )
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.tierGap - a.tierGap ||
        a.date.localeCompare(b.date),
    );

  return (
    <div className="mx-auto mt-8 max-w-3xl space-y-3">
      <p className="text-center text-sm text-white/50">
        🪓 Giant-killings — lower-tier wins earn tier gap × 2, lower-tier draws
        earn tier gap × 1.
      </p>
      <div className="flex justify-center">
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setUpsetMode("earned")}
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase ${
              upsetMode === "earned"
                ? "bg-emerald-500 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            Points won
          </button>
          <button
            onClick={() => setUpsetMode("conceded")}
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase ${
              upsetMode === "conceded"
                ? "bg-red-500 text-white"
                : "text-white/50 hover:text-white"
            }`}
          >
            Points conceded
          </button>
        </div>
      </div>

      {allUpsets.length === 0 && (
        <div className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <div className="text-4xl">😴</div>
          <p className="mt-3 font-bold text-white/90">No upsets yet.</p>
          <p className="mt-1 text-sm text-white/50">
            When an underdog takes points from a favourite, the carnage shows up
            here.
          </p>
        </div>
      )}

      {leaderboard.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="text-center text-xs font-black uppercase tracking-widest text-amber-300/80">
            🏅 {upsetMode === "earned" ? "Upset Leaderboard" : "Conceded Upsets"}
          </h3>
          {leaderboard.map((r, i) => {
            if (selected.length > 0 && !selected.includes(r.p.name)) return null;
            const points = upsetMode === "earned" ? r.points : r.concededPoints;
            const count = upsetMode === "earned" ? r.pulled : r.conceded;
            const isSelected = selected.includes(r.p.name);
            return (
              <button
                type="button"
                key={r.p.name}
                onClick={() => onManagerToggle(r.p.name)}
                aria-pressed={isSelected}
                style={{ animationDelay: `${i * 50}ms` }}
                className={`animate-fade-up flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left backdrop-blur transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50 ${
                  isSelected
                    ? "border-white/30 bg-white/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <span className="w-6 text-center text-lg font-black text-white/60">
                  {RANK_BADGES[i] ?? i + 1}
                </span>
                <span
                  className={`flex items-center gap-2 rounded-full bg-gradient-to-r ${r.p.gradient} px-3 py-1 text-sm font-black text-white`}
                >
                  {r.p.emoji} {r.p.name}
                </span>
                <span className="ml-auto flex items-center gap-3 sm:gap-4">
                  <span
                    className={`text-right text-sm font-bold ${
                      upsetMode === "earned" ? "text-emerald-300" : "text-red-400"
                    }`}
                  >
                    {upsetMode === "earned" ? "+" : ""}
                    {points}
                    <span
                      className={`ml-0.5 text-[10px] font-medium ${
                        upsetMode === "earned"
                          ? "text-emerald-300/50"
                          : "text-red-400/50"
                      }`}
                    >
                      {upsetMode === "earned" ? "won" : "conceded"}
                    </span>
                  </span>
                  <span
                    className={`w-14 text-right text-lg font-black ${
                      upsetMode === "earned" ? "text-emerald-300" : "text-red-400"
                    }`}
                  >
                    {count}
                    <span className="ml-1 text-xs font-bold text-white/40">
                      {count === 1 ? "game" : "games"}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {upsets.length > 0 && (
        <h3 className="pt-4 text-center text-xs font-black uppercase tracking-widest text-white/40">
          {upsetMode === "earned" ? "Every upset" : "Upsets conceded"}
        </h3>
      )}

      {upsets.map((u, i) => (
        <div
          key={u.key}
          style={{ animationDelay: `${i * 60}ms` }}
          className="animate-fade-up rounded-2xl border border-amber-400/25 bg-amber-400/5 p-4 backdrop-blur"
        >
          <div className="mb-3 flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-300">
            🪓 {u.points} pts · {u.tierGap}-tier {u.result}
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            {/* underdog */}
            <div className="flex min-w-0 flex-col items-end gap-1.5 text-right">
              <div className="flex min-w-0 max-w-full items-center gap-2">
                <span className="min-w-0 truncate text-sm font-black text-white">
                  {u.underdog.team.name}
                </span>
                <Flag team={u.underdog.team} />
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1">
                <PotBadge pot={u.underdog.team.pot} />
                <OwnerTag owner={u.underdog.owner} />
              </div>
            </div>

            {/* score */}
            <div className="flex flex-col items-center">
              <span className="whitespace-nowrap text-lg font-black tracking-wider text-white">
                {u.underdogScore}–{u.favouriteScore}
              </span>
              <span className="whitespace-nowrap text-[10px] font-semibold text-white/40">
                {SHORT_DATE_FMT.format(new Date(`${u.date}T00:00:00Z`))}
              </span>
            </div>

            {/* favourite */}
            <div className="flex min-w-0 flex-col items-start gap-1.5">
              <div className="flex min-w-0 max-w-full items-center gap-2">
                <Flag team={u.favourite.team} />
                <span
                  className={`min-w-0 truncate text-sm font-bold ${
                    u.result === "win"
                      ? "text-white/55 line-through decoration-white/30"
                      : "text-white/75"
                  }`}
                >
                  {u.favourite.team.name}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <PotBadge pot={u.favourite.team.pot} />
                <OwnerTag owner={u.favourite.owner} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleView({
  selected,
  results,
}: {
  selected: string[];
  results: ResultMap;
}) {
  const [showPast, setShowPast] = useState(false);
  // match dates are AEST calendar days, so compute "today" in AEST too
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Brisbane",
  }).format(new Date());
  const visibleMatches = MATCHES.filter((m) => {
    if (selected.length === 0) return true;
    return (
      selected.includes(TEAM_INDEX.get(m.home)?.owner.name ?? "") ||
      selected.includes(TEAM_INDEX.get(m.away)?.owner.name ?? "")
    );
  });
  const allDays = [...new Set(visibleMatches.map((m) => m.date))];
  const pastDays = allDays.filter((d) => d < today);
  const days = showPast ? allDays : allDays.filter((d) => d >= today);

  return (
    <div className="mx-auto mt-8 max-w-4xl space-y-8">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-white/40">
        All kickoff times in AEST 🇦🇺
      </p>
      {pastDays.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowPast((v) => !v)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-semibold text-white/70 backdrop-blur transition-all hover:border-white/25 hover:text-white"
          >
            {showPast
              ? "🔼 Hide past games"
              : `🔽 Show past games (${pastDays.length} ${pastDays.length === 1 ? "day" : "days"})`}
          </button>
        </div>
      )}
      {days.length === 0 && (
        <p className="text-center text-white/50">
          No upcoming games — the group stage is done. 🏁
        </p>
      )}
      {days.map((day, i) => {
        const isToday = day === today;
        return (
          <section
            key={day}
            style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
            className="animate-fade-up"
          >
            <h2 className="mb-3 flex items-center gap-3 px-1">
              <span className="text-sm font-black uppercase tracking-widest text-white/70">
                {DATE_FMT.format(new Date(`${day}T00:00:00Z`))}
              </span>
              {isToday && (
                <span className="animate-pulse rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white">
                  ● Today
                </span>
              )}
              <span className="h-px flex-1 bg-white/10" />
            </h2>
            <ul className="space-y-2">
              {visibleMatches
                .filter((m) => m.date === day)
                .map((m) => (
                  <MatchRow
                    key={`${m.home}-${m.away}`}
                    match={m}
                    isToday={isToday}
                    result={findResult(results, m.home, m.away)}
                  />
                ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function MatchRow({
  match: m,
  isToday,
  result,
}: {
  match: (typeof MATCHES)[number];
  isToday: boolean;
  result?: LiveResult;
}) {
  const home = TEAM_INDEX.get(m.home)!;
  const away = TEAM_INDEX.get(m.away)!;

  return (
    <li
      className={`relative isolate grid grid-cols-[1fr_auto_1fr] items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur transition-all sm:gap-4 sm:px-4 ${
        isToday ? "bg-white/10" : ""
      }`}
    >
      <FlagBackdrop code={home.team.code} side="left" />
      <FlagBackdrop code={away.team.code} side="right" />

      {/* home side */}
      <div className="relative z-10 flex min-w-0 flex-col items-end gap-1 text-right sm:flex-row sm:items-center sm:justify-end sm:gap-2">
        <div className="order-last flex flex-col items-end gap-1 sm:order-none sm:flex-row sm:items-center sm:justify-end">
          <OwnerTag owner={home.owner} />
          <PotBadge pot={home.team.pot} />
        </div>
        <div className="flex min-w-0 max-w-full items-center gap-2">
          <span className="min-w-0 truncate text-sm font-bold text-white/90">
            {m.home}
          </span>
          <Flag team={home.team} />
        </div>
      </div>

      {/* center */}
      <div className="relative z-10 flex flex-col items-center gap-0.5">
        <span
          className={`rounded-md border px-1.5 text-[10px] font-bold ${GROUP_COLORS[m.group]}`}
        >
          {m.group}
        </span>
        {result && result.state !== "pre" ? (
          <>
            <span className="text-base font-black tracking-wider text-white">
              {result.homeScore}–{result.awayScore}
            </span>
            <span
              className={`whitespace-nowrap text-[10px] font-bold ${
                result.state === "in"
                  ? "animate-pulse text-red-400"
                  : "text-emerald-300"
              }`}
            >
              {result.state === "in" ? `🔴 ${result.detail}` : "FT"} · {m.city}
            </span>
          </>
        ) : (
          <>
            <span className="text-xs font-black tracking-widest text-white/40">
              VS
            </span>
            <span className="whitespace-nowrap text-[10px] font-semibold text-white/50">
              {m.time} · {m.city}
            </span>
          </>
        )}
      </div>

      {/* away side */}
      <div className="relative z-10 flex min-w-0 flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
        <div className="flex min-w-0 max-w-full items-center gap-2">
          <Flag team={away.team} />
          <span className="min-w-0 truncate text-sm font-bold text-white/90">
            {m.away}
          </span>
        </div>
        <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center">
          <OwnerTag owner={away.owner} />
          <PotBadge pot={away.team.pot} />
        </div>
      </div>
    </li>
  );
}

function OwnerTag({
  owner,
  className = "",
}: {
  owner: Participant;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center gap-1 rounded-full bg-gradient-to-r ${owner.gradient} px-2 py-0.5 text-[10px] font-bold text-white ${className}`}
      title={owner.name}
    >
      {owner.emoji} {owner.name}
    </span>
  );
}

function GroupsView({ selected }: { selected: string[] }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {GROUPS.map((g, i) => {
        const entries = PARTICIPANTS.flatMap((p) =>
          p.teams
            .filter((t) => t.group === g)
            .map((t) => ({ team: t, owner: p })),
        )
          .filter(
            ({ owner }) =>
              selected.length === 0 || selected.includes(owner.name),
          )
          .sort((a, b) => a.team.pot - b.team.pot);
        if (entries.length === 0) return null;
        return (
          <div
            key={g}
            style={{ animationDelay: `${i * 50}ms` }}
            className="animate-fade-up rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur"
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-black ${GROUP_COLORS[g]}`}
              >
                {g}
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-white/50">
                Group {g}
              </span>
            </div>
            <ul className="space-y-2">
              {entries.map(({ team, owner }) => {
                return (
                  <li
                    key={team.name}
                    className="flex items-center gap-2 rounded-lg border border-white/5 bg-black/20 px-2.5 py-2"
                  >
                    <Flag team={team} />
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white/90">
                      {team.name}
                    </span>
                    <span
                      className={`flex items-center gap-1 rounded-full bg-gradient-to-r ${owner.gradient} px-2 py-0.5 text-[10px] font-bold text-white`}
                    >
                      {owner.emoji} {owner.name}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
