import Head from 'next/head';
import Canvas from '../components/Canvas';
import styles from '../styles/Home.module.css';

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>Weavr</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Weavr</h1>
                <div className={styles.grid}>
                    <div className={styles.card}>
                        <Canvas />
                    </div>
                </div>
            </main>
        </div>
    );
}
