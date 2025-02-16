import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../../store/AuthContext';
import { tokenService } from '../../services/token';

interface PurchaseTokensProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PurchaseTokens: React.FC<PurchaseTokensProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { token, user } = useAuth();
  const [amount, setAmount] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handlePurchase = async () => {
    if (!token || !amount) return;

    setLoading(true);
    setError(null);

    try {
      const response = await tokenService.purchaseTokens(token, amount);
      if (response.status === 'success') {
        // Refresh the balance by calling onSuccess
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        setError(response.error || 'Failed to purchase tokens');
      }
    } catch (err) {
      setError('An error occurred while purchasing tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Purchase Tokens</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Current Balance: {user?.token_balance || 0} tokens
        </Typography>

        <TextField
          autoFocus
          margin="dense"
          label="Amount"
          type="number"
          fullWidth
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
          disabled={loading}
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handlePurchase}
          color="primary"
          disabled={loading || amount <= 0}
        >
          {loading ? <CircularProgress size={24} /> : 'Purchase'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
