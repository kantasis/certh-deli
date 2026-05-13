import React, { useEffect, useState } from "react";
import { Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import * as AuthService from "../services/auth.service";
import {
    getUserDashboards,
    createDashboard,
    renameDashboard,
    saveGraphToDashboard,
    deleteDashboard,
} from "../services/dashboard.service";

interface SaveGraphButtonProps {
    iframeUrl: { url: string; params?: any; preview?: string };
}

interface Graph {
    id: number;
    url: string;
    params?: any;
    page_name: string;
}

interface Dashboard {
    id: number;
    name: string;
    graphs: Graph[];
}

const MAX_DASHBOARDS = 3;
const MAX_GRAPHS_PER_DASHBOARD = 6;


const SaveGraphButton: React.FC<SaveGraphButtonProps> = ({ iframeUrl }) => {
    const location = useLocation();
    const [userId, setUserId] = useState<string | null>(null);
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(null);
    const [newDashboardName, setNewDashboardName] = useState<string>("");
    const [renamingName, setRenamingName] = useState<string>("");
    const [graphToReplaceIndex, setGraphToReplaceIndex] = useState<number | null>(null);
    const [graphToDeleteIndex, setGraphToDeleteIndex] = useState<number | null>(null);

    const [showSelectModal, setShowSelectModal] = useState(false);
    const [showReplaceModal, setShowReplaceModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);

    const [modalTitle, setModalTitle] = useState<string>("");
    const [modalMessage, setModalMessage] = useState<React.ReactNode>("");
    const [modalVariant, setModalVariant] = useState<"success" | "danger">("success");

    // ---------- Utilities ----------
    const resetModals = () => {
        setShowSelectModal(false);
        setShowReplaceModal(false);
        setGraphToReplaceIndex(null);
    };

    const showResult = (title: string, message: React.ReactNode, variant: "success" | "danger") => {
        setModalTitle(title);
        setModalMessage(message);
        setModalVariant(variant);
        setShowResultModal(true);
    };

    const ignoreFilters = new Set(["theme", "orgid", "panelid", "refresh", "fullscreen", "kiosk", "edit", "crcfactor"]);

    const analysisValueMap: Record<string, string> = {
        exposure_weighted: "Overview: Exposure Weighted",
        quick_wins: "Quick Wins",
        effect_sev_unit: "Overview: Effect per SEV Unit",
        sf_intervention: "Single-Factor Intervention",
        sf_target: "Single-Factor Target",
    };

    function extractFiltersFromParams(params: Record<string, any>): Record<string, string[]> {
        const filters: Record<string, string[]> = {};
        for (const key in params) {
            if (!params.hasOwnProperty(key)) continue;
            let label = key
                .replace(/([a-z])([A-Z])/g, "$1 $2")
                .replace(/_/g, " ")
                .replace(/\b\w/g, char => char.toUpperCase());
            const value = params[key];
            if (Array.isArray(value)) {
                filters[label] = value.map(String);
            } else if (typeof value === "string") {
                filters[label] = [value];
            } else if (value !== null && value !== undefined) {
                filters[label] = [String(value)];
            }
        }
        return filters;
    }

    const extractFiltersFromUrl = (url: string): Record<string, string[]> => {
        const filters: Record<string, string[]> = {};
        try {
            const parsedUrl = new URL(url);
            const seen = new Set<string>();
            for (const [key] of parsedUrl.searchParams.entries()) {
                if (key.startsWith("var-") && !seen.has(key)) {
                    seen.add(key);
                    const filterName = key
                        .replace(/^var-/, "")
                        .replace(/_filter$/, "")
                        .replace(/_/g, " ")
                        .toLowerCase();
                    if (ignoreFilters.has(filterName)) continue;
                    const values = parsedUrl.searchParams.getAll(key);
                    filters[filterName] = values;
                }
            }
        } catch {
            // invalid URL — skip silently
        }
        return filters;
    };

    const formatFilterLabel = (raw: string): string => {
        const cleaned = raw.toLowerCase().replace(/ filter$/, "").replace(/_/g, " ");
        const mappings: Record<string, string> = {
            country: "Countries",
            minyear: "Min Year",
            maxyear: "Max Year",
            sex: "Sex",
            age: "Age",
            region: "Regions",
            riskfactor: "Risk Factor",
            crcfactor: "CRC Factor",
            yearlag: "Year Lag",
            analysis: "Analysis",
            "selected country": "Country",
            "max year int": "Max Year",
            "min year int": "Min Year",
            "diet type": "Risk Factor",
            "screening data metric": "Screening Data Metric",
        };
        return mappings[cleaned] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    };

    function parseSavedUrl(
        saved_url: string | { url?: string; params?: Record<string, any> }
    ): { srcUrl: string; filters: Record<string, string[]> } {
        let srcUrl = "";
        let filters: Record<string, string[]> = {};
        try {
            if (typeof saved_url === "string") {
                try {
                    const maybeObj = JSON.parse(saved_url);
                    if (maybeObj && typeof maybeObj === "object") {
                        srcUrl = maybeObj.url || "";
                        filters = extractFiltersFromParams(maybeObj.params || {});
                        return { srcUrl, filters };
                    }
                } catch {
                    // not JSON
                }
                if (saved_url.startsWith("data:image")) return { srcUrl: "", filters: {} };
                srcUrl = saved_url;
                filters = extractFiltersFromUrl(saved_url);
            } else if (typeof saved_url === "object" && saved_url !== null) {
                srcUrl = saved_url.url || "";
                filters = extractFiltersFromParams(saved_url.params || {});
            }
        } catch {
            // parse error — return empty
        }
        return { srcUrl, filters };
    }

    // ---------- Load Dashboards ----------
    useEffect(() => {
        const user = AuthService.getCurrentUser?.();
        if (user?.id) {
            setUserId(user.id);
            loadDashboards(user.id);
        }
    }, []);

    const loadDashboards = async (uid: string) => {
        const data = await getUserDashboards(uid);
        setDashboards(
            data.map((d: any) => ({
                ...d,
                graphs: (d.graphs || []).map((g: any) => ({
                    id: g.id,
                    url: typeof g.saved_url === "string" ? g.saved_url : g.saved_url?.url || "",
                    params: typeof g.saved_url === "object" ? g.saved_url?.params : undefined,
                    page_name: g.page_name,
                })),
            }))
        );
    };

    // ---------- Handlers ----------
    const handleCreateDashboard = async () => {
        if (!userId || !newDashboardName.trim()) return;
        if (dashboards.length >= MAX_DASHBOARDS) {
            return showResult("Limit Reached", "You reached the max dashboard limit (3).", "danger");
        }
        const newDb = await createDashboard(userId, newDashboardName);
        setDashboards(prev => [...prev, { ...newDb, graphs: [] }]);
        setNewDashboardName("");
        window.dispatchEvent(new CustomEvent("dashboardCreated"));
    };

    const handleRenameDashboard = async () => {
        if (!selectedDashboardId || !renamingName.trim()) return;
        await renameDashboard(selectedDashboardId, renamingName);
        setDashboards(prev =>
            prev.map(d => (d.id === selectedDashboardId ? { ...d, name: renamingName } : d))
        );
        setRenamingName("");
    };

    const handleSaveGraph = async (replaceIndex?: number) => {
        if (!userId || !selectedDashboardId) return;
        const dashboard = dashboards.find(d => d.id === selectedDashboardId);
        if (!dashboard) return;

        const urlToSave =
            typeof iframeUrl === "string"
                ? iframeUrl
                : iframeUrl?.params
                    ? { url: iframeUrl.url, params: iframeUrl.params }
                    : iframeUrl.url;

        if (!userId || !urlToSave) {
            return showResult("Missing Data", "You must be logged in and have a valid graph.", "danger");
        }
        if (dashboard.graphs.length >= MAX_GRAPHS_PER_DASHBOARD && replaceIndex === undefined) {
            return showResult(
                "Limit Reached",
                <>You've reached the maximum of {MAX_GRAPHS_PER_DASHBOARD} saved graphs in this dashboard.<br />Please delete some graphs to save a new view.</>,
                "danger"
            );
        }

        try {
            if (replaceIndex !== undefined) {
                await deleteDashboard(dashboard.graphs[replaceIndex].id);
            }
            const pageName = location.pathname.replace("/", "") || "home";
            await saveGraphToDashboard(selectedDashboardId, urlToSave as any, pageName, userId);
            await loadDashboards(userId);
            resetModals();
            showResult("Saved", "Graph saved successfully.", "success");
        } catch (err: any) {
            showResult("Error", err?.response?.data?.error || "Could not save graph.", "danger");
        }
    };

    const handleDeleteGraph = async () => {
        if (!selectedDashboardId || graphToDeleteIndex === null) return;
        const dashboard = dashboards.find(d => d.id === selectedDashboardId);
        if (!dashboard) return;
        await deleteDashboard(dashboard.graphs[graphToDeleteIndex].id);
        setDashboards(prev =>
            prev.map(d =>
                d.id === selectedDashboardId
                    ? { ...d, graphs: d.graphs.filter((_, idx) => idx !== graphToDeleteIndex) }
                    : d
            )
        );
        setShowDeleteConfirmModal(false);
        setGraphToDeleteIndex(null);
    };

    const selectedDashboard = dashboards.find(d => d.id === selectedDashboardId);

    // ---------- JSX ----------
    return (
        <>
            <style>{`
                /* Trigger button */
                .sgb-trigger {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 16px;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    border: 1.5px solid var(--brand, #1f6580);
                    background: var(--brand, #1f6580);
                    color: #fff;
                    transition: border-color 0.2s, background 0.2s;
                }
                .sgb-trigger:hover {
                    background: var(--brand-dark, #185569);
                    border-color: var(--brand-dark, #185569);
                    box-shadow: 0 4px 14px rgba(31,101,128,0.3);
                }

                /* Modal shell */
                .sgb-dialog .modal-content {
                    border-radius: 16px;
                    border: 1px solid var(--border, #e5e7eb);
                    box-shadow: 0 20px 60px rgba(2,6,23,0.18);
                    overflow: hidden;
                }
                .sgb-dialog .modal-header {
                    background: #fff;
                    border-bottom: 1px solid var(--border, #e5e7eb);
                    padding: 18px 20px 14px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .sgb-dialog .modal-title {
                    font-size: 16px !important;
                    font-weight: 700 !important;
                    color: var(--text, #0f172a) !important;
                }
                .sgb-dialog .modal-body { padding: 20px; }
                .sgb-dialog .modal-footer {
                    border-top: 1px solid var(--border, #e5e7eb);
                    padding: 12px 20px 16px;
                    gap: 8px;
                }
                .sgb-dialog .btn-close { opacity: 0.5; }
                .sgb-dialog .btn-close:hover { opacity: 1; }

                /* Modal icon */
                .sgb-modal-icon {
                    width: 34px; height: 34px;
                    border-radius: 9px;
                    background: #e8f2f6;
                    color: var(--brand-dark, #185569);
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }

                /* Section labels */
                .sgb-section { margin-bottom: 18px; }
                .sgb-section:last-child { margin-bottom: 0; }
                .sgb-label {
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.07em;
                    text-transform: uppercase;
                    color: var(--text-muted, #475569);
                    margin-bottom: 7px;
                    display: block;
                }
                .sgb-divider {
                    border: none;
                    border-top: 1px solid var(--border, #e5e7eb);
                    margin: 16px 0;
                }

                /* Inputs */
                .sgb-input-row { display: flex; gap: 8px; }
                .sgb-input {
                    flex: 1;
                    border: 1.5px solid var(--border, #e5e7eb);
                    border-radius: 9px;
                    padding: 8px 12px;
                    font-size: 13.5px;
                    color: var(--text, #0f172a);
                    background: #fff;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-family: inherit;
                }
                .sgb-input:focus {
                    border-color: var(--brand, #1f6580);
                    box-shadow: 0 0 0 3px rgba(31,101,128,0.15);
                }
                .sgb-select {
                    width: 100%;
                    border: 1.5px solid var(--border, #e5e7eb);
                    border-radius: 9px;
                    padding: 8px 12px;
                    font-size: 13.5px;
                    color: var(--text, #0f172a);
                    background: #fff;
                    outline: none;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                    font-family: inherit;
                }
                .sgb-select:focus {
                    border-color: var(--brand, #1f6580);
                    box-shadow: 0 0 0 3px rgba(31,101,128,0.15);
                }

                /* Buttons */
                .sgb-btn {
                    display: inline-flex; align-items: center; gap: 5px;
                    padding: 7px 14px; border-radius: 8px;
                    font-size: 13px; font-weight: 600;
                    cursor: pointer; border: 1.5px solid;
                    transition: background 0.15s, border-color 0.15s, color 0.15s;
                    white-space: nowrap; flex-shrink: 0;
                }
                .sgb-btn-secondary {
                    background: #fff; border-color: var(--border, #e5e7eb); color: var(--text, #0f172a);
                }
                .sgb-btn-secondary:hover { background: var(--muted, #f5f7fb); }
                .sgb-btn-primary {
                    background: var(--brand, #1f6580); border-color: var(--brand, #1f6580); color: #fff;
                }
                .sgb-btn-primary:hover:not(:disabled) { background: var(--brand-dark, #185569); border-color: var(--brand-dark, #185569); }
                .sgb-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .sgb-btn-amber {
                    background: #fff; border-color: #fcd34d; color: #92400e;
                }
                .sgb-btn-amber:hover { background: #fffbeb; border-color: #f59e0b; }
                .sgb-btn-danger {
                    background: #dc2626; border-color: #dc2626; color: #fff;
                }
                .sgb-btn-danger:hover { background: #b91c1c; border-color: #b91c1c; }
                .sgb-btn-sm {
                    padding: 4px 9px; font-size: 12px; border-radius: 6px; gap: 4px;
                }

                /* Graph cards grid */
                .sgb-graphs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 4px; }
                .sgb-graph-card {
                    border: 1px solid var(--border, #e5e7eb);
                    border-radius: 10px;
                    overflow: hidden;
                    background: #fff;
                    transition: box-shadow 0.15s;
                }
                .sgb-graph-card:hover { box-shadow: 0 2px 12px rgba(2,6,23,0.09); }
                .sgb-graph-preview {
                    width: 100%; height: 160px;
                    background: var(--muted, #f5f7fb);
                    position: relative;
                }
                .sgb-graph-preview iframe {
                    width: 100%; height: 100%;
                    border: none; pointer-events: none;
                    border-radius: 0;
                }
                .sgb-graph-preview img {
                    width: 100%; height: 100%;
                    object-fit: contain;
                }
                .sgb-no-preview {
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 12px; color: var(--text-muted, #475569);
                }
                .sgb-graph-actions {
                    display: flex; justify-content: space-between;
                    padding: 6px 8px;
                    border-top: 1px solid var(--border, #e5e7eb);
                    background: #fff;
                }

                /* Result/confirm modal specifics */
                .sgb-result-icon {
                    width: 44px; height: 44px; border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 14px;
                    flex-shrink: 0;
                }
                .sgb-result-icon-success { background: #f0fdf4; color: #15803d; }
                .sgb-result-icon-danger { background: #fef2f2; color: #dc2626; }
                .sgb-result-message { text-align: center; font-size: 14px; color: var(--text-muted, #475569); line-height: 1.55; }
                .sgb-result-title { text-align: center; font-size: 17px; font-weight: 700; color: var(--text, #0f172a); margin-bottom: 6px; }
                .sgb-warn-box {
                    background: #fef2f2; border: 1px solid #fecaca; border-radius: 9px;
                    padding: 12px 14px; font-size: 13.5px; color: #991b1b; line-height: 1.5;
                }
                .sgb-warn-box-amber {
                    background: #fffbeb; border: 1px solid #fcd34d; border-radius: 9px;
                    padding: 12px 14px; font-size: 13.5px; color: #78350f; line-height: 1.5;
                }

                @media (prefers-reduced-motion: reduce) {
                    .sgb-trigger, .sgb-btn, .sgb-input, .sgb-select, .sgb-graph-card { transition: none; }
                }
            `}</style>

            {/* Trigger */}
            <button className="sgb-trigger" onClick={() => setShowSelectModal(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Save This View
            </button>

            {/* ── SELECT / MAIN MODAL ── */}
            <Modal show={showSelectModal} onHide={resetModals} size="lg" centered dialogClassName="sgb-dialog">
                <Modal.Header closeButton>
                    <div className="sgb-modal-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                    </div>
                    <Modal.Title>Save Graph</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* Select dashboard */}
                    <div className="sgb-section">
                        <label className="sgb-label" htmlFor="sgb-select-db">Select dashboard</label>
                        <select
                            id="sgb-select-db"
                            className="sgb-select"
                            value={selectedDashboardId ?? ""}
                            onChange={e => {
                                setSelectedDashboardId(Number(e.target.value));
                                setRenamingName("");
                            }}
                        >
                            <option value="">Choose a dashboard…</option>
                            {dashboards.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.name} ({d.graphs.length}/{MAX_GRAPHS_PER_DASHBOARD} graphs)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Rename */}
                    {selectedDashboardId && (
                        <>
                            <hr className="sgb-divider" />
                            <div className="sgb-section">
                                <label className="sgb-label" htmlFor="sgb-rename">Rename selected dashboard</label>
                                <div className="sgb-input-row">
                                    <input
                                        id="sgb-rename"
                                        className="sgb-input"
                                        placeholder="New name…"
                                        value={renamingName}
                                        onChange={e => setRenamingName(e.target.value)}
                                    />
                                    <button className="sgb-btn sgb-btn-amber" onClick={handleRenameDashboard} disabled={!renamingName.trim()}>
                                        Rename
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Create new */}
                    {dashboards.length < MAX_DASHBOARDS && (
                        <>
                            <hr className="sgb-divider" />
                            <div className="sgb-section">
                                <label className="sgb-label" htmlFor="sgb-create">Create new dashboard</label>
                                <div className="sgb-input-row">
                                    <input
                                        id="sgb-create"
                                        className="sgb-input"
                                        placeholder="Dashboard name…"
                                        value={newDashboardName}
                                        onChange={e => setNewDashboardName(e.target.value)}
                                        onKeyDown={e => e.key === "Enter" && handleCreateDashboard()}
                                    />
                                    <button className="sgb-btn sgb-btn-primary" onClick={handleCreateDashboard} disabled={!newDashboardName.trim()}>
                                        Create
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Saved graphs */}
                    {selectedDashboard && selectedDashboard.graphs.length > 0 && (
                        <>
                            <hr className="sgb-divider" />
                            <span className="sgb-label">Saved graphs in this dashboard</span>
                            <div className="sgb-graphs-grid">
                                {selectedDashboard.graphs.map((graph, idx) => {
                                    const { srcUrl, filters } = parseSavedUrl(graph.url);
                                    return (
                                        <OverlayTrigger
                                            key={graph.id}
                                            placement="left"
                                            trigger={["hover", "focus"]}
                                            overlay={
                                                <Tooltip id={`tooltip-${graph.id}`} className="adaptive-tooltip">
                                                    <div>
                                                        <div>
                                                            <strong>Page:</strong>{" "}
                                                            {graph.page_name
                                                                ? graph.page_name
                                                                    .split("-")
                                                                    .map(w => w.toUpperCase() === "CRC" ? "CRC" : w.charAt(0).toUpperCase() + w.slice(1))
                                                                    .join(" ")
                                                                : "Unknown Page"}
                                                        </div>
                                                        {Object.entries(filters).map(([key, val]) => {
                                                            const values = Array.isArray(val) ? val.filter(Boolean) : [val].filter(Boolean);
                                                            if (!values.length) return null;
                                                            const normalizedFilter = key.toLowerCase().replace(/\s+/g, "");
                                                            let displayLabel = formatFilterLabel(key);
                                                            let displayValues = values.join(", ");
                                                            if (normalizedFilter === "analysis") {
                                                                displayValues = values.map(v => analysisValueMap[v] || v).join(", ");
                                                            }
                                                            if (normalizedFilter === "riskfactorregion") {
                                                                displayLabel = "Risk Factor";
                                                                const mapping: Record<string, string> = {
                                                                    OW2017: "2017 - BMI (25-30), >18 years old",
                                                                    OBE2017: "2017 - BMI (>30), >18 years old",
                                                                    SMO2017: "2017 - >15 years old daily smoking",
                                                                    ALC2017: "2017 - >15 years old daily drinking",
                                                                    SED2017: "2017 - Sedentarism",
                                                                    PR2023: "2023 - Poverty Risk % persons living below poverty line",
                                                                    PCI2023: "2023 - Per capita income (Euros)",
                                                                };
                                                                displayValues = values.map(v => mapping[v] || v).join(", ");
                                                            }
                                                            if (normalizedFilter === "screeningdatametric") {
                                                                displayLabel = "Screening Data Metric";
                                                                const displaySet = new Set<string>();
                                                                if (values.some(v => v === "POS2017" || v === "POS2019")) displaySet.add("Positive cases (% over total tests)");
                                                                if (values.some(v => v === "CS2017" || v === "CS2019")) displaySet.add("Coverage of CRC screening (%)");
                                                                displayValues = Array.from(displaySet).join(", ");
                                                            }
                                                            if (normalizedFilter === "pairid") {
                                                                displayValues = values
                                                                    .map(v => v.replace(/__/g, " × ").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim())
                                                                    .join(", ");
                                                            }
                                                            if (!displayValues.trim()) return null;
                                                            return (
                                                                <div key={key}><strong>{displayLabel}:</strong> {displayValues}</div>
                                                            );
                                                        })}
                                                    </div>
                                                </Tooltip>
                                            }
                                            popperConfig={{
                                                modifiers: [
                                                    { name: "flip", options: { fallbackPlacements: ["top", "bottom", "left", "right"] } },
                                                    { name: "preventOverflow", options: { padding: 8 } },
                                                    { name: "computeStyles", options: { adaptive: true } },
                                                ],
                                            }}
                                        >
                                            <div className="sgb-graph-card">
                                                <div className="sgb-graph-preview">
                                                    {srcUrl ? (
                                                        srcUrl.startsWith("data:image") ? (
                                                            <img src={srcUrl} alt={`Saved graph ${idx + 1}`} />
                                                        ) : (
                                                            <iframe scrolling="no" src={srcUrl} title={`Saved graph ${idx + 1}`} />
                                                        )
                                                    ) : (
                                                        <div className="sgb-no-preview">No Preview</div>
                                                    )}
                                                </div>
                                                <div className="sgb-graph-actions">
                                                    <button
                                                        className="sgb-btn sgb-btn-amber sgb-btn-sm"
                                                        onClick={() => { setGraphToReplaceIndex(idx); setShowReplaceModal(true); }}
                                                        aria-label={`Replace graph ${idx + 1}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.32"/>
                                                        </svg>
                                                        Replace
                                                    </button>
                                                    <button
                                                        className="sgb-btn sgb-btn-sm"
                                                        style={{ background: "#fff", borderColor: "#fecaca", color: "#dc2626" }}
                                                        onClick={() => { setGraphToDeleteIndex(idx); setShowDeleteConfirmModal(true); }}
                                                        aria-label={`Delete graph ${idx + 1}`}
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </OverlayTrigger>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer>
                    <button className="sgb-btn sgb-btn-secondary" onClick={resetModals}>Cancel</button>
                    <button className="sgb-btn sgb-btn-primary" onClick={() => handleSaveGraph()} disabled={!selectedDashboardId}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                        </svg>
                        Save Graph
                    </button>
                </Modal.Footer>
            </Modal>

            {/* ── REPLACE MODAL ── */}
            <Modal show={showReplaceModal} onHide={() => setShowReplaceModal(false)} centered dialogClassName="sgb-dialog">
                <Modal.Header closeButton>
                    <div className="sgb-modal-icon" style={{ background: "#fffbeb", color: "#92400e" }} aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.32"/>
                        </svg>
                    </div>
                    <Modal.Title>Replace Graph</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="sgb-warn-box-amber">
                        The current graph in this slot will be overwritten with the active view. This cannot be undone.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="sgb-btn sgb-btn-secondary" onClick={() => setShowReplaceModal(false)}>Cancel</button>
                    <button className="sgb-btn sgb-btn-amber" onClick={() => handleSaveGraph(graphToReplaceIndex!)}>Replace</button>
                </Modal.Footer>
            </Modal>

            {/* ── DELETE MODAL ── */}
            <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered dialogClassName="sgb-dialog">
                <Modal.Header closeButton>
                    <div className="sgb-modal-icon" style={{ background: "#fef2f2", color: "#dc2626" }} aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                    </div>
                    <Modal.Title>Delete Graph</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="sgb-warn-box">
                        This saved graph will be permanently removed. This action cannot be undone.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="sgb-btn sgb-btn-secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</button>
                    <button className="sgb-btn sgb-btn-danger" onClick={handleDeleteGraph}>Delete</button>
                </Modal.Footer>
            </Modal>

            {/* ── RESULT MODAL ── */}
            <Modal show={showResultModal} onHide={() => setShowResultModal(false)} centered dialogClassName="sgb-dialog">
                <Modal.Header closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ textAlign: "center", padding: "28px 24px 20px" }}>
                    <div className={`sgb-result-icon sgb-result-icon-${modalVariant}`}>
                        {modalVariant === "success" ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12"/>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        )}
                    </div>
                    <div className="sgb-result-message">{modalMessage}</div>
                </Modal.Body>
                <Modal.Footer style={{ justifyContent: "center" }}>
                    <button className="sgb-btn sgb-btn-primary" onClick={() => setShowResultModal(false)}>OK</button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SaveGraphButton;
