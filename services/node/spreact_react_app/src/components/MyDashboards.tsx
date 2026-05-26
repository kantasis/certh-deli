import React, { useEffect, useState } from "react";
import { getSavedDashboards, deleteDashboard, deleteDashboardCollection } from "../services/dashboard.service";
import * as AuthService from "../services/auth.service";
import { Modal, Tooltip, OverlayTrigger } from "react-bootstrap";
import { useNavigate, useSearchParams } from "react-router-dom";

interface DashboardEntry {
    id: number;
    dashboard_id: number;
    dashboard_name: string;
    saved_url: string | { url: string; params: Record<string, any> };
    page_name: string;
    created_at: string;
}

const ignoreFilters = new Set(["theme", "orgid", "panelid", "refresh", "fullscreen", "kiosk", "edit", "crcfactor"]);

const analysisValueMap: Record<string, string> = {
    exposure_weighted: "Overview: Exposure Weighted",
    quick_wins: "Quick Wins",
    effect_sev_unit: "Overview: Effect per SEV Unit",
    sf_intervention: "Single-Factor Intervention",
    sf_target: "Single-Factor Target",
    two_factor_heatmaps: "Two-Factor Joint Effect",
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
        // invalid URL — skip
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
    saved_url: string | { url: string; params?: Record<string, any> }
): { srcUrl: string; filters: Record<string, string[]> } {
    let srcUrl = "";
    let filters: Record<string, string[]> = {};
    try {
        if (typeof saved_url === "string") {
            try {
                const maybeObj = JSON.parse(saved_url);
                if (maybeObj && typeof maybeObj === "object" && maybeObj.url) {
                    return { srcUrl: maybeObj.url || "", filters: extractFiltersFromParams(maybeObj.params || {}) };
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
        // parse error
    }
    return { srcUrl, filters };
}

const formatPageName = (name: string) =>
    name.split("-").map(w => w.toUpperCase() === "CRC" ? "CRC" : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

const SavedDashboards: React.FC = () => {
    const [dashboards, setDashboards] = useState<DashboardEntry[]>([]);
    const [dashboardCollections, setDashboardCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalShow, setModalShow] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedDashboardId, setSelectedDashboardId] = useState<number | "">("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [toast, setToast] = useState<{ text: string; type: "error" } | null>(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [dashboardToDeleteId, setDashboardToDeleteId] = useState<number | null>(null);
    const [showDashboardDeleteModal, setShowDashboardDeleteModal] = useState(false);

    const showError = (text: string) => {
        setToast({ text, type: "error" });
        setTimeout(() => setToast(null), 5000);
    };

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    useEffect(() => {
        const load = async () => {
            try {
                const user = AuthService.getCurrentUser();
                const rawData = await getSavedDashboards(user.id);
                setDashboardCollections(rawData);
                const flattened: DashboardEntry[] = rawData.flatMap((collection: any) =>
                    (collection.graphs || []).map((g: any) => ({
                        id: g.id,
                        dashboard_id: collection.id,
                        dashboard_name: collection.name,
                        saved_url: g.saved_url,
                        page_name: g.page_name,
                        created_at: g.created_at,
                    }))
                );
                setDashboards(flattened);
            } catch {
                showError("Failed to load dashboards.");
            } finally {
                setLoading(false);
            }
        };
        if (isLoggedIn) load();
    }, [isLoggedIn]);

    const dashboardIdParam = searchParams.get("dashboardId");

    useEffect(() => {
        if (dashboardCollections.length === 0) return;
        let selectedId: number | undefined;
        if (dashboardIdParam) {
            const paramId = parseInt(dashboardIdParam, 10);
            const exists = dashboardCollections.find(d => d.id === paramId);
            if (exists) selectedId = exists.id;
        }
        if (!selectedId && dashboardCollections.length > 0) selectedId = dashboardCollections[0].id;
        if (selectedId !== undefined && selectedId !== selectedDashboardId) setSelectedDashboardId(selectedId);
    }, [dashboardCollections, dashboardIdParam]);

    const confirmDeleteDashboard = (dashboardId: number) => {
        setDashboardToDeleteId(dashboardId);
        setModalMessage("Are you sure you want to delete this entire dashboard and all associated graphs?");
        setShowDashboardDeleteModal(true);
    };

    const handleDashboardDeleteConfirmed = async () => {
        if (!dashboardToDeleteId) return;
        try {
            await deleteDashboardCollection(dashboardToDeleteId);
            setDashboardCollections(prev => {
                const updated = prev.filter(d => d.id !== dashboardToDeleteId);
                setDashboards(prevD => prevD.filter(d => d.dashboard_id !== dashboardToDeleteId));
                if (selectedDashboardId === dashboardToDeleteId) {
                    setSelectedDashboardId(updated.length > 0 ? updated[0].id : "");
                }
                return updated;
            });
            window.dispatchEvent(new CustomEvent("dashboardDeleted"));
            setShowDashboardDeleteModal(false);
        } catch {
            showError("Error deleting dashboard.");
        }
    };

    const visibleDashboards = dashboards.filter(d => d.dashboard_id === selectedDashboardId);

    const handleGoToGraph = (entry: DashboardEntry) => {
        try {
            let urlStr = typeof entry.saved_url === "string" ? entry.saved_url : entry.saved_url?.url || "";
            const url = new URL(urlStr);
            const panelLabel = url.searchParams.get("panelLabel");
            localStorage.setItem("lit03Panel", panelLabel || "");
        } catch {
            // invalid URL
        }
        navigate(`/${entry.page_name}`, { state: { iframeUrl: entry.saved_url } });
    };

    const confirmDelete = (id: number) => {
        setDeleteId(id);
        setModalMessage("Are you sure you want to delete this view?");
        setModalShow(true);
    };

    const handleDelete = async () => {
        if (deleteId === null) return;
        try {
            await deleteDashboard(deleteId);
            setDashboards(prev => prev.filter(d => d.id !== deleteId));
            setModalShow(false);
        } catch {
            showError("Failed to delete view.");
        }
    };

    if (!isLoggedIn) return <h2 className="text-center mt-5">Unauthorized</h2>;

    const selectedCollection = dashboardCollections.find(c => c.id === selectedDashboardId);
    const totalGraphs = dashboards.length;

    return (
        <>
            <style>{`
                .md-page { padding: 32px 0 56px; }

                /* Header */
                .md-header { margin-bottom: 28px; display: flex; align-items: center; gap: 14px; }
                .md-header-icon { width: 44px; height: 44px; border-radius: 12px; background: #e8f2f6; color: var(--brand-dark, #185569); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .md-header-title { font-size: 22px; font-weight: 800; color: var(--text, #0f172a); margin: 0 0 2px; }
                .md-header-sub { font-size: 15px; color: var(--text-muted, #475569); margin: 0; }

                /* Toolbar */
                .md-toolbar { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
                .md-select {
                    flex: 1; min-width: 200px; max-width: 320px;
                    border: 1.5px solid var(--border, #e5e7eb); border-radius: 10px;
                    padding: 9px 14px; font-size: 15px; color: var(--text, #0f172a);
                    background: #fff; outline: none; cursor: pointer;
                    transition: border-color 0.2s, box-shadow 0.2s; font-family: inherit;
                }
                .md-select:focus { border-color: var(--brand, #1f6580); box-shadow: 0 0 0 3px rgba(31,101,128,0.15); }

                /* Buttons */
                .md-btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 16px; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; border: 1.5px solid; transition: background 0.15s, border-color 0.15s; white-space: nowrap; }
                .md-btn-primary { background: var(--brand, #1f6580); border-color: var(--brand, #1f6580); color: #fff; }
                .md-btn-primary:hover:not(:disabled) { background: var(--brand-dark, #185569); border-color: var(--brand-dark, #185569); box-shadow: 0 4px 14px rgba(31,101,128,0.25); }
                .md-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
                .md-btn-danger { background: #fff; border-color: #fecaca; color: #dc2626; }
                .md-btn-danger:hover:not(:disabled) { background: #fef2f2; border-color: #dc2626; }
                .md-btn-danger:disabled { opacity: 0.4; cursor: not-allowed; }
                .md-btn-secondary { background: #fff; border-color: var(--border, #e5e7eb); color: var(--text, #0f172a); }
                .md-btn-secondary:hover { background: var(--muted, #f5f7fb); }
                .md-btn-danger-solid { background: #dc2626; border-color: #dc2626; color: #fff; }
                .md-btn-danger-solid:hover { background: #b91c1c; border-color: #b91c1c; }

                /* Cards */
                .md-card { background: #fff; border: 1px solid var(--border, #e5e7eb); border-radius: 14px; overflow: hidden; display: flex; flex-direction: column; height: 100%; transition: box-shadow 0.2s; }
                .md-card:hover { box-shadow: 0 4px 20px rgba(2,6,23,0.09); }
                .md-preview { width: 100%; height: 240px; background: var(--muted, #f5f7fb); flex-shrink: 0; position: relative; }
                .md-preview iframe { width: 100%; height: 100%; border: none; pointer-events: none; display: block; }
                .md-preview img { width: 100%; height: 100%; object-fit: contain; display: block; }
                .md-no-preview { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--text-muted, #475569); font-size: 14px; }
                .md-card-body { padding: 14px 16px; display: flex; flex-direction: column; flex: 1; }
                .md-card-page { display: inline-flex; align-items: center; gap: 5px; margin-bottom: 10px; }
                .md-page-badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 20px; font-size: 13px; font-weight: 600; background: #e8f2f6; color: var(--brand-dark, #185569); border: 1.5px solid #c5dce8; }
                .md-filters-label { font-size: 12px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; color: var(--text-muted, #475569); margin-bottom: 7px; display: block; }
                .md-badges { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 12px; }
                .md-badge { display: inline-flex; align-items: center; padding: 3px 9px; border-radius: 20px; font-size: 13px; font-weight: 500; background: #e8f2f6; color: var(--brand-dark, #185569); border: 1.5px solid #c5dce8; cursor: default; white-space: nowrap; }
                .md-badge[data-tooltip="true"] { cursor: pointer; }
                .md-card-meta { font-size: 13px; color: var(--text-muted, #475569); margin-bottom: 14px; }
                .md-card-meta strong { color: var(--text, #0f172a); }
                .md-card-actions { display: flex; gap: 8px; margin-top: auto; }
                .md-card-actions .md-btn { flex: 1; justify-content: center; padding: 8px 10px; font-size: 14px; }

                /* Empty states */
                .md-empty { background: #fff; border: 1px solid var(--border, #e5e7eb); border-radius: 14px; padding: 56px 24px; text-align: center; }
                .md-empty-icon { width: 48px; height: 48px; border-radius: 14px; background: #e8f2f6; color: var(--brand-dark, #185569); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
                .md-empty-title { font-size: 16px; font-weight: 700; color: var(--text, #0f172a); margin-bottom: 6px; }
                .md-empty-sub { font-size: 14px; color: var(--text-muted, #475569); }

                /* Loading */
                .md-loading { display: flex; align-items: center; justify-content: center; gap: 12px; min-height: 320px; color: var(--text-muted, #475569); font-size: 15px; }

                /* Modal overrides */
                .md-dialog .modal-content { border-radius: 16px; border: 1px solid var(--border, #e5e7eb); box-shadow: 0 20px 60px rgba(2,6,23,0.18); overflow: hidden; }
                .md-dialog .modal-header { background: #fff; border-bottom: 1px solid var(--border, #e5e7eb); padding: 18px 20px 14px; display: flex; align-items: center; gap: 10px; }
                .md-dialog .modal-title { font-size: 16px !important; font-weight: 700 !important; color: var(--text, #0f172a) !important; }
                .md-dialog .modal-body { padding: 20px; }
                .md-dialog .modal-footer { border-top: 1px solid var(--border, #e5e7eb); padding: 12px 20px 16px; gap: 8px; }
                .md-modal-icon { width: 34px; height: 34px; border-radius: 9px; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .md-warn-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 9px; padding: 12px 14px; font-size: 15px; color: #991b1b; line-height: 1.55; }

                /* Toast */
                .md-toast { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 2000; padding: 11px 18px; border-radius: 10px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 16px rgba(2,6,23,0.15); display: flex; align-items: center; gap: 8px; min-width: 260px; max-width: 90vw; background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; animation: md-slide-down 0.2s ease; }
                @keyframes md-slide-down { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

                @media (prefers-reduced-motion: reduce) {
                    .md-card, .md-btn, .md-select { transition: none; }
                    .md-toast { animation: none; }
                }
            `}</style>

            <div className="container md-page">

                {/* Page header */}
                <div className="md-header">
                    <div className="md-header-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                        </svg>
                    </div>
                    <div>
                        <h1 className="md-header-title">My Dashboards</h1>
                        <p className="md-header-sub">
                            {loading ? "Loading…" : `${totalGraphs} saved ${totalGraphs === 1 ? "view" : "views"} across ${dashboardCollections.length} ${dashboardCollections.length === 1 ? "dashboard" : "dashboards"}`}
                        </p>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="md-loading">
                        <div className="spinner" aria-label="Loading dashboards" />
                        <span>Loading dashboards…</span>
                    </div>
                )}

                {!loading && dashboardCollections.length === 0 && (
                    <div className="md-empty">
                        <div className="md-empty-icon" aria-hidden="true">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                            </svg>
                        </div>
                        <div className="md-empty-title">No saved dashboards yet</div>
                        <div className="md-empty-sub">Use the "Save This View" button on any chart page to save your first view.</div>
                    </div>
                )}

                {!loading && dashboardCollections.length > 0 && (
                    <>
                        {/* Toolbar */}
                        <div className="md-toolbar">
                            <select
                                className="md-select"
                                value={selectedDashboardId ?? ""}
                                aria-label="Select dashboard"
                                onChange={e => {
                                    const newId = Number(e.target.value);
                                    if (!isNaN(newId)) {
                                        setSelectedDashboardId(newId);
                                        const url = new URL(window.location.href);
                                        url.searchParams.set("dashboardId", String(newId));
                                        window.history.replaceState({}, "", url.toString());
                                    }
                                }}
                            >
                                <option value="" disabled>Choose a dashboard…</option>
                                {dashboardCollections.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} ({(dashboards.filter(d => d.dashboard_id === c.id).length)} views)
                                    </option>
                                ))}
                            </select>

                            <button
                                className="md-btn md-btn-danger"
                                disabled={!selectedDashboardId}
                                onClick={() => confirmDeleteDashboard(Number(selectedDashboardId))}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                                Delete Dashboard
                            </button>
                        </div>

                        {/* Empty dashboard */}
                        {selectedDashboardId && visibleDashboards.length === 0 && (
                            <div className="md-empty">
                                <div className="md-empty-title">No views in "{selectedCollection?.name}"</div>
                                <div className="md-empty-sub">Save a graph view from any chart page to populate this dashboard.</div>
                            </div>
                        )}

                        {/* Graph cards */}
                        <div className="row g-3 align-items-stretch">
                            {visibleDashboards.map((d, index) => {
                                const { srcUrl, filters } = parseSavedUrl(d.saved_url);
                                const date = new Date(d.created_at);
                                const dateStr = `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

                                return (
                                    <div className="col-12 col-md-6 col-lg-4 d-flex" key={d.id}>
                                        <div className="md-card">

                                            {/* Preview */}
                                            <div className="md-preview">
                                                {srcUrl ? (
                                                    srcUrl.startsWith("data:image") ? (
                                                        <img src={srcUrl} alt={`Saved view ${index + 1}`} />
                                                    ) : (
                                                        <iframe scrolling="no" src={srcUrl} title={`Saved view ${index + 1}`} />
                                                    )
                                                ) : (
                                                    <div className="md-no-preview">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                            <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>
                                                        </svg>
                                                        No Preview
                                                    </div>
                                                )}
                                            </div>

                                            {/* Body */}
                                            <div className="md-card-body">
                                                {/* Page badge */}
                                                <div className="md-card-page">
                                                    <span className="md-page-badge">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                                                        </svg>
                                                        {d.page_name ? formatPageName(d.page_name) : "Unknown Page"}
                                                    </span>
                                                </div>

                                                {/* Filters */}
                                                <span className="md-filters-label">Filters</span>
                                                <div className="md-badges">
                                                    {Object.entries(filters).map(([filter, values]) => {
                                                        const labelRaw = filter;
                                                        let label = formatFilterLabel(labelRaw);
                                                        let displayLabel = label;
                                                        let displayValues = values.join(", ");

                                                        if (label.toLowerCase() === "factor") {
                                                            displayLabel = "Measure";
                                                            displayValues = values.map(v => v.replace(/^Rate_/, "").replace(/_val$/, "")).join(", ");
                                                        }

                                                        if (label.toLowerCase() === "horizon" || label.toLowerCase() === "tf horizon") {
                                                            displayLabel = "Horizon";
                                                            displayValues = values.map(v => {
                                                                const n = Number(v);
                                                                if (isNaN(n)) return v;
                                                                return n === 1 ? "1 Year" : `${n} Years`;
                                                            }).join(", ");
                                                            return <span key={filter} className="md-badge">{displayLabel}: {displayValues}</span>;
                                                        }

                                                        const analysisValues = filters["Analysis"] || [];
                                                        const isTrendAnalysis = analysisValues.includes("Trend Analysis");
                                                        const isForecasting = analysisValues.includes("Forecasting CRC");
                                                        const associationAnalysis = analysisValues.includes("Association Analysis");
                                                        const isTrendCorrelation = analysisValues.includes("Trend Correlation");

                                                        if (label.toLowerCase() === "analysis") {
                                                            if (values.includes("1")) { displayLabel = "Presentation"; displayValues = "Per Year Lag"; }
                                                            else if (values.includes("2")) { displayLabel = "Presentation"; displayValues = "Per Risk Factor"; }
                                                            else { displayLabel = "Analysis"; displayValues = values.map(v => analysisValueMap[v] || v).join(", "); }
                                                            return <span key={filter} className="md-badge">{displayLabel}: {displayValues}</span>;
                                                        }

                                                        if (label.toLowerCase() === "year lag") displayLabel = "Year Lag";

                                                        const normalizedFilter = filter.replace(/ filter$/, "").toLowerCase();

                                                        const formatPairId = (str: string) =>
                                                            str.replace(/__/g, " × ").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()).trim();

                                                        if (normalizedFilter === "pair id" && values?.length) {
                                                            return (
                                                                <OverlayTrigger key={filter} placement="top" overlay={<Tooltip id={`tt-${filter}-${d.id}`}>{values.map(formatPairId).join(", ")}</Tooltip>}>
                                                                    <span className="md-badge" data-tooltip="true" style={{ cursor: "pointer" }}>Pair: {formatPairId(values[0])}</span>
                                                                </OverlayTrigger>
                                                            );
                                                        }

                                                        if (normalizedFilter === "country" || normalizedFilter === "tf country") {
                                                            return (
                                                                <OverlayTrigger key={filter} placement="top" overlay={<Tooltip id={`tt-${filter}-${d.id}`}>{values.join(", ")}</Tooltip>}>
                                                                    <span className="md-badge" style={{ cursor: "pointer" }}>
                                                                        {values.length === 1 ? `Country: ${values[0]}` : `Countries: ${values.length}`}
                                                                    </span>
                                                                </OverlayTrigger>
                                                            );
                                                        }

                                                        if (normalizedFilter === "region") {
                                                            return (
                                                                <OverlayTrigger key={filter} placement="top" overlay={<Tooltip id={`tt-${filter}-${d.id}`}>{values.join(", ")}</Tooltip>}>
                                                                    <span className="md-badge" style={{ cursor: "pointer" }}>Regions: {values.length}</span>
                                                                </OverlayTrigger>
                                                            );
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

                                                        if (normalizedFilter === "screening data metric") {
                                                            displayLabel = "Screening Data Metric";
                                                            const displaySet = new Set<string>();
                                                            if (values.some(v => v === "POS2017" || v === "POS2019")) displaySet.add("Positive cases (% over total tests)");
                                                            if (values.some(v => v === "CS2017" || v === "CS2019")) displaySet.add("Coverage of CRC screening (%)");
                                                            displayValues = Array.from(displaySet).toString();
                                                        }

                                                        if ((label.toLowerCase() === "risk factors" || label.toLowerCase() === "selected risk factors" || label.toLowerCase() === "country") && isTrendAnalysis) return null;
                                                        if ((label.toLowerCase() === "risk factors" || label.toLowerCase() === "selected risk factors" || label.toLowerCase() === "year interval") && isForecasting) return null;
                                                        if (label.toLowerCase() === "country" && associationAnalysis) return null;
                                                        if ((label.toLowerCase() === "year interval") || (label.toLowerCase() === "country" && isTrendCorrelation)) return null;

                                                        if (label.toLowerCase() === "selected risk factors" || label.toLowerCase() === "risk factors") {
                                                            return (
                                                                <OverlayTrigger key={filter} placement="top" overlay={<Tooltip id={`tt-${filter}-${d.id}`}>{values.join(", ")}</Tooltip>}>
                                                                    <span className="md-badge" style={{ cursor: "pointer" }}>Risk Factors: {values.length}</span>
                                                                </OverlayTrigger>
                                                            );
                                                        }

                                                        if (!displayValues.trim()) return null;

                                                        return <span key={filter} className="md-badge">{displayLabel}: {displayValues}</span>;
                                                    })}
                                                </div>

                                                {/* Meta */}
                                                <div className="md-card-meta">
                                                    <strong>View</strong> {index + 1} of {visibleDashboards.length} &nbsp;·&nbsp; <strong>Saved</strong> {dateStr}
                                                </div>

                                                {/* Actions */}
                                                <div className="md-card-actions">
                                                    <button className="md-btn md-btn-primary" onClick={() => handleGoToGraph(d)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                            <polyline points="15 3 21 3 21 9"/><path d="M10 14L21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>
                                                        </svg>
                                                        Go to Graph
                                                    </button>
                                                    <button className="md-btn md-btn-danger" onClick={() => confirmDelete(d.id)}>
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                                                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Delete view modal */}
            <Modal show={modalShow} onHide={() => setModalShow(false)} centered dialogClassName="md-dialog">
                <Modal.Header closeButton>
                    <div className="md-modal-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                    </div>
                    <Modal.Title>Delete View</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="md-warn-box">This saved view will be permanently removed. This action cannot be undone.</div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="md-btn md-btn-secondary" onClick={() => setModalShow(false)}>Cancel</button>
                    <button className="md-btn md-btn-danger-solid" onClick={handleDelete}>Delete</button>
                </Modal.Footer>
            </Modal>

            {/* Delete dashboard modal */}
            <Modal show={showDashboardDeleteModal} onHide={() => setShowDashboardDeleteModal(false)} centered dialogClassName="md-dialog">
                <Modal.Header closeButton>
                    <div className="md-modal-icon" aria-hidden="true">
                        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                    </div>
                    <Modal.Title>Delete Dashboard</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="md-warn-box">{modalMessage}</div>
                </Modal.Body>
                <Modal.Footer>
                    <button className="md-btn md-btn-secondary" onClick={() => setShowDashboardDeleteModal(false)}>Cancel</button>
                    <button className="md-btn md-btn-danger-solid" onClick={handleDashboardDeleteConfirmed}>Delete</button>
                </Modal.Footer>
            </Modal>

            {/* Error toast */}
            {toast && (
                <div className="md-toast" role="alert" aria-live="polite">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {toast.text}
                </div>
            )}
        </>
    );
};

export default SavedDashboards;
