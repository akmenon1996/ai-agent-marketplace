import React from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
} from '@mui/material';
import { Upload, Clear } from '@mui/icons-material';
import { AgentInvocation } from './AgentInvocation';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface ResumeReviewFormData {
  resume_text: string;
  context?: string;
}

interface ResumeReviewInvocationProps {
  onSubmit: (data: ResumeReviewFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  result?: any;
}

const validationSchema = Yup.object({
  resume_text: Yup.string().required('Resume text is required'),
  context: Yup.string(),
});

export const ResumeReviewInvocation: React.FC<ResumeReviewInvocationProps> = ({
  onSubmit,
  loading = false,
  error = null,
  result = null,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formik = useFormik({
    initialValues: {
      resume_text: '',
      context: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        formik.setFieldValue('resume_text', text);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      try {
        const text = await file.text();
        formik.setFieldValue('resume_text', text);
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
  };

  return (
    <AgentInvocation
      title="Resume Review"
      loading={loading}
      error={error}
      result={result}
    >
      <form onSubmit={formik.handleSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileUpload}
        />

        <Paper
          variant="outlined"
          sx={{
            p: 3,
            mb: 2,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: 'grey.50',
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            Upload Resume
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag and drop a file here or click to select
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Supported formats: PDF, DOC, DOCX, TXT
          </Typography>
        </Paper>

        <TextField
          fullWidth
          multiline
          rows={10}
          name="resume_text"
          label="Resume Text"
          value={formik.values.resume_text}
          onChange={formik.handleChange}
          error={formik.touched.resume_text && Boolean(formik.errors.resume_text)}
          helperText={formik.touched.resume_text && formik.errors.resume_text}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: formik.values.resume_text && (
              <IconButton
                onClick={() => formik.setFieldValue('resume_text', '')}
                edge="end"
              >
                <Clear />
              </IconButton>
            ),
          }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          name="context"
          label="Additional Context (e.g., target role, industry)"
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
            Review Resume
          </Button>
        </Box>
      </form>
    </AgentInvocation>
  );
};
