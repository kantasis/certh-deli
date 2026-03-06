import React, { useState, useEffect } from "react";
import * as AuthService from "../services/auth.service";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Stack,
  Chip,
} from "@mui/material";

interface User {
  id: string;         // use string if your backend uses UUIDs
  name: string;
  surname: string;    // keep lowercase consistent with backend
  username: string;
  email: string;
  roles: string[];
}

// Friendly mapping for roles
const roleLabels: { [key: string]: string } = {
  ROLE_USER: "User",
  ROLE_MODERATOR: "Moderator",
  ROLE_ADMIN: "Administrator",
};

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (AuthService.isLoggedIn()) {
      setUser(AuthService.getCurrentUser());
    }
  }, []);

  if (!user) return <Typography variant="h5">Unauthorized</Typography>;

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>{user.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Surname</TableCell>
              <TableCell>{user.surName}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>{user.username}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>{user.id}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>{user.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Roles</TableCell>
              <TableCell>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={roleLabels[role] || role}
                      size="small"
                      color="primary"
                    />
                  ))}
                </Stack>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Profile;