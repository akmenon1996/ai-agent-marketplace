import React from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  TextField,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Edit, Delete, Key } from '@mui/icons-material';
import { useAuth } from '../store/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authService } from '../services/auth';

const validationSchema = Yup.object({
  username: Yup.string().required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  current_password: Yup.string().min(8, 'Password must be at least 8 characters'),
  new_password: Yup.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: Yup.string().oneOf(
    [Yup.ref('new_password')],
    'Passwords must match'
  ),
});

const passwordValidationSchema = Yup.object({
  current_password: Yup.string().required('Current password is required'),
  new_password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('New password is required'),
  confirm_password: Yup.string()
    .oneOf([Yup.ref('new_password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const Profile: React.FC = () => {
  const { user, updateUser, token } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = React.useState(false);
  const [apiKeys, setApiKeys] = React.useState<
    { id: string; name: string; created_at: string }[]
  >([]);

  const formik = useFormik({
    initialValues: {
      username: user?.username || '',
      email: user?.email || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await updateUser({
          username: values.username,
          email: values.email,
        });
        setSuccess('Profile updated successfully');
      } catch (err) {
        setError('Failed to update profile');
      }
    },
  });

  const passwordFormik = useFormik({
    initialValues: {
      current_password: '',
      new_password: '',
      confirm_password: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        await authService.updatePassword(token || '', {
          current_password: values.current_password,
          new_password: values.new_password,
        });
        setSuccess('Password updated successfully');
        setPasswordDialogOpen(false);
        passwordFormik.resetForm();
      } catch (err) {
        setError('Failed to update password');
      }
    },
  });

  const handleCreateApiKey = async () => {
    try {
      // Call API to create new API key
      const response = await fetch('/api/developer/api-keys', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setApiKeys([...apiKeys, data]);
      setSuccess('API key created successfully');
    } catch (err) {
      setError('Failed to create API key');
    }
  };

  const handleDeleteApiKey = async (keyId: string) => {
    try {
      // Call API to delete API key
      await fetch(`/api/developer/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setApiKeys(apiKeys.filter((key) => key.id !== keyId));
      setSuccess('API key deleted successfully');
    } catch (err) {
      setError('Failed to delete API key');
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{ width: 64, height: 64, mr: 2 }}
                  src={user?.avatar_url}
                >
                  {user?.username?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6">{user?.username}</Typography>
                  <Typography color="text.secondary">{user?.email}</Typography>
                </Box>
              </Box>

              <form onSubmit={formik.handleSubmit}>
                <TextField
                  fullWidth
                  name="username"
                  label="Username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={
                    formik.touched.username && Boolean(formik.errors.username)
                  }
                  helperText={formik.touched.username && formik.errors.username}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  name="email"
                  label="Email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  sx={{ mb: 2 }}
                />
                <Button variant="contained" type="submit">
                  Save Changes
                </Button>
                <Button
                  variant="outlined"
                  sx={{ ml: 2 }}
                  onClick={() => setPasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
              </form>
            </Paper>
          </Grid>

          {/* API Keys */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="h6">API Keys</Typography>
                <Button
                  variant="contained"
                  startIcon={<Key />}
                  onClick={handleCreateApiKey}
                >
                  Create New Key
                </Button>
              </Box>
              <List>
                {apiKeys.map((key) => (
                  <React.Fragment key={key.id}>
                    <ListItem>
                      <ListItemText
                        primary={key.name}
                        secondary={`Created: ${new Date(
                          key.created_at
                        ).toLocaleDateString()}`}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteApiKey(key.id)}
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <form onSubmit={passwordFormik.handleSubmit}>
          <DialogTitle>Change Password</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                type="password"
                name="current_password"
                label="Current Password"
                value={passwordFormik.values.current_password}
                onChange={passwordFormik.handleChange}
                error={
                  passwordFormik.touched.current_password &&
                  Boolean(passwordFormik.errors.current_password)
                }
                helperText={
                  passwordFormik.touched.current_password &&
                  passwordFormik.errors.current_password
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                name="new_password"
                label="New Password"
                value={passwordFormik.values.new_password}
                onChange={passwordFormik.handleChange}
                error={
                  passwordFormik.touched.new_password &&
                  Boolean(passwordFormik.errors.new_password)
                }
                helperText={
                  passwordFormik.touched.new_password &&
                  passwordFormik.errors.new_password
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                type="password"
                name="confirm_password"
                label="Confirm New Password"
                value={passwordFormik.values.confirm_password}
                onChange={passwordFormik.handleChange}
                error={
                  passwordFormik.touched.confirm_password &&
                  Boolean(passwordFormik.errors.confirm_password)
                }
                helperText={
                  passwordFormik.touched.confirm_password &&
                  passwordFormik.errors.confirm_password
                }
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Update Password
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};
