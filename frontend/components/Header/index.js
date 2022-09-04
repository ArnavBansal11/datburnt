import styles from './shared/index.module.scss';
import Image from 'next/image';

import Logo from '../../public/icons/logo.png';
import PrimaryButton from '../Button/Primary';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Header(props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
    }
  }, []);

  return (
    <div className={styles.navbar}>
      <div className={styles.logo}>
        <Image src={Logo} height={50} width={50}/>
        <h1
          style={{ color: `${props.type == 'light' ? '#ffffff' : ''}` }}
          className={styles.logo__name}
        >
          datburnttt
        </h1>
      </div>
      <div className={styles.links}>
        {router.pathname === '/home' ? (
          <>Play</>
        ) : router.pathname === '/' ||
          router.pathname === '/login' ||
          router.pathname === '/register' ? (
          <PrimaryButton
            onClick={() => {
              setLoading(true);
              if (router.pathname === '/register') {
                return setLoading(false);
              }
              router.push('/register');
            }}
            className={styles.start}
            loading={loading}
          >
            Start a fire!
          </PrimaryButton>
        ) : props.code ? (
          <div
            className={styles.code}
            onClick={() => {
              navigator.clipboard.writeText(
                `datburnt.vercel.app/${router.query.code}`
              );
            }}
          >
            datburnt.vercel.app/{router.query.code}
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
