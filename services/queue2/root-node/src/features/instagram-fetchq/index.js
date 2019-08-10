
import * as hooks from './hooks'

export { default as workers } from './workers'

export default ({ registerHook, registerAction }) => {
    registerHook(hooks)

    registerAction({
        hook: '$FETCHQ_INIT',
        name: hooks.FEATURE_NAME,
        trace: __filename,
        handler: async ({ registerWorker, registerQueue }, ctx) => {
            registerQueue([
                'directory',
                'city',
                'country',
                'location',
                'post',
                'first_blood',
                'post_tracker',
                'profile_tracker',
                'lost_profile',
            ])
        }
    })
}