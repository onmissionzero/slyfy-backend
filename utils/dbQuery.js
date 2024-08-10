const insertAccessTokenQuery = `
      INSERT INTO access_tokens (user_id, access_token, token_type, scope, refresh_token, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (user_id) DO UPDATE
      SET access_token = $2, token_type = $3, scope = $4, refresh_token = $5, created_at = $6, expires_at = $7
      RETURNING *;
    `;
    
const retrieveRefreshTokenQuery = 'SELECT refresh_token FROM access_tokens WHERE user_id = $1';

const retrieveAccessTokenQuery = 'SELECT access_token, created_at, expires_at FROM access_tokens WHERE user_id = $1';

module.exports = {
    insertAccessTokenQuery,
    retrieveRefreshTokenQuery,
    retrieveAccessTokenQuery
}