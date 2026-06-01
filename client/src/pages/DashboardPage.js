import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Skeleton } from 'antd';

import { useDashboardSummary } from '../features/dashboard/dashboardQueries.js';
// Other dashboard sub-features — kept for later use.
// import Hero from '../features/dashboard/Hero/index.js';
// import StatsGrid from '../features/dashboard/StatsGrid/index.js';
// import ActivityFeed from '../features/dashboard/ActivityFeed/index.js';
// import QuickLinks from '../features/dashboard/QuickLinks/index.js';

import styles from './DashboardPage.module.scss';

export default function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();

  const rootRef = useRef(null);
  const greetingRef = useRef(null);
  const nameRef = useRef(null);
  const underlineRef = useRef(null);
  const subtitleRef = useRef(null);

  useEffect(() => {
    if (isLoading) return;

    const ctx = gsap.context(() => {
      gsap.set(
        [greetingRef.current, nameRef.current, subtitleRef.current],
        { opacity: 0, y: 40 },
      );
      gsap.set(underlineRef.current, { scaleX: 0, transformOrigin: 'left' });

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.to(greetingRef.current, { y: 0, opacity: 1, duration: 0.8 })
        .to(
          nameRef.current,
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: 'back.out(1.6)',
          },
          '-=0.45',
        )
        .to(
          underlineRef.current,
          { scaleX: 1, duration: 0.7, ease: 'power3.inOut' },
          '-=0.4',
        )
        .to(
          subtitleRef.current,
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.3',
        );

      gsap.to(`.${styles.glowA}`, {
        x: 30,
        y: -20,
        scale: 1.05,
        duration: 6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to(`.${styles.glowB}`, {
        x: -25,
        y: 25,
        scale: 1.1,
        duration: 7,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
    }, rootRef);

    return () => ctx.revert();
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.welcomeWrap}>
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
      </div>
    );
  }

  const greeting = data?.title || 'Welcome';
  const name = data?.name || 'Patternlab';

  return (
    <div className={styles.page} ref={rootRef}>
      <div className={styles.glowA} />
      <div className={styles.glowB} />

      <div className={styles.welcomeWrap}>
        <h1 className={`${styles.welcome} display-font`}>
          <span className={styles.greeting} ref={greetingRef}>
            {greeting},
          </span>
          <span className={styles.nameLine}>
            <span className={styles.name} ref={nameRef}>
              {name}
            </span>
            <span className={styles.underline} ref={underlineRef} />
          </span>
        </h1>
        {/* <p className={styles.subtitle} ref={subtitleRef}>
          Crafted to feel alive — your Patternlab workspace.
        </p> */}
      </div>

      {/*
        <Hero />
        <StatsGrid />
        <Row gutter={[20, 20]}>
          <Col xs={24} lg={16}><ActivityFeed /></Col>
          <Col xs={24} lg={8}><QuickLinks /></Col>
        </Row>
      */}
    </div>
  );
}
