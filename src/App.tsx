import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ChevronDown,
  Heart,
  LayoutTemplate,
  Palette,
  Sparkles,
  Users
} from 'lucide-react';
import { AdminApp } from './AdminApp';
import { fallbackInvitation } from './demoInvitation';
import { InvitationDemo } from './InvitationDemo';

const signatureIdeas = [
  'Horizontal story panels for mobile-first reveals',
  'Private RSVP capacity and plus-one control',
  'Background music with guest-controlled playback',
  'Email notifications when a guest responds',
  'Template-ready colors, SVG ornaments, and layouts'
];

function App() {
  if (window.location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }

  if (isInvitationRoute()) {
    return <InvitationDemo />;
  }

  return <HomePage />;
}

function HomePage() {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.08]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0.42]);

  return (
    <main>
      <section className="hero">
        <motion.div
          className="hero__image"
          style={{ backgroundImage: `url(${fallbackInvitation.heroImage})`, scale: heroScale, opacity: heroOpacity }}
        />
        <div className="hero__veil" />
        <motion.div
          className="hero__content"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        >
          <span className="eyebrow">
            <Sparkles size={16} />
            Invitation Cards
          </span>
          <h1>Wedding invitations that feel alive.</h1>
          <p>Create premium animated invitations, collect RSVPs, and manage every detail from one private studio.</p>
          {/* <div className="hero__actions">
            <a href="/admin" className="button button--primary">
              Open Admin Studio
            </a>
            <a href="/invite/demo-wedding" className="button button--ghost">
              View Demo Invite
            </a>
          </div> */}
        </motion.div>
        <motion.a
          className="scroll-cue"
          href="#features"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          aria-label="Scroll to features"
        >
          <ChevronDown />
        </motion.a>
      </section>

      <section className="intro section" id="features">
        <motion.div
          className="intro__card"
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.7 }}
        >
          <span className="section-kicker">Platform</span>
          <h2>Build once, launch many invitation designs.</h2>
          <p>
            The front page is the product website. Actual invitations live on their own guest links
            and change layout based on the template selected in the admin studio.
          </p>
          <div className="detail-grid">
            <div>
              <LayoutTemplate />
              <strong>Template-based invites</strong>
              <span>Horizontal, vertical, and envelope layouts.</span>
            </div>
            <div>
              <Palette />
              <strong>Custom styling</strong>
              <span>Colors, imagery, copy, and music per invitation.</span>
            </div>
            <div>
              <Users />
              <strong>RSVP management</strong>
              <span>Guest limits, notes, and email notifications.</span>
            </div>
          </div>
        </motion.div>
      </section>

      <section>
        <p>Horizontal Demo</p>
        <p>Vertical Demo</p>
        <p>Envelope Demo</p>
      </section>

      <section className="story section">
        <div className="section-heading">
          <span className="section-kicker">What you can add</span>
          <h2>A studio for invitations, not a hand-coded page.</h2>
        </div>
        <div className="flex-container flex flex-row flex-wrap" aria-label="Invitation feature highlights">
          {signatureIdeas.map((idea, index) => (
            <motion.article
              className="feature-card"
              key={idea}
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
            >
              <span>0{index + 1}</span>
              <h3>{idea}</h3>
              <p>Designed as a reusable platform feature for future invitation templates.</p>
            </motion.article>
          ))}
        </div>
      </section>

      <footer>
        <Heart size={18} />
        Crafted for a refined wedding invitation experience.
      </footer>
    </main>
  );
}

function isInvitationRoute() {
  const searchSlug = new URLSearchParams(window.location.search).get('id');
  const segments = window.location.pathname.split('/').filter(Boolean);

  if (searchSlug) {
    return true;
  }

  if (segments[0] === 'invite' && segments[1]) {
    return true;
  }

  return segments.length === 1 && !['admin'].includes(segments[0]);
}

export default App;
