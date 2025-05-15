import React, { useEffect, useState } from "react";
import { getSavedDashboards, deleteDashboard } from "../services/dashboard.service";
import * as AuthService from "../services/auth.service";
import { Button, Card, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface DashboardEntry {
    id: number;
    saved_url: string;
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

    useEffect(() => {
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
    }, []);

    if (loading) return <p>Loading...</p>;

    const handleGoToGraph = (entry: DashboardEntry) => {
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

    return (
        <div className="container mt-4">
            <h3>My Saved Dashboards</h3>
            <div className="row">
                {dashboards.map((d) => (
                    <div className="col-md-4" key={d.id}>
                        <Card className="mb-4">
                            <iframe src={d.saved_url} width="100%" height="200px" title={`dashboard-${d.id}`} />
                            <Card.Body>
                                <Card.Text>Page: {d.page_name}</Card.Text>
                                <Card.Text>Saved on {new Date(d.created_at).toLocaleString()}</Card.Text>
                                <Button variant="primary" onClick={() => handleGoToGraph(d)}>
                                    Go to Graph
                                </Button>{" "}
                                <Button variant="danger" onClick={() => confirmDelete(d.id)}>
                                    Delete
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
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
