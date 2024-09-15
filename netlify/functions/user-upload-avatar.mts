import { getStore } from '@netlify/blobs'
import type { Context } from '@netlify/edge-functions'
import { functionUtils } from '../../src/utils/index.mts'

export default async (request: Request, context: Context) => {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const { redirect, setFeedback, user: userBlob } = await functionUtils({ request, context })

  // The auth edge function handles the redirect if the user is not found, so we
  // can assume that the user is found here
  const user = userBlob!

  const formData = await request.formData()
  const image = formData.get('avatar') as File

  // Store the avatar image in the UserAvatar store
  const userAvatarStore = getStore({ name: 'UserAvatar', consistency: 'strong' })
  await userAvatarStore.set(user.username.toString(), image)

  // Update the user blob with the new avatar URL
  const userStore = getStore({ name: 'User', consistency: 'strong' })
  user.hasAvatar = true
  await userStore.setJSON(user.id, user)

  setFeedback('avatar_uploaded')
  return redirect('/settings')
}
