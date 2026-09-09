import { Link } from 'react-router-dom';
import './Privacypolicy.css';

const LAST_UPDATED = 'September 2026';
const SUPPORT_EMAIL = 'support@vivahsetu.com';

export default function PrivacyPolicy() {
  return (
    <div className="page-container legal-page">
      <div className="legal-header">
        <h1>Privacy Policy</h1>
        <p className="home-subtitle">Last updated: {LAST_UPDATED}</p>
      </div>

      <section className="form-section">
        <h2>1. Introduction</h2>
        <p>
          VivahSetu ("we", "us", "our") operates a matrimonial matchmaking platform to help
          individuals and families find a life partner. This Privacy Policy explains what
          personal information we collect when you use our website and app, how we use it,
          who we share it with, and the choices you have about it.
        </p>
        <p>
          By creating an account or using VivahSetu, you agree to the collection and use of
          information as described in this Policy. If you do not agree, please do not use the
          Platform.
        </p>
      </section>

      <section className="form-section">
        <h2>2. Information We Collect</h2>
        <p>We collect the following categories of information:</p>
        <ul className="legal-list">
          <li>
            <strong>Account details</strong> - name, phone number, email address, and password
            when you register.
          </li>
          <li>
            <strong>Profile details</strong> - date of birth, gender, marital status, mother
            tongue, religion, caste, sub-caste, education, occupation, income, city, state,
            country, family details, astro details, lifestyle preferences, and interests that
            you choose to add to your profile.
          </li>
          <li>
            <strong>Photos</strong> - profile photos you upload, which are stored with our
            image hosting provider (Cloudinary).
          </li>
          <li>
            <strong>Partner preferences</strong> - the age, height, income, religion, caste,
            education, location, and other criteria you set to find matches.
          </li>
          <li>
            <strong>Communications</strong> - messages you send through our in-app chat with
            other members, and interest/connect requests you send or receive.
          </li>
          <li>
            <strong>Verification documents</strong> - if you choose to request profile
            verification, any identity or supporting documents you submit for that purpose.
          </li>
          <li>
            <strong>Payment information</strong> - when you purchase a membership plan, payment
            is processed by Razorpay. We do not store your card, UPI, or bank details on our
            servers - we only receive confirmation of a successful or failed transaction.
          </li>
          <li>
            <strong>Usage information</strong> - basic technical information such as device
            type, browser, and how you interact with the Platform, to keep it secure and
            working properly.
          </li>
        </ul>
      </section>

      <section className="form-section">
        <h2>3. How We Use Your Information</h2>
        <ul className="legal-list">
          <li>To create and display your profile to other members.</li>
          <li>To calculate match percentages based on the partner preferences you set.</li>
          <li>To let you send and receive interests, chat, and connect with matches.</li>
          <li>To process membership payments and manage your subscription.</li>
          <li>To review and moderate photos and profile-verification requests.</li>
          <li>To investigate reports of abuse, fake profiles, or misuse of the Platform.</li>
          <li>To send you notifications about interests, messages, and account activity.</li>
          <li>To improve the Platform and fix issues.</li>
        </ul>
        <p>
          We do not sell your personal information to third parties, and we do not use your
          data to show third-party advertising.
        </p>
      </section>

      <section className="form-section">
        <h2>4. What Other Members Can See</h2>
        <p>
          Your profile details (such as age, height, education, and location) are visible to
          other registered members so they can evaluate a potential match. You control the
          visibility of your photos and contact details (phone/email) under
          {' '}
          <strong>Privacy</strong> settings in your profile - you can choose to show these to
          Everyone, Matched members only, or Nobody. Contact details are, in addition, only
          ever shown to members with an active membership plan.
        </p>
      </section>

      <section className="form-section">
        <h2>5. Sharing of Information</h2>
        <p>We share your information only in the following situations:</p>
        <ul className="legal-list">
          <li>With other members, to the extent controlled by your privacy settings above.</li>
          <li>
            With service providers who help us run the Platform - for example, Cloudinary for
            photo storage and Razorpay for payment processing. These providers only receive
            the information needed to perform their specific service.
          </li>
          <li>
            With law enforcement or regulators, if required to comply with a legal obligation,
            court order, or to protect the safety of our members.
          </li>
          <li>
            In connection with a business transfer (such as a merger or acquisition), in which
            case your information may be transferred as part of that transaction.
          </li>
        </ul>
      </section>

      <section className="form-section">
        <h2>6. Data Retention</h2>
        <p>
          We retain your profile and account information for as long as your account is
          active. If you delete your account, we remove your profile from active search and
          matching, and delete or anonymize your personal information within a reasonable
          period, except where we are required to retain certain records for legal or
          regulatory reasons.
        </p>
      </section>

      <section className="form-section">
        <h2>7. Your Choices and Rights</h2>
        <ul className="legal-list">
          <li>You can edit or update your profile and preferences at any time.</li>
          <li>You can control who sees your photos and contact details in Privacy settings.</li>
          <li>You can request a copy of the personal information we hold about you.</li>
          <li>You can request that we correct or delete your personal information.</li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>

      <section className="form-section">
        <h2>8. Data Security</h2>
        <p>
          We use reasonable technical and organizational measures - including encrypted
          password storage and access controls - to protect your personal information.
          However, no method of transmission or storage over the internet is 100% secure, and
          we cannot guarantee absolute security.
        </p>
      </section>

      <section className="form-section">
        <h2>9. Children's Privacy</h2>
        <p>
          VivahSetu is intended for individuals who are of legal marriageable age and, in any
          case, 18 years or older. We do not knowingly collect information from anyone under
          18. If we become aware that we have done so, we will delete that information.
        </p>
      </section>

      <section className="form-section">
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. If we make material changes, we
          will notify you through the Platform or by email. The "Last updated" date at the top
          of this page reflects the most recent revision.
        </p>
      </section>

      <section className="form-section">
        <h2>11. Contact Us</h2>
        <p>
          If you have any questions or concerns about this Privacy Policy or how your
          information is handled, please contact us at{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
      </section>

      <p className="legal-back-link">
        <Link to="/">Back to Home</Link>
      </p>
    </div>
  );
}
