import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
  Link,
} from '@mui/material';
import { useNavigate, Link as RouterLink, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { authService } from '../../services/auth';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [error, setError] = React.useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (!token) {
          setError('Invalid reset token');
          return;
        }
        await authService.resetPassword(token, values.password);
        navigate('/auth/login', {
          state: { message: 'Password reset successful. Please sign in.' },
        });
      } catch (err) {
        setError('Failed to reset password. Please try again.');
      }
    },
  });

  if (!token) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom>
              Invalid Reset Link
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              The password reset link is invalid or has expired.
            </Typography>
            <Button
              component={RouterLink}
              to="/auth/forgot-password"
              variant="contained"
            >
              Request New Reset Link
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Set New Password
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Enter your new password below
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              name="password"
              label="New Password"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              name="confirmPassword"
              label="Confirm New Password"
              type="password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              size="large"
              type="submit"
              sx={{ mb: 2 }}
            >
              Reset Password
            </Button>
          </form>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Remember your password?{' '}
              <Link component={RouterLink} to="/auth/login" color="primary">
                Sign in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};
