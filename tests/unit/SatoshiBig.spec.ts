import { expect } from 'chai';
import Big from 'big.js';
import SatoshiBig from '@/types/SatoshiBig';

describe('SatoshiBig', () => {
  it('should be a valid instance passing string, integer and big values', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1).to.be.instanceOf(Big);
    expect(sb1.toString()).to.be.eql('500000');
    const sb2:SatoshiBig = new SatoshiBig('500000', 'btc');
    expect(sb2).to.be.instanceOf(Big);
    expect(sb2.toString()).to.be.eql('50000000000000');
    const sb3:SatoshiBig = new SatoshiBig(new Big('1000000'), 'mbtc');
    expect(sb3).to.be.instanceOf(Big);
    expect(sb3.toString()).to.be.eql('100000000000');
  });
  it('should perform valid sum operations with the same instance class', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb2:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1.plus(sb2)).to.be.instanceOf(SatoshiBig);
    expect(sb1.plus(sb2).toString()).to.be.eql('1000000');
    const sb3:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb4:SatoshiBig = new SatoshiBig(0.005, 'btc');
    expect(sb3.plus(sb4)).to.be.instanceOf(SatoshiBig);
    expect(sb3.plus(sb4).toString()).to.be.eql('1000000');
  });
  it('should perform valid multiply operations with the same instance class', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb2:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1.mul(sb2)).to.be.instanceOf(SatoshiBig);
    expect(sb1.mul(sb2).toString()).to.be.eql('250000000000');
    const sb3:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb4 = 0.005;
    expect(sb3.mul(sb4)).to.be.instanceOf(SatoshiBig);
    expect(sb3.mul(sb4).toString()).to.be.eql('2500');
  });
  it('should perform valid division operations with the same instance class', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb2:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1.div(sb2)).to.be.instanceOf(SatoshiBig);
    expect(sb1.div(sb2).toString()).to.be.eql('1');
    const sb3:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    const sb4 = 0.005;
    expect(sb3.div(sb4)).to.be.instanceOf(SatoshiBig);
    expect(sb3.div(sb4).toString()).to.be.eql('100000000');
  });
  it('should return the string value of the required multiple', () => {
    const sb1:SatoshiBig = new SatoshiBig(500000, 'satoshi');
    expect(sb1.toBTCString()).to.be.eql('0.00500000');
    const sb2:SatoshiBig = new SatoshiBig('500000', 'btc');
    expect(sb2.toSatoshiString()).to.be.eql('50000000000000');
    const sb3:SatoshiBig = new SatoshiBig(new Big('1000000'), 'mbtc');
    expect(sb3.tomBTCString()).to.be.eql('1000000.00000');
  });
});
