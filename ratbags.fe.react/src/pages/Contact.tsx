import { useState } from 'react'
import type { FormEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faEnvelope,
  faLocationDot,
  faPaperPlane,
  faPhone,
} from '@fortawesome/free-solid-svg-icons'
import './Contact.css'

const CONTACT_DETAILS = [
  {
    icon: faEnvelope,
    label: 'Email',
    value: 'hello@example.com',
  },
  {
    icon: faPhone,
    label: 'Phone',
    value: '+1 (555) 012-3456',
  },
  {
    icon: faLocationDot,
    label: 'Office',
    value: '123 Placeholder St, Sydney NSW',
  },
]

function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="contact">
      <div className="contact-intro">
        <span className="eyebrow">Get in touch</span>
        <h1>
          Let's talk about <span className="accent-text">your project</span>
        </h1>
        <p className="lead">
          This is a placeholder contact page — wire the form up to your API
          or a form service, and swap the details below for the real thing.
        </p>

        <ul className="contact-details">
          {CONTACT_DETAILS.map((detail) => (
            <li key={detail.label}>
              <span className="contact-icon">
                <FontAwesomeIcon icon={detail.icon} />
              </span>
              <div>
                <span className="contact-label">{detail.label}</span>
                <span className="contact-value">{detail.value}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="contact-form-card">
        {submitted ? (
          <div className="contact-success">
            <span className="contact-success-icon">
              <FontAwesomeIcon icon={faCheck} />
            </span>
            <h2>Message sent</h2>
            <p>Thanks for reaching out — this is a placeholder confirmation.</p>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setSubmitted(false)}
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="name">
                Name
                <input id="name" name="name" type="text" placeholder="Jane Doe" required />
              </label>
              <label htmlFor="email">
                Email
                <input id="email" name="email" type="email" placeholder="jane@example.com" required />
              </label>
            </div>
            <label htmlFor="subject">
              Subject
              <input id="subject" name="subject" type="text" placeholder="How can we help?" required />
            </label>
            <label htmlFor="message">
              Message
              <textarea id="message" name="message" rows={5} placeholder="Tell us more..." required />
            </label>
            <button type="submit" className="btn btn-primary">
              Send message
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default Contact
