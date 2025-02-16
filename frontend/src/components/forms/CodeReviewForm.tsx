import React from 'react';
import { Box, TextField, Button, MenuItem } from '@mui/material';

// Define types that would normally come from react-hook-form
type FieldValues = Record<string, any>;

interface UseFormReturn<T extends FieldValues> {
  control: Control<T>;
  handleSubmit: (onSubmit: (data: T) => void) => (e: React.FormEvent) => void;
}

interface Control<T extends FieldValues> {
  _defaultValues: Partial<T>;
}

interface FieldError {
  type: string;
  message?: string;
}

interface UseControllerReturn<T extends FieldValues> {
  field: {
    onChange: (...event: any[]) => void;
    value: any;
  };
  fieldState: {
    error?: FieldError;
  };
}

interface Controller<T extends FieldValues> {
  name: keyof T;
  control: Control<T>;
  rules?: Record<string, any>;
  render: (props: UseControllerReturn<T>) => React.ReactElement;
}

// Mock the useForm and Controller functionality
function useForm<T extends FieldValues>(): UseFormReturn<T> {
  const [values, setValues] = React.useState<Partial<T>>({});

  return {
    control: {
      _defaultValues: values,
    },
    handleSubmit: (onSubmit: (data: T) => void) => (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(values as T);
    },
  };
}

function Controller<T extends FieldValues>(props: Controller<T>) {
  const [value, setValue] = React.useState<any>(props.control._defaultValues[props.name]);

  return props.render({
    field: {
      onChange: (e: any) => setValue(e.target.value),
      value: value,
    },
    fieldState: {
      error: undefined,
    },
  });
}

interface CodeReviewFormData extends FieldValues {
  code: string;
  language: string;
  context?: string;
}

interface CodeReviewFormProps {
  onSubmit: (data: CodeReviewFormData) => void;
  loading?: boolean;
}

const LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'java',
  'c++',
  'c#',
  'ruby',
  'go',
  'rust',
  'php',
];

export const CodeReviewForm: React.FC<CodeReviewFormProps> = ({ onSubmit, loading = false }) => {
  const { control, handleSubmit } = useForm<CodeReviewFormData>();

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
      <Controller<CodeReviewFormData>
        name="code"
        control={control}
        rules={{ required: 'Code is required' }}
        render={({
          field: { onChange, value },
          fieldState: { error },
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error?.message}
            label="Code"
            multiline
            rows={10}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
      />

      <Controller<CodeReviewFormData>
        name="language"
        control={control}
        rules={{ required: 'Language is required' }}
        render={({
          field: { onChange, value },
          fieldState: { error },
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error?.message}
            label="Language"
            select
            fullWidth
            sx={{ mb: 2 }}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {lang}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Controller<CodeReviewFormData>
        name="context"
        control={control}
        render={({
          field: { onChange, value },
        }) => (
          <TextField
            value={value}
            onChange={onChange}
            label="Additional Context"
            multiline
            rows={4}
            fullWidth
            sx={{ mb: 2 }}
          />
        )}
      />

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
      >
        {loading ? 'Reviewing...' : 'Review Code'}
      </Button>
    </Box>
  );
};
