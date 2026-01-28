import React, { useEffect, useState } from "react";
import { Button, Modal, Form, OverlayTrigger, Tooltip, InputGroup, Card } from "react-bootstrap";
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
    iframeUrl: { url: string; params?: any };
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
                .replace(/([a-z])([A-Z])/g, "$1 $2")     // Split camelCase (e.g., ageFilter → age Filter)
                .replace(/_/g, " ")                      // Replace underscores
                .replace(/\b\w/g, char => char.toUpperCase()); // Capitalize each word

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

                    if (ignoreFilters.has(filterName)) {
                        continue;
                    }

                    const values = parsedUrl.searchParams.getAll(key);
                    filters[filterName] = values;
                }
            }
        } catch (err) {
            console.warn("Invalid URL for filter parsing:", url);
        }
        return filters;
    };

    const formatFilterLabel = (raw: string): string => {
        const cleaned = raw.toLowerCase().replace(/ filter$/, "").replace(/_/g, " ");
        // console.log(cleaned)
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
                // Try to parse JSON string first
                try {
                    const maybeObj = JSON.parse(saved_url);
                    if (maybeObj && typeof maybeObj === "object") {
                        srcUrl = maybeObj.url || "";
                        filters = extractFiltersFromParams(maybeObj.params || {});
                        return { srcUrl, filters };
                    }
                } catch {
                    // Not JSON, continue
                }

                // Base64 images → skip
                if (saved_url.startsWith("data:image")) {
                    return { srcUrl: "", filters: {} };
                }

                // Otherwise, normal URL string
                srcUrl = saved_url;
                filters = extractFiltersFromUrl(saved_url);

            } else if (typeof saved_url === "object" && saved_url !== null) {
                srcUrl = saved_url.url || "";
                filters = extractFiltersFromParams(saved_url.params || {});
            }
        } catch (err) {
            console.warn("Failed to parse saved_url", err);
        }

        // Return even if srcUrl is empty but filters exist
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

    const loadDashboards = async (userId: string) => {
        const data = await getUserDashboards(userId);

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
                <>You’ve reached the maximum of {MAX_GRAPHS_PER_DASHBOARD} saved graphs in this dashboard.<br />Please delete some graphs to save a new view.</>,
                "danger"
            );
        }

        try {
            if (replaceIndex !== undefined) {
                await deleteDashboard(dashboard.graphs[replaceIndex].id);
            }

            const pageName = location.pathname.replace("/", "") || "home";
            await saveGraphToDashboard(selectedDashboardId, urlToSave, pageName, userId);
            await loadDashboards(userId);
            resetModals();
            showResult("Success", "Graph saved successfully.", "success");
        } catch (err: any) {
            console.error(err);
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
            <Button onClick={() => setShowSelectModal(true)}>Save This View</Button>

            <Modal show={showSelectModal} onHide={resetModals} size="lg" centered>
                <Modal.Header closeButton className="bg-success text-white">
                    <Modal.Title>Save Graph</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h5>Select a dashboard</h5>
                    <InputGroup className="mb-3">
                        <Form.Select
                            value={selectedDashboardId ?? ""}
                            onChange={e => {
                                setSelectedDashboardId(Number(e.target.value));
                                setRenamingName("");
                            }}
                        >
                            <option value="">-- Choose one dashboard --</option>
                            {dashboards.map(d => (
                                <option key={d.id} value={d.id}>
                                    {d.name} ({d.graphs.length}/{MAX_GRAPHS_PER_DASHBOARD})
                                </option>
                            ))}
                        </Form.Select>
                    </InputGroup>

                    {selectedDashboardId && (
                        <>
                            <h5>Rename selected dashboard</h5>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    placeholder="Rename..."
                                    value={renamingName}
                                    onChange={e => setRenamingName(e.target.value)}
                                />
                                <Button className="btn btn-warning" onClick={handleRenameDashboard}>
                                    Rename
                                </Button>
                            </InputGroup>
                        </>
                    )}

                    {dashboards.length < MAX_DASHBOARDS && (
                        <>
                            <h5>Create new dashboard</h5>
                            <InputGroup className="mb-3">
                                <Form.Control
                                    placeholder="Type name..."
                                    value={newDashboardName}
                                    onChange={e => setNewDashboardName(e.target.value)}
                                />
                                <Button onClick={handleCreateDashboard}>Create</Button>
                            </InputGroup>
                        </>
                    )}

                    {selectedDashboard && selectedDashboard.graphs.length > 0 && (
                        <div className="row">
                            {selectedDashboard.graphs.map((graph, idx) => {
                                const { srcUrl, filters } = parseSavedUrl(graph.url);

                                return (
                                    <div className="col-12 col-md-4 mb-3" key={graph.id}>
                                        <OverlayTrigger
                                            placement="left"
                                            overlay={
                                                <Tooltip id={`tooltip-${graph.id}`} className="adaptive-tooltip">
                                                    <div>
                                                        <div>
                                                            <strong>Page:</strong>{" "}
                                                            {graph.page_name
                                                                ? graph.page_name
                                                                    .split("-")
                                                                    .map(word =>
                                                                        word.toUpperCase() === "CRC"
                                                                            ? "CRC"
                                                                            : word.charAt(0).toUpperCase() + word.slice(1)
                                                                    )
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
                                                                if (values.some(v => v === "POS2017" || v === "POS2019"))
                                                                    displaySet.add("Positive cases (% over total tests)");
                                                                if (values.some(v => v === "CS2017" || v === "CS2019"))
                                                                    displaySet.add("Coverage of CRC screening (%)");
                                                                displayValues = Array.from(displaySet).join(", ");
                                                            }
                                                            // --- Pair ID formatting ---
                                                            if (normalizedFilter === "pairid") {
                                                                displayValues = values
                                                                    .map(v =>
                                                                        v
                                                                            .replace(/__/g, " × ")
                                                                            .replace(/_/g, " ")
                                                                            .replace(/\b\w/g, char => char.toUpperCase())
                                                                            .trim()
                                                                    )
                                                                    .join(", ");
                                                            }

                                                            if (!displayValues.trim()) return null;

                                                            return (
                                                                <div key={key}>
                                                                    <strong>{displayLabel}:</strong> {displayValues}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </Tooltip>
                                            }
                                            trigger={['hover', 'focus']}
                                            popperConfig={{
                                                modifiers: [
                                                    { name: 'flip', options: { fallbackPlacements: ['top', 'bottom', 'left', 'right'] } },
                                                    { name: 'preventOverflow', options: { padding: 8 } },
                                                    { name: 'computeStyles', options: { adaptive: true } },
                                                ],
                                            }}
                                        >
                                            <Card className="p-2">
                                                {srcUrl ? (
                                                    srcUrl.startsWith("data:image") ? (
                                                        <div
                                                            style={{
                                                                width: "100%",
                                                                height: "120px",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                backgroundColor: "#f8f9fa",
                                                                borderRadius: "8px",
                                                                overflow: "hidden",
                                                            }}
                                                        >
                                                            <img
                                                                src={srcUrl}
                                                                alt={`graph-${graph.id}`}
                                                                style={{
                                                                    maxWidth: "100%",
                                                                    maxHeight: "100%",
                                                                    objectFit: "contain",
                                                                    borderRadius: "8px",
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <iframe
                                                            scrolling="no"
                                                            src={srcUrl}
                                                            title={`graph-${graph.id}`}
                                                            style={{
                                                                width: "100%",
                                                                height: "120px",
                                                                border: "none",
                                                                borderRadius: "8px",
                                                                overflow: "hidden",
                                                                backgroundColor: "#f8f9fa",
                                                                pointerEvents: "none",
                                                            }}
                                                        />
                                                    )
                                                ) : (
                                                    <div
                                                        className="bg-light text-center text-muted"
                                                        style={{
                                                            height: "120px",
                                                            borderRadius: "8px",
                                                            backgroundColor: "#f8f9fa",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                        }}
                                                    >
                                                        No Preview
                                                    </div>
                                                )}

                                                <div className="d-flex justify-content-between mt-1">
                                                    <Button size="sm" variant="warning" onClick={() => { setGraphToReplaceIndex(idx); setShowReplaceModal(true); }}>
                                                        Replace
                                                    </Button>
                                                    <Button size="sm" variant="danger" onClick={() => { setGraphToDeleteIndex(idx); setShowDeleteConfirmModal(true); }}>
                                                        Delete
                                                    </Button>
                                                </div>
                                            </Card>
                                        </OverlayTrigger>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={resetModals}>Cancel</Button>
                    <Button variant="primary" onClick={() => handleSaveGraph()} disabled={!selectedDashboardId}>
                        Save Graph
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* REPLACE MODAL */}
            <Modal show={showReplaceModal} onHide={() => setShowReplaceModal(false)} centered>
                <Modal.Header className="bg-warning" closeButton>
                    <Modal.Title>Replace Graph</Modal.Title>
                </Modal.Header>
                <Modal.Body>You're about to replace this graph. Continue?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReplaceModal(false)}>Cancel</Button>
                    <Button variant="warning" onClick={() => handleSaveGraph(graphToReplaceIndex!)}>OK</Button>
                </Modal.Footer>
            </Modal>

            {/* DELETE MODAL */}
            <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered>
                <Modal.Header className="bg-danger" closeButton>
                    <Modal.Title>Delete Graph</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this graph? This action cannot be undone.</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteGraph}>Delete</Button>
                </Modal.Footer>
            </Modal>

            {/* RESULT MODAL */}
            <Modal show={showResultModal} onHide={() => setShowResultModal(false)} centered>
                <Modal.Header className={modalVariant === "danger" ? "bg-danger text-white" : "bg-success text-white"} closeButton>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => setShowResultModal(false)}>OK</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SaveGraphButton;
