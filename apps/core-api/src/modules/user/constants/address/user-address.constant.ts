export const USER_ADDRESS = {
  TABLE: 'user_addresses',
  SOURCES: ['MANUAL', 'MAP', 'CURRENT_LOCATION'],
  COUNTRY_PATTERN: /^[A-Z]{2}$/,
  LINE_MAX: 200,
  CITY_MAX: 120,
  POSTAL_MAX: 20,
  LATITUDE_MAX: 90,
  LONGITUDE_MAX: 180,
  SELECT_SQL: `
    SELECT line1, line2, city, region, postal_code AS "postalCode", country_code AS "countryCode",
           latitude::float8 AS latitude, longitude::float8 AS longitude, source, updated_at AS "updatedAt"
      FROM user_addresses
     WHERE user_id = $1
  `,
  UPSERT_SQL: `
    INSERT INTO user_addresses (user_id, line1, line2, city, region, postal_code, country_code, latitude, longitude, source)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (user_id) DO UPDATE
       SET line1 = EXCLUDED.line1, line2 = EXCLUDED.line2, city = EXCLUDED.city, region = EXCLUDED.region,
           postal_code = EXCLUDED.postal_code, country_code = EXCLUDED.country_code, latitude = EXCLUDED.latitude,
           longitude = EXCLUDED.longitude, source = EXCLUDED.source, updated_at = now()
    RETURNING line1, line2, city, region, postal_code AS "postalCode", country_code AS "countryCode",
              latitude::float8 AS latitude, longitude::float8 AS longitude, source, updated_at AS "updatedAt"
  `,
  DELETE_SQL: 'DELETE FROM user_addresses WHERE user_id = $1'
} as const;
