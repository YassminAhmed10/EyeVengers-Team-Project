import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
export function ReportDetailsCard({ report }) {
    const downloadPdf = async () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Radiology Report', 20, 20);
        doc.setFontSize(12);
        doc.text(`Investigation: ${report.investigationName}`, 20, 35);
        doc.text(`Date: ${format(new Date(report.createdAt), 'PPP')}`, 20, 43);
        doc.text(`Radiologist: ${report.radiologistName}`, 20, 51);
        doc.setFontSize(13);
        doc.text('Findings:', 20, 66);
        doc.setFontSize(11);
        const findingsLines = doc.splitTextToSize(report.findings, 170);
        doc.text(findingsLines, 20, 74);
        const findingsHeight = findingsLines.length * 6;
        const impressionTop = 74 + findingsHeight + 8;
        doc.setFontSize(13);
        doc.text('Impression:', 20, impressionTop);
        doc.setFontSize(11);
        const impressionLines = doc.splitTextToSize(report.impression, 170);
        doc.text(impressionLines, 20, impressionTop + 8);
        let nextY = impressionTop + 8 + impressionLines.length * 6 + 8;
        // Embed report image into the PDF when available.
        if (report.dicomImageUrl) {
            try {
                const imageDataUrl = await new Promise((resolve, reject) => {
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) {
                            reject(new Error('Unable to render image'));
                            return;
                        }
                        ctx.drawImage(img, 0, 0);
                        resolve(canvas.toDataURL('image/jpeg', 0.92));
                    };
                    img.onerror = () => reject(new Error('Unable to load image'));
                    img.src = report.dicomImageUrl;
                });
                const pageWidth = doc.internal.pageSize.getWidth();
                const maxImageWidth = pageWidth - 40;
                const imageWidth = maxImageWidth;
                const imageHeight = maxImageWidth * 0.62;
                const pageHeight = doc.internal.pageSize.getHeight();
                if (nextY + imageHeight > pageHeight - 20) {
                    doc.addPage();
                    nextY = 20;
                }
                doc.setFontSize(12);
                doc.text('Report Image:', 20, nextY);
                nextY += 6;
                doc.addImage(imageDataUrl, 'JPEG', 20, nextY, imageWidth, imageHeight);
            }
            catch {
                // Continue PDF creation even if image embedding fails.
            }
        }
        const safeId = report.id.replace(/[^a-zA-Z0-9-_]/g, '_');
        doc.save(`radiology-report-${safeId}.pdf`);
    };
    return (_jsxs("article", { className: "rounded-2xl border border-white/35 bg-white/10 p-5 text-white backdrop-blur-[2px]", dir: "ltr", children: [_jsx("h2", { className: "section-title mb-1 text-3xl font-bold text-white", children: report.investigationName }), _jsxs("p", { className: "mb-3 text-sm text-sky-100", children: ["Scan date: ", format(new Date(report.createdAt), 'PPP')] }), _jsxs("p", { className: "mb-4 text-sm text-sky-50", children: [_jsx("span", { className: "font-semibold text-white", children: "Radiologist:" }), " ", report.radiologistName] }), _jsxs("div", { className: "rounded-xl border border-white/35 bg-white/10 p-4", children: [_jsx("h3", { className: "mb-2 text-lg font-bold text-white", children: "Findings and Impression" }), _jsx("p", { className: "text-sm leading-7 text-sky-50", children: report.findings }), _jsxs("p", { className: "mt-3 text-sm leading-7 text-sky-50", children: [_jsx("span", { className: "font-semibold text-white", children: "Impression:" }), " ", report.impression] })] }), _jsx("div", { className: "mt-4 flex justify-center", children: _jsx("button", { type: "button", onClick: downloadPdf, className: "inline-flex rounded-xl border border-white/45 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 active:scale-95", children: "Download PDF" }) })] }));
}
