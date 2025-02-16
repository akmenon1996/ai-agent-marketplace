import React from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { AgentInvocation } from './AgentInvocation';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const writingStyles = [
  'professional',
  'academic',
  'casual',
  'creative',
  'technical',
  'persuasive',
];

interface WritingAssistantFormData {
  text: string;
  style: string;
  context?: string;
}

interface WritingAssistantInvocationProps {
  onSubmit: (data: WritingAssistantFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  result?: any;
}

const validationSchema = Yup.object({
  text: Yup.string().required('Text is required'),
  style: Yup.string().required('Writing style is required'),
  context: Yup.string(),
});

export const WritingAssistantInvocation: React.FC<
  WritingAssistantInvocationProps
> = ({ onSubmit, loading = false, error = null, result = null }) => {
  const [wordCount, setWordCount] = React.useState(0);

  const formik = useFormik({
    initialValues: {
      text: '',
      style: 'professional',
      context: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  React.useEffect(() => {
    const words = formik.values.text.trim().split(/\s+/).length;
    setWordCount(formik.values.text.trim() === '' ? 0 : words);
  }, [formik.values.text]);

  return (
    <AgentInvocation
      title="Writing Assistant"
      loading={loading}
      error={error}
      result={result}
    >
      <form onSubmit={formik.handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Writing Style</InputLabel>
          <Select
            name="style"
            value={formik.values.style}
            onChange={formik.handleChange}
            error={formik.touched.style && Boolean(formik.errors.style)}
            label="Writing Style"
          >
            {writingStyles.map((style) => (
              <MenuItem key={style} value={style}>
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={10}
          name="text"
          label="Your Text"
          value={formik.values.text}
          onChange={formik.handleChange}
          error={formik.touched.text && Boolean(formik.errors.text)}
          helperText={
            (formik.touched.text && formik.errors.text) ||
            `Word count: ${wordCount}`
          }
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          name="context"
          label="Additional Context (e.g., target audience, purpose)"
          value={formik.values.context}
          onChange={formik.handleChange}
          error={formik.touched.context && Boolean(formik.errors.context)}
          helperText={formik.touched.context && formik.errors.context}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            size="large"
          >
            Improve Writing
          </Button>
        </Box>
      </form>
    </AgentInvocation>
  );
};
