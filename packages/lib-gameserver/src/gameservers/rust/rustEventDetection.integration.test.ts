import { expect, sandbox } from '@takaro/test';
import { SinonStub } from 'sinon';
import { RustEmitter, RustEvent, RustEventType } from './emitter';
import { GameEvents, IGamePlayer } from '../../main';

const MOCK_RUST_PLAYER_CONNECTED: RustEvent = {
  message:
    '169.169.169.80:65384/76561198021481871/brunkel joined [windows/76561198021481871]',
  identifier: 0,
  type: RustEventType.DEFAULT,
  stacktrace: '',
};

const MOCK_PLAYER = new IGamePlayer({
  ip: '169.169.169.80',
  name: 'brunkel',
  gameId: '76561198021481871',
  steamId: '76561198021481871',
  device: 'windows',
});

describe('rust event detection', () => {
  let emitStub: SinonStub;

  beforeEach(() => {
    sandbox.restore();
    emitStub = sandbox.stub(RustEmitter.prototype, 'emitGameEvent');
  });

  it('[PlayerConnected]: Can detect simple player connected', () => {
    new RustEmitter().parseMessage(MOCK_RUST_PLAYER_CONNECTED);
    console.log('ok');

    expect(emitStub).to.have.been.calledOnce;

    console.log(emitStub.getCalls()[0].args[0]);

    expect(emitStub.getCalls()[0].args[0]).to.equal(
      GameEvents.PLAYER_CONNECTED
    );

    expect(emitStub.getCalls()[0].args[1].player).to.deep.equal(MOCK_PLAYER);
  });

  it('[PlayerDisconnected]: Can detect simple player disconnected', () => {
    new RustEmitter().parseMessage(MOCK_RUST_PLAYER_CONNECTED);
  });
});
