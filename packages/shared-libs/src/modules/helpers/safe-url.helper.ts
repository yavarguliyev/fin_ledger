import { BadRequestException } from '@nestjs/common';
import { lookup, LookupAddress } from 'node:dns';
import { BlockList, isIP, LookupFunction } from 'node:net';

import { SAFE_URL } from '../constants/http/safe-url.constant';
import { AddressDto } from '../dtos/http/address.dto';
import { HttpUrlDto } from '../dtos/http/http-url.dto';

const blocked = new BlockList();
SAFE_URL.BLOCKED_IPV4.forEach(([network, prefix]) => blocked.addSubnet(network, prefix, SAFE_URL.IPV4));
SAFE_URL.BLOCKED_IPV6.forEach(([network, prefix]) => blocked.addSubnet(network, prefix, SAFE_URL.IPV6));

export class SafeUrlHelper {
  static isPublicAddress ({ address }: AddressDto): boolean {
    const mapped = address.toLowerCase().startsWith(SAFE_URL.MAPPED_IPV4_PREFIX) ? address.slice(SAFE_URL.MAPPED_IPV4_PREFIX.length) : address;
    const family = isIP(mapped);
    if (family === 0) return false;
    return !blocked.check(mapped, family === 4 ? SAFE_URL.IPV4 : SAFE_URL.IPV6);
  }

  static assertHttpUrl ({ url }: HttpUrlDto): URL {
    const parsed = new URL(url);
    if (!(SAFE_URL.PROTOCOLS as readonly string[]).includes(parsed.protocol)) throw new BadRequestException(SAFE_URL.NOT_HTTP);
    if (parsed.username || parsed.password) throw new BadRequestException(SAFE_URL.HAS_CREDENTIALS);
    const host = parsed.hostname.replace(SAFE_URL.IPV6_BRACKETS, '');
    if (isIP(host) !== 0 && !SafeUrlHelper.isPublicAddress({ address: host })) throw new BadRequestException(SAFE_URL.BLOCKED_ADDRESS);
    return parsed;
  }

  static readonly guardedLookup: LookupFunction = (hostname, options, callback) => {
    lookup(hostname, { ...options, all: true }, (error, addresses: LookupAddress[]) => {
      if (error) return callback(error, []);
      if (addresses.length === 0 || !addresses.every(({ address }) => SafeUrlHelper.isPublicAddress({ address }))) {
        return callback(Object.assign(new Error(SAFE_URL.BLOCKED_ADDRESS), { code: SAFE_URL.BLOCKED_CODE }), []);
      }
      return options.all ? callback(null, addresses) : callback(null, addresses[0]?.address ?? '', addresses[0]?.family);
    });
  };
}
