import React, { useEffect, useState } from "react";
import { getSavedDashboards, deleteDashboard } from "../services/dashboard.service";
import * as AuthService from "../services/auth.service";
import { Button, Card, Modal, Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface DashboardEntry {
    id: number;
    saved_url: string | { url: string; params: Record<string, any> };
    page_name: string;
    created_at: string;
}

const SavedDashboards: React.FC = () => {
    const [dashboards, setDashboards] = useState<DashboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalShow, setModalShow] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const ignoreFilters = new Set(["crcfactor"]); // filters to ignore

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

    // Extract filters from params object
    const extractFiltersFromParams = (paramsObj: Record<string, any>): Record<string, string[]> => {
        const filters: Record<string, string[]> = {};

        for (const [key, value] of Object.entries(paramsObj)) {
            // normalize keys, remove "_filter", convert camelCase to space + lowercase if you want
            let filterName = key
                .replace(/_filter$/i, "")
                // Optionally convert camelCase to spaces, e.g. yearInterval -> year interval
                .replace(/([a-z])([A-Z])/g, '$1 $2')
                .toLowerCase();

            if (ignoreFilters.has(filterName)) continue;

            if (Array.isArray(value)) {
                filters[filterName] = value.map(String);
            } else if (typeof value === "string") {
                filters[filterName] = value.split(",").map(v => v.trim());
            } else {
                filters[filterName] = [String(value)];
            }
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
            yearlag: "Year Lag",
            analysis: "Analysis",
            "diet type": "Risk Factor",
            "screening data metric": "Screening Data Metric",

        };
        return mappings[cleaned] || cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    };

    useEffect(() => {
        setIsLoggedIn(AuthService.isLoggedIn());
    }, []);

    useEffect(() => {
        if (!isLoggedIn) return;
        const load = async () => {
            try {
                const user = AuthService.getCurrentUser();
                const data = await getSavedDashboards(user.id);
                setDashboards(data);
            } catch {
                alert("Failed to load dashboards.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [isLoggedIn]);

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
        setModalMessage("Are you sure you want to delete this dashboard?");
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
    if (loading) return <p>Loading...</p>;

    return (
        <div className="container mt-4">
            <h3>My Saved Dashboards</h3>
            <div className="row d-flex align-items-stretch">
                {dashboards.map((d, index) => {
                    let srcUrl = "";
                    let filters: Record<string, string[]> = {};

                    try {
                        // Try to parse saved_url if it's a string and JSON parseable
                        if (typeof d.saved_url === "string") {
                            const maybeObj = JSON.parse(d.saved_url);
                            if (maybeObj && typeof maybeObj === "object" && maybeObj.url) {
                                // Now treat saved_url as object
                                srcUrl = maybeObj.url || "";
                                filters = extractFiltersFromParams(maybeObj.params || {});
                                console.log("Filters: " + filters)
                            } else {
                                // Just normal string URL
                                srcUrl = d.saved_url;
                                filters = extractFiltersFromUrl(d.saved_url);
                                console.log("Filters: " + filters)
                            }
                        } else if (d.saved_url && typeof d.saved_url === "object") {
                            // In case saved_url is already an object
                            srcUrl = d.saved_url.url || "";
                            filters = extractFiltersFromParams(d.saved_url.params || {});
                            console.log("Filters: " + filters)
                        }
                    } catch (e) {
                        // If JSON parse fails, fallback to treat saved_url as string
                        srcUrl = typeof d.saved_url === "string" ? d.saved_url : "";
                        filters = extractFiltersFromUrl(srcUrl);
                    }


                    // Attempt JSON parse fallback if needed (optional)
                    try {
                        const parsed = JSON.parse(srcUrl);
                        if (parsed.url) {
                            srcUrl = parsed.url;
                        }
                    } catch {
                        // ignore
                    }

                    return (
                        <div className="col-12 col-md-6 col-lg-4 d-flex" key={d.id}>
                            <Card className="mb-4 p-2 flex-fill">
                                <iframe
                                    src={srcUrl}
                                    style={{ width: "100%", height: "280px", border: "none", pointerEvents: "none" }}
                                    title={`dashboard-${d.id}`}
                                />
                                <Card.Body className="d-flex flex-column py-1">
                                    <Card.Text className="p-0 m-0">
                                        <strong>Page: </strong>
                                        {d.page_name
                                            .split("-")
                                            .map((word) => (word.toUpperCase() === "CRC" ? "CRC" : word.charAt(0).toUpperCase() + word.slice(1)))
                                            .join(" ")}
                                    </Card.Text>
                                    <Card.Text className="p-0 m-0">
                                        <strong>Filters:</strong>
                                    </Card.Text>
                                    <div className="d-flex justify-content-center flex-wrap gap-2 mt-2">
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

                                            // Special tooltip for Regions filter
                                            if (normalizedFilter === "region") {
                                                // split values if only one string with commas
                                                const regionsArray = values.length === 1 && values[0].includes(",")
                                                    ? values[0].split(",").map(v => v.trim())
                                                    : values;

                                                return (
                                                    <OverlayTrigger
                                                        key={filter}
                                                        placement="top"
                                                        overlay={
                                                            <Tooltip id={`tooltip-${filter}`}>
                                                                {regionsArray.join(", ")}
                                                            </Tooltip>
                                                        }
                                                    >
                                                        <Badge pill bg="" style={{ cursor: "pointer", backgroundColor: "#dee5fa", color: "#206985" }}>
                                                            Regions: {regionsArray.length}
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

                                                displayValues = Array.from(displaySet);
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
                                                const displayValues = values.length.toString();

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

                                    <Card.Text className="p-0 mt-0 mb-2">
                                        <strong>Graph: </strong>
                                        {dashboards.length - index}/6 -
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
        </div >
    );
};

export default SavedDashboards;
