import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  ChatWidget,
  DataTable,
  Spinner,
  TextField,
  LIBRARY_VERSION,
  filterRows,
  paginate,
  sortRows,
} from '@peinanwang/common-ui-library';
import type {
  ChatStats,
  ChatWidgetHandle,
  Column,
} from '@peinanwang/common-ui-library';
import { useAppStore } from './appStore';

type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  seats: number;
};

const USERS: User[] = [
  { id: 1, name: 'Ada Lovelace', email: 'ada@example.com', role: 'admin', status: 'active', seats: 3 },
  { id: 2, name: 'Alan Turing', email: 'alan@example.com', role: 'editor', status: 'active', seats: 1 },
  { id: 3, name: 'Grace Hopper', email: 'grace@example.com', role: 'admin', status: 'suspended', seats: 10 },
  { id: 4, name: 'José Álvarez', email: 'jose@example.com', role: 'viewer', status: 'invited', seats: 2 },
  { id: 5, name: 'Katherine Johnson', email: 'kat@example.com', role: 'editor', status: 'active', seats: 5 },
  { id: 6, name: 'Barbara Liskov', email: 'barbara@example.com', role: 'viewer', status: 'active', seats: 1 },
  { id: 7, name: 'Margaret Hamilton', email: 'margaret@example.com', role: 'admin', status: 'active', seats: 8 },
];

const statusColor = { active: 'primary', invited: 'secondary', suspended: 'danger' } as const;

/**
 * Column metadata lives in the APP, not the library. This object is the entire
 * table configuration - the component itself knows nothing about users.
 */
const columns: Column<User>[] = [
  { key: 'name', header: 'Name', sortable: true, width: '24%' },
  { key: 'email', header: 'Email', sortable: true },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    render: (u) => <Badge variant="outline" color="secondary" size="sm">{u.role}</Badge>,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (u) => <Badge color={statusColor[u.status]} dot size="sm">{u.status}</Badge>,
  },
  { key: 'seats', header: 'Seats', sortable: true, align: 'right' },
];

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="section">
      <h2 className="sectionHeading">{title}</h2>
      {note && <p className="sectionNote">{note}</p>}
      {children}
    </section>
  );
}

function StatRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="statRow">
      <span className="statLabel">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function App() {
  /**
   * Reading from the app's GLOBAL store. Each of these subscribes to one slice,
   * so a theme change does not re-render because of a snapshot, or vice versa.
   */
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const snapshots = useAppStore((s) => s.snapshots);
  const saveSnapshot = useAppStore((s) => s.saveSnapshot);
  const clearSnapshots = useAppStore((s) => s.clearSnapshots);

  /**
   * Drives the library's dark theme by setting the attribute its tokens key
   * off. The library exposes no theme prop and needs none - one attribute
   * re-skins every component.
   */
  useEffect(() => {
    document.documentElement.setAttribute('data-cui-theme', theme);
  }, [theme]);

  // -- DataTable demo ------------------------------------------------------
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [tableState, setTableState] = useState<'data' | 'empty' | 'loading' | 'error'>('data');

  // Derived from state, never stored alongside it - two copies eventually disagree.
  const filtered = useMemo(() => filterRows(USERS, query, ['name', 'email', 'role']), [query]);
  const result = useMemo(() => paginate(filtered, { page, pageSize: 4 }), [filtered, page]);

  // -- ChatWidget demo -----------------------------------------------------
  const chatRef = useRef<ChatWidgetHandle>(null);
  const [liveStats, setLiveStats] = useState<ChatStats | null>(null);

  // -- Utility demo --------------------------------------------------------
  const messy = ['item 10', 'item 2', 'Zoe', 'ábel', 'alice'];
  const sortedDemo = sortRows(messy.map((n) => ({ n })), 'n', 'asc').map((r) => r.n);

  return (
    <div className="page">
      <header className="appHeader">
        <div>
          <h1 className="appTitle">Consumer app</h1>
          <p className="appSubtitle">
            Using <code>@peinanwang/common-ui-library</code> v{LIBRARY_VERSION} · app on Node 22,
            library built on Node 20
          </p>
        </div>
        <div className="row">
          <Badge variant="soft" color="secondary">{theme}</Badge>
          <Button variant="outlined" onClick={toggleTheme}>
            Toggle theme
          </Button>
        </div>
      </header>

      <Section
        title="Buttons"
        note="Every variant, colour and size comes from props. The app defines no button styles of its own."
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="row">
            <Button>Filled</Button>
            <Button variant="outlined">Outlined</Button>
            <Button variant="ghost">Ghost</Button>
            <Button color="danger">Danger</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
          </div>
          <div className="row">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button endSlot={<Badge size="sm" variant="solid">3</Badge>}>Inbox</Button>
            <Button variant="outlined">
              <span>
                Save <strong>2 items</strong>
              </span>
            </Button>
          </div>
        </div>
      </Section>

      <Section
        title="Form controls"
        note="TextField and Button share the --cui-control-height-* tokens, so they line up exactly at every size."
      >
        <div className="row" style={{ alignItems: 'flex-end' }}>
          <TextField label="Search users" placeholder="Try 'jose'" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} />
          <Button onClick={() => setQuery('')} variant="outlined">Clear</Button>
          <Spinner label="Example spinner" />
        </div>
      </Section>

      <Section
        title="DataTable"
        note={
          <>
            Column metadata plus rows. Use the buttons to see the empty, loading and error states —
            the ones most often forgotten. Searching and paging are done by the library's{' '}
            <code>filterRows</code> and <code>paginate</code> functions, called by this app.
          </>
        }
      >
        <div className="row" style={{ marginBottom: 12 }}>
          {(['data', 'empty', 'loading', 'error'] as const).map((s) => (
            <Button
              key={s}
              size="sm"
              variant={tableState === s ? 'filled' : 'outlined'}
              onClick={() => setTableState(s)}
            >
              {s}
            </Button>
          ))}
        </div>

        <DataTable
          columns={columns}
          rows={tableState === 'empty' ? [] : result.items}
          getRowId={(u) => u.id}
          caption="Team members"
          loading={tableState === 'loading'}
          error={tableState === 'error' ? 'Could not load users. Check your connection.' : undefined}
          emptyMessage="No users match your search."
        />

        <div className="row" style={{ justifyContent: 'space-between', marginTop: 12 }}>
          <span className="muted">
            {result.totalItems === 0
              ? 'No results'
              : `Showing ${result.startIndex}-${result.endIndex} of ${result.totalItems}`}
          </span>
          <span className="row">
            <Button size="sm" variant="outlined" disabled={!result.hasPrev} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="muted">
              Page {result.page} of {result.totalPages}
            </span>
            <Button size="sm" variant="outlined" disabled={!result.hasNext} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </span>
        </div>
      </Section>

      <Section
        title="Utility functions"
        note={
          <>
            The library ships logic, not only components. <code>sortRows</code> uses{' '}
            <code>Intl.Collator</code>, so accents sort where a reader expects and numbers inside
            strings order the way a human reads them. This app calls it without knowing any of that.
          </>
        }
      >
        <div className="panel" style={{ maxWidth: 520 }}>
          <StatRow label="input" value={<code>{JSON.stringify(messy)}</code>} />
          <StatRow label="sortRows(…, 'asc')" value={<code>{JSON.stringify(sortedDemo)}</code>} />
          <p className="muted" style={{ margin: '10px 0 0', lineHeight: 1.5 }}>
            Note <code>"item 2"</code> before <code>"item 10"</code>, and <code>"ábel"</code> next to{' '}
            <code>"alice"</code> rather than after <code>"Zoe"</code>.
          </p>
        </div>
      </Section>

      <Section
        title="ChatWidget — state exposed to this app"
        note={
          <>
            The widget keeps a complex store internally: messages, per-message delivery status,
            draft text, a typing flag. This app can see <strong>none</strong> of it. It receives a
            seven-field <code>ChatStats</code> object, pushed via <code>onStatsChange</code> and
            pulled via <code>chatRef.current.getStats()</code>. This app does not install Zustand
            for the widget — the library bundles its own.
          </>
        }
      >
        <div className="split">
          <ChatWidget
            ref={chatRef}
            apiUrl="https://api.example.com/chat"
            apiKey="demo-key-1234"
            title="Support assistant"
            onStatsChange={setLiveStats}
            onError={(err) => console.warn('[app] chat error:', err.message)}
          />

          <div className="panel">
            <div className="row" style={{ marginBottom: 10 }}>
              <strong>Live stats</strong>
              <Badge size="sm" variant="soft" color="secondary">push</Badge>
            </div>

            {liveStats ? (
              <>
                <StatRow label="messageCount" value={liveStats.messageCount} />
                <StatRow label="userMessageCount" value={liveStats.userMessageCount} />
                <StatRow label="apiCallCount" value={liveStats.apiCallCount} />
                <StatRow label="failedCalls" value={liveStats.failedCalls} />
                <StatRow label="totalCharsSent" value={liveStats.totalCharsSent} />
              </>
            ) : (
              <p className="muted" style={{ margin: 0 }}>Send a message to see stats arrive.</p>
            )}

            <div className="row" style={{ marginTop: 14 }}>
              <Button
                size="sm"
                onClick={() => {
                  // PULL: a plain synchronous call, no subscription.
                  const stats = chatRef.current?.getStats();
                  if (stats) saveSnapshot(stats);
                }}
              >
                Save snapshot
              </Button>
              <Button size="sm" variant="outlined" onClick={() => void chatRef.current?.sendMessage('Hello from the app')}>
                Send for me
              </Button>
              <Button size="sm" variant="ghost" color="danger" onClick={() => { chatRef.current?.reset(); setLiveStats(null); }}>
                Reset chat
              </Button>
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="row" style={{ marginBottom: 8 }}>
                <strong>Snapshots</strong>
                <Badge size="sm" variant="soft" color="secondary">app store</Badge>
                {snapshots.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={clearSnapshots}>Clear</Button>
                )}
              </div>
              {snapshots.length === 0 ? (
                <p className="muted" style={{ margin: 0 }}>None saved yet.</p>
              ) : (
                snapshots.map((s, i) => (
                  <StatRow
                    key={i}
                    label={s.at}
                    value={`${s.stats.messageCount} msgs · ${s.stats.apiCallCount} calls`}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
