import { FC, useEffect, useState } from 'react';
import { SubmitHandler, useForm, Control } from 'react-hook-form';
import {
  Button,
  Select,
  OptionGroup,
  Option,
  TextField,
  DrawerContent,
  DrawerHeading,
  Drawer,
  DrawerFooter,
  DrawerBody,
  CollapseList,
  Tooltip,
  ErrorMessage,
} from '@takaro/lib-components';
import { ButtonContainer } from './style';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  GameServerCreateDTOTypeEnum,
  MockConnectionInfo,
  RustConnectionInfo,
  SdtdConnectionInfo,
} from '@takaro/apiclient';
import { useNavigate } from 'react-router-dom';
import { PATHS } from 'paths';
import * as Sentry from '@sentry/react';
import { useGameServerCreate } from 'queries/gameservers';
import { connectionInfoFieldsMap } from './connectionInfoFieldsMap';
import { validationSchema } from './validationSchema';

export interface IFormInputs {
  name: string;
  type: GameServerCreateDTOTypeEnum;
  connectionInfo: MockConnectionInfo | RustConnectionInfo | SdtdConnectionInfo;
}

const CreateGameServer: FC = () => {
  const [open, setOpen] = useState(true);
  const [error, setError] = useState<string>();
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useGameServerCreate();

  useEffect(() => {
    if (!open) {
      navigate(PATHS.gameServers.overview());
    }
  }, [open, navigate]);

  const { control, handleSubmit, watch } = useForm<IFormInputs>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema),
  });

  const onSubmit: SubmitHandler<IFormInputs> = async ({
    type,
    connectionInfo,
    name,
  }) => {
    try {
      setError('');

      mutateAsync({
        type,
        name,
        connectionInfo: JSON.stringify(connectionInfo),
      });

      navigate(PATHS.gameServers.overview());
    } catch (error) {
      Sentry.captureException(error);
    }
  };

  const gameTypeSelectOptions = [
    {
      name: 'Mock (testing purposes)',
      value: GameServerCreateDTOTypeEnum.Mock,
      show: import.meta.env.DEV,
    },
    {
      name: 'Rust',
      value: GameServerCreateDTOTypeEnum.Rust,
      show: true,
    },
    {
      name: '7 Days to die',
      value: GameServerCreateDTOTypeEnum.Sevendaystodie,
      show: true,
    },
  ].filter(({ show }) => show);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerContent>
        <DrawerHeading>Create Game Server</DrawerHeading>
        <DrawerBody>
          <CollapseList>
            <form
              onSubmit={handleSubmit(onSubmit)}
              id="create-game-server-form"
            >
              <CollapseList.Item title="General">
                <TextField
                  control={control}
                  label="Server name"
                  loading={isLoading}
                  name="name"
                  placeholder="My cool server"
                  required
                />

                <Select
                  control={control}
                  name="type"
                  label="Game Server"
                  required
                  loading={isLoading}
                  render={(selectedIndex) => (
                    <div>
                      {gameTypeSelectOptions[selectedIndex]?.name ??
                        'Select...'}
                    </div>
                  )}
                >
                  <OptionGroup label="Games">
                    {gameTypeSelectOptions.map(({ name, value }) => (
                      <Option key={`select-${name}`} value={value}>
                        <div>
                          <span>{name}</span>
                        </div>
                      </Option>
                    ))}
                  </OptionGroup>
                </Select>
              </CollapseList.Item>
              {watch('type') !== undefined && (
                <CollapseList.Item title="Connection info">
                  {connectionInfoFieldsMap(isLoading, control)[watch('type')]}
                </CollapseList.Item>
              )}
              {error && <ErrorMessage message={error} />}
            </form>
          </CollapseList>
        </DrawerBody>
        <DrawerFooter>
          <ButtonContainer>
            <Button
              text="Cancel"
              onClick={() => setOpen(false)}
              color="background"
            />
            <Tooltip label="You need to test the connection before we can save">
              <Button
                fullWidth
                text="Save changes"
                type="submit"
                form="create-game-server-form"
              />
            </Tooltip>
          </ButtonContainer>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateGameServer;