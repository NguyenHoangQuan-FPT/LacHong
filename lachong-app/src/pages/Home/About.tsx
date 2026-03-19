import "../../assets/styles/About.css";
import { useTranslation } from "react-i18next";

export default function About() {
    const { t } = useTranslation();

    return (
        <section className="about-page">
            <div className="about-container">

                <div className="about-hero">
                    <div>
                        <h1 className="about-title">{t('aboutPage.title')}</h1>

                        <p className="about-text">
                            {t('aboutPage.hero.p1')}
                        </p>

                        <p className="about-text">
                            {t('aboutPage.hero.p2')}
                        </p>

                        <p className="about-text">{t('aboutPage.hero.p3Intro')}</p>

                        <ul className="about-list">
                            <li>{t('aboutPage.community.bullet1')}</li>
                            <li>{t('aboutPage.community.bullet2')}</li>
                            <li>{t('aboutPage.community.bullet3')}</li>
                            <li>{t('aboutPage.community.bullet4')}</li>
                        </ul>

                        <p className="about-text">
                            {t('aboutPage.closing')}
                        </p>
                    </div>

                    <div className="about-media">
                        <img
                            className="about-media__img"
                            src="/images/Banner/Login.jpg"
                            alt={t('aboutPage.mediaAlt')}
                            loading="lazy"
                        />
                    </div>
                </div>

                <div className="about-sections">
                    <section className="about-section" aria-label={t('aboutPage.sections.mission.aria')}>
                        <h2 className="about-section-title">{t('aboutPage.sections.mission.title')}</h2>
                        <p className="about-section-text">
                            {t('aboutPage.sections.mission.p1')}
                        </p>
                        <p className="about-section-text">
                            {t('aboutPage.sections.mission.p2')}
                        </p>
                    </section>

                    <section className="about-section" aria-label={t('aboutPage.sections.vision.aria')}>
                        <h2 className="about-section-title">{t('aboutPage.sections.vision.title')}</h2>
                        <p className="about-section-text">
                            {t('aboutPage.sections.vision.p1')}
                        </p>
                        <p className="about-section-text">
                            {t('aboutPage.sections.vision.p2')}
                        </p>
                    </section>

                    <section className="about-section" aria-label={t('aboutPage.sections.policy.aria')}>
                        <h2 className="about-section-title">{t('aboutPage.sections.policy.title')}</h2>

                        <ol className="about-policy">
                            <li className="about-policy-item">
                                <h3 className="about-policy-title">{t('aboutPage.sections.policy.join.title')}</h3>
                                <p className="about-section-text">
                                    {t('aboutPage.sections.policy.join.p1')}
                                </p>
                                <p className="about-section-text">
                                    {t('aboutPage.sections.policy.join.p2')}
                                </p>
                                <p className="about-section-text">
                                    {t('aboutPage.sections.policy.join.p3')}
                                </p>
                            </li>

                            <li className="about-policy-item">
                                <h3 className="about-policy-title">{t('aboutPage.sections.policy.product.title')}</h3>
                                <ul className="about-policy-list">
                                    <li>
                                        {t('aboutPage.sections.policy.product.bullet1')}
                                    </li>
                                    <li>
                                        {t('aboutPage.sections.policy.product.bullet2')}
                                    </li>
                                    <li>
                                        {t('aboutPage.sections.policy.product.bullet3')}
                                    </li>
                                    <li>
                                        {t('aboutPage.sections.policy.product.bullet4')}
                                    </li>
                                </ul>
                            </li>
                        </ol>
                    </section>
                </div>
            </div>
        </section>
    );
}
