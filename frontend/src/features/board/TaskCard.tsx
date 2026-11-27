import { memo } from 'react'
import { ListChecks, MessageSquare, CircleCheck } from 'lucide-react'
import { PRIORITIES, type Day, type Member, type Task } from '@/api/types'
import { Avatar, DoneMark, I, PrioGlyph, Rail, inkStyle } from '@/components/ui/glyphs'
import { diffDays, dueText, shortDate } from '@/lib/dates'

export interface CardFlags {
  selected: boolean
  lit: boolean
  dragging: boolean
  isNew: boolean
  justDone: boolean
  remoteBy: Member | null
}

export const TaskCard = memo(function TaskCard({
  t,
  owner,
  today,
  flags,
}: {
  t: Task
  owner: Member | undefined
  today: Day
  flags: CardFlags
}) {
  const done = t.status === 'done'
  const over = !done && diffDays(t.due, today) < 0
  const nDone = t.checklist.filter((c) => c.done).length
  const nComments = t.activity.filter((a) => a.comment).length
  const allDone = t.checklist.length > 0 && nDone === t.checklist.length
  const label = `${t.code}: ${t.title}. ${owner?.name ?? 'Unassigned'}. ${PRIORITIES[t.priority]} priority. ${done ? 'Done' : `Due ${dueText(t.due, today, done)}`}.`
  const cls = [
    'card',
    done && 'done',
    flags.selected && 'sel',
    flags.lit && 'lit',
    flags.dragging && 'dragging',
    flags.isNew && 'new',
    flags.justDone && 'just-done',
    flags.remoteBy && 'remote',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <article
      className={cls}
      tabIndex={0}
      data-code={t.code}
      style={{ ...inkStyle(owner?.ink), ...(flags.remoteBy ? inkStyle(flags.remoteBy.ink, '--rink') : {}) }}
      aria-label={label}
      aria-current={flags.selected ? 'true' : undefined}
    >
      <span className="flag" aria-hidden="true" />
      {flags.remoteBy && (
        <span className="remote-tag" aria-hidden="true">
          {flags.remoteBy.name.split(' ')[0]}
        </span>
      )}
      <div className="card-top">
        <span className="code">{t.code}</span>
        {!done && <PrioGlyph p={t.priority} />}
      </div>
      <h3 className="card-title">{t.title}</h3>
      {!done && (
        <>
          {t.tags.length > 0 && (
            <div className="tags">
              {t.tags.map((g) => (
                <span key={g} className="tag">
                  {g}
                </span>
              ))}
            </div>
          )}
          <span title={`${shortDate(t.start)} → ${shortDate(t.due)}. The dark tick is today.`} style={{ display: 'block' }}>
            <Rail start={t.start} due={t.due} today={today} over={over} />
          </span>
        </>
      )}
      <div className="foot">
        {done ? (
          <DoneMark>Done {shortDate(t.due)}</DoneMark>
        ) : (
          <span className={`due${over ? ' over' : ''}`}>{dueText(t.due, today, done)}</span>
        )}
        {!done && t.checklist.length > 0 && (
          <span className={`meta${allDone ? ' complete' : ''}`} title={allDone ? 'Checklist complete' : 'Checklist'}>
            <I icon={allDone ? CircleCheck : ListChecks} />
            {nDone}/{t.checklist.length}
          </span>
        )}
        {!done && nComments > 0 && (
          <span className="meta" title="Comments">
            <I icon={MessageSquare} />
            {nComments}
          </span>
        )}
        {owner && <Avatar ink={owner.ink} initials={owner.initials} title={owner.name} />}
      </div>
    </article>
  )
})
