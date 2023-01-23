import Link from 'next/link'
import Layout from '../components/layout'

export default function Home() {
  return (
    <Layout>
      Hello World. <Link href="/about">About</Link>
    </Layout>
  )
}
