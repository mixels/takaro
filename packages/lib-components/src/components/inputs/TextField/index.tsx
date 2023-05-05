import { FC, cloneElement, useState, ChangeEvent, ReactElement } from 'react';
import {
  Container,
  InputContainer,
  Input,
  PrefixContainer,
  SuffixContainer,
} from './style';

import { Size } from '../../../styled';
import { ErrorMessage, Label } from '../../../components';
import {
  AiOutlineEye as ShowPasswordIcon,
  AiOutlineEyeInvisible as HidePasswordIcon,
} from 'react-icons/ai';
import { getFieldType, getInputMode } from './util';
import {
  defaultInputProps,
  defaultInputPropsFactory,
  InputProps,
} from '../InputProps';

export type TextFieldType = 'text' | 'password' | 'email' | 'number';

export interface TextFieldProps extends InputProps {
  type?: TextFieldType;
  placeholder?: string;
  size?: Size;
  prefix?: string;
  suffix?: string;
  icon?: ReactElement;
  description?: string;
}

interface GenericTextFieldProps extends TextFieldProps {
  onChange: (...event: unknown[]) => unknown;
  onBlur: (...event: unknown[]) => unknown;
  error?: string;
}

const defaultsApplier =
  defaultInputPropsFactory<GenericTextFieldProps>(defaultInputProps);

// TODO: setup forwardRef so the control ref can be passed to the component
export const GenericTextField: FC<GenericTextFieldProps> = (props) => {
  const {
    onChange,
    description,
    onBlur,
    error,
    loading,
    label,
    hint,
    disabled,
    required,
    name,
    size,
    readOnly,
    placeholder,
    icon,
    type,
    prefix,
    suffix,
  } = defaultsApplier(props);

  const [showError, setShowError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleOnBlur = () => {
    onBlur();
    setShowError(false);
  };

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (type === 'number' && !isNaN(parseInt(event.target.value))) {
      // try to parse first
      onChange(parseInt(event.target.value));
      return;
    }
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
        <InputContainer className="placeholder" />
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
      <InputContainer>
        {prefix && <PrefixContainer>{prefix}</PrefixContainer>}
        {icon && cloneElement(icon, { size: 22, className: 'icon' })}
        <Input
          autoCapitalize="off"
          autoComplete={type === 'password' ? 'new-password' : 'off'}
          hasError={!!error}
          hasIcon={!!icon}
          hasPrefix={!!prefix}
          hasSuffix={!!suffix}
          isPassword={type === 'password'}
          id={name}
          name={name}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
          placeholder={placeholder}
          readOnly={readOnly}
          role="presentation"
          inputMode={getInputMode(type)}
          type={getFieldType(type, showPassword)}
        />
        {type === 'password' &&
          (showPassword ? (
            <HidePasswordIcon
              className="password-icon"
              onClick={() => {
                setShowPassword(false);
              }}
              size="22"
            />
          ) : (
            <ShowPasswordIcon
              className="password-icon"
              onClick={() => {
                setShowPassword(true);
              }}
              size="22"
            />
          ))}
        {suffix && <SuffixContainer>{suffix}</SuffixContainer>}
      </InputContainer>
      {error && showError && <ErrorMessage message={error} />}
      {description && <p>{description}</p>}
    </Container>
  );
};
