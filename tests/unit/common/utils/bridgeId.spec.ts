import { EnvironmentAccessorService } from '@/common/services/enviroment-accessor.service';
import * as constants from '@/common/store/constants';
import { TxStatusType } from '@/common/types';
import {
  BridgeIdSource,
  BridgeNetwork,
  bridgeIdToTxStatusType,
  createBridgeId,
  extractTxHash,
  isValidBridgeId,
  parseBridgeId,
} from '@/common/utils/bridgeId';

const BTC_TX_HASH = 'a'.repeat(64);
const RSK_TX_HASH = `0x${'b'.repeat(64)}`;
const QUOTE_HASH = 'c'.repeat(64);

function setMainnet() {
  EnvironmentAccessorService.initializeEnvironmentVariables({
    vueAppCoin: constants.BTC_NETWORK_MAINNET,
  });
}

function setTestnet() {
  EnvironmentAccessorService.initializeEnvironmentVariables({
    vueAppCoin: constants.BTC_NETWORK_TESTNET,
  });
}

describe('bridgeId', () => {
  describe('createBridgeId', () => {
    it('creates a powpeg pegin id on mainnet', () => {
      setMainnet();
      const id = createBridgeId({
        source: BridgeIdSource.PEGIN,
        providerId: 'powpeg',
        txHash: BTC_TX_HASH,
        network: BridgeNetwork.BTC,
      });
      expect(id).toBe(`pegin-powpeg-${BTC_TX_HASH}-btc`);
    });

    it('adds t prefix on testnet', () => {
      setTestnet();
      const id = createBridgeId({
        source: BridgeIdSource.PEGIN,
        providerId: 'powpeg',
        txHash: BTC_TX_HASH,
        network: BridgeNetwork.BTC,
      });
      expect(id.startsWith('t')).toBe(true);
      expect(id).toBe(`tpegin-powpeg-${BTC_TX_HASH}-btc`);
    });

    it('creates a powpeg pegout id', () => {
      setMainnet();
      const id = createBridgeId({
        source: BridgeIdSource.PEGOUT,
        providerId: 'powpeg',
        txHash: RSK_TX_HASH,
        network: BridgeNetwork.RSK,
      });
      expect(id).toBe(`pegout-powpeg-${RSK_TX_HASH}-rsk`);
    });

    it('creates a flyover pegin id with providerHash', () => {
      setMainnet();
      const id = createBridgeId({
        source: BridgeIdSource.FLYOVER,
        providerId: '1',
        txHash: BTC_TX_HASH,
        network: BridgeNetwork.BTC,
        providerHash: QUOTE_HASH,
      });
      expect(id).toBe(`flyover-1-${BTC_TX_HASH}-btc-${QUOTE_HASH}`);
    });

    it('creates a flyover pegout id with providerHash', () => {
      setMainnet();
      const id = createBridgeId({
        source: BridgeIdSource.FLYOVER,
        providerId: '1',
        txHash: RSK_TX_HASH,
        network: BridgeNetwork.RSK,
        providerHash: QUOTE_HASH,
      });
      expect(id).toBe(`flyover-1-${RSK_TX_HASH}-rsk-${QUOTE_HASH}`);
    });
  });

  describe('parseBridgeId', () => {
    it('parses a powpeg pegin id', () => {
      const id = `pegin-powpeg-${BTC_TX_HASH}-btc`;
      const parsed = parseBridgeId(id);
      expect(parsed.source).toBe(BridgeIdSource.PEGIN);
      expect(parsed.providerId).toBe('powpeg');
      expect(parsed.txHash).toBe(BTC_TX_HASH);
      expect(parsed.network).toBe(BridgeNetwork.BTC);
      expect(parsed.providerHash).toBeUndefined();
    });

    it('strips testnet prefix when parsing', () => {
      const id = `tpegin-powpeg-${BTC_TX_HASH}-btc`;
      const parsed = parseBridgeId(id);
      expect(parsed.source).toBe(BridgeIdSource.PEGIN);
    });

    it('parses a flyover id and includes providerHash', () => {
      const id = `flyover-1-${BTC_TX_HASH}-btc-${QUOTE_HASH}`;
      const parsed = parseBridgeId(id);
      expect(parsed.source).toBe(BridgeIdSource.FLYOVER);
      expect(parsed.providerHash).toBe(QUOTE_HASH);
    });

    it('throws on invalid format', () => {
      expect(() => parseBridgeId('not-valid')).toThrow();
    });
  });

  describe('isValidBridgeId', () => {
    it('accepts a valid powpeg pegin id', () => {
      setMainnet();
      const id = createBridgeId({
        source: BridgeIdSource.PEGIN,
        providerId: 'powpeg',
        txHash: BTC_TX_HASH,
        network: BridgeNetwork.BTC,
      });
      expect(isValidBridgeId(id)).toBe(true);
    });

    it('accepts a valid flyover pegin id', () => {
      setMainnet();
      const id = createBridgeId({
        source: BridgeIdSource.FLYOVER,
        providerId: '1',
        txHash: BTC_TX_HASH,
        network: BridgeNetwork.BTC,
        providerHash: QUOTE_HASH,
      });
      expect(isValidBridgeId(id)).toBe(true);
    });

    it('rejects a raw BTC tx hash', () => {
      expect(isValidBridgeId(BTC_TX_HASH)).toBe(false);
    });

    it('rejects a raw RSK tx hash', () => {
      expect(isValidBridgeId(RSK_TX_HASH)).toBe(false);
    });

    it('rejects flyover id without providerHash', () => {
      const id = `flyover-1-${BTC_TX_HASH}-btc`;
      expect(isValidBridgeId(id)).toBe(false);
    });

    it('rejects flyover id with malformed providerHash (wrong length)', () => {
      const id = `flyover-1-${BTC_TX_HASH}-btc-tooshort`;
      expect(isValidBridgeId(id)).toBe(false);
    });

    it('rejects pegin id with unexpected providerHash segment', () => {
      const id = `pegin-powpeg-${BTC_TX_HASH}-btc-${QUOTE_HASH}`;
      expect(isValidBridgeId(id)).toBe(false);
    });

    it('rejects pegout id with unexpected providerHash segment', () => {
      const id = `pegout-powpeg-${RSK_TX_HASH}-rsk-${QUOTE_HASH}`;
      expect(isValidBridgeId(id)).toBe(false);
    });

    it('rejects pegin id with a trailing separator (empty providerHash segment)', () => {
      const id = `pegin-powpeg-${BTC_TX_HASH}-btc-`;
      expect(isValidBridgeId(id)).toBe(false);
    });

    it('rejects a flyover id built from a not-found provider (-1)', () => {
      const id = `flyover--1-${RSK_TX_HASH}-rsk-${QUOTE_HASH}`;
      expect(isValidBridgeId(id)).toBe(false);
    });

    it('rejects an id with an empty txHash', () => {
      const id = `flyover-1--rsk-${QUOTE_HASH}`;
      expect(isValidBridgeId(id)).toBe(false);
    });

    it('rejects flyover id with non-integer providerId (e.g. scientific notation)', () => {
      const id = `flyover-1e3-${BTC_TX_HASH}-btc-${QUOTE_HASH}`;
      expect(isValidBridgeId(id)).toBe(false);
    });

    it('rejects an unknown source', () => {
      const id = `unknown-powpeg-${BTC_TX_HASH}-btc`;
      expect(isValidBridgeId(id)).toBe(false);
    });
  });

  describe('bridgeIdToTxStatusType', () => {
    it('maps pegin source to PEGIN', () => {
      const id = `pegin-powpeg-${BTC_TX_HASH}-btc`;
      expect(bridgeIdToTxStatusType(id)).toBe(TxStatusType.PEGIN);
    });

    it('maps pegout source to PEGOUT', () => {
      const id = `pegout-powpeg-${RSK_TX_HASH}-rsk`;
      expect(bridgeIdToTxStatusType(id)).toBe(TxStatusType.PEGOUT);
    });

    it('maps flyover+btc to FLYOVER_PEGIN', () => {
      const id = `flyover-1-${BTC_TX_HASH}-btc-${QUOTE_HASH}`;
      expect(bridgeIdToTxStatusType(id)).toBe(TxStatusType.FLYOVER_PEGIN);
    });

    it('maps flyover+rsk to FLYOVER_PEGOUT', () => {
      const id = `flyover-1-${RSK_TX_HASH}-rsk-${QUOTE_HASH}`;
      expect(bridgeIdToTxStatusType(id)).toBe(TxStatusType.FLYOVER_PEGOUT);
    });
  });

  describe('extractTxHash', () => {
    it('extracts txHash from a bridgeId', () => {
      const id = `pegin-powpeg-${BTC_TX_HASH}-btc`;
      expect(extractTxHash(id)).toBe(BTC_TX_HASH);
    });

    it('returns the value unchanged if it is a raw tx hash', () => {
      expect(extractTxHash(BTC_TX_HASH)).toBe(BTC_TX_HASH);
    });
  });
});
