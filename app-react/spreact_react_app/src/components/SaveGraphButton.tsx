import React, { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useLocation, Link } from "react-router-dom";  // <-- import Link
import * as AuthService from "../services/auth.service";
import { saveDashboard, getSavedDashboards } from "../services/dashboard.service";

interface SaveGraphButtonProps {
    iframeUrl: string;
    
}

const SaveGraphButton: React.FC<SaveGraphButtonProps> = ({ iframeUrl }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const location = useLocation();

    const [modalShow, setModalShow] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalMessage, setModalMessage] = useState<React.ReactNode>(""); // allow JSX
    const [modalVariant, setModalVariant] = useState<"success" | "danger">("success");

    const [savedCount, setSavedCount] = useState(0);
    const MAX_SAVES = 6;

    useEffect(() => {
        const user = AuthService.getCurrentUser?.();
        if (user && user.id) {
            setUserId(user.id);
            getSavedDashboards(user.id)
                .then((data) => setSavedCount(data.length))
                .catch(() => setSavedCount(0));
        }
    }, []);

    const handleSave = async () => {
        console.log("Saving URL:", iframeUrl);
        // console.log("Saving IMG URL:", getImageUrl());
        // const chartImageUrl = getImageUrl?.() || "";
  
        const urlToSave =
            iframeUrl;

        if (!urlToSave) {
            setModalTitle("Nothing to save");
            setModalMessage("The graph hasn’t rendered yet. Please try again in a moment.");
            setModalVariant("danger");
            setModalShow(true);
            return;
        }


        if (!userId) {
            setModalTitle("Not logged in");
            setModalMessage("You must be logged in to save graphs.");
            setModalVariant("danger");
            setModalShow(true);
            return;
        }

        const pageName = location.pathname.replace("/", "") || "home";

        try {
            await saveDashboard(userId, urlToSave, pageName);

            const dashboards = await getSavedDashboards(userId);
            setSavedCount(dashboards.length);

            setModalTitle("Dashboard Saved");
            setModalMessage(`You have saved ${dashboards.length}/${MAX_SAVES} dashboards.`);
            setModalVariant("success");
            setModalShow(true);
        } catch (err: any) {
            const backendMessage = err?.response?.data?.error;
            if (backendMessage === "You can only save up to 6 dashboards.") {
                setModalTitle("Save Failed");
                setModalMessage(
                    <>
                        You’ve reached the maximum of {MAX_SAVES} saved dashboards.<br />
                        Please <Link to="/saved-dashboards" onClick={() => setModalShow(false)}>go to your saved dashboards</Link> and delete some to save a new view.
                    </>
                );
            } else {
                setModalTitle("Save Failed");
                setModalMessage("Could not save dashboard.");
            }
            setModalVariant("danger");
            setModalShow(true);
        }

    };

    return (
        <>
            <Button variant="primary" onClick={handleSave}>
                Save This View
            </Button>

            <Modal show={modalShow} onHide={() => setModalShow(false)} centered>
                <Modal.Header closeButton className={modalVariant === "danger" ? "bg-danger text-white" : "bg-success text-white"}>
                    <Modal.Title>{modalTitle}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant={modalVariant === "danger" ? "danger" : "success"} onClick={() => setModalShow(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default SaveGraphButton;
