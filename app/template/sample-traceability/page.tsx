'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet, Download, Search, CheckCircle2,
  Building2, Calendar, User, ArrowLeft, Layers, ShieldCheck, Box, GitBranch
} from 'lucide-react';

type SheetName = 'project' | 'modules';

const sampleTeamProgrammers = [
  { row: 14, role: 'programmer', name: 'Budi Santoso', spec: 'fullstack' },
  { row: 15, role: 'programmer', name: 'Agung Kusaeri', spec: 'backend' },
  { row: 16, role: 'programmer', name: 'Rina Dewi', spec: 'frontend' },
  { row: 17, role: 'programmer', name: 'Hendra Wijaya', spec: 'backend' },
  { row: 18, role: 'programmer', name: 'Maya Putri', spec: 'frontend' },
];

const sampleTeamElectrical = [
  { row: 22, role: 'electrical', name: 'Dani Wirawan', spec: '-' },
  { row: 23, role: 'electrical', name: 'Eko Prasetyo', spec: '-' },
  { row: 24, role: 'electrical', name: 'Bambang Susilo', spec: '-' },
];

const sampleTeamSales = [
  { row: 28, role: 'sales', name: 'Citra Lestari', spec: '-' },
];

const sampleTraceabilityFeatures = [
  // Module 1: Master Data Material & Lineage (10)
  { id: 1, module: 'Master Data Material & Lineage', feature: 'Master Data Raw Material & Component', sub: 'Kategori Material (Raw, Semi-FG, FG)', status: 'Completed' },
  { id: 2, module: 'Master Data Material & Lineage', feature: 'BOM (Bill of Materials) Multi-Level', sub: 'Part Explosion & Tree Visualization', status: 'Completed' },
  { id: 3, module: 'Master Data Material & Lineage', feature: 'Lot & Batch Numbering Rule Definition', sub: 'Auto-Generate Rule by Date & Shift', status: 'Completed' },
  { id: 4, module: 'Master Data Material & Lineage', feature: 'Vendor & Supplier Certificate Mgmt', sub: 'Upload Certificate of Conformance', status: 'Completed' },
  { id: 5, module: 'Master Data Material & Lineage', feature: 'Barcode & QR Code Label Generator', sub: 'Standard GS1-128 & DataMatrix Format', status: 'Completed' },
  { id: 6, module: 'Master Data Material & Lineage', feature: 'Machine & Workstation Mapping', sub: 'IP Station & PLC Node Binding', status: 'Completed' },
  { id: 7, module: 'Master Data Material & Lineage', feature: 'Quality Inspection Criteria Setup', sub: 'Upper/Lower Tolerance Parameters', status: 'Completed' },
  { id: 8, module: 'Master Data Material & Lineage', feature: 'Warehouse Bin & Shelf Mapping', sub: 'Zone RFID Tagging & Bin Code', status: 'Completed' },
  { id: 9, module: 'Master Data Material & Lineage', feature: 'Expiry & Shelf Life Parameters', sub: 'Alert Expiry Warning Days', status: 'In Progress' },
  { id: 10, module: 'Master Data Material & Lineage', feature: 'Production Line Routing Sequence', sub: 'Station Step Order Configuration', status: 'In Progress' },

  // Module 2: Inbound Supply Chain Traceability (10)
  { id: 11, module: 'Inbound Supply Chain Traceability', feature: 'Receiving Goods Scan', sub: 'Scan QR Code Supplier Delivery Invoice', status: 'Completed' },
  { id: 12, module: 'Inbound Supply Chain Traceability', feature: 'Supplier Lot Registration & COA', sub: 'Upload Certificate of Analysis', status: 'Completed' },
  { id: 13, module: 'Inbound Supply Chain Traceability', feature: 'Raw Material Quality Sampling', sub: 'Pass / Fail Inspection Tagging', status: 'Completed' },
  { id: 14, module: 'Inbound Supply Chain Traceability', feature: 'Quarantine Stock Management', sub: 'Hold Defective Batch Material', status: 'Completed' },
  { id: 15, module: 'Inbound Supply Chain Traceability', feature: 'Material Putaway Handheld Scanner', sub: 'Barcode Bin Location Registration', status: 'Completed' },
  { id: 16, module: 'Inbound Supply Chain Traceability', feature: 'FIFO / FEFO Stock Issue Control', sub: 'Auto System Pick Recommendation', status: 'Completed' },
  { id: 17, module: 'Inbound Supply Chain Traceability', feature: 'Supplier Defect & RMA Tracking', sub: 'Return Material Authorization Form', status: 'In Progress' },
  { id: 18, module: 'Inbound Supply Chain Traceability', feature: 'Vendor Traceability Audit Report', sub: 'Supplier Lot Accuracy Matrix', status: 'In Progress' },
  { id: 19, module: 'Inbound Supply Chain Traceability', feature: 'Material Cross-Docking Station', sub: 'Direct Line Feeding Scan', status: 'In Progress' },
  { id: 20, module: 'Inbound Supply Chain Traceability', feature: 'Serialized Reel & Coil Tracking', sub: 'Component Reel Scan for SMD Line', status: 'In Progress' },

  // Module 3: Production Assembly & WIP Tracking (10)
  { id: 21, module: 'Production Assembly & WIP Tracking', feature: 'Production Work Order Generation', sub: 'Schedule Line Release & Target', status: 'Completed' },
  { id: 22, module: 'Production Assembly & WIP Tracking', feature: 'Station-to-Station Component Scan', sub: 'Kitting List Verification', status: 'Completed' },
  { id: 23, module: 'Production Assembly & WIP Tracking', feature: 'Automated PLC Data Capture Engine', sub: 'Realtime Machine Signal Reader', status: 'Completed' },
  { id: 24, module: 'Production Assembly & WIP Tracking', feature: 'Interlock Station Line System', sub: 'Prevent Assembly of Unpassed Part', status: 'Completed' },
  { id: 25, module: 'Production Assembly & WIP Tracking', feature: 'Component Swap & Repair History', sub: 'Serial Replacement Traceability', status: 'Completed' },
  { id: 26, module: 'Production Assembly & WIP Tracking', feature: 'Workstation Cycle & Takt Time Log', sub: 'Realtime Station Bottleneck Chart', status: 'In Progress' },
  { id: 27, module: 'Production Assembly & WIP Tracking', feature: 'Operator Skill Matrix Check', sub: 'Scan Operator ID Badge before Run', status: 'In Progress' },
  { id: 28, module: 'Production Assembly & WIP Tracking', feature: 'WIP Inventory Buffer Transit', sub: 'Buffer Station Rack Scanning', status: 'In Progress' },
  { id: 29, module: 'Production Assembly & WIP Tracking', feature: 'Sub-Assembly Serial Binding', sub: 'Frame & Sub-Engine Serial Linking', status: 'In Progress' },
  { id: 30, module: 'Production Assembly & WIP Tracking', feature: 'Downtime & Line Stop Genealogy', sub: 'Machine Alarm & Defect Event Log', status: 'In Progress' },

  // Module 4: Quality Assurance & Genealogy (10)
  { id: 31, module: 'Quality Assurance & Genealogy', feature: 'In-Process Quality (IPQC) Gate', sub: 'Checkpoint Dimensional Inspection', status: 'Completed' },
  { id: 32, module: 'Quality Assurance & Genealogy', feature: 'Final Quality Gate & EOL Test', sub: 'End-of-Line Tester Result Sync', status: 'Completed' },
  { id: 33, module: 'Quality Assurance & Genealogy', feature: 'Defect Root Cause Analysis', sub: 'Genealogy by Lot, Machine & Shift', status: 'Completed' },
  { id: 34, module: 'Quality Assurance & Genealogy', feature: 'Non-Conformance Report (NCR)', sub: 'CAPA Action Workflow & Sign-off', status: 'In Progress' },
  { id: 35, module: 'Quality Assurance & Genealogy', feature: 'Auto Quarantine Defective Batch', sub: 'Instant Line Stop Signal Output', status: 'In Progress' },
  { id: 36, module: 'Quality Assurance & Genealogy', feature: 'Vision AI Camera Inspection Log', sub: 'Image Capture Verification Record', status: 'In Progress' },
  { id: 37, module: 'Quality Assurance & Genealogy', feature: 'Torque & Fastener Data Binding', sub: 'Screw Torque Newton-Meter Log', status: 'In Progress' },
  { id: 38, module: 'Quality Assurance & Genealogy', feature: 'Rework & Repair History Log', sub: 'Repair Ticket & Re-Test Clearance', status: 'In Progress' },
  { id: 39, module: 'Quality Assurance & Genealogy', feature: 'First Pass Yield (FPY) Dashboard', sub: 'Scrap Rate Genealogy by Line', status: 'Planning' },
  { id: 40, module: 'Quality Assurance & Genealogy', feature: 'Calibration & Gauge R&R Log', sub: 'Tool Calibration Validity Check', status: 'Planning' },

  // Module 5: Serialization & GTIN Management (10)
  { id: 41, module: 'Serialization & GTIN Management', feature: 'Unique Serial Number Generator', sub: 'Global Trade Item Number (GTIN)', status: 'Completed' },
  { id: 42, module: 'Serialization & GTIN Management', feature: 'High-Speed Direct Part Marking', sub: 'Laser Etching & Dot Peen Verification', status: 'Completed' },
  { id: 43, module: 'Serialization & GTIN Management', feature: '2D DataMatrix Encoding Check', sub: 'Grading Verification (ISO 15415)', status: 'Completed' },
  { id: 44, module: 'Serialization & GTIN Management', feature: 'Parent-Child Aggregation', sub: 'Item -> Box -> Carton -> Pallet', status: 'In Progress' },
  { id: 45, module: 'Serialization & GTIN Management', feature: 'Serial Status State Machine', sub: 'Active, Scrapped, Shipped, Recalled', status: 'In Progress' },
  { id: 46, module: 'Serialization & GTIN Management', feature: 'Anti-Counterfeiting Engine', sub: 'Duplicate Serial Code Prevention', status: 'In Progress' },
  { id: 47, module: 'Serialization & GTIN Management', feature: 'Mobile Scanner App Terminal', sub: 'Zebra / Honeywell Android Terminal', status: 'In Progress' },
  { id: 48, module: 'Serialization & GTIN Management', feature: 'Offline Scan Buffer Sync', sub: 'Local SQLite Buffer for Network Loss', status: 'Planning' },
  { id: 49, module: 'Serialization & GTIN Management', feature: 'Print & Apply Auto-Labeler', sub: 'Trigger Servo Applicator Signal', status: 'Planning' },
  { id: 50, module: 'Serialization & GTIN Management', feature: 'Serialization Audit Log', sub: 'Timestamp & User Action Integrity', status: 'Planning' },

  // Module 6: Outbound Logistics & Distribution (10)
  { id: 51, module: 'Outbound Logistics & Distribution', feature: 'Picking List Scanning Control', sub: 'FIFO Validation Scan before Loading', status: 'Planning' },
  { id: 52, module: 'Outbound Logistics & Distribution', feature: 'Palletization Loading Scan', sub: 'Pallet QR Code Creation & Manifest', status: 'Planning' },
  { id: 53, module: 'Outbound Logistics & Distribution', feature: 'Shipping Dispatch Verification', sub: 'DO / Sales Order Matching Scan', status: 'Planning' },
  { id: 54, module: 'Outbound Logistics & Distribution', feature: 'Container Temperature Logger', sub: 'Cold Chain Data Logger Integration', status: 'Planning' },
  { id: 55, module: 'Outbound Logistics & Distribution', feature: 'Electronic Proof of Delivery (e-POD)', sub: 'Customer E-Signature & GPS Tag', status: 'Planning' },
  { id: 56, module: 'Outbound Logistics & Distribution', feature: 'Customs HS Code Lineage', sub: 'Export Documentation Serial Linking', status: 'Planning' },
  { id: 57, module: 'Outbound Logistics & Distribution', feature: 'Return & Warranty Verification', sub: 'Scan Returned Unit Serial Number', status: 'Planning' },
  { id: 58, module: 'Outbound Logistics & Distribution', feature: 'Distributor Receiving Confirmation', sub: 'Dealer Node Portal Inbound Scan', status: 'Planning' },
  { id: 59, module: 'Outbound Logistics & Distribution', feature: '3PL Logistics API Integration', sub: 'Realtime Waybill Tracking API', status: 'Planning' },
  { id: 60, module: 'Outbound Logistics & Distribution', feature: 'Dispatch Staging Bay Management', sub: 'Staging Area Queue & Alert', status: 'Planning' },

  // Module 7: Product Recall & Rapid Genealogy (10)
  { id: 61, module: 'Product Recall & Rapid Genealogy', feature: 'One-Click Forward Traceability', sub: 'Raw Lot -> Finished Unit -> Customer', status: 'Completed' },
  { id: 62, module: 'Product Recall & Rapid Genealogy', feature: 'One-Click Backward Traceability', sub: 'Customer Serial -> Assembly -> Raw Lot', status: 'Completed' },
  { id: 63, module: 'Product Recall & Rapid Genealogy', feature: 'Rapid Recall Execution', sub: 'Isolate Impacted Serial Numbers', status: 'In Progress' },
  { id: 64, module: 'Product Recall & Rapid Genealogy', feature: 'Customer Notification Center', sub: 'Automated Recall Email & Letter', status: 'Planning' },
  { id: 65, module: 'Product Recall & Rapid Genealogy', feature: 'Component Exposure Analysis', sub: 'Identify All Finished Goods with Lot X', status: 'Planning' },
  { id: 66, module: 'Product Recall & Rapid Genealogy', feature: 'Regulatory Compliance Report', sub: 'IATF 16949 & ISO 9001 Audit Export', status: 'Planning' },
  { id: 67, module: 'Product Recall & Rapid Genealogy', feature: 'Global Warehouse Bin Lockout', sub: 'Remote Freeze Affected Stock Bins', status: 'Planning' },
  { id: 68, module: 'Product Recall & Rapid Genealogy', feature: 'Mock Recall Simulation Audit', sub: 'Time-to-Trace Metric SLA Logger', status: 'Planning' },
  { id: 69, module: 'Product Recall & Rapid Genealogy', feature: 'Supplier Liability Claim Log', sub: 'Debit Note & Defect Evidence File', status: 'Planning' },
  { id: 70, module: 'Product Recall & Rapid Genealogy', feature: 'Replacement Unit Dispatch', sub: 'Priority Order Dispatch for Recall', status: 'Planning' },

  // Module 8: IoT, PLC & Machine Integration Engine (10)
  { id: 71, module: 'IoT, PLC & Machine Integration Engine', feature: 'OPC-UA & Modbus Driver', sub: 'Direct PLC Tag Read/Write Gateway', status: 'Completed' },
  { id: 72, module: 'IoT, PLC & Machine Integration Engine', feature: 'Line Interlock Relay Control', sub: 'Hardware Stop Signal Trigger', status: 'Completed' },
  { id: 73, module: 'IoT, PLC & Machine Integration Engine', feature: 'Serial Barcode Scanner Engine', sub: 'RS232 / Ethernet TCP Direct Listener', status: 'Completed' },
  { id: 74, module: 'IoT, PLC & Machine Integration Engine', feature: 'Smart Scale Weight Verification', sub: 'Tolerance Check & Tare Auto-Subtract', status: 'In Progress' },
  { id: 75, module: 'IoT, PLC & Machine Integration Engine', feature: 'Environmental Sensor Monitor', sub: 'Cleanroom Temp & Humidity Log', status: 'Pending' },
  { id: 76, module: 'IoT, PLC & Machine Integration Engine', feature: 'Machine Vision Camera Pass/Fail', sub: 'Cognex / Keyence Camera Integration', status: 'Pending' },
  { id: 77, module: 'IoT, PLC & Machine Integration Engine', feature: 'Automated Guided Vehicle (AGV)', sub: 'AGV Material Request Trigger API', status: 'Pending' },
  { id: 78, module: 'IoT, PLC & Machine Integration Engine', feature: 'Edge Gateway Persistence', sub: 'Local Message Queue (MQTT/RabbitMQ)', status: 'Pending' },
  { id: 79, module: 'IoT, PLC & Machine Integration Engine', feature: 'Preventive Maintenance Link', sub: 'Machine Cycle Count Correlation', status: 'Pending' },
  { id: 80, module: 'IoT, PLC & Machine Integration Engine', feature: 'RFID Antenna Multi-Tag Reader', sub: 'High-Speed Conveyor Tag Reader', status: 'Pending' },

  // Module 9: Mobile Field App & Customer Portal (10)
  { id: 81, module: 'Mobile Field App & Customer Portal', feature: 'Field Service Scanner App', sub: 'Technician Serial Scan & History', status: 'In Progress' },
  { id: 82, module: 'Mobile Field App & Customer Portal', feature: 'Customer Authenticity Verification', sub: 'Public QR Code Scan Web Portal', status: 'In Progress' },
  { id: 83, module: 'Mobile Field App & Customer Portal', feature: 'Digital Product Passport (DPP)', sub: 'Material Origin & Recyclability Data', status: 'Planning' },
  { id: 84, module: 'Mobile Field App & Customer Portal', feature: 'Warranty Registration Portal', sub: 'Register Customer Serial & Invoice', status: 'Planning' },
  { id: 85, module: 'Mobile Field App & Customer Portal', feature: 'Spare Part Authenticity Finder', sub: 'Compatible Genuine Part Lookup', status: 'Planning' },
  { id: 86, module: 'Mobile Field App & Customer Portal', feature: 'Offline Field Repair Logger', sub: 'Sync Repair Ticket on Reconnect', status: 'Planning' },
  { id: 87, module: 'Mobile Field App & Customer Portal', feature: 'Dealer Inventory Scanner App', sub: 'Dealer Stock Count Verification', status: 'Planning' },
  { id: 88, module: 'Mobile Field App & Customer Portal', feature: 'Recall Push Alert Notification', sub: 'Mobile App Alert to End Users', status: 'Planning' },
  { id: 89, module: 'Mobile Field App & Customer Portal', feature: 'Multi-Language Public Portal', sub: 'Indonesian, English & Japanese UI', status: 'Planning' },
  { id: 90, module: 'Mobile Field App & Customer Portal', feature: 'Customer Incident Report Form', sub: 'Attach Serial Photo & Defect Note', status: 'Planning' },

  // Module 10: Traceability Analytics & Dashboards (10)
  { id: 91, module: 'Traceability Analytics & Dashboards', feature: 'Executive Traceability Coverage', sub: '% Digitized Assembly Stations', status: 'Completed' },
  { id: 92, module: 'Traceability Analytics & Dashboards', feature: 'Yield & Scrap Genealogy Heatmap', sub: 'Loss Analysis by Shift & Machine', status: 'In Progress' },
  { id: 93, module: 'Traceability Analytics & Dashboards', feature: 'Realtime Line Interlock Monitor', sub: 'Prevented Misassembly Counter', status: 'In Progress' },
  { id: 94, module: 'Traceability Analytics & Dashboards', feature: 'Supplier Quality Matrix Graph', sub: 'Vendor Defect & Return Comparison', status: 'Planning' },
  { id: 95, module: 'Traceability Analytics & Dashboards', feature: 'Recall Response Time SLA', sub: 'Average Seconds to Locate Affected Lot', status: 'Planning' },
  { id: 96, module: 'Traceability Analytics & Dashboards', feature: 'OEE & Traceability Correlation', sub: 'Overall Equipment Efficiency Metric', status: 'Planning' },
  { id: 97, module: 'Traceability Analytics & Dashboards', feature: 'System Audit Trail & Log', sub: 'Sensitive Record Mutation History', status: 'Planning' },
  { id: 98, module: 'Traceability Analytics & Dashboards', feature: 'Role & Permission Management', sub: 'Station-Level Access Control (RBAC)', status: 'Planning' },
  { id: 99, module: 'Traceability Analytics & Dashboards', feature: 'Database Archiving & Retention', sub: 'Long-Term 10-Year Data Partitioning', status: 'Planning' },
  { id: 100, module: 'Traceability Analytics & Dashboards', feature: 'Scheduled Report Automation', sub: 'Auto Email Daily Traceability Summary', status: 'Planning' },
];

export default function SampleTraceabilityPage() {
  const [activeSheet, setActiveSheet] = useState<SheetName>('project');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadExcel = async () => {
    setIsDownloading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
      const res = await fetch(`${apiUrl}/api/templates/sample-traceability`);
      if (!res.ok) throw new Error('Gagal mengunduh file sample Traceability');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'import-project-sample-traceability.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Gagal download sample Traceability.');
    } finally {
      setIsDownloading(false);
    }
  };

  const filteredFeatures = sampleTraceabilityFeatures.filter(
    (f) =>
      f.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.feature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.sub.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 space-y-6 font-sans">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              href="/templates"
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Sample Case Study
                </span>
                <span className="text-xs text-slate-400">PRJ-TRC-002</span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                Enterprise Manufacturing & Supply Chain Traceability System
              </h1>
            </div>
          </div>

          <button
            onClick={handleDownloadExcel}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm text-xs transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isDownloading ? 'Mengunduh...' : 'Download Sample Traceability (.xlsx)'}
          </button>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Customer</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5 truncate">PT Sumi Rubber Indonesia</div>
            <div className="text-[10px] text-emerald-600 font-medium">Manufacturing Sector</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Tim Project</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">9 Personel</div>
            <div className="text-[10px] text-slate-400">5 Prog • 3 Elec • 1 Sales</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Total Module</div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">10 Module</div>
            <div className="text-[10px] text-slate-400">Lineage to Analytics</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs text-slate-500 font-medium">Total Fitur</div>
            <div className="text-lg font-bold text-indigo-600 mt-0.5">100 Feature</div>
            <div className="text-[10px] text-slate-400">Full Serial Lineage</div>
          </div>
        </div>

        {/* Workbook Preview */}
        <div className="bg-white border border-slate-300 rounded-xl shadow-sm overflow-hidden">
          {/* Tab Navigation */}
          <div className="bg-slate-200 border-b border-slate-300 px-4 pt-2 flex items-center justify-between text-xs select-none">
            <div className="flex items-end gap-1">
              {[
                { key: 'project', label: 'Sheet 1: Project & Tim (9 Personel)' },
                { key: 'modules', label: 'Sheet 2: Modul & Fitur (100 Fitur)' },
              ].map((sheet) => (
                <button
                  key={sheet.key}
                  onClick={() => setActiveSheet(sheet.key as SheetName)}
                  className={`px-4 py-2 rounded-t-md border border-b-0 font-semibold transition-colors ${
                    activeSheet === sheet.key
                      ? 'bg-white border-slate-300 text-slate-800 -mb-px shadow-sm'
                      : 'bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {sheet.label}
                </button>
              ))}
            </div>

            {activeSheet === 'modules' && (
              <div className="relative mb-1">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari module / feature..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            {/* SHEET 1: PROJECT & TIM */}
            {activeSheet === 'project' && (
              <table className="w-full border-collapse text-xs" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300">
                    <th className="w-8 border border-slate-300 text-slate-400 text-center py-1 font-normal"></th>
                    <th className="w-44 border border-slate-300 text-slate-500 text-center py-1 font-semibold">A</th>
                    <th className="border border-slate-300 text-slate-500 text-center py-1 font-semibold">B</th>
                    <th className="w-56 border border-slate-300 text-slate-500 text-center py-1 font-semibold">C</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Section A Header */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">1</td>
                    <td colSpan={3} className="border border-slate-300 bg-emerald-700 text-white font-bold px-3 py-2 tracking-widest text-[11px] uppercase">
                      ▶ A. Informasi Project
                    </td>
                  </tr>

                  {/* Fields */}
                  {[
                    { label: 'Code *', val: 'PRJ-TRC-002' },
                    { label: 'Name *', val: 'Enterprise Manufacturing & Supply Chain Traceability System' },
                    { label: 'Status *', val: 'ongoing' },
                    { label: 'PIC / Project Manager *', val: 'Budi Santoso' },
                    { label: 'Customer', val: 'PT Sumi Rubber Indonesia' },
                    { label: 'Start Date *', val: '2026-09-01' },
                    { label: 'End Date', val: '2027-03-31' },
                    { label: 'Description', val: 'Sistem Lacak & Telusur Komponen Manufaktur, Serial Number QR Code, Direct Part Marking, Interlock Assembly Station, IPQC, dan Batch Recall Analysis.' },
                  ].map((field, idx) => (
                    <tr key={field.label}>
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{2 + idx}</td>
                      <td className="border border-slate-300 px-3 py-1.5 font-bold bg-emerald-600 text-white text-center">{field.label}</td>
                      <td colSpan={2} className="border border-slate-300 px-3 py-1.5 font-medium">{field.val}</td>
                    </tr>
                  ))}

                  {/* Spacer */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">10</td>
                    <td colSpan={3} className="border border-slate-300 bg-white py-1"></td>
                  </tr>

                  {/* Section B Header */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">11</td>
                    <td colSpan={3} className="border border-slate-300 bg-emerald-700 text-white font-bold px-3 py-2 tracking-widest text-[11px] uppercase">
                      ▶ B. Anggota Tim
                    </td>
                  </tr>

                  {/* Programmer */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">12</td>
                    <td colSpan={3} className="border border-slate-300 bg-emerald-50 text-emerald-800 font-bold px-3 py-1 text-[11px]">
                      1. Programmer (Maksimal 5 Baris)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">13</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-emerald-600 text-white font-bold text-center">Role Type</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-emerald-600 text-white font-bold text-center">Nama Anggota *</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-slate-600 text-white font-bold text-center">Spesialisasi</td>
                  </tr>
                  {sampleTeamProgrammers.map((m) => (
                    <tr key={m.row}>
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{m.row}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-medium bg-emerald-50 text-emerald-800">{m.role}</td>
                      <td className="border border-slate-300 px-3 py-1.5 font-medium">{m.name}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">{m.spec}</td>
                    </tr>
                  ))}

                  {/* Electrical */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">20</td>
                    <td colSpan={3} className="border border-slate-300 bg-emerald-50 text-emerald-800 font-bold px-3 py-1 text-[11px]">
                      2. Electrical (Maksimal 3 Baris)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">21</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-emerald-600 text-white font-bold text-center">Role Type</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-emerald-600 text-white font-bold text-center">Nama Anggota *</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-slate-600 text-white font-bold text-center">Spesialisasi</td>
                  </tr>
                  {sampleTeamElectrical.map((m) => (
                    <tr key={m.row}>
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{m.row}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-medium bg-amber-50 text-amber-800">{m.role}</td>
                      <td className="border border-slate-300 px-3 py-1.5 font-medium">{m.name}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">{m.spec}</td>
                    </tr>
                  ))}

                  {/* Sales */}
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">26</td>
                    <td colSpan={3} className="border border-slate-300 bg-emerald-50 text-emerald-800 font-bold px-3 py-1 text-[11px]">
                      3. Sales (Maksimal 1 Baris)
                    </td>
                  </tr>
                  <tr>
                    <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">27</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-emerald-600 text-white font-bold text-center">Role Type</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-emerald-600 text-white font-bold text-center">Nama Anggota *</td>
                    <td className="border border-slate-300 px-3 py-1.5 bg-slate-600 text-white font-bold text-center">Spesialisasi</td>
                  </tr>
                  {sampleTeamSales.map((m) => (
                    <tr key={m.row}>
                      <td className="bg-slate-200 border border-slate-300 text-slate-400 text-center py-1 text-[10px]">{m.row}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center font-medium bg-cyan-50 text-cyan-800">{m.role}</td>
                      <td className="border border-slate-300 px-3 py-1.5 font-medium">{m.name}</td>
                      <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">{m.spec}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* SHEET 2: MODUL & FITUR (100 FITUR) */}
            {activeSheet === 'modules' && (
              <table className="w-full border-collapse text-xs" style={{ fontFamily: 'Calibri, Arial, sans-serif' }}>
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-300">
                    <th className="w-12 border border-slate-300 text-slate-500 text-center py-1 font-semibold">Row</th>
                    <th className="w-64 border border-slate-300 text-slate-700 text-left px-3 py-1.5 font-bold">Nama Module *</th>
                    <th className="w-64 border border-slate-300 text-slate-700 text-left px-3 py-1.5 font-bold">Nama Feature *</th>
                    <th className="border border-slate-300 text-slate-700 text-left px-3 py-1.5 font-bold">Nama Sub Feature</th>
                    <th className="w-36 border border-slate-300 text-slate-700 text-center px-3 py-1.5 font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeatures.map((item, idx) => {
                    const statusVal = item.status;
                    let badgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
                    if (statusVal === 'Completed') badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                    if (statusVal === 'In Progress') badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
                    if (statusVal === 'Pending') badgeBg = 'bg-purple-100 text-purple-800 border-purple-300';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="bg-slate-100 border border-slate-300 text-slate-500 text-center py-1 text-[10px]">{idx + 3}</td>
                        <td className="border border-slate-300 px-3 py-1.5 font-semibold text-emerald-800 bg-emerald-50/50">{item.module}</td>
                        <td className="border border-slate-300 px-3 py-1.5 font-medium text-slate-800">{item.feature}</td>
                        <td className="border border-slate-300 px-3 py-1.5 text-slate-600">{item.sub}</td>
                        <td className="border border-slate-300 px-3 py-1.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeBg}`}>
                            {statusVal}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFeatures.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 italic">
                        Tidak ada fitur yang cocok dengan pencarian "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
