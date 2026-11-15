import type { AdminViewServerProps } from 'payload'
import { Page } from '../ui'
import { Shell } from './Shell'
import { InboxClient } from './InboxClient'

export async function InboxView(props: AdminViewServerProps) {
  return (
    <Shell props={props} roles={['admin', 'sales']}>
      <Page eyebrow="Sales" title="Inbox" intro="Every email, WhatsApp chat and phone call with guests, in one place. Automatic emails (quotes, receipts, reminders) are saved here too.">
        <InboxClient />
      </Page>
    </Shell>
  )
}
