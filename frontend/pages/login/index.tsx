import { PaperProps, Group } from "@mantine/core";

import React from "react";

import AuthForm from "@/components/authform/authform";

export default function Login(props: PaperProps) {
  return (
    <Group mt={50} justify="center">
      <AuthForm></AuthForm>
    </Group>
  );
}
