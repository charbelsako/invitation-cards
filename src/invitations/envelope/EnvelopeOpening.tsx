import { KeyboardEvent, useState } from 'react';
import { Invitation } from '../../types';
import './EnvelopeOpening.css';

type EnvelopeOpeningProps = {
  invitation: Invitation;
};

export function EnvelopeOpening({ invitation }: EnvelopeOpeningProps) {
  const [isOpen, setIsOpen] = useState(false);

  function toggleEnvelope() {
    setIsOpen((current) => !current);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleEnvelope();
    }
  }

  return (
    <section className="envelope-opening" aria-label="Wedding invitation envelope">
      <div className="envelope-opening__scene">
        <div
          className={`envelope-opening__container ${isOpen ? 'envelope-opening__container--open' : ''}  ${!isOpen ? 'overflow-hidden' : ''}`}
          role="button"
          tabIndex={0}
          aria-pressed={isOpen}
          aria-label={isOpen ? 'Close invitation envelope' : 'Open invitation envelope'}
          onClick={toggleEnvelope}
          onKeyDown={handleKeyDown}
        >
          <div className={`envelope-opening__card ${isOpen ? 'z-index-high' : ''}`}>
            <span>Wedding</span>
            <h1>{invitation.coupleNames}</h1>
            <p>
              <br />
              invite you to celebrate
              <br />
              their special day
            </p>
            <small>{invitation.dateLabel}</small>
            {/* <a
              href="#rsvp"
              className="button button--primary"
              onClick={(event) => event.stopPropagation()}
            >
              Respond
            </a> */}
          </div>

          <div className="envelope-opening__envelope" aria-hidden="true">
            <div className="envelope-opening__back" />
            <div className="envelope-opening__left" />
            <div className="envelope-opening__right" />
            <div className="envelope-opening__front" />
            <div className="envelope-opening__flap" />
            <div className="envelope-opening__seal" />
          </div>
        </div>
      </div>
      <p className="envelope-opening__hint">{isOpen ? 'Tap the card again to close' : 'Tap the wax seal to open'}</p>
    </section>
  );
}
