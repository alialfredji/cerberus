
module.exports = {
    indexElsProfile: `
        mutation indexElsProfile (
            $token: String!
            $id: ID!
            $body: JSON
        ) {
            session (token: $token) {
                elsProfile {
                    index (id: $id, body: $body)
                }
            }
        }
    `,
    setCachedProfile: `
        mutation setCachedProfile (
            $token: String!
            $id: ID!
            $body: memcachedProfile_setProfileBodyInput!
        ) {
            session (token: $token) {
                memcachedProfile {
                    set (id: $id, body: $body)
                }
            }
        }
    `,
}