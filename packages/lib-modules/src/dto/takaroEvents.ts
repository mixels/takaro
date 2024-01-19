import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsIP,
  IsISO31661Alpha2,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { BaseEvent } from './base.js';
import { ValueOf } from 'type-fest';
import { Type } from 'class-transformer';
import { TakaroDTO } from '@takaro/util';

export const TakaroEvents = {
  ROLE_ASSIGNED: 'role-assigned',
  ROLE_REMOVED: 'role-removed',
  ROLE_CREATED: 'role-created',
  ROLE_UPDATED: 'role-updated',
  ROLE_DELETED: 'role-deleted',
  COMMAND_EXECUTED: 'command-executed',
  HOOK_EXECUTED: 'hook-executed',
  CRONJOB_EXECUTED: 'cronjob-executed',
  CURRENCY_ADDED: 'currency-added',
  CURRENCY_DEDUCTED: 'currency-deducted',
  SETTINGS_SET: 'settings-set',
  PLAYER_NEW_IP_DETECTED: 'player-new-ip-detected',
} as const;

export class BaseTakaroEvent<T> extends BaseEvent<T> {
  @IsDate()
  timestamp: Date = new Date();

  @IsEnum(TakaroEvents)
  declare type: ValueOf<typeof TakaroEvents>;

  @IsString()
  msg: string;
}

export class TakaroEventPlayerNewIpDetected extends BaseEvent<TakaroEventPlayerNewIpDetected> {
  @IsString()
  type = TakaroEvents.PLAYER_NEW_IP_DETECTED;

  @IsISO31661Alpha2()
  country: string;

  @IsString()
  city: string;

  @IsString()
  longitude: string;

  @IsString()
  latitude: string;

  @IsIP()
  ip: string;
}

export class TakaroEventCurrencyDeducted extends BaseEvent<TakaroEventCurrencyDeducted> {
  @IsString()
  type = TakaroEvents.CURRENCY_DEDUCTED;

  @IsNumber()
  amount: number;
}

export class TakaroEventCurrencyAdded extends BaseEvent<TakaroEventCurrencyAdded> {
  @IsString()
  type = TakaroEvents.CURRENCY_ADDED;

  @IsNumber()
  amount: number;
}

export class TakaroEventFunctionResult extends TakaroDTO<TakaroEventFunctionResult> {
  @ValidateNested({ each: true })
  @Type(() => TakaroEventFunctionLog)
  logs: TakaroEventFunctionLog[];

  @IsString()
  requestId: string;

  @IsBoolean()
  success: boolean;

  @IsString()
  @IsOptional()
  reason: string;

  @IsNumber()
  tryAgainIn: number;
}

export class TakaroEventFunctionLog extends TakaroDTO<TakaroEventFunctionLog> {
  @IsString()
  msg: string;

  @IsObject()
  @IsOptional()
  details: Record<string, unknown> | string | undefined;
}

export class TakaroEventCommandDetails extends TakaroDTO<TakaroEventCommandDetails> {
  @IsString()
  id: string;
  @IsString()
  name: string;
  @IsObject()
  arguments: Record<string, unknown>;
}

export class TakaroEventCommandExecuted extends BaseEvent<TakaroEventCommandExecuted> {
  @IsString()
  type = TakaroEvents.COMMAND_EXECUTED;

  @ValidateNested({ each: true })
  @Type(() => TakaroEventFunctionResult)
  result: TakaroEventFunctionResult;

  @IsOptional()
  @ValidateNested()
  @Type(() => TakaroEventCommandDetails)
  command: TakaroEventCommandDetails;
}

export class TakaroEventRoleMeta extends TakaroDTO<TakaroEventRoleMeta> {
  @IsString()
  id: string;
  @IsString()
  name: string;
}

export class TakaroEventRoleAssigned extends BaseEvent<TakaroEventRoleAssigned> {
  @IsString()
  type = TakaroEvents.ROLE_ASSIGNED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventRoleRemoved extends BaseEvent<TakaroEventRoleRemoved> {
  @IsString()
  type = TakaroEvents.ROLE_REMOVED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventRoleCreated extends BaseEvent<TakaroEventRoleCreated> {
  @IsString()
  type = TakaroEvents.ROLE_CREATED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventRoleUpdated extends BaseEvent<TakaroEventRoleUpdated> {
  @IsString()
  type = TakaroEvents.ROLE_UPDATED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventRoleDeleted extends BaseEvent<TakaroEventRoleDeleted> {
  @IsString()
  type = TakaroEvents.ROLE_DELETED;

  @ValidateNested()
  @Type(() => TakaroEventRoleMeta)
  role: TakaroEventRoleMeta;
}

export class TakaroEventSettingsSet extends BaseEvent<TakaroEventSettingsSet> {
  @IsString()
  type = TakaroEvents.SETTINGS_SET;

  @IsString()
  key: string;

  @IsString()
  value: string;
}

export const TakaroEventsMapping = {
  [TakaroEvents.ROLE_ASSIGNED]: TakaroEventRoleAssigned,
  [TakaroEvents.PLAYER_NEW_IP_DETECTED]: TakaroEventPlayerNewIpDetected,
  [TakaroEvents.CURRENCY_DEDUCTED]: TakaroEventCurrencyDeducted,
  [TakaroEvents.CURRENCY_ADDED]: TakaroEventCurrencyAdded,
  [TakaroEvents.COMMAND_EXECUTED]: TakaroEventCommandExecuted,
  [TakaroEvents.ROLE_REMOVED]: TakaroEventRoleRemoved,
  [TakaroEvents.ROLE_CREATED]: TakaroEventRoleCreated,
  [TakaroEvents.ROLE_UPDATED]: TakaroEventRoleUpdated,
  [TakaroEvents.ROLE_DELETED]: TakaroEventRoleDeleted,
  [TakaroEvents.SETTINGS_SET]: TakaroEventSettingsSet,

  // TODO: should type these properly
  [TakaroEvents.HOOK_EXECUTED]: TakaroEventRoleAssigned,
  [TakaroEvents.CRONJOB_EXECUTED]: TakaroEventRoleAssigned,
} as const;
