import Header from '@/components/header/header'

export default function Layout({ children }: any) {
    return (
        <>
            <Header />
            <main>{children}</main>
        </>
    )
}
