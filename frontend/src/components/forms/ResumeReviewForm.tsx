import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import { useForm, Controller, FieldValues } from 'react-hook-form';

interface ResumeReviewFormData extends FieldValues {
  resume_text: string;
  context?: string;
}

interface ResumeReviewFormProps {
  onSubmit: (data: ResumeReviewFormData) => void;
  loading?: boolean;
}

export const ResumeReviewForm: React.FC<ResumeReviewFormProps> = ({ 
  onSubmit,
  loading = false 
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResumeReviewFormData>({
    defaultValues: {
      resume_text: '',
      context: '',
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Controller
        name="resume_text"
        control={control}
        rules={{ required: 'Resume text is required' }}
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
            rows={10}
            label="Resume Text"
            fullWidth
            disabled={loading}
          />
        )}
      />

      <Controller
        name="context"
        control={control}
        render={({
          field: { onChange, value },
          fieldState: { error },
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            multiline
            rows={4}
            label="Additional Context (Optional)"
            fullWidth
            disabled={loading}
          />
        )}
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Submit'}
        </Button>
      </Box>
    </Box>
  );
};
