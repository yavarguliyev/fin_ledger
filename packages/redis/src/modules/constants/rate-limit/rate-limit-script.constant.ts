export const RATE_LIMIT_SCRIPT = `
local hits = redis.call('INCR', KEYS[1])
if hits == 1 then redis.call('PEXPIRE', KEYS[1], ARGV[1]) end
if hits > tonumber(ARGV[2]) and redis.call('EXISTS', KEYS[2]) == 0 then redis.call('SET', KEYS[2], 1, 'PX', ARGV[3]) end
return { hits, redis.call('PTTL', KEYS[1]), redis.call('PTTL', KEYS[2]) }
`;
