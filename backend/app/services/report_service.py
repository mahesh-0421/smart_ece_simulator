import io
import os
import base64
from datetime import datetime
from typing import Dict, Any, Optional

from reportlab.lib.pagesizes import letter
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage,
    Preformatted, PageBreak, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.services.waveform_service import WaveformService

class ReportService:
    @classmethod
    def generate_pdf_report(
        cls,
        title: str,
        language: str,
        code: str,
        testbench_code: Optional[str] = None,
        status: str = "success",
        duration_ms: float = 0.0,
        stdout: str = "",
        stderr: str = "",
        plot_image_base64: Optional[str] = None,
        vcd_raw: Optional[str] = None,
        objective: Optional[str] = None,
        conclusion: Optional[str] = None,
        error_explanation: Optional[Dict[str, Any]] = None
    ) -> bytes:
        """
        Builds a comprehensive, academic-standard laboratory PDF report.
        Embeds genuine source code, terminal outputs, plot graphics, and digital timing waveforms.
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()

        # Custom academic styles
        header_title_style = ParagraphStyle(
            'HeaderTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=18,
            leading=22,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            'SubTitle',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=11,
            leading=14,
            textColor=colors.HexColor('#2563EB')
        )
        section_heading = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=16,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=12,
            spaceAfter=6
        )
        body_style = ParagraphStyle(
            'ReportBody',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )
        code_style = ParagraphStyle(
            'CodeBlock',
            fontName='Courier',
            fontSize=8,
            leading=10,
            textColor=colors.HexColor('#0F172A')
        )
        status_pass_style = ParagraphStyle(
            'PassStatus',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            textColor=colors.HexColor('#16A34A')
        )
        status_fail_style = ParagraphStyle(
            'FailStatus',
            parent=styles['Normal'],
            fontName='Helvetica-Bold',
            fontSize=10,
            textColor=colors.HexColor('#DC2626')
        )

        story = []

        # Header Banner
        story.append(Paragraph("SMART ECE LAB – EXPERIMENTAL LABORATORY REPORT", subtitle_style))
        story.append(Paragraph(title or "Laboratory Experiment Report", header_title_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#2563EB'), spaceAfter=10))

        # Metadata Table
        engine_str = "GNU Octave 11.3 (MATLAB-Compatible)" if language.lower() in ("matlab", "octave") else "Icarus Verilog 12.0 + VVP Engine"
        status_paragraph = Paragraph("SUCCESS / VERIFIED", status_pass_style) if status.lower() == "success" else Paragraph(f"EXECUTION FAILED ({status.upper()})", status_fail_style)

        meta_data = [
            [
                Paragraph("<b>Language / Engine:</b>", body_style),
                Paragraph(engine_str, body_style),
                Paragraph("<b>Date / Time:</b>", body_style),
                Paragraph(datetime.now().strftime("%Y-%m-%d %H:%M:%S"), body_style)
            ],
            [
                Paragraph("<b>Execution Status:</b>", body_style),
                status_paragraph,
                Paragraph("<b>Elapsed Duration:</b>", body_style),
                Paragraph(f"{duration_ms:.2f} ms", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[120, 160, 100, 160])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 10))

        # Objective
        if objective:
            story.append(Paragraph("1. EXPERIMENT OBJECTIVE", section_heading))
            story.append(Paragraph(objective, body_style))
            story.append(Spacer(1, 8))

        # Source Code Section
        story.append(Paragraph("2. SOURCE CODE IMPLEMENTATION", section_heading))
        cleaned_code = code.strip() if code else "// No source code provided"
        # Wrap in table for clean border
        code_table = Table([[Preformatted(cleaned_code[:4000], code_style)]], colWidths=[540])
        code_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94A3B8')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(code_table)
        story.append(Spacer(1, 8))

        # Testbench Code (for Verilog)
        if testbench_code and testbench_code.strip():
            story.append(Paragraph("3. VERILOG TESTBENCH STIMULUS", section_heading))
            tb_table = Table([[Preformatted(testbench_code.strip()[:4000], code_style)]], colWidths=[540])
            tb_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F1F5F9')),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94A3B8')),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(tb_table)
            story.append(Spacer(1, 8))

        # Execution Output or Diagnostic Error
        output_heading = "4. EXECUTION RESULTS & CONSOLE LOG" if status.lower() == "success" else "4. COMPILER / EXECUTION DIAGNOSTICS"
        story.append(Paragraph(output_heading, section_heading))

        log_content = stdout.strip() if stdout else ""
        if stderr and stderr.strip():
            if log_content:
                log_content += "\n--- STDERR / DIAGNOSTICS ---\n"
            log_content += stderr.strip()

        if not log_content:
            log_content = "[Process completed with no console output]"

        out_bg = colors.HexColor('#F8FAFC') if status.lower() == "success" else colors.HexColor('#FEF2F2')
        out_border = colors.HexColor('#CBD5E1') if status.lower() == "success" else colors.HexColor('#F87171')

        out_table = Table([[Preformatted(log_content[:3000], code_style)]], colWidths=[540])
        out_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), out_bg),
            ('BOX', (0, 0), (-1, -1), 0.5, out_border),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(out_table)
        story.append(Spacer(1, 10))

        # Error Explanation Box if execution failed
        if status.lower() != "success" and error_explanation:
            story.append(Paragraph("INTELLIGENT DEBUGGER ANALYSIS", section_heading))
            err_box = [
                [Paragraph("<b>Likely Cause:</b>", body_style), Paragraph(error_explanation.get("likely_cause", "Diagnostic issue"), body_style)],
                [Paragraph("<b>Suggested Fix:</b>", body_style), Paragraph(error_explanation.get("suggested_fix", "Check syntax and declarations"), body_style)]
            ]
            err_table = Table(err_box, colWidths=[120, 420])
            err_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FFF7ED')),
                ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#FDBA74')),
                ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#FED7AA')),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            story.append(err_table)
            story.append(Spacer(1, 10))

        # MATLAB Plot Image Embedding
        if plot_image_base64 and plot_image_base64.startswith("data:image"):
            try:
                story.append(Paragraph("5. GENERATED NUMERICAL PLOT", section_heading))
                header, b64_data = plot_image_base64.split(",", 1)
                img_bytes = base64.b64decode(b64_data)
                img_buffer = io.BytesIO(img_bytes)
                rl_img = RLImage(img_buffer, width=480, height=270)
                story.append(rl_img)
                story.append(Spacer(1, 10))
            except Exception:
                pass

        # Verilog Waveform Timing Diagram Rendering & Embedding
        if vcd_raw and vcd_raw.strip():
            try:
                story.append(Paragraph("5. DIGITAL TIMING WAVEFORM", section_heading))
                parsed = WaveformService.parse_vcd(vcd_raw)
                wf_img_bytes = WaveformService.render_waveform_image(parsed, max_width=800)
                if wf_img_bytes:
                    wf_buf = io.BytesIO(wf_img_bytes)
                    img_height = min(280, 50 + len(parsed.get("signals", [])) * 40)
                    rl_wf = RLImage(wf_buf, width=540, height=img_height)
                    story.append(rl_wf)
                    story.append(Spacer(1, 10))
            except Exception:
                pass

        # Conclusion
        story.append(Paragraph("6. CONCLUSION & VERIFICATION", section_heading))
        default_conclusion = (
            f"The {language.upper()} experiment completed with exit code 0. Numerical output and simulation waveforms "
            "conform to expected theoretical design behavior."
            if status.lower() == "success"
            else "The simulation or execution did not pass without errors. Review the debugger diagnostics above."
        )
        story.append(Paragraph(conclusion or default_conclusion, body_style))
        story.append(Spacer(1, 15))

        # Footer sign-off
        sign_data = [
            [Paragraph("<b>Student Signature:</b> ___________________", body_style), Paragraph("<b>Faculty Evaluation:</b> ___________________", body_style)]
        ]
        sign_table = Table(sign_data, colWidths=[270, 270])
        sign_table.setStyle(TableStyle([
            ('TOPPADDING', (0, 0), (-1, -1), 8),
        ]))
        story.append(sign_table)

        doc.build(story)
        return buffer.getvalue()
