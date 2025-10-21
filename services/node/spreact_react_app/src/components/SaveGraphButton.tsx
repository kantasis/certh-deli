import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Dropdown, InputGroup, } from "react-bootstrap";
import { useLocation, Link, useNavigate } from "react-router-dom";
import * as AuthService from "../services/auth.service";

import {
    getUserDashboards,
    createDashboard,
    renameDashboard,
    saveGraphToDashboard,
} from "../services/dashboard.service";

interface SaveGraphButtonProps {
    iframeUrl: {
        url: string;
        params?: any;
    };
}

const MAX_DASHBOARDS = 3;
const MAX_GRAPHS_PER_DASHBOARD = 6;

const SaveGraphButton: React.FC<SaveGraphButtonProps> = ({ iframeUrl }) => {

    const navigate = useNavigate();
    const location = useLocation();
    const [userId, setUserId] = useState<string | null>(null);
    const [dashboards, setDashboards] = useState<any[]>([]);
    const [selectedDashboardId, setSelectedDashboardId] = useState<number | null>(null);
    const [newDashboardName, setNewDashboardName] = useState("");

    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState<React.ReactNode>("");
    const [modalVariant, setModalVariant] = useState<"success" | "danger">("success");
    const isInfoOnlyModal = ["Success", "Error", "Limit Reached", "Missing Data", "No Dashboard Selected"].includes(modalTitle);

    useEffect(() => {
        const user = AuthService.getCurrentUser?.();
        if (user && user.id) {
            setUserId(user.id);
            loadDashboards(user.id);
        }
    }, []);
    useEffect(() => {
        const user = AuthService.getCurrentUser?.();
        console.log("Current user:", user);
        if (user && user.id) {
            setUserId(user.id);
            loadDashboards(user.id);
        }
    }, []);

    const loadDashboards = async (userId: string) => {
        try {
            const data = await getUserDashboards(userId);
            setDashboards(data);
        } catch (err) {
            console.error("Failed to load dashboards");
        }
    };

    const handleCreateDashboard = async () => {
        if (!newDashboardName.trim() || !userId) return;

        try {
            const dashboard = await createDashboard(userId, newDashboardName.trim());
            setDashboards((prev) => [...prev, { ...dashboard, graphs: [] }]);
            setSelectedDashboardId(dashboard.id); 
            setNewDashboardName("");
              window.dispatchEvent(new CustomEvent("dashboardCreated", { detail: dashboard }));
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error || "Failed to create dashboard";

            setModalTitle("Error");
            setModalMessage(errorMessage);
            setModalVariant("danger");
            setShowSelectionModal(true);
        }
    };


    const handleRenameDashboard = async (id: number, name: string) => {
        try {
            await renameDashboard(id, name);
            setDashboards((prev) =>
                prev.map((d) => (d.id === id ? { ...d, name } : d))
            );
        } catch (err) {
            alert("Failed to rename dashboard");
        }
    };

    const handleSave = async () => {
        const user = AuthService.getCurrentUser?.();
        const userId = user?.id;

        // console.log("iframeUrl prop:", iframeUrl);
        // console.log("iframeUrl.url:", iframeUrl?.url);

        const urlToSave =
            typeof iframeUrl === "string"
                ? iframeUrl
                : iframeUrl?.params
                    ? { url: iframeUrl.url, params: iframeUrl.params }
                    : iframeUrl.url;

        if (!userId || !urlToSave) {
            setModalTitle("Missing Data");
            setModalMessage("You must be logged in and have a valid graph.");
            setModalVariant("danger");
            setShowSelectionModal(true);
            return;
        }

        if (!selectedDashboardId) {
            setModalTitle("No Dashboard Selected");
            setModalMessage("Please select a dashboard to save this graph.");
            setModalVariant("danger");
            setShowSelectionModal(true);
            return;
        }

        const dashboard = dashboards.find((d) => d.id === selectedDashboardId);
        if (dashboard?.graphs.length >= MAX_GRAPHS_PER_DASHBOARD) {
            setModalTitle("Limit Reached");
            setModalMessage(
                <>
                    You’ve reached the maximum of {MAX_GRAPHS_PER_DASHBOARD} saved graphs in this dashboard.<br />
                    Please{" "}
                    <span
                        style={{ color: "blue", textDecoration: "underline", cursor: "pointer" }}
                        onClick={() => {
                            setShowSelectionModal(false);
                            navigate(`/my-dashboards?index=${dashboards.findIndex(c => c.id === selectedDashboardId)}`);


                        }}
                    >
                        go to your saved dashboards
                    </span>{" "}
                    and delete some graphs to save a new view.
                </>
            );
            setModalVariant("danger");
            setShowSelectionModal(true);
            return;
        }


        try {
            const pageName = location.pathname.replace("/", "") || "home";
            // console.log("Saving graph with:");
            // console.log("dashboardId:", selectedDashboardId);
            // console.log("savedUrl:", urlToSave);
            // console.log("pageName:", pageName);
            // console.log("userId:", userId);

            await saveGraphToDashboard(selectedDashboardId, urlToSave, pageName, userId);
            await loadDashboards(userId); // refresh count

            setModalTitle("Success");
            setModalMessage("Graph saved to dashboard.");
            setModalVariant("success");
            setShowSelectionModal(true);
        } catch (err: any) {
            console.error("Save failed:", err?.response?.data);
            setModalTitle("Error");
            setModalMessage(err?.response?.data?.error || "Could not save graph.");
            setModalVariant("danger");
            setShowSelectionModal(true);
        }
    };
    const resetModalState = () => {
        setModalTitle("");
        setModalMessage("");
        setModalVariant("success");
        setSelectedDashboardId(null);
        setNewDashboardName("");
    };
    const closeModal = () => {
        setShowSelectionModal(false);
        resetModalState();
    };

    return (
        <>
            <Button onClick={() => { resetModalState(); setShowSelectionModal(true); }}>Save This View</Button>

            <Modal show={showSelectionModal} onHide={closeModal} centered>
                <Modal.Header closeButton className={modalVariant === "danger" ? "bg-danger text-white" : "bg-success text-white"}>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {isInfoOnlyModal ? (
                        modalMessage
                    ) : (
                        <>
                            <h5>Select a dashboard</h5>

                            <Form.Group>
                                <Form.Select
                                    value={selectedDashboardId ?? ""}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSelectedDashboardId(value === "" ? null : Number(value));
                                    }}
                                >
                                    <option value="">-- Choose one --</option>
                                    {dashboards.map((dashboard) => (
                                        <option key={dashboard.id} value={dashboard.id}>
                                            {dashboard.name} ({dashboard.graphs.length}/6)
                                        </option>
                                    ))}
                                </Form.Select>

                                {selectedDashboardId && (
                                    <>
                                        <h5 className="mt-4">Rename the selected Dashboard</h5>
                                        <InputGroup className="mb-3">
                                            <Form.Control
                                                type="text"
                                                value={
                                                    dashboards.find(d => d.id === selectedDashboardId)?.name || ''
                                                }
                                                onChange={(e) => {
                                                    const newName = e.target.value;
                                                    setDashboards(prev =>
                                                        prev.map(d =>
                                                            d.id === selectedDashboardId ? { ...d, name: newName } : d
                                                        )
                                                    );
                                                }}
                                            />
                                            <Button
                                                variant="warning"
                                                onClick={() => {
                                                    const dashboard = dashboards.find(d => d.id === selectedDashboardId);
                                                    if (dashboard) {
                                                        handleRenameDashboard(dashboard.id, dashboard.name);
                                                    }
                                                }}
                                            >
                                                Click to Rename
                                            </Button>
                                        </InputGroup>
                                    </>
                                )}

                            </Form.Group>


                            {dashboards.length < MAX_DASHBOARDS && (
                                <>
                                    <h5 className="mt-3">Create new dashboard</h5>
                                    <InputGroup className="mb-3">
                                        <Form.Control
                                            type="text"
                                            placeholder="Dashboard name"
                                            value={newDashboardName}
                                            onChange={(e) => setNewDashboardName(e.target.value)}
                                        />
                                        <Button variant="success" onClick={handleCreateDashboard}>
                                            Create
                                        </Button>
                                    </InputGroup>
                                </>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {(modalTitle === "Success" || modalTitle === "Error") ? (
                        <Button variant={modalVariant} onClick={closeModal}>
                            Close
                        </Button>
                    ) : (
                        <>
                            <Button variant="secondary" onClick={() => setShowSelectionModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="primary" onClick={handleSave}>
                                Save Graph
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SaveGraphButton;
