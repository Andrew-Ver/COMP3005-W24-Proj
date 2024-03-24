import Header from './header/header';

export default function Layout({ children }: any) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}