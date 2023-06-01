import { AnySchema, SchemaObject } from 'ajv';
import { Button, Divider } from '../../../../components';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { FormField } from './getFormField';
import { FC, useEffect, Fragment } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { validationSchema } from './validationSchema';
import { AiOutlinePlus as PlusIcon } from 'react-icons/ai';
import { AnyInputExceptArray, InputType, Input } from './InputTypes';
import { Form } from './style';

function getJsonSchemaElement(input: AnyInputExceptArray) {
  const res: SchemaObject = {
    type: input.type,
  };

  if (input.default !== undefined) {
    res.default = input.default;
  }

  if (input.title) {
    res.title = input.title;
  }

  if (input.description) {
    res.description = input.description;
  }

  switch (input.type) {
    case InputType.enum:
      res.enum = input.enum;
      break;

    case InputType.number:
      if (input.minimum) {
        res.minimum = input.minimum;
      }

      if (input.maximum) {
        res.maximum = input.maximum;
      }

      break;

    case InputType.string:
      if (input.minLength) {
        res.minLength = input.minLength;
      }

      if (input.maxLength) {
        res.maxLength = input.maxLength;
      }

      break;

    case InputType.boolean:
      break;

    default:
      throw new Error('Unknown input type');
  }

  return res;
}

export async function generateJSONSchema(inputs: Array<Input>) {
  const schema: AnySchema = {
    type: 'object',
    properties: {},
    required: [],
  };

  for (const input of inputs) {
    schema.properties[input.name] = {
      type: input.type,
    };

    if (input.required !== false) {
      schema.required.push(input.name);
    }

    if (input.type === InputType.array) {
      schema.properties[input.name].items = getJsonSchemaElement(input.items);
    } else {
      schema.properties[input.name] = getJsonSchemaElement(input);
    }
  }

  return schema;
}

export interface IFormInputs {
  name: string;
  description?: string;
  configFields: Input[];
}

interface ISchemaGeneratorProps {
  onSchemaChange: (schema: AnySchema) => void;
}

export const SchemaGenerator: FC<ISchemaGeneratorProps> = ({
  onSchemaChange,
}) => {
  const { control, handleSubmit, getValues } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const { configFields } = useWatch<IFormInputs>({ control });

  const { append, fields, remove } = useFieldArray({
    control,
    name: 'configFields',
  });

  useEffect(() => {
    append({
      name: 'Default name',
      type: InputType.string,
      description: 'A helpful description',
      required: true,
      default: 'The default value',
    });
  }, []);

  useEffect(() => {
    onSubmit();
  }, [configFields]);

  const onSubmit = () => {
    const formValues = getValues();
    console.log('formValues', formValues);
    generateJSONSchema(formValues.configFields).then((schema) => {
      onSchemaChange(schema);
    });
  };

  const formValues = getValues();

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {formValues.configFields
        ? fields.map((field, index) => {
            return (
              <Fragment key={`config-field-wrapper-${field.id}`}>
                <FormField
                  key={`config-field-${field.id}`}
                  id={field.id}
                  input={field}
                  control={control}
                  index={index}
                  remove={remove}
                />
                {index != fields.length - 1 && (
                  <Divider key={`config-field-divider-${field.id}`} />
                )}
              </Fragment>
            );
          })
        : []}
      <Button
        text="Config Field"
        type="button"
        fullWidth
        icon={<PlusIcon />}
        onClick={() => {
          append({
            name: 'Default name',
            type: InputType.string,
            description: 'A helpful description',
            required: true,
            default: 'The default value',
          });
        }}
      />
      <Button text="Save schema" type="submit" />
    </Form>
  );
};
