"""
CSV & PDF export for the transaction ledger.
"""
import csv
import io

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

from ..models import Transaction


def transactions_to_csv(transactions: list[Transaction]) -> io.StringIO:
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(["Reference", "Amount", "Currency", "Status", "Method", "Donor", "Campaign", "External ID", "Created At"])
    for t in transactions:
        writer.writerow([
            t.reference, t.amount, t.currency, t.status.value, t.payment_method.value,
            t.donor_display_name,
            t.campaign.name if t.campaign else "",
            t.external_id or "", t.created_at.isoformat(),
        ])
    buf.seek(0)
    return buf


def transactions_to_pdf(transactions: list[Transaction]) -> io.BytesIO:
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = [Paragraph("Transaction Ledger", styles["Title"]), Spacer(1, 12)]

    data = [["Reference", "Amount", "Currency", "Status", "Donor", "Campaign", "Created At"]]
    for t in transactions:
        data.append([
            t.reference, f"{t.amount:.2f}", t.currency, t.status.value,
            t.donor_display_name or "-",
            t.campaign.name if t.campaign else "-",
            t.created_at.strftime("%Y-%m-%d %H:%M"),
        ])

    table = Table(data, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#14213D")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F2F2F0")]),
    ]))
    elements.append(table)
    doc.build(elements)
    buf.seek(0)
    return buf
