import React from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { AgentInvocation } from './AgentInvocation';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const experienceLevels = [
  'entry',
  'junior',
  'mid-level',
  'senior',
  'lead',
  'manager',
];

interface InterviewPrepFormData {
  topic: string;
  experience_level: string;
  context?: string;
}

interface InterviewPrepInvocationProps {
  onSubmit: (data: InterviewPrepFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  result?: any;
}

const validationSchema = Yup.object({
  topic: Yup.string().required('Topic is required'),
  experience_level: Yup.string().required('Experience level is required'),
  context: Yup.string(),
});

const suggestedTopics = [
  'React',
  'Node.js',
  'Python',
  'System Design',
  'Data Structures',
  'Algorithms',
  'Machine Learning',
  'DevOps',
  'Cloud Computing',
];

export const InterviewPrepInvocation: React.FC<InterviewPrepInvocationProps> = ({
  onSubmit,
  loading = false,
  error = null,
  result = null,
}) => {
  const formik = useFormik({
    initialValues: {
      topic: '',
      experience_level: 'mid-level',
      context: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await onSubmit(values);
    },
  });

  const handleTopicClick = (topic: string) => {
    formik.setFieldValue('topic', topic);
  };

  return (
    <AgentInvocation
      title="Interview Preparation"
      loading={loading}
      error={error}
      result={result}
    >
      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          name="topic"
          label="Interview Topic"
          value={formik.values.topic}
          onChange={formik.handleChange}
          error={formik.touched.topic && Boolean(formik.errors.topic)}
          helperText={formik.touched.topic && formik.errors.topic}
          sx={{ mb: 2 }}
        />

        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
          {suggestedTopics.map((topic) => (
            <Chip
              key={topic}
              label={topic}
              onClick={() => handleTopicClick(topic)}
              variant={formik.values.topic === topic ? 'filled' : 'outlined'}
              color={formik.values.topic === topic ? 'primary' : 'default'}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Stack>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Experience Level</InputLabel>
          <Select
            name="experience_level"
            value={formik.values.experience_level}
            onChange={formik.handleChange}
            error={
              formik.touched.experience_level &&
              Boolean(formik.errors.experience_level)
            }
            label="Experience Level"
          >
            {experienceLevels.map((level) => (
              <MenuItem key={level} value={level}>
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          multiline
          rows={3}
          name="context"
          label="Additional Context (e.g., specific company, role)"
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
            Generate Questions
          </Button>
        </Box>
      </form>
    </AgentInvocation>
  );
};
