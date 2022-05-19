import Big from 'big.js';
import SatoshiBig from '@/types/SatoshiBig';

describe('SatoshiBig', () => {
  it('should be a valid instance passing string, integer and big values', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1).toBeInstanceOf(Big);
    expect(sb1.toString()).toEqual('500000');
    const sb2:SatoshiBig = new SatoshiBig('500000', 'btc');
    expect(sb2).toBeInstanceOf(Big);
    expect(sb2.toString()).toEqual('50000000000000');
    const sb3:SatoshiBig = new SatoshiBig(new Big('1000000'), 'mbtc');
    expect(sb3).toBeInstanceOf(Big);
    expect(sb3.toString()).toEqual('100000000000');
  });
  it('should perform valid sum operations with the same instance class', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb2:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1.plus(sb2)).toBeInstanceOf(SatoshiBig);
    expect(sb1.plus(sb2).toString()).toEqual('1000000');
    const sb3:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb4:SatoshiBig = new SatoshiBig(0.005, 'btc');
    expect(sb3.plus(sb4)).toBeInstanceOf(SatoshiBig);
    expect(sb3.plus(sb4).toString()).toEqual('1000000');
  });
  it('should perform valid multiply operations with the same instance class', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb2:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1.mul(sb2)).toBeInstanceOf(SatoshiBig);
    expect(sb1.mul(sb2).toString()).toEqual('250000000000');
    const sb3:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb4 = 0.005;
    expect(sb3.mul(sb4)).toBeInstanceOf(SatoshiBig);
    expect(sb3.mul(sb4).toString()).toEqual('2500');
  });
  it('should perform valid division operations with the same instance class', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb2:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1.div(sb2)).toBeInstanceOf(SatoshiBig);
    expect(sb1.div(sb2).toString()).toEqual('1');
    const sb3:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb4 = 0.005;
    expect(sb3.div(sb4)).toBeInstanceOf(SatoshiBig);
    expect(sb3.div(sb4).toString()).toEqual('100000000');
  });
  it('should return the string value of the required multiple', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1.toBTCString()).toEqual('0.00500000');
    const sb2:SatoshiBig = new SatoshiBig('500000', 'btc');
    expect(sb2.toSatoshiString()).toEqual('50000000000000');
    const sb3:SatoshiBig = new SatoshiBig(new Big('1000000'), 'mbtc');
    expect(sb3.tomBTCString()).toEqual('1000000.00000');
  });

  it('string representation with no right padding 0', () => {
    const sb1: SatoshiBig = new SatoshiBig(0, 'satoshi');
    expect(sb1.toBTCString()).toEqual('0.00000000');
    expect(sb1.toBTCStringNotZeroPadded()).toEqual('0');
  });
});
