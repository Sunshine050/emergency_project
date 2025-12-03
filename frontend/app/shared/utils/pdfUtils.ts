// app/shared/utils/pdfUtils.ts
import jsPDF from "jspdf";
import { Report } from "@/shared/types";
import { getLocationText, getSymptomsText } from "./extractors";

const THAI_FONT_BASE64 = "AAEAAAAOAIAAAwBgT1MvMjY0MTA4AA..."; // Replace with full base64 from converter

export const addThaiFont = (doc: jsPDF) => {
  doc.addFileToVFS("Sarabun-Regular.ttf", THAI_FONT_BASE64);
  doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");
};

export const generatePDF = (report: Report): jsPDF => {
  const doc = new jsPDF("p", "mm", "a4");
  addThaiFont(doc);
  doc.setFont("Sarabun", "normal");
  doc.setFontSize(18);
  doc.text(`รายงาน: ${report.title}`, 20, 20);
  doc.setFontSize(12);
  doc.text(`วันที่: ${new Date(report.date).toLocaleDateString("th-TH")}`, 20, 30);
  doc.text(`ประเภท: ${report.type}`, 20, 40);
  doc.text(`ความรุนแรง: ${report.stats.severity ?? "ไม่ระบุ"}`, 20, 50);
  doc.text(`ชื่อผู้ป่วย: ${report.stats.patientName ?? "ไม่ระบุ"}`, 20, 60);
  doc.text(`สถานะ: ${report.stats.status ?? "ไม่ระบุ"}`, 20, 70);
  if (report.details) {
    doc.text(`คำอธิบาย: ${report.details.description ?? "ไม่มี"}`, 20, 80);
    doc.text(`สถานที่: ${getLocationText(report.details)}`, 20, 90);
    const symptoms = Array.isArray(getSymptomsText(report.details)) ? (getSymptomsText(report.details) as string[]).join(", ") : getSymptomsText(report.details) as string;
    doc.text(`อาการ: ${symptoms}`, 20, 100);
  }
  return doc;
};

export const handleDownloadAll = (reports: Report[], toast: any) => {
  try {
    const doc = new jsPDF("p", "mm", "a4");
    addThaiFont(doc);
    doc.setFont("Sarabun", "normal");
    doc.setFontSize(18);
    doc.text("รายงานทั้งหมด", 20, 20);
    doc.setFontSize(12);
    let y = 30;
    reports.forEach((report, index) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.text(`รายงาน ${index + 1}: ${report.title}`, 20, y);
      y += 10;
      doc.text(`วันที่: ${new Date(report.date).toLocaleDateString("th-TH")}`, 20, y);
      y += 10;
      doc.text(`ประเภท: ${report.type}`, 20, y);
      y += 10;
      doc.text(`ความรุนแรง: ${report.stats.severity ?? "ไม่ระบุ"}`, 20, y);
      y += 10;
      doc.text(`ชื่อผู้ป่วย: ${report.stats.patientName ?? "ไม่ระบุ"}`, 20, y);
      y += 10;
      doc.text(`สถานะ: ${report.stats.status ?? "ไม่ระบุ"}`, 20, y);
      y += 15;
    });
    doc.save("all_reports.pdf");
    toast({ title: "ดาวน์โหลดสำเร็จ", description: "รายงานทั้งหมดถูกดาวน์โหลดเรียบร้อยแล้ว" });
  } catch (error) {
    console.error("Error downloading all reports:", error);
    toast({ title: "ข้อผิดพลาด", description: "ไม่สามารถดาวน์โหลดรายงานทั้งหมดได้ กรุณาลองใหม่", variant: "destructive" });
  }
};