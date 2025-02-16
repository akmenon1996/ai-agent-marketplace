import React from 'react';
import { Box, TextField, Button, MenuItem, CircularProgress } from '@mui/material';
import { useForm, Controller, FieldValues } from 'react-hook-form';

export interface WritingAssistantFormData {
  content: string;
  type: string;
  tone?: string;
  target_audience?: string;
}

interface WritingAssistantFormProps {
  onSubmit: (data: WritingAssistantFormData) => void;
  loading?: boolean;
}

const WRITING_TYPES = [
  'email',
  'blog-post',
  'social-media',
  'documentation',
  'report',
  'other',
];

const TONES = [
  'professional',
  'casual',
  'friendly',
  'formal',
  'technical',
];

export const WritingAssistantForm: React.FC<WritingAssistantFormProps> = ({ onSubmit, loading }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<WritingAssistantFormData>({
    defaultValues: {
      content: '',
      type: '',
      tone: '',
      target_audience: '',
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <Controller
        name="content"
        control={control}
        rules={{ required: 'Content is required' }}
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
            label="Your Content"
            fullWidth
          />
        )}
      />

      <Controller
        name="type"
        control={control}
        rules={{ required: 'Content type is required' }}
        render={({
          field: { onChange, value },
          fieldState: { error },
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error?.message}
            select
            label="Content Type"
            fullWidth
          >
            {WRITING_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="tone"
        control={control}
        render={({
          field: { onChange, value },
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            select
            label="Tone (Optional)"
            fullWidth
          >
            {TONES.map((tone) => (
              <MenuItem key={tone} value={tone}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller
        name="target_audience"
        control={control}
        render={({
          field: { onChange, value },
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            label="Target Audience (Optional)"
            fullWidth
            helperText="Who is this content for?"
          />
        )}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading || !control._formValues.content || !control._formValues.type}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Improve Content'}
      </Button>
    </Box>
  );
};
