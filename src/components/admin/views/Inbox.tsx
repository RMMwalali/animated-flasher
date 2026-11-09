import type { AdminViewServerProps } from 'payload'
import { Page } from '../ui'
import { Shell } from './Shell'
import { InboxClient } from './InboxClient'

export async function InboxView(props: AdminViewServerProps) {
  return (
    <Shell props={props} roles={['admin', 'sales']}>
      <Page eyebrow="Sales" title="Inbox" intro="Email and live chat in one place.">
        <InboxClient />
      </Page>
    </Shell>
  )
}
