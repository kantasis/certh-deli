import React, { useEffect, useState } from "react";
import { getSavedDashboards, deleteDashboard, deleteDashboardCollection } from "../services/dashboard.service";
import * as AuthService from "../services/auth.service";
import { Button, Card, Modal, Badge, Form, Spinner, Tooltip, OverlayTrigger } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

// Updated interface
interface DashboardEntry {
    id: number;
    dashboard_id: number;
    dashboard_name: string;
    saved_url: string | { url: string; params: Record<string, any> };
    page_name: string;
    created_at: string;
}
const ignoreFilters = new Set(["theme", "orgid", "panelid", "refresh", "fullscreen", "kiosk", "edit", "crcfactor"]);
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


// Extract filters from a URL string (fallback)
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
        "diet type": "Risk Factor",
        "screening data metric": "Screening Data Metric",

    };
    return mappings[cleaned] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Component
const SavedDashboards: React.FC = () => {
    const [dashboards, setDashboards] = useState<DashboardEntry[]>([]);
    const [dashboardCollections, setDashboardCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalShow, setModalShow] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [selectedDashboardId, setSelectedDashboardId] = useState<number | "">("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dashboardIndex = searchParams.get("index");

    const [dashboardToDeleteId, setDashboardToDeleteId] = useState<number | null>(null);
    const [showDashboardDeleteModal, setShowDashboardDeleteModal] = useState(false);

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);
    useEffect(() => {
        if (selectedDashboardId !== "") {
            navigate(`/my-dashboards?dashboardId=${selectedDashboardId}`);
        }
    }, [selectedDashboardId, navigate]);
    useEffect(() => {
        const load = async () => {
            try {
                const user = AuthService.getCurrentUser();
                const rawData = await getSavedDashboards(user.id);

                setDashboardCollections(rawData); // full list (even empty ones)

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
                alert("Failed to load dashboards.");
            } finally {
                setLoading(false);
            }
        };

        if (isLoggedIn) load();
    }, [isLoggedIn]);

    const confirmDeleteDashboard = (dashboardId: number) => {
        setDashboardToDeleteId(dashboardId);
        setModalMessage("Are you sure you want to delete this entire dashboard and all associated graphs?");
        setShowDashboardDeleteModal(true);
    };

    const handleDashboardDeleteConfirmed = async () => {
        if (!dashboardToDeleteId) return;

        try {
            await deleteDashboardCollection(dashboardToDeleteId);

            setDashboardCollections(prev => prev.filter(d => d.id !== dashboardToDeleteId));
            setDashboards(prev => prev.filter(d => d.dashboard_id !== dashboardToDeleteId));
            const event = new CustomEvent("dashboardDeleted");
            window.dispatchEvent(event);
            if (selectedDashboardId === dashboardToDeleteId.toString()) {
                const remaining = dashboardCollections.filter(d => d.id !== dashboardToDeleteId);
                if (remaining.length > 0) {
                    setSelectedDashboardId(remaining[0].id);
                } else {
                    setSelectedDashboardId("");
                }
            }

            setShowDashboardDeleteModal(false);
        } catch (err) {
            console.error("❌ Failed to delete dashboard collection:", err);
            alert("Error deleting dashboard.");
        }
    };


    // const dashboardCollections = React.useMemo(() => {
    //     const map = new Map<number, string>();
    //     dashboards.forEach((d) => {
    //         if (!map.has(d.dashboard_id)) {
    //             map.set(d.dashboard_id, d.dashboard_name);
    //         }
    //     });
    //     return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    // }, [dashboards]);

    useEffect(() => {
        if (dashboardCollections.length > 0 && !selectedDashboardId) {
            setSelectedDashboardId(dashboardCollections[0].id);
        }
    }, [dashboardCollections, selectedDashboardId]);


    useEffect(() => {
        if (dashboardIndex !== null && dashboardCollections.length > 0) {
            const index = parseInt(dashboardIndex, 10);
            if (!isNaN(index) && index >= 0 && index < dashboardCollections.length) {
                const selected = dashboardCollections[index];
                setSelectedDashboardId(selected.id);
            }
        } else {
            setSelectedDashboardId("");
        }
    }, [dashboardIndex, dashboardCollections]);


    const visibleDashboards = dashboards.filter(
        (d) => d.dashboard_id === selectedDashboardId
    );

    const handleGoToGraph = (entry: DashboardEntry) => {
        try {
            let urlStr = "";
            if (typeof entry.saved_url === "string") {
                urlStr = entry.saved_url;
            } else if (entry.saved_url && typeof entry.saved_url === "object") {
                urlStr = entry.saved_url.url || "";
            }
            const url = new URL(urlStr);

            const panelLabel = url.searchParams.get("panelLabel");
            localStorage.setItem("lit03Panel", panelLabel || "");
        } catch (error) {
            console.warn("Invalid URL in saved_url:", entry.saved_url);
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
            setDashboards((prev) => prev.filter((d) => d.id !== deleteId));
            setModalShow(false);
        } catch {
            alert("Failed to delete dashboard.");
        }
    };

    if (!isLoggedIn) return <h2>Unauthorized</h2>;

    if (loading) {
        return (
            <div className="text-center my-4">
                <Spinner animation="border" role="status" />
                <span className="visually-hidden">Loading...</span>
            </div>
        );
    }

    // if (dashboardCollections.length === 0) {
    //     return <div className="container w-50 alert alert-warning mt-5">You have no saved dashboards.</div>;
    // }

    return (
        <div className="container mt-4">
            <h3 className="mb-4">
                My Saved Dashboards
                {selectedDashboardId && dashboardCollections.length > 0 && (
                    <>
                        {" - "}
                        {dashboardCollections.find((c) => c.id === selectedDashboardId)?.name}
                    </>
                )}
            </h3>

            {dashboardCollections.length === 0 ? (
                <div className="d-flex justify-content-center mt-5">
                    <div className="alert alert-warning w-50 text-center">
                        You have no saved dashboards.
                    </div>
                </div>
            ) : (
                <>
                    <div className="d-flex  align-items-center justify-content-between mb-3">
                        <Form.Select


                            value={selectedDashboardId ?? ""}
                            onChange={(e) => setSelectedDashboardId(Number(e.target.value))}
                            style={{ width: "300px" }}
                        >
                            <option value="" disabled>-- Select Dashboard --</option>
                            {dashboardCollections.map((collection) => (
                                <option key={collection.id} value={collection.id}>
                                    {collection.name}
                                </option>
                            ))}

                        </Form.Select>
                        <Button
                            variant="danger"
                            className="ms-3"
                            disabled={!selectedDashboardId}
                            onClick={() => confirmDeleteDashboard(Number(selectedDashboardId))}
                        >
                            Delete Dashboard
                        </Button>
                    </div>
                </>
            )}
            <div className="row d-flex align-items-stretch">

                {selectedDashboardId && visibleDashboards.length === 0 && (
                    <div className="alert alert-warning mt-3">
                        This dashboard has no saved views.
                    </div>
                )}
                {visibleDashboards.map((d, index) => {
                    function parseSavedUrl(
                        saved_url: string | { url: string; params?: Record<string, any> }
                    ): { srcUrl: string; filters: Record<string, string[]> } {
                        let srcUrl = "";
                        let filters: Record<string, string[]> = {};

                        try {
                            if (typeof saved_url === "string") {
                                // First, try to JSON.parse it (if it was stringified object)
                                try {
                                    const maybeObj = JSON.parse(saved_url);
                                    if (maybeObj && typeof maybeObj === "object" && maybeObj.url) {
                                        srcUrl = maybeObj.url || "";
                                        filters = extractFiltersFromParams(maybeObj.params || {});
                                        return { srcUrl, filters };
                                    }
                                } catch {
                                    // Not JSON, fall through
                                }

                                // Base64 image case — skip if it's just an image
                                if (saved_url.startsWith("data:image")) {
                                    return { srcUrl: "", filters: {} };
                                }

                                // Else it's a normal URL string
                                srcUrl = saved_url;
                                filters = extractFiltersFromUrl(saved_url);
                            } else if (typeof saved_url === "object" && saved_url !== null) {
                                srcUrl = saved_url.url || "";
                                filters = extractFiltersFromParams(saved_url.params || {});
                            }
                        } catch (err) {
                            console.warn("Failed to parse saved_url", err);
                        }

                        return { srcUrl, filters };
                    }


                    //const filters = extractFiltersFromParams(filterParams);
                    const { srcUrl, filters } = parseSavedUrl(d.saved_url);



                    return (
                        <div className="col-12 col-md-6 col-lg-4 d-flex" key={d.id}>

                            <Card className="mb-4 p-2 flex-fill">

                                {srcUrl ? (
                                    <iframe
                                        src={srcUrl}
                                        style={{ width: "100%", height: "280px", border: "none", pointerEvents: "none" }}
                                        title={`dashboard-${d.id}`}
                                    />
                                ) : (
                                    <div className="bg-light text-center py-5 text-muted" style={{ height: "280px" }}>
                                        No Preview
                                    </div>
                                )}
                                <Card.Body className="d-flex flex-column py-1">
                                    <Card.Text className="m-0 p-0" >
                                        <strong>Page: </strong>
                                        {d.page_name
                                            ? d.page_name
                                                .split("-")
                                                .map((word) =>
                                                    word.toUpperCase() === "CRC"
                                                        ? "CRC"
                                                        : word.charAt(0).toUpperCase() + word.slice(1)
                                                )
                                                .join(" ")
                                            : "Unknown Page"}

                                    </Card.Text>

                                    {/* Render filters */}
                                    <div><strong>Filters: </strong></div>
                                    <div className="d-flex justify-content-center flex-wrap gap-2 mt-1">

                                        {Object.entries(filters).map(([filter, values]) => {
                                            const labelRaw = filter;
                                            let label = formatFilterLabel(labelRaw);

                                            let displayLabel = label;
                                            let displayValues = values.join(", ");

                                            // Factor → Measure and clean values
                                            if (label.toLowerCase() === "factor") {
                                                displayLabel = "Measure";
                                                displayValues = values.map(v => v.replace(/^Rate_/, "").replace(/_val$/, "")).join(", ");
                                            }

                                            // Analysis special handling
                                            if (label.toLowerCase() === "analysis") {
                                                if (values.includes("1")) {
                                                    displayLabel = "Presentation";
                                                    displayValues = "Per Year Lag";
                                                } else if (values.includes("2")) {
                                                    displayLabel = "Presentation";
                                                    displayValues = "Per Risk Factor";
                                                }
                                            }

                                            // Year Lag label fix
                                            if (label.toLowerCase() === "year lag") {
                                                displayLabel = "Year Lag";
                                            }

                                            const normalizedFilter = filter.replace(/ filter$/, '').toLowerCase();

                                            // Special tooltip for Countries filter
                                            if (normalizedFilter === "country") {
                                                // console.log("Countries extracted:", values);
                                                return (
                                                    <OverlayTrigger
                                                        key={filter}
                                                        placement="top"
                                                        overlay={<Tooltip id={`tooltip-${filter}`}>{values.join(", ")}</Tooltip>}
                                                    >
                                                        <Badge pill bg="" style={{ cursor: "pointer", backgroundColor: "#dee5fa", color: "#206985" }}>
                                                            Countries: {values.length}
                                                        </Badge>
                                                    </OverlayTrigger>
                                                );
                                            }

                                            if (normalizedFilter === "region") {
                                                return (
                                                    <OverlayTrigger
                                                        key={filter}
                                                        placement="top"
                                                        overlay={<Tooltip id={`tooltip-${filter}`}>{values.join(", ")}</Tooltip>}
                                                    >
                                                        <Badge pill bg="" style={{ cursor: "pointer", backgroundColor: "#dee5fa", color: "#206985" }}>
                                                            Regions: {values.length}
                                                        </Badge>
                                                    </OverlayTrigger>
                                                );
                                            }




                                            // Riskfactorregion -> display as Risk Factor and map codes (example)
                                            if (normalizedFilter === "riskfactorregion") {
                                                displayLabel = "Risk Factor";
                                                // Example mapping codes to full strings
                                                const mapping: Record<string, string> = {
                                                    OW2017: "2017 - BMI (25-30), >18 years old",
                                                    OBE2017: "2017 - BMI (>30), >18 years old",
                                                    SMO2017: "2017 - >15 years old daily smoking",
                                                    ALC2017: "2017 - >15 years old daily drinking",
                                                    SED2017: "2017 - Sedentarism",
                                                    PR2023: "2023 - Poverty Risk % persons living below poverty line",
                                                    PCI2023: "2023 - Per capita income (Euros)",
                                                };
                                                displayValues = values
                                                    .map(v => mapping[v] || v)
                                                    .join(", ");
                                            }

                                            // Screening Data Metric special mapping
                                            // Screening Data Metric special mapping
                                            if (normalizedFilter === "screening data metric") {
                                                displayLabel = "Screening Data Metric";

                                                const displaySet = new Set<string>();

                                                if (values.some(v => v === "POS2017" || v === "POS2019")) {
                                                    displaySet.add("Positive cases (% over total tests)");
                                                }

                                                if (values.some(v => v === "CS2017" || v === "CS2019")) {
                                                    displaySet.add("Coverage of CRC screening (%)");
                                                }

                                                displayValues = Array.from(displaySet).toString();
                                            }

                                            const analysisValues = filters["analysis"] || [];
                                            const isTrendAnalysis = analysisValues.includes("Trend Analysis");

                                            // If Analysis is Trend Analysis, skip rendering Risk Factors badge
                                            if ((label.toLowerCase() === "risk factors" || label.toLowerCase() === "selected risk factors") && isTrendAnalysis) {
                                                return null;
                                            }
                                            // Special case for "risk factors"
                                            if (label.toLowerCase() === "selected risk factors" || label.toLowerCase() === "risk factors") {
                                                const displayLabel = "Risk Factors";
                                                displayValues = values.length.toString();

                                                return (
                                                    <OverlayTrigger
                                                        key={filter}
                                                        placement="top"
                                                        overlay={
                                                            <Tooltip id={`tooltip-${filter}`}>
                                                                {values.join(", ")}
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <Badge
                                                            pill
                                                            bg=""
                                                            style={{ cursor: "pointer", backgroundColor: "#dee5fa", color: "#206985" }}
                                                        >
                                                            {displayLabel}: {displayValues}
                                                        </Badge>
                                                    </OverlayTrigger>
                                                );
                                            }

                                            return (
                                                <Badge pill bg="" key={filter} style={{ backgroundColor: "#dee5fa", color: "#206985" }}>
                                                    {displayLabel}: {displayValues}
                                                </Badge>
                                            );
                                        })}
                                    </div>




                                    <Card.Text className="mt-2">
                                        <strong>Graph: </strong>
                                        {index + 1} of {visibleDashboards.length}
                                        {(() => {
                                            const date = new Date(d.created_at);
                                            const day = String(date.getDate()).padStart(2, "0");
                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                            const year = date.getFullYear();
                                            return (
                                                <>
                                                    <strong> Saved on:</strong> {`${day}/${month}/${year} `}
                                                </>
                                            );
                                        })()}
                                    </Card.Text>
                                    <div style={{ marginTop: "auto" }}>
                                        <Button variant="primary" onClick={() => handleGoToGraph(d)}>
                                            Go to Graph
                                        </Button>{" "}
                                        <Button variant="danger" onClick={() => confirmDelete(d.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    );
                })}
            </div>

            <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setModalShow(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDashboardDeleteModal} onHide={() => setShowDashboardDeleteModal(false)} centered>
                <Modal.Header className="bg-danger" closeButton>
                    <Modal.Title className="text-white px-3 py-2 rounded">Delete Dashboard</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDashboardDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDashboardDeleteConfirmed}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>


        </div>
    );
};

export default SavedDashboards;
