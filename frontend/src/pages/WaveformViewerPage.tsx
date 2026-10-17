import React, { useState } from 'react';
import { WaveformViewer } from '../components/WaveformViewer';
import { WaveformAnalysisModal } from '../components/WaveformAnalysisModal';
import { WaveformParsed, WaveformAnalysisResponse } from '../types';
import { api } from '../services/api';
import { Layers, Activity, Upload, Sparkles, Clock, Loader2, Info } from 'lucide-react';

const SAMPLE_VCD_COUNTER = `$date
   Thu Oct 15 14:00:00 2026
$end
$version
   Icarus Verilog
$end
$timescale
   1ns
$end
$scope module tb_counter4 $end
$var wire 4 ! count [3:0] $end
$var reg 1 " clk $end
$var reg 1 # reset $end
$scope module uut $end
$var wire 1 " clk $end
$var wire 1 # reset $end
$var reg 4 $ count [3:0] $end
$upscope $end
$upscope $end
$enddefinitions $end
#0
$dumpvars
b0000 !
0"
1#
b0000 $
$end
#5
1"
#10
0"
#12
0#
#15
1"
b0001 !
b0001 $
#20
0"
#25
1"
b0010 !
b0010 $
#30
0"
#35
1"
b0011 !
b0011 $
#40
0"
#45
1"
b0100 !
b0100 $
#50
0"
#55
1"
b0101 !
b0101 $
#60
0"
#65
1"
b0110 !
b0110 $
#70
0"
#75
1"
b0111 !
b0111 $
#80
0"
#85
1"
b1000 !
b1000 $
#90
0"
#95
1"
b1001 !
b1001 $
#100
0"
`;

export const WaveformViewerPage: React.FC = () => {
  const [vcdText, setVcdText] = useState<string>(SAMPLE_VCD_COUNTER);
  const [parsedWaveform, setParsedWaveform] = useState<WaveformParsed | null>(() => {
    try {
      return parseClientVcd(SAMPLE_VCD_COUNTER);
    } catch {
      return null;
    }
  });

  const [isAnalysisOpen, setIsAnalysisOpen] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<WaveformAnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showRawEditor, setShowRawEditor] = useState<boolean>(false);

  const handleParseVcd = () => {
    try {
      const parsed = parseClientVcd(vcdText);
      setParsedWaveform(parsed);
    } catch (e: any) {
      alert('Error parsing VCD data: ' + e.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setVcdText(text);
      try {
        const parsed = parseClientVcd(text);
        setParsedWaveform(parsed);
      } catch (err: any) {
        alert('Failed to parse uploaded VCD: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!vcdText) return;
    setIsAnalyzing(true);
    try {
      const res = await api.analyzeWaveform(vcdText);
      setAnalysis(res);
      setIsAnalysisOpen(true);
    } catch (err: any) {
      alert('Analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        backgroundColor: 'var(--bg-card)',
        padding: '12px 18px',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            color: 'var(--accent-amber)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Layers size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Dedicated Digital Timing Waveform Inspector
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              IEEE 1364 Value Change Dump (VCD) analysis with interactive transition cursor
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', fontSize: '12px', padding: '6px 12px' }}>
            <Upload size={13} />
            <span>Open .VCD File</span>
            <input type="file" accept=".vcd" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button
            onClick={() => setShowRawEditor(!showRawEditor)}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px' }}
          >
            {showRawEditor ? 'Hide VCD Source' : 'Edit Raw VCD'}
          </button>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="btn btn-primary"
            style={{ fontSize: '12px', padding: '6px 14px', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
          >
            {isAnalyzing ? <Loader2 size={13} className="animate-spin" /> : <Activity size={13} />}
            <span>Analyze Waveforms</span>
          </button>
        </div>
      </div>

      {/* Raw VCD Editor if toggled */}
      {showRawEditor && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 600, fontSize: '12px' }}>Raw VCD Text Source:</div>
            <button onClick={handleParseVcd} className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>
              Re-parse Waveform
            </button>
          </div>
          <textarea
            className="textarea"
            rows={6}
            style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}
            value={vcdText}
            onChange={(e) => setVcdText(e.target.value)}
          />
        </div>
      )}

      {/* Main Waveform Viewer */}
      <WaveformViewer
        waveform={parsedWaveform}
        height="620px"
      />

      <WaveformAnalysisModal
        isOpen={isAnalysisOpen}
        onClose={() => setIsAnalysisOpen(false)}
        analysis={analysis}
      />
    </div>
  );
};

// Client-side VCD parser helper for instant rendering of loaded/uploaded files
function parseClientVcd(vcdContent: string): WaveformParsed {
  let timescale = '1ns';
  const signalsMap: Record<string, { name: string; wire_id: string; width: number; signal_type: string }> = {};
  const currentScope: string[] = [];
  let inDefinitions = true;
  let currentTime = 0;
  const transitionsById: Record<string, Array<{ time: number; value: string }>> = {};

  const lines = vcdContent.split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (inDefinitions) {
      if (line.startsWith('$timescale')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2 && parts[1] !== '$end') timescale = parts[1];
      } else if (line.startsWith('$scope')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 3) currentScope.push(parts[2]);
      } else if (line.startsWith('$upscope')) {
        currentScope.pop();
      } else if (line.startsWith('$var')) {
        const parts = line.split(/\s+/);
        if (parts.length >= 5) {
          const varType = parts[1];
          const width = parseInt(parts[2]) || 1;
          const idCode = parts[3];
          let name = parts[4];
          if (parts.length >= 6 && parts[5] !== '$end') {
            name = `${name}${parts[5]}`;
          }

          if (!signalsMap[idCode]) {
            signalsMap[idCode] = {
              name,
              wire_id: idCode,
              width,
              signal_type: varType
            };
            transitionsById[idCode] = [];
          }
        }
      } else if (line.startsWith('$enddefinitions')) {
        inDefinitions = false;
      }
      continue;
    }

    if (line.startsWith('#')) {
      currentTime = parseInt(line.substring(1)) || currentTime;
      continue;
    }
    if (line.startsWith('$dumpvars') || line === '$end') continue;

    if (line.startsWith('b') || line.startsWith('B') || line.startsWith('r') || line.startsWith('R')) {
      const tokens = line.split(/\s+/);
      if (tokens.length >= 2) {
        const val = tokens[0].substring(1);
        const idCode = tokens[1];
        if (transitionsById[idCode]) {
          transitionsById[idCode].push({ time: currentTime, value: val });
        }
      }
    } else {
      const val = line[0];
      const idCode = line.substring(1).trim();
      if (transitionsById[idCode]) {
        transitionsById[idCode].push({ time: currentTime, value: val });
      }
    }
  }

  const seen = new Set<string>();
  const signals = [];
  for (const id in signalsMap) {
    const info = signalsMap[id];
    if (!seen.has(info.name)) {
      seen.add(info.name);
      signals.push({
        name: info.name,
        wire_id: info.wire_id,
        width: info.width,
        signal_type: info.signal_type,
        transitions: transitionsById[id] || []
      });
    }
  }

  return {
    timescale,
    end_time: currentTime,
    signals
  };
}
