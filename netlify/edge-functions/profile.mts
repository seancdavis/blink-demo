import { getStore } from '@netlify/blobs'
import type { Context } from '@netlify/edge-functions'
import { format } from 'https://deno.land/std@0.203.0/datetime/mod.ts'
import { edgeFunctionUtils } from '../../src/utils/index.mts'
import { renderPartial } from '../../src/utils/render-partial.mts'
import { Post, User } from '../../src/utils/types.mts'

// type ProfileHandlerOptions = {
//   posts: PostWithUser[]
// }

// export class ProfileHandler {
//   posts: PostWithUser[]

//   constructor(options: ProfileHandlerOptions) {
//     this.posts = options.posts
//   }

//   element(element: Element) {

//     element.replace(partialContent, { html: true })
//   }
// }

export default async function handler(request: Request, context: Context) {
  const { url } = await edgeFunctionUtils({ request, context })
  const username = url.pathname
    .split('/')
    .find((part) => part.startsWith('@'))
    ?.slice(1)

  const userStore = getStore({ name: 'User', consistency: 'strong' })
  const allUsersIds = (await userStore.list()).blobs.map(({ key }) => key)
  const users = await Promise.all(
    allUsersIds.map(async (id) => await userStore.get(id, { type: 'json' })),
  )
  const user = users.find((user: User) => user.username === username)

  if (!user) {
    return context.next()
  }

  const postStore = getStore({ name: 'Post', consistency: 'strong' })
  const allPostIds = (await postStore.list()).blobs.map(({ key }) => key)
  const userPosts: Post[] = (
    await Promise.all(allPostIds.map(async (id) => await postStore.get(id, { type: 'json' })))
  )
    .filter((post) => post.userId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  let posts = userPosts
    .map((post) => {
      const date = format(new Date(post.createdAt), 'yyyy-MM-dd')
      return renderPartial({ name: 'post-card', data: { ...post, ...user, date } })
    })
    .join('')

  if (posts.length === 0) {
    posts = renderPartial({ name: 'profile-no-posts', data: { ...user } })
  }

  const data = { ...user, posts }
  const html = renderPartial({ name: 'profile', data })

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
    },
  })
}
