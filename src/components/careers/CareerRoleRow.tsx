import { ArrowUpRight, Banknote, CalendarDays, Clock3, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { applicationHref, type CareerRole } from '@/data/careers';

export default function CareerRoleRow({ role, applicationEmail }: { role: CareerRole; applicationEmail: string }) {
  const href = applicationHref(role, applicationEmail);
  const action = <>Apply <ArrowUpRight aria-hidden="true" /></>;

  return <article className="career-role" aria-labelledby={`role-${role.id}`}>
    <div className="career-role__body">
      <h3 id={`role-${role.id}`} className="ui-panel-title">{role.title}</h3>
      <p className="ui-prose career-role__summary">{role.summary}</p>
    </div>
    <div className="career-role__facts">
      <Badge variant="outline" className="career-role__badge"><MapPin aria-hidden="true" />{role.location}</Badge>
      <Badge variant="outline" className="career-role__badge"><Clock3 aria-hidden="true" />{role.employmentType}</Badge>
      {role.duration && <Badge variant="outline" className="career-role__badge"><CalendarDays aria-hidden="true" />{role.duration}</Badge>}
      {role.compensation && <Badge variant="outline" className="career-role__badge"><Banknote aria-hidden="true" />{role.compensation}</Badge>}
    </div>
    {href ? <Button asChild variant="link" className="career-role__apply">
      <a href={href} aria-label={`Apply for ${role.title}`}>{action}</a>
    </Button> : <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="career-role__apply" aria-label={`Apply for ${role.title}`}>{action}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="pr-8">{role.title}</DialogTitle>
          <DialogDescription>{role.summary}</DialogDescription>
        </DialogHeader>
        <p className="ui-prose">Application details for this role will be available here soon. Please check back for updates.</p>
      </DialogContent>
    </Dialog>}
  </article>;
}
