import React, { useState } from 'react';
import { Box, TextField, Button, MenuItem, CircularProgress } from '@mui/material';

export interface InterviewPrepFormData {
  role: string;
  company?: string;
  experience_level: string;
  focus_areas?: string;
}

interface InterviewPrepFormProps {
  onSubmit: (data: InterviewPrepFormData) => void;
  loading?: boolean;
}

const EXPERIENCE_LEVELS = [
  'entry',
  'junior',
  'mid-level',
  'senior',
  'lead',
];

export const InterviewPrepForm: React.FC<InterviewPrepFormProps> = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState<InterviewPrepFormData>({
    role: '',
    company: '',
    experience_level: '',
    focus_areas: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        required
        name="role"
        label="Target Role"
        value={formData.role}
        onChange={handleChange}
        sx={{ mb: 2 }}
        inputProps={{ 'data-gramm': 'false' }}
      />

      <TextField
        fullWidth
        name="company"
        label="Target Company (Optional)"
        value={formData.company}
        onChange={handleChange}
        sx={{ mb: 2 }}
        inputProps={{ 'data-gramm': 'false' }}
      />

      <TextField
        fullWidth
        required
        select
        name="experience_level"
        label="Experience Level"
        value={formData.experience_level}
        onChange={handleChange}
        sx={{ mb: 2 }}
      >
        {EXPERIENCE_LEVELS.map((level) => (
          <MenuItem key={level} value={level}>
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        fullWidth
        multiline
        rows={4}
        name="focus_areas"
        label="Focus Areas (Optional)"
        value={formData.focus_areas}
        onChange={handleChange}
        helperText="Specific topics or areas you'd like to focus on"
        sx={{ mb: 2 }}
        inputProps={{ 'data-gramm': 'false' }}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={loading || !formData.role || !formData.experience_level}
        sx={{ mt: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Get Interview Questions'}
      </Button>
    </Box>
  );
};
