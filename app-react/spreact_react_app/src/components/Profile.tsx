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
} from "@mui/material";

interface User {
  id: number;
  name: string;
  surName: string;
  username: string;
  email: string;
  roles: string[];
}

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
              <TableCell>Authorities</TableCell>
              <TableCell>
                {user.roles
                  .map((role) =>
                    role === "ROLE_USER"
                      ? "User"
                      : role === "ROLE_ADMIN"
                        ? "Administrator"
                        : role
                  )
                  .join(", ")}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Profile;
