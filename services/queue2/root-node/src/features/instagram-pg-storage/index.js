
import * as hooks from './hooks'
import * as storage from './storage-pg.lib'
import * as payloadStr from './payload-structure.lib'

export default ({ registerHook, registerAction }) => {
    registerHook(hooks)

    registerAction({
        hook: '$STORAGE_CITY',
        name: hooks.FEATURE_NAME,
        trace: __filename,
        handler: async ({ cityId, payload }) => {
            const storageData = payloadStr.setCityPayload(payload)
            await storage.putCity(cityId, storageData)
        },
    })

    registerAction({
        hook: '$STORAGE_COUNTRY',
        name: hooks.FEATURE_NAME,
        trace: __filename,
        handler: async ({ countryId, payload }) => {
            const storageData = payloadStr.setCountryPayload(payload)
            await storage.putCountry(countryId, storageData)
        },
    })

    registerAction({
        hook: '$STORAGE_LOCATION',
        name: hooks.FEATURE_NAME,
        trace: __filename,
        handler: async ({ locationId, payload }) => {
            const storageData = payloadStr.setLocationPayload(payload)
            await storage.putLocation(locationId, storageData)
        },
    })

    registerAction({
        hook: '$STORAGE_POST',
        name: hooks.FEATURE_NAME,
        trace: __filename,
        handler: async ({ postId, profileId, payload }) => {
            const storageData = payloadStr.setPostPayload(payload)
            await storage.putPost(profileId, postId, storageData)
        },
    })

    registerAction({
        hook: '$STORAGE_PROFILE',
        name: hooks.FEATURE_NAME,
        trace: __filename,
        handler: async ({ profileId, payload }) => {
            const storageData = payloadStr.setProfilePayload(payload)
            await storage.putProfile(profileId, storageData)
        },
    })
}