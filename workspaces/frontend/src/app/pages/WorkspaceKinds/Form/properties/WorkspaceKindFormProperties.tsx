import React, { useState, useCallback } from 'react';
import {
  Content,
  ExpandableSection,
  Form,
  FormGroup,
  HelperText,
  HelperTextItem,
  Switch,
  TextInput,
  ValidatedOptions,
} from '@patternfly/react-core';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { WorkspaceKindProperties } from '~/app/types';

interface WorkspaceKindFormPropertiesProps {
  mode: string;
  properties: WorkspaceKindProperties;
  updateField: (properties: WorkspaceKindProperties) => void;
}

// Define the Zod schema for validation
const propertiesSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Workspace Kind Name is required')
    .max(100, 'Workspace Kind Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  deprecated: z.boolean(),
  deprecationMessage: z
    .string()
    .max(200, 'Deprecation message must be less than 200 characters')
    .optional(),
  hidden: z.boolean(),
  icon: z.object({
    url: z.url({
      protocol: /^https?$/,
      message: 'Please enter a valid URL for the icon',
    }),
  }),
  logo: z.object({
    url: z.url({
      protocol: /^https?$/,
      message: 'Please enter a valid URL for the logo',
    }),
  }),
});

type FormData = z.infer<typeof propertiesSchema>;

type PropertiesInputType = boolean | string | { url: string };

export const WorkspaceKindFormProperties: React.FC<WorkspaceKindFormPropertiesProps> = ({
  mode,
  properties,
  updateField,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(propertiesSchema),
    values: properties,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  // Watch form values to sync with parent
  const formValues = watch();

  const getValidationProps = useCallback(
    (fieldError?: { message?: string }) => ({
      validated: fieldError ? ValidatedOptions.error : ValidatedOptions.default,
    }),
    [],
  );

  const handleChange = useCallback(
    (
      field: string,
      value: PropertiesInputType,
      onChange: (...event: PropertiesInputType[]) => void,
    ) => {
      onChange(value);
      updateField({ ...properties, [field]: value });
    },
    [updateField, properties],
  );

  return (
    <Content>
      <div className="pf-u-mb-0">
        <ExpandableSection
          toggleText="Properties"
          onToggle={() => setIsExpanded((prev) => !prev)}
          isExpanded={isExpanded}
          isIndented
        >
          <Form>
            <FormGroup label="Workspace Kind Name" isRequired fieldId="workspace-kind-name">
              <Controller
                name="displayName"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    isRequired
                    type="text"
                    id="workspace-kind-name"
                    onChange={(_, value) => {
                      handleChange('displayName', value, field.onChange);
                    }}
                    {...getValidationProps(errors.displayName)}
                  />
                )}
              />
              {errors.displayName && (
                <HelperText>
                  <HelperTextItem variant="error">{errors.displayName.message}</HelperTextItem>
                </HelperText>
              )}
            </FormGroup>

            <FormGroup label="Description" fieldId="workspace-kind-description">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    type="text"
                    id="workspace-kind-description"
                    onChange={(_, value) => {
                      handleChange('description', value, field.onChange);
                    }}
                    {...getValidationProps(errors.description)}
                  />
                )}
              />
              {errors.description && (
                <HelperText>
                  <HelperTextItem variant="error">{errors.description.message}</HelperTextItem>
                </HelperText>
              )}
            </FormGroup>

            {mode === 'edit' && (
              <FormGroup
                style={{ marginTop: 'var(--mui-spacing-16px)' }}
                fieldId="workspace-kind-deprecated"
              >
                <Controller
                  name="deprecated"
                  control={control}
                  render={({ field: { value, onChange } }) => (
                    <Switch
                      aria-label="workspace-kind-deprecated"
                      isChecked={value}
                      label={
                        <div>
                          <div>Deprecated</div>
                          <HelperText>
                            Flag this workspace kind as deprecated and optionally set a deprecation
                            message
                          </HelperText>
                        </div>
                      }
                      onChange={(_, checked) => {
                        handleChange('deprecated', checked, onChange);
                      }}
                      id="workspace-kind-deprecated"
                      name="workspace-kind-deprecated-switch"
                    />
                  )}
                />
              </FormGroup>
            )}

            {mode === 'edit' && formValues.deprecated && (
              <FormGroup>
                <Controller
                  name="deprecationMessage"
                  control={control}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      type="text"
                      label="Deprecation Message"
                      placeholder="Deprecation Message"
                      id="workspace-kind-deprecated-msg"
                      onChange={(_, value) => {
                        handleChange('deprecationMessage', value, field.onChange);
                      }}
                      {...getValidationProps(errors.deprecationMessage)}
                    />
                  )}
                />
                {errors.deprecationMessage && (
                  <HelperText>
                    <HelperTextItem variant="error">
                      {errors.deprecationMessage.message}
                    </HelperTextItem>
                  </HelperText>
                )}
              </FormGroup>
            )}

            <FormGroup
              fieldId="workspace-kind-hidden"
              style={{ marginTop: 'var(--mui-spacing-16px)' }}
            >
              <Controller
                name="hidden"
                control={control}
                render={({ field: { value, onChange } }) => (
                  <Switch
                    isChecked={value}
                    onChange={(_, checked) => {
                      handleChange('hidden', checked, onChange);
                    }}
                    id="workspace-kind-hidden"
                    name="workspace-kind-hidden-switch"
                    aria-label="workspace-kind-hidden"
                    label={
                      <div>
                        <div>Hidden</div>
                        <HelperText>Hide this workspace kind from users</HelperText>
                      </div>
                    }
                  />
                )}
              />
            </FormGroup>
            <FormGroup label="Icon URL" isRequired fieldId="workspace-kind-icon">
              <Controller
                name="icon.url"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    isRequired
                    type="text"
                    id="workspace-kind-icon"
                    onChange={(_, value) => {
                      field.onChange(value);
                      updateField({ ...properties, icon: { url: value } });
                    }}
                    {...getValidationProps(errors.icon?.url)}
                  />
                )}
              />
              {errors.icon?.url && (
                <HelperText>
                  <HelperTextItem variant="error">{errors.icon.url.message}</HelperTextItem>
                </HelperText>
              )}
            </FormGroup>

            <FormGroup label="Logo URL" isRequired fieldId="workspace-kind-logo">
              <Controller
                name="logo.url"
                control={control}
                render={({ field }) => (
                  <TextInput
                    {...field}
                    isRequired
                    type="text"
                    id="workspace-kind-logo"
                    onChange={(_, value) => {
                      field.onChange(value);
                      updateField({ ...properties, logo: { url: value } });
                    }}
                    {...getValidationProps(errors.logo?.url)}
                  />
                )}
              />
              {errors.logo?.url && (
                <HelperText>
                  <HelperTextItem variant="error">{errors.logo.url.message}</HelperTextItem>
                </HelperText>
              )}
            </FormGroup>
          </Form>
        </ExpandableSection>
      </div>
    </Content>
  );
};
