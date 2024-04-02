import React, { useEffect, useState } from "react";
import { Box, Button, Group, TextInput, Text, Container, Title } from "@mantine/core";
import { getSession, useSession } from 'next-auth/react';
import { UserInfoIcons } from "@/components/trainer/UserInfoIcons";


export default function Profile() {
    const { data: session, status }: any = useSession();


    return (
        <Container px="1.7rem">
            <Title order={1} style={{ marginBottom: 20 }}>
                Trainer Profile
            </Title>
            <Box style={{ marginBottom: 20 }}>
                <UserInfoIcons></UserInfoIcons>
            </Box>
        </Container>
    );
}