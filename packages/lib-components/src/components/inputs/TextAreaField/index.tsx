import { FC, useState, ChangeEvent } from 'react';
import { Container, TextAreaContainer, TextArea } from './style';

import { ErrorMessage } from '../ErrorMessage';
import { Label } from '../Label';

import {
  InputProps,
  defaultInputProps,
  defaultInputPropsFactory,
} from '../InputProps';

export interface TextAreaFieldProps extends InputProps {
  placeholder?: string;
}

interface GenericTextFieldProps extends TextAreaFieldProps {
  onChange: (...event: unknown[]) => unknown;
  onBlur: (...event: unknown[]) => unknown;
  error?: string;
}

const defaultsApplier =
  defaultInputPropsFactory<GenericTextFieldProps>(defaultInputProps);

export const GenericTextAreaField: FC<GenericTextFieldProps> = (props) => {
  const {
    loading,
    label,
    hint,
    disabled,
    required,
    onBlur,
    placeholder,
    onChange,
    error,
    name,
    size,
    readOnly,
  } = defaultsApplier(props);

  const [showError, setShowError] = useState(false);

  const handleOnBlur = () => {
    onBlur();
    setShowError(false);
  };

  const handleOnChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleOnFocus = () => {
    setShowError(true);
  };

  if (loading) {
    return (
      <Container>
        {label && (
          <Label
            required={required}
            htmlFor={name}
            error={!!error}
            size={size}
            disabled={disabled}
            text={label}
            position="top"
          />
        )}
        <TextAreaContainer className="placeholder" />
      </Container>
    );
  }

  return (
    <Container>
      {label && (
        <Label
          required={required}
          hint={hint}
          htmlFor={name}
          error={!!error}
          size={size}
          text={label}
          disabled={disabled}
          position="top"
        />
      )}
      <TextAreaContainer>
        <TextArea
          hasError={!!error}
          id={name}
          name={name}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          role="presentation"
        />
      </TextAreaContainer>
      {error && showError && <ErrorMessage message={error} />}
      {props.description && <p>{props.description}</p>}
    </Container>
  );
};
