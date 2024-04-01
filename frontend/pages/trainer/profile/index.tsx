import React, { useEffect, useState } from "react";
import { Box, Button, Group, TextInput, Text, Container, Title } from "@mantine/core";
import { getSession, useSession } from 'next-auth/react';


export default function Profile() {
    const [ratePerHour, setRatePerHour] = useState<string | null>(null);
    const { data: session, status }: any = useSession();
    const username = session?.user?.username;
    console.log("username: ", username)
    console.log("name: ", session?.user?.name)
    console.log("role: ", session?.user?.role)

    useEffect(() => {
        fetchRatePerHour();
    }, []);

    const fetchRatePerHour = async () => {
        try {
            const response = await fetch(`/api/trainer/get-rateperhour`, {
                method: 'POST', // Use POST for sending data
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: username }), // Include username in request body
              });
            const data = await response.json();
            setRatePerHour(data.rate_per_hour);
        } catch (error) {
            console.error("Error fetching rate per hour:", error);
        }
    };

    return (
        <Container px="1.7rem">
            <Title order={1} style={{ marginBottom: 20 }}>
                Trainer Profile
            </Title>
            <Box style={{ marginBottom: 20 }}>
                <Text size="lg">
                    {ratePerHour === null ? "Loading..." : `Rate Per Hour: $${ratePerHour}`}
                </Text>
            </Box>
        </Container>
    );
}
