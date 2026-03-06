import React, { useEffect, useState } from "react";
import * as AuthService from "../services/auth.service";
import * as UserService from "../services/user.service";
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    TableHead,
    Button,
    Stack,
    Chip,
    Checkbox,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Select,
    MenuItem,
    Snackbar,
    Alert,
} from "@mui/material";

interface User {
    id: string;
    name: string;
    surname: string;
    username: string;
    email: string;
    roles: { id: string; label: string }[];
}

const ALL_ROLES = ["ROLE_USER", "ROLE_MODERATOR", "ROLE_ADMIN"];
const formatRole = (role: string) => {
    switch (role) {
        case "ROLE_USER":
            return "User";
        case "ROLE_MODERATOR":
            return "Moderator";
        case "ROLE_ADMIN":
            return "Admin";
        default:
            return role;
    }
};

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editUser, setEditUser] = useState<User | null>(null);
    const [editRolesUser, setEditRolesUser] = useState<User | null>(null);
    const [editRoles, setEditRoles] = useState<string[]>([]);
    const [deleteUser, setDeleteUser] = useState<User | null>(null);

    const [snackbar, setSnackbar] = useState<{ message: string; severity: "success" | "error" } | null>(null);

    const currentUser = AuthService.getCurrentUser();
    const isSuperAdmin = currentUser?.roles?.includes("ROLE_MODERATOR");

    useEffect(() => {
        if (isSuperAdmin) loadUsers();
    }, [isSuperAdmin]);

    const loadUsers = async () => {
        try {
            const res = await UserService.getAllUsers();
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // --- Edit Name/Surname ---
    const openEditNameModal = (user: User) => setEditUser(user);
    const applyNameEdit = async () => {
        if (!editUser) return;
        try {
            await UserService.updateUserNames(editUser.id, {
                name: editUser.name,
                surname: editUser.surname,
            });
            setSnackbar({ message: "Name & surname updated successfully", severity: "success" });
            setEditUser(null);
            loadUsers();
        } catch (err) {
            console.error(err);
            setSnackbar({ message: "Failed to update name & surname", severity: "error" });
        }
    };

    // --- Edit Roles ---
    const openEditRolesModal = (user: User) => {
        setEditRolesUser(user);
        setEditRoles(user.roles.map((r) => r.label));
    };
    const applyRolesEdit = async () => {
        if (!editRolesUser) return;
        try {
            await UserService.updateUserRoles(editRolesUser.id, editRoles);
            setSnackbar({ message: "Roles updated successfully", severity: "success" });
            setEditRolesUser(null);
            setEditRoles([]);
            loadUsers();
        } catch (err) {
            console.error(err);
            setSnackbar({ message: "Failed to update roles", severity: "error" });
        }
    };

    // --- Delete ---
    const confirmDeleteUser = (user: User) => setDeleteUser(user);
    const handleDelete = async () => {
        if (!deleteUser) return;
        try {
            await UserService.deleteUser(deleteUser.id);
            setSnackbar({ message: "User deleted successfully", severity: "success" });
            setDeleteUser(null);
            loadUsers();
        } catch (err) {
            console.error(err);
            setSnackbar({ message: "Failed to delete user", severity: "error" });
        }
    };

    if (!isSuperAdmin)
        return <Typography variant="h5">Unauthorized</Typography>;

    return (
        <Container maxWidth="lg" sx={{ mt: 5 }}>
            <Typography variant="h4" gutterBottom>
                User Management
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Surname</TableCell>
                            <TableCell>Username</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Roles</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell>{u.name}</TableCell>
                                <TableCell>{u.surname}</TableCell>
                                <TableCell>{u.username}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                    <Stack direction="row" flexWrap="wrap" spacing={0}> {/* spacing=0 removes the 8px gap */}
                                        {u.roles.map((r) => {
                                            let chipColor: "default" | "info" | "error" = "default";
                                            if (r.label === "ROLE_ADMIN") chipColor = "error";
                                            else if (r.label === "ROLE_MODERATOR") chipColor = "info";

                                            return (
                                                <Chip
                                                    key={r.id}
                                                    label={formatRole(r.label)}
                                                    size="small"
                                                    color={chipColor}
                                                    sx={{ mr: 0 ,mt:1}} // ensure no margin-right
                                                />
                                            );
                                        })}
                                    </Stack>
                                </TableCell>
                                <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="nowrap">
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="warning" // orange button
                                            onClick={() => openEditNameModal(u)}
                                        >
                                            Edit Name
                                        </Button>
                                        <Button
                                            variant="contained"
                                            size="small"
                                            color="warning" // orange button
                                            onClick={() => openEditRolesModal(u)}
                                        >
                                            Edit Roles
                                        </Button>
                                        <Button
                                            color="error"
                                            variant="contained"
                                            size="small"
                                            onClick={() => confirmDeleteUser(u)}
                                        >
                                            Delete
                                        </Button>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal: Edit Name + Surname */}
            <Dialog open={!!editUser} onClose={() => setEditUser(null)}>
                <DialogTitle>Edit Name & Surname</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense"
                        label="Name"
                        fullWidth
                        value={editUser?.name || ""}
                        onChange={(e) =>
                            editUser && setEditUser({ ...editUser, name: e.target.value })
                        }
                    />
                    <TextField
                        margin="dense"
                        label="Surname"
                        fullWidth
                        value={editUser?.surname || ""}
                        onChange={(e) =>
                            editUser && setEditUser({ ...editUser, surname: e.target.value })
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditUser(null)}>Cancel</Button>
                    <Button variant="contained" onClick={applyNameEdit}>
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal: Edit Roles */}
            <Dialog
                open={!!editRolesUser}
                onClose={() => setEditRolesUser(null)}
                fullWidth
                maxWidth="sm" // make bigger
            >
                <DialogTitle>Edit Roles</DialogTitle>
                <DialogContent>
                    <Select
                        multiple
                        fullWidth
                        value={editRoles}
                        onChange={(e) => setEditRoles(e.target.value as string[])}
                        renderValue={(selected) =>
                            (selected as string[]).map(formatRole).join(", ")
                        }
                        sx={{ mt: 1 }}
                    >
                        {ALL_ROLES.map((role) => (
                            <MenuItem key={role} value={role}>
                                <Checkbox checked={editRoles.includes(role)} />
                                <ListItemText primary={formatRole(role)} />
                            </MenuItem>
                        ))}
                    </Select>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditRolesUser(null)}>Cancel</Button>
                    <Button variant="contained" onClick={applyRolesEdit}>
                        Apply
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal: Delete */}
            <Dialog open={!!deleteUser} onClose={() => setDeleteUser(null)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    Are you sure you want to delete <strong>{deleteUser?.username}</strong>?
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteUser(null)}>Cancel</Button>
                    <Button color="error" variant="contained" onClick={handleDelete}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for feedback */}
            <Snackbar
                open={!!snackbar}
                autoHideDuration={4000}
                onClose={() => setSnackbar(null)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                {snackbar && (
                    <Alert
                        onClose={() => setSnackbar(null)}
                        severity={snackbar.severity}
                        variant="filled"
                    >
                        {snackbar.message}
                    </Alert>
                )}
            </Snackbar>
        </Container>
    );
};

export default AdminUsers;