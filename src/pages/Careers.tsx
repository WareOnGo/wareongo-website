import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageHead from '@/components/PageHead';
import CareerRoleRow from '@/components/careers/CareerRoleRow';
import CareersInterestSection from '@/components/careers/CareersInterestSection';
import { Button } from '@/components/ui/button';
import { careers, displayCareers, type CareersContent } from '@/data/careers';
import '@/styles/careers.css';

export default function Careers({ content = careers }: { content?: CareersContent }) {
  const [department, setDepartment] = useState<string | null>(null);
  const page = displayCareers(content);
  const cultureDescription = page.cultureDescription.replace(/\s+(\S+)\s*$/, '\u00a0$1');
  const departments = [...new Set(page.roles.map(role => role.department))];
  const selected = department && departments.includes(department) ? department : null;
  const roles = selected ? page.roles.filter(role => role.department === selected) : page.roles;

  return <div className="careers-page min-h-screen flex flex-col">
    <PageHead title={page.seoTitle} description={page.description} path="/careers" />
    <Navbar />
    <main className="flex-grow" aria-labelledby="careers-title">
      <div className="section-container page-content careers-content">
        <header className="careers-intro">
          <h1 id="careers-title" className="ui-page-title">{page.title}</h1>
          <p className="ui-prose careers-intro__copy">{page.intro}</p>
        </header>

        <section aria-labelledby="careers-roles-title" className="careers-openings">
          <h2 id="careers-roles-title" className="sr-only">Open Positions</h2>
          {departments.length > 0 && <div role="group" aria-label="Filter roles by department" className="careers-filters">
            {[null, ...departments].map(value => <Button key={value ?? 'all'} type="button" size="sm"
              variant={selected === value ? 'default' : 'outline'} className="careers-filter"
              aria-pressed={selected === value} aria-controls="careers-roles" onClick={() => setDepartment(value)}>
              {value ?? 'View all'}
            </Button>)}
          </div>}
          <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
            {roles.length} {roles.length === 1 ? 'open position' : 'open positions'}{selected ? ` in ${selected}` : ''}
          </p>
          <div id="careers-roles">
            {roles.length > 0 ? <ul className="careers-roles">
              {roles.map(role => <li key={role.id}><CareerRoleRow role={role} applicationEmail={page.applicationEmail} /></li>)}
            </ul> : <div className="careers-empty ui-card">
              <h3 className="ui-panel-title">Our Next Chapter Could Include You</h3>
              <p className="ui-prose">There are no open positions right now. Check back for new opportunities to join the team.</p>
              <Button asChild variant="outline"><Link to="/about-us">Get to know WareOnGo <ArrowRight aria-hidden="true" /></Link></Button>
            </div>}
          </div>
        </section>

        <div className="careers-bottom">
          <section className="careers-culture" aria-labelledby="careers-culture-title">
            <h2 id="careers-culture-title" className="ui-section-title">{page.cultureTitle}</h2>
            <p className="ui-prose">{cultureDescription}</p>
            <Button asChild variant="link" size="sm" className="careers-culture__link"><Link to="/about-us">Get to know us <ArrowRight aria-hidden="true" /></Link></Button>
          </section>
          <CareersInterestSection content={page} />
        </div>
      </div>
    </main>
    <Footer />
  </div>;
}
