import { errors, logger } from '@takaro/util';
import { Redis } from '@takaro/db';

import { getSocketServer } from '../socket/index.js';
import { IPlayerReferenceDTO, IGameServer, IMessageOptsDTO, CommandOutput, BanDTO, IItemDTO } from '@takaro/gameserver';
import {
  EventLogLine,
  GameEvents,
  IGamePlayer,
  EventChatMessage,
  EventPlayerConnected,
  EventPlayerDisconnected,
  IPosition,
  HookEvents,
  ChatChannel,
} from '@takaro/modules';
import { faker } from '@faker-js/faker';
import { config } from '../../config.js';
import { playScenario } from './scenario.js';

export type IMockGameServer = Omit<IGameServer, 'getEventEmitter' | 'connectionInfo' | 'testReachability' | 'destroy'>;

const REDIS_PREFIX = `mock-game:${config.get('mockserver.name')}:`;

class MockGameserver implements IMockGameServer {
  private log = logger('Mock');
  private socketServer = getSocketServer();
  private redis = Redis.getClient('mockgameserver');

  constructor(private name: string) {}

  private getRedisKey(key: string) {
    return `${REDIS_PREFIX}${this.name}:${key}`;
  }

  async ensurePlayersPersisted() {
    const existingPlayers = await (await this.redis).keys(this.getRedisKey('player:*'));

    if (existingPlayers.length > 0) {
      return;
    }

    const players = Array.from(Array(5).keys()).map((p) => ({
      gameId: p.toString(),
      name: faker.internet.userName(),
      epicOnlineServicesId: faker.random.alphaNumeric(16),
      steamId: faker.random.alphaNumeric(16),
      xboxLiveId: faker.random.alphaNumeric(16),
      positionX: 500 - parseInt(faker.random.numeric(3), 10),
      positionY: 500 - parseInt(faker.random.numeric(3), 10),
      positionZ: 500 - parseInt(faker.random.numeric(3), 10),
    }));

    await Promise.all(
      players.map(async (p) => {
        return (await this.redis).hSet(this.getRedisKey(`player:${p.gameId}`), p);
      })
    );
  }

  async giveItem(player: IPlayerReferenceDTO, item: string, amount: number): Promise<void> {
    this.sendLog(`Giving ${player.gameId} ${amount}x${item}`);
  }

  async getPlayer(playerRef: IPlayerReferenceDTO): Promise<IGamePlayer | null> {
    const player = await (await this.redis).hGetAll(this.getRedisKey(`player:${playerRef.gameId}`));

    if (!player) {
      return null;
    }

    return new IGamePlayer({
      gameId: player.gameId.toString(),
      name: player.name,
      ip: player.ip,
      steamId: player.steamId,
      ping: parseInt(faker.random.numeric(2), 10),
    });
  }

  async getPlayers(): Promise<IGamePlayer[]> {
    const players = await (await this.redis).keys(this.getRedisKey('player:*'));
    const playerData = await Promise.all(
      players.map(async (p) => {
        return (await this.redis).hGetAll(p);
      })
    );

    return await Promise.all(
      playerData.map(
        (player) =>
          new IGamePlayer({
            gameId: player.gameId.toString(),
            name: player.name,
            ip: player.ip,
            steamId: player.steamId,
            ping: parseInt(faker.random.numeric(2), 10),
          })
      )
    );
  }

  async getPlayerLocation(playerRef: IPlayerReferenceDTO): Promise<IPosition | null> {
    const player = await (await this.redis).hGetAll(this.getRedisKey(`player:${playerRef.gameId}`));
    if (!player) {
      return null;
    }

    return {
      x: parseInt(player.positionX, 10),
      y: parseInt(player.positionY, 10),
      z: parseInt(player.positionZ, 10),
    };
  }

  async executeConsoleCommand(rawCommand: string) {
    const output = new CommandOutput({
      rawResult: 'Unknown command (Command not implemented yet in mock game server 👼)',
      success: false,
    });

    if (rawCommand === 'version') {
      output.rawResult = 'Mock game server v0.0.1';
      output.success = true;
    }

    if (rawCommand === 'connectAll') {
      const players = await this.getPlayers();
      await Promise.all(
        players.map(async (p) => {
          const event = new EventPlayerConnected({
            player: p,
            msg: `${p.name} connected`,
          });
          this.socketServer.io.emit(HookEvents.PLAYER_CONNECTED, { name: this.name, ...event });
        })
      );
      output.rawResult = 'Connected all players';
      output.success = true;
    }

    if (rawCommand === 'scenario') {
      playScenario(this.socketServer.io).catch((err) => {
        this.log.error(err);
      });

      output.rawResult = 'Started scenario';
      output.success = true;
    }

    if (rawCommand.startsWith('say')) {
      const message = rawCommand.replace('say ', '');
      await this.sendMessage(message, new IMessageOptsDTO({}));
      output.rawResult = `Sent message: ${message}`;
      output.success = true;
    }

    await this.sendLog(`${output.success ? '🟢' : '🔴'} Command executed: ${rawCommand}`);

    return output;
  }

  async sendMessage(message: string, opts: IMessageOptsDTO) {
    const options = { ...opts };
    const fullMessage = `[🗨️ Chat] Server: ${options.recipient ? '[DM]' : ''} ${message}`;

    this.socketServer.io.emit(GameEvents.CHAT_MESSAGE, {
      name: this.name,
      ...new EventChatMessage({
        msg: message,
        channel: ChatChannel.GLOBAL,
      }),
    });
    await this.sendLog(fullMessage);
  }

  async teleportPlayer(playerRef: IPlayerReferenceDTO, x: number, y: number, z: number) {
    const player = await (await this.redis).hGetAll(this.getRedisKey(`player:${playerRef.gameId}`));

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    player.positionX = x.toString();
    player.positionY = y.toString();
    player.positionZ = z.toString();

    await (await this.redis).hSet(this.getRedisKey(`player:${playerRef.gameId}`), player);

    await this.sendLog(`Teleported ${player.name} to ${x}, ${y}, ${z}`);
  }

  async kickPlayer(playerRef: IPlayerReferenceDTO, reason: string): Promise<void> {
    const player = await this.getPlayer(playerRef);

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    this.socketServer.io.emit(GameEvents.PLAYER_DISCONNECTED, {
      name: this.name,
      ...new EventPlayerDisconnected({
        player,
        msg: `${player.name} disconnected: Kicked ${reason}`,
      }),
    });
  }

  async banPlayer(options: BanDTO): Promise<void> {
    const player = await this.getPlayer(options.player);

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    const banDto = new BanDTO({
      player: options.player,
      reason: options.reason,
      expiresAt: options.expiresAt,
    });

    this.socketServer.io.emit(GameEvents.PLAYER_DISCONNECTED, {
      name: this.name,
      ...new EventPlayerDisconnected({
        player,
        msg: `${player.name} disconnected: Banned ${options.reason} until ${options.expiresAt}`,
      }),
    });

    if (options.expiresAt) {
      const expireTimestamp = new Date(options.expiresAt).valueOf();

      (await this.redis).set(this.getRedisKey(`ban:${options.player.gameId}`), JSON.stringify(banDto), {
        EXAT: expireTimestamp,
      });
    } else {
      (await this.redis).set(this.getRedisKey(`ban:${options.player.gameId}`), JSON.stringify(banDto));
    }
  }

  async unbanPlayer(playerRef: IPlayerReferenceDTO): Promise<void> {
    const player = await this.getPlayer(playerRef);

    if (!player) {
      throw new errors.NotFoundError('Player not found');
    }

    await this.sendLog(`Unbanned ${player.name}`);

    (await this.redis).del(this.getRedisKey(`ban:${playerRef.gameId}`));
  }

  async listBans(): Promise<BanDTO[]> {
    const keys = await (await this.redis).keys(this.getRedisKey('ban:*'));
    const banData = await (await this.redis).mGet(keys);

    const banDataWithPlayer = await Promise.all(
      banData.map(async (ban) => {
        if (!ban) return null;
        const banDto = JSON.parse(ban) as BanDTO;
        const player = await this.getPlayer(banDto.player);
        if (!player) return null;
        return new BanDTO({
          ...banDto,
          player,
        });
      })
    );

    return banDataWithPlayer.filter(Boolean) as BanDTO[];
  }

  async listItems(): Promise<IItemDTO[]> {
    return [
      new IItemDTO({
        code: 'wood',
        name: 'Wood',
        description: 'Wood is good',
      }),
      new IItemDTO({
        code: 'stone',
        name: 'Stone',
        description: 'Stone can get you stoned',
      }),
    ];
  }

  private async sendLog(msg: string) {
    const logLine = new EventLogLine({
      msg,
    });
    this.socketServer.io.emit(GameEvents.LOG_LINE, { name: this.name, ...logLine });
  }

  async getPlayerInventory(/* playerRef: IPlayerReferenceDTO */): Promise<IItemDTO[]> {
    return [
      new IItemDTO({
        code: 'wood',
        amount: parseInt(faker.random.numeric(2), 10),
      }),
      new IItemDTO({
        code: 'stone',
        amount: parseInt(faker.random.numeric(2), 10),
      }),
    ];
  }
}

const cachedMockServer: Map<string, MockGameserver> = new Map();

export async function getMockServer(name: string = 'mock') {
  if (!cachedMockServer.has(name)) {
    cachedMockServer.set(name, new MockGameserver(name));
  }

  return cachedMockServer.get(name) as MockGameserver;
}
