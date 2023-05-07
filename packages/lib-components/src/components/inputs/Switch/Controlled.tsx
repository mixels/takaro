import { ControlledInputProps } from '../InputProps';

import { useController } from 'react-hook-form';
import { FC } from 'react';
import { GenericSwitch } from '.';

export type ControlledSwitchProps = ControlledInputProps;

export const ControlledSwitch: FC<ControlledSwitchProps> = ({
  readOnly,
  loading,
  disabled,
  required,
  value,
  size,
  description,
  label,
  hint,
  name,
  control,
}) => {
  const { field, fieldState } = useController({
    name,
    control,
    defaultValue: value,
  });

  return (
    <GenericSwitch
      name={name}
      hint={hint}
      label={label}
      description={description}
      size={size}
      value={value}
      required={required}
      disabled={disabled}
      loading={loading}
      error={fieldState.error?.message}
      onChange={field.onChange}
      onBlur={field.onBlur}
      readOnly={readOnly}
    />
  );
};
