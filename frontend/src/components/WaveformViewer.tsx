
import React, { useState, useRef, useMemo } from 'react';
import { WaveformParsed, WaveformSignal } from '../types';
import { ZoomIn, ZoomOut, RotateCcw, Clock } from 'lucide-react';

interface WaveformViewerProps {
  waveform?: WaveformParsed | null;
  onLoadExample?: () => void;
  height?: string;
}

export const WaveformViewer: React.FC<WaveformViewerProps> = ({
  waveform,
  onLoadExample,
  height = '380px'
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [cursorTime, setCursorTime] = useState<number | null>(null);
  const [hiddenSignals, setHiddenSignals] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // All hooks must run before any conditional return.
  const signals = waveform?.signals ?? [];
  const timescale = waveform?.timescale ?? 'ns';
  const end_time = Math.max(0, Number(waveform?.end_time ?? 0));

  const cursorValues = useMemo<Record<string, string>>(() => {
    const values: Record<string, string> = {};

    if (cursorTime === null) {
      return values;
    }

    for (const sig of signals) {
      let currentVal = 'x';

      for (const tr of sig.transitions ?? []) {
        if (tr.time <= cursorTime) {
          currentVal = tr.value;
        } else {
          break;
        }
      }

      values[sig.name] = currentVal;
    }

    return values;
  }, [cursorTime, signals]);

  const visibleSignals = signals.filter(
    sig => !hiddenSignals[sig.name]
  );

  const pixelsPerTime = 8 * zoom;
  const totalWaveformWidth = Math.max(
    700,
    end_time * pixelsPerTime + 60
  );

  const rowHeight = 44;
  const headerHeight = 32;

  const timeStep = Math.max(1, Math.round(20 / zoom));

  const timeMarkers = useMemo(() => {
    const markers: number[] = [];

    for (let t = 0; t <= end_time; t += timeStep) {
      markers.push(t);
    }

    if (
      markers.length === 0 ||
      markers[markers.length - 1] !== end_time
    ) {
      markers.push(end_time);
    }

    return [...new Set(markers)];
  }, [end_time, timeStep]);

  const handleTimelineClick = (
    e: React.MouseEvent<SVGSVGElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const time = Math.max(
      0,
      Math.min(end_time, Math.round(clickX / pixelsPerTime))
    );

    setCursorTime(time);
  };

  const toggleSignalVisibility = (sigName: string) => {
    setHiddenSignals(prev => ({
      ...prev,
      [sigName]: !prev[sigName]
    }));
  };

  // Empty state comes after every hook.
  if (!waveform || !waveform.signals || waveform.signals.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: height,
          boxSizing: 'border-box',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius)',
          padding: '30px',
          textAlign: 'center'
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: 'var(--brand-light)',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16
          }}
        >
          <Clock size={28} />
        </div>

        <h4
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 6
          }}
        >
          No Digital Waveform Available
        </h4>

        <p
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            maxWidth: 440,
            marginBottom: 16
          }}
        >
          Compile and simulate a Verilog module with a valid
          testbench containing $dumpfile and $dumpvars to view
          digital timing signals.
        </p>

        {onLoadExample && (
          <button
            type="button"
            onClick={onLoadExample}
            className="btn btn-primary"
          >
            Load 4-Bit Counter Example &amp; Simulate
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius)',
        backgroundColor: 'var(--bg-card)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: height,
        minHeight: 200
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 14px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          fontSize: 12,
          flexWrap: 'wrap',
          gap: 8
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            flexWrap: 'wrap'
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: 'var(--text-secondary)'
            }}
          >
            Zoom:
          </span>

          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 11 }}
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>

          <span
            style={{
              minWidth: 42,
              textAlign: 'center',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            onClick={() => setZoom(z => Math.min(4, z + 0.25))}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 11 }}
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn size={13} />
          </button>

          <button
            type="button"
            onClick={() => {
              setZoom(1);
              setCursorTime(null);
            }}
            className="btn btn-secondary"
            style={{ padding: '4px 8px', fontSize: 11 }}
            title="Reset Zoom and Cursor"
            aria-label="Reset Zoom and Cursor"
          >
            <RotateCcw size={13} />
          </button>

          <span
            className="badge badge-blue"
            style={{ fontSize: 10 }}
          >
            Scale: {timescale}
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}
        >
          {cursorTime !== null ? (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                color: 'var(--brand-primary)',
                backgroundColor: 'var(--brand-light)',
                padding: '4px 8px',
                borderRadius: 6,
                fontWeight: 600
              }}
            >
              Cursor: {cursorTime} {timescale}
            </span>
          ) : (
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-muted)'
              }}
            >
              Click waveform to inspect values
            </span>
          )}
        </div>
      </div>

      {/* Signal labels and timing diagram */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* Signal names */}
        <div
          style={{
            width: 180,
            minWidth: 180,
            borderRight: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 2
          }}
        >
          <div
            style={{
              height: headerHeight,
              minHeight: headerHeight,
              boxSizing: 'border-box',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-secondary)'
            }}
          >
            SIGNALS ({visibleSignals.length})
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {visibleSignals.map(sig => {
              const curVal = cursorValues[sig.name];

              return (
                <div
                  key={sig.name}
                  style={{
                    height: rowHeight,
                    boxSizing: 'border-box',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 5,
                    padding: '0 8px',
                    fontSize: 12,
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div
                    style={{
                      overflow: 'hidden',
                      minWidth: 0,
                      flex: 1
                    }}
                  >
                    <div
                      title={sig.name}
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {sig.name}
                    </div>

                    <div
                      style={{
                        fontSize: 10,
                        color: 'var(--text-muted)'
                      }}
                    >
                      {sig.width > 1
                        ? `[${sig.width - 1}:0] bus`
                        : '1-bit wire'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSignalVisibility(sig.name)}
                    title={`Hide ${sig.name}`}
                    aria-label={`Hide ${sig.name}`}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: 3
                    }}
                  >
                    <Clock size={13} />
                  </button>

                  {curVal !== undefined && (
                    <div
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        fontWeight: 700,
                        color:
                          curVal === '1'
                            ? 'var(--accent-green)'
                            : curVal === '0'
                              ? 'var(--text-secondary)'
                              : 'var(--accent-amber)'
                      }}
                    >
                      {sig.width > 1 && allBinary(curVal)
                        ? `0x${parseInt(curVal, 2)
                            .toString(16)
                            .toUpperCase()}`
                        : curVal}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {Object.values(hiddenSignals).some(Boolean) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setHiddenSignals({})}
              style={{
                margin: 5,
                padding: '5px',
                fontSize: 11
              }}
            >
              Show All Signals
            </button>
          )}
        </div>

        {/* Timeline */}
        <div
          ref={containerRef}
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'auto',
            backgroundColor: 'var(--bg-card)',
            position: 'relative'
          }}
        >
          <svg
            width={totalWaveformWidth}
            height={Math.max(
              headerHeight + visibleSignals.length * rowHeight,
              headerHeight + rowHeight
            )}
            onClick={handleTimelineClick}
            role="img"
            aria-label="Interactive digital timing waveform"
            style={{
              display: 'block',
              cursor: 'crosshair'
            }}
          >
            {/* Time ruler and grid */}
            <rect
              x={0}
              y={0}
              width={totalWaveformWidth}
              height={headerHeight}
              fill="var(--bg-secondary)"
            />

            <line
              x1={0}
              y1={headerHeight}
              x2={totalWaveformWidth}
              y2={headerHeight}
              stroke="var(--border-color)"
            />

            {timeMarkers.map(t => {
              const x = t * pixelsPerTime;

              return (
                <g key={`marker-${t}`}>
                  <line
                    x1={x}
                    y1={headerHeight - 6}
                    x2={x}
                    y2={headerHeight}
                    stroke="var(--text-muted)"
                  />

                  <text
                    x={x + 3}
                    y={headerHeight - 8}
                    fontSize={10}
                    fill="var(--text-muted)"
                    fontFamily="var(--font-mono)"
                  >
                    {t}
                  </text>

                  <line
                    x1={x}
                    y1={headerHeight}
                    x2={x}
                    y2={headerHeight + visibleSignals.length * rowHeight}
                    stroke="var(--border-color)"
                    strokeDasharray="2,3"
                    opacity={0.6}
                  />
                </g>
              );
            })}

            {/* Signal traces */}
            {visibleSignals.map((sig, idx) => {
              const yBase = headerHeight + idx * rowHeight;
              const yMid = yBase + rowHeight / 2;
              const yHigh = yMid - 12;
              const yLow = yMid + 12;

              return (
                <g key={sig.name}>
                  <line
                    x1={0}
                    y1={yBase + rowHeight}
                    x2={totalWaveformWidth}
                    y2={yBase + rowHeight}
                    stroke="var(--border-color)"
                  />

                  {sig.width === 1
                    ? renderSingleBitTrace(
                        sig,
                        yHigh,
                        yLow,
                        pixelsPerTime,
                        end_time
                      )
                    : renderBusTrace(
                        sig,
                        yHigh,
                        yLow,
                        yMid,
                        pixelsPerTime,
                        end_time
                      )}
                </g>
              );
            })}

            {/* Inspection cursor */}
            {cursorTime !== null && (
              <g>
                <line
                  x1={cursorTime * pixelsPerTime}
                  y1={0}
                  x2={cursorTime * pixelsPerTime}
                  y2={headerHeight + visibleSignals.length * rowHeight}
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  pointerEvents="none"
                />

                <circle
                  cx={cursorTime * pixelsPerTime}
                  cy={headerHeight / 2}
                  r={3.5}
                  fill="#ef4444"
                  pointerEvents="none"
                />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};

function allBinary(str: string): boolean {
  return /^[01]+$/.test(str);
}

function renderSingleBitTrace(
  sig: WaveformSignal,
  yHigh: number,
  yLow: number,
  scale: number,
  endTime: number
): React.ReactElement {
  const transitions = [...(sig.transitions ?? [])].sort(
    (a, b) => a.time - b.time
  );

  if (transitions.length === 0) {
    return (
      <line
        x1={0}
        y1={yLow}
        x2={endTime * scale}
        y2={yLow}
        stroke="#94a3b8"
        strokeWidth={2}
      />
    );
  }

  const pathSegments: string[] = [];

  let lastX = 0;
  let lastY = transitions[0].value === '1' ? yHigh : yLow;

  pathSegments.push(`M 0 ${lastY}`);

  for (const tr of transitions) {
    const currX = Math.max(0, tr.time * scale);
    const currY = tr.value === '1' ? yHigh : yLow;

    pathSegments.push(`L ${currX} ${lastY}`);
    pathSegments.push(`L ${currX} ${currY}`);

    lastX = currX;
    lastY = currY;
  }

  const finalX = Math.max(lastX, endTime * scale);

  pathSegments.push(`L ${finalX} ${lastY}`);

  return (
    <path
      d={pathSegments.join(' ')}
      fill="none"
      stroke="#10b981"
      strokeWidth={2}
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  );
}

function renderBusTrace(
  sig: WaveformSignal,
  yHigh: number,
  yLow: number,
  yMid: number,
  scale: number,
  endTime: number
): React.ReactElement | null {
  const transitions = [...(sig.transitions ?? [])].sort(
    (a, b) => a.time - b.time
  );

  if (transitions.length === 0) {
    return null;
  }

  const polygons: React.ReactElement[] = [];
  const textLabels: React.ReactElement[] = [];

  for (let i = 0; i < transitions.length; i++) {
    const curr = transitions[i];

    const nextTime =
      i + 1 < transitions.length
        ? transitions[i + 1].time
        : endTime;

    const x1 = curr.time * scale;
    const x2 = nextTime * scale;
    const durationPx = x2 - x1;

    if (durationPx <= 0) {
      continue;
    }

    const bevel = Math.min(4, durationPx / 3);

    const polyPoints = [
      `${x1},${yMid}`,
      `${x1 + bevel},${yHigh}`,
      `${x2 - bevel},${yHigh}`,
      `${x2},${yMid}`,
      `${x2 - bevel},${yLow}`,
      `${x1 + bevel},${yLow}`
    ].join(' ');

    polygons.push(
      <polygon
        key={`poly-${i}`}
        points={polyPoints}
        fill="rgba(59, 130, 246, 0.12)"
        stroke="#3b82f6"
        strokeWidth={1.5}
      />
    );

    if (durationPx > 26) {
      const val = curr.value;

      const label = allBinary(val)
        ? `0x${parseInt(val, 2).toString(16).toUpperCase()}`
        : val;

      textLabels.push(
        <text
          key={`txt-${i}`}
          x={x1 + durationPx / 2}
          y={yMid + 4}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill="var(--text-primary)"
          fontFamily="var(--font-mono)"
        >
          {label}
        </text>
      );
    }
  }

  return (
    <g>
      {polygons}
      {textLabels}
    </g>
  );
}
