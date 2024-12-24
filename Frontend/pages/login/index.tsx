import { Center, Group, Loader, PaperProps } from '@mantine/core'

import AuthForm from '@/components/authform/authform'

import { useRouter } from 'next/router'

import { useSession } from 'next-auth/react'

export default function Login(props: PaperProps) {
    const { data: session, status } = useSession()
    const router = useRouter()

    if (status === 'loading') {
        return (
            <Center>
                <Loader size="xl" />
            </Center>
        )
    }

    if (session?.user && status === 'authenticated') {
        router.push('/')
    }

    return (
        <Group mt={50} justify="center">
            <AuthForm></AuthForm>
        </Group>
    )
}
