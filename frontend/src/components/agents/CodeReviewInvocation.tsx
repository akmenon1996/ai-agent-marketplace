import React from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';
import { AgentInvocation } from './AgentInvocation';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const languages = [
  'python',
  'javascript',
  'typescript',
  'java',
  'c++',
  'go',
  'rust',
  'ruby',
  'php',
];

interface CodeReviewFormData {
  code: string;
  language: string;
  context: string;
}

interface CodeReviewInvocationProps {
  onSubmit: (data: CodeReviewFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  result?: any;
}

const validationSchema = Yup.object({
  code: Yup.string().required('Code is required'),
  language: Yup.string().required('Language is required'),
  context: Yup.string(),
});

export const CodeReviewInvocation: React.FC<CodeReviewInvocationProps> = ({
  onSubmit,
  loading = false,
  error = null,
  result = null,
}) => {
  const formik = useFormik({
    initialValues: {
      code: '',
      language: 'python',
      context: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  return (
    <AgentInvocation
      title="Code Review"
      loading={loading}
      error={error}
      result={result}
    >
      <form onSubmit={formik.handleSubmit}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Language</InputLabel>
          <Select
            name="language"
            value={formik.values.language}
            onChange={formik.handleChange}
            error={formik.touched.language && Boolean(formik.errors.language)}
            label="Language"
          >
            {languages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={10}
          name="code"
          label="Code"
          value={formik.values.code}
          onChange={formik.handleChange}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          name="context"
          label="Additional Context (optional)"
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
            Review Code
          </Button>
        </Box>
      </form>
    </AgentInvocation>
  );
};
