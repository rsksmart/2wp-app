import * as constants from '@/store/constants';
import { getAccountType } from '@/services/utils';
import { deriveBatchAddresses } from '@/utils';
import { Purpose, WalletAddress } from '@/types';
import { utilsTestData } from '../utils/testData';

describe('Utils', () => {
  describe('getAccountType:', () => {
    it('should get account type on testnet', () => {
      const testCase = [
        {
          address: 'tb1qtanvhhl8ve32tcdxkrsamyy6vq5p62ctdv89l0',
          addressTypeExpected: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
        },
        {
          address: 'tb1qfuk3j0l4qn4uzstc47uwk68kedmjwuucl7avqr',
          addressTypeExpected: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
        },
        {
          address: 'mzMCEHDUAZaKL9BXt9SzasFPUUqM77TqP1',
          addressTypeExpected: constants.BITCOIN_LEGACY_ADDRESS,
        },
        {
          address: 'mqCjBpQ75Y5sSGzFtJtSQQZqhJze9eaKjV',
          addressTypeExpected: constants.BITCOIN_LEGACY_ADDRESS,
        },
        {
          address: '2NC4DCae9HdL6vjWMDbQwTkYEAB22MF3TPs',
          addressTypeExpected: constants.BITCOIN_SEGWIT_ADDRESS,
        },
        {
          address: '2NCZ2CNYiz4rrHq3miUHerUMcLyeWU4gw9C',
          addressTypeExpected: constants.BITCOIN_SEGWIT_ADDRESS,
        },
      ];
      testCase.forEach((test) => {
        expect(getAccountType(test.address, constants.BTC_NETWORK_TESTNET))
          .toEqual(test.addressTypeExpected);
      });
    });
    it('should get account type on mainNet', () => {
      const testCase = [
        {
          address: 'bc1qx057qz7yc83lvzddh0us3mt7tamdyxyvpczwh9',
          addressTypeExpected: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
        },
        {
          address: 'bc1q4mkhp934a6tx5vda7n239uctyad25gtf4p009w',
          addressTypeExpected: constants.BITCOIN_NATIVE_SEGWIT_ADDRESS,
        },
        {
          address: '115p7UMMngoj1pMvkpHijcRdfJNXj6LrLn',
          addressTypeExpected: constants.BITCOIN_LEGACY_ADDRESS,
        },
        {
          address: '17h5923U88esSwtmJa4v1EgVW9vi1dJX1q',
          addressTypeExpected: constants.BITCOIN_LEGACY_ADDRESS,
        },
        {
          address: '3KmBn3f9fBr9QxaxdyLjYN5mkgMrg6wUdn',
          addressTypeExpected: constants.BITCOIN_SEGWIT_ADDRESS,
        },
        {
          address: '3Fpv3EnJ4JB8CmXGV19CVjDczPDcg5J4ri',
          addressTypeExpected: constants.BITCOIN_SEGWIT_ADDRESS,
        },
      ];
      testCase.forEach((test) => {
        expect(getAccountType(test.address, constants.BTC_NETWORK_MAINNET))
          .toEqual(test.addressTypeExpected);
      });
    });
  });
  describe('Xpub derivation', () => {
    it('should derive bech32 address from xpub', () => {
      const walletAddresses: WalletAddress[] = deriveBatchAddresses(
        'tpubDDsmvc8wDVeE9nzhg256fMSNjeT5GKtkTCRtFMypH9kHt4hvJobTB7YuLC1SM6JZSzbfmpgwXF5oXGNX2qS8MVd2dhCy2tfrMb85T8wpY9b',
        Purpose.P2WPKH,
        0,
        10,
      );
      walletAddresses.forEach((walletAddress, idx) => {
        const testData = utilsTestData.bech32[idx];
        expect(walletAddress.publicKey).toEqual(testData.publicKey);
        expect(walletAddress.address).toEqual(testData.address);
        expect(walletAddress.derivationPath).toEqual(testData.derivationPath);
      });
    });
    it('should derive P2SH address from xpub', () => {
      const walletAddresses: WalletAddress[] = deriveBatchAddresses(
        'tpubDCpdqtWZuFMLHi3k82eMsxCQj3V2PPRfMDEs9yVrenVqfNpmeb69tDqcXRyc6krZJWLqnTePuK3BRCrjQ7nwQrZ2LtPxDLdBLrvRgjVfaTF',
        Purpose.P2SH,
        0,
        10,
      );
      walletAddresses.forEach((walletAddress, idx) => {
        const testData = utilsTestData.p2sh[idx];
        expect(walletAddress.publicKey).toEqual(testData.publicKey);
        expect(walletAddress.address).toEqual(testData.address);
        expect(walletAddress.derivationPath).toEqual(testData.derivationPath);
      });
    });
    it('should derive P2PKH address from xpub', () => {
      const walletAddresses: WalletAddress[] = deriveBatchAddresses(
        'tpubDCNCQfGTtVzaoQtb7GnYSBKbpE8KeZFB3RuaNM5W51gKjy541iuuZFNf7mUjDiByj3cvMxUxySs1hHeL1kXvNPRDqCHFNW8cpNaqGwpWpUU',
        Purpose.P2PKH,
        0,
        10,
      );
      walletAddresses.forEach((walletAddress, idx) => {
        const testData = utilsTestData.p2pkh[idx];
        expect(walletAddress.publicKey).toEqual(testData.publicKey);
        expect(walletAddress.address).toEqual(testData.address);
        expect(walletAddress.derivationPath).toEqual(testData.derivationPath);
      });
    });
  });
});
