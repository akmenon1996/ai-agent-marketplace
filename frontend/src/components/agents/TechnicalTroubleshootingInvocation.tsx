import React from 'react';
import {
  TextField,
  Button,
  Box,
  Autocomplete,
  Chip,
  Typography,
} from '@mui/material';
import { AgentInvocation } from './AgentInvocation';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const commonTags = [
  'React',
  'Node.js',
  'Python',
  'Docker',
  'Kubernetes',
  'AWS',
  'Database',
  'Network',
  'Security',
  'Performance',
  'Memory',
  'CPU',
  'Disk',
  'API',
  'Frontend',
  'Backend',
];

interface TechnicalTroubleshootingFormData {
  problem: string;
  system_info?: string;
  context?: string;
  tags?: string[];
}

interface TechnicalTroubleshootingInvocationProps {
  onSubmit: (data: TechnicalTroubleshootingFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  result?: any;
}

const validationSchema = Yup.object({
  problem: Yup.string().required('Problem description is required'),
  system_info: Yup.string(),
  context: Yup.string(),
  tags: Yup.array().of(Yup.string()),
});

export const TechnicalTroubleshootingInvocation: React.FC<
  TechnicalTroubleshootingInvocationProps
> = ({ onSubmit, loading = false, error = null, result = null }) => {
  const formik = useFormik({
    initialValues: {
      problem: '',
      system_info: '',
      context: '',
      tags: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  return (
    <AgentInvocation
      title="Technical Troubleshooting"
      loading={loading}
      error={error}
      result={result}
    >
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={5}
          name="problem"
          label="Describe the Problem"
          value={formik.values.problem}
          onChange={formik.handleChange}
          error={formik.touched.problem && Boolean(formik.errors.problem)}
          helperText={formik.touched.problem && formik.errors.problem}
          sx={{ mb: 2 }}
        />

        <Autocomplete
          multiple
          options={commonTags}
          value={formik.values.tags}
          onChange={(_, newValue) => {
            formik.setFieldValue('tags', newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Related Technologies/Areas"
              placeholder="Add tags"
            />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                label={option}
                {...getTagProps({ index })}
                color="primary"
                variant="outlined"
              />
            ))
          }
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          name="system_info"
          label="System Information (OS, versions, environment)"
          value={formik.values.system_info}
          onChange={formik.handleChange}
          error={formik.touched.system_info && Boolean(formik.errors.system_info)}
          helperText={formik.touched.system_info && formik.errors.system_info}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          name="context"
          label="Additional Context (steps to reproduce, error messages)"
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
            Troubleshoot
          </Button>
        </Box>
      </form>
    </AgentInvocation>
  );
};
