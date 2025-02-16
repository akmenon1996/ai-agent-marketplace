import React from 'react';
import { Box, TextField, Button, CircularProgress } from '@mui/material';
import { useForm, Controller, FieldValues } from 'react-hook-form';

export interface TechnicalTroubleshootingFormData {
  problem: string;
  context?: string;
  attempted_solutions?: string;
  error_messages?: string;
}

interface TechnicalTroubleshootingFormProps {
  onSubmit: (data: TechnicalTroubleshootingFormData) => void;
  loading?: boolean;
}

export const TechnicalTroubleshootingForm: React.FC<TechnicalTroubleshootingFormProps> = ({
  onSubmit,
  loading,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TechnicalTroubleshootingFormData>({
    defaultValues: {
      problem: '',
      context: '',
      attempted_solutions: '',
      error_messages: '',
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Controller
        name="problem"
        control={control}
        rules={{ required: 'Problem description is required' }}
        render={({
          field: { onChange, value },
          fieldState: { error },
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error?.message}
            multiline
            rows={6}
            label="Describe Your Problem"
            fullWidth
          />
        )}
      />

      <Controller
        name="context"
        control={control}
        render={({
          field: { onChange, value }
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            multiline
            rows={3}
            label="Context (Optional)"
            helperText="Any relevant background information"
            fullWidth
          />
        )}
      />

      <Controller
        name="attempted_solutions"
        control={control}
        render={({
          field: { onChange, value }
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            multiline
            rows={3}
            label="Attempted Solutions (Optional)"
            helperText="What have you tried so far?"
            fullWidth
          />
        )}
      />

      <Controller
        name="error_messages"
        control={control}
        render={({
          field: { onChange, value }
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            multiline
            rows={3}
            label="Error Messages (Optional)"
            helperText="Any error messages you're seeing"
            fullWidth
          />
        )}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading || !control._formValues.problem}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Get Help'}
      </Button>
    </Box>
  );
};
