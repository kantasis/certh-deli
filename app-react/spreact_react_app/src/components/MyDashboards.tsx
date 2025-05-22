import React, { useEffect, useState } from "react";
import { getSavedDashboards, deleteDashboard } from "../services/dashboard.service";
import * as AuthService from "../services/auth.service";
import { Button, Card, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface DashboardEntry {
    id: number;
    saved_url: string | string[];
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
            const url = new URL(typeof entry.saved_url === "string" ? entry.saved_url : entry.saved_url[0]);
            const panelLabel = url.searchParams.get('panelLabel');
            localStorage.setItem('lit03Panel', panelLabel || '');
        } catch (error) {
            console.warn('Invalid URL in saved_url:', entry.saved_url);
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
            <div className="row">
                {dashboards.map((d, index) => {
                    let srcUrl: string = typeof d.saved_url === 'string' ? d.saved_url : d.saved_url[0];

                    // Try to parse if it's stored as a JSON string
                    try {
                        const parsed = JSON.parse(srcUrl);
                        if (parsed.url) {
                            srcUrl = parsed.url;
                        }
                    } catch (e) {
                        console.warn("Could not parse saved_url as JSON:", srcUrl);
                    }

                    return (
                        <div className="col-md-4" key={d.id}>
                            <Card className="mb-4">
                                <iframe
                                    src={srcUrl}
                                    width="100%"
                                    height="200px"
                                    title={`dashboard-${d.id}`}
                                />
                                <Card.Body>
                                    <Card.Text>
                                        <strong>Graph : </strong>{dashboards.length - index} / 6
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Page: </strong>{d.page_name
                                            .split('-')                                // Split on hyphens
                                            .map(word => word.toUpperCase() === 'CRC'  // Keep 'CRC' all uppercase
                                                ? 'CRC'
                                                : word.charAt(0).toUpperCase() + word.slice(1)
                                            )
                                            .join(' ')                                  // Join back into a string
                                        }
                                    </Card.Text>
                                    <Card.Text>
                                        <strong>Saved on:</strong> {(() => {
                                            const date = new Date(d.created_at);
                                            const day = String(date.getDate()).padStart(2, "0");
                                            const month = String(date.getMonth() + 1).padStart(2, "0");
                                            const year = date.getFullYear();
                                            return `${day}/${month}/${year}`;
                                        })()}

                                    </Card.Text>
                                    <Button variant="primary" onClick={() => handleGoToGraph(d)}>
                                        Go to Graph
                                    </Button>{" "}
                                    <Button variant="danger" onClick={() => confirmDelete(d.id)}>
                                        Delete
                                    </Button>
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
        </div>
    );
};

export default SavedDashboards;
